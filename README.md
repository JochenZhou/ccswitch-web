# CC Switch Web（半成品，只支持导入备份和切换供应商功能）

基于原版 [cc-switch](https://github.com/farion1231/cc-switch) 的 WebUI 版本。

## 功能特性

- ✅ 支持 Claude Code、Codex、Gemini CLI 三种 AI CLI 工具
- ✅ 供应商管理（添加、编辑、删除、切换、复制）
- ✅ MCP 服务器管理
- ✅ 配置导入导出
- ✅ 多语言支持（中文/英文）
- ✅ 响应式设计
- ✅ 暗色模式支持

## 技术栈

- React 18
- TypeScript
- Vite
- TanStack Query (React Query)
- Tailwind CSS
- React Hook Form
- i18next
- Lucide Icons

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

**方式一：同时启动前端和后端**
```bash
npm start
```

**方式二：分别启动**
```bash
# 终端 1 - 启动后端服务
npm run server

# 终端 2 - 启动前端开发服务器
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 重要说明

- **后端服务必须运行**：为了更新 Ubuntu 系统中的 `/root/.claude/settings.json` 文件，必须启动后端服务（端口 3001）
- **前端服务**：运行在端口 5173（Vite 默认端口）
- **跨域配置**：后端已配置 CORS 允许前端访问

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── ui/             # 基础 UI 组件
│   ├── ProviderCard.tsx
│   └── ProviderList.tsx
├── lib/                # 工具库
│   ├── api.ts          # API 接口
│   ├── queries.ts      # React Query hooks
│   ├── queryClient.ts  # Query Client 配置
│   └── utils.ts        # 工具函数
├── types/              # TypeScript 类型定义
├── i18n.ts             # 国际化配置
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## 核心功能

### 供应商管理

- 支持多个 AI CLI 工具的供应商配置
- 一键切换当前使用的供应商
- 供应商配置的增删改查
- 供应商复制功能

### MCP 服务器管理

- 管理 Model Context Protocol 服务器
- 支持 stdio 和 http 两种类型
- 为不同 AI CLI 工具启用/禁用服务器

### 配置管理

- 导出所有配置为 JSON
- 从 JSON 导入配置
- 支持配置备份和恢复

## 与原版的区别

- 纯 Web 应用，无需 Tauri 桌面环境
- 使用模拟 API，数据存储在内存中
- 简化的 UI 设计
- 移除了桌面特定功能（托盘菜单、系统通知等）

## 后续扩展

可以通过以下方式扩展：

1. 连接真实后端 API
2. 使用 LocalStorage/IndexedDB 持久化数据
3. 添加更多 MCP 服务器模板
4. 实现配置同步功能
5. 添加供应商测速功能

## License

MIT
