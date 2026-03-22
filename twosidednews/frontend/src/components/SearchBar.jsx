import React, { useState } from 'react';

export default function SearchBar({ onSearch, loading }) {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState('topic'); // 'topic' | 'url'

  const isUrl = (str) => {
    try { new URL(str); return true; } catch { return false; }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    setInputType(isUrl(val.trim()) ? 'url' : 'topic');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim().length < 3) return;
    onSearch(input.trim());
  };

  const examples = [
    'AI regulation in Europe',
    'US-China trade war 2025',
    'Gaza ceasefire negotiations',
    'Electric vehicles adoption',
    'Immigration policy debate',
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="border-2 border-ink focus-within:border-for bg-white transition-colors duration-150">
          {/* Input type badge */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <span className={`text-xs font-mono px-2 py-0.5 ${
              inputType === 'url'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {inputType === 'url' ? '🔗 URL' : '📰 Topic'}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {inputType === 'url' ? 'We\'ll extract the topic automatically' : 'Enter any news topic or keyword'}
            </span>
          </div>

          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Enter a news topic or paste an article URL..."
              disabled={loading}
              className="flex-1 px-4 py-4 text-base font-body bg-transparent outline-none placeholder-gray-400 disabled:opacity-50"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || input.trim().length < 3}
              className="px-6 py-4 bg-ink text-paper font-body font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="hidden sm:inline">Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <span className="text-gray-400">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Example chips */}
      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-400 font-mono">Try:</span>
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => { setInput(ex); setInputType('topic'); }}
            disabled={loading}
            className="text-xs px-3 py-1 border border-gray-300 text-gray-600 hover:border-ink hover:text-ink transition-colors duration-150 font-body disabled:opacity-40"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
