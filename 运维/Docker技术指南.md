# Docker 技术指南

> 创建日期：2026-02-22  
> 分类：DevOps / 容器化 / 基础

---

## 一句话理解

**Docker = 集装箱**，把应用和它的运行环境打包在一起，确保"在我电脑上能跑，到你电脑上也能跑"。

---

## 为什么需要 Docker？（白板图）

```
┌─────────────────────────────────────────────┐
│           没有 Docker 的问题                   │
└─────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   开发环境   │    │   测试环境   │    │   生产环境   │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ Node 14     │    │ Node 16     │    │ Node 18      │
│ MySQL 5.7   │    │ MySQL 8.0   │    │ MySQL 8.0    │
│ Redis 3.2   │    │ Redis 6.0   │    │ Redis 7.0    │
│ Ubuntu 18   │    │ Ubuntu 20   │    │ Ubuntu 22    │
└──────────────┘    └──────────────┘    └──────────────┘

❌ 问题：环境不一致，导致各种奇怪报错
❌ 解决：每个环境都要配半天
```

```
┌─────────────────────────────────────────────┐
│           使用 Docker 后                       │
└─────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   开发环境   │    │   测试环境   │    │   生产环境   │
├──────────────┤    ├──────────────┤    ├──────────────┤
│             │    │             │    │             │
│  Docker    │    │  Docker    │    │  Docker    │
│  容器       │    │  容器       │    │  容器       │
│             │    │             │    │             │
│ (完全一致)  │    │ (完全一致)  │    │ (完全一致)  │
└──────────────┘    └──────────────┘    └──────────────┘

✅ 一次构建，处处运行
```

---

## Docker 核心概念（白板图）

```
┌─────────────────────────────────────────────┐
│           Docker 核心概念                     │
└─────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Image     │     │  Container  │     │   Volume    │
│   镜像       │     │   容器       │     │   数据卷    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ 模板/蓝图   │ ──→ │ 运行中的实例 │     │ 持久化数据 │
│ 只读        │     │ 可读可写    │     │ 独立于容器 │
│              │     │              │     │              │
│ docker build│     │ docker run   │     │ docker vol   │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐
│   Network   │     │   Dockerfile│
│   网络       │     │   构建脚本  │
├─────────────┤     ├─────────────┤
│ 容器间通信   │     │ 定义如何    │
│ 与外部通信   │     │ 构建镜像    │
│              │     │              │
│ docker net   │     │ docker build│
└─────────────┘     └─────────────┘
```

---

## Docker 命令速查

```bash
# 镜像操作
docker build -t myapp .           # 构建镜像
docker images                     # 列出镜像
docker rmi myapp                  # 删除镜像
docker pull nginx:latest          # 拉取镜像

# 容器操作
docker run -d -p 8080:80 nginx   # 运行容器
docker ps                         # 运行中的容器
docker ps -a                      # 所有容器
docker stop container_id          # 停止容器
docker rm container_id            # 删除容器
docker logs -f container_id       # 查看日志
docker exec -it container_id sh  # 进入容器

# 数据卷
docker volume create mydata      # 创建数据卷
docker volume ls                 # 列出数据卷

# 网络
docker network create mynet     # 创建网络
docker network ls                # 列出网络
```

---

## Dockerfile 写法

```dockerfile
# 基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "index.js"]
```

---

## Docker Compose 写法

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=secret

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

---

## 常见使用场景

| 场景 | 说明 |
|------|------|
| 本地开发 | 环境一致，避免"在我电脑上能跑" |
| 持续集成 | 自动化测试、构建 |
| 微服务 | 每个服务独立部署 |
| 快速部署 | 一键启动完整环境 |
| 环境隔离 | 测试环境不影响生产 |

---

## 面试常问题

### Q: Docker 和虚拟机的区别？

```
┌─────────────────────────────────────────────┐
│           Docker vs 虚拟机                    │
├─────────────────────────────────────────────┤
│                                             │
│  虚拟机：                                    │
│  - 完整操作系统                              │
│  - 独立内核                                 │
│  - 每个都几GB                               │
│  - 启动几分钟                               │
│                                             │
│  Docker：                                    │
│  - 共享主机内核                             │
│  - 轻量级容器                               │
│  - 每个几十MB                               │
│  - 启动几秒钟                               │
│                                             │
│  比喻：                                     │
│  虚拟机 = 整栋房子                          │
│  Docker = 集装箱（共享船）                   │
└─────────────────────────────────────────────┘
```

### Q: 容器数据如何持久化？

```bash
# 方法1: 数据卷
docker run -v mydata:/app/data myapp

# 方法2: 绑定挂载
docker run -v /host/path:/container/path myapp

# 方法3: tmpfs（内存中）
docker run --tmpfs /app/data myapp
```

---

## 更新记录

| 日期 | 内容 |
|------|------|
| 2026-02-22 | 初始版本 |

---

*持续更新中...*
