from fastapi import APIRouter, HTTPException , Depends
from src.schemas.user_schema import UserCreate, UserLogin, UserResponse
from src.services.auth import AuthService
from src.api.deps import get_auth_service

router = APIRouter( prefix = "/auth" , tags=['auth'] )

@router.post("/signup" , response_model=UserResponse)
def signup(
    user : UserCreate,
    auth_service : AuthService = Depends(get_auth_service)
    ):
    try:
        user_id = auth_service.signup(user)
        return {"id":user_id , "email":user.email}
    except ValueError as e :
        raise HTTPException(status_code=400 , detail=str(e))

@router.post("/login")
def signup(
    user : UserCreate,
    auth_service : AuthService = Depends(get_auth_service)
    ):
    try:
        token = auth_service.login(user.email , user.password)
        return {"access_token":token , "token_type":"bearer"}
    except ValueError as e :
        raise HTTPException(status_code=400 , detail=str(e))