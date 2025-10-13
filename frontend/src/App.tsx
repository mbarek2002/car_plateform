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
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';

function AppShell() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [pdfList, setPdfList] = useState<PDFInfo[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const location = useLocation();

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


  return (
    <div className="min-h-screen bg-white text-slate-800 dark:bg-asphalt dark:text-gray-100 flex flex-col">
      <Navbar />
      <main className="pt-16 flex-1">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="card p-4 sm:p-6">
                    <h3 className="text-lg font-medium mb-3">Conversations</h3>
                    <div className="max-h-[70vh] overflow-y-auto">
                      <ConversationList 
                        onSelectConversation={(id) => setSelectedConversationId(id)}
                        selectedConversationId={selectedConversationId}
                      />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <div className="card p-4 sm:p-6">
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
                  <div className="card p-4 sm:p-6">
                    <ChatInterface conversationId={selectedConversationId} />
                  </div>
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
      <Footer />
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
