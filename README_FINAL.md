# 🎉 蓝莓计件工资系统 - 已完成！

## 📦 项目位置

```
C:\Users\Administrator\.qclaw\workspace\blueberry-payroll
```

---

## 🚀 快速启动（3 步）

### 方法一：使用批处理脚本（推荐）

1. **双击运行 `start.bat`**
   - 自动安装依赖
   - 自动创建 `.env` 配置文件
   - 启动服务

2. **编辑 `.env` 文件**
   - 填入你的 Neon 数据库连接字符串
   - 格式：`DATABASE_URL=postgresql://...`

3. **双击运行 `init-db.bat`**
   - 创建默认账号和示例数据

### 方法二：手动操作

```bash
# 1. 进入项目目录
cd C:\Users\Administrator\.qclaw\workspace\blueberry-payroll

# 2. 安装依赖
npm install --registry=https://registry.npmmirror.com

# 3. 配置环境变量
copy .env.example .env
# 编辑 .env，填入 DATABASE_URL

# 4. 在 Neon 控制台执行 database/schema.sql

# 5. 初始化数据
npm run init-db

# 6. 启动服务
npm run dev
```

---

## 🔑 默认账号

| 角色 | 邮箱 | 密码 | 权限 |
|------|------|------|------|
| 管理员 | admin@blueberry.com | admin123 | 全局管理 |
| 部门经理 | manager@blueberry.com | manager123 | 本部门管理 |
| 员工 | employee@blueberry.com | employee123 | 查看个人数据 |

---

## 📊 功能清单

### ✅ 后端（50+ API 端点）
- 认证：登录、注册、修改密码
- 用户：管理用户、重置密码
- 部门：部门增删改查
- 小组：小组管理（自动命名）
- 计件规格：规格管理
- 工作记录：录入、查询、删除
- 工资单：生成、调整、确认、发放
- 审计日志：操作记录
- 数据导出：CSV、JSON

### ✅ 前端（11 个页面）
- 登录/注册页面
- 数据看板
- 工作记录管理
- 工资查询
- 用户审核
- 部门管理
- 用户管理
- 小组管理
- 计件管理
- 个人设置
- 数据维护

---

## 🔧 常见问题

### Q1: 安装依赖很慢？
使用国内镜像：
```bash
npm install --registry=https://registry.npmmirror.com
```

### Q2: 数据库连接失败？
检查 `.env` 中的 `DATABASE_URL`：
- 确保包含 `sslmode=require`
- 确保 Neon 项目处于活跃状态（不会自动暂停）

### Q3: 启动后无法访问？
检查端口是否被占用：
```bash
netstat -ano | findstr :3000
```

### Q4: 登录后 500 错误？
确认已执行：
1. `database/schema.sql`（建表）
2. `npm run init-db`（初始化数据）

---

## 📁 项目结构

```
blueberry-payroll/
├── start.bat              # 一键启动脚本
├── init-db.bat            # 数据库初始化脚本
├── package.json           # 项目配置
├── .env.example           # 环境变量示例
├── README.md              # 项目说明
├── START_GUIDE.md         # 启动指南
│
├── src/                   # 后端代码
│   ├── app.js            # Express 入口
│   ├── config/           # 配置
│   ├── middleware/       # 中间件
│   ├── models/           # 数据模型
│   ├── services/         # 业务逻辑
│   ├── controllers/      # 控制器
│   ├── routes/           # 路由
│   └── utils/            # 工具函数
│
├── public/                # 前端代码
│   ├── index.html        # 登录页
│   ├── dashboard.html    # 数据看板
│   └── ...               # 其他页面
│
├── database/              # 数据库脚本
│   ├── schema.sql        # 建表脚本
│   └── seed.sql          # 初始数据
│
└── scripts/               # 工具脚本
    └── init-db.js        # 数据库初始化
```

---

## 🎯 下一步

### 开发测试
1. 用管理员账号登录
2. 测试各功能模块
3. 添加更多计件规格
4. 录入工作记录
5. 生成工资单

### 生产部署
1. **修改密码**：更改默认账号密码
2. **修改密钥**：更改 `.env` 中的 `JWT_SECRET`
3. **部署后端**：部署到 Render / Koyeb / Zeabur
4. **部署前端**：部署到 Netlify / Vercel

---

## 📞 技术支持

如遇问题，请检查：
1. 后端控制台日志
2. 浏览器控制台（F12）
3. Neon 数据库控制台

---

**最后更新**: 2026-03-28  
**版本**: 1.0.0  
**状态**: ✅ 完成并可立即使用
