from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from datetime import datetime, timedelta
from app.models.user import UserResponse
from app.models.order import OrderListResponse, OrderResponse, OrderItemBase
from app.core.database import get_users_collection, get_products_collection, get_orders_collection, get_order_items_collection
from app.api.auth import get_current_user_obj

router = APIRouter()

def require_admin(current_user = Depends(get_current_user_obj)):
    """确保当前用户是管理员"""
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    return current_user

@router.get("/stats", summary="获取系统统计数据")
async def get_system_stats(current_user = Depends(require_admin)):
    """获取系统统计数据（仅管理员）"""
    users_collection = get_users_collection()
    products_collection = get_products_collection()
    orders_collection = get_orders_collection()
    
    # 获取统计数据
    total_users = await users_collection.count_documents({})
    total_products = await products_collection.count_documents({})
    total_orders = await orders_collection.count_documents({})
    
    # 计算总收入
    orders = await orders_collection.find().to_list(length=None)
    total_revenue = sum(order.get("total_amount", 0) for order in orders)
    
    # 获取今日数据
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = await orders_collection.count_documents({
        "created_at": {"$gte": today_start}
    })
    
    # 获取本月数据
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_orders = await orders_collection.count_documents({
        "created_at": {"$gte": month_start}
    })
    
    # 库存统计
    in_stock_products = await products_collection.count_documents({"stock": {"$gt": 0}})
    out_of_stock_products = await products_collection.count_documents({"stock": 0})
    
    # 订单状态统计
    status_stats = {}
    for status in ["pending", "paid", "shipped", "delivered", "cancelled"]:
        count = await orders_collection.count_documents({"status": status})
        status_stats[status] = count
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "today_orders": today_orders,
        "month_orders": month_orders,
        "in_stock_products": in_stock_products,
        "out_of_stock_products": out_of_stock_products,
        "order_status_stats": status_stats
    }

@router.get("/users", response_model=List[UserResponse], summary="获取用户列表")
async def get_all_users(
    skip: int = Query(0, ge=0, description="跳过的用户数量"),
    limit: int = Query(20, ge=1, le=100, description="返回的用户数量"),
    current_user = Depends(require_admin)
):
    """获取所有用户列表（仅管理员）"""
    users_collection = get_users_collection()
    
    cursor = users_collection.find().skip(skip).limit(limit).sort("created_at", -1)
    users = await cursor.to_list(length=limit)
    
    return [
        UserResponse(
            id=str(user["_id"]),
            username=user["username"],
            is_admin=user.get("is_admin", False),
            created_at=user["created_at"]
        )
        for user in users
    ]

@router.get("/recent-activities", summary="获取最近活动")
async def get_recent_activities(current_user = Depends(require_admin)):
    """获取系统最近活动（仅管理员）"""
    users_collection = get_users_collection()
    orders_collection = get_orders_collection()
    products_collection = get_products_collection()
    
    activities = []
    
    # 最近注册的用户
    recent_users = await users_collection.find().sort("created_at", -1).limit(5).to_list(length=5)
    for user in recent_users:
        activities.append({
            "type": "user_registration",
            "description": f"用户 {user['username']} 注册了账户",
            "timestamp": user["created_at"],
            "data": {"username": user["username"]}
        })
    
    # 最近的订单
    recent_orders = await orders_collection.find().sort("created_at", -1).limit(10).to_list(length=10)
    for order in recent_orders:
        activities.append({
            "type": "order_created",
            "description": f"订单 {order['order_number']} 已创建，金额 ¥{order['total_amount']}",
            "timestamp": order["created_at"],
            "data": {
                "order_number": order["order_number"],
                "total_amount": order["total_amount"],
                "status": order["status"]
            }
        })
    
    # 按时间排序
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return activities[:20]  # 返回最近20条活动

@router.get("/dashboard", summary="获取管理员仪表板数据")
async def get_dashboard_data(current_user = Depends(require_admin)):
    """获取管理员仪表板数据（仅管理员）"""
    users_collection = get_users_collection()
    products_collection = get_products_collection()
    orders_collection = get_orders_collection()
    
    # 基础统计
    stats = await get_system_stats(current_user)
    
    # 最近7天的订单趋势
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    daily_orders = []
    daily_revenue = []
    
    for i in range(7):
        day_start = seven_days_ago + timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        day_orders = await orders_collection.count_documents({
            "created_at": {"$gte": day_start, "$lt": day_end}
        })
        
        # 计算当日收入
        day_orders_data = await orders_collection.find({
            "created_at": {"$gte": day_start, "$lt": day_end}
        }).to_list(length=None)
        day_revenue = sum(order.get("total_amount", 0) for order in day_orders_data)
        
        daily_orders.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "orders": day_orders
        })
        daily_revenue.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "revenue": day_revenue
        })
    
    # 热门商品（根据订单数量）
    order_items_collection = get_order_items_collection()
    pipeline = [
        {"$group": {
            "_id": "$product_id",
            "total_quantity": {"$sum": "$quantity"},
            "total_orders": {"$sum": 1}
        }},
        {"$sort": {"total_quantity": -1}},
        {"$limit": 5}
    ]
    
    top_products_data = await order_items_collection.aggregate(pipeline).to_list(length=5)
    top_products = []
    
    for item in top_products_data:
        product = await products_collection.find_one({"_id": ObjectId(item["_id"])})
        if product:
            top_products.append({
                "product_id": item["_id"],
                "product_name": product["name"],
                "total_quantity": item["total_quantity"],
                "total_orders": item["total_orders"]
            })
    
    return {
        "stats": stats,
        "daily_orders": daily_orders,
        "daily_revenue": daily_revenue,
        "top_products": top_products
    }

@router.put("/users/{user_id}/admin", summary="设置用户管理员权限")
async def set_user_admin(
    user_id: str,
    is_admin: bool,
    current_user = Depends(require_admin)
):
    """设置用户的管理员权限（仅管理员）"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的用户ID"
        )
    
    users_collection = get_users_collection()
    
    # 检查用户是否存在
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 不能修改自己的权限
    if str(user["_id"]) == str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能修改自己的管理员权限"
        )
    
    # 更新用户权限
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_admin": is_admin}}
    )
    
    action = "设置为管理员" if is_admin else "取消管理员权限"
    return {"message": f"已{action}用户 {user['username']}"}

@router.get("/orders", response_model=List[OrderListResponse], summary="获取所有订单列表")
async def get_all_orders(current_user = Depends(require_admin)):
    """获取所有用户的订单列表（仅管理员）"""
    orders_collection = get_orders_collection()
    order_items_collection = get_order_items_collection()
    
    orders = await orders_collection.find().sort("created_at", -1).to_list(length=None)
    
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

@router.get("/orders/{order_id}", response_model=OrderResponse, summary="获取任意订单详情")
async def get_any_order(order_id: str, current_user = Depends(require_admin)):
    """获取任意订单的详细信息（仅管理员）"""
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的订单ID"
        )
    
    orders_collection = get_orders_collection()
    order_items_collection = get_order_items_collection()
    
    # 查找订单
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    
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