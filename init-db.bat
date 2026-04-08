@echo off
chcp 65001 >nul
echo ========================================
echo 蓝莓计件工资系统 - 数据库初始化
echo ========================================
echo.
echo 此脚本将创建默认账号和示例数据：
echo.
echo   管理员: admin@blueberry.com / admin123
echo   部门经理: manager@blueberry.com / manager123
echo   员工: employee@blueberry.com / employee123
echo.
echo ⚠️  请确保已：
echo   1. 在 Neon 控制台执行了 database/schema.sql
echo   2. 配置了 .env 文件中的 DATABASE_URL
echo.
pause

echo.
echo 开始初始化...
call npm run init-db

pause
