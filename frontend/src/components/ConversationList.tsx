import React, { useState, useEffect } from 'react';
import { apiService, Conversation } from '../services/api';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  onSelectConversation, 
  selectedConversationId 
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await apiService.listConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleCreateConversation = async () => {
    if (!newConversationTitle.trim()) return;
    try {
      setCreating(true);
      setError(null);
      const newConversation = await apiService.createConversation(newConversationTitle);
      setNewConversationTitle('');
      setOpenDialog(false);
      await fetchConversations();
      onSelectConversation(newConversation.conversation_id);
    } catch (err) {
      setError('Failed to create conversation');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-6">
        <div className="h-5 w-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Conversations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{conversations.length} active</p>
            </div>
          </div>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
            onClick={() => setOpenDialog(true)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No conversations yet</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Start a new conversation to begin chatting with your documents</p>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => setOpenDialog(true)}
                >
                  Create First Chat
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation, index) => (
              <div
                key={conversation.conversation_id}
                className={`group relative animate-fadeInUp ${
                  selectedConversationId === conversation.conversation_id ? 'z-10' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  onClick={() => onSelectConversation(conversation.conversation_id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group-hover:shadow-lg interactive-hover ${
                    selectedConversationId === conversation.conversation_id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl transform scale-105'
                      : 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedConversationId === conversation.conversation_id 
                            ? 'bg-white' 
                            : 'bg-green-500'
                        }`}></div>
                        <h3 className={`text-sm font-semibold truncate ${
                          selectedConversationId === conversation.conversation_id
                            ? 'text-white'
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {conversation.title}
                        </h3>
                      </div>
                      <div className={`text-xs ${
                        selectedConversationId === conversation.conversation_id
                          ? 'text-blue-100'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {new Date(conversation.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    {selectedConversationId === conversation.conversation_id && (
                      <div className="ml-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !creating && setOpenDialog(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 animate-fadeInUp">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">New Conversation</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Start a new chat session</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Conversation Title
                </label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                  placeholder="e.g., Car Maintenance Questions"
                  value={newConversationTitle}
                  onChange={(e) => setNewConversationTitle(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-all duration-200 font-medium"
                  onClick={() => setOpenDialog(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    creating || !newConversationTitle.trim()
                      ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                  onClick={handleCreateConversation}
                  disabled={creating || !newConversationTitle.trim()}
                >
                  {creating ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </span>
                  ) : (
                    'Create Chat'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;