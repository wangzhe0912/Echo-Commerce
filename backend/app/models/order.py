from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from datetime import datetime
from enum import Enum
from .base import PyObjectId

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
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class Order(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str = Field(..., description="用户ID")
    order_number: str = Field(..., description="订单号")
    total_amount: float = Field(..., description="订单总金额")
    status: OrderStatus = Field(default=OrderStatus.PAID, description="订单状态")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class OrderResponse(BaseModel):
    id: str
    order_number: str
    total_amount: float
    status: OrderStatus
    created_at: datetime
    items: List[OrderItemBase]
    
    model_config = {
        "json_encoders": {ObjectId: str}
    }

class OrderListResponse(BaseModel):
    id: str
    order_number: str
    total_amount: float
    status: OrderStatus
    created_at: datetime
    item_count: int
    
    model_config = {
        "json_encoders": {ObjectId: str}
    } 