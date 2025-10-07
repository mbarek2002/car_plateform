from fastapi import APIRouter, HTTPException
from src.schemas.user_schema import UserCreate, UserLogin, UserResponse
from services.auth import AuthService

router = APIRouter( prefix = "/auth" , tags=['auth'] )

@router.post("/signup" , response_model=UserResponse)
def signup(user : UserCreate):
    try:
        user_id = AuthService.signup(user)
        return {"id":user_id , "email":user.email}
    except ValueError as e :
        raise HTTPException(status_code=400 , detail=str(e))

@router.post("/login")
def signup(user : UserCreate):
    try:
        token = AuthService.login(user.email , user.password)
        return {"access_token":token , "token_type":"bearer"}
    except ValueError as e :
        raise HTTPException(status_code=400 , detail=str(e))