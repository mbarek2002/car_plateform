import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Container, Box, 
  Drawer, List, ListItemIcon, ListItemText, ListItemButton,
  CssBaseline, Divider, IconButton, useTheme, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import InsightsIcon from '@mui/icons-material/Insights';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HomeIcon from '@mui/icons-material/Home';
import './App.css';

import ConversationList from './components/ConversationList';
import ChatInterface from './components/ChatInterface';
import PDFUpload from './components/PDFUpload';
import ProviderConfig from './components/ProviderConfig';
import { apiService, PDFInfo } from './services/api';
import PDFsPage from './pages/PDFsPage';
import StatsPage from './pages/StatsPage';
import HealthPage from './pages/HealthPage';

const drawerWidth = 280;

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [pdfList, setPdfList] = useState<PDFInfo[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const fetchPDFs = async (conversationId?: string) => {
    // Use the provided conversationId or the current selected one
    const targetConversationId = conversationId !== undefined ? conversationId : selectedConversationId;
    
    try {
      setLoadingPdfs(true);
      setPdfError(null);
      
      let pdfs: PDFInfo[];
      if (targetConversationId) {
        pdfs = await apiService.getConversationPdfs(targetConversationId);
      } else {
        pdfs = await apiService.getGlobalPdfs();
      }
      
      // Only update if this is still the current conversation
      if (targetConversationId === selectedConversationId || (targetConversationId === undefined && selectedConversationId === undefined)) {
        setPdfList(pdfs);
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      setPdfError('Failed to load PDFs');
      setPdfList([]);
    } finally {
      setLoadingPdfs(false);
    }
  };

  useEffect(() => {
    fetchPDFs(selectedConversationId);
  }, [selectedConversationId]);

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          RAG System
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItemButton component={Link} to="/" onClick={() => isMobile && setMobileOpen(false)}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton component={Link} to="/chat" onClick={() => isMobile && setMobileOpen(false)}>
          <ListItemIcon><ChatIcon /></ListItemIcon>
          <ListItemText primary="Chat" />
        </ListItemButton>
        <ListItemButton component={Link} to="/pdfs" onClick={() => isMobile && setMobileOpen(false)}>
          <ListItemIcon><DescriptionIcon /></ListItemIcon>
          <ListItemText primary="PDFs" />
        </ListItemButton>
        <ListItemButton component={Link} to="/stats" onClick={() => isMobile && setMobileOpen(false)}>
          <ListItemIcon><InsightsIcon /></ListItemIcon>
          <ListItemText primary="Stats" />
        </ListItemButton>
        <ListItemButton component={Link} to="/health" onClick={() => isMobile && setMobileOpen(false)}>
          <ListItemIcon><FavoriteIcon /></ListItemIcon>
          <ListItemText primary="Health" />
        </ListItemButton>
        <ListItemButton component={Link} to="/settings" onClick={() => isMobile && setMobileOpen(false)}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <ConversationList 
          onSelectConversation={(id) => {
            setSelectedConversationId(id);
            if (isMobile) setMobileOpen(false);
          }}
          selectedConversationId={selectedConversationId}
        />
      </Box>
    </div>
  );

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              RAG System
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            width: { md: `calc(100% - ${drawerWidth}px)` },
            mt: '64px'
          }}
        >
          <Container maxWidth="lg">
            <Routes>
              <Route path="/" element={
                <Box>
                  <Typography variant="h4" gutterBottom>Welcome to RAG System</Typography>
                  <Typography paragraph>
                    This system allows you to upload PDF documents and ask questions about them using 
                    Retrieval-Augmented Generation technology.
                  </Typography>
                  <Typography paragraph>
                    Get started by creating a conversation and uploading documents.
                  </Typography>
                </Box>
              } />
              <Route path="/chat" element={
                <Box>
                  <PDFUpload 
                    conversationId={selectedConversationId} 
                    onPDFUploaded={() => fetchPDFs()}
                    pdfList={pdfList}
                    loading={loadingPdfs}
                    error={pdfError}
                  />
                  <Box sx={{ mt: 4 }}>
                    <ChatInterface conversationId={selectedConversationId} />
                  </Box>
                </Box>
              } />
              <Route path="/pdfs" element={<PDFsPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/health" element={<HealthPage />} />
              <Route path="/settings" element={<ProviderConfig />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;
