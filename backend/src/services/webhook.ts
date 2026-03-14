/**
 * Outbound webhook sender with HMAC-SHA256 signature.
 * Receiving services should verify X-CivWatch-Signature.
 */
import crypto from 'crypto';
import https from 'https';
import http from 'http';
import { env } from '../config/env';

interface WebhookPayload {
  event: string;
  [key: string]: any;
}

export async function fireWebhook(payload: WebhookPayload): Promise<void> {
  const webhookUrl = (process.env.WEBHOOK_URL ?? '').trim();
  if (!webhookUrl) return; // Silently skip if not configured

  const body      = JSON.stringify(payload);
  const secret    = process.env.WEBHOOK_SECRET ?? '';
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  const url       = new URL(webhookUrl);
  const isHttps   = url.protocol === 'https:';
  const transport = isHttps ? https : http;

  const options = {
    hostname: url.hostname,
    port:     url.port || (isHttps ? 443 : 80),
    path:     url.pathname + url.search,
    method:   'POST',
    headers: {
      'Content-Type':         'application/json',
      'Content-Length':       Buffer.byteLength(body),
      'X-CivWatch-Signature': `sha256=${signature}`,
      'X-CivWatch-Event':     payload.event,
      'User-Agent':           'CIVWATCH/0.1.0',
    },
  };

  return new Promise((resolve, reject) => {
    const req = transport.request(options, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`Webhook responded with HTTP ${res.statusCode}`));
      } else {
        resolve();
      }
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(new Error('Webhook timeout')); });
    req.write(body);
    req.end();
  });
}
