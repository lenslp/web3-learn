# Supabase vs PostgreSQL

> 创建日期：2026-02-22  
> 分类：数据库 / Supabase / PostgreSQL

---

## 一句话理解

**Supabase = PostgreSQL + 一套开箱即用的后端服务**，就像给 PostgreSQL 装了"自动驾驶"。

---

## 传统 PostgreSQL 的问题

```
┌─────────────────────────────────────────────┐
│           传统 PostgreSQL 需要自己搭建                │
└─────────────────────────────────────────────┘

项目需要：
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  PostgreSQL  │    │   Redis    │    │   S3存储   │
│   数据库      │    │   缓存      │    │   文件存储  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                                   │
       ▼                                   ▼
┌─────────────┐                    ┌─────────────┐
│  API层      │                    │  认证服务   │
│ (自己写)    │                    │  (自己写)   │
└─────────────┘                    └─────────────┘
       │
       ▼
┌─────────────┐
│  实时订阅   │
│  (自己写)   │
└─────────────┘

❌ 每个功能都要自己搭建
❌ 维护成本高
❌ 容易踩坑
```

---

## Supabase 是什么

```
┌─────────────────────────────────────────────┐
│              Supabase = PostgreSQL +                     │
│        开箱即用的后端服务套件                    │
└─────────────────────────────────────────────┘

         PostgreSQL
    ┌──────────────────┐
    │     核心数据库    │
    └────────┬─────────┘
             │
    ┌────────┴─────────┐
    │                     │
    ▼                     ▼
┌─────────────┐   ┌─────────────┐
│   Auth      │   │   Realtime   │
│   用户认证   │   │   实时订阅   │
└─────────────┘   └─────────────┘
    ┌─────────────┐   ┌─────────────┐
    │   Storage   │   │   Edge      │
    │   文件存储   │   │   Functions │
    └─────────────┘   └─────────────┘
    ┌─────────────┐
    │   AI/Vector │
    │   向量搜索   │
    └─────────────┘
```

---

## Supabase 相比 PostgreSQL 的优势

### 1. 开箱即用的认证

```
┌─────────────────────────────────────────────┐
│              Supabase Auth                      │
└─────────────────────────────────────────────┘

只需几行代码：

// 注册
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// 第三方登录
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github'
})

✅ 支持：邮箱、密码、OAuth、短信、Magic Link
✅ 内置：用户管理、会话管理、RLS策略
```

### 2. 实时数据订阅

```
┌─────────────────────────────────────────────┐
│              Realtime 实时订阅                   │
└─────────────────────────────────────────────┘

// 订阅表变化
const channel = supabase
  .channel('messages')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('变化了:', payload)
    }
  )
  .subscribe()

// 订阅特定行
const channel = supabase
  .channel('messages')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages',
      filter: 'room_id=eq.1'  // 只监听房间1
    },
    (payload) => {
      console.log('新消息:', payload.new)
    }
  )
  .subscribe()

✅ WebSocket 实时推送
✅ 精确过滤（行级订阅）
✅ 在线状态管理
```

### 3. 文件存储

```
┌─────────────────────────────────────────────┐
│              Storage 文件存储                   │
└─────────────────────────────────────────────┘

// 上传文件
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-id/avatar.png', file)

// 获取公开URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-id/avatar.png')

// 生成签名URL（私有文件）
const { data, error } = await supabase.storage
  .from('private-files')
  .createSignedUrl('document.pdf', 60)

✅ S3 兼容
✅ 防盗链
✅ 图片缩略图
✅ CDN 全球加速
```

### 4. Edge Functions（边缘函数）

```
┌─────────────────────────────────────────────┐
│              Edge Functions                    │
└─────────────────────────────────────────────┘

// 编写 Deno/TypeScript 函数
supabase/functions/hello-world/index.ts:

Deno.serve(async (req) => {
  const { name } = await req.json()
  return new Response(
    JSON.stringify({ message: `Hello ${name}!` }),
    { headers: { "Content-Type": "application/json" } }
  )
})

// 调用
const { data, error } = await supabase.functions
  .invoke('hello-world', {
    body: { name: 'World' }
  })

✅ 全球边缘部署
✅ Deno 运行时
✅ 冷启动 < 100ms
```

### 5. Row Level Security (RLS)

```
┌─────────────────────────────────────────────┐
│           RLS 行级安全策略                     │
└─────────────────────────────────────────────┘

-- 只有自己才能看自己的数据
CREATE POLICY "users_can_view_own_data"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 只能修改自己的资料
CREATE POLICY "users_can_update_own_profile"
ON profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 团队成员可以查看
CREATE POLICY "team_members_can_view"
ON projects
FOR SELECT
USING (
  id IN (
    SELECT project_id 
    FROM team_members 
    WHERE user_id = auth.uid()
  )
);

✅ SQL 级别安全
✅ 无需在代码中处理
✅ 天然防 SQL 注入
```

---

## 对比表

| 功能 | 纯 PostgreSQL | Supabase |
|------|----------------|-----------|
| **数据库** | ✅ | ✅ (增强版) |
| **用户认证** | ❌ 需自行搭建 | ✅ 开箱即用 |
| **实时订阅** | ❌ 需自行搭建 | ✅ WebSocket |
| **文件存储** | ❌ 需 S3 | ✅ 内置 S3 兼容 |
| **边缘函数** | ❌ 需自行搭建 | ✅ Deno 全球部署 |
| **AI 向量** | ❌ 需自行搭建 | ✅ pgvector |
| **后台管理** | ❌ 需自行搭建 | ✅ 内置 Admin UI |
| **RLS** | ✅ 基础 | ✅ 增强 |
| **REST API** | ❌ 需自行搭建 | ✅ 自动生成 |
| **GraphQL** | ❌ 需自行搭建 | ✅ 可选 |

---

## 什么时候用哪个？

```
┌─────────────────────────────────────────────┐
│              如何选择？                         │
└─────────────────────────────────────────────┘

✅ 用 Supabase 如果：
   - 快速开发 MVP/原型
   - 不想自己搭建后端
   - 需要用户认证
   - 需要实时功能
   - 预算有限
   - 团队较小

✅ 用 纯 PostgreSQL 如果：
   - 已有完整后端团队
   - 需要高级数据库优化
   - 特殊数据库需求
   - 成本敏感（大项目可能更贵）
   - 完全控制数据库
```

---

## 架构对比图

```
┌─────────────────────────────────────────────────────────────┐
│              纯 PostgreSQL 架构                               │
└─────────────────────────────────────────────────────────────┘

┌─────────┐
│  前端   │
└────┬────┘
     │ HTTP
     ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  API 服务   │   │   认证服务   │   │   文件服务   │
│  (自己写)   │   │  (自己搭)   │   │   (S3)     │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ PostgreSQL  │
                   └─────────────┘

需要自己搭建和维护每个服务

┌─────────────────────────────────────────────────────────────┐
│              Supabase 架构                               │
└─────────────────────────────────────────────────────────────┘

┌─────────┐
│  前端   │
└────┬────┘
     │ HTTP / WebSocket
     ▼
┌─────────────────────────────────────────┐
│           Supabase                      │
│  ┌──────────┐ ┌──────────┐ ┌───────┐ │
│  │  Auth   │ │ Realtime │ │Storage│ │
│  └──────────┘ └──────────┘ └───────┘ │
│  ┌──────────┐ ┌──────────┐ ┌───────┐ │
│  │ Functions│ │  Admin  │ │  AI   │ │
│  └──────────┘ └──────────┘ └───────┘ │
└────────────┬───────────────────────┬────┘
             │                       │
             ▼                       ▼
      ┌──────────────┐      ┌──────────────┐
      │ PostgreSQL   │      │   S3 存储    │
      │ (增强版)     │      │              │
      └──────────────┘      └──────────────┘

一个平台搞定一切
```

---

## 面试常问题

### Q: Supabase 相比 Firebase 有什么优势？

```
┌─────────────────────────────────────────────┐
│          Supabase vs Firebase                  │
├─────────────────────────────────────────────┤
│                                             │
│  Supabase:                                 │
│  - 基于 PostgreSQL (SQL 强大)              │
│  - 开放源代码                              │
│  - 可以自托管                              │
│  - SQL 关系型，更适合复杂查询             │
│                                             │
│  Firebase:                                 │
│  - 基于 NoSQL                              │
│  - 闭源                                   │
│  - Google 生态                            │
│  - 文档型，更适合简单场景                 │
│                                             │
│  推荐：                                   │
│  - 需要复杂查询 → Supabase                │
│  - 简单快速开发 → Firebase                │
└─────────────────────────────────────────────┘
```

---

## 更新记录

| 日期 | 内容 |
|------|------|
| 2026-02-22 | 初始版本 |

---

*持续更新中...*
