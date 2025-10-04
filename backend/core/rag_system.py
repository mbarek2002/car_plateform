import os
import re
from typing import Optional, List
from datetime import datetime
from src.stores.llm.llm_factory import LLMFactory
from factories.embedding_factory import EmbeddingFactory
from factories.vectordb_factory import VectorDBFactory
from database.mongodb_manager import MongoDBManager
from services.pdf_service import PDFService
from services.conversation_service import ConversationService
from config.settings import settings

class RAGSystem:
    def __init__(self, llm_provider: str = None, embedding_provider: str = None, 
                 vectordb_provider: str = None):
        # Use config or provided values
        llm_prov = llm_provider or settings.LLM_PROVIDER
        emb_prov = embedding_provider or settings.EMBEDDING_PROVIDER
        vec_prov = vectordb_provider or settings.VECTORDB_PROVIDER
        
        # Initialize factories
        self.llm = LLMFactory.create(
            llm_prov, 
            settings.GEMINI_API_KEY if llm_prov == "gemini" 
            else None
        )
        self.embedding = EmbeddingFactory.create(
            emb_prov,
            settings.GEMINI_API_KEY if emb_prov == "gemini" else None
        )
        self.vectordb = VectorDBFactory.create(
            vec_prov,
            api_key=settings.PINECONE_API_KEY if vec_prov == "pinecone" else None
        )
        
        # Initialize services
        self.db_manager = MongoDBManager()
        self.pdf_service = PDFService()
        self.conversation_service = ConversationService()
    
    def upload_pdf(self, pdf_path: str, conversation_id: Optional[str] = None) -> str:
        # Extract and process text
        text = self.pdf_service.extract_text(pdf_path)
        chunks = self.pdf_service.split_text(text)
        # Generate embeddings
        embeddings = self.embedding.embed(chunks)
        
        docs =[]
        pdf_id = f"pdf_{datetime.now().timestamp()}"

        
        # for i , chunk in enumerate(chunks):
        #     doc = {
        #         "chunk_id": f"chunk_{i}",
        #         "text": chunk,
        #         "metadata": {
        #             "source": os.path.basename(pdf_path),
        #             "pdf_id": pdf_id,
        #             "conversation_id": conversation_id.strip() if conversation_id.strip() != "" else None,
        #         },
        #         "embedding_model": settings.EMBEDDING_MODEL,
        #         "embedding": embeddings[i],
        #         "chunk_index": i,
        #         "created_at": datetime.utcnow()
        #     }
        #     docs.append(doc)

        # if docs:
        #     results = self.db_manager.save_chunks(docs)
        #     print(f"✅ Saved {len(docs)} chunks to MongoDB. IDs: {results}")
                

        # Save PDF to MongoDB
        with open(pdf_path, 'rb') as f:
            content = f.read()
        filename = os.path.basename(pdf_path)

        self.db_manager.save_pdf(pdf_id, filename, content, conversation_id)        
        
        # Prepare metadata
        metadata = [
            {"source": filename, "pdf_id": pdf_id, "conversation_id": conversation_id}
            for _ in chunks
        ]
        ids = [f"{pdf_id}_chunk_{i}" for i in range(len(chunks))]
        
        # Store in vector database
        self.vectordb.add_documents(chunks, embeddings, metadata, ids)
        
        return pdf_id
    
    def create_conversation(self, title: str) -> str:
        return self.conversation_service.create(title)
    
    def query(self, question: str, conversation_id: Optional[str] = None, 
              top_k: int = 3) -> str:
        # Embed question
        query_embedding = self.embedding.embed([question])[0]
        
        # Search vector database
        results = self.vectordb.search(query_embedding, top_k)
        print("herrre")
        
        print(f"Found {len(results)} results, top score = {results[0]['score']:.3f}")
        
        for r in results:
            print(r['metadata'])
        # Filter by conversation if specified
        if conversation_id:
            results = [r for r in results 
                      if r['metadata'].get('conversation_id') == conversation_id]
        
        print("afterr filtering")
        print(f"Found {len(results)} results, top score = {results[0]['score']:.3f}")

        # Build context
        context = "\n\n".join([r['text'] for r in results])
        
        # Generate prompt
#         prompt = f"""Context:
# {context}

# Question: {question}

# Answer clearly and concisely in one paragraph. 
# Do not repeat the question or invent new ones.
# If unsure, say: "I'm not sure based on the context."
# """   
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
            If it’s a legal question, mention what driving law or rule applies.
        """
        print(prompt)
        
        # Generate response
        return self.llm.generate(prompt)
        

    def chat(self, conversation_id: str, message: str, top_k: int = 3, history_limit: int = 20) -> dict:
        user_msg_id = self.db_manager.save_messages(conversation_id , role="user" , content=message)

        query_embedding = self.embedding.embed([message])[0]
        results = self.vectordb.search(query_embedding , top_k)

        results = [r for r in results if r['metadata'].get('conversation_id') == conversation_id]

        context = "\n\n".join([r['text'] for r in results])


        history = self.db_manager.get_messages(conversation_id , limit=history_limit , ascending=True)

        prompt = self._build_prompt_with_history_and_context(history , context , message)
        answer = self.llm.generate(prompt)

        assistant_msg_id = self.db_manager.save_messages(conversation_id , role="assistant" , content= answer)
        
        return {
            "user_message_id": user_msg_id,
            "assistant_message_id": assistant_msg_id,
            "answer": answer,
        }


    def get_conversation_pdfs(self, conversation_id: str) -> List:
        return self.db_manager.get_pdfs_by_conversation(conversation_id)
    
    def get_global_pdfs(self) -> List:
        return self.db_manager.get_all_global_pdfs()

    def _build_prompt_with_history_and_context(self,history:List[dict] , context:str , question:str)->str:
        history_str = "\n".join([f"{m['role'].upper()}:{m['content']}" for m in history])
        prompt = f"""
        Conversation History:
        {history_str}

        Context:
        {context}
        Question:{question}

Answer based on the context and conversation history. If unsure, say so."""
        return prompt