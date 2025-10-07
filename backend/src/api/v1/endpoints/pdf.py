from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException, Form , Depends , APIRouter
from src.schemas.pdf_schema import PDFUploadResponse , PDFInfo 
from src.services.conversation_service import ConversationService
from core.rag_system import RAGSystem
from typing import Optional 
import shutil
from pathlib import Path

router = APIRouter(prefix="/pdfs", tags=["pdfs"])
rag_system = RAGSystem()

# Temporary upload directory
UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload", response_model=PDFUploadResponse)
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

@router.get("/pdfs/conversation/{conversation_id}", response_model=List[PDFInfo])
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

@router.get("/global", response_model=List[PDFInfo])
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

@router.get("/{pdf_id}")
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

@router.delete("/{pdf_id}")
async def delete_pdf(pdf_id: str):
    """Delete a specific PDF"""
    try:
        rag_system.db_manager.delete_pdf(pdf_id)
        return {"message": "PDF deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-batch")
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
