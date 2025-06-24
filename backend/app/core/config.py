import os
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore'  # 忽略额外的环境变量
    )
    
    # 基础配置
    APP_NAME: str = "Echo-Commerce"
    DEBUG: bool = True
    
    # 数据库配置
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "echo_commerce"
    
    # JWT 配置
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # CORS 配置 - 使用字符串，稍后处理为列表
    ALLOWED_HOSTS_STR: str = Field(default="http://localhost:3000,http://127.0.0.1:3000", alias="ALLOWED_HOSTS")
    
    @property
    def ALLOWED_HOSTS(self) -> List[str]:
        """将逗号分隔的字符串转换为列表"""
        return [host.strip() for host in self.ALLOWED_HOSTS_STR.split(',') if host.strip()]

settings = Settings() 