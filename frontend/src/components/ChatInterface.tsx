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
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages([]);
    setError(null);
    setInputText('');

    const loadHistory = async () => {
      if (!conversationId) return;
      try {
        const history: MessageResponseApi[] = await apiService.listMessages(conversationId, 100);
        const mapped: Message[] = history.map((m, idx) => ({
          id: `${m.created_at}-${idx}`,
          text: m.content,
          isUser: m.role === 'user',
          timestamp: new Date(m.created_at)
        }));
        setMessages(mapped);
      } catch (e) {
        // non-blocking
        console.error('Failed to load conversation history', e);
      }
    };

    loadHistory();
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
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

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Failed to get response from the RAG system';
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
        text: `Sorry, I encountered an error: ${errorMessage}`,
        isUser: false,
        timestamp: new Date()
      };
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 min-h-[320px] max-h-[60vh] p-4 card">
        {messages.length === 0 ? (
          <div className="h-full grid place-items-center text-gray-400 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse-slow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm">
                {mode === 'prediction' 
                  ? 'Ask about car prices, market trends, or vehicle valuations' 
                  : 'Ask a question about your documents'
                }
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-slide-in-right`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`px-4 py-3 rounded-2xl max-w-[80%] shadow-lg text-sm whitespace-pre-wrap hover-lift ${
                  message.isUser
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                    : 'bg-slate-700/50 text-gray-100 border border-slate-600/50 rounded-bl-md'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2 bg-slate-800/50 px-4 py-2 rounded-full">
              <div className="spinner" />
              <span className="text-sm text-gray-300">AI is thinking...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-4 flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            className="input-primary resize-none pr-12"
            placeholder={mode === 'prediction' ? "Ask about car prices or market trends..." : "Ask a question..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
        </div>
        <button
          className="btn-primary h-12 w-12 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
          onClick={handleSendMessage}
          disabled={loading || !inputText.trim()}
          aria-label="Send"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3.4 20.6 22 12 3.4 3.4l.1 6.9L15 12 3.5 13.7l-.1 6.9z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;