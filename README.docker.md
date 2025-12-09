# Docker 使用说明

## 快速启动

```bash
# 使用 docker-compose（推荐）
docker-compose up

# 或直接使用 docker
docker run -p 3001:3001 -p 4173:4173 \
  -v ~/.claude:/root/.claude \
  -v ~/.codex:/root/.codex \
  ccswitch-web
```

## 访问应用

- 前端: http://localhost:4173
- 后端 API: http://localhost:3001

## 说明

- 应用会挂载本地的 `~/.claude` 和 `~/.codex` 目录
- 配置文件的修改会直接保存到本地
