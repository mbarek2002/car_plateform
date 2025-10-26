from src.repositories.user_repository import UserRepository
from src.schemas.user_schema import UserCreate
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
from src.core.config import Settings

settings = Settings()

pwd_context = CryptContext(schemes=['bcrypt'],deprecated="auto")

def hash_password(password:str):
    return pwd_context.hash(password)

def verify_password(plain_password , hashed_password):
    return pwd_context.verify(plain_password , hashed_password)

def create_access_token(data:dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({'exp':expire})
    encoded_jwt = jwt.encode(to_encode , settings.SECRET_KEY , algorithm=settings.ALGORITHM)
    return encoded_jwt


class AuthService :
    def __init__(self, db):
        self.user_repo = UserRepository(db)

    def signup(self ,user  : UserCreate):
        existing_user = self.user_repo.get_by_email(email=user.email)
        if existing_user :
            raise ValueError("Email already registred")
        hashed_password = hash_password(user.password)
        user_id = self.user_repo.create(user.email , hashed_password)
        return user_id
    
    def login(self , email  : str , password :str):
        user = self.user_repo.get_by_email(email)
        print(password)
        if not user or not verify_password(password , user.hashed_password) :
            raise ValueError("Invalid credentials")
        token = create_access_token({"sub": user.email})
        return token
