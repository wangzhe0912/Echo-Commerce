import motor.motor_asyncio
from app.core.config import settings

class DataBase:
    client: motor.motor_asyncio.AsyncIOMotorClient = None
    database: motor.motor_asyncio.AsyncIOMotorDatabase = None

database = DataBase()

async def get_database() -> motor.motor_asyncio.AsyncIOMotorDatabase:
    return database.database

async def connect_to_mongo():
    """创建数据库连接"""
    database.client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    database.database = database.client[settings.DATABASE_NAME]
    print("Connected to MongoDB")

async def close_mongo_connection():
    """关闭数据库连接"""
    if database.client:
        database.client.close()
        print("Disconnected from MongoDB")

# 集合获取函数
def get_users_collection():
    return database.database.users

def get_products_collection():
    return database.database.products

def get_cart_collection():
    return database.database.cart

def get_orders_collection():
    return database.database.orders

def get_order_items_collection():
    return database.database.order_items 