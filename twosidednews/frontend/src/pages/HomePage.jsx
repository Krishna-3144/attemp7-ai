import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import TrendingSection from '../components/TrendingSection';

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleSearch = (input) => {
    navigate('/results', { state: { input } });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-12 animate-slide-up">
        {/* Masthead decoration */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px flex-1 max-w-16 bg-gray-300" />
          <span className="font-mono text-xs tracking-[0.3em] text-gray-400 uppercase">Est. 2025</span>
          <div className="h-px flex-1 max-w-16 bg-gray-300" />
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-ink leading-none mb-4">
          <span className="text-for">Two</span>
          <span className="text-ink">Sided</span>
          <br />
          <span className="italic font-normal text-4xl sm:text-5xl lg:text-6xl text-gray-600">
            News AI
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-600 font-body max-w-xl mx-auto leading-relaxed mb-3">
          Enter any news topic or article URL. Our AI fetches articles from
          both sides of the debate and gives you a neutral analysis.
        </p>

        {/* Pipeline tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { label: 'FOR', color: 'text-for border-for' },
            { label: '→ AI Search →', color: 'text-gray-400 border-gray-200' },
            { label: 'AGAINST', color: 'text-against border-against' },
            { label: '→ Stance AI →', color: 'text-gray-400 border-gray-200' },
            { label: 'ANALYSIS', color: 'text-neutral-accent border-neutral-accent' },
          ].map((tag, i) => (
            <span
              key={i}
              className={`text-xs font-mono px-2 py-0.5 border ${tag.color}`}
            >
              {tag.label}
            </span>
          ))}
        </div>

        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            num: '01',
            title: 'AI Query Generation',
            desc: 'Grok generates optimized FOR and AGAINST search queries from your topic.',
            color: 'border-for',
          },
          {
            num: '02',
            title: 'Fetch & Verify',
            desc: 'NewsAPI fetches 20+ articles. AI verifies each article\'s stance, removes bias.',
            color: 'border-neutral-accent',
          },
          {
            num: '03',
            title: 'Balanced Analysis',
            desc: 'Get both sides side-by-side plus a neutral AI fact-check and comparison.',
            color: 'border-against',
          },
        ].map((step) => (
          <div key={step.num} className={`border-l-2 ${step.color} pl-4 py-2`}>
            <div className="font-mono text-2xl font-bold text-gray-200 mb-1">{step.num}</div>
            <h3 className="font-display font-bold text-sm text-ink mb-1">{step.title}</h3>
            <p className="text-xs text-gray-500 font-body leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      <TrendingSection onSearch={handleSearch} />
    </main>
  );
}
