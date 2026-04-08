require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authMiddleware = require('./middleware/auth');
const auditMiddleware = require('./middleware/audit');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],  // 允许内联事件处理器
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// 日志
app.use(morgan('combined'));

// 请求解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 审计日志中间件（在路由之前）
app.use(auditMiddleware());

// 静态文件
app.use(express.static('public'));

// API 路由
app.use('/api', routes);

// 404 处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  logger.info('SERVER', `蓝莓计件工资系统已启动，监听端口 ${PORT}`);
  logger.info('SERVER', `环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info('SERVER', `数据库: ${process.env.DATABASE_URL ? '已连接' : '未配置'}`);
});

module.exports = app;
