// MongoDB 初始化脚本
// 创建数据库用户和插入示例数据

// 切换到 echo_commerce 数据库
db = db.getSiblingDB('echo_commerce');

// 创建用户集合索引
db.users.createIndex({ "username": 1 }, { unique: true });

// 创建商品集合索引
db.products.createIndex({ "name": 1 });
db.products.createIndex({ "created_at": -1 });

// 创建购物车集合索引
db.cart.createIndex({ "user_id": 1, "product_id": 1 }, { unique: true });

// 创建订单集合索引
db.orders.createIndex({ "user_id": 1 });
db.orders.createIndex({ "order_number": 1 }, { unique: true });
db.orders.createIndex({ "created_at": -1 });

// 创建订单项集合索引
db.order_items.createIndex({ "order_id": 1 });

print('MongoDB 初始化完成!');

// 插入示例商品数据
db.products.insertMany([
  {
    name: "iPhone 15 Pro",
    description: "苹果最新旗舰手机，配备 A17 Pro 芯片，钛金属设计",
    price: 7999.00,
    stock: 50,
    image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    created_at: new Date()
  },
  {
    name: "MacBook Pro 14\"",
    description: "搭载 M3 芯片的专业笔记本电脑，适合开发和创作",
    price: 14999.00,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
    created_at: new Date()
  },
  {
    name: "AirPods Pro (第2代)",
    description: "主动降噪无线耳机，带有空间音频功能",
    price: 1899.00,
    stock: 100,
    image_url: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400",
    created_at: new Date()
  },
  {
    name: "iPad Air",
    description: "轻薄强大的平板电脑，支持 Apple Pencil",
    price: 4399.00,
    stock: 40,
    image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
    created_at: new Date()
  },
  {
    name: "Apple Watch Series 9",
    description: "智能手表，健康监测和运动追踪功能",
    price: 2999.00,
    stock: 60,
    image_url: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400",
    created_at: new Date()
  },
  {
    name: "Nintendo Switch",
    description: "任天堂游戏主机，随时随地畅玩游戏",
    price: 2099.00,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    created_at: new Date()
  },
  {
    name: "Sony WH-1000XM5",
    description: "顶级降噪耳机，音质出色",
    price: 2399.00,
    stock: 35,
    image_url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
    created_at: new Date()
  },
  {
    name: "Tesla Model 3 车载充电器",
    description: "便携式电动车充电设备",
    price: 1299.00,
    stock: 15,
    image_url: "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400",
    created_at: new Date()
  }
]);

print('示例商品数据插入完成!');

// 创建管理员账户
// 注意：这里的密码哈希是 "admin123" 的 bcrypt 哈希值
db.users.insertOne({
  username: "admin",
  hashed_password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewreZhVz.VekTmKq",
  is_admin: true,
  created_at: new Date()
});

print('管理员账户创建完成!');
print('用户名: admin');
print('密码: admin123'); 