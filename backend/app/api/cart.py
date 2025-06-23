from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime
from app.models.cart import CartItemCreate, CartItemUpdate, CartItemResponse, CartResponse
from app.core.database import get_cart_collection, get_products_collection
from app.api.auth import get_current_user_obj

router = APIRouter()

@router.get("/", response_model=CartResponse, summary="获取购物车")
async def get_cart(current_user = Depends(get_current_user_obj)):
    """获取当前用户的购物车内容"""
    cart_collection = get_cart_collection()
    products_collection = get_products_collection()
    
    user_id = str(current_user["_id"])
    cart_items = await cart_collection.find({"user_id": user_id}).to_list(length=None)
    
    items = []
    total_amount = 0
    total_items = 0
    
    for cart_item in cart_items:
        # 获取商品信息
        product = await products_collection.find_one({"_id": ObjectId(cart_item["product_id"])})
        if product:
            subtotal = product["price"] * cart_item["quantity"]
            items.append(CartItemResponse(
                id=str(cart_item["_id"]),
                product_id=cart_item["product_id"],
                quantity=cart_item["quantity"],
                product_name=product["name"],
                product_price=product["price"],
                product_image_url=product["image_url"],
                subtotal=subtotal,
                created_at=cart_item["created_at"]
            ))
            total_amount += subtotal
            total_items += cart_item["quantity"]
    
    return CartResponse(
        items=items,
        total_amount=total_amount,
        total_items=total_items
    )

@router.post("/items", response_model=CartItemResponse, summary="添加商品到购物车")
async def add_to_cart(
    item: CartItemCreate,
    current_user = Depends(get_current_user_obj)
):
    """添加商品到购物车"""
    if not ObjectId.is_valid(item.product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的商品ID"
        )
    
    cart_collection = get_cart_collection()
    products_collection = get_products_collection()
    
    # 检查商品是否存在
    product = await products_collection.find_one({"_id": ObjectId(item.product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )
    
    # 检查库存
    if product["stock"] < item.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"库存不足，当前库存：{product['stock']}"
        )
    
    user_id = str(current_user["_id"])
    
    # 检查购物车中是否已存在该商品
    existing_item = await cart_collection.find_one({
        "user_id": user_id,
        "product_id": item.product_id
    })
    
    if existing_item:
        # 更新数量
        new_quantity = existing_item["quantity"] + item.quantity
        if new_quantity > product["stock"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"库存不足，当前库存：{product['stock']}"
            )
        
        await cart_collection.update_one(
            {"_id": existing_item["_id"]},
            {
                "$set": {
                    "quantity": new_quantity,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        updated_item = await cart_collection.find_one({"_id": existing_item["_id"]})
        cart_item = updated_item
    else:
        # 创建新的购物车项
        cart_item_dict = item.dict()
        cart_item_dict["user_id"] = user_id
        cart_item_dict["created_at"] = datetime.utcnow()
        cart_item_dict["updated_at"] = datetime.utcnow()
        
        result = await cart_collection.insert_one(cart_item_dict)
        cart_item = await cart_collection.find_one({"_id": result.inserted_id})
    
    subtotal = product["price"] * cart_item["quantity"]
    
    return CartItemResponse(
        id=str(cart_item["_id"]),
        product_id=cart_item["product_id"],
        quantity=cart_item["quantity"],
        product_name=product["name"],
        product_price=product["price"],
        product_image_url=product["image_url"],
        subtotal=subtotal,
        created_at=cart_item["created_at"]
    )

@router.put("/items/{item_id}", response_model=CartItemResponse, summary="更新购物车商品数量")
async def update_cart_item(
    item_id: str,
    item_update: CartItemUpdate,
    current_user = Depends(get_current_user_obj)
):
    """更新购物车中商品的数量"""
    if not ObjectId.is_valid(item_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的购物车项ID"
        )
    
    cart_collection = get_cart_collection()
    products_collection = get_products_collection()
    
    user_id = str(current_user["_id"])
    
    # 查找购物车项
    cart_item = await cart_collection.find_one({
        "_id": ObjectId(item_id),
        "user_id": user_id
    })
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="购物车项不存在"
        )
    
    # 检查商品库存
    product = await products_collection.find_one({"_id": ObjectId(cart_item["product_id"])})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )
    
    if product["stock"] < item_update.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"库存不足，当前库存：{product['stock']}"
        )
    
    # 更新数量
    await cart_collection.update_one(
        {"_id": ObjectId(item_id)},
        {
            "$set": {
                "quantity": item_update.quantity,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    updated_item = await cart_collection.find_one({"_id": ObjectId(item_id)})
    subtotal = product["price"] * updated_item["quantity"]
    
    return CartItemResponse(
        id=str(updated_item["_id"]),
        product_id=updated_item["product_id"],
        quantity=updated_item["quantity"],
        product_name=product["name"],
        product_price=product["price"],
        product_image_url=product["image_url"],
        subtotal=subtotal,
        created_at=updated_item["created_at"]
    )

@router.delete("/items/{item_id}", summary="从购物车删除商品")
async def remove_from_cart(
    item_id: str,
    current_user = Depends(get_current_user_obj)
):
    """从购物车中删除商品"""
    if not ObjectId.is_valid(item_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的购物车项ID"
        )
    
    cart_collection = get_cart_collection()
    user_id = str(current_user["_id"])
    
    # 查找并删除购物车项
    result = await cart_collection.delete_one({
        "_id": ObjectId(item_id),
        "user_id": user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="购物车项不存在"
        )
    
    return {"message": "商品已从购物车中移除"}

@router.delete("/clear", summary="清空购物车")
async def clear_cart(current_user = Depends(get_current_user_obj)):
    """清空当前用户的购物车"""
    cart_collection = get_cart_collection()
    user_id = str(current_user["_id"])
    
    await cart_collection.delete_many({"user_id": user_id})
    
    return {"message": "购物车已清空"} 