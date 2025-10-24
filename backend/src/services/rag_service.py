# src/services/rag_service.py
import os
from typing import Optional, List
from datetime import datetime
from src.repositories.pdf_repository import PDFRepository
from src.repositories.conversations_repository import ConversationRepository
from src.repositories.messages_repository import MessagesRepository
from src.repositories.chunk_repository import ChunkRepository
from src.stores.llm.llm_factory import LLMFactory
from src.stores.embedding.embedding_factory import EmbeddingFactory
from src.stores.vectordb.vectordb_factory import VectorDBFactory
from src.core.pdf_service import PDFService
from src.core.config import settings


class RAGService:
    def __init__(self, db, llm_provider: str = None, embedding_provider: str = None, 
                 vectordb_provider: str = None):
        # Initialize repositories
        self.pdf_repo = PDFRepository(db)
        self.conversation_repo = ConversationRepository(db)
        self.message_repo = MessagesRepository(db)
        self.chunk_repo = ChunkRepository(db)
        
        # Initialize factories
        llm_prov = llm_provider or settings.LLM_PROVIDER
        emb_prov = embedding_provider or settings.EMBEDDING_PROVIDER
        vec_prov = vectordb_provider or settings.VECTORDB_PROVIDER

        print(llm_prov)
        print(emb_prov)
        print(vec_prov)
        
        self.llm = LLMFactory.create(
            llm_prov, 
            settings.GEMINI_API_KEY if llm_prov == "gemini" else None
        )
        self.embedding = EmbeddingFactory.create(
            emb_prov,
            settings.GEMINI_API_KEY if emb_prov == "gemini" else None
        )
        self.vectordb = VectorDBFactory.create(
            vec_prov,
            api_key=settings.PINECONE_API_KEY if vec_prov == "pinecone" else None
        )
        
        # Initialize PDF service
        self.pdf_service = PDFService()

    def upload_pdf(self, pdf_path: str, conversation_id: Optional[str] = None) -> str:
        """Process and upload a PDF file"""
        # Extract and process text
        text = self.pdf_service.extract_text(pdf_path)
        chunks = self.pdf_service.split_text(text)
        
        # Generate embeddings
        embeddings = self.embedding.embed(chunks)
        
        # Generate PDF ID
        pdf_id = f"pdf_{datetime.now().timestamp()}"
        
        # Save PDF to MongoDB
        with open(pdf_path, 'rb') as f:
            content = f.read()
        filename = os.path.basename(pdf_path)
        
        self.pdf_repo.create(pdf_id, filename, content, conversation_id)
        
        # Prepare metadata for vector DB
        metadata = [
            {
                "source": filename, 
                "pdf_id": pdf_id, 
                "conversation_id": conversation_id or ""
            }
            for _ in chunks
        ]
        ids = [f"{pdf_id}_chunk_{i}" for i in range(len(chunks))]
        
        # Store in vector database
        self.vectordb.add_documents(chunks, embeddings, metadata, ids)
        
        return pdf_id
    
    def query(self, question: str, conversation_id: Optional[str] = None, 
              top_k: int = 3) -> str:
        """Query the RAG system"""
        # Embed question
        query_embedding = self.embedding.embed([question])[0]
        
        # Search vector database
        results = self.vectordb.search(query_embedding, top_k)

        print("Search Results:", results)
        print(f"Conversation ID: {conversation_id}")
        
        # Filter by conversation if specified
        if conversation_id:
            results = [r for r in results 
                      if r['metadata'].get('conversation_id') == conversation_id or r['metadata'].get('conversation_id') == ""]
        
        # Build context
        context = "\n\n".join([r['text'] for r in results])
        
        # Generate prompt
        prompt = f"""
            You are an expert driving assistant knowledgeable about driving laws, road safety, and car maintenance.

            Use ONLY the context below to answer. 
            If the context does not clearly contain the answer, reply: "I'm not sure based on the context."

            Context:
            ---
            {context}
            ---

            Question: {question}

            Provide a short, accurate, and helpful answer in one paragraph. 
            If it's a legal question, mention what driving law or rule applies.
        """
        print(prompt)
        # return ""
        
        # Generate response
        return self.llm.generate(prompt)
    
    def chat(self, conversation_id: str, message: str, top_k: int = 3, 
             history_limit: int = 20) -> dict:
        """Chat with context and history"""
        # Save user message
        user_msg_id = self.message_repo.create(conversation_id, "user", message)
        
        # Get query embedding and search
        query_embedding = self.embedding.embed([message])[0]
        results = self.vectordb.search(query_embedding, top_k)
        
        # Filter by conversation
        results = [r for r in results 
                  if r['metadata'].get('conversation_id') == conversation_id]
        
        # Build context
        context = "\n\n".join([r['text'] for r in results])
        
        # Get conversation history
        history = self.message_repo.find_by_conversation(
            conversation_id, limit=history_limit, ascending=True
        )
        
        # Build prompt with history and context
        prompt = self._build_prompt_with_history_and_context(history, context, message)
        
        # Generate answer
        answer = self.llm.generate(prompt)
        
        # Save assistant message
        assistant_msg_id = self.message_repo.create(conversation_id, "assistant", answer)
        
        return {
            "user_message_id": user_msg_id,
            "assistant_message_id": assistant_msg_id,
            "answer": answer,
        }
    
    def _build_prompt_with_history_and_context(self, history: List[dict], 
                                              context: str, question: str) -> str:
        """Build a prompt with conversation history and context"""
        history_str = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history])
        
        prompt = f"""
            Conversation History:
            {history_str}

            Context:
            {context}

            Question: {question}

            Answer based on the context and conversation history. If unsure, say so.
        """
        return prompt
    
    # def get_conversation_pdfs(self, conversation_id: str) -> List:
    #     """Get all PDFs for a conversation"""
    #     return self.pdf_repo.find_by_conversation(conversation_id)
    
    # def get_global_pdfs(self) -> List:
    #     """Get all global PDFs"""
    #     return self.pdf_repo.find_global_pdfs()
    
    def delete_pdf(self, pdf_id: str):
        """Delete a PDF"""
        self.pdf_repo.delete(pdf_id)
        self.vectordb.delete_by_pdf_id(pdf_id)
        # TODO: Also delete from vector DB
    
    def get_statistics(self) -> dict:
        """Get system statistics"""
        conversations = self.conversation_repo.find_all()
        global_pdfs = self.pdf_repo.find_global_pdfs()
        total_pdfs = self.pdf_repo.count_all()
        
        return {
            "total_conversations": len(conversations),
            "total_pdfs": total_pdfs,
            "global_pdfs": len(global_pdfs),
            "conversation_pdfs": total_pdfs - len(global_pdfs)
        }
