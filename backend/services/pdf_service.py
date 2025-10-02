import PyPDF2
from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from config.settings import settings

class PDFService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )
    
    def extract_text(self, pdf_path: str) -> str:
        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    
    def split_text(self, text: str) -> List[str]:
        return self.text_splitter.split_text(text)
