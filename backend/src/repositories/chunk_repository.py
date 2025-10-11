from typing import List , Dict


class ChunkRepository :
    def __init__(self , db):
        self.collection= db['chunks']


    def create_many(self,docs:List[Dict]) -> List[str]:
        """Save multiple document chunks to MongoDB"""
        result = self.collection.insert_many(docs)
        return [str(_id) for _id in result.inserted_ids]
    
    def find_by_pdf(self,pdf_id:str) -> List[Dict]:
        return list(self.collection.find({"metadata.pdf_id":pdf_id}))
    
    def find_by_conversation(self,conversation_id:str) -> List[Dict]:
        return list(self.collection.find({"metadata.conversation_id":conversation_id}))

    def delete_by_pdf(self,pdf_id:str) -> int:
        result = self.collection.delete_many({"metadata.pdf_id": pdf_id})
        return result.deleted_count

    def delete_by_conversation(self,conversation_id:str) -> int:
        result = self.collection.delete_many({"metadata.conversation_id": conversation_id})
        return result.deleted_count