import React, { useState } from 'react';
import { submitVote } from '../utils/api';

export default function VoteBar({ topic, analysisId }) {
  const [votes, setVotes] = useState({ for: 0, against: 0 });
  const [voted, setVoted] = useState(null); // 'for' | 'against' | null
  const [loading, setLoading] = useState(false);

  const total = votes.for + votes.against;
  const forPct = total > 0 ? Math.round((votes.for / total) * 100) : 50;
  const againstPct = total > 0 ? Math.round((votes.against / total) * 100) : 50;

  const handleVote = async (side) => {
    if (voted || loading) return;
    setLoading(true);
    try {
      const result = await submitVote(side, analysisId || 'temp', topic);
      setVotes(result.votes);
      setVoted(side);
    } catch (err) {
      console.error('Vote failed:', err);
      // Optimistic update
      setVotes(prev => ({ ...prev, [side]: prev[side] + 1 }));
      setVoted(side);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-bold text-ink">
          Which side do you agree with?
        </h3>
        {voted && (
          <span className="text-xs font-mono text-gray-400">
            {total} vote{total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Vote buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => handleVote('for')}
          disabled={!!voted || loading}
          className={`flex-1 py-2.5 text-sm font-body font-medium border-2 transition-all duration-200 ${
            voted === 'for'
              ? 'bg-for border-for text-white'
              : voted
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-for text-for hover:bg-for hover:text-white'
          }`}
        >
          👍 Support ({forPct}%)
        </button>
        <button
          onClick={() => handleVote('against')}
          disabled={!!voted || loading}
          className={`flex-1 py-2.5 text-sm font-body font-medium border-2 transition-all duration-200 ${
            voted === 'against'
              ? 'bg-against border-against text-white'
              : voted
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-against text-against hover:bg-against hover:text-white'
          }`}
        >
          👎 Oppose ({againstPct}%)
        </button>
      </div>

      {/* Vote bar */}
      {voted && (
        <div className="animate-fade-in">
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
            <div
              className="vote-bar bg-for h-full"
              style={{ width: `${forPct}%` }}
            />
            <div
              className="vote-bar bg-against h-full"
              style={{ width: `${againstPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs font-mono text-for">{votes.for} for</span>
            <span className="text-xs font-mono text-against">{votes.against} against</span>
          </div>
        </div>
      )}

      {!voted && (
        <p className="text-xs text-gray-400 font-mono text-center">
          Cast your vote to see results
        </p>
      )}
    </div>
  );
}
