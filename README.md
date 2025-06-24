# Echo-Commerce 智能化测试演示平台

基于 FastAPI + Next.js + MongoDB 的现代化电商系统，采用前后端分离架构，支持 Docker 一键部署。

## 📋 项目简介

Echo-Commerce 是一个功能完整的电商系统演示平台，包含用户管理、商品管理、购物车和订单等核心电商业务流程。

### 🏗️ 技术栈

**后端**
- Python 3.11+
- FastAPI (Web 框架)
- MongoDB (数据库)
- Motor (异步 MongoDB 驱动)
- JWT (身份认证)
- Pydantic (数据验证)

**前端**
- Next.js 14 (React 框架)
- TypeScript
- Tailwind CSS (样式框架)
- Zustand (状态管理)
- Axios (HTTP 客户端)

**部署**
- Docker & Docker Compose
- MongoDB 容器

## 🚀 功能特性

### 👤 用户管理
- 用户注册和登录
- JWT Token 认证
- 管理员权限控制

### 🛍️ 商品管理
- 商品列表浏览（支持分页）
- 商品详情查看
- 管理员后台管理（增删改查）

### 🛒 购物车
- 添加商品到购物车
- 修改商品数量
- 删除购物车商品
- 实时库存检查

### 📦 订单管理
- 从购物车创建订单
- 订单列表查看
- 订单详情查看
- 自动减库存

## 🛠️ 快速开始

### 前置要求

- Docker 和 Docker Compose
- Git

### 一键部署

1. **克隆项目**
```bash
git clone https://github.com/wangzhe0912/Echo-Commerce.git
cd Echo-Commerce
```

2. **启动服务**
```bash
docker-compose up -d
```

3. **访问应用**
- 前端应用：http://localhost:3000
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs

### 数据初始化

项目启动时会自动检查并初始化必要数据：
- 管理员账户
- 示例商品数据

如需手动初始化数据：
```bash
# 使用 Make 命令
make init-db

# 或直接运行脚本
cd backend && python init_db.py
```

### 默认账户

**管理员账户**
- 用户名：`admin`
- 密码：`admin123`

**示例用户账户**
- 用户名：`demo123` 
- 密码：`123456`

## 📁 项目结构

```
Echo-Commerce/
├── backend/                 # 后端 FastAPI 应用
│   ├── app/
│   │   ├── api/            # API 路由
│   │   ├── core/           # 核心配置
│   │   ├── models/         # 数据模型
│   │   └── main.py         # 应用入口
│   ├── requirements.txt     # Python 依赖
│   └── Dockerfile          # 后端容器配置
├── frontend/               # 前端 Next.js 应用
│   ├── app/                # Next.js 13+ App Router
│   ├── components/         # React 组件
│   ├── contexts/           # React 上下文
│   ├── lib/                # 工具库
│   ├── types/              # TypeScript 类型
│   ├── package.json        # Node.js 依赖
│   └── Dockerfile          # 前端容器配置
├── scripts/                # 部署脚本
│   └── init-mongo.js       # MongoDB 初始化脚本
├── docker-compose.yml      # Docker Compose 配置
└── README.md               # 项目文档
```

## 📖 API 文档

后端提供完整的 RESTful API，启动后访问 http://localhost:8000/docs 查看 Swagger 文档。

### 主要接口

**认证相关**
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

**商品相关**
- `GET /api/products` - 获取商品列表
- `GET /api/products/{id}` - 获取商品详情
- `POST /api/products` - 创建商品（管理员）
- `PUT /api/products/{id}` - 更新商品（管理员）
- `DELETE /api/products/{id}` - 删除商品（管理员）

**购物车相关**
- `GET /api/cart` - 获取购物车
- `POST /api/cart/items` - 添加商品到购物车
- `PUT /api/cart/items/{id}` - 更新购物车商品
- `DELETE /api/cart/items/{id}` - 删除购物车商品

**订单相关**
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/{id}` - 获取订单详情

## 🔧 开发环境

### 后端开发

1. **进入后端目录**
```bash
cd backend
```

2. **创建虚拟环境**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows
```

3. **安装依赖**
```bash
pip install -r requirements.txt
```

4. **启动开发服务器**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 前端开发

1. **进入前端目录**
```bash
cd frontend
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

## 🗄️ 数据库

项目使用 MongoDB 作为数据库，主要集合包括：

- `users` - 用户信息
- `products` - 商品信息
- `cart` - 购物车
- `orders` - 订单
- `order_items` - 订单明细

## 🔒 环境变量

### 后端环境变量

创建 `backend/.env` 文件：

```env
MONGODB_URL=mongodb://admin:password123@localhost:27017/echo_commerce?authSource=admin
DATABASE_NAME=echo_commerce
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

### 前端环境变量

创建 `frontend/.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚢 部署指南

### 生产环境部署

1. **修改配置**
   - 更改 `docker-compose.yml` 中的密码和密钥
   - 设置 `DEBUG=false`
   - 配置域名和 HTTPS

2. **构建镜像**
```bash
docker-compose build
```

3. **启动服务**
```bash
docker-compose up -d
```

### 数据备份

```bash
# 备份 MongoDB 数据
docker exec echo-commerce-mongo mongodump --db echo_commerce --out /backup

# 恢复数据
docker exec echo-commerce-mongo mongorestore --db echo_commerce /backup/echo_commerce
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📧 联系方式

- 项目地址：https://github.com/wangzhe0912/Echo-Commerce
- 问题反馈：https://github.com/wangzhe0912/Echo-Commerce/issues

## 🎯 路线图

- [ ] 支付集成
- [ ] 商品评价系统
- [ ] 订单状态流转
- [ ] 商品搜索功能
- [ ] 用户收藏夹
- [ ] 多语言支持
- [ ] 移动端适配优化

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
