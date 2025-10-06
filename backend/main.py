from fastapi import FastAPI, UploadFile, File, HTTPException, Form , Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List 
import shutil
import os
from pathlib import Path

from core.rag_system import RAGSystem
from src.schemas import (
    ChatRequest, ChatResponse, ConversationCreate, ConversationResponse, MessageCreate, MessageResponse, QueryRequest, 
    QueryResponse, PDFUploadResponse, PDFInfo, ProviderConfig, ErrorResponse , PredictionOutput , PredictionInput
)

from src.services.prediction_service import PredictionService
from src.db.connection import get_database


# Initialize FastAPI
app = FastAPI(
    title="RAG System API",
    description="RAG system with factory pattern for LLM, Embeddings, and Vector DB",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG system
rag_system: Optional[RAGSystem] = None

# Temporary upload directory
UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# ==================== STARTUP/SHUTDOWN ====================

@app.on_event("startup")
async def startup_event():
    global rag_system
    rag_system = RAGSystem()

@app.on_event("shutdown")
async def shutdown_event():
    # Cleanup temp files
    if UPLOAD_DIR.exists():
        shutil.rmtree(UPLOAD_DIR)

# ==================== HEALTH CHECK ====================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "RAG System is running"}

# ==================== CONFIGURATION ====================

@app.post("/config/providers", tags=["Configuration"])
async def configure_providers(config: ProviderConfig):
    """Reconfigure LLM, Embedding, and Vector DB providers"""
    try:
        global rag_system
        rag_system = RAGSystem(
            llm_provider=config.llm_provider,
            embedding_provider=config.embedding_provider,
            vectordb_provider=config.vectordb_provider
        )
        return {
            "message": "Providers updated successfully",
            "config": config.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================== CONVERSATION ENDPOINTS ====================

@app.post("/conversations", response_model=ConversationResponse, tags=["Conversations"])
async def create_conversation(conversation: ConversationCreate):
    """Create a new conversation"""
    try:
        conv_id = rag_system.create_conversation(conversation.title)
        conv_data = rag_system.conversation_service.get(conv_id)
        return ConversationResponse(
            conversation_id=conv_data["conversation_id"],
            title=conv_data["title"],
            created_at=conv_data["created_at"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations", response_model=List[ConversationResponse], tags=["Conversations"])
async def list_conversations():
    """List all conversations"""
    try:
        conversations = rag_system.conversation_service.list_all()
        return [
            ConversationResponse(
                conversation_id=conv["conversation_id"],
                title=conv["title"],
                created_at=conv["created_at"]
            )
            for conv in conversations
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations/{conversation_id}", response_model=ConversationResponse, tags=["Conversations"])
async def get_conversation(conversation_id: str):
    """Get a specific conversation"""
    try:
        conv = rag_system.conversation_service.get(conversation_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return ConversationResponse(
            conversation_id=conv["conversation_id"],
            title=conv["title"],
            created_at=conv["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/conversations/{conversation_id}", tags=["Conversations"])
async def delete_conversation(conversation_id: str):
    """Delete a conversation and its associated PDFs"""
    try:
        rag_system.conversation_service.delete(conversation_id)
        return {"message": "Conversation deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== PDF ENDPOINTS ====================

@app.post("/pdfs/upload", response_model=PDFUploadResponse, tags=["PDFs"])
async def upload_pdf(
    file: UploadFile = File(...),
    conversation_id: Optional[str] = Form(None)
):
    """Upload a PDF file (global or to specific conversation)"""
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Save temporarily
        temp_path = UPLOAD_DIR / file.filename
        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process PDF
        pdf_id = rag_system.upload_pdf(str(temp_path), conversation_id)
        
        print("helloooo")
        # Cleanup
        temp_path.unlink()
        
        return PDFUploadResponse(
            pdf_id=pdf_id,
            filename=file.filename,
            conversation_id=conversation_id,
            message="PDF uploaded and processed successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/pdfs/conversation/{conversation_id}", response_model=List[PDFInfo], tags=["PDFs"])
async def get_conversation_pdfs(conversation_id: str):
    """Get all PDFs for a specific conversation"""
    try:
        pdfs = rag_system.get_conversation_pdfs(conversation_id)
        return [
            PDFInfo(
                pdf_id=pdf["pdf_id"],
                filename=pdf["filename"],
                conversation_id=pdf.get("conversation_id"),
                uploaded_at=pdf["uploaded_at"]
            )
            for pdf in pdfs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/pdfs/global", response_model=List[PDFInfo], tags=["PDFs"])
async def get_global_pdfs():
    """Get all global PDFs (not associated with any conversation)"""
    try:
        pdfs = rag_system.get_global_pdfs()
        return [
            PDFInfo(
                pdf_id=pdf["pdf_id"],
                filename=pdf["filename"],
                conversation_id=pdf.get("conversation_id"),
                uploaded_at=pdf["uploaded_at"]
            )
            for pdf in pdfs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/pdfs/{pdf_id}", tags=["PDFs"])
async def get_pdf_info(pdf_id: str):
    """Get information about a specific PDF"""
    try:
        pdf = rag_system.db_manager.get_pdf(pdf_id)
        if not pdf:
            raise HTTPException(status_code=404, detail="PDF not found")
        
        return PDFInfo(
            pdf_id=pdf["pdf_id"],
            filename=pdf["filename"],
            conversation_id=pdf.get("conversation_id"),
            uploaded_at=pdf["uploaded_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/pdfs/{pdf_id}", tags=["PDFs"])
async def delete_pdf(pdf_id: str):
    """Delete a specific PDF"""
    try:
        rag_system.db_manager.delete_pdf(pdf_id)
        return {"message": "PDF deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse], tags=["Conversations"])
async def list_messages(conversation_id: str, limit: int = 20):
    try:
        msgs = rag_system.conversation_service.list_messages(conversation_id, limit=limit, ascending=True)
        return [
            MessageResponse(
                conversation_id=m["conversation_id"],
                role=m["role"],
                content=m["content"],
                created_at=m["created_at"]
            ) for m in msgs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/conversations/{conversation_id}/messages", tags=["Conversations"])
async def add_message(conversation_id: str, body: MessageCreate):
    try:
        if body.conversation_id != conversation_id:
            raise HTTPException(status_code=400, detail="conversation_id mismatch")
        rag_system.conversation_service.add_message(conversation_id, body.role, body.content)
        return {"message": "Message saved"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse, tags=["Query"])
async def chat(request: ChatRequest):
    try:
        result = rag_system.chat(
            conversation_id=request.conversation_id,
            message=request.message,
            top_k=request.top_k,
            history_limit=request.history_limit
        )
        return ChatResponse(
            conversation_id=request.conversation_id,
            user_message_id=result["user_message_id"],
            assistant_message_id=result["assistant_message_id"],
            answer=result["answer"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== QUERY ENDPOINTS ====================

@app.post("/query", response_model=QueryResponse, tags=["Query"])
async def query_rag(request: QueryRequest):
    """Query the RAG system (global or conversation-specific)"""
    try:
        answer = rag_system.query(
            question=request.question,
            conversation_id=request.conversation_id,
            top_k=request.top_k
        )
        print(QueryResponse(
            answer=answer,
            conversation_id=request.conversation_id
        ))
        return QueryResponse(
            answer=answer,
            conversation_id=request.conversation_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== BATCH ENDPOINTS ====================

@app.post("/pdfs/upload-batch", tags=["PDFs"])
async def upload_pdfs_batch(
    files: List[UploadFile] = File(...),
    conversation_id: Optional[str] = Form(None)
):
    """Upload multiple PDF files at once"""
    try:
        results = []
        for file in files:
            if not file.filename.endswith('.pdf'):
                results.append({
                    "filename": file.filename,
                    "status": "failed",
                    "error": "Not a PDF file"
                })
                continue
            
            try:
                temp_path = UPLOAD_DIR / file.filename
                with temp_path.open("wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                
                pdf_id = rag_system.upload_pdf(str(temp_path), conversation_id)
                temp_path.unlink()
                
                results.append({
                    "filename": file.filename,
                    "pdf_id": pdf_id,
                    "status": "success"
                })
            except Exception as e:
                results.append({
                    "filename": file.filename,
                    "status": "failed",
                    "error": str(e)
                })
        
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== STATISTICS ENDPOINTS ====================

@app.get("/stats", tags=["Statistics"])
async def get_statistics():
    """Get system statistics"""
    try:
        conversations = rag_system.conversation_service.list_all()
        global_pdfs = rag_system.get_global_pdfs()
        
        total_pdfs = rag_system.db_manager.pdfs.count_documents({})
        
        return {
            "total_conversations": len(conversations),
            "total_pdfs": total_pdfs,
            "global_pdfs": len(global_pdfs),
            "conversation_pdfs": total_pdfs - len(global_pdfs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# ==================== ERROR HANDLERS ====================
@app.post("/predict", response_model=PredictionOutput ,  tags=["price prediction"])
def predict(data: PredictionInput, db=Depends(get_database)):
    print(data)
    service = PredictionService(db)
    return service.predict(data)

@app.get("/predictions", tags=["price prediction"])
def get_predictions(db=Depends(get_database)):
    service = PredictionService(db)
    return service.get_all_predictions()


# ==================== ERROR HANDLERS ====================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

# ==================== RUN SERVER ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# ==================== main.py ====================
from core.rag_system import RAGSystem

def main():
    # Initialize RAG system with default providers from config
    # rag = RAGSystem()
    
    # Or specify providers explicitly
    rag = RAGSystem(
        llm_provider="gemini",
        embedding_provider="huggingface",
        vectordb_provider="chroma"
    )
    
    # Create conversation
    conv_id = rag.create_conversation("Project Docs")
    print(f"Created conversation: {conv_id}")
    
    # Upload PDF to conversation
    pdf_id = rag.upload_pdf("document.pdf", conversation_id=conv_id)
    print(f"Uploaded PDF: {pdf_id}")
    
    # Upload global PDF
    global_pdf_id = rag.upload_pdf("global.pdf")
    print(f"Uploaded global PDF: {global_pdf_id}")
    
    # Query conversation
    response = rag.query("What is this about?", conversation_id=conv_id)
    print(f"Response: {response}")
    
    # Query globally
    response = rag.query("General question")
    print(f"Global Response: {response}")

if __name__ == "__main__":
    main()
