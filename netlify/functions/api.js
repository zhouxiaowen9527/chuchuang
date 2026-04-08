const serverless = require('serverless-http');
const app = require('../../src/app'); // 引入您的 Express 应用实例

// 导出处理函数
exports.handler = serverless(app);