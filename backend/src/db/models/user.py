from pydantic import BaseModel, EmailStr, Field
from typing import Any
from bson import ObjectId

# ✅ Pydantic v2 compatible ObjectId field type
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source, _handler):
        from pydantic_core import core_schema

        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.no_info_before_validator_function(
                cls.validate, core_schema.any_schema()
            ),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda v: str(v)
            ),
        )

    @classmethod
    def validate(cls, v: Any, info: Any = None):
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


class UserInDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    email: EmailStr
    hashed_password: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
