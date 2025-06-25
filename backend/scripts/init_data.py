#!/usr/bin/env python3
"""
数据初始化脚本
用于在项目首次部署或数据库为空时初始化必要的数据
"""

import asyncio
import sys
import os
from datetime import datetime
from typing import List, Dict, Any

# 添加父目录到路径，以便导入应用模块
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import get_database
from app.core.security import get_password_hash
from app.core.config import settings


async def check_and_create_indexes():
    """创建必要的数据库索引"""
    print("📋 检查并创建数据库索引...")
    
    db = await get_database()
    
    # 用户集合索引
    await db.users.create_index("username", unique=True)
    print("✅ 用户集合索引创建完成")
    
    # 商品集合索引
    await db.products.create_index("name")
    await db.products.create_index([("created_at", -1)])
    print("✅ 商品集合索引创建完成")
    
    # 购物车集合索引
    await db.cart.create_index([("user_id", 1), ("product_id", 1)], unique=True)
    print("✅ 购物车集合索引创建完成")
    
    # 订单集合索引
    await db.orders.create_index("user_id")
    await db.orders.create_index("order_number", unique=True)
    await db.orders.create_index([("created_at", -1)])
    print("✅ 订单集合索引创建完成")
    
    # 订单项集合索引
    await db.order_items.create_index("order_id")
    print("✅ 订单项集合索引创建完成")


async def init_admin_user():
    """初始化管理员用户"""
    print("👤 检查管理员用户...")
    
    db = await get_database()
    
    # 检查是否已存在管理员
    admin_user = await db.users.find_one({"username": "admin"})
    if admin_user:
        print("ℹ️  管理员用户已存在，跳过创建")
        return
    
    # 创建管理员用户
    admin_data = {
        "username": "admin",
        "hashed_password": get_password_hash("admin123"),
        "is_admin": True,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(admin_data)
    print("✅ 管理员用户创建成功")
    print("   用户名: admin")
    print("   密码: admin123")
    print("   ⚠️  请在生产环境中修改默认密码！")


async def init_sample_products():
    """初始化示例商品数据"""
    print("🛍️  检查商品数据...")
    
    db = await get_database()
    
    # 检查是否已有商品
    product_count = await db.products.count_documents({})
    if product_count > 0:
        print(f"ℹ️  已存在 {product_count} 个商品，跳过初始化")
        return
    
    # 示例商品数据
    sample_products = [
        {
            "name": "iPhone 15 Pro",
            "description": "苹果最新旗舰手机，配备 A17 Pro 芯片，钛金属设计",
            "price": 7999.00,
            "stock": 50,
            "image_url": "https://web-ui-tester.bj.bcebos.com/v1/public/public/photo-1592750475338-74b7b21085ab.jpeg?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "MacBook Pro 14英寸",
            "description": "搭载 M3 芯片的专业笔记本电脑，适合开发和创作",
            "price": 14999.00,
            "stock": 30,
            "image_url": "https://web-ui-tester.bj.bcebos.com/v1/public/public/photo-1541807084-5c52b6b3adef.jpeg?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "AirPods Pro (第2代)",
            "description": "主动降噪无线耳机，带有空间音频功能",
            "price": 1899.00,
            "stock": 100,
            "image_url": "https://web-ui-tester.bj.bcebos.com/v1/public/public/photo-1572569511254-d8f925fe2cbb.jpeg?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "iPad Air",
            "description": "轻薄强大的平板电脑，支持 Apple Pencil",
            "price": 4399.00,
            "stock": 40,
            "image_url": "https://web-ui-tester.bj.bcebos.com/v1/public/public/photo-1544244015-0df4b3ffc6b0.jpeg?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Nintendo Switch OLED",
            "description": "任天堂游戏主机，OLED 屏幕版本",
            "price": 2399.00,
            "stock": 25,
            "image_url": "https://web-ui-tester.bj.bcebos.com/v1/public/public/photo-1578662996442-48f60103fc96.jpeg?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Sony WH-1000XM5",
            "description": "索尼顶级降噪耳机，音质出色",
            "price": 2399.00,
            "stock": 35,
            "image_url": "https://web-ui-tester.bj.bcebos.com/v1/public/public/photo-1583394838336-acd977736f90.jpeg?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        }
    ]
    
    # 插入商品数据
    result = await db.products.insert_many(sample_products)
    print(f"✅ 成功插入 {len(result.inserted_ids)} 个示例商品")


async def init_sample_user():
    """初始化示例普通用户"""
    print("👥 检查示例用户...")
    
    db = await get_database()
    
    # 检查是否已存在示例用户
    demo_user = await db.users.find_one({"username": "demo123"})
    if demo_user:
        print("ℹ️  示例用户已存在，跳过创建")
        return
    
    # 创建示例用户
    demo_data = {
        "username": "demo123",
        "hashed_password": get_password_hash("123456"),
        "is_admin": False,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(demo_data)
    print("✅ 示例用户创建成功")
    print("   用户名: demo123")
    print("   密码: 123456")


async def main():
    """主初始化函数"""
    print("🚀 开始初始化 Echo-Commerce 数据...")
    print(f"📊 数据库: {settings.DATABASE_NAME}")
    print(f"🔗 连接: {settings.MONGODB_URL}")
    print("=" * 50)
    
    try:
        # 导入数据库模块以建立连接
        from app.core.database import connect_to_mongo
        await connect_to_mongo()
        
        # 执行初始化步骤
        await check_and_create_indexes()
        await init_admin_user()
        await init_sample_user()
        await init_sample_products()
        
        print("=" * 50)
        print("🎉 数据初始化完成！")
        print("🌐 您现在可以启动应用了")
        print("📚 访问 http://localhost:8000/docs 查看 API 文档")
        print("🛒 访问 http://localhost:3000 使用前端应用")
        
    except Exception as e:
        print(f"❌ 初始化失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main()) 