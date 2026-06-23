import { useState } from 'react';
import { api } from '../api/client';

interface ContributionRecord {
  raw_id: string;
  title: string;
  source_url: string;
  amount: number;
  contributor_name: string;
  contributor_occupation: string;
  contributor_employer: string;
  committee_name: string;
  published_date: string;
  raw_text: string;
}

export const CampaignFinancePage = () => {
  const [searchParams, setSearchParams] = useState({
    committee_id: '',
    candidate_id: '',
    contributor_name: '',
    min_date: '',
    max_date: '',
    limit: 100,
  });
  const [results, setResults] = useState<ContributionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      const res = await api.get(`/campaign-finance/search?${params}`);
      setResults(res.data.records || []);
    } catch (err) {
      console.error('Search failed:', err);
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
      await api.post('/campaign-finance/import', { records: toImport });
      setSelectedRecords(new Set());
      alert(`Imported ${toImport.length} records`);
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setImporting(false);
    }
  };

  const importAll = async () => {
    if (results.length === 0) return;
    setImporting(true);
    try {
      await api.post('/campaign-finance/import', { records: results });
      alert(`Imported ${results.length} records`);
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Campaign Finance (FEC)</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Committee ID</label>
            <input
              className="mt-1 block w-full rounded border p-2"
              value={searchParams.committee_id}
              onChange={(e) => setSearchParams({ ...searchParams, committee_id: e.target.value })}
              placeholder="C00XXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Candidate ID</label>
            <input
              className="mt-1 block w-full rounded border p-2"
              value={searchParams.candidate_id}
              onChange={(e) => setSearchParams({ ...searchParams, candidate_id: e.target.value })}
              placeholder="H0XX00000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contributor Name</label>
            <input
              className="mt-1 block w-full rounded border p-2"
              value={searchParams.contributor_name}
              onChange={(e) => setSearchParams({ ...searchParams, contributor_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <input
              type="date"
              className="mt-1 block w-full rounded border p-2"
              value={searchParams.min_date}
              onChange={(e) => setSearchParams({ ...searchParams, min_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              className="mt-1 block w-full rounded border p-2"
              value={searchParams.max_date}
              onChange={(e) => setSearchParams({ ...searchParams, max_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Limit</label>
            <input
              type="number"
              className="mt-1 block w-full rounded border p-2"
              value={searchParams.limit}
              onChange={(e) => setSearchParams({ ...searchParams, limit: Number(e.target.value) })}
              min={1}
              max={500}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search FEC'}
          </button>
          <button
            onClick={importAll}
            disabled={importing || results.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {importing ? 'Importing...' : `Import All (${results.length})`}
          </button>
          {selectedRecords.size > 0 && (
            <button
              onClick={importSelected}
              disabled={importing}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
            >
              Import Selected ({selectedRecords.size})
            </button>
          )}
        </div>
      </div>

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
                  <p className="text-sm text-gray-500">
                    {r.contributor_name && `Contributor: ${r.contributor_name}`}
                    {r.contributor_occupation && ` • ${r.contributor_occupation}`}
                    {r.contributor_employer && ` @ ${r.contributor_employer}`}
                  </p>
                  <div className="flex gap-4 mt-1 text-sm">
                    {r.amount !== undefined && (
                      <span className="font-medium text-green-700">
                        ${Number(r.amount).toLocaleString()}
                      </span>
                    )}
                    {r.committee_name && (
                      <span className="text-gray-500">{r.committee_name}</span>
                    )}
                    {r.published_date && (
                      <span className="text-gray-400">
                        {new Date(r.published_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
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
