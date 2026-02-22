# Verdaccio 私有 NPM 仓库搭建指南

## 简介

[Verdaccio](https://verdaccio.org/) 是一个轻量级的私有 npm proxy registry，用于搭建企业内部的 npm 私服。它支持：
- 从 npmjs.org 代理公共包
- 发布和托管私有包
- 基于角色的访问控制
- Docker 和 Kubernetes 部署

## 安装

### 方式一：全局安装（推荐用于本地开发）

```bash
# 使用 npm
npm install -g verdaccio

# 使用 yarn
yarn global add verdaccio

# 使用 pnpm
pnpm add -g verdaccio
```

### 方式二：Docker 部署

```bash
# 运行 Verdaccio 容器
docker run -it --rm --name verdaccio -p 4873:4873 verdaccio/verdaccio

# 使用自定义配置
docker run -it --rm -p 4873:4873 \
  -v /path/to/config:/verdaccio/conf \
  -v /path/to/storage:/verdaccio/storage \
  verdaccio/verdaccio
```

### 方式三：Helm 部署（Kubernetes）

```bash
# 添加 Helm 仓库
helm repo add verdaccio https://charts.verdaccio.org
helm repo update

# 安装
helm install registry verdaccio/verdaccio

# 自定义版本
helm install registry --set image.tag=6 verdaccio/verdaccio
```

## 配置

Verdaccio 的配置文件默认位于：
- macOS/Linux: `~/.config/verdaccio/config.yaml`
- Windows: `%APPDATA%\verdaccio\config.yaml`

### 基础配置示例

```yaml
# 存储路径
storage: ./storage

# 插件路径
plugins: ./plugins

# Web UI 配置
web:
  title: Verdaccio

# 认证配置
auth:
  htpasswd:
    file: ./htpasswd
    max_users: 1000

# 上游代理
uplinks:
  npmjs:
    url: https://registry.npmjs.org/

# 包访问控制
packages:
  '@my-company/*':
    access: $authenticated
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs

  '**':
    access: $all
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs

# 日志配置
log: { type: stdout, format: pretty, level: http }

# 监听端口
listen: 0.0.0.0:4873
```

### 高级配置选项

```yaml
# 请求体大小限制
max_body_size: 100mb

# 允许的 HTTPS 证书（用于自签名证书）
https:
  key: ./path/to/key.pem
  cert: ./path/to/cert.pem
  ca: ./path/to/ca.pem

# 安全配置
security:
  api:
    legacy: true
    jwt:
      sign:
        expiresIn: 30d
  web:
    sign:
      expiresIn: 7d
```

## 启动和使用

### 启动 Verdaccio

```bash
# 使用默认配置启动
verdaccio

# 使用自定义配置
verdaccio --config /path/to/config.yaml

# 后台运行
nohup verdaccio > /dev/null 2>&1 &
```

### 验证服务

访问 `http://localhost:4873` 应该能看到 Verdaccio 的 Web UI。

## 配置 npm 客户端

### 临时使用特定 registry

```bash
# 安装包
npm install --registry=http://localhost:4873 lodash

# 发布包
npm publish --registry=http://localhost:4873
```

### 永久配置 registry

```bash
# 设置默认 registry
npm config set registry http://localhost:4873

# 查看当前 registry
npm config get registry
```

### 项目级配置（推荐）

在项目根目录创建 `.npmrc` 文件：

```ini
# 设置私有包的 registry
@my-company:registry=http://localhost:4873

# 公共包使用官方源
registry=https://registry.npmjs.org/

# 认证信息
//localhost:4873/:_authToken=YOUR_TOKEN
```

## 认证和用户管理

### 创建用户

```bash
npm adduser --registry=http://localhost:4873

# 按提示输入：
# Username: your-username
# Password: your-password
# Email: your-email@example.com
```

### 登录

```bash
npm login --registry=http://localhost:4873
```

### 生成 htpasswd 文件

```bash
# 安装 htpasswd 工具
npm install -g htpasswd

# 创建用户
htpasswd -bc htpasswd admin admin123
```

### .npmrc 认证配置

```ini
# 方式一：直接设置 token
//localhost:4873/:_authToken="YOUR_TOKEN"

# 方式二：使用 base64 编码的用户名密码
//localhost:4873/:_auth=$(echo -n 'username:password' | base64)

# 方式三：使用 legacy 认证
npm login --registry=http://localhost:4873 --auth-type=legacy
```

## 发布包

### 准备包

```bash
# 初始化项目
mkdir my-private-package
cd my-private-package
npm init -y

# 编辑 package.json，确保 name 有 scope
{
  "name": "@my-company/my-private-package",
  "version": "1.0.0",
  "description": "My private package",
  "main": "index.js"
}

# 创建入口文件
echo "console.log('Hello from private package!')" > index.js
```

### 发布到私仓

```bash
# 登录
npm login --registry=http://localhost:4873

# 发布
npm publish --registry=http://localhost:4873

# 发布不带 git tag
npm publish --no-git-tag-version

# 使用 pnpm 发布
pnpm publish --registry=http://localhost:4873

# 使用 yarn 发布
yarn publish --registry=http://localhost:4873
```

## 安装私有包

```bash
# 使用 npm
npm install @my-company/my-private-package

# 指定 registry 安装
npm install --registry=http://localhost:4873 @my-company/my-private-package

# 使用 pnpm
pnpm add @my-company/my-private-package

# 使用 yarn
yarn add @my-company/my-private-package
```

## 使用 Docker Compose 部署

```yaml
version: '3'

services:
  verdaccio:
    image: verdaccio/verdaccio
    container_name: verdaccio
    ports:
      - "4873:4873"
    volumes:
      - ./verdaccio/storage:/verdaccio/storage
      - ./verdaccio/config:/verdaccio/conf
      - ./verdaccio/plugins:/verdaccio/plugins
    restart: always
```

启动：

```bash
docker-compose up -d
```

## Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name npm.yourdomain.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name npm.yourdomain.com;

    ssl_certificate /path/to/ssl_certificate.crt;
    ssl_certificate_key /path/to/ssl_certificate_key.key;

    location / {
        proxy_pass http://localhost:4873/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_http_version 1.1;
    }
}
```

## 防火墙配置

```bash
# 开放 4873 端口
firewall-cmd --zone=public --permanent --add-port=4873/tcp
firewall-cmd --reload

# 验证
firewall-cmd --zone=public --query-port=4873/tcp
```

## Systemd 服务配置

```ini
[Unit]
Description=Verdaccio - lightweight npm proxy registry
Documentation=https://verdaccio.org
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/verdaccio --config /home/user/.config/verdaccio/config.yaml
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

启用服务：

```bash
# 复制服务文件
sudo cp /usr/lib/node_modules/verdaccio/systemd/verdaccio.service /lib/systemd/system/

# 重载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start verdaccio

# 开机自启
sudo systemctl enable verdaccio

# 查看状态
sudo systemctl status verdaccio
```

## Monorepo 集成

### Lerna + Verdaccio

```bash
# 启动 Verdaccio
verdaccio

# 配置 npm registry
npm set registry http://localhost:4873
npm adduser --registry http://localhost:4873

# 发布所有包
lerna publish
```

### Nx + Verdaccio

```bash
# 启动本地 registry
npx nx local-registry

# 使用自定义 registry 发布
nx run-many --target=publish --registry=http://localhost:4873
```

### Yarn 2+ 配置

在 `.yarnrc.yml` 中：

```yaml
npmRegistryServer: 'http://localhost:4873'
unsafeHttpWhitelist:
  - localhost
nodeLinker: node-modules
```

## 常见问题

### 1. 认证失败

确保 `.npmrc` 中有正确的 token：

```bash
# 查看当前配置
npm config list

# 检查 token
cat ~/.npmrc
```

### 2. 包代理失败

检查网络连接和上游配置：

```yaml
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
    timeout: 30s
    maxage: 30d
```

### 3. 权限问题

确保用户有发布权限：

```yaml
packages:
  '@my-company/*':
    access: $authenticated
    publish: $authenticated
```

### 4. 存储空间不足

清理旧包或增加存储限制：

```bash
# 清理 Verdaccio 缓存
rm -rf ~/.local/share/verdaccio/storage/*
```

### 5. Docker 容器权限

```bash
# 修复文件权限
sudo chown -R 1000:1000 ./verdaccio/storage
```

## 最佳实践

1. **使用 scoped 包名**：如 `@my-company/package-name`
2. **项目级 .npmrc**：避免全局污染，推荐项目级配置
3. **定期备份**：备份 `storage` 目录和配置文件
4. **使用 HTTPS**：生产环境必须使用 SSL/TLS
5. **访问控制**：根据需要配置不同用户的权限
6. **监控日志**：定期检查日志，监控异常访问
7. **版本管理**：遵循语义化版本规范
8. **文档齐全**：为私有包编写 README 和 CHANGELOG

## 相关资源

- [Verdaccio 官方文档](https://verdaccio.org/docs/)
- [Verdaccio GitHub](https://github.com/verdaccio/verdaccio)
- [npm 官方文档](https://docs.npmjs.com/)
- [Docker Hub - Verdaccio](https://hub.docker.com/r/verdaccio/verdaccio)
