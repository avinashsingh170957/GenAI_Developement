import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Semantic (RAG) search box: asks a natural-language question, shows the
// AI-generated answer, and lists the exact PDF/page sources it was drawn from.
const RagSearch = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { answer, sources }
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await api.post('/pdfs/search', { query });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openSource = (source) => {
    navigate(`/view/${source.pdf_id}`, {
      state: { title: source.title, page: source.page_number }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Ask your documents</h2>
      <p className="text-sm text-gray-500 mb-4">
        Search across every uploaded PDF using AI. Ask a question in plain language.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. What is the refund policy?"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-md transition whitespace-nowrap"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="text-sm rounded-md px-4 py-2 mt-4 border bg-red-50 border-red-200 text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-4 text-sm text-gray-500">Reading through your documents…</div>
      )}

      {result && !loading && (
        <div className="mt-5 space-y-4">
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
            <p className="text-sm font-medium text-primary-700 mb-1">Answer</p>
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{result.answer}</p>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Sources</p>
              <div className="space-y-2">
                {result.sources.map((source) => (
                  <button
                    key={`${source.pdf_id}-${source.index}`}
                    onClick={() => openSource(source)}
                    className="w-full text-left border border-gray-200 rounded-lg p-3 hover:border-primary-400 hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-gray-800 truncate">
                        {source.index}. {source.title}{' '}
                        <span className="text-xs font-normal text-gray-400">
                          · Page {source.page_number}
                        </span>
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {Math.round(source.score * 100)}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{source.snippet}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RagSearch;
