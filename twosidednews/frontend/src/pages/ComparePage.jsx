import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { compareArticles } from '../utils/api';

export default function ComparePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { article1, article2 } = location.state || {};

  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Manual compare form (if accessed directly)
  const [manualA1, setManualA1] = useState({ title: '', source: '', summary: '' });
  const [manualA2, setManualA2] = useState({ title: '', source: '', summary: '' });
  const [useManual, setUseManual] = useState(!article1 || !article2);

  useEffect(() => {
    if (article1 && article2) {
      runComparison(article1, article2);
    }
  }, []);

  const runComparison = async (a1, a2) => {
    setLoading(true);
    setError(null);
    setComparison(null);
    try {
      const result = await compareArticles(a1, a2);
      setComparison(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Comparison failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCompare = (e) => {
    e.preventDefault();
    if (!manualA1.title || !manualA2.title) return;
    runComparison(manualA1, manualA2);
  };

  const formatComparison = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^#{1,3}\s+(.+)$/gm, '<h3 class="font-sans font-semibold text-sm uppercase tracking-wider text-gray-700 mt-4 mb-1">$1</h3>')
      .replace(/^\d+\.\s+\*\*(.*?)\*\*:?\s*/gm, '<h3 class="font-sans font-semibold text-sm uppercase tracking-wider text-gray-700 mt-4 mb-1">$1</h3>')
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/\n/g, '<br/>');
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm font-mono text-gray-400 mb-4">
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <span className="text-ink">Compare Articles</span>
        </div>
        <div className="section-label mb-2">Article Comparison Tool</div>
        <h1 className="font-display text-3xl font-bold text-ink">
          Compare Any Two Articles
        </h1>
        <p className="text-sm text-gray-500 font-body mt-1">
          AI analyzes sentiment, bias, tone, and key differences between two articles.
        </p>
      </div>

      {/* Manual input form */}
      {(useManual || (!article1 && !article2)) && (
        <form onSubmit={handleManualCompare} className="mb-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Article 1 */}
            <div className="border-l-4 border-for bg-white p-4">
              <div className="section-label text-for mb-3">Article 1 (FOR)</div>
              <input
                type="text"
                placeholder="Article title *"
                value={manualA1.title}
                onChange={e => setManualA1(p => ({ ...p, title: e.target.value }))}
                required
                className="w-full border border-gray-200 px-3 py-2 text-sm font-body mb-2 focus:outline-none focus:border-for"
              />
              <input
                type="text"
                placeholder="Source name"
                value={manualA1.source}
                onChange={e => setManualA1(p => ({ ...p, source: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-body mb-2 focus:outline-none focus:border-for"
              />
              <textarea
                placeholder="Article summary or content..."
                value={manualA1.summary}
                onChange={e => setManualA1(p => ({ ...p, summary: e.target.value }))}
                rows={4}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-for resize-none"
              />
            </div>

            {/* Article 2 */}
            <div className="border-l-4 border-against bg-white p-4">
              <div className="section-label text-against mb-3">Article 2 (AGAINST)</div>
              <input
                type="text"
                placeholder="Article title *"
                value={manualA2.title}
                onChange={e => setManualA2(p => ({ ...p, title: e.target.value }))}
                required
                className="w-full border border-gray-200 px-3 py-2 text-sm font-body mb-2 focus:outline-none focus:border-against"
              />
              <input
                type="text"
                placeholder="Source name"
                value={manualA2.source}
                onChange={e => setManualA2(p => ({ ...p, source: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-body mb-2 focus:outline-none focus:border-against"
              />
              <textarea
                placeholder="Article summary or content..."
                value={manualA2.summary}
                onChange={e => setManualA2(p => ({ ...p, summary: e.target.value }))}
                rows={4}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-against resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !manualA1.title || !manualA2.title}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Comparing...' : 'Compare Articles →'}
          </button>
        </form>
      )}

      {/* Article previews (when pre-filled from results) */}
      {article1 && article2 && !useManual && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-fade-in">
          <ArticlePreview article={article1} side="for" />
          <ArticlePreview article={article2} side="against" />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 animate-fade-in">
          <div className="inline-flex items-center gap-3 border-2 border-ink px-8 py-4">
            <div className="flex gap-1">
              {[0, 1, 2].map(d => (
                <div key={d} className="w-2 h-2 rounded-full bg-ink animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
              ))}
            </div>
            <span className="font-mono text-sm">AI is comparing articles...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border-2 border-against p-6 text-center animate-fade-in">
          <p className="font-mono text-against text-sm">{error}</p>
        </div>
      )}

      {/* Comparison result */}
      {comparison && !loading && (
        <div className="animate-fade-in">
          <div className="border-2 border-ink bg-white p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-ink flex items-center justify-center">
                <span className="text-white text-sm">⚡</span>
              </div>
              <div>
                <div className="section-label">AI Comparison Report</div>
                <p className="text-xs text-gray-500 font-mono">Generated by Grok AI</p>
              </div>
            </div>

            <hr className="divider-ink mb-5" />

            <div
              className="analysis-prose text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: `<p class="mb-2">${formatComparison(comparison.comparison)}</p>`
              }}
            />
          </div>

          <button
            onClick={() => { setComparison(null); setUseManual(true); }}
            className="mt-4 text-xs font-mono text-gray-400 hover:text-ink transition-colors"
          >
            ← Compare different articles
          </button>
        </div>
      )}
    </main>
  );
}

function ArticlePreview({ article, side }) {
  const isFor = side === 'for';
  const accent = isFor ? 'border-for' : 'border-against';
  const badge = isFor ? 'badge-for' : 'badge-against';
  const label = isFor ? 'FOR' : 'AGAINST';

  return (
    <div className={`border-l-4 ${accent} bg-white p-4`}>
      <span className={`${badge} mb-2 inline-block`}>{label}</span>
      <h3 className="font-display font-bold text-sm leading-snug text-ink mb-1 line-clamp-2">
        {article.title}
      </h3>
      {article.source && (
        <p className="text-xs font-mono text-gray-400">{article.source}</p>
      )}
      {article.summary && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-3 font-body">{article.summary}</p>
      )}
    </div>
  );
}
