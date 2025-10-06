import { useEffect, useState } from 'react';
import { apiService, PDFInfo } from '../services/api';
import { Box, Typography, Paper, List, ListItem, ListItemText, IconButton, CircularProgress, Tooltip, Button, Alert } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function PDFsPage() {
  const [items, setItems] = useState<PDFInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<PDFInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = event.currentTarget; // capture before async awaits
    const files = inputEl.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      await apiService.uploadPDF(file);
      setUploadSuccess(`Successfully uploaded ${file.name}`);
      await refresh();
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (e) {
      console.error('Failed to upload global PDF', e);
      setUploadError('Failed to upload PDF');
    } finally {
      setUploading(false);
      // reset input value so same file can be uploaded again if desired
      if (inputEl) inputEl.value = '';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Global PDFs</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">Upload a PDF visible to all conversations</Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFileIcon />}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Global PDF'}
          <input
            type="file"
            hidden
            accept="application/pdf"
            onChange={handleFileUpload}
          />
        </Button>
      </Box>

      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>
      )}
      {uploadSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>{uploadSuccess}</Alert>
      )}
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



