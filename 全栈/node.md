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

## node集群
1. 定义：将多个 Node.js 进程分布在多个物理或虚拟机器上，共同处理 incoming requests，实现负载均衡和高可用性。
2. 作用：
    + Node.js 是单线程的，单个进程只能利用一个 CPU 核心。
    + 使用 cluster 模块可以启动多个工作进程（Worker），每个进程都是独立的 Node.js 实例，监听同一个端口。
    + 主进程负责分发请求和管理工作进程的生命周期。
    + 每个工作进程都是一个独立的 Node.js 实例，有自己的事件循环和内存空间。
    + 工作进程之间通过 IPC（Inter-Process Communication）通信，主进程可以将请求分发给不同的工作进程处理。
    + 这样可以充分利用多核 CPU，提高 SSR 页面渲染的并发能力。
