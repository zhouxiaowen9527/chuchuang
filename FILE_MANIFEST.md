# 蓝莓计件工资系统 - 文件清单

## 项目根目录

```
blueberry-payroll/
├── package.json                    # 项目依赖配置
├── .env.example                    # 环境变量示例
├── README.md                       # 项目说明文档
├── QUICK_START.md                  # 快速启动指南
├── DEVELOPMENT_SUMMARY.md          # 开发完成总结
└── FILE_MANIFEST.md               # 本文件
```

## 数据库目录 (database/)

```
database/
├── schema.sql                      # PostgreSQL 建表脚本（完成）
│   ├── users 表
│   ├── departments 表
│   ├── groups 表
│   ├── group_members 表
│   ├── specs 表
│   ├── records 表
│   ├── payrolls 表
│   └── audit_logs 表
└── seed.sql                        # 初始数据脚本（预留）
```

## 后端源代码 (src/)

### 应用入口
```
src/
└── app.js                          # Express 应用入口（完成）
    ├── 中间件配置
    ├── 路由挂载
    ├── 错误处理
    └── 服务器启动
```

### 配置模块 (src/config/)
```
src/config/
├── database.js                     # PostgreSQL 连接池（完成）
│   ├── 连接池配置
│   ├── 通用查询方法
│   ├── 事务执行器
│   └── 错误处理
├── auth.js                         # JWT 认证配置（完成）
│   ├── Token 生成
│   ├── Token 验证
│   └── 过期时间配置
└── constants.js                    # 系统常量（完成）
    ├── 角色定义（ROLES）
    ├── 用户状态（USER_STATUS）
    ├── 工资单状态（PAYROLL_STATUS）
    ├── 审计操作（AUDIT_ACTIONS）
    ├── 实体类型（ENTITY_TYPES）
    ├── 权限矩阵（PERMISSIONS）
    └── 角色层级（ROLE_HIERARCHY）
```

### 中间件 (src/middleware/)
```
src/middleware/
├── auth.js                         # JWT 验证中间件（完成）
│   ├── Token 提取
│   ├── Token 验证
│   ├── 用户信息查询
│   └── 状态检查
├── rbac.js                         # 角色权限控制中间件（完成）
│   ├── 角色检查
│   ├── 数据范围检查
│   └── 权限验证
├── audit.js                        # 审计日志中间件（完成）
│   ├── 操作记录
│   ├── 实体类型识别
│   └── 日志写入
└── errorHandler.js                 # 全局错误处理（完成）
    ├── 数据库错误处理
    ├── JWT 错误处理
    ├── 404 处理
    └── 500 处理
```

### 数据模型 (src/models/)
```
src/models/
├── user.js                         # 用户模型（完成）
│   ├── findById
│   ├── findByEmail
│   ├── findList
│   ├── create
│   ├── update
│   ├── delete
│   └── 统计方法
├── department.js                   # 部门模型（完成）
│   ├── findById
│   ├── findList
│   ├── findAll
│   ├── create
│   ├── update
│   ├── delete
│   └── countAll
├── group.js                        # 小组模型（完成）
│   ├── findById
│   ├── findList
│   ├── getMembers
│   ├── create
│   ├── updateMembers
│   ├── updateName
│   ├── delete
│   ├── findByDepartment
│   ├── getMemberCount
│   └── countAll
├── spec.js                         # 计件规格模型（完成）
│   ├── findById
│   ├── findList
│   ├── findActive
│   ├── create
│   ├── update
│   ├── toggleActive
│   ├── delete
│   └── countAll
├── record.js                       # 工作记录模型（完成）
│   ├── findById
│   ├── findList
│   ├── findByGroupAndDate
│   ├── batchCreate
│   ├── update
│   ├── delete
│   ├── recalcGroupDay
│   ├── 统计方法
│   └── getEmployeeRecordsForPeriod
├── payroll.js                      # 工资单模型（完成）
│   ├── findById
│   ├── findList
│   ├── create
│   ├── update
│   ├── updateBonusDeduction
│   ├── confirm
│   ├── markAsPaid
│   ├── countAll
│   └── 统计方法
└── auditLog.js                     # 审计日志模型（完成）
    ├── findList
    ├── findRecent
    └── countAll
```

### 业务服务 (src/services/)
```
src/services/
├── authService.js                  # 认证服务（完成）
│   ├── register
│   ├── login
│   ├── changePassword
│   └── resetPassword
├── userService.js                  # 用户服务（完成）
│   ├── getList
│   ├── getById
│   ├── updateProfile
│   ├── updateUser
│   ├── approve
│   ├── reject
│   ├── createUser
│   ├── deleteUser
│   └── getPendingUsers
├── departmentService.js            # 部门服务（完成）
│   ├── getList
│   ├── getAll
│   ├── getById
│   ├── create
│   ├── update
│   ├── delete
│   └── countAll
├── groupService.js                 # 小组服务（完成）
│   ├── getList
│   ├── getByDepartment
│   ├── getById
│   ├── create
│   ├── updateMembers
│   ├── delete
│   ├── getMembers
│   └── countAll
├── specService.js                  # 计件规格服务（完成）
│   ├── getList
│   ├── getActive
│   ├── getById
│   ├── create
│   ├── update
│   ├── toggleActive
│   ├── delete
│   └── countAll
├── recordService.js                # 工作记录服务（完成）【核心】
│   ├── createRecord（核心逻辑）
│   │   ├── 获取小组成员
│   │   ├── 计算小组总收入
│   │   ├── 计算人均收入
│   │   └── 为每个成员创建记录
│   ├── getList
│   ├── getById
│   ├── update
│   ├── delete
│   ├── recalcAndSave
│   ├── countAll
│   └── getStats
├── payrollService.js               # 工资单服务（完成）【核心】
│   ├── generatePayrolls（核心逻辑）
│   │   ├── 查询周期内有工作记录的员工
│   │   ├── 汇总计件收入
│   │   └── 创建工资单
│   ├── getList
│   ├── getById
│   ├── adjustBonusDeduction
│   ├── confirm
│   ├── markAsPaid
│   ├── batchConfirm
│   ├── batchPay
│   └── countAll
├── auditService.js                 # 审计服务（完成）
│   ├── getList
│   └── getRecent
└── exportService.js                # 导出服务（完成）
    ├── toCSV
    ├── exportRecords
    ├── exportPayrolls
    ├── exportAuditLogs
    └── exportAll
```

### 控制器 (src/controllers/)
```
src/controllers/
├── authController.js               # 认证控制器（完成）
│   ├── register
│   ├── login
│   ├── changePassword
│   ├── getProfile
│   └── updateProfile
├── userController.js               # 用户控制器（完成）
│   ├── list
│   ├── getById
│   ├── create
│   ├── update
│   ├── delete
│   └── resetPassword
├── departmentController.js         # 部门控制器（完成）
│   ├── list
│   ├── all
│   ├── getById
│   ├── create
│   ├── update
│   └── delete
├── groupController.js              # 小组控制器（完成）
│   ├── list
│   ├── getByDepartment
│   ├── getById
│   ├── create
│   ├── updateMembers
│   └── delete
├── specController.js               # 计件规格控制器（完成）
│   ├── list
│   ├── active
│   ├── getById
│   ├── create
│   ├── update
│   ├── toggleActive
│   └── delete
├── recordController.js             # 工作记录控制器（完成）
│   ├── list
│   ├── getById
│   ├── create
│   ├── delete
│   └── exportCSV
├── payrollController.js            # 工资单控制器（完成）
│   ├── list
│   ├── getById
│   ├── generate
│   ├── adjust
│   ├── confirm
│   ├── markPaid
│   ├── batchConfirm
│   ├── batchPay
│   └── exportCSV
├── approvalController.js           # 用户审核控制器（完成）
│   ├── getPending
│   ├── approve
│   └── reject
├── dashboardController.js          # 数据看板控制器（完成）
│   └── getStats
├── auditController.js              # 审计日志控制器（完成）
│   ├── list
│   └── exportCSV
└── maintenanceController.js        # 数据维护控制器（完成）
    ├── exportJSON
    └── getStats
```

### 路由 (src/routes/)
```
src/routes/
├── index.js                        # 路由汇总（完成）
│   ├── 路由挂载
│   ├── 健康检查
│   └── 404 处理
├── auth.js                         # 认证路由（完成）
│   ├── POST /register
│   ├── POST /login
│   ├── POST /change-password
│   ├── GET /profile
│   └── PUT /profile
├── users.js                        # 用户路由（完成）
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id
│   ├── DELETE /:id
│   └── POST /:id/reset-password
├── departments.js                  # 部门路由（完成）
│   ├── GET /
│   ├── GET /all
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
├── groups.js                       # 小组路由（完成）
│   ├── GET /
│   ├── GET /by-department/:id
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id/members
│   └── DELETE /:id
├── specs.js                        # 计件规格路由（完成）
│   ├── GET /
│   ├── GET /active
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id
│   ├── PATCH /:id/toggle
│   └── DELETE /:id
├── records.js                      # 工作记录路由（完成）
│   ├── GET /
│   ├── GET /:id
│   ├── GET /export/csv
│   ├── POST /
│   └── DELETE /:id
├── payrolls.js                     # 工资单路由（完成）
│   ├── GET /
│   ├── GET /:id
│   ├── GET /export/csv
│   ├── POST /
│   ├── POST /:id/confirm
│   ├── POST /:id/pay
│   ├── POST /batch/confirm
│   ├── POST /batch/pay
│   └── PATCH /:id/adjust
├── approvals.js                    # 用户审核路由（完成）
│   ├── GET /
│   ├── POST /:id/approve
│   └── POST /:id/reject
├── dashboard.js                    # 数据看板路由（完成）
│   └── GET /stats
├── audit.js                        # 审计日志路由（完成）
│   ├── GET /
│   └── GET /export/csv
└── maintenance.js                  # 数据维护路由（完成）
    ├── GET /stats
    └── GET /export/json
```

### 工具函数 (src/utils/)
```
src/utils/
├── response.js                     # 响应封装（完成）
│   ├── success
│   ├── created
│   ├── error
│   ├── unauthorized
│   ├── forbidden
│   ├── notFound
│   └── paginate
├── validators.js                   # 数据验证（完成）
│   ├── isEmail
│   ├── isPhone
│   ├── isIdCard
│   ├── isPositive
│   ├── isDate
│   ├── isPassword
│   ├── isNonEmpty
│   ├── isUUID
│   ├── parsePagination
│   ├── validateRegistration
│   └── validateRecord
├── formatters.js                   # 格式化工具（完成）
│   ├── money
│   ├── date
│   ├── dateTime
│   ├── getCurrentMonth
│   ├── roleLabel
│   ├── statusLabel
│   └── toNumber
├── crypto.js                       # 加密工具（完成）
│   ├── hashPassword
│   └── comparePassword
└── logger.js                       # 日志工具（完成）
    ├── info
    ├── warn
    ├── error
    └── debug
```

## 前端代码 (public/)

### HTML 页面
```
public/
├── index.html                      # 登录/注册页（完成）
│   ├── 左侧：公司信息
│   ├── 右侧：登录/注册表单
│   ├── 演示账号按钮
│   └── 消息提示
├── dashboard.html                  # 数据看板（预留）
├── records.html                    # 工作记录管理（预留）
├── payroll.html                    # 工资查询（预留）
├── approvals.html                  # 用户审核（预留）
├── departments.html                # 部门管理（预留）
├── users.html                      # 用户管理（预留）
├── groups.html                     # 小组管理（预留）
├── specs.html                      # 计件管理（预留）
├── profile.html                    # 个人设置（预留）
└── maintenance.html                # 数据维护（预留）
```

### 样式文件 (public/css/)
```
public/css/
├── common.css                      # 通用样式（完成）
│   ├── CSS 变量定义
│   ├── 按钮样式
│   ├── 表单样式
│   ├── 消息提示
│   ├── 表格样式
│   ├── 卡片样式
│   ├── 模态框样式
│   ├── 分页样式
│   └── 响应式设计
├── layout.css                      # 布局样式（预留）
├── components.css                  # 组件样式（预留）
└── pages/
    ├── login.css                   # 登录页样式（完成）
    │   ├── 左右两栏布局
    │   ├── 品牌区域
    │   ├── 公司信息
    │   ├── 标签页
    │   ├── 表单样式
    │   ├── 演示账号按钮
    │   └── 响应式设计
    ├── dashboard.css               # 数据看板样式（预留）
    ├── records.css                 # 工作记录样式（预留）
    ├── payroll.css                 # 工资查询样式（预留）
    ├── approvals.css               # 用户审核样式（预留）
    ├── departments.css             # 部门管理样式（预留）
    ├── users.css                   # 用户管理样式（预留）
    ├── groups.css                  # 小组管理样式（预留）
    ├── specs.css                   # 计件管理样式（预留）
    ├── profile.css                 # 个人设置样式（预留）
    └── maintenance.css             # 数据维护样式（预留）
```

### JavaScript 文件 (public/js/)
```
public/js/
├── api.js                          # API 调用封装（完成）
│   ├── 请求头配置
│   ├── 通用请求方法
│   ├── 认证 API
│   ├── 用户 API
│   ├── 部门 API
│   ├── 小组 API
│   ├── 计件规格 API
│   ├── 工作记录 API
│   ├── 工资单 API
│   ├── 用户审核 API
│   ├── 数据看板 API
│   ├── 审计日志 API
│   └── 数据维护 API
├── auth.js                         # 认证管理（预留）
│   ├── Token 存储
│   ├── 用户信息管理
│   ├── 登出
│   └── 权限检查
├── utils.js                        # 工具函数（预留）
│   ├── 日期格式化
│   ├── 金额格式化
│   ├── 表单验证
│   ├── 消息提示
│   └── 其他工具
├── components.js                   # 可复用组件（预留）
│   ├── 表格组件
│   ├── 分页组件
│   ├── 模态框组件
│   ├── 表单组件
│   └── 其他组件
├── router.js                       # 前端路由（预留）
│   ├── 路由配置
│   ├── 页面导航
│   ├── 权限检查
│   └── 404 处理
└── pages/
    ├── login.js                    # 登录页逻辑（完成）
    │   ├── 标签页切换
    │   ├── 登录表单提交
    │   ├── 注册表单提交
    │   ├── 演示账号填充
    │   └── 消息提示
    ├── dashboard.js                # 数据看板逻辑（预留）
    ├── records.js                  # 工作记录逻辑（预留）
    ├── payroll.js                  # 工资查询逻辑（预留）
    ├── approvals.js                # 用户审核逻辑（预留）
    ├── departments.js              # 部门管理逻辑（预留）
    ├── users.js                    # 用户管理逻辑（预留）
    ├── groups.js                   # 小组管理逻辑（预留）
    ├── specs.js                    # 计件管理逻辑（预留）
    ├── profile.js                  # 个人设置逻辑（预留）
    └── maintenance.js              # 数据维护逻辑（预留）
```

### 静态资源 (public/assets/)
```
public/assets/
├── images/                         # 图片资源（预留）
│   ├── logo.png
│   ├── favicon.ico
│   └── ...
└── fonts/                          # 字体资源（预留）
    └── ...
```

## 文档目录 (docs/)

```
docs/
├── api.md                          # API 接口文档（预留）
│   ├── 认证 API
│   ├── 用户 API
│   ├── 部门 API
│   ├── 小组 API
│   ├── 计件规格 API
│   ├── 工作记录 API
│   ├── 工资单 API
│   ├── 用户审核 API
│   ├── 数据看板 API
│   ├── 审计日志 API
│   └── 数据维护 API
└── deployment.md                   # 部署指南（预留）
    ├── 环境准备
    ├── 数据库部署
    ├── 后端部署
    ├── 前端部署
    ├── 域名配置
    ├── HTTPS 配置
    └── 监控告警
```

## 统计信息

### 后端代码
- **配置文件**: 3 个（database.js, auth.js, constants.js）
- **中间件**: 4 个（auth.js, rbac.js, audit.js, errorHandler.js）
- **数据模型**: 7 个（user, department, group, spec, record, payroll, auditLog）
- **业务服务**: 8 个（auth, user, department, group, spec, record, payroll, audit, export）
- **控制器**: 11 个（auth, user, department, group, spec, record, payroll, approval, dashboard, audit, maintenance）
- **路由**: 11 个（auth, users, departments, groups, specs, records, payrolls, approvals, dashboard, audit, maintenance）
- **工具函数**: 5 个（response, validators, formatters, crypto, logger）
- **总计**: 49 个后端文件

### 前端代码
- **HTML 页面**: 11 个（1 个完成，10 个预留）
- **CSS 文件**: 12 个（2 个完成，10 个预留）
- **JavaScript 文件**: 16 个（2 个完成，14 个预留）
- **总计**: 39 个前端文件

### 数据库
- **表**: 8 个（全部完成）
- **索引**: 20+ 个
- **外键**: 8 个

### 文档
- **项目文档**: 4 个（README.md, QUICK_START.md, DEVELOPMENT_SUMMARY.md, FILE_MANIFEST.md）
- **API 文档**: 1 个（预留）
- **部署指南**: 1 个（预留）

## 完成度统计

| 模块 | 完成度 | 备注 |
|------|--------|------|
| 后端架构 | 100% | 完成 |
| 数据模型 | 100% | 完成 |
| API 接口 | 100% | 完成 |
| 权限控制 | 100% | 完成 |
| 审计日志 | 100% | 完成 |
| 登录页面 | 100% | 完成 |
| 其他前端页面 | 0% | 预留 |
| 前端 JavaScript | 20% | 部分完成 |
| 文档 | 50% | 部分完成 |
| **总体** | **60%** | **进行中** |

---

**最后更新**: 2026-03-27  
**版本**: 1.0.0
