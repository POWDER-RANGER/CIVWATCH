#!/usr/bin/env node
// Probe every URL in site/data/endpoints.json and record what it actually returns.
// Writes site/data/status.json (endpoints) and site/data/repos.json (GitHub metadata).
//
// Rules (from the owner's URL inventory):
//   - A listed route is a claim, not proof. Record the observed HTTP status, final URL,
//     content type, latency and time checked.
//   - 404/405/401/503 are recorded as such, never assumed functional.
//   - GET only. Routes that need POST bodies or real IDs are recorded as observed or skipped.
//   - Fragments (#...) are never sent to servers; probe the base, link the full URL.
//
// Usage: node scripts/site/probe.mjs [--out site/data] [--no-repos]
// Env:   GITHUB_TOKEN (optional, raises GitHub API rate limit)

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const outDir = resolve(root, args.includes("--out") ? args[args.indexOf("--out") + 1] : "site/data");
const skipRepos = args.includes("--no-repos");

const UA = "civwatch-site-probe/2.0 (+https://github.com/POWDER-RANGER/CIVWATCH)";
const WARM_TIMEOUT_MS = 90_000; // Render free tier cold start is ~30 s
const PROBE_TIMEOUT_MS = 45_000;
const HINT_KEYS = ["status", "state", "ok", "service", "version", "error", "message"];

const inventory = JSON.parse(await readFile(resolve(outDir, "endpoints.json"), "utf8"));
const systems = Object.fromEntries(inventory.systems.map((s) => [s.id, s]));

async function get(url, timeoutMs) {
  const started = performance.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": UA, accept: "application/json, text/html;q=0.9, */*;q=0.5" },
    });
    const type = (res.headers.get("content-type") || "").split(";")[0].trim() || null;
    const text = await res.text();
    return {
      http_status: res.status,
      final_url: res.url,
      content_type: type,
      bytes: Buffer.byteLength(text),
      ms: Math.round(performance.now() - started),
      text,
    };
  } catch (err) {
    return {
      http_status: null,
      final_url: null,
      content_type: null,
      bytes: 0,
      ms: Math.round(performance.now() - started),
      error: err.name === "AbortError" ? `timeout after ${timeoutMs} ms` : String(err.cause?.code || err.message),
    };
  } finally {
    clearTimeout(timer);
  }
}

// Outcomes:
//   ok           2xx (HTML for pages, JSON for APIs)
//   needs-input  400 with a JSON validation message: the endpoint is up and asks for parameters
//   unconfigured 503 reporting state "unconfigured": deployed, missing a server-side key
//   restricted   401/403: deployed, requires authorization
//   not-found    404, method 405, rate-limited 429, client-error other 4xx, server-error 5xx
//   non-json     API path answered 2xx with HTML (app shell, not an API response)
//   unreachable  timeout / DNS / connection failure
//   not-probed   pattern route or POST-only endpoint
function classify(kind, r, hint) {
  if (r.http_status == null) return "unreachable";
  const s = r.http_status;
  if (s >= 200 && s < 300) {
    if (kind === "api" && r.content_type && !/json/.test(r.content_type)) return "non-json";
    return "ok";
  }
  if (s === 400 && hint && (hint.state === "invalid" || hint.message || hint.error)) return "needs-input";
  if (s === 503 && hint && hint.state === "unconfigured") return "unconfigured";
  if (s === 401 || s === 403) return "restricted";
  if (s === 404) return "not-found";
  if (s === 405) return "method";
  if (s === 429) return "rate-limited";
  if (s >= 400 && s < 500) return "client-error";
  return "server-error";
}

// A short, whitelisted summary of a JSON body. Never stores the full payload.
function bodyHint(r) {
  if (!r.text || !/json/.test(r.content_type || "")) return null;
  try {
    const body = JSON.parse(r.text);
    if (Array.isArray(body)) return { items: body.length };
    if (!body || typeof body !== "object") return null;
    const hint = {};
    for (const k of HINT_KEYS) {
      const v = body[k];
      if (v == null) continue;
      if (typeof v === "string") hint[k] = v.slice(0, 120);
      else if (typeof v === "number" || typeof v === "boolean") hint[k] = v;
    }
    return Object.keys(hint).length ? hint : { keys: Object.keys(body).slice(0, 8) };
  } catch {
    return null;
  }
}

// 1. Wake each host once so cold starts don't masquerade as failures.
const warm = {};
for (const sys of inventory.systems.filter((s) => s.base)) {
  const r = await get(sys.base + "/", WARM_TIMEOUT_MS);
  warm[sys.id] = { http_status: r.http_status, ms: r.ms, error: r.error || null };
  console.log(`warm  ${sys.id.padEnd(10)} ${String(r.http_status ?? "ERR").padEnd(4)} ${r.ms} ms`);
}

// 2. Probe every endpoint, sequentially per run to stay gentle on free-tier hosts.
const results = [];
for (const ep of inventory.endpoints) {
  const sys = systems[ep.system];
  const url = sys.base + ep.path;
  const base = { id: ep.id, system: ep.system, kind: ep.kind, path: ep.path, label: ep.label, url };
  if (ep.kind === "pattern" || (ep.method && ep.method !== "GET")) {
    const note = ep.note || (ep.kind === "pattern" ? "Pattern route." : `${ep.method} endpoint; a GET probe would only reach the app shell.`);
    results.push({ ...base, method: ep.method || "GET", outcome: "not-probed", note });
    console.log(`skip  ${ep.id}`);
    continue;
  }
  const r = await get(url, PROBE_TIMEOUT_MS);
  const hint = bodyHint(r);
  const outcome = classify(ep.kind, r, hint);
  results.push({
    ...base,
    method: "GET",
    http_status: r.http_status,
    final_url: r.final_url && r.final_url !== url ? r.final_url : null,
    content_type: r.content_type,
    bytes: r.bytes,
    ms: r.ms,
    outcome,
    hint,
    error: r.error || null,
  });
  console.log(`probe ${ep.id.padEnd(28)} ${String(r.http_status ?? "ERR").padEnd(4)} ${outcome.padEnd(12)} ${r.ms} ms`);
}

const tally = results.reduce((acc, r) => ((acc[r.outcome] = (acc[r.outcome] || 0) + 1), acc), {});
const status = {
  checked_at: new Date().toISOString(),
  checked_by: process.env.GITHUB_ACTIONS ? `GitHub Actions run ${process.env.GITHUB_RUN_ID}` : "local run",
  method: "GET, follow redirects, 45 s timeout, hosts warmed first (90 s)",
  inventory: inventory.inventory,
  warm,
  tally,
  results,
};
await writeFile(resolve(outDir, "status.json"), JSON.stringify(status, null, 2) + "\n");
console.log("tally", tally);

// 3. Repository metadata.
if (!skipRepos) {
  const headers = { "user-agent": UA, accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const repos = [];
  for (const sys of inventory.systems.filter((s) => s.repo)) {
    try {
      const api = `https://api.github.com/repos/${sys.repo}`;
      let res = await fetch(api, { headers });
      if (res.status === 401 && headers.authorization) {
        delete headers.authorization; // bad token: fall back to anonymous for the rest of the run
        res = await fetch(api, { headers });
      }
      if (!res.ok) {
        repos.push({ system: sys.id, repo: sys.repo, http_status: res.status });
        continue;
      }
      const d = await res.json();
      repos.push({
        system: sys.id,
        repo: d.full_name,
        url: d.html_url,
        description: d.description,
        license: d.license?.spdx_id || null,
        language: d.language,
        stars: d.stargazers_count,
        open_issues: d.open_issues_count,
        archived: d.archived,
        pushed_at: d.pushed_at,
        created_at: d.created_at,
        visibility: d.visibility,
      });
    } catch (err) {
      repos.push({ system: sys.id, repo: sys.repo, error: String(err.message) });
    }
  }
  await writeFile(
    resolve(outDir, "repos.json"),
    JSON.stringify({ checked_at: new Date().toISOString(), repos }, null, 2) + "\n",
  );
  console.log(`repos ${repos.length} recorded`);
}
