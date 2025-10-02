import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

export default function HealthPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiService.healthCheck();
      setStatus(res.status);
      setMessage(res.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Health</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box>
            <Typography>Status: {status || '-'}</Typography>
            <Typography>Message: {message || '-'}</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}



