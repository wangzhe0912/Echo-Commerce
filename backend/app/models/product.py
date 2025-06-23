from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from datetime import datetime
from .base import PyObjectId

class ProductBase(BaseModel):
    name: str = Field(..., description="商品名称")
    description: str = Field(..., description="商品描述")
    price: float = Field(..., gt=0, description="商品价格")
    stock: int = Field(..., ge=0, description="库存数量")
    image_url: str = Field(..., description="商品图片URL")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None

class Product(ProductBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    stock: int
    image_url: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "json_encoders": {ObjectId: str}
    } 