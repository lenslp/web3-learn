## nextjs项目部署到cloudflare
1. https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
2. 部署到cloudflare之后需要把环境变量提交到cloudflare：
    + 配置环境变量：wrangler secret put OPENAI_API_KEY
    + 通过：ctx?.env?.OPENAI_API_KEY获取

## wrangler
Wrangler 是 Cloudflare 官方的命令行工具（CLI），用于开发、调试、部署和管理 Cloudflare Workers 及其相关资源
+ wrangler login 登录
+ wrangler secret put OPENAI_API_KEY 设置密钥
+ wrangler deploy 部署