import React, { useState, useEffect } from 'react';

const STEPS = [
  { id: 1, label: 'Generating search queries', icon: '🧠', duration: 4000 },
  { id: 2, label: 'Fetching articles from NewsAPI', icon: '📡', duration: 5000 },
  { id: 3, label: 'Removing duplicates & scoring', icon: '🔍', duration: 2000 },
  { id: 4, label: 'Verifying stance with AI', icon: '⚖️', duration: 6000 },
  { id: 5, label: 'Generating neutral analysis', icon: '✍️', duration: 5000 },
];

export default function LoadingState({ topic }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 100);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let totalDuration = 0;
    for (let i = 0; i < STEPS.length; i++) {
      totalDuration += STEPS[i].duration;
      if (elapsed < totalDuration) {
        setCurrentStep(i);
        break;
      }
      if (i === STEPS.length - 1) setCurrentStep(i);
    }
  }, [elapsed]);

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-for animate-pulse" />
          <span className="font-mono text-sm">Analyzing</span>
          <div className="w-2 h-2 rounded-full bg-against animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        <h2 className="font-display text-2xl font-bold text-ink mb-1">
          "{topic}"
        </h2>
        <p className="text-sm text-gray-500 font-body">
          AI is fetching and analyzing articles from multiple sources
        </p>
      </div>

      {/* Pipeline steps */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const status = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending';
          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 border transition-all duration-300 ${
                status === 'done'
                  ? 'border-gray-200 bg-gray-50 opacity-60'
                  : status === 'active'
                  ? 'border-ink bg-white shadow-sm'
                  : 'border-gray-100 bg-white opacity-30'
              }`}
            >
              <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 text-base ${
                status === 'done' ? 'opacity-50' : ''
              }`}>
                {status === 'done' ? '✓' : step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-body font-medium ${
                  status === 'done' ? 'text-gray-400' : 'text-ink'
                }`}>
                  {step.label}
                </p>
              </div>
              <div className="flex-shrink-0">
                {status === 'done' && (
                  <span className="text-xs font-mono text-gray-400">Done</span>
                )}
                {status === 'active' && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map(d => (
                      <div
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-ink animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
                {status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs font-mono text-gray-400 mt-6">
        This typically takes 15–30 seconds
      </p>
    </div>
  );
}
