from datetime import datetime
from typing import Optional , Dict , List
from pymongo.database import Database

class MessagesRpository :

    def __init__(self , db:Database):
        self.collection = db['messages']

    def save_messages(self , conversation_id : str , role : str , content : str , metadata : Optional[Dict]=None)->str:
        doc = {
            "conversation_id":conversation_id,
            "role":role,
            "content":content,
            "metadata": metadata or {} ,
            "created_at":datetime.utcnow()
         }

        result = self.collection.insert_one(doc)
        return str(result.inserted_id)

    def find_by_conversation(self , conversation_id:str , limit:int =20 , 
                             ascending : bool =True ) -> List[Dict] : 
        sort_order = 1 if ascending else 2
        cursor = self.collection.find(
            {"conversation_id":conversation_id}
        ).sort("created_at",sort_order).limit(limit)
        return list(cursor)
    
    def delete_by_conversation(self,conversation_id:str):
        result = self.collection.delete_many({"conversation_id":conversation_id})
        return result.deleted_count

    def count_by_conversation(self,conversation_id:str):
        result = self.collection.count_documents({"conversation_id":conversation_id})
        return result.deleted_count

    
