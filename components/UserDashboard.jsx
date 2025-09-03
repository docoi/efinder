
import React from 'react';

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome back 👋</h1>
            <p className="text-gray-500">Here’s your dashboard to manage searches, credits, and billing.</p>
          </div>
          <button className="text-sm text-blue-600 hover:underline">Logout</button>
        </header>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white shadow rounded-lg p-5">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Credits Remaining</h2>
            <p className="text-3xl font-bold text-blue-600">125</p>
            <p className="text-xs text-gray-400">Resets monthly</p>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Current Plan</h2>
            <p className="text-xl font-semibold text-gray-800">Professional ($29/mo)</p>
            <button className="mt-2 text-sm text-blue-600 hover:underline">Upgrade or Change</button>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Download Invoices</h2>
            <button className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">
              View Billing History
            </button>
            <p className="text-xs text-gray-400 mt-1">Powered by Stripe</p>
          </div>
        </div>

        {/* Search Tool */}
        <section className="bg-white rounded-lg shadow p-6 mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Search Instagram Emails</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter @username or keyword e.g. Beauty"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
              Search
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Your results will appear below and be available for CSV download.</p>
        </section>

        {/* Placeholder Results Table */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Your Recent Results</h2>
          <table className="w-full table-auto text-left text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="py-2">Instagram Handle</th>
                <th>Email</th>
                <th>Followers</th>
                <th>Category</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2">@beautybyjess</td>
                <td>jess@example.com</td>
                <td>32.1K</td>
                <td>Beauty</td>
                <td><a className="text-blue-600 hover:underline text-sm" href="#">Download CSV</a></td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
