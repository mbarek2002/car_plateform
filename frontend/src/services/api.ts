import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface Conversation {
  conversation_id: string;
  title: string;
  created_at: string;
}

export interface PDFInfo {
  pdf_id: string;
  filename: string;
  conversation_id?: string | null;
  uploaded_at: string;
}

export interface ProviderConfig {
  llm_provider?: string | null;
  embedding_provider?: string | null;
  vectordb_provider?: string | null;
}

export interface QueryResponse {
  answer: string;
  conversation_id?: string | null;
}

export interface StatsResponse {
  total_conversations: number;
  total_pdfs: number;
  global_pdfs: number;
  conversation_pdfs: number;
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30 seconds timeout
});

// Add retry mechanism
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on 4xx errors (client errors)
      if (axios.isAxiosError(error) && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (i === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError;
};

export const apiService = {
  // Health
  healthCheck: async (): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.get('/health');
    return data;
  },

  // Providers config
  configureProviders: async (config: ProviderConfig) => {
    const { data } = await apiClient.post('/config/providers', config);
    return data as { message: string; config: ProviderConfig };
  },

  // Conversations
  createConversation: async (title: string) => {
    return retryRequest(async () => {
      const { data } = await apiClient.post('/conversations', { title });
      return data as Conversation;
    });
  },
  listConversations: async () => {
    return retryRequest(async () => {
      const { data } = await apiClient.get('/conversations');
      console.log('Fetched conversations:', data);
      return data as Conversation[];
    });
  },
  getConversation: async (conversationId: string) => {
    return retryRequest(async () => {
      const { data } = await apiClient.get(`/conversations/${conversationId}`);
      return data as Conversation;
    });
  },
  deleteConversation: async (conversationId: string) => {
    const { data } = await apiClient.delete(`/conversations/${conversationId}`);
    return data as { message: string };
  },

  // PDFs
  uploadPDF: async (file: File, conversationId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) formData.append('conversation_id', conversationId);

    const { data } = await apiClient.post('/pdfs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data as {
      pdf_id: string;
      filename: string;
      conversation_id?: string | null;
      message: string;
    };
  },
  uploadPDFBatch: async (files: File[], conversationId?: string) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    if (conversationId) formData.append('conversation_id', conversationId);

    const { data } = await apiClient.post('/pdfs/upload-batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data as {
      results: Array<{ filename: string; status: string; pdf_id?: string; error?: string }>;
    };
  },
  getConversationPdfs: async (conversationId: string) => {
    return retryRequest(async () => {
      const { data } = await apiClient.get(`/pdfs/conversation/${conversationId}`);
      return data as PDFInfo[];
    });
  },
  getGlobalPdfs: async () => {
    return retryRequest(async () => {
      const { data } = await apiClient.get('/pdfs/global');
      return data as PDFInfo[];
    });
  },
  getPdfInfo: async (pdfId: string) => {
    const { data } = await apiClient.get(`/pdfs/${pdfId}`);
    return data as PDFInfo;
  },
  deletePdf: async (pdfId: string) => {
    const { data } = await apiClient.delete(`/pdfs/${pdfId}`);
    return data as { message: string };
  },

  // Query
  queryRAG: async (question: string, conversationId?: string, topK: number = 3) => {
    return retryRequest(async () => {
      const { data } = await apiClient.post('/query', {
        question,
        conversation_id: conversationId,
        top_k: topK,
      });
      return data as QueryResponse;
    });
  },

  // Stats
  stats: async () => {
    const { data } = await apiClient.get('/stats');
    return data as StatsResponse;
  },
};