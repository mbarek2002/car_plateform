import React, { useState } from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem,
  Button, Typography, Alert, SelectChangeEvent
} from '@mui/material';
import { apiService, ProviderConfig as ProviderConfigType } from '../services/api';

const ProviderConfig: React.FC = () => {
  const [config, setConfig] = useState<ProviderConfigType>({
    llm_provider: 'gemini',
    embedding_provider: 'gemini',
    vectordb_provider: 'chroma'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      await apiService.configureProviders(config);
      setSuccess('Provider configuration updated successfully');
    } catch (err) {
      console.error(err);
      setError('Failed to update provider configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Configure Providers
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: 'grey.300', '&.Mui-focused': { color: 'grey.100' } }}>LLM Provider</InputLabel>
        <Select
          name="llm_provider"
          value={config.llm_provider || ''}
          label="LLM Provider"
          onChange={handleChange}
          sx={{
            color: 'grey.100',
            backgroundColor: 'rgba(255,255,255,0.04)',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: 'rgba(15,23,42,0.95)',
                color: 'grey.100',
                '& .MuiMenuItem-root': { '&.Mui-selected': { bgcolor: 'rgba(59,130,246,0.2)' } },
              },
            },
          }}
        >
          <MenuItem value="gemini">Gemini</MenuItem>
          <MenuItem value="huggingface">HuggingFace</MenuItem>
          <MenuItem value="ngrok">Ngrok</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: 'grey.300', '&.Mui-focused': { color: 'grey.100' } }}>Embedding Provider</InputLabel>
        <Select
          name="embedding_provider"
          value={config.embedding_provider || ''}
          label="Embedding Provider"
          onChange={handleChange}
          sx={{
            color: 'grey.100',
            backgroundColor: 'rgba(255,255,255,0.04)',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: 'rgba(15,23,42,0.95)',
                color: 'grey.100',
                '& .MuiMenuItem-root': { '&.Mui-selected': { bgcolor: 'rgba(59,130,246,0.2)' } },
              },
            },
          }}
        >
          <MenuItem value="gemini">Gemini</MenuItem>
          <MenuItem value="huggingface">HuggingFace</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: 'grey.300', '&.Mui-focused': { color: 'grey.100' } }}>Vector DB Provider</InputLabel>
        <Select
          name="vectordb_provider"
          value={config.vectordb_provider || ''}
          label="Vector DB Provider"
          onChange={handleChange}
          sx={{
            color: 'grey.100',
            backgroundColor: 'rgba(255,255,255,0.04)',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: 'rgba(15,23,42,0.95)',
                color: 'grey.100',
                '& .MuiMenuItem-root': { '&.Mui-selected': { bgcolor: 'rgba(59,130,246,0.2)' } },
              },
            },
          }}
        >
          <MenuItem value="chroma">Chroma</MenuItem>
          <MenuItem value="pinecone">Pinecone</MenuItem>
        </Select>
      </FormControl>

      <Button 
        variant="contained" 
        onClick={handleSubmit} 
        disabled={loading}
        fullWidth
      >
        {loading ? 'Updating...' : 'Update Configuration'}
      </Button>
    </Box>
  );
};

export default ProviderConfig;