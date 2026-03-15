import React, { useEffect, useState, FormEvent } from 'react';
import { toast } from 'react-toastify';
import { sourcesApi } from '../api/client';

interface Source {
  id: string; name: string; type: string;
  url: string | null; active: boolean; created_at: string;
}

export function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName]   = useState('');
  const [url, setUrl]     = useState('');
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    sourcesApi.list()
      .then((r) => setSources(r.data.sources))
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await sourcesApi.create({ name, type: 'rss', url });
      toast.success('Source added');
      setName(''); setUrl(''); setShowForm(false);
      refresh();
    } finally { setSaving(false); }
  }

  async function handleRun(id: string) {
    setRunning(id);
    try {
      await sourcesApi.run(id);
      toast.success('Ingestion triggered');
    } finally { setRunning(null); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this source?')) return;
    await sourcesApi.remove(id);
    toast.success('Source deleted');
    refresh();
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Sources</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add RSS Source'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>New RSS Source</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Reuters Politics" required />
            </div>
            <div className="form-group">
              <label>RSS URL</label>
              <input value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://feeds.reuters.com/reuters/politicsNews" required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Source'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? <div className="spinner" /> : sources.length ? (
          <table>
            <thead><tr>
              <th>Name</th><th>Type</th><th>URL</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td><span className="badge badge-neutral">{s.type}</span></td>
                  <td style={{ color: 'var(--muted)', fontSize: '.8rem', maxWidth: 260,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.url ?? '—'}
                  </td>
                  <td>
                    <span className={`badge ${s.active ? 'badge-positive' : 'badge-negative'}`}>
                      {s.active ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '.5rem' }}>
                    <button className="btn btn-primary" style={{ fontSize: '.8rem', padding: '.3rem .8rem' }}
                      disabled={running === s.id} onClick={() => handleRun(s.id)}>
                      {running === s.id ? 'Running…' : '▶ Run'}
                    </button>
                    <button className="btn btn-danger" style={{ fontSize: '.8rem', padding: '.3rem .8rem' }}
                      onClick={() => handleDelete(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: '2rem' }}>📡</div>
            <p>No sources yet. Add an RSS feed to start ingesting civic data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
