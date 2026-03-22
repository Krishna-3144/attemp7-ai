import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="border-b-2 border-ink bg-paper sticky top-0 z-50">
      {/* Top strip */}
      <div className="bg-ink text-paper text-center py-1">
        <span className="font-mono text-xs tracking-[0.3em] uppercase">
          AI-Powered Balanced News Analysis
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center">
              <span className="font-display font-black text-xl text-for">TWO</span>
              <span className="font-display font-black text-xl text-ink mx-0.5">|</span>
              <span className="font-display font-black text-xl text-against">SIDED</span>
            </div>
            <div className="hidden sm:block border-l border-gray-300 pl-3">
              <span className="font-display text-sm text-gray-600 italic">News AI</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            <NavLink to="/" active={location.pathname === '/'}>Home</NavLink>
            <NavLink to="/compare" active={location.pathname === '/compare'}>Compare</NavLink>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 px-3 py-1.5 border border-ink text-xs font-mono font-medium hover:bg-ink hover:text-paper transition-colors duration-150"
            >
              GitHub ↗
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 text-sm font-body font-medium transition-colors duration-150 ${
        active
          ? 'bg-ink text-paper'
          : 'text-ink hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}
