import React, { useState, useEffect } from 'react';

function dedupeByUsername(list) {
  const seen = new Set();
  const out = [];
  for (const r of list) {
    const uname = String(r?.username || '').toLowerCase();
    if (!uname || seen.has(uname)) continue;
    seen.add(uname);
    out.push(r);
  }
  return out;
}

export default function UserDashboard({ user }) {
  const [credits, setCredits] = useState(null);
  const [plan] = useState('Professional ($29/mo)');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  async function fetchCredits() {
    try {
      const r = await fetch('/api/me/credits');
      const j = await r.json();
      setCredits(r.ok ? (j?.credits_available ?? 0) : 0);
    } catch {
      setCredits(0);
    }
  }

  useEffect(() => { fetchCredits(); }, []);

  async function onSearch(e) {
    e.preventDefault();
    if (!q) return;
    setLoading(true);
    setError('');

    try {
      const excludeIds = results.map(r => String(r?.ig_id || '')).filter(Boolean);
      const excludeUsernames = results.map(r => String(r?.username || '').toLowerCase()).filter(Boolean);

      const r = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q,
          limit: Number(limit) || 10,
          exclude: excludeIds,
          exclude_usernames: excludeUsernames,
        }),
      });

      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'search_failed');

      const newResults = Array.isArray(j.results) ? j.results : [];
      setResults(prev => dedupeByUsername([...(prev || []), ...newResults]));
      await fetchCredits();
    } catch (err) {
      setError(err.message || 'server_error');
    } finally {
      setLoading(false);
    }
  }

  async function onExport() {
    if (!results.length) return;
    const r = await fetch('/api/export-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results }),
    });
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome back 👋</h1>
            <p className="text-gray-500">Manage searches, credits, and billing.</p>
          </div>
          <form method="post" action="/api/auth/logout">
            <button className="px-3 py-2 text-sm bg-gray-200 rounded">Logout</button>
          </form>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white shadow rounded-lg p-5">
            <h2 className="text-sm text-gray-500 mb-1">Credits Remaining</h2>
            <p className="text-3xl font-bold text-blue-600">{credits ?? '—'}</p>
            <p className="text-xs text-gray-400">Resets monthly</p>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <h2 className="text-sm text-gray-500 mb-1">Current Plan</h2>
            <p className="text-xl font-semibold text-gray-800">{plan}</p>
            <button className="mt-2 text-sm text-blue-600 hover:underline">Upgrade or Change</button>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <h2 className="text-sm text-gray-500 mb-1">Download Invoices</h2>
            <button className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded">View Billing History</button>
            <p className="text-xs text-gray-400 mt-1">Powered by Stripe</p>
          </div>
        </div>

        <section className="bg-white rounded-lg shadow p-6 mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Search Instagram Emails</h2>
          <form onSubmit={onSearch} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter @username or keyword e.g. florist"
              className="w-full px-4 py-2 border border-gray-300 rounded"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <input
              type="number"
              min="1"
              max="50"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-28 px-4 py-2 border border-gray-300 rounded"
              title="Quantity"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
            <button
              type="button"
              onClick={onExport}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
              disabled={!results.length}
            >
              Download CSV
            </button>
          </form>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <p className="text-xs text-gray-400 mt-2">Your results will appear below and be available for CSV download.</p>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Your Recent Results</h2>
          {!results.length ? (
            <p className="text-gray-500 text-sm">No results yet — run a search.</p>
          ) : (
            <table className="w-full table-auto text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="py-2">Instagram Handle</th>
                  <th>Email</th>
                  <th>Followers</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={String((r.username || '').toLowerCase())} className="border-t">
                    <td className="py-2">@{r.username || r.ig_id}</td>
                    <td>{Array.isArray(r.emails) ? r.emails.join(', ') : '—'}</td>
                    <td>{r.followers ?? '—'}</td>
                    <td>{r.category ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
