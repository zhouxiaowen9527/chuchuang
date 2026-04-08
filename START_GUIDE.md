# 🚀 蓝莓计件工资系统 - 快速启动指南

## 第一步：安装依赖

```bash
cd C:\Users\Administrator\.qclaw\workspace\blueberry-payroll
npm install
```

## 第二步：配置环境变量

复制 `.env.example` 为 `.env`：

```bash
copy .env.example .env
```

编辑 `.env`，填入你的 Neon 数据库连接字符串：

```env
DATABASE_URL=postgresql://neondb_owner:npg_xxx@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secret-key-change-this
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 第三步：初始化数据库

### 3.1 执行建表脚本

在 Neon 控制台的 SQL Editor 中执行：

**文件位置**: `database/schema.sql`

复制该文件的全部内容，在 Neon SQL Editor 中执行。

### 3.2 初始化默认数据

```bash
npm run init-db
```

这会创建：
- 3 个部门
- 3 个默认用户（管理员、部门经理、员工）
- 5 个计件规格示例

## 第四步：启动服务

```bash
npm run dev
```

服务将在 `http://localhost:3000` 启动。

## 第五步：测试登录

打开浏览器访问：`http://localhost:3000`

**默认账号**：

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@blueberry.com | admin123 |
| 部门经理 | manager@blueberry.com | manager123 |
| 员工 | employee@blueberry.com | employee123 |

---

## 常见问题

### Q1: npm install 失败？
尝试使用国内镜像：
```bash
npm install --registry=https://registry.npmmirror.com
```

### Q2: 数据库连接失败？
检查 `.env` 中的 `DATABASE_URL` 是否正确，确保包含 `sslmode=require`。

### Q3: 初始化数据失败？
手动在 Neon SQL Editor 中执行 `database/schema.sql` 和 `database/seed.sql`。

### Q4: 登录后出现 500 错误？
检查后端控制台的错误日志，通常是数据库表未创建或数据未初始化。

---

## 开发建议

### 测试流程
1. 先用管理员账号登录，检查数据看板
2. 创建部门、小组、计件规格
3. 创建员工账号
4. 录入工作记录
5. 生成工资单

### 生产部署
1. 修改 `.env` 中的 `JWT_SECRET` 为强密码
2. 设置 `NODE_ENV=production`
3. 部署到 Render / Koyeb / Zeabur

---

## 项目结构

```
blueberry-payroll/
├── src/                    # 后端源代码
│   ├── app.js             # 入口文件
│   ├── config/            # 配置
│   ├── middleware/        # 中间件
│   ├── models/            # 数据模型
│   ├── services/          # 业务逻辑
│   ├── controllers/       # 控制器
│   ├── routes/            # 路由
│   └── utils/             # 工具函数
├── public/                # 前端代码
│   ├── index.html         # 登录页
│   ├── dashboard.html     # 数据看板
│   └── ...                # 其他页面
├── database/              # 数据库脚本
│   ├── schema.sql         # 建表脚本
│   └── seed.sql           # 初始数据
└── scripts/               # 工具脚本
    └── init-db.js         # 数据库初始化
```

---

## 技术支持

如遇问题，请检查：
1. 后端控制台日志
2. 浏览器控制台日志
3. Neon 数据库控制台

**最后更新**: 2026-03-28
