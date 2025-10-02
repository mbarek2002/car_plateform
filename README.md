# RAG System

A modular RAG system with FastAPI backend and React frontend. Upload PDFs, create conversations, and query documents using AI.

## ✨ Features

- Multi-provider support (Gemini, HuggingFace, ChromaDB, Pinecone)
- Conversation-based document management
- PDF processing with text extraction
- Real-time chat interface
- Docker containerization
- Modern React UI with Material-UI

## 🏗️ Architecture

**Backend**: FastAPI with factory pattern for LLM/embedding/vector DB providers  
**Frontend**: React + TypeScript + Material-UI  
**Database**: MongoDB for documents, ChromaDB/Pinecone for vectors

**Supported Providers**:
- **LLM**: Gemini, HuggingFace
- **Embeddings**: Gemini, HuggingFace  
- **Vector DB**: ChromaDB, Pinecone

## 🚀 Quick Start

### Docker (Recommended)
```bash
# Clone and setup
git clone <repository-url>
cd rag_system

# Configure environment
cp .env.example .env
# Edit .env with your API keys (GEMINI_API_KEY, PINECONE_API_KEY)

# Start services
docker-compose up -d
```

**Access**: Frontend at http://localhost:3000, API at http://localhost:8000

### Local Development
```bash
# Backend
cd backend
pip install -r requirements.txt
export GEMINI_API_KEY=your_key
python main.py

# Frontend  
cd frontend
npm install && npm start
```

## 💡 Usage

1. **Create Conversation** → **Upload PDFs** → **Ask Questions**
2. Access web UI at http://localhost:3000
3. API docs available at http://localhost:8000/docs

### Key API Endpoints
```
POST /conversations          # Create conversation
POST /pdfs/upload           # Upload PDF
POST /query                 # Ask questions
GET /health                 # Health check
```

## ⚙️ Configuration

**Environment Variables**:
```env
GEMINI_API_KEY=your_key
LLM_PROVIDER=gemini
EMBEDDING_PROVIDER=huggingface
VECTORDB_PROVIDER=chroma
```

**Switch Providers** via API:
```json
{
  "llm_provider": "gemini",
  "embedding_provider": "huggingface",
  "vectordb_provider": "chroma"
}
```

## 🔧 Development

**Add New Provider**:
1. Implement interface in `implementations/`
2. Register in factory
3. Update settings

**Testing**:
```bash
cd backend && python -m pytest
cd frontend && npm test
```

---

Built with FastAPI, React, and modern AI technologies.
