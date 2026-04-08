# 蓝莓计件工资系统

楚创人力资源服务有限公司计件工资管理系统。

## 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <repo-url>
cd blueberry-payroll

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入 Neon 数据库连接字符串和 JWT 密钥
```

### 2. 数据库初始化

在 Neon 控制台执行 `database/schema.sql` 中的 SQL 脚本。

### 3. 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:3000` 启动。

## 项目结构

```
src/
├── app.js                 # Express 应用入口
├── config/               # 配置
│   ├── database.js      # 数据库连接池
│   ├── auth.js          # JWT 配置
│   └── constants.js     # 常量定义
├── middleware/          # 中间件
│   ├── auth.js         # JWT 验证
│   ├── rbac.js         # 权限控制
│   ├── audit.js        # 审计日志
│   └── errorHandler.js # 错误处理
├── models/             # 数据模型
├── services/           # 业务逻辑
├── controllers/        # 控制器
├── routes/            # 路由
└── utils/             # 工具函数
```

## API 文档

### 认证

#### 注册
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456",
  "confirm_password": "123456",
  "real_name": "张三",
  "phone": "13800000000",
  "id_card": "110101199003071234",
  "bank_name": "张三",
  "bank_card": "6222020000000000000",
  "bank_bank": "中国银行"
}
```

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}

Response:
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "real_name": "张三",
      "role": "employee",
      "department_id": "uuid"
    }
  }
}
```

### 工作记录

#### 录入工作记录
```
POST /api/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "group_id": "uuid",
  "work_date": "2026-03-27",
  "items": [
    {
      "spec_id": "uuid",
      "quantity": 100
    },
    {
      "spec_id": "uuid",
      "quantity": 50
    }
  ],
  "notes": "备注"
}

Response:
{
  "code": 0,
  "message": "工作记录已录入，小组总收入 ¥1000.00，人均 ¥250.00",
  "data": {
    "group_total": 1000,
    "member_count": 4,
    "per_person": 250,
    "records_count": 8,
    "records": [...]
  }
}
```

#### 查询工作记录
```
GET /api/records?page=1&pageSize=20&start_date=2026-03-01&end_date=2026-03-31
Authorization: Bearer <token>
```

#### 导出工作记录
```
GET /api/records/export/csv
Authorization: Bearer <token>
```

### 工资单

#### 生成月度工资单（仅管理员）
```
POST /api/payrolls
Authorization: Bearer <token>
Content-Type: application/json

{
  "period_start": "2026-03-01",
  "period_end": "2026-03-31"
}
```

#### 查询工资单
```
GET /api/payrolls?page=1&pageSize=20&status=draft
Authorization: Bearer <token>
```

#### 调整奖金/扣除（经理）
```
PATCH /api/payrolls/:id/adjust
Authorization: Bearer <token>
Content-Type: application/json

{
  "bonus": 100,
  "deduction": 50
}
```

#### 确认工资单（仅管理员）
```
POST /api/payrolls/:id/confirm
Authorization: Bearer <token>
```

#### 发放工资单（仅管理员）
```
POST /api/payrolls/:id/pay
Authorization: Bearer <token>
```

### 用户审核

#### 获取待审核用户
```
GET /api/approvals
Authorization: Bearer <token>
```

#### 批准用户
```
POST /api/approvals/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "real_name": "张三",
  "phone": "13800000000",
  "department_id": "uuid",
  "role": "employee"
}
```

#### 拒绝用户
```
POST /api/approvals/:id/reject
Authorization: Bearer <token>
```

## 权限矩阵

| 模块 | 员工 | 部门经理 | 管理员 |
|------|------|---------|--------|
| 查看个人工作记录 | ✓ | ✓ | ✓ |
| 查看本部门工作记录 | - | ✓ | ✓ |
| 录入工作记录 | - | ✓ | ✓ |
| 查看个人工资单 | ✓ | ✓ | ✓ |
| 查看本部门工资单 | - | ✓ | ✓ |
| 生成工资单 | - | - | ✓ |
| 发放工资单 | - | - | ✓ |
| 用户审核 | - | ✓ | ✓ |
| 部门管理 | - | - | ✓ |
| 数据维护 | - | - | ✓ |

## 部署

### Neon 数据库

1. 在 [neon.tech](https://neon.tech) 创建账户
2. 创建新项目，获取连接字符串
3. 在 `.env` 中配置 `DATABASE_URL`

### 后端部署（Render / Koyeb / Zeabur）

以 Render 为例：

1. 连接 GitHub 仓库
2. 创建新 Web Service
3. 配置环境变量（DATABASE_URL, JWT_SECRET）
4. 部署

### 前端部署（Netlify / Vercel）

1. 构建前端（如有）
2. 部署 `public` 目录

## 技术栈

- **后端**: Node.js + Express
- **数据库**: PostgreSQL (Neon)
- **认证**: JWT
- **前端**: 原生 HTML5 / CSS3 / JavaScript

## 许可证

MIT
