import React, { useEffect, useState } from 'react';
import { apiService, StatsResponse } from '../services/api';

const MetricCard: React.FC<{ title: string; value: number; icon: React.ReactNode; accent?: 'blue' | 'purple' | 'green' | 'rose' }>
= ({ title, value, icon, accent = 'blue' }) => {
  const accents: Record<string, string> = {
    blue: 'from-blue-100 to-indigo-100 border-blue-100 text-blue-900',
    purple: 'from-purple-100 to-fuchsia-100 border-purple-100 text-purple-900',
    green: 'from-emerald-100 to-green-100 border-emerald-100 text-emerald-900',
    rose: 'from-rose-100 to-pink-100 border-rose-100 text-rose-900',
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all duration-300 ${accents[accent]} border-opacity-70`}> 
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/70 border border-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <span className="px-3 py-1 rounded-full bg-white/70 border border-white text-xs font-semibold">Live</span>
      </div>
      <div className="space-y-1">
        <div className="text-sm font-medium opacity-70">{title}</div>
        <div className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</div>
      </div>
    </div>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-blue-100 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-blue-100" />
      <div className="h-6 w-16 rounded-full bg-blue-50" />
    </div>
    <div className="h-4 w-24 bg-blue-100 rounded mb-2" />
    <div className="h-8 w-32 bg-blue-100 rounded" />
  </div>
);

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await apiService.stats();
      setStats(s);
    } catch (e) {
      setError('Failed to load statistics. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      {/* Hero */}
      <div className="relative rounded-3xl p-8 md:p-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm text-center">
        <div className="absolute inset-0 -z-10 blur-3xl bg-blue-100/30 rounded-[2rem]"></div>
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700">Platform Statistics</h1>
        <p className="mt-3 text-gray-700 text-lg">A quick overview of usage metrics</p>
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-white/70 border border-blue-200 text-sm text-blue-700">Real-time</span>
          <span className="px-3 py-1.5 rounded-full bg-white/70 border border-blue-200 text-sm text-blue-700">Secure</span>
          <span className="px-3 py-1.5 rounded-full bg-white/70 border border-blue-200 text-sm text-blue-700">Fast</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 p-4 flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button onClick={load} className="ml-auto px-3 py-1.5 rounded-full border border-rose-300 hover:bg-rose-100">Retry</button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading || !stats ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <MetricCard
              title="Total Conversations"
              value={stats.total_conversations}
              accent="blue"
              icon={
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7l-4 4V10a2 2 0 012-2h2" />
                </svg>
              }
            />
            <MetricCard
              title="Total PDFs"
              value={stats.total_pdfs}
              accent="purple"
              icon={
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <MetricCard
              title="Global PDFs"
              value={stats.global_pdfs}
              accent="green"
              icon={
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2c4 4 6 8 6 10s-2 6-6 10" />
                </svg>
              }
            />
            <MetricCard
              title="Conversation PDFs"
              value={stats.conversation_pdfs}
              accent="rose"
              icon={
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-12 8h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />
          </>
        )}
      </div>
    </div>
  );
}


