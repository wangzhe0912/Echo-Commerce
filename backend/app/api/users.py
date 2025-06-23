from fastapi import APIRouter, Depends
from app.models.user import UserResponse
from app.api.auth import get_current_user_obj

router = APIRouter()

@router.get("/profile", response_model=UserResponse, summary="获取用户档案")
async def get_user_profile(current_user = Depends(get_current_user_obj)):
    """获取当前用户的详细信息"""
    return UserResponse(
        id=str(current_user["_id"]),
        username=current_user["username"],
        is_admin=current_user["is_admin"],
        created_at=current_user["created_at"]
    ) 