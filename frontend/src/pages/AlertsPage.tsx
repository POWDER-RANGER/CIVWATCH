import React, { useEffect, useState, FormEvent } from 'react';
import { toast } from 'react-toastify';
import { alertsApi } from '../api/client';

interface Rule {
  id: string; name: string; metric: string;
  operator: string; threshold: number; active: boolean; created_at: string;
}
interface Alert {
  id: string; rule_name: string; value: number; triggered_at: string;
}

export function AlertsPage() {
  const [rules, setRules]   = useState<Rule[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName]           = useState('');
  const [threshold, setThreshold] = useState('0');
  const [operator, setOperator]   = useState('lt');
  const [saving, setSaving]       = useState(false);

  function refresh() {
    setLoading(true);
    Promise.all([alertsApi.list(), alertsApi.recent()])
      .then(([r, a]) => { setRules(r.data.rules); setAlerts(a.data.alerts); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await alertsApi.create({ name, metric: 'avg_sentiment', operator, threshold: parseFloat(threshold) });
      toast.success('Alert rule created');
      setName(''); setThreshold('0'); setShowForm(false);
      refresh();
    } finally { setSaving(false); }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Alert Rules</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Rule'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>New Alert Rule</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Rule Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Low Sentiment Warning" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Operator</label>
                <select value={operator} onChange={(e) => setOperator(e.target.value)}>
                  <option value="lt">Less than (&lt;)</option>
                  <option value="gt">Greater than (&gt;)</option>
                  <option value="lte">≤</option>
                  <option value="gte">≥</option>
                </select>
              </div>
              <div className="form-group">
                <label>Threshold (avg sentiment -1 to 1)</label>
                <input type="number" step="0.01" min="-1" max="1"
                  value={threshold} onChange={(e) => setThreshold(e.target.value)} required />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Rule'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Active Rules</h3>
        {loading ? <div className="spinner" /> : rules.length ? (
          <table>
            <thead><tr><th>Name</th><th>Condition</th><th>Created</th></tr></thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td style={{ color: 'var(--muted)' }}>
                    avg_sentiment {r.operator} {r.threshold}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '.8rem' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state"><p>No alert rules configured.</p></div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Recent Triggered Alerts</h3>
        {loading ? <div className="spinner" /> : alerts.length ? (
          <table>
            <thead><tr><th>Rule</th><th>Value</th><th>Triggered</th></tr></thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id}>
                  <td>{a.rule_name}</td>
                  <td><span className="badge badge-negative">{a.value.toFixed(4)}</span></td>
                  <td style={{ color: 'var(--muted)', fontSize: '.8rem' }}>
                    {new Date(a.triggered_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state"><p>No alerts triggered yet.</p></div>
        )}
      </div>
    </div>
  );
}
