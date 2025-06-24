# Echo-Commerce 后端

基于 FastAPI 的电商系统后端 API。

## 快速开始

### 1. 环境变量配置

在启动应用之前，需要配置环境变量：

```bash
# 复制环境变量模板
cp env.template .env

# 编辑环境变量文件
vim .env  # 或使用你喜欢的编辑器
```

### 2. 本地开发

```bash
# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Docker 部署

```bash
# 构建镜像
docker build -t echo-commerce-backend .

# 运行容器
docker run -p 8000:8000 --env-file .env echo-commerce-backend
```

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `MONGODB_URL` | MongoDB 连接地址 | `mongodb://mongo:27017` |
| `DATABASE_NAME` | 数据库名称 | `echo_commerce` |
| `SECRET_KEY` | JWT 签名密钥 | 需要修改 |
| `DEBUG` | 调试模式 | `true` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT 过期时间（分钟） | `30` |

## API 文档

启动服务后，访问以下地址查看 API 文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构

```
backend/
├── app/
│   ├── api/          # API 路由
│   ├── core/         # 核心配置
│   ├── models/       # 数据模型
│   └── main.py       # 应用入口
├── Dockerfile        # Docker 配置
├── requirements.txt  # Python 依赖
└── env.template      # 环境变量模板
``` 