# 快速启动指南

## 5分钟快速开始

### 第一步：克隆项目并安装依赖

```bash
cd blueberry-payroll
npm install
```

### 第二步：配置数据库

1. 访问 [neon.tech](https://neon.tech)，创建免费账户
2. 创建新项目，获取连接字符串（格式：`postgresql://user:password@host/dbname?sslmode=require`）
3. 复制 `.env.example` 为 `.env`
4. 编辑 `.env`，填入数据库连接字符串和 JWT 密钥：

```env
DATABASE_URL=postgresql://neondb_owner:npg_xxx@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-super-secret-key-change-this
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 第三步：初始化数据库

在 Neon 控制台的 SQL Editor 中执行 `database/schema.sql` 中的所有 SQL 语句。

### 第四步：启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 或生产模式
npm start
```

服务将在 `http://localhost:3000` 启动。

### 第五步：访问应用

打开浏览器访问 `http://localhost:3000`

**演示账号**:
- 管理员：admin@blueberry.com / admin123
- 部门经理：manager@blueberry.com / manager123
- 员工：employee@blueberry.com / employee123

## 项目结构速览

```
src/
├── app.js              # Express 应用入口
├── config/            # 配置（数据库、JWT、常量）
├── middleware/        # 中间件（认证、权限、审计、错误处理）
├── models/           # 数据模型（7个）
├── services/         # 业务逻辑（8个）
├── controllers/      # 控制器（11个）
├── routes/          # 路由（11个）
└── utils/           # 工具函数

public/
├── index.html       # 登录/注册页（已完成）
├── css/            # 样式文件
└── js/             # JavaScript 文件
```

## 核心 API 端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/change-password` - 修改密码
- `GET /api/auth/profile` - 获取个人信息
- `PUT /api/auth/profile` - 更新个人信息

### 工作记录
- `GET /api/records` - 查询工作记录
- `POST /api/records` - 录入工作记录
- `DELETE /api/records/:id` - 删除工作记录
- `GET /api/records/export/csv` - 导出为 CSV

### 工资单
- `GET /api/payrolls` - 查询工资单
- `POST /api/payrolls` - 生成工资单（仅管理员）
- `PATCH /api/payrolls/:id/adjust` - 调整奖金/扣除
- `POST /api/payrolls/:id/confirm` - 确认工资单
- `POST /api/payrolls/:id/pay` - 发放工资单
- `GET /api/payrolls/export/csv` - 导出为 CSV

### 用户审核
- `GET /api/approvals` - 获取待审核用户
- `POST /api/approvals/:id/approve` - 批准用户
- `POST /api/approvals/:id/reject` - 拒绝用户

### 数据看板
- `GET /api/dashboard/stats` - 获取统计数据

### 其他
- `GET /api/health` - 健康检查

## 常见问题

### Q: 如何修改 JWT 过期时间？
A: 编辑 `.env` 中的 `JWT_EXPIRES_IN`，例如 `JWT_EXPIRES_IN=30d`

### Q: 如何添加新的计件规格？
A: 登录为部门经理或管理员，进入"计件管理"页面，点击"新增规格"

### Q: 如何生成月度工资单？
A: 登录为管理员，进入"工资查询"页面，点击"生成工资单"，选择周期

### Q: 如何导出数据？
A: 各页面都有"导出"按钮，支持导出为 CSV 或 JSON

### Q: 如何查看审计日志？
A: 登录为管理员，进入"数据维护"页面，查看"系统日志"

## 开发建议

### 后端开发
1. 所有业务逻辑都在 `services/` 中
2. 所有数据库操作都在 `models/` 中
3. 所有 API 端点都在 `routes/` 中
4. 使用 `utils/response.js` 统一响应格式
5. 使用 `utils/validators.js` 验证输入

### 前端开发
1. 使用 `api.js` 调用后端 API
2. 使用 `localStorage` 存储 token 和用户信息
3. 使用 `common.css` 中的样式类
4. 为每个页面创建对应的 HTML、CSS、JS 文件

### 数据库操作
1. 所有查询都使用参数化查询（防止 SQL 注入）
2. 使用事务处理复杂操作
3. 为常用查询添加索引
4. 定期备份数据

## 部署到生产环境

### 后端部署（Render）

1. 在 [render.com](https://render.com) 创建账户
2. 连接 GitHub 仓库
3. 创建新 Web Service
4. 配置：
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: 填入 DATABASE_URL 和 JWT_SECRET
5. 部署

### 前端部署（Netlify）

1. 在 [netlify.com](https://netlify.com) 创建账户
2. 连接 GitHub 仓库
3. 配置：
   - Build Command: （留空，因为是静态文件）
   - Publish Directory: `public`
4. 部署

### 数据库部署（Neon）

1. 在 [neon.tech](https://neon.tech) 创建账户
2. 创建新项目
3. 获取连接字符串
4. 在 SQL Editor 中执行 `database/schema.sql`

## 性能优化建议

1. **数据库**：为常用查询添加索引
2. **缓存**：使用 Redis 缓存热数据
3. **分页**：所有列表查询都支持分页
4. **压缩**：启用 gzip 压缩
5. **CDN**：前端静态文件使用 CDN

## 安全建议

1. **密码**：使用 bcryptjs 加密存储
2. **认证**：使用 JWT，设置合理的过期时间
3. **授权**：实现细粒度的权限控制
4. **审计**：记录所有关键操作
5. **HTTPS**：生产环境必须使用 HTTPS
6. **CORS**：配置合理的 CORS 策略
7. **SQL 注入**：使用参数化查询

## 监控与日志

1. **日志**：使用 `utils/logger.js` 记录日志
2. **监控**：使用 Render 或 Koyeb 的监控功能
3. **告警**：配置关键指标告警
4. **备份**：定期备份数据库

## 支持与反馈

如有问题或建议，请联系项目经理或技术支持。

---

**最后更新**: 2026-03-27  
**版本**: 1.0.0
