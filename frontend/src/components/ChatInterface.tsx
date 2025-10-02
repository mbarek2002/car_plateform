import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Paper, Typography, 
  CircularProgress, Divider, IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { apiService } from '../services/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatInterfaceProps {
  conversationId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear messages when conversation changes
  useEffect(() => {
    setMessages([]);
    setError(null);
    setInputText('');
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true
    };

    const questionText = inputText;
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.queryRAG(questionText, conversationId);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        isUser: false
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      let errorMessage = 'Failed to get response from the RAG system';
      
      // Provide more specific error messages
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }
      
      setError(errorMessage);
      
      // Add error message to chat
      const errorBotMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: `Sorry, I encountered an error: ${errorMessage}`,
        isUser: false
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          flex: 1, 
          mb: 2, 
          p: 2, 
          overflow: 'auto',
          bgcolor: 'background.default',
          minHeight: '400px',
          maxHeight: '60vh'
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography color="text.secondary">
              Ask a question about your documents
            </Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  bgcolor: message.isUser ? 'primary.light' : 'background.paper',
                  color: message.isUser ? 'primary.contrastText' : 'text.primary'
                }}
              >
                <Typography>{message.text}</Typography>
              </Paper>
            </Box>
          ))
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {error && (
          <Box sx={{ mt: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
      </Paper>

      <Divider />
      
      <Box sx={{ display: 'flex', mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask a question..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          multiline
          maxRows={3}
        />
        <IconButton 
          color="primary" 
          onClick={handleSendMessage} 
          disabled={loading || !inputText.trim()}
          sx={{ ml: 1 }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInterface;