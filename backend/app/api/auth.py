from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from app.models.user import UserCreate, UserLogin, Token, User, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token, verify_token
from app.core.database import get_users_collection
from bson import ObjectId

router = APIRouter()

@router.post("/register", response_model=Token, summary="用户注册")
async def register(user: UserCreate):
    """
    用户注册
    - **username**: 用户名，6-20位字符
    - **password**: 密码，至少6位字符
    """
    users_collection = get_users_collection()
    
    # 检查用户名是否已存在
    existing_user = await users_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 创建新用户
    user_dict = user.dict()
    user_dict["hashed_password"] = get_password_hash(user.password)
    del user_dict["password"]
    user_dict["is_admin"] = False
    
    result = await users_collection.insert_one(user_dict)
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    
    # 生成token
    access_token = create_access_token(data={"sub": user.username})
    
    user_response = UserResponse(
        id=str(created_user["_id"]),
        username=created_user["username"],
        is_admin=created_user["is_admin"],
        created_at=created_user["created_at"]
    )
    
    return Token(access_token=access_token, user=user_response)

@router.post("/login", response_model=Token, summary="用户登录")
async def login(user_credentials: UserLogin):
    """
    用户登录
    - **username**: 用户名
    - **password**: 密码
    """
    users_collection = get_users_collection()
    
    # 查找用户
    user = await users_collection.find_one({"username": user_credentials.username})
    if not user or not verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 生成token
    access_token = create_access_token(data={"sub": user["username"]})
    
    user_response = UserResponse(
        id=str(user["_id"]),
        username=user["username"],
        is_admin=user["is_admin"],
        created_at=user["created_at"]
    )
    
    return Token(access_token=access_token, user=user_response)

@router.get("/me", response_model=UserResponse, summary="获取当前用户信息")
async def get_current_user(username: str = Depends(verify_token)):
    """获取当前登录用户的信息"""
    users_collection = get_users_collection()
    
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return UserResponse(
        id=str(user["_id"]),
        username=user["username"],
        is_admin=user["is_admin"],
        created_at=user["created_at"]
    )

async def get_current_user_obj(username: str = Depends(verify_token)):
    """获取当前用户对象（内部使用）"""
    users_collection = get_users_collection()
    
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    return user 