import { useState } from 'react';
import { api } from '../api/client';

interface BillRecord {
  raw_id: string;
  title: string;
  source_url: string;
  published_date: string;
  congress?: number;
  bill_number?: string;
  bill_type?: string;
  state?: string;
  session?: string;
  latest_action?: any;
  raw_text: string;
}

export const LegislationPage = () => {
  const [activeTab, setActiveTab] = useState<'federal' | 'state'>('federal');
  const [fedParams, setFedParams] = useState({
    congress: '',
    query: '',
    subject: '',
    limit: 50,
  });
  const [stateParams, setStateParams] = useState({
    state: '',
    session: '',
    query: '',
    subject: '',
    limit: 50,
  });
  const [results, setResults] = useState<BillRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());

  const handleFederalSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fedParams.congress) params.append('congress', fedParams.congress);
      if (fedParams.query) params.append('query', fedParams.query);
      if (fedParams.subject) params.append('subject', fedParams.subject);
      params.append('limit', String(fedParams.limit));
      const res = await api.get(`/legislation/federal/search?${params}`);
      setResults(res.data.records || []);
    } catch (err) {
      console.error('Federal search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStateSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stateParams.state) params.append('state', stateParams.state);
      if (stateParams.session) params.append('session', stateParams.session);
      if (stateParams.query) params.append('query', stateParams.query);
      if (stateParams.subject) params.append('subject', stateParams.subject);
      params.append('limit', String(stateParams.limit));
      const res = await api.get(`/legislation/state/search?${params}`);
      setResults(res.data.records || []);
    } catch (err) {
      console.error('State search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedRecords);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRecords(next);
  };

  const importSelected = async () => {
    const toImport = results.filter(r => selectedRecords.has(r.raw_id));
    if (toImport.length === 0) return;

    setImporting(true);
    try {
      await api.post('/legislation/import', { records: toImport });
      setSelectedRecords(new Set());
      alert(`Imported ${toImport.length} bills`);
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Legislation Search</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setActiveTab('federal'); setResults([]); setSelectedRecords(new Set()); }}
          className={`px-4 py-2 rounded ${activeTab === 'federal' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Federal (Congress.gov)
        </button>
        <button
          onClick={() => { setActiveTab('state'); setResults([]); setSelectedRecords(new Set()); }}
          className={`px-4 py-2 rounded ${activeTab === 'state' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          State (OpenStates)
        </button>
      </div>

      {/* Federal Search */}
      {activeTab === 'federal' && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Congress</label>
              <input
                type="number"
                className="mt-1 block w-full rounded border p-2"
                value={fedParams.congress}
                onChange={(e) => setFedParams({ ...fedParams, congress: e.target.value })}
                placeholder="118"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <input
                className="mt-1 block w-full rounded border p-2"
                value={fedParams.query}
                onChange={(e) => setFedParams({ ...fedParams, query: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                className="mt-1 block w-full rounded border p-2"
                value={fedParams.subject}
                onChange={(e) => setFedParams({ ...fedParams, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Limit</label>
              <input
                type="number"
                className="mt-1 block w-full rounded border p-2"
                value={fedParams.limit}
                onChange={(e) => setFedParams({ ...fedParams, limit: Number(e.target.value) })}
                min={1}
                max={250}
              />
            </div>
          </div>
          <button
            onClick={handleFederalSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Congress.gov'}
          </button>
        </div>
      )}

      {/* State Search */}
      {activeTab === 'state' && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">State Code</label>
              <input
                className="mt-1 block w-full rounded border p-2"
                value={stateParams.state}
                onChange={(e) => setStateParams({ ...stateParams, state: e.target.value })}
                placeholder="ny, ca, tx"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <input
                className="mt-1 block w-full rounded border p-2"
                value={stateParams.query}
                onChange={(e) => setStateParams({ ...stateParams, query: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                className="mt-1 block w-full rounded border p-2"
                value={stateParams.subject}
                onChange={(e) => setStateParams({ ...stateParams, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Limit</label>
              <input
                type="number"
                className="mt-1 block w-full rounded border p-2"
                value={stateParams.limit}
                onChange={(e) => setStateParams({ ...stateParams, limit: Number(e.target.value) })}
                min={1}
                max={250}
              />
            </div>
          </div>
          <button
            onClick={handleStateSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search OpenStates'}
          </button>
        </div>
      )}

      {/* Import Controls */}
      {results.length > 0 && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={importSelected}
            disabled={importing || selectedRecords.size === 0}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {importing ? 'Importing...' : `Import Selected (${selectedRecords.size})`}
          </button>
          <span className="text-sm text-gray-500 self-center">
            {results.length} results
          </span>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <div
              key={r.raw_id}
              className={`bg-white p-4 rounded shadow border-l-4 ${
                selectedRecords.has(r.raw_id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedRecords.has(r.raw_id)}
                  onChange={() => toggleSelection(r.raw_id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{r.title}</h3>
                  <div className="flex gap-3 mt-1 text-sm text-gray-500">
                    {r.congress && <span>Congress: {r.congress}</span>}
                    {r.bill_number && <span>{r.bill_number}</span>}
                    {r.bill_type && <span className="uppercase">{r.bill_type}</span>}
                    {r.state && <span>State: {r.state.toUpperCase()}</span>}
                    {r.session && <span>Session: {r.session}</span>}
                    {r.published_date && (
                      <span>{new Date(r.published_date).toLocaleDateString()}</span>
                    )}
                  </div>
                  {r.latest_action && typeof r.latest_action === 'object' && (
                    <p className="text-xs text-gray-400 mt-1">
                      Latest: {r.latest_action.text || JSON.stringify(r.latest_action)}
                    </p>
                  )}
                  {r.source_url && (
                    <a
                      href={r.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      View Source
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
