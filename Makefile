.PHONY: help install dev build up down clean logs init-db

help:
	@echo "Echo-Commerce 开发工具"
	@echo ""
	@echo "可用命令:"
	@echo "  install    - 安装依赖"
	@echo "  init-db    - 初始化数据库数据"
	@echo "  dev        - 启动开发环境"
	@echo "  build      - 构建 Docker 镜像"
	@echo "  up         - 启动服务"
	@echo "  down       - 停止服务"
	@echo "  clean      - 清理资源"
	@echo "  logs       - 查看日志"

install:
	@echo "安装后端依赖..."
	cd backend && pip install -r requirements.txt
	@echo "安装前端依赖..."
	cd frontend && npm install

init-db:
	@echo "初始化数据库数据..."
	cd backend && python init_db.py

dev:
	@echo "启动开发环境..."
	docker-compose up -d mongo
	@echo "等待 MongoDB 启动..."
	sleep 5
	@echo "初始化数据库..."
	cd backend && python init_db.py
	@echo "启动后端服务..."
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
	@echo "启动前端服务..."
	cd frontend && npm run dev &

build:
	@echo "构建 Docker 镜像..."
	docker-compose build

up:
	@echo "启动所有服务..."
	docker-compose up -d
	@echo "等待服务启动..."
	sleep 10
	@echo "🎉 服务启动完成!"
	@echo "🌐 前端访问: http://localhost:3000"
	@echo "📚 API 文档: http://localhost:8000/docs"
	@echo "👤 管理员账号: admin / admin123"

down:
	@echo "停止所有服务..."
	docker-compose down

clean:
	@echo "清理 Docker 资源..."
	docker-compose down -v
	docker system prune -f

logs:
	docker-compose logs -f 