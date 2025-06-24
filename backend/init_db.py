#!/usr/bin/env python3
"""
快速数据库初始化脚本
使用方法: python init_db.py
"""

import asyncio
from scripts.init_data import main

if __name__ == "__main__":
    print("🏃‍♂️ 运行数据库初始化脚本...")
    asyncio.run(main()) 