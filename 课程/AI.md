## AI CODE榜单
https://arena.ai/zh/leaderboard/code

## MCP
1. 是什么
    + MCP 是一种开放标准，旨在解决 AI 模型如何与外部工具、数据源和业务逻辑进行交互的问题
    + 它定义了 AI 如何发现、理解和调用外部功能的统一标准
2. 网站：mcp.so
3. 如何开发mcp
    + https://github.com/modelcontextprotocol

## agents
1. 是什么
    + 能自主规划 + 决策 + 调用工具的 AI 程序
2. 开发agents：
    + mastra.ai
    + LangChain技术架构
    + aitmpl.com
    + n8n
3. codereview agents
4. rag

## skills
1. 是什么
    + 它是一套结构化的指令、脚本和资源，指导 AI 如何处理特定领域的复杂任务
    + 通常用于处理需要深度领域知识的任务（例如：代码审计、特定架构迁移、UI 设计规范等）
    + 比起“调用一个外部函数”，Skill 更多是教 AI “如何分步骤完成一个任务”

## 团队协作
1. 问题：同时使用AI开发有一个问题 就是大家使用方式不一样模型不一样 AI会改动代码上下文
2. 解决：
    + 共享 Prompt 模板
    + Cursor Rules
    + 代码审查 agents