import client from 'prom-client';

client.collectDefaultMetrics();

export const ingestionCounter = new client.Counter({
  name: 'civic_ingestions_total',
  help: 'Total records ingested',
  labelNames: ['source', 'status']
});

export const anomalyGauge = new client.Gauge({
  name: 'civic_anomaly_rate',
  help: 'Current anomaly detection rate'
});

export const refresh_attempts_total = new client.Counter({ name: 'refresh_attempts_total', help: 'Refresh token attempts' });
export const refresh_failures_total = new client.Counter({ name: 'refresh_failures_total', help: 'Refresh token failures' });
export const refresh_revocations_total = new client.Counter({ name: 'refresh_revocations_total', help: 'Refresh token revocations' });
export const outbox_failures_total = new client.Counter({ name: 'outbox_failures_total', help: 'Outbox emission failures' });

export default client;
