// 统一响应格式封装
const success = (res, data = null, message = 'success', statusCode = 200) => {
  return res.status(statusCode).json({
    code: 0,
    message,
    data
  });
};

const created = (res, data = null, message = 'created') => {
  return res.status(201).json({
    code: 0,
    message,
    data
  });
};

const error = (res, message = 'error', statusCode = 400, code = -1) => {
  return res.status(statusCode).json({
    code,
    message,
    data: null
  });
};

const unauthorized = (res, message = '未授权，请先登录') => {
  return res.status(401).json({
    code: -1,
    message,
    data: null
  });
};

const forbidden = (res, message = '无权限执行此操作') => {
  return res.status(403).json({
    code: -1,
    message,
    data: null
  });
};

const notFound = (res, message = '资源不存在') => {
  return res.status(404).json({
    code: -1,
    message,
    data: null
  });
};

const paginate = (data, page, pageSize, total) => {
  return {
    list: data,
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      total: Number(total),
      totalPages: Math.ceil(total / pageSize)
    }
  };
};

module.exports = { success, created, error, unauthorized, forbidden, notFound, paginate };
