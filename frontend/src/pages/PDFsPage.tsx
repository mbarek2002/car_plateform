import { useEffect, useState } from 'react';
import { apiService, PDFInfo } from '../services/api';
import { Box, Typography, Paper, List, ListItem, ListItemText, IconButton, CircularProgress, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function PDFsPage() {
  const [items, setItems] = useState<PDFInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<PDFInfo | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await apiService.getGlobalPdfs();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onDelete = async (pdfId: string) => {
    await apiService.deletePdf(pdfId);
    await refresh();
  };

  const onInfo = async (pdfId: string) => {
    const d = await apiService.getPdfInfo(pdfId);
    setInfo(d);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Global PDFs</Typography>
      <Paper variant="outlined">
        {loading ? (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography color="text.secondary">No global PDFs yet.</Typography>
          </Box>
        ) : (
          <List>
            {items.map((pdf) => (
              <ListItem
                key={pdf.pdf_id}
                secondaryAction={
                  <Box>
                    <Tooltip title="Info">
                      <IconButton onClick={() => onInfo(pdf.pdf_id)}>
                        <InfoOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => onDelete(pdf.pdf_id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemText
                  primary={pdf.filename}
                  secondary={`Uploaded: ${new Date(pdf.uploaded_at).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {info && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Selected PDF</Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography>Filename: {info.filename}</Typography>
            <Typography>PDF ID: {info.pdf_id}</Typography>
            <Typography>Conversation: {info.conversation_id || 'Global'}</Typography>
            <Typography>Uploaded: {new Date(info.uploaded_at).toLocaleString()}</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
}



