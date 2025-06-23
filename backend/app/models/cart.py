from typing import List
from pydantic import BaseModel, Field
from bson import ObjectId
from datetime import datetime
from .base import PyObjectId

class CartItemBase(BaseModel):
    product_id: str = Field(..., description="商品ID")
    quantity: int = Field(..., gt=0, description="数量")

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0, description="数量")

class CartItem(CartItemBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str = Field(..., description="用户ID")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class CartItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    product_name: str
    product_price: float
    product_image_url: str
    subtotal: float
    created_at: datetime
    
    model_config = {
        "json_encoders": {ObjectId: str}
    }

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total_amount: float
    total_items: int 