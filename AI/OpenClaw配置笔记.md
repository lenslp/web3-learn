# OpenClaw 配置笔记

> 更新时间：2026-03-08
> 版本：2026.3.2

---

## 1. 系统概览

| 项目 | 值 |
|------|-----|
| 版本 | 2026.3.2 |
| Gateway 端口 | 18789 |
| 运行模式 | local (loopback) |
| 认证方式 | token |
| 节点管理 | bun |

---

## 2. 已配置的模型提供商

### MiniMax (默认)
```json
{
  "provider": "minimax",
  "baseUrl": "https://api.minimaxi.com/v1",
  "model": "MiniMax-M2.5",
  "contextWindow": 200000,
  "maxTokens": 8192
}
```

### DeepSeek
```json
{
  "provider": "deepseek",
  "baseUrl": "https://api.deepseek.com",
  "model": "deepseek-chat",
  "contextWindow": 128000,
  "maxTokens": 8192
}
```

### Moonshot (Kimi)
```json
{
  "provider": "moonshot",
  "baseUrl": "https://platform.moonshot.cn/v1",
  "model": "kimi-k2.5",
  "contextWindow": 256000,
  "maxTokens": 8192
}
```

---

## 3. Agent 列表

| Agent ID | 名称 | 用途 | 模型 |
|----------|------|------|------|
| main | 棱镜 | 主助手 | MiniMax-M2.5 |
| public-writer | 公众号助手 | 公众号写作 | MiniMax-M2.5 |
| interview-reviews | 面试复习助手 | 面试题推送 | MiniMax-M2.5 |

### Agent 工作区
- `main`: `~/.openclaw/workspace`
- `public-writer`: `~/.openclaw/workspace/public-writer`
- `interview-reviews`: `~/.openclaw/workspace/interview-reviews`

---

## 4. 消息路由 (Bindings)

| 渠道 | 群组 ID | 绑定 Agent |
|------|---------|------------|
| Telegram | -5245177842 | public-writer |
| Telegram | -5226135797 | interview-reviews |

---

## 5. Telegram 配置

```json
{
  "enabled": true,
  "dmPolicy": "pairing",
  "botToken": "8491070142:AAGbxmX6z6AroSUtcHylMgovR47PukJTsg4",
  "groupPolicy": "allowlist",
  "streamMode": "partial"
}
```

### 已配置的群组
| 群组 ID | 策略 | 需要 @mention |
|---------|------|---------------|
| -5245177842 (公众号写作助手) | open | false |
| -5226135797 (面试复习群) | open | false |

---

## 6. Gateway 安全配置

```json
{
  "port": 18789,
  "mode": "local",
  "bind": "loopback",
  "auth": {
    "mode": "token",
    "token": "fa2dc3200ff32d56ad1ee9a0f7d767ffb39a290efff35ceb"
  }
}
```

### 禁止的节点命令
- camera.snap
- camera.clip
- screen.record
- calendar.add
- contacts.add
- reminders.add

---

## 7. Cron 定时任务

| 任务名 | 调度 | 用途 | 状态 |
|--------|------|------|------|
| 面试题推送-早8点 | cron 0 8 * * * | 每日面试题推送 | enabled (已修复超时) |
| 晚上9点笔记复习提醒 | cron 0 21 * * * | 复习提醒 | error |
| daily-news | cron 30 8 * * * | 每日新闻 | error |

---

## 8. Skill 配置

- 节点管理器：bun
- 已安装：clawhub, mmMusicMaker (音乐生成)

---

## 9. 插件

```json
{
  "telegram": { "enabled": true }
}
```

---

## 10. 常用命令

```bash
# 查看状态
openclaw status

# 查看 agent 列表
openclaw agents list

# 查看 cron 任务
openclaw cron list

# 查看 channel 状态
openclaw channels status

# 安全审计
openclaw security audit
```

---

## 11. 配置路径

| 类型 | 路径 |
|------|------|
| 主配置 | `~/.openclaw/openclaw.json` |
| 主工作区 | `~/.openclaw/workspace` |
| Agent 目录 | `~/.openclaw/agents/<agentId>` |
| Credentials | `~/.openclaw/credentials/` |

---

## 更新日志

- 2026-03-08: 初始记录配置
