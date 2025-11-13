import React, { useState, useEffect, useRef } from 'react';
import { apiService, MessageResponseApi } from '../services/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp?: Date;
}

interface ChatInterfaceProps {
  conversationId?: string;
  mode?: 'chat' | 'prediction';
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId, mode = 'chat' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef<boolean>(false);

  useEffect(() => {
    setMessages([]);
    setError(null);
    setInputText('');

    const loadHistory = async () => {
      if (!conversationId) return;
      
      setLoadingMessages(true);
      try {
        const history: MessageResponseApi[] = await apiService.listMessages(conversationId, 100);
        const mapped: Message[] = history.map((m, idx) => ({
          id: `${m.created_at}-${idx}`,
          text: m.content,
          isUser: m.role === 'user',
          timestamp: new Date(m.created_at)
        }));
        shouldAutoScrollRef.current = false; // do not scroll on initial load
        setMessages(mapped);
        setError(null);
      } catch (e) {
        console.error('Failed to load conversation history', e);
        setError('Failed to load conversation history. Please try again.');
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadHistory();
  }, [conversationId]);

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
      shouldAutoScrollRef.current = false;
    }
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    const questionText = inputText;
    shouldAutoScrollRef.current = true;
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (mode === 'prediction' && conversationId) {
        // Use chat endpoint for prediction mode with conversation context
        response = await apiService.chat(conversationId, questionText);
      } else {
        // Use query endpoint for regular chat
        response = await apiService.queryRAG(questionText, conversationId);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        isUser: false,
        timestamp: new Date()
      };

      shouldAutoScrollRef.current = true;
      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Request failed. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }
      setError(errorMessage);
      const errorBotMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: `There was a problem: ${errorMessage}`,
        isUser: false,
        timestamp: new Date()
      };
      shouldAutoScrollRef.current = true;
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col bg-white/90 dark:bg-slate-800/90 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur">
      {/* Chat Header - Simplified */}
      <div className="bg-white/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {mode === 'prediction' ? 'Price Assistant' : 'AI Chat'}
          </h3>
        </div>
      </div>

      {/* Messages Area - Simplified */}
      <div className="overflow-y-auto max-h-[60vh] p-4 space-y-3 bg-transparent custom-scrollbar">
        {loadingMessages ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                {mode === 'prediction' ? 'Welcome to Price Assistant' : 'Start a Conversation'}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                {mode === 'prediction' 
                  ? 'Ask me about car prices, market trends, or get predictions.' 
                  : 'Upload your car documents and ask me anything about them.'
                }
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Simplified Message Bubble */}
              <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] shadow-sm ${
                message.isUser
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
              }`}>
                <div className="whitespace-pre-wrap text-sm">
                  {message.text}
                </div>
                {message.timestamp && (
                  <div className={`text-xs mt-1 ${
                    message.isUser ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Simplified Typing Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-2.5 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Simplified Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            {conversationId && (
              <button
                onClick={() => {
                  setError(null);
                  const loadHistory = async () => {
                    setLoadingMessages(true);
                    try {
                      const history: MessageResponseApi[] = await apiService.listMessages(conversationId, 100);
                      const mapped: Message[] = history.map((m, idx) => ({
                        id: `${m.created_at}-${idx}`,
                        text: m.content,
                        isUser: m.role === 'user',
                        timestamp: new Date(m.created_at)
                      }));
                      setMessages(mapped);
                      setError(null);
                    } catch (e) {
                      console.error('Failed to load conversation history', e);
                      setError('Failed to load conversation history. Please try again.');
                    } finally {
                      setLoadingMessages(false);
                    }
                  };
                  loadHistory();
                }}
                className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                Retry
              </button>
            )}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Simplified Input Area */}
      <div className="bg-white/80 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 p-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
            placeholder={mode === 'prediction' ? "Ask about car prices..." : "Ask a question..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`${
              loading || !inputText.trim()
                ? 'bg-gray-300 dark:bg-slate-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } px-4 h-10 rounded-full flex items-center space-x-2`}
            onClick={handleSendMessage}
            disabled={loading || !inputText.trim()}
            aria-label="Send message"
          >
            <svg 
              className="w-4 h-4 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="text-sm text-white font-medium">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;