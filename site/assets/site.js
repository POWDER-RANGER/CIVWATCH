// CIVWATCH public site: theme toggle, live receipt on the home page, status page renderer.
// No dependencies. Every string that comes from probe data is escaped before insertion.

(() => {
  "use strict";

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Theme ----------
  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  function paintToggle() {
    if (!toggle) return;
    const dark = root.dataset.theme === "ops";
    toggle.textContent = dark ? "Light" : "Dark";
    toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.dataset.theme === "ops" ? "editorial" : "ops";
      root.dataset.theme = next;
      store.set("cw-theme", next);
      paintToggle();
    });
    paintToggle();
  }

  // ---------- Time ----------
  function ago(iso) {
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return "at an unknown time";
    const s = Math.round((Date.now() - t) / 1000);
    if (s < 90) return "just now";
    const m = Math.round(s / 60);
    if (m < 90) return `${m} minutes ago`;
    const h = Math.round(m / 60);
    if (h < 36) return `${h} hours ago`;
    const d = Math.round(h / 24);
    return `${d} days ago`;
  }
  const stamp = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  async function getJSON(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    return res.json();
  }

  // ---------- Outcomes ----------
  const OUTCOME = {
    "ok":           { label: "Responding", cls: "out-ok", group: "ok" },
    "needs-input":  { label: "Up, asks for input", cls: "out-input", group: "input" },
    "restricted":   { label: "Up, needs authorization", cls: "out-input", group: "input" },
    "method":       { label: "Wrong method", cls: "out-input", group: "input" },
    "unconfigured": { label: "Up, key not set", cls: "out-config", group: "config" },
    "rate-limited": { label: "Rate limited", cls: "out-config", group: "config" },
    "not-found":    { label: "Not found", cls: "out-fail", group: "fail" },
    "client-error": { label: "Client error", cls: "out-fail", group: "fail" },
    "server-error": { label: "Server error", cls: "out-fail", group: "fail" },
    "non-json":     { label: "HTML, not JSON", cls: "out-fail", group: "fail" },
    "unreachable":  { label: "Unreachable", cls: "out-fail", group: "fail" },
    "not-probed":   { label: "Not probed", cls: "out-skip", group: "skip" },
  };
  const GROUPS = [
    ["ok", "responding normally"],
    ["input", "up and asking for input or authorization"],
    ["config", "up but missing configuration"],
    ["fail", "failing"],
    ["skip", "not probed"],
  ];
  const DECLARED = {
    "live": ["Live", "tag-live"],
    "available": ["Available", "tag-available"],
    "in-progress": ["In progress", "tag-progress"],
    "planned": ["Planned", "tag-planned"],
    "reference": ["Reference", "tag-reference"],
  };
  const outcomeOf = (r) => OUTCOME[r.outcome] || { label: r.outcome, cls: "out-skip", group: "skip" };
  const tag = (label, cls) => `<span class="tag ${cls}">${esc(label)}</span>`;

  function noteFor(r) {
    if (r.outcome === "not-probed") return r.note || "";
    if (r.error) return r.error;
    const h = r.hint || {};
    if (h.message || h.error) return h.message || h.error;
    if (r.outcome === "restricted") return "Requires authorization.";
    if (r.outcome === "not-found") return "Listed in the inventory; the server returned 404.";
    if (h.status || h.version) return [h.service, h.status, h.version && `v${h.version}`].filter(Boolean).join(", ");
    if (h.state) return `state: ${h.state}`;
    if (r.final_url) return `Redirected to ${r.final_url}`;
    return "";
  }

  // ---------- Home receipt ----------
  const receipt = document.querySelector("[data-receipt]");
  if (receipt) {
    getJSON("data/status.json").then((s) => {
      const health = s.results.find((r) => r.id === "api-health");
      const probed = s.results.filter((r) => r.outcome !== "not-probed");
      const ok = probed.filter((r) => r.outcome === "ok").length;
      const up = probed.filter((r) => ["ok", "input"].includes(outcomeOf(r).group)).length;
      const lead = health && health.http_status
        ? `CIVINTELLIGENCE answered <strong>HTTP <span class="cw-num">${esc(health.http_status)}</span></strong> in <span class="cw-num">${esc(health.ms)}</span>&nbsp;ms`
        : `CIVINTELLIGENCE <strong>did not answer</strong> its health check`;
      receipt.innerHTML =
        `${lead} when last checked, <time datetime="${esc(s.checked_at)}" title="${esc(stamp(s.checked_at))}">${esc(ago(s.checked_at))}</time>. ` +
        `<span class="cw-num">${ok}</span> of <span class="cw-num">${probed.length}</span> inventoried URLs responded normally and <span class="cw-num">${up - ok}</span> more were up but asked for input or authorization. ` +
        `<a href="status.html">See every result</a>.`;
    }).catch(() => { /* keep the static fallback text */ });
  }

  // ---------- Status page ----------
  const board = document.querySelector("[data-status-board]");
  if (board) renderStatus(board);

  async function renderStatus(el) {
    let inv, status, repos = null;
    try {
      [inv, status] = await Promise.all([getJSON("data/endpoints.json"), getJSON("data/status.json")]);
    } catch (err) {
      el.innerHTML = `<p class="empty">The status file could not be loaded (${esc(err.message)}). The deploy job writes it on every publish; reload in a minute, or open <a href="https://github.com/POWDER-RANGER/CIVWATCH/actions">the latest deploy run</a>.</p>`;
      return;
    }
    try { repos = await getJSON("data/repos.json"); } catch { /* optional */ }

    const results = status.results;
    const counts = Object.fromEntries(GROUPS.map(([g]) => [g, 0]));
    for (const r of results) counts[outcomeOf(r).group] += 1;
    const total = results.length;

    const when = document.querySelector("[data-checked]");
    if (when) {
      when.innerHTML = `Checked <time datetime="${esc(status.checked_at)}">${esc(ago(status.checked_at))}</time> (${esc(stamp(status.checked_at))}) by ${esc(status.checked_by)}. Method: ${esc(status.method)}.`;
    }

    const bar = GROUPS.filter(([g]) => counts[g]).map(([g]) => `<span class="${g}" style="flex:${counts[g]}"></span>`).join("");
    const legend = GROUPS.filter(([g]) => counts[g]).map(([g, label]) => `<li><span class="cw-num">${counts[g]}</span>${esc(label)}</li>`).join("");

    const repoBy = {};
    for (const r of repos?.repos || []) repoBy[r.system] = r;

    const sections = inv.systems.map((sys) => {
      const rows = results.filter((r) => r.system === sys.id);
      const [dLabel, dCls] = DECLARED[sys.declared] || [sys.declared, "tag-planned"];
      const repo = repoBy[sys.id];
      const meta = [];
      if (sys.base) meta.push(`Host <a href="${esc(sys.link || sys.base)}">${esc(sys.base.replace("https://", ""))}</a>`);
      else meta.push("No public host");
      if (sys.repo) {
        let r = `Repository <a href="https://github.com/${esc(sys.repo)}">${esc(sys.repo)}</a>`;
        if (repo?.pushed_at) r += `, last push <time datetime="${esc(repo.pushed_at)}">${esc(ago(repo.pushed_at))}</time>`;
        if (repo?.license && repo.license !== "NOASSERTION") r += `, ${esc(repo.license)}`;
        if (repo?.archived) r += ", archived";
        meta.push(r);
      }
      if (sys.upstream) meta.push(`Upstream <a href="${esc(sys.upstream)}">${esc(sys.upstream.replace("https://github.com/", ""))}</a>`);
      const warm = status.warm?.[sys.id];
      if (warm && warm.ms > 5000) meta.push(`Woke from sleep in ${esc(Math.round(warm.ms / 1000))} s`);

      const table = rows.length ? `
        <table class="probes">
          <colgroup><col class="w-route"><col class="w-out"><col class="w-http"><col class="w-ms"><col></colgroup>
          <thead><tr><th scope="col">Route</th><th scope="col">Observed</th><th scope="col" class="num">HTTP</th><th scope="col" class="num">Time</th><th scope="col">Detail</th></tr></thead>
          <tbody>${rows.map((r) => {
            const o = outcomeOf(r);
            const route = r.outcome === "not-probed" ? esc(r.path) : `<a href="${esc(r.url)}">${esc(r.path)}</a>`;
            return `<tr data-group="${o.group}">
              <td class="c-route route">${route}<span class="label">${esc(r.label)}${r.method && r.method !== "GET" ? `, ${esc(r.method)}` : ""}</span></td>
              <td class="c-outcome">${tag(o.label, o.cls)}</td>
              <td class="c-http num cw-num">${r.http_status ?? "–"}</td>
              <td class="c-ms num cw-num">${r.ms != null ? `${esc(r.ms)} ms` : "–"}</td>
              <td class="c-note note">${esc(noteFor(r))}</td>
            </tr>`;
          }).join("")}</tbody>
        </table>` : "";

      const allOk = rows.length > 0 && rows.every((r) => outcomeOf(r).group === "ok");
      return `<section class="system${allOk ? " all-ok" : ""}" id="${esc(sys.id)}" aria-labelledby="h-${esc(sys.id)}">
        <div class="system-head"><h2 id="h-${esc(sys.id)}">${esc(sys.name)}</h2>${tag(dLabel, dCls)}</div>
        <p class="system-meta">${esc(sys.role)}<br>${meta.join(". ")}.</p>
        ${table}
      </section>`;
    }).join("");

    el.innerHTML = `
      <div class="summary">
        <p><span class="cw-num">${total}</span> inventoried URLs across <span class="cw-num">${inv.systems.filter((s) => s.base).length}</span> hosts.</p>
        <button class="control" type="button" data-filter aria-pressed="false">Show only issues</button>
      </div>
      <div class="tally" role="img" aria-label="${GROUPS.filter(([g]) => counts[g]).map(([g, l]) => `${counts[g]} ${l}`).join(", ")}">${bar}</div>
      <ul class="tally-legend">${legend}</ul>
      ${sections}`;

    const filter = el.querySelector("[data-filter]");
    filter.addEventListener("click", () => {
      const on = filter.getAttribute("aria-pressed") !== "true";
      filter.setAttribute("aria-pressed", String(on));
      if (on) el.setAttribute("data-only-issues", ""); else el.removeAttribute("data-only-issues");
    });
  }
})();
