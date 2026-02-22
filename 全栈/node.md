## 常用api
1. fs：文件系统操作（读写、删除、创建目录等）
  + copyFileSync(source, target)：同步复制文件
  + copySync(source, target)：同步复制文件或目录 // fs-extra 提供的增强能力
  + existsSync(path)：检查路径是否存在
  + mkdirSync(path)：同步创建目录
  + removeSync(path)：同步删除目录或文件
2. path：路径操作（拼接、解析等）
  + path.join()：拼接路径，自动处理路径分隔符
  + path.resolve()：解析路径，返回绝对路径
3. http/https：创建 HTTP/HTTPS 服务器/客户端
4. net：创建 TCP 服务器/客户端
5. child_process：创建子进程执行 shell 命令等
  + execSync：在 Node 进程里直接运行一条系统命令（例如 git branch --show-current），并阻塞当前代码，直到命令执行完才继续往下执行。
6. events：事件模块，用于自定义事件和事件监听
7. process：全局进程对象，提供与当前 Node.js 进程相关的信息和操作
  + process.cwd()：执行命令时所在的目录
  + __dirname：当前模块所在目录的路径
  + process.exit(0/1)：退出当前进程，0 表示成功，1 表示失败
8. which: 第三方模块，判断某个命令是否已安装
  + which('command')：返回命令的可执行路径，若不存在则返回 null

## node的事件循环
+ 宏任务：6个阶段的宏任务队列 + 1个微任务队列，每个阶段对应特定类型的任务，按阶段依次执行，每个阶段清空当前队列后进入下一阶段。setTimeout、setInterval、setImmediate、I/O 回调等。
+ 6个阶段：
    1. timers：执行 setTimeout 和 setInterval 回调函数
    2. pending callbacks：阶段执行某些系统操作（如 TCP 错误类型）的回调函数
    3. idle, prepare：内部使用，无需关注
    4. poll：轮询阶段，处理 I/O 事件、定时器事件等
    5. check：执行 setImmediate 回调函数
    6. close callbacks：处理关闭事件的回调函数，如关闭文件描述符等
+ 每个阶段的宏任务执行完毕后，会先清空微任务队列
+ 微任务：包括 Promise.then/catch/finally、process.nextTick（Node 独有，优先级高于其他微任务）

## setImmediate 和 setTimeout
1. 主模块中执行顺序不确定
2. I/O 回调中 setImmediate 优先级更高

## process.nextTick
1. 独立于事件循环的 6 个阶段，无论当前处于哪个阶段，process.nextTick 的回调都会在 当前阶段的所有任务执行完毕后、进入下一阶段前 执行。
2. 若 process.nextTick 回调中再次调用 process.nextTick，会形成无限循环，导致事件循环无法进入下一阶段（阻塞 I/O 等宏任务），需谨慎使用。

## express中间件
1. 从上到下依次执行
2. 每个中间件可以对请求进行处理、修改、响应等操作
3. 通过 next() 将请求传递给下一个中间件，如果不调用 next()，请求将终止
```
// (req, res, next) 是固定参数
const middleware = (req, res, next) => {
  // 1. 执行逻辑（如打印日志、验证 token）
  console.log(`收到请求：${req.method} ${req.url}`);
  // 2. 调用 next() 传递给下一个中间件/路由（不调用则请求会被阻塞）
  next();
};

app.use(middleware); // 所有请求都会经过该中间件
app.use('/api', middleware); // 仅 /api 前缀的请求经过该中间件
```
4. 路由级中间件
```
const router = express.Router();
router.use(middleware); // 该路由下的所有请求经过中间件
```
5. 内置中间件
```
app.use(express.json()); // 解析 JSON 格式的请求体（req.body）
app.use(express.urlencoded({ extended: true })); // 解析表单格式的请求体
app.use(express.static('public')); // 托管静态资源（如 HTML、图片）
```
6. 错误处理中间件
```
// 错误处理中间件，必须有 4 个参数
app.use((err, req, res, next) => {
  // 1. 处理错误（如记录日志、返回错误信息）
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});
```
7. 第三方中间件
```
const morgan = require('morgan');
app.use(morgan('dev')); // 打印请求日志（开发环境）
```

## koa 中间件洋葱模型
1. 请求从外到内依次经过中间件的前置处理
2. 到达最里层后
3. 响应从内到外依次经过中间件的后置处理

## node的BFF层
1. 定义：BFF（Backend for Frontend）层是指在前端应用与后端服务之间的一层中间层，负责处理前端应用的请求和响应。
2. 作用：
    + 聚合后端多个服务的数据（如同时调用用户服务、商品服务，整合后返回给前端）；
    + 适配前端需求（如数据格式转换、字段过滤，避免前端处理复杂逻辑）；
    + 隔离前端与后端
        - 前端只对接 BFF，无需关心后端服务的具体实现
        - 后端专注于业务层，无需适配前端需求
3. node向后端服务发起请求的方式
    + unix domain socket，适用于同一台机器上的进程间通信

## node集群
1. 定义：将多个 Node.js 进程分布在多个物理或虚拟机器上，共同处理 incoming requests，实现负载均衡和高可用性。
2. 作用：
    + Node.js 是单线程的，单个进程只能利用一个 CPU 核心。
    + 使用 cluster 模块可以启动多个工作进程（Worker），每个进程都是独立的 Node.js 实例，监听同一个端口。
    + 主进程负责分发请求和管理工作进程的生命周期。
    + 每个工作进程都是一个独立的 Node.js 实例，有自己的事件循环和内存空间。
    + 工作进程之间通过 IPC（Inter-Process Communication）通信，主进程可以将请求分发给不同的工作进程处理。
    + 这样可以充分利用多核 CPU，提高 SSR 页面渲染的并发能力。

## 面向切面的编程 AOP
1. 定义：AOP 就是：把“到处都要写的重复代码”，单独拎出来，统一在一个地方写。将横切关注点（错误处理、日志、路由、依赖管理等）从业务逻辑中分离出来，通过切面统一处理，实现代码的 高内聚、低耦合
  + 接口日志
  + 权限校验
  + 接口耗时统计
  + 统一异常处理

## 依赖注入（Dependency Injection）、Awilix
1. Node.js 世界里，一个帮你自动管理依赖关系的“对象工厂 + 容器”
2. 解决的问题：
  + 集中管理对象的创建
  + 自动把依赖注入进去，不用手动 new
  + 让模块解耦、好测试、好维护
```typescript
// logger.js
export class Logger {
  log(msg) {
    console.log("[LOG]", msg)
  }
}

// userRepo.js
export class UserRepo {
  findUser() {
    return { id: 1, name: "Tom" }
  }
}

// userService.js
export class UserService {
  constructor({ userRepo, logger }) {
    this.userRepo = userRepo
    this.logger = logger
  }

  getUser() {
    this.logger.log("get user")
    return this.userRepo.findUser()
  }
}

// 用 Awilix 统一“组装对象”
// container.js
import { createContainer, asClass } from "awilix"
import { Logger } from "./logger.js"
import { UserRepo } from "./userRepo.js"
import { UserService } from "./userService.js"

const container = createContainer()

container.register({
  logger: asClass(Logger).singleton(),
  userRepo: asClass(UserRepo).singleton(),
  userService: asClass(UserService),
})

export { container }

// 使用
// app.js
import { container } from "./container.js"

const userService = container.resolve("userService")

userService.getUser()

// 实际发生了什么？
container.resolve("userService")
  ↓
new UserRepo()
new Logger()
new UserService({ userRepo, logger })

```

## module-alias
1. 作用：用“别名”来引用模块，避免写一堆又长又丑的相对路径。

## log4js
1. 作用：Node.js 里的日志工具，用来把 console.log 升级成：可分级、可分文件、可格式化、可按规则输出的日志系统

## qps稳定
pm2、ec2、ecs、nginx、k8s、docker
serverless

## 请求量大时，node如何保证稳定性
1. 性能
2. 错误监控

## ioc、面向切面、依赖注入、控制反转、AOP
1. ioc：控制反转，把对象的创建和依赖管理交给容器（如 Awilix），而不是在代码中直接 new。
2. 面向切面：把横切关注点（如日志、权限校验、异常处理等）从业务逻辑中分离出来，通过切面统一处理。
3. 依赖注入：在运行时，容器会自动把依赖的对象注入到需要它们的类中。
4. 控制反转：把对象的创建和依赖管理的控制权交给容器，而不是在代码中直接 new。
5. AOP：面向切面编程，把横切关注点从业务逻辑中分离出来，通过切面统一处理。

## ts-node-dev
1. 是一个用于开发阶段的工具，让你可以直接运行 TypeScript，并在代码变更时自动重启进程。
2. 专门用在本地开发，不是生产环境。
3. 核心原理：
  + ts-node：在运行时把 .ts 编译成 JS
  + 文件监听：监听 .ts 文件变化
  + 自动重启进程：类似 nodemon

## koa 架构
1. Router：负责处理 HTTP 请求，根据 URL 调用对应的 Controller 方法。
2. Controller：负责处理业务逻辑，调用 Service 层方法，返回结果给 Router。
```typescript
import { GET, route } from 'awilix-koa';
import type { Context } from 'koa';
// 定义路由
@route('/')
class IndexController {
  // 处理请求 controller 角色
  @GET()
  async actionList(ctx: Context): Promise<void> {
    const data = await ctx.render('index', {
      data: '服务端数据',
    });
    ctx.body = data;
  }
}
export default IndexController;
```
3. Service：负责实现业务逻辑，调用 Repository 层方法，处理数据。
4. Repository：负责与数据库或其他数据源交互，执行 CRUD 操作。
  + 简单项目不需要 Repository 层，直接在 Service 层操作数据库。
```typescript
import { PrismaClient } from '@prisma/client';

class UserService {
  private prismaClient: PrismaClient;

  constructor({ prismaClient }: { prismaClient: PrismaClient }) {
    this.prismaClient = prismaClient;
  }

  async createUser(email: string, name?: string) {
    return await this.prismaClient.user.create({
      data: {
        email,
        name,
      },
    });
  }
}
```