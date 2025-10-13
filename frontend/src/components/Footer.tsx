import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-zinc-200 dark:border-steel bg-white/80 dark:bg-asphalt/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-zinc-600 dark:text-gray-300">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded bg-brand grid place-items-center shadow-card">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-asphalt">
                <path d="M3 13h18l-1.5-3.75a4 4 0 0 0-3.7-2.5H8.2a4 4 0 0 0-3.7 2.5L3 13z"/>
              </svg>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-white">RAG Cars</span>
          </div>
          <p className="text-zinc-500 dark:text-gray-400">AI-powered car knowledge, document Q&A, and price prediction.</p>
        </div>
        <div>
          <p className="font-semibold text-zinc-900 dark:text-gray-200 mb-2">Links</p>
          <ul className="space-y-1">
            <li><Link className="text-zinc-600 hover:text-zinc-900 dark:text-gray-300 dark:hover:text-white" to="/chat">Chat</Link></li>
            <li><Link className="text-zinc-600 hover:text-zinc-900 dark:text-gray-300 dark:hover:text-white" to="/pdfs">Global PDFs</Link></li>
            <li><Link className="text-zinc-600 hover:text-zinc-900 dark:text-gray-300 dark:hover:text-white" to="/price">Price</Link></li>
            <li><Link className="text-zinc-600 hover:text-zinc-900 dark:text-gray-300 dark:hover:text-white" to="/stats">Stats</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-zinc-900 dark:text-gray-200 mb-2">Legal</p>
          <p className="text-zinc-500 dark:text-gray-400">Use for informational purposes only. Predictions are estimates.</p>
        </div>
      </div>
      <div className="border-t border-zinc-200 dark:border-steel text-center text-xs text-zinc-500 dark:text-gray-500 py-3">© {new Date().getFullYear()} RAG Cars</div>
    </footer>
  );
};

export default Footer;



