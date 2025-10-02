import React, { useState } from 'react';
import { 
  Button, Box, Typography, CircularProgress, 
  List, ListItem, ListItemText, Paper, Alert
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
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
      setUploadError('Failed to upload PDF');
      console.error(err);
    } finally {
      setUploading(false);
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
              <ListItem key={pdf.pdf_id}>
                <ListItemText
                  primary={pdf.filename}
                  secondary={`Uploaded: ${new Date(pdf.uploaded_at).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default PDFUpload;