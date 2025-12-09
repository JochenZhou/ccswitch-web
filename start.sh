#!/bin/bash

# 启动后端服务
node server/index.js &
SERVER_PID=$!

echo "后端服务已启动 (PID: $SERVER_PID)"
echo "等待 2 秒..."
sleep 2

# 启动前端预览
npm run preview -- --host

# 清理：当前端停止时，也停止后端
kill $SERVER_PID
