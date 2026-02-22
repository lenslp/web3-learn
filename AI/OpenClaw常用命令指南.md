# OpenClaw 常用命令指南

> 创建日期：2026-02-19  
> 最后更新：2026-02-19  
> 适用版本：OpenClaw 2026.2+

---

## 📋 目录

- [基础命令速查](#基础命令速查)
- [配置文件管理](#配置文件管理)
- [技能和工具使用](#技能和工具使用)
- [会话管理](#会话管理)
- [网关和节点控制](#网关和节点控制)
- [故障排除](#故障排除)
- [实用技巧](#实用技巧)

---

## 基础命令速查

### 1. 状态和帮助
```bash
# 查看 OpenClaw 状态
openclaw status

# 查看帮助
openclaw help
openclaw <子命令> --help

# 查看版本
openclaw version
```

### 2. 网关管理
```bash
# 网关状态
openclaw gateway status

# 启动/停止/重启网关
openclaw gateway start
openclaw gateway stop
openclaw gateway restart

# 查看网关日志
openclaw gateway logs
openclaw gateway logs --follow  # 实时查看
```

### 3. 配置管理
```bash
# 查看当前配置
openclaw config get
openclaw config get models      # 查看模型配置
openclaw config get providers   # 查看提供商配置

# 验证配置
openclaw config validate

# 编辑配置（使用默认编辑器）
openclaw config edit
```

---

## 配置文件管理

### 配置文件位置
- **主配置**: `~/.openclaw/config.json`
- **模型配置**: `~/.openclaw/models.json`
- **工作空间**: `~/.openclaw/workspace/`

### 常用配置操作
```bash
# 备份配置
cp ~/.openclaw/config.json ~/.openclaw/config.json.backup

# 恢复配置
cp ~/.openclaw/config.json.backup ~/.openclaw/config.json

# 查看配置架构
openclaw config schema
```

### 配置示例
```json
{
  "model": "deepseek/deepseek-chat",
  "thinking": false,
  "temperature": 0.7,
  "maxTokens": 4096,
  "providers": {
    "deepseek": {
      "baseUrl": "https://api.deepseek.com",
      "apiKey": "sk-..."
    }
  }
}
```

---

## 技能和工具使用

### 1. 技能管理
```bash
# 查看已安装技能
ls ~/.nvm/versions/node/v24.13.0/lib/node_modules/openclaw/skills/

# 使用 ClawHub 搜索和安装技能
clawhub search "weather"
clawhub install weather
clawhub update weather
```

### 2. 工具调用
在会话中直接使用工具：
- `read` - 读取文件
- `write` - 写入文件
- `edit` - 编辑文件
- `exec` - 执行命令
- `web_search` - 网页搜索
- `browser` - 浏览器控制

### 3. 常用工具示例
```bash
# 读取文件
read /path/to/file.md

# 执行命令并获取输出
exec ls -la

# 搜索网页
web_search "OpenClaw documentation"

# 控制浏览器
browser action=open targetUrl="https://docs.openclaw.ai"
```

---

## 会话管理

### 1. 会话状态
```bash
# 查看当前会话状态
openclaw session status

# 查看所有会话
openclaw sessions list

# 查看会话历史
openclaw sessions history <session-key>
```

### 2. 子代理管理
```bash
# 创建子代理任务
openclaw sessions spawn --task "分析日志文件" --label "log-analysis"

# 查看运行中的子代理
openclaw subagents list

# 向子代理发送消息
openclaw sessions send --session-key <key> --message "继续分析"

# 终止子代理
openclaw subagents kill --target <session-id>
```

### 3. 消息管理
```bash
# 发送消息到其他会话
openclaw message send --to <target> --message "Hello"

# 查看消息历史
openclaw message history --limit 50
```

---

## 网关和节点控制

### 1. 节点管理
```bash
# 查看节点状态
openclaw nodes status

# 列出所有节点
openclaw nodes list

# 节点配对
openclaw nodes pair

# 发送通知到节点
openclaw nodes notify --title "提醒" --body "任务完成"
```

### 2. 摄像头和屏幕
```bash
# 拍摄摄像头照片
openclaw nodes camera-snap --facing front

# 屏幕录制
openclaw nodes screen-record --duration 10s

# 获取位置信息
openclaw nodes location-get
```

### 3. 远程执行
```bash
# 在节点上执行命令
openclaw nodes run --node <node-id> --command "ls -la"

# 调用节点功能
openclaw nodes invoke --node <node-id> --command "getBatteryLevel"
```

---

## 故障排除

### 1. 常见问题解决
```bash
# 1. 网关无法启动
openclaw gateway restart
sudo systemctl restart openclaw  # Linux系统服务

# 2. 模型连接失败
openclaw config get models       # 检查模型配置
ping api.deepseek.com            # 检查网络连接

# 3. 技能加载失败
rm -rf ~/.openclaw/cache/skills/ # 清除技能缓存
openclaw gateway restart         # 重启网关
```

### 2. 日志查看
```bash
# 查看详细日志
openclaw gateway logs --level debug

# 查看特定服务的日志
journalctl -u openclaw -f        # Systemd服务
tail -f /var/log/openclaw.log    # 传统日志文件
```

### 3. 诊断命令
```bash
# 检查网络连接
openclaw diagnose network

# 检查存储空间
openclaw diagnose storage

# 检查权限
openclaw diagnose permissions
```

---

## 实用技巧

### 1. 快捷键和别名
```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
alias oc='openclaw'
alias ocg='openclaw gateway'
alias occ='openclaw config'
alias ocs='openclaw status'
```

### 2. 自动化脚本
```bash
#!/bin/bash
# 每日检查脚本
openclaw gateway status
openclaw config validate
openclaw sessions list --active-minutes 60
```

### 3. 备份和恢复
```bash
# 备份工作空间
tar -czf openclaw-backup-$(date +%Y%m%d).tar.gz ~/.openclaw/workspace/

# 备份配置
cp -r ~/.openclaw/ ~/.openclaw-backup/
```

### 4. 性能优化
```bash
# 清理缓存
rm -rf ~/.openclaw/cache/*

# 限制日志大小
openclaw config set logging.maxSize 100MB

# 优化内存使用
openclaw config set memory.limit 2GB
```

---

## 🚀 高级功能

### 1. Webhook 集成
```bash
# 设置 Webhook
openclaw config set webhook.url "https://your-server.com/webhook"
openclaw config set webhook.events "session.start,session.end"
```

### 2. 自定义技能开发
```bash
# 创建技能模板
mkdir -p ~/.openclaw/workspace/skills/my-skill
cd ~/.openclaw/workspace/skills/my-skill
touch SKILL.md README.md index.js
```

### 3. API 访问
```bash
# 启用 API 服务器
openclaw config set api.enabled true
openclaw config set api.port 8080

# 使用 curl 测试
curl http://localhost:8080/status
```

---

## 📚 资源链接

- **官方文档**: https://docs.openclaw.ai
- **GitHub**: https://github.com/openclaw/openclaw
- **社区 Discord**: https://discord.com/invite/clawd
- **技能市场**: https://clawhub.com

---

## 🔄 更新记录

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-02-19 | 1.0 | 初始版本创建 |
| | | 包含基础命令和配置指南 |

---

> **提示**: 使用 `openclaw help <command>` 获取特定命令的详细帮助。
> 定期检查更新：`clawhub update-all`

