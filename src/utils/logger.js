// 简单日志工具
const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };

class Logger {
  constructor() {
    this.level = process.env.NODE_ENV === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
  }

  _log(level, tag, ...args) {
    if (LOG_LEVELS[level] > this.level) return;
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${tag}]`;
    console.log(prefix, ...args);
  }

  info(tag, ...args) { this._log('INFO', tag, ...args); }
  warn(tag, ...args) { this._log('WARN', tag, ...args); }
  error(tag, ...args) { this._log('ERROR', tag, ...args); }
  debug(tag, ...args) { this._log('DEBUG', tag, ...args); }
}

module.exports = new Logger();
