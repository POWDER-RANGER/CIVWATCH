import { useState } from 'react';
import { api } from '../api/client';

interface ContractRecord {
  raw_id: string;
  title: string;
  source_url: string;
  amount: number;
  recipient_name: string;
  awarding_agency: string;
  awarding_sub_agency: string;
  contract_type: string;
  place_of_performance: string;
  published_date: string;
  raw_text: string;
}

export const ContractsPage = () => {
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    awarding_agency: '',
    date_range: '',
    min_amount: '',
    max_amount: '',
    limit: 100,
  });
  const [results, setResults] = useState<ContractRecord[]>([]);
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
      const res = await api.get(`/contracts/search?${params}`);
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
      await api.post('/contracts/import', { records: toImport });
      setSelectedRecords(new Set());
      alert(`Imported ${toImport.length} contracts`);
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
      await api.post('/contracts/import', { records: results });
      alert(`Imported ${results.length} contracts`);
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setImporting(false);
    }
  };

  const totalAmount = results.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Federal Contracts (USASpending)</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Keyword</label>
            <input
              className="mt-1 block w-full rounded border p-2"
              value={searchParams.keyword}
              onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
              placeholder="e.g., defense, software"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Awarding Agency</label>
            <input
              className="mt-1 block w-full rounded border p-2"
              value={searchParams.awarding_agency}
              onChange={(e) => setSearchParams({ ...searchParams, awarding_agency: e.target.value })}
              placeholder="e.g., Department of Defense"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <input
              className="mt-1 block w-full rounded border p-2"
              value={searchParams.date_range}
              onChange={(e) => setSearchParams({ ...searchParams, date_range: e.target.value })}
              placeholder="2024-01-01,2024-12-31"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Amount ($)</label>
            <input
              type="number"
              className="mt-1 block w-full rounded border p-2"
              value={searchParams.min_amount}
              onChange={(e) => setSearchParams({ ...searchParams, min_amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Amount ($)</label>
            <input
              type="number"
              className="mt-1 block w-full rounded border p-2"
              value={searchParams.max_amount}
              onChange={(e) => setSearchParams({ ...searchParams, max_amount: e.target.value })}
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
            {loading ? 'Searching...' : 'Search USASpending'}
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

      {/* Summary */}
      {results.length > 0 && (
        <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
          <span className="font-medium">{results.length} contracts found</span>
          {totalAmount > 0 && (
            <span className="ml-4">
              Total value: <span className="font-bold">${totalAmount.toLocaleString()}</span>
            </span>
          )}
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
                  <p className="text-sm text-gray-500">
                    {r.recipient_name && `Recipient: ${r.recipient_name}`}
                    {r.awarding_agency && ` • Agency: ${r.awarding_agency}`}
                    {r.awarding_sub_agency && ` / ${r.awarding_sub_agency}`}
                  </p>
                  <div className="flex gap-4 mt-1 text-sm">
                    {r.amount !== undefined && (
                      <span className="font-medium text-green-700">
                        ${Number(r.amount).toLocaleString()}
                      </span>
                    )}
                    {r.contract_type && (
                      <span className="text-gray-500">{r.contract_type}</span>
                    )}
                    {r.place_of_performance && (
                      <span className="text-gray-400">{r.place_of_performance}</span>
                    )}
                    {r.published_date && (
                      <span className="text-gray-400">
                        {new Date(r.published_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
