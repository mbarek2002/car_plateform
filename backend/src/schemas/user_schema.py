from pydantic import BaseModel , EmailStr , ConfigDict

class UserCreate(BaseModel):
    email : EmailStr
    password : str


class UserLogin(BaseModel):
    email : EmailStr
    password : str


class UserResponse(BaseModel):
    id : str
    email : EmailStr
