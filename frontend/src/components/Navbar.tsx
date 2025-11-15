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
    <header className="fixed inset-x-0 top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-2" aria-label="Home">
          <span className="text-xl font-bold text-brand">RAG Cars</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <div className="flex items-center space-x-1">
            <NavItem to="/cars" label="Cars" active={isActive('/cars')} />
            <NavItem to="/recommendation-search" label="Find Car" active={isActive('/recommendation-search')} />
            <NavItem to="/price" label="Price" active={isActive('/price')} />
            {isAuthenticated && <NavItem to="/stats" label="Stats" active={isActive('/stats')} />}
            {isAuthenticated && <NavItem to="/pdfs" label="Global PDFs" active={isActive('/pdfs')} />}
            {isAuthenticated && <NavItem to="/chat" label="Chat" active={isActive('/chat')} />}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center ml-2 space-x-1">
              <NavItem to="/settings" label="Settings" active={isActive('/settings')} />
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center ml-2 space-x-1">
              <NavItem to="/login" label="Login" active={isActive('/login')} />
              <NavItem to="/signup" label="Sign Up" active={isActive('/signup')} />
            </div>
          )}

          <button
            aria-label="Toggle theme"
            className="ml-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>

        <button
          className="md:hidden p-2 text-gray-700 dark:text-gray-300"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95">
          <div className="px-4 py-2 space-y-1">
            <NavItem to="/cars" label="Cars" active={isActive('/cars')} />
            <NavItem to="/recommendation-search" label="Find Car" active={isActive('/recommendation-search')} />
            <NavItem to="/price" label="Price" active={isActive('/price')} />
            {isAuthenticated && <NavItem to="/stats" label="Stats" active={isActive('/stats')} />}
            {isAuthenticated && <NavItem to="/pdfs" label="Global PDFs" active={isActive('/pdfs')} />}
            {isAuthenticated && <NavItem to="/chat" label="Chat" active={isActive('/chat')} />}
            {isAuthenticated ? (
              <>
                <NavItem to="/settings" label="Settings" active={isActive('/settings')} />
                <button
                  onClick={logout}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
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
          </div>
        </div>
      )}
    </header>
  );
};

const NavItem: React.FC<{ to: string; label: string; active?: boolean }> = ({ to, label, active }) => (
  <Link
    to={to}
    className={`px-3 py-1.5 text-sm rounded-md transition-all relative ${
      active 
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-medium' 
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    } ${active ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 dark:after:bg-blue-400' : ''}`}
  >
    {label}
  </Link>
);

export default Navbar;



