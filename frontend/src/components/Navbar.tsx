import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 backdrop-blur bg-white/80 dark:bg-asphalt/75 border-b border-zinc-200 dark:border-steel">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded bg-brand grid place-items-center shadow-card">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-asphalt">
              <path d="M3 13h18l-1.5-3.75a4 4 0 0 0-3.7-2.5H8.2a4 4 0 0 0-3.7 2.5L3 13z"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
          <span className="text-lg sm:text-xl font-semibold tracking-tight">RAG Cars</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NavItem to="/chat" label="Chat" active={isActive('/chat')} />
              <NavItem to="/pdfs" label="Global PDFs" active={isActive('/pdfs')} />
              <NavItem to="/settings" label="Settings" active={isActive('/settings')} />
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm text-zinc-600 dark:text-gray-300">
                  {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-zinc-700 hover:bg-zinc-100 dark:text-gray-300 dark:hover:bg-steel/50"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavItem to="/login" label="Login" active={isActive('/login')} />
              <NavItem to="/signup" label="Sign Up" active={isActive('/signup')} />
            </>
          )}
          <NavItem to="/price" label="Price" active={isActive('/price')} />
          <NavItem to="/stats" label="Stats" active={isActive('/stats')} />
          <NavItem to="/health" label="Health" active={isActive('/health')} />
          <button
            aria-label="Toggle theme"
            className="ml-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-zinc-700 hover:bg-zinc-100 dark:text-gray-300 dark:hover:bg-steel/50"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <button
            aria-label="Toggle theme"
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-zinc-700 hover:bg-zinc-100 dark:text-gray-300 dark:hover:bg-steel/50"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
          <button
            aria-label="Open menu"
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-zinc-700 hover:bg-zinc-100 dark:text-gray-300 dark:hover:bg-steel/50"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-steel bg-white/90 dark:bg-asphalt/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                <NavItem to="/chat" label="Chat" active={isActive('/chat')} />
                <NavItem to="/pdfs" label="Global PDFs" active={isActive('/pdfs')} />
                <NavItem to="/settings" label="Settings" active={isActive('/settings')} />
                <div className="px-3 py-2 text-sm text-zinc-600 dark:text-gray-300">
                  {user?.email}
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-zinc-700 hover:bg-zinc-100 dark:text-gray-300 dark:hover:bg-steel/50 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavItem to="/login" label="Login" active={isActive('/login')} />
                <NavItem to="/signup" label="Sign Up" active={isActive('/signup')} />
              </>
            )}
            <NavItem to="/price" label="Price" active={isActive('/price')} />
            <NavItem to="/stats" label="Stats" active={isActive('/stats')} />
            <NavItem to="/health" label="Health" active={isActive('/health')} />
          </div>
        </div>
      )}
    </header>
  );
};

const NavItem: React.FC<{ to: string; label: string; active?: boolean }> = ({ to, label, active }) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-brand text-white' : 'text-zinc-700 hover:bg-zinc-100 dark:text-gray-300 dark:hover:bg-steel/50 dark:hover:text-white'
    }`}
  >
    {label}
  </Link>
);

export default Navbar;



