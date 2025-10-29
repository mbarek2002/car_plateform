import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import CarDetailPage from './pages/CarDetailPage';
import RecommendationsPage from './pages/RecommendationsPage';
import RecommendationSearchPage from './pages/RecommendationSearchPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function AppShell() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [pdfList, setPdfList] = useState<PDFInfo[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  // const { isAuthenticated } = useAuth();

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId]);


  return (
    <div className="min-h-screen bg-white text-slate-800 dark:bg-asphalt dark:text-gray-100 flex flex-col">
      <Navbar />
      <main className="pt-16 flex-1">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6">
                  <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8 text-center">
                      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        AI Chat Assistant
                      </h1>
                      <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        Upload your car documents and chat with our AI to get instant answers about maintenance, specifications, and more.
                      </p>
                    </div>

                    {/* Main Chat Interface */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
                      {/* Conversations Sidebar */}
                      <div className="xl:col-span-1">
                        <div className="h-full">
                          <ConversationList 
                            onSelectConversation={(id) => setSelectedConversationId(id)}
                            selectedConversationId={selectedConversationId}
                          />
                        </div>
                      </div>

                      {/* Main Chat Area */}
                      <div className="xl:col-span-3 space-y-6">
                        {/* PDF Upload Section */}
                        <div className="h-1/3">
                          <PDFUpload 
                            conversationId={selectedConversationId} 
                            onPDFUploaded={() => fetchPDFs()}
                            pdfList={pdfList}
                            loading={loadingPdfs}
                            error={pdfError}
                          />
                        </div>

                        {/* Chat Interface */}
                        <div className="h-2/3">
                          <ChatInterface conversationId={selectedConversationId} />
                        </div>
                      </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ask Questions</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300">Get instant answers about your car documents</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Upload PDFs</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300">Add your car manuals and documents</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Smart Conversations</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300">AI remembers context across messages</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/pdfs" element={
              <ProtectedRoute>
                <PDFsPage />
              </ProtectedRoute>
            } />
            <Route path="/price" element={<PricePredictPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/settings" element={
              <ProtectedRoute>
                <ProviderConfig />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/cars/:carId" element={<CarDetailPage />} />
            <Route path="/recommendations/:carId" element={<RecommendationsPage />} />
            <Route path="/recommendation-search" element={<RecommendationSearchPage />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
