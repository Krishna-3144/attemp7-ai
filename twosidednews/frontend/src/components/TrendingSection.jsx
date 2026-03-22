import React, { useEffect, useState } from 'react';
import { getTrending } from '../utils/api';

const CATEGORIES = ['general', 'technology', 'business', 'politics', 'science', 'health'];

export default function TrendingSection({ onSearch }) {
  const [articles, setArticles] = useState([]);
  const [recentTopics, setRecentTopics] = useState([]);
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getTrending(category)
      .then(data => {
        setArticles(data.articles || []);
        setRecentTopics(data.recentTopics || []);
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load trending news'))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="mt-12">
      <hr className="divider-ink mb-8" />

      {/* Section header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="section-label mb-1">Live Feed</div>
          <h2 className="font-display text-2xl font-bold text-ink">Trending Now</h2>
        </div>

        {/* Category filter */}
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 text-xs font-mono capitalize border transition-colors duration-150 ${
                category === cat
                  ? 'bg-ink text-paper border-ink'
                  : 'border-gray-300 text-gray-600 hover:border-ink hover:text-ink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recent analyses */}
      {recentTopics.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono text-gray-400">Recent:</span>
          {recentTopics.map((t, i) => (
            <button
              key={i}
              onClick={() => onSearch(t.topic)}
              className="text-xs px-3 py-1 bg-ink text-paper hover:bg-gray-800 transition-colors font-mono"
            >
              ↩ {t.topic}
            </button>
          ))}
        </div>
      )}

      {/* Articles grid */}
      {loading ? (
        <TrendingSkeletons />
      ) : error ? (
        <div className="text-center py-8 border border-dashed border-gray-200">
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.slice(0, 9).map((article, i) => (
            <TrendingCard
              key={i}
              article={article}
              onAnalyze={() => article.title && article.title.trim().length > 3 && onSearch(article.title.trim())}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TrendingCard({ article, onAnalyze }) {
  const domain = (() => {
    try { return new URL(article.url).hostname.replace('www.', ''); }
    catch { return article.source; }
  })();

  return (
    <div className="bg-white border border-gray-200 p-4 hover:border-gray-400 transition-colors duration-150 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono text-gray-400">{domain}</span>
      </div>
      <h3 className="font-display font-bold text-sm leading-snug text-ink mb-2 line-clamp-2">
        {article.title}
      </h3>
      {article.summary && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 font-body leading-relaxed">
          {article.summary}
        </p>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-gray-400 hover:text-ink transition-colors"
        >
          Read ↗
        </a>
        <button
          onClick={onAnalyze}
          className="text-xs font-mono px-2 py-1 border border-ink text-ink hover:bg-ink hover:text-paper transition-colors duration-150"
        >
          Analyze ⚖
        </button>
      </div>
    </div>
  );
}

function TrendingSkeletons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 p-4">
          <div className="shimmer h-3 w-20 mb-3 rounded" />
          <div className="shimmer h-4 w-full mb-1 rounded" />
          <div className="shimmer h-4 w-3/4 mb-3 rounded" />
          <div className="shimmer h-3 w-full mb-1 rounded" />
          <div className="shimmer h-3 w-2/3 rounded" />
        </div>
      ))}
    </div>
  );
}
