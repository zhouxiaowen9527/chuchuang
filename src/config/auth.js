const jwt = require('jsonwebtoken');

const config = {
  secret: process.env.JWT_SECRET || 'blueberry-default-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

const generateToken = (payload) => {
  return jwt.sign(payload, config.secret, { expiresIn: config.expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.secret);
};

module.exports = { config, generateToken, verifyToken };
