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
    <div className="w-full">
      <div className="flex items-center justify-between p-2">
        <h2 className="text-sm font-semibold text-white/90">Conversations</h2>
        <button
          className="px-3 py-1.5 text-sm rounded-md bg-brand hover:bg-brand-dark text-white"
          onClick={() => setOpenDialog(true)}
        >
          New
        </button>
      </div>

      {error && <p className="text-red-400 text-sm px-2 pb-2">{error}</p>}

      <ul className="divide-y divide-steel/60">
        {conversations.length === 0 ? (
          <li className="px-3 py-3 text-sm text-gray-400">No conversations yet</li>
        ) : (
          conversations.map((conversation) => (
            <li key={conversation.conversation_id}>
              <button
                onClick={() => onSelectConversation(conversation.conversation_id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedConversationId === conversation.conversation_id
                    ? 'bg-brand/20 text-white'
                    : 'hover:bg-steel/50 text-gray-200'
                }`}
              >
                <div className="text-sm font-medium truncate">{conversation.title}</div>
                <div className="text-xs text-gray-400">
                  {new Date(conversation.created_at).toLocaleString()}
                </div>
              </button>
            </li>
          ))
        )}
      </ul>

      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !creating && setOpenDialog(false)} />
          <div className="relative bg-asphalt border border-steel rounded-xl p-5 w-full max-w-md shadow-card">
            <h3 className="text-lg font-semibold mb-3">Create New Conversation</h3>
            <input
              className="w-full rounded-md bg-steel/60 border border-steel px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Conversation Title"
              value={newConversationTitle}
              onChange={(e) => setNewConversationTitle(e.target.value)}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-1.5 text-sm rounded-md bg-steel/70 text-gray-200 hover:bg-steel"
                onClick={() => setOpenDialog(false)}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 text-sm rounded-md bg-brand text-white hover:bg-brand-dark disabled:opacity-60"
                onClick={handleCreateConversation}
                disabled={creating || !newConversationTitle.trim()}
              >
                {creating ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                    Creating
                  </span>
                ) : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;