import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { analyzeInput } from '../utils/api';
import ArticleCard from '../components/ArticleCard';
import AnalysisPanel from '../components/AnalysisPanel';
import VoteBar from '../components/VoteBar';
import LoadingState from '../components/LoadingState';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  // Support both router state AND URL query param (?topic=xxx or ?input=xxx)
  const searchParams = new URLSearchParams(location.search);
  const input = (
    location.state?.input ||
    searchParams.get('topic') ||
    searchParams.get('input') ||
    ''
  ).trim();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  useEffect(() => {
    if (!input || input.length < 3) {
      navigate('/');
      return;
    }
    // Prevent double-call in React StrictMode dev
    if (hasRun.current) return;
    hasRun.current = true;
    runAnalysis(input);
    // Reset ref so new searches work
    return () => { hasRun.current = false; };
  }, [input]);

  const runAnalysis = async (query) => {
    setLoading(true);
    setError(null);
    setData(null);
    setSelectedForCompare([]);
    try {
      const result = await analyzeInput(query);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectForCompare = (article, side) => {
    const key = article.url;
    const existing = selectedForCompare.find(a => a.url === key);
    if (existing) {
      setSelectedForCompare(prev => prev.filter(a => a.url !== key));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare(prev => [...prev, { ...article, side }]);
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      navigate('/compare', {
        state: { article1: selectedForCompare[0], article2: selectedForCompare[1] }
      });
    }
  };

  if (!input) return null;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb + new search */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm font-mono text-gray-400">
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <span className="text-ink truncate max-w-xs">{input}</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-xs font-mono border border-gray-300 px-3 py-1.5 hover:border-ink hover:text-ink transition-colors"
        >
          ← New Search
        </button>
      </div>

      {/* Loading */}
      {loading && <LoadingState topic={input} />}

      {/* Error */}
      {error && !loading && (
        <div className="max-w-xl mx-auto py-16 text-center animate-fade-in">
          <div className="inline-block border-2 border-against p-8 mb-4">
            <p className="font-mono text-against text-sm mb-2">Analysis Failed</p>
            <p className="font-body text-gray-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => runAnalysis(input)}
            className="btn-primary text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="animate-fade-in">
          {/* Topic header */}
          <div className="text-center mb-8">
            <div className="section-label mb-2">Analysis Complete</div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-2">
              {data.topic}
            </h1>
            <div className="flex items-center justify-center gap-4 text-xs font-mono text-gray-400">
              <span>{data.total_analyzed || 0} articles analyzed</span>
              <span>·</span>
              <span>{data.for_articles.length} FOR</span>
              <span>·</span>
              <span>{data.against_articles.length} AGAINST</span>
              {data.fromCache && (
                <>
                  <span>·</span>
                  <span className="text-amber-500">cached</span>
                </>
              )}
            </div>
          </div>

          {/* Compare banner */}
          {selectedForCompare.length > 0 && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-ink text-paper px-6 py-3 shadow-xl flex items-center gap-4 animate-slide-up">
              <span className="font-mono text-sm">
                {selectedForCompare.length}/2 articles selected
              </span>
              {selectedForCompare.length === 2 && (
                <button
                  onClick={handleCompare}
                  className="bg-for text-white px-4 py-1.5 text-sm font-medium hover:bg-for-dark transition-colors"
                >
                  Compare These Articles →
                </button>
              )}
              <button
                onClick={() => setSelectedForCompare([])}
                className="text-gray-400 hover:text-white text-sm font-mono"
              >
                ✕
              </button>
            </div>
          )}

          {/* Select hint */}
          <div className="text-center mb-4">
            <p className="text-xs font-mono text-gray-400">
              💡 Select 2 articles to compare them side-by-side
            </p>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* FOR column */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-for flex-shrink-0" />
                <div>
                  <div className="section-label text-for">Supporting Perspective</div>
                  <h2 className="font-display font-bold text-xl text-ink">FOR</h2>
                </div>
              </div>

              {data.for_articles.length === 0 ? (
                <EmptyState side="for" />
              ) : (
                <div className="space-y-3">
                  {data.for_articles.map((article, i) => (
                    <ArticleCard
                      key={article.url || i}
                      article={article}
                      side="for"
                      showSelect
                      isSelected={selectedForCompare.some(a => a.url === article.url)}
                      onSelect={() => toggleSelectForCompare(article, 'for')}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* AGAINST column */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-against flex-shrink-0" />
                <div>
                  <div className="section-label text-against">Critical Perspective</div>
                  <h2 className="font-display font-bold text-xl text-ink">AGAINST</h2>
                </div>
              </div>

              {data.against_articles.length === 0 ? (
                <EmptyState side="against" />
              ) : (
                <div className="space-y-3">
                  {data.against_articles.map((article, i) => (
                    <ArticleCard
                      key={article.url || i}
                      article={article}
                      side="against"
                      showSelect
                      isSelected={selectedForCompare.some(a => a.url === article.url)}
                      onSelect={() => toggleSelectForCompare(article, 'against')}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center analysis */}
          {data.center_analysis && (
            <div className="mb-6">
              <AnalysisPanel analysis={data.center_analysis} topic={data.topic} />
            </div>
          )}

          {/* Vote bar */}
          <div className="mb-8">
            <VoteBar topic={data.topic} analysisId={data._id || 'temp'} />
          </div>

          {/* Query debug */}
          {data.queries && (
            <details className="text-xs font-mono text-gray-400 border border-gray-100 p-3 bg-gray-50">
              <summary className="cursor-pointer hover:text-gray-600">Show AI-generated queries</summary>
              <div className="mt-2 space-y-1">
                <div><span className="text-for">FOR:</span> {data.queries.for_query}</div>
                <div><span className="text-against">AGAINST:</span> {data.queries.against_query}</div>
              </div>
            </details>
          )}
        </div>
      )}
    </main>
  );
}

function EmptyState({ side }) {
  const color = side === 'for' ? 'border-for/30 text-for/50' : 'border-against/30 text-against/50';
  return (
    <div className={`border border-dashed ${color} p-8 text-center`}>
      <p className="font-mono text-sm">No {side.toUpperCase()} articles found</p>
      <p className="text-xs mt-1 text-gray-400">Try a more specific topic</p>
    </div>
  );
}
