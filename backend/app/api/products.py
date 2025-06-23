from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from datetime import datetime
from app.models.product import Product, ProductCreate, ProductUpdate, ProductResponse
from app.core.database import get_products_collection
from app.api.auth import get_current_user_obj

router = APIRouter()

@router.get("/", response_model=List[ProductResponse], summary="获取商品列表")
async def get_products(
    skip: int = Query(0, ge=0, description="跳过的商品数量"),
    limit: int = Query(10, ge=1, le=100, description="返回的商品数量")
):
    """获取商品列表，支持分页"""
    products_collection = get_products_collection()
    
    cursor = products_collection.find().skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    
    return [
        ProductResponse(
            id=str(product["_id"]),
            name=product["name"],
            description=product["description"],
            price=product["price"],
            stock=product["stock"],
            image_url=product["image_url"],
            created_at=product["created_at"],
            updated_at=product.get("updated_at")
        )
        for product in products
    ]

@router.get("/{product_id}", response_model=ProductResponse, summary="获取商品详情")
async def get_product(product_id: str):
    """根据ID获取商品详细信息"""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的商品ID"
        )
    
    products_collection = get_products_collection()
    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )
    
    return ProductResponse(
        id=str(product["_id"]),
        name=product["name"],
        description=product["description"],
        price=product["price"],
        stock=product["stock"],
        image_url=product["image_url"],
        created_at=product["created_at"],
        updated_at=product.get("updated_at")
    )

@router.post("/", response_model=ProductResponse, summary="创建商品")
async def create_product(
    product: ProductCreate,
    current_user = Depends(get_current_user_obj)
):
    """创建新商品（需要管理员权限）"""
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    
    products_collection = get_products_collection()
    
    product_dict = product.dict()
    product_dict["created_at"] = datetime.utcnow()
    
    result = await products_collection.insert_one(product_dict)
    created_product = await products_collection.find_one({"_id": result.inserted_id})
    
    return ProductResponse(
        id=str(created_product["_id"]),
        name=created_product["name"],
        description=created_product["description"],
        price=created_product["price"],
        stock=created_product["stock"],
        image_url=created_product["image_url"],
        created_at=created_product["created_at"],
        updated_at=created_product.get("updated_at")
    )

@router.put("/{product_id}", response_model=ProductResponse, summary="更新商品")
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_user = Depends(get_current_user_obj)
):
    """更新商品信息（需要管理员权限）"""
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的商品ID"
        )
    
    products_collection = get_products_collection()
    
    # 检查商品是否存在
    existing_product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not existing_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )
    
    # 更新商品
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
    
    # 返回更新后的商品
    updated_product = await products_collection.find_one({"_id": ObjectId(product_id)})
    
    return ProductResponse(
        id=str(updated_product["_id"]),
        name=updated_product["name"],
        description=updated_product["description"],
        price=updated_product["price"],
        stock=updated_product["stock"],
        image_url=updated_product["image_url"],
        created_at=updated_product["created_at"],
        updated_at=updated_product.get("updated_at")
    )

@router.delete("/{product_id}", summary="删除商品")
async def delete_product(
    product_id: str,
    current_user = Depends(get_current_user_obj)
):
    """删除商品（需要管理员权限）"""
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的商品ID"
        )
    
    products_collection = get_products_collection()
    
    # 检查商品是否存在
    existing_product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not existing_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )
    
    # 删除商品
    await products_collection.delete_one({"_id": ObjectId(product_id)})
    
    return {"message": "商品删除成功"} 