from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException, Form , Depends , APIRouter
from src.schemas.pdf_schema import PDFUploadResponse , PDFInfo 
from src.services.rag_service import RAGService
from src.services.pdf_service import PdfService
from typing import Optional 
import shutil
from pathlib import Path
from src.db.mongodb import get_database
from src.api.deps import get_pdf_service , get_rag_service
from src.core.config import settings

router = APIRouter(prefix="/pdfs", tags=["pdfs"])

# Temporary upload directory
UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload", response_model=PDFUploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    conversation_id: Optional[str] = Form(None),
    db=Depends(get_database)
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
        service = settings.rag_service
        # service = RAGService(db)
        pdf_id = service.upload_pdf(str(temp_path), conversation_id)
        
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


@router.post("/upload-batch")
async def upload_pdfs_batch(
    files: List[UploadFile] = File(...),
    conversation_id: Optional[str] = Form(None),
    db = Depends(get_database)
):
    """Upload multiple PDF files at once"""
    try:
        service = settings.rag_service

        # service = RAGService(db)
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
                
                pdf_id = service.upload_pdf(str(temp_path), conversation_id)
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


@router.get("/conversation/{conversation_id}", response_model=List[PDFInfo])
async def get_conversation_pdfs(conversation_id: str,
                            # db = Depends(get_database),
                            pdf_service : PdfService = Depends(get_pdf_service)
                                ):
    """Get all PDFs for a specific conversation"""
    try:
        # service = RAGService(db)
        pdfs = pdf_service.get_conversation_pdfs(conversation_id)
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
async def get_global_pdfs(
    db=Depends(get_database),
    pdf_service : PdfService = Depends(get_pdf_service)
    ):
    """Get all global PDFs (not associated with any conversation)"""
    # try:

        # service = settings.rag_service
    pdfs = pdf_service.get_global_pdfs()
    return [
        PDFInfo(
            pdf_id=pdf["pdf_id"],
            filename=pdf["filename"],
            conversation_id=pdf.get("conversation_id"),
            uploaded_at=pdf["uploaded_at"]
        )
        for pdf in pdfs
    ]
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))

@router.get("/{pdf_id}")
async def get_pdf_info(
    pdf_id: str , 
    pdf_service:PdfService=Depends(get_pdf_service),
    
    ):
    """Get information about a specific PDF"""
    try:
        pdf = pdf_service.get_pdf(pdf_id)
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
async def delete_pdf(
    pdf_id: str , 
    db=Depends(get_database),
    pdf_service:PdfService=Depends(get_pdf_service),
    rag_service:RAGService=Depends(get_rag_service)
    ):
    """Delete a specific PDF"""
    try:
        # service = RAGService(db)
        rag_service.delete_pdf(pdf_id)
        return {"message": "PDF deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
