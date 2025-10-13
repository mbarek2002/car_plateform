import React, { useState } from 'react';
import { 
  Button, Box, Typography, CircularProgress, 
  List, ListItem, ListItemText, Paper, Alert
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { apiService, PDFInfo } from '../services/api';

interface PDFUploadProps {
  conversationId?: string;
  onPDFUploaded: () => void;
  pdfList: PDFInfo[];
  loading: boolean;
  error?: string | null;
}

const PDFUpload: React.FC<PDFUploadProps> = ({ 
  conversationId, 
  onPDFUploaded,
  pdfList,
  loading,
  error: externalError
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [info, setInfo] = useState<PDFInfo | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    setUploadError(null);
    setSuccess(null);

    try {
      await apiService.uploadPDF(file, conversationId);
      setSuccess(`Successfully uploaded ${file.name}`);
      onPDFUploaded();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const anyErr = err as any;
      const msg = anyErr?.response?.data?.detail || anyErr?.message || 'Failed to upload PDF';
      setUploadError(msg);
      console.error('Upload error', err);
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (pdfId: string) => {
    try {
      await apiService.deletePdf(pdfId);
      await onPDFUploaded();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || 'Delete failed';
      setUploadError(msg);
    }
  };

  const onInfo = async (pdfId: string) => {
    try {
      const d = await apiService.getPdfInfo(pdfId);
      setInfo(d);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || 'Failed to load info';
      setUploadError(msg);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">PDF Documents</Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFileIcon />}
          disabled={uploading}
        >
          Upload PDF
          <input
            type="file"
            hidden
            accept="application/pdf"
            onChange={handleFileUpload}
          />
        </Button>
      </Box>

      {uploading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
          <CircularProgress size={24} />
          <Typography>Uploading...</Typography>
        </Box>
      )}

      {(uploadError || externalError) && (
        <Alert severity="error" sx={{ my: 2 }}>
          {uploadError || externalError}
        </Alert>
      )}
      {success && <Alert severity="success" sx={{ my: 2 }}>{success}</Alert>}

      <Paper variant="outlined" sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : pdfList.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">No PDFs uploaded yet</Typography>
          </Box>
        ) : (
          <List>
            {pdfList.map((pdf) => (
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
};

export default PDFUpload;