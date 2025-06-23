from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime
import uuid
from app.models.order import OrderCreate, OrderResponse, OrderListResponse, OrderItemBase, OrderStatus
from app.core.database import get_orders_collection, get_order_items_collection, get_cart_collection, get_products_collection
from app.api.auth import get_current_user_obj

router = APIRouter()

@router.post("/", response_model=OrderResponse, summary="创建订单")
async def create_order(current_user = Depends(get_current_user_obj)):
    """从购物车创建订单"""
    cart_collection = get_cart_collection()
    products_collection = get_products_collection()
    orders_collection = get_orders_collection()
    order_items_collection = get_order_items_collection()
    
    user_id = str(current_user["_id"])
    
    # 获取购物车内容
    cart_items = await cart_collection.find({"user_id": user_id}).to_list(length=None)
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="购物车为空"
        )
    
    # 验证库存并计算总金额
    order_items = []
    total_amount = 0
    
    for cart_item in cart_items:
        product = await products_collection.find_one({"_id": ObjectId(cart_item["product_id"])})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"商品不存在: {cart_item['product_id']}"
            )
        
        if product["stock"] < cart_item["quantity"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"商品 {product['name']} 库存不足"
            )
        
        subtotal = product["price"] * cart_item["quantity"]
        total_amount += subtotal
        
        order_items.append(OrderItemBase(
            product_id=cart_item["product_id"],
            product_name=product["name"],
            product_price=product["price"],
            quantity=cart_item["quantity"],
            subtotal=subtotal
        ))
    
    # 生成订单号
    order_number = f"EC{datetime.utcnow().strftime('%Y%m%d')}{uuid.uuid4().hex[:8].upper()}"
    
    # 创建订单
    order_dict = {
        "user_id": user_id,
        "order_number": order_number,
        "total_amount": total_amount,
        "status": OrderStatus.PAID,
        "created_at": datetime.utcnow()
    }
    
    order_result = await orders_collection.insert_one(order_dict)
    order_id = str(order_result.inserted_id)
    
    # 创建订单项并减少库存
    for item in order_items:
        order_item_dict = item.dict()
        order_item_dict["order_id"] = order_id
        await order_items_collection.insert_one(order_item_dict)
        
        # 减少商品库存
        await products_collection.update_one(
            {"_id": ObjectId(item.product_id)},
            {"$inc": {"stock": -item.quantity}}
        )
    
    # 清空购物车
    await cart_collection.delete_many({"user_id": user_id})
    
    return OrderResponse(
        id=order_id,
        order_number=order_number,
        total_amount=total_amount,
        status=OrderStatus.PAID,
        created_at=order_dict["created_at"],
        items=order_items
    )

@router.get("/", response_model=List[OrderListResponse], summary="获取订单列表")
async def get_orders(current_user = Depends(get_current_user_obj)):
    """获取当前用户的订单列表"""
    orders_collection = get_orders_collection()
    order_items_collection = get_order_items_collection()
    
    user_id = str(current_user["_id"])
    orders = await orders_collection.find({"user_id": user_id}).sort("created_at", -1).to_list(length=None)
    
    order_list = []
    for order in orders:
        # 获取订单项数量
        items_count = await order_items_collection.count_documents({"order_id": str(order["_id"])})
        
        order_list.append(OrderListResponse(
            id=str(order["_id"]),
            order_number=order["order_number"],
            total_amount=order["total_amount"],
            status=order["status"],
            created_at=order["created_at"],
            item_count=items_count
        ))
    
    return order_list

@router.get("/{order_id}", response_model=OrderResponse, summary="获取订单详情")
async def get_order(order_id: str, current_user = Depends(get_current_user_obj)):
    """获取订单详细信息"""
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的订单ID"
        )
    
    orders_collection = get_orders_collection()
    order_items_collection = get_order_items_collection()
    
    user_id = str(current_user["_id"])
    
    # 查找订单
    order = await orders_collection.find_one({
        "_id": ObjectId(order_id),
        "user_id": user_id
    })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在"
        )
    
    # 获取订单项
    order_items = await order_items_collection.find({"order_id": order_id}).to_list(length=None)
    
    items = [
        OrderItemBase(
            product_id=item["product_id"],
            product_name=item["product_name"],
            product_price=item["product_price"],
            quantity=item["quantity"],
            subtotal=item["subtotal"]
        )
        for item in order_items
    ]
    
    return OrderResponse(
        id=str(order["_id"]),
        order_number=order["order_number"],
        total_amount=order["total_amount"],
        status=order["status"],
        created_at=order["created_at"],
        items=items
    ) 