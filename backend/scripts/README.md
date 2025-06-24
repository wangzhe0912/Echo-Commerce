# 数据初始化脚本说明

## 📋 脚本列表

### 1. `init_data.py` - 完整初始化脚本
功能强大的 Python 初始化脚本，包含以下功能：
- 创建数据库索引
- 初始化管理员用户
- 创建示例普通用户
- 插入示例商品数据

**使用方法：**
```bash
cd backend
python scripts/init_data.py
```

### 2. `../init_db.py` - 快速初始化脚本
简化版初始化脚本，直接调用完整脚本。

**使用方法：**
```bash
cd backend
python init_db.py
```

## 🗄️ 初始化数据内容

### 👤 用户数据

**管理员用户**
- 用户名：`admin`
- 密码：`admin123`
- 权限：管理员

**示例用户**
- 用户名：`demo123`
- 密码：`123456`
- 权限：普通用户

### 🛍️ 商品数据

初始化脚本会插入 12 个示例商品，包括：

1. **iPhone 15 Pro** - ¥7,999
2. **MacBook Pro 14英寸** - ¥14,999
3. **AirPods Pro (第2代)** - ¥1,899
4. **iPad Air** - ¥4,399
5. **Apple Watch Series 9** - ¥2,999
6. **Nintendo Switch OLED** - ¥2,399
7. **Sony WH-1000XM5** - ¥2,399
8. **小米13 Ultra** - ¥5,999
9. **Tesla Model 3 无线充电板** - ¥1,299
10. **戴森 V15 Detect 吸尘器** - ¥4,690
11. **罗技 MX Master 3S 鼠标** - ¥799
12. **Kindle Paperwhite** - ¥998

所有商品都包含：
- 详细描述
- 库存数量
- 高质量图片链接（Unsplash）
- 创建时间

### 📊 数据库索引

脚本会自动创建以下索引：

**用户集合 (users)**
- `username` (唯一索引)

**商品集合 (products)**
- `name` (普通索引)
- `created_at` (降序索引)

**购物车集合 (cart)**
- `user_id + product_id` (唯一复合索引)

**订单集合 (orders)**
- `user_id` (普通索引)
- `order_number` (唯一索引)
- `created_at` (降序索引)

**订单项集合 (order_items)**
- `order_id` (普通索引)

## 🚀 自动初始化

应用启动时会自动检查并初始化数据：

1. **应用启动检查** - `app/main.py` 中的 `check_and_init_data()` 函数
2. **智能检测** - 只在数据缺失时才执行初始化
3. **安全机制** - 初始化失败不会影响应用启动

## 🛠️ 使用场景

### 首次部署
```bash
# Docker 部署
docker-compose up -d

# 本地开发
make dev
```

### 重置数据
```bash
# 清空数据库后重新初始化
make clean
make up
```

### 手动初始化
```bash
# 单独运行初始化脚本
make init-db
```

## ⚠️ 注意事项

1. **生产环境** - 请修改默认密码
2. **数据安全** - 初始化前会检查现有数据，避免重复创建
3. **图片资源** - 使用 Unsplash 提供的高质量图片
4. **索引创建** - 自动创建性能优化索引

## 🔧 自定义配置

如需修改初始化数据，编辑 `init_data.py` 文件中的：
- `sample_products` 数组 - 修改商品数据
- `admin_data` 对象 - 修改管理员信息
- `demo_data` 对象 - 修改示例用户信息 