from datetime import datetime
from typing import Optional , Dict
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

        result = self.messages.insert_one(doc)
        return str(result.inserted_id)
  
    def get_messages(self , conversation_id : str , limit : int=20 ,  ascending : bool=True)->List:
        sort_order = 1 if ascending else -1
        cursor = self.messages.find({"conversation_id":conversation_id}).sort("created_at",sort_order).limit(limit)
        return list(cursor)

    def delete_messages(self,conversation_id:str):
        self.messages.delete_many({"conversation_id":conversation_id})
