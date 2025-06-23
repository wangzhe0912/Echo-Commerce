from typing import List
from pydantic import BaseModel, Field
from bson import ObjectId
from datetime import datetime

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

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
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class CartItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    product_name: str
    product_price: float
    product_image_url: str
    subtotal: float
    created_at: datetime
    
    class Config:
        json_encoders = {ObjectId: str}

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total_amount: float
    total_items: int 