# Ubuntu 系统设置指南

## 问题说明

当前 Web 应用只在浏览器的 localStorage 中存储数据，不会实际修改 Ubuntu 系统中的 `/root/.claude/settings.json` 文件。

## 解决方案

已添加后端服务来处理系统文件操作。

## 安装步骤

### 1. 安装依赖

```bash
cd /path/to/ccswitch-web
npm install
```

### 2. 启动服务

**推荐方式：同时启动前后端**

```bash
npm start
```

这会同时启动：
- 后端服务（端口 3001）- 负责更新系统文件
- 前端服务（端口 5173）- Web 界面

**或者分别启动：**

```bash
# 终端 1
npm run server

# 终端 2  
npm run dev
```

### 3. 访问应用

打开浏览器访问：`http://localhost:5173`

## 工作原理

1. 用户在 Web 界面切换 Claude 供应商
2. 前端调用后端 API：`POST http://localhost:3001/api/claude/switch-provider`
3. 后端服务读取供应商配置，更新 `/root/.claude/settings.json`
4. Claude CLI 读取更新后的配置文件

## 后端 API

### 切换供应商
```
POST /api/claude/switch-provider
Content-Type: application/json

{
  "provider": {
    "id": "claude-1",
    "name": "Claude Official",
    "settingsConfig": {
      "baseUrl": "https://api.anthropic.com",
      "model": "claude-3-opus-20240229"
    }
  }
}
```

### 获取当前设置
```
GET /api/claude/settings
```

## 文件权限

确保后端服务有权限写入 Claude 配置目录：

```bash
# 如果需要，创建目录
mkdir -p ~/.claude

# 检查权限
ls -la ~/.claude
```

## 生产环境部署

### 使用 PM2 管理后端服务

```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
pm2 start server/index.js --name ccswitch-server

# 设置开机自启
pm2 startup
pm2 save
```

### 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/ccswitch-web/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 故障排查

### 后端服务无法启动

```bash
# 检查端口是否被占用
lsof -i :3001

# 查看错误日志
npm run server
```

### 无法写入配置文件

```bash
# 检查文件权限
ls -la ~/.claude/settings.json

# 如果需要，修改权限
chmod 644 ~/.claude/settings.json
```

### 前端无法连接后端

1. 确认后端服务正在运行
2. 检查防火墙设置
3. 查看浏览器控制台的网络请求错误

## 环境变量配置

可以通过环境变量自定义配置：

```bash
# 后端端口
PORT=3001 npm run server

# Claude 配置文件路径
CLAUDE_SETTINGS_PATH=/custom/path/.claude/settings.json npm run server
```
