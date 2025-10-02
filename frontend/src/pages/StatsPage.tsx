import { useEffect, useState } from 'react';
import { apiService, StatsResponse } from '../services/api';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const s = await apiService.stats();
      setStats(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Statistics</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        {loading || !stats ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <Metric title="Total Conversations" value={stats.total_conversations} />
            <Metric title="Total PDFs" value={stats.total_pdfs} />
            <Metric title="Global PDFs" value={stats.global_pdfs} />
            <Metric title="Conversation PDFs" value={stats.conversation_pdfs} />
          </Box>
        )}
      </Paper>
    </Box>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
      <Typography variant="h4">{value}</Typography>
    </Paper>
  );
}


