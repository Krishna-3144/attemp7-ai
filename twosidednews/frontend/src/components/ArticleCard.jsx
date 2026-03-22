import React from 'react';

export default function ArticleCard({ article, side, onSelect, isSelected, showSelect }) {
  const isFor = side === 'for';
  const accent = isFor ? 'border-for' : 'border-against';
  const badgeClass = isFor ? 'badge-for' : 'badge-against';
  const badgeLabel = isFor ? 'FOR' : 'AGAINST';
  const bgHover = isFor ? 'hover:bg-blue-50/30' : 'hover:bg-red-50/30';

  const domain = (() => {
    try { return new URL(article.url).hostname.replace('www.', ''); }
    catch { return article.source || 'Unknown'; }
  })();

  const timeAgo = (() => {
    if (!article.publishedAt) return '';
    const diff = Date.now() - new Date(article.publishedAt);
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  })();

  return (
    <div
      className={`border-l-4 ${accent} bg-white p-4 ${bgHover} transition-all duration-200 ${
        isSelected ? 'ring-2 ring-offset-1 ring-ink' : ''
      } ${showSelect ? 'cursor-pointer' : ''} animate-fade-in`}
      onClick={showSelect ? onSelect : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={badgeClass}>{badgeLabel}</span>
          <span className="text-xs text-gray-400 font-mono">{domain}</span>
          {timeAgo && (
            <span className="text-xs text-gray-300 font-mono">· {timeAgo}</span>
          )}
        </div>
        {showSelect && (
          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
            isSelected ? 'bg-ink border-ink' : 'border-gray-300'
          }`} />
        )}
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-sm leading-snug text-ink mb-2 line-clamp-2">
        {article.title}
      </h3>

      {/* Summary */}
      {article.summary && (
        <p className="text-xs text-gray-600 font-body leading-relaxed line-clamp-3 mb-3">
          {article.summary}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-gray-400">{article.source}</span>
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`text-xs font-mono ${
              isFor ? 'text-for hover:text-for-dark' : 'text-against hover:text-against-dark'
            } hover:underline transition-colors`}
          >
            Read full ↗
          </a>
        )}
      </div>
    </div>
  );
}
