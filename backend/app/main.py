from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.core.config import settings
from app.api import auth, users, products, cart, orders, admin
from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.core.security import get_password_hash
from datetime import datetime

app = FastAPI(
    title="Echo-Commerce API",
    description="智能化测试演示平台 - 电商系统后端API",
    version="1.0.0"
)


async def check_and_init_data():
    """检查并初始化必要数据"""
    try:
        db = await get_database()
        
        # 检查是否需要创建管理员用户
        admin_count = await db.users.count_documents({"is_admin": True})
        if admin_count == 0:
            print("🔧 检测到没有管理员用户，正在创建默认管理员...")
            admin_data = {
                "username": "admin",
                "hashed_password": get_password_hash("admin123"),
                "is_admin": True,
                "created_at": datetime.utcnow()
            }
            await db.users.insert_one(admin_data)
            print("✅ 默认管理员创建成功 (admin/admin123)")
            
        # 检查是否需要添加示例商品
        product_count = await db.products.count_documents({})
        if product_count == 0:
            print("🛍️ 检测到没有商品数据，正在添加示例商品...")
            sample_products = [
                {
                    "name": "iPhone 15 Pro",
                    "description": "苹果最新旗舰手机，配备 A17 Pro 芯片，钛金属设计",
                    "price": 7999.00,
                    "stock": 50,
                    "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop",
                    "created_at": datetime.utcnow()
                },
                {
                    "name": "MacBook Pro 14英寸",
                    "description": "搭载 M3 芯片的专业笔记本电脑，适合开发和创作",
                    "price": 14999.00,
                    "stock": 30,
                    "image_url": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop",
                    "created_at": datetime.utcnow()
                },
                {
                    "name": "AirPods Pro (第2代)",
                    "description": "主动降噪无线耳机，带有空间音频功能",
                    "price": 1899.00,
                    "stock": 100,
                    "image_url": "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=600&fit=crop",
                    "created_at": datetime.utcnow()
                },
                {
                    "name": "iPad Air",
                    "description": "轻薄强大的平板电脑，支持 Apple Pencil",
                    "price": 4399.00,
                    "stock": 40,
                    "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop",
                    "created_at": datetime.utcnow()
                },
                {
                    "name": "Nintendo Switch OLED",
                    "description": "任天堂游戏主机，OLED 屏幕版本",
                    "price": 2399.00,
                    "stock": 25,
                    "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
                    "created_at": datetime.utcnow()
                },
                {
                    "name": "Sony WH-1000XM5",
                    "description": "索尼顶级降噪耳机，音质出色",
                    "price": 2399.00,
                    "stock": 35,
                    "image_url": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop",
                    "created_at": datetime.utcnow()
                }
            ]
            
            await db.products.insert_many(sample_products)
            print(f"✅ 成功添加 {len(sample_products)} 个示例商品")
            
    except Exception as e:
        print(f"⚠️ 数据初始化检查失败: {e}")
        # 不抛出异常，允许应用继续启动

# CORS 中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据库连接事件
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    
    # 检查是否需要初始化数据
    await check_and_init_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# 根路径重定向到API文档
@app.get("/")
async def root():
    return RedirectResponse(url="/docs")

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(users.router, prefix="/api/users", tags=["用户"])
app.include_router(products.router, prefix="/api/products", tags=["商品"])
app.include_router(cart.router, prefix="/api/cart", tags=["购物车"])
app.include_router(orders.router, prefix="/api/orders", tags=["订单"])
app.include_router(admin.router, prefix="/api/admin", tags=["管理员"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 