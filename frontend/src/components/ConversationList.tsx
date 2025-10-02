import React, { useState, useEffect } from 'react';
import { 
  List, ListItem, ListItemText, ListItemButton, 
  Typography, Button, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions, Box, CircularProgress 
} from '@mui/material';
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
      
      // Refresh conversations and auto-select the new one
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
    return <CircularProgress />;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6">Conversations</Typography>
        <Button variant="contained" size="small" onClick={() => setOpenDialog(true)}>
          New
        </Button>
      </Box>
      
      {error && <Typography color="error" sx={{ p: 2 }}>{error}</Typography>}
      
      <List>
        {conversations.length === 0 ? (
          <ListItem>
            <ListItemText primary="No conversations yet" />
          </ListItem>
        ) : (
          conversations.map((conversation) => (
            <ListItemButton
              key={conversation.conversation_id}
              selected={selectedConversationId === conversation.conversation_id}
              onClick={() => onSelectConversation(conversation.conversation_id)}
            >
              <ListItemText 
                primary={conversation.title} 
                secondary={new Date(conversation.created_at).toLocaleString()} 
              />
            </ListItemButton>
          ))
        )}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Conversation Title"
            fullWidth
            value={newConversationTitle}
            onChange={(e) => setNewConversationTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={creating}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateConversation} 
            disabled={creating || !newConversationTitle.trim()}
          >
            {creating ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConversationList;