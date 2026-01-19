## AWS + Clodflare混合云架构
https://www.processon.com/view/link/62e77f4f7d9c08072e6eea09

## VPC
1. 作用：你在公有云上的私有机房
    + VPC 主要是给「后端服务 + 数据库」用的
    + VPC 的核心价值 = 网络隔离 + 内网安全
2. 路由表
    + 决定“流量怎么走”，
    + 去公网：走 Internet Gateway（让 公网 ↔ VPC 能双向通信（进得来、出得去））
    + 私有子网出网：走 NAT Gateway（让 私网 → 公网 单向出网（出得去、进不来））
2. 子网
    + Public Subnet：能直接上公网
    + Private Subnet：只能内网访问
    + Private Subnet 访问公网 需要 Internet Gateway（IGW）
4. 网关
    + Internet Gateway（IGW）：连公网，允许内外双向通信
    + NAT Gateway：私网出网用，只出不进
5. 安全组
    + 像“防火墙规则”，控制：哪些 IP / 端口能进，哪些能出
    + 创建数据库的时候 安全组的iD + vpc的ID 必须一致
6. 配置：
    + EC2 / ECS必须在 VPC 里，前端/入口在 Public Subnet，后端在 Private Subnet
    + RDS几乎总是在 Private Subnet，不暴露公网
    + Lambda默认不在 VPC，默认不在 VPC，只有当它要访问：RDS、内网服务才需要放进 VPC
7. 用生活化比喻
    + VPC：一个小区
    + 子网：小区里的楼栋
    + 安全组：门禁规则
    + IGW：小区大门
    + NAT：代购跑腿（私网出门）
8. 生产环境 VPC 核心原则
    1️⃣ 一个环境一个 VPC
    2️⃣ 至少两个可用区（AZ）
    3️⃣ 公有子网放入口，私有子网放业务
    4️⃣ 数据库永远不在公有子网
    5️⃣ 用安全组而不是 IP 控制访问

## Amplify
AWS 提供的一站式“前端 + 后端”云开发平台，目标是：让前端/全栈开发者，用最少的 AWS 知识，把 Web / App 快速上线。

## Cloudformation
1. 作用：AWS 提供的“基础设施即代码”（IaC）服务，用来定义和部署 AWS 资源。
2. 优点：
  + 版本控制：可以把资源定义文件放到 Git 里，方便团队协作。
  + 重复部署：可以用一个模板，快速部署多个环境（如 dev、prod）。
  + 可视化：AWS Console 提供可视化的资源管理界面。
3. 对应阿里云的：ROS

## Lambda
1. 它是 AWS 提供的一种 无服务器（Serverless）计算服务。你只写代码，不用管服务器，AWS 自动帮你运行。
2. 优点：
  + 不用买服务器
  + 自动扩缩容（并发几千也扛得住）
  + 非常适合 API、定时任务、事件处理
3. 缺点
  + 不能用于大量长连接（websocket）
  + 不能用于强状态依赖，本地缓存，Lambda 是无状态的
  + 超低延迟极端场景，冷启动可能影响
4. 对应阿里云的：FC，都是Serverless

## layer层
1. 作用：Lambda 函数可以依赖的第三方库、代码、配置文件等，都可以打包成 Layer 上传到 AWS，Lambda 函数运行时会自动加载这些 Layer。
2. 优点：
  + 共享代码：多个 Lambda 函数可以共享同一个 Layer，避免重复上传。
  + 版本管理：Layer 可以有不同的版本，方便管理不同的依赖。
  + 隔离性：Layer 可以隔离不同函数的依赖，避免版本冲突。
3. 对应阿里云的：FC的“依赖包”

## SAM
1. 用来部署和管理 Lambda 等 Serverless 资源的工具。
2. 常用命令
    + `sam init`：初始化一个新的 SAM 项目
    + `sam build`：编译项目，生成可部署的代码
    + `sam deploy`：部署项目到 AWS
        - 打包你的代码
        - 上传到 S3
        - 创建/更新 CloudFormation 堆栈
        - 配置 Lambda 函数、API Gateway 等资源
        - 输出部署结果（如 API URL）
    + `sam local invoke`：在本地模拟 Lambda 函数调用
    + `sam local start-api`：在本地启动 API Gateway 模拟服务

## EC2、S3、CloudFront
1. AWS 提供的云服务（对应aliyun的 ecs）
2. AWS 提供的对象存储（对应aliyun的 oss）
3. AWS 提供的 CDN（对应aliyun的 cdn）

## ECS和EC2
1. ECS：AWS 的容器编排平台（AWS 帮你管进程）、你只需要提供docker镜像，AWS 会自动启动、重启、监控、扩缩容。
2. EC2：一台云服务器（你自己管进程）。自己决定装什么系统、怎么启动node、怎么配置

## Lambda 和 EC2应用场景
1. 更适合 Lambda
  + API 接口（配 API Gateway）
  + 上传文件触发处理（S3 触发）
  + 定时任务（EventBridge 定时）
  + 异步任务/队列消费（SQS）
  + 数据清洗、小型 ETL、Webhook
2. 更适合 EC2
  + 传统后端服务（Spring Boot / Django / Node 常驻）
  + 需要 WebSocket/长连接
  + 需要运行超过 15 分钟的任务
  + 需要本地磁盘长期缓存、常驻进程、复杂依赖
  + 自建数据库/中间件（不推荐但有人这么做）

## cloudflare
1. CDN + 安全 + 边缘网络
2. pages：用来部署前端 / 静态网站、自动cdn、自动https、免费额度高
3. workers：在全球边缘节点运行 JavaScript / TS 代码、轻量后端、BFF

## CloudFront
1. AWS 生态里的 CDN，和 S3 / API Gateway / ALB 深度绑定

## 数据库
1. Aurora and Rds
    + Aurora 可以理解为 AWS 的“增强版 PostgreSQL / MySQL”
    + RDS 是 AWS 帮你托管数据库的一整套服务

## AZ
1. AZ = Availability Zone = 可用区
2. 每个 Region 里有多个 AZ，AZ 之间物理隔离，互不影响
3. 生产环境至少用两个 AZ，保证高可用

## 技术架构
1. Cloudflare（CDN / WAF）
    + CDN 加速：静态资源（JS/CSS/图片）在边缘节点缓存，就近返回
    + WAF 防护：拦截常见 Web 攻击（SQL 注入、XSS、扫描器）
    + DDoS 防护：流量洪水先在 Cloudflare 被吸收
    + TLS/HTTPS：对外的证书、HTTPS 终止通常在这里完成
    + 用户访问 https://api.your.com/... 或 https://www.your.com/...，DNS 解析到 Cloudflare，Cloudflare 根据规则：能缓存的直接在边缘返回（静态资源、可缓存的 GET），不能缓存的转发到“源站”（这里源站就是 AWS API Gateway 的域名/自定义域名）
2. AWS API Gateway
    + 路由：/users、/orders 转到不同后端（Lambda 或 ECS）
    + 认证与授权（可选）：JWT Authorizer / Cognito / IAM
    + 限流：按 API Key、按用户、按阶段（stage）做节流
    + 请求/响应映射：参数校验、Header 处理（HTTP API 相对轻，REST API 更强）
    + 观测：接入 CloudWatch 日志、指标、Tracing（可配 X-Ray）
3. AWS Lambda / ECS
    + 可以同时用：一部分轻接口走 Lambda，一部分重服务走 ECS
4. RDS / DynamoDB
    + RDS（关系型数据库：MySQL/PostgreSQL 等）
    + 关系复杂选 RDS；极高并发和简单访问模式选 DynamoDB
5. 完整流程：以 GET /api/users/123 为例：
    1. 用户发请求到 api.your.com
    2. Cloudflare先做 WAF/反爬/限速
    3. 如果配置了缓存且命中：直接返回（很多 API 不缓存），否则转发到源站（API Gateway）
    4. API Gateway 路由到对应后端（Lambda 或 ECS），可选：做 JWT/IAM 鉴权、限流、日志
    5. Lambda / ECS 执行业务逻辑（校验、组装、调用数据层）
    5. RDS / DynamoDB 返回数据

## PM2集群
1. 让同一个 Node.js 应用同时跑多个进程，自动利用多核 CPU，并由 PM2 负责管理与负载分发
2. 解决了什么问题：Node.js 单进程只能用一个 CPU 核，Node.js 单进程只能用一个 CPU 核。
   