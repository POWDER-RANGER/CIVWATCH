import React, { useState } from 'react';
import { ingestApi } from '../api/client';
import { toast } from 'react-toastify';

interface Props { onSuccess?: () => void; }

export default function IngestForm({ onSuccess }: Props) {
  const [source,  setSource]  = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await ingestApi.submit({ source: source.trim(), content: content.trim() });
      toast.success('Record ingested — anomaly scoring queued');
      setSource('');
      setContent('');
      onSuccess?.();
    } catch {
      // error already toasted by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ingest-form">
      <h3 className="form-title">Ingest Civic Record</h3>

      <label className="field-label">
        Source Identifier
        <input
          className="field-input"
          value={source}
          onChange={e => setSource(e.target.value)}
          placeholder="e.g. FEC-2026-Q1, ICE-FOIA-0042"
          required
        />
      </label>

      <label className="field-label">
        Raw Content
        <textarea
          className="field-input field-textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste document text, JSON record, or data payload..."
          rows={6}
          required
        />
      </label>

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Submitting…' : 'Ingest Record'}
      </button>
    </form>
  );
}
