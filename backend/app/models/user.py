from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from datetime import datetime
from .base import PyObjectId

class UserBase(BaseModel):
    username: str = Field(..., description="用户名", min_length=6, max_length=120)

class UserCreate(UserBase):
    password: str = Field(..., description="密码", min_length=6)

class UserLogin(BaseModel):
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")

class User(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class UserResponse(BaseModel):
    id: str
    username: str
    is_admin: bool
    created_at: datetime
    
    model_config = {
        "json_encoders": {ObjectId: str}
    }

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse 