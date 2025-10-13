import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="pt-24 sm:pt-28 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-2 animate-pulse-slow">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Your AI Copilot for Cars</h1>
        <p className="text-zinc-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">Chat with your manuals, upload global PDFs, and predict car prices using a trained model.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/chat" className="btn-primary px-6 py-3 rounded-lg">Open Chat</Link>
          <Link to="/price" className="btn-secondary px-6 py-3 rounded-lg border border-steel">Predict Price</Link>
        </div>
      </section>

      {/* Features */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard title="RAG Chat" desc="Ask questions about your car PDFs and receive precise answers." icon={<span>💬</span>} />
        <FeatureCard title="Global PDFs" desc="Upload universal reference docs accessible from any chat." icon={<span>📄</span>} />
        <FeatureCard title="Price Prediction" desc="Get data-driven estimates tailored to your inputs." icon={<span>💲</span>} />
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; desc: string; icon: React.ReactNode }> = ({ title, desc, icon }) => (
  <div className="card glass p-6 hover-lift border border-zinc-200 dark:border-slate-700/50">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 rounded bg-brand/80 grid place-items-center">{icon}</div>
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
    </div>
    <p className="text-zinc-600 dark:text-gray-300 text-sm">{desc}</p>
  </div>
);

export default HomePage;



