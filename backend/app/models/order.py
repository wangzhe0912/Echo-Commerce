from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from datetime import datetime
from enum import Enum

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

class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderCreate(BaseModel):
    pass

class OrderItemBase(BaseModel):
    product_id: str = Field(..., description="商品ID")
    product_name: str = Field(..., description="商品名称")
    product_price: float = Field(..., description="商品单价")
    quantity: int = Field(..., gt=0, description="数量")
    subtotal: float = Field(..., description="小计")

class OrderItem(OrderItemBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    order_id: str = Field(..., description="订单ID")
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Order(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str = Field(..., description="用户ID")
    order_number: str = Field(..., description="订单号")
    total_amount: float = Field(..., description="订单总金额")
    status: OrderStatus = Field(default=OrderStatus.PAID, description="订单状态")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class OrderResponse(BaseModel):
    id: str
    order_number: str
    total_amount: float
    status: OrderStatus
    created_at: datetime
    items: List[OrderItemBase]
    
    class Config:
        json_encoders = {ObjectId: str}

class OrderListResponse(BaseModel):
    id: str
    order_number: str
    total_amount: float
    status: OrderStatus
    created_at: datetime
    item_count: int
    
    class Config:
        json_encoders = {ObjectId: str} 