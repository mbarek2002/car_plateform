import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

import ConversationList from './components/ConversationList';
import ChatInterface from './components/ChatInterface';
import PDFUpload from './components/PDFUpload';
import ProviderConfig from './components/ProviderConfig';
import { apiService, PDFInfo } from './services/api';
import PDFsPage from './pages/PDFsPage';
import StatsPage from './pages/StatsPage';
import HealthPage from './pages/HealthPage';
import PricePredictPage from './pages/PricePredictPage';

const drawerWidth = 280;

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [pdfList, setPdfList] = useState<PDFInfo[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const fetchPDFs = async (conversationId?: string) => {
    const targetConversationId = conversationId !== undefined ? conversationId : selectedConversationId;

    try {
      setLoadingPdfs(true);
      setPdfError(null);

      let pdfs: PDFInfo[];
      if (targetConversationId) {
        pdfs = await apiService.getConversationPdfs(targetConversationId);
      } else {
        pdfs = await apiService.getGlobalPdfs();
      }

      if (targetConversationId === selectedConversationId || (targetConversationId === undefined && selectedConversationId === undefined)) {
        setPdfList(pdfs);
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      setPdfError('Failed to load PDFs');
      setPdfList([]);
    } finally {
      setLoadingPdfs(false);
    }
  };

  useEffect(() => {
    fetchPDFs(selectedConversationId);
  }, [selectedConversationId]);

  const NavLink = ({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
          active ? 'bg-brand text-white' : 'text-gray-300 hover:bg-steel/50 hover:text-white'
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <span className="w-5 h-5 grid place-items-center">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-asphalt text-gray-100">
      <header className="fixed inset-x-0 top-0 z-40 backdrop-blur bg-asphalt/75 border-b border-steel">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-steel/70"
            aria-label="Open Menu"
            onClick={handleDrawerToggle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-brand grid place-items-center shadow-card">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-asphalt">
                <path d="M3 13h18l-1.5-3.75a4 4 0 0 0-3.7-2.5H8.2a4 4 0 0 0-3.7 2.5L3 13z"/>
                <circle cx="7" cy="17" r="2"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">RAG Cars</h1>
          </div>
        </div>
      </header>

      <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:fixed z-30 top-16 bottom-0 left-0 w-72 bg-steel/60 backdrop-blur border-r border-steel transition-transform`}
        style={{ width: drawerWidth }}>
        <div className="h-full flex flex-col">
          <div className="px-4 py-4 border-b border-steel">
            <nav className="space-y-1">
              <NavLink to="/" label="Home" icon={(<span>🏠</span>)} />
              <NavLink to="/chat" label="Chat" icon={(<span>💬</span>)} />
              <NavLink to="/pdfs" label="PDFs" icon={(<span>📄</span>)} />
              <NavLink to="/price" label="Price" icon={(<span>💲</span>)} />
              <NavLink to="/stats" label="Stats" icon={(<span>📊</span>)} />
              <NavLink to="/health" label="Health" icon={(<span>❤️</span>)} />
              <NavLink to="/settings" label="Settings" icon={(<span>⚙️</span>)} />
            </nav>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ConversationList 
              onSelectConversation={(id) => {
                setSelectedConversationId(id);
                setMobileOpen(false);
              }}
              selectedConversationId={selectedConversationId}
            />
          </div>
        </div>
      </aside>

      <main className="pt-16 md:ml-72">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <Routes>
            <Route path="/" element={
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Welcome to RAG Cars</h2>
                <p className="text-gray-300">Explore a car-focused Retrieval-Augmented Generation assistant. Upload manuals, specs, and ask questions.</p>
                <p className="text-gray-400">Create a conversation and upload documents to get started.</p>
              </div>
            } />
            <Route path="/chat" element={
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-steel/40 border border-steel rounded-xl p-4 sm:p-6 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium">PDF Documents</h3>
                  </div>
                  <PDFUpload 
                    conversationId={selectedConversationId} 
                    onPDFUploaded={() => fetchPDFs()}
                    pdfList={pdfList}
                    loading={loadingPdfs}
                    error={pdfError}
                  />
                </div>
                <div className="bg-steel/40 border border-steel rounded-xl p-4 sm:p-6 shadow-card">
                  <ChatInterface conversationId={selectedConversationId} />
                </div>
              </div>
            } />
            <Route path="/pdfs" element={<PDFsPage />} />
            <Route path="/price" element={<PricePredictPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/settings" element={<ProviderConfig />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
