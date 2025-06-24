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
            "description": "苹果最新旗舰手机，配备 A17 Pro 芯片，钛金属设计。拍照功能强大，支持 5G 网络，电池续航优秀。",
            "price": 7999.00,
            "stock": 50,
            "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "MacBook Pro 14英寸",
            "description": "搭载 M3 芯片的专业笔记本电脑，适合开发和创作。配备 Liquid Retina XDR 显示屏，性能强劲。",
            "price": 14999.00,
            "stock": 30,
            "image_url": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "AirPods Pro (第2代)",
            "description": "主动降噪无线耳机，带有空间音频功能。自适应透明模式，个性化空间音频体验。",
            "price": 1899.00,
            "stock": 100,
            "image_url": "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "iPad Air",
            "description": "轻薄强大的平板电脑，支持 Apple Pencil (第2代)。M1 芯片加持，适合学习和工作。",
            "price": 4399.00,
            "stock": 40,
            "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Apple Watch Series 9",
            "description": "智能手表，健康监测和运动追踪功能。心率监测、血氧检测、ECG 功能一应俱全。",
            "price": 2999.00,
            "stock": 60,
            "image_url": "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Nintendo Switch OLED",
            "description": "任天堂游戏主机，OLED 屏幕版本。随时随地畅玩游戏，支持掌机和主机模式。",
            "price": 2399.00,
            "stock": 25,
            "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Sony WH-1000XM5",
            "description": "索尼顶级降噪耳机，音质出色。30小时续航，快充功能，通话清晰。",
            "price": 2399.00,
            "stock": 35,
            "image_url": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "小米13 Ultra",
            "description": "徕卡影像旗舰手机，专业摄影体验。骁龙8 Gen2 处理器，120W 快充。",
            "price": 5999.00,
            "stock": 45,
            "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Tesla Model 3 无线充电板",
            "description": "特斯拉原装无线充电板，支持双设备同时充电。完美适配 Model 3/Y 中控台。",
            "price": 1299.00,
            "stock": 15,
            "image_url": "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "戴森 V15 Detect 吸尘器",
            "description": "激光显尘科技，智能清洁检测。强劲吸力，多种吸头配置，适合全屋清洁。",
            "price": 4690.00,
            "stock": 20,
            "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "罗技 MX Master 3S 鼠标",
            "description": "专业无线鼠标，适合办公和设计。精准滚轮，多设备切换，70天续航。",
            "price": 799.00,
            "stock": 80,
            "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Kindle Paperwhite",
            "description": "电子书阅读器，6.8英寸显示屏，防水设计。护眼阅读，数周续航。",
            "price": 998.00,
            "stock": 55,
            "image_url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop",
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