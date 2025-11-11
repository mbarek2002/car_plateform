import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem,
  Button, Typography, Alert, SelectChangeEvent, Paper, Divider, CircularProgress, Stack
} from '@mui/material';
import { apiService, ProviderConfig as ProviderConfigType } from '../services/api';

const ProviderConfig: React.FC = () => {
  const [config, setConfig] = useState<ProviderConfigType>({
    llm_provider: '',
    embedding_provider: '',
    vectordb_provider: ''
  });
  const [initialConfig, setInitialConfig] = useState<ProviderConfigType | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingInitial(true);
        const current = await apiService.getCurrentProviders();
        if (mounted) {
          setConfig({
            llm_provider: current.llm_provider || '',
            embedding_provider: current.embedding_provider || '',
            vectordb_provider: current.vectordb_provider || ''
          });
          setInitialConfig({
            llm_provider: current.llm_provider || '',
            embedding_provider: current.embedding_provider || '',
            vectordb_provider: current.vectordb_provider || ''
          });
        }
      } catch (e) {
        console.error('Failed to load current providers', e);
        if (mounted) setError('Unable to load current configuration');
      } finally {
        if (mounted) setLoadingInitial(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isDirty = useMemo(() => {
    if (!initialConfig) return false;
    return (
      (config.llm_provider || '') !== (initialConfig.llm_provider || '') ||
      (config.embedding_provider || '') !== (initialConfig.embedding_provider || '') ||
      (config.vectordb_provider || '') !== (initialConfig.vectordb_provider || '')
    );
  }, [config, initialConfig]);

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      await apiService.configureProviders(config);
      setSuccess('Provider configuration updated successfully');
      setInitialConfig(config);
    } catch (err) {
      console.error(err);
      setError('Failed to update provider configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 1.5, sm: 2 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
          backdropFilter: 'blur(8px)',
          '&.MuiPaper-root': {
            bgcolor: 'transparent'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Provider Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose the default providers used across the application.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || loadingInitial || !isDirty}
            sx={{ minWidth: 180 }}
          >
            {loading ? 'Saving...' : !isDirty ? 'No changes' : 'Save changes'}
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loadingInitial ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>LLM Provider</InputLabel>
              <Select
                name="llm_provider"
                value={config.llm_provider || ''}
                label="LLM Provider"
                onChange={handleChange}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value="gemini">Gemini</MenuItem>
                <MenuItem value="huggingface">HuggingFace</MenuItem>
                <MenuItem value="ngrok">Ngrok</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Embedding Provider</InputLabel>
              <Select
                name="embedding_provider"
                value={config.embedding_provider || ''}
                label="Embedding Provider"
                onChange={handleChange}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value="gemini">Gemini</MenuItem>
                <MenuItem value="huggingface">HuggingFace</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 0 }}>
              <InputLabel>Vector DB Provider</InputLabel>
              <Select
                name="vectordb_provider"
                value={config.vectordb_provider || ''}
                label="Vector DB Provider"
                onChange={handleChange}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value="chroma">Chroma</MenuItem>
                <MenuItem value="pinecone">Pinecone</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ProviderConfig;