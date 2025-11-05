React 18 和 19 引入了多项重要特性，主要围绕并发渲染、开发体验优化、服务器组件等方向展开，以下是核心新特性总结：
## React 18 核心新特性（2022 年 3 月发布）
1. 并发渲染
+ 引入 “并发更新” 机制，允许 React 中断、暂停、恢复甚至放弃渲染工作，避免渲染阻塞主线程（如用户输入、动画等高频操作）。
+ 基于此机制，衍生出 useTransition、useDeferredValue 等新 API，用于区分 “紧急更新”（如输入框）和 “非紧急更新”（如列表过滤），提升交互流畅度。
2. 自动批处理
优化状态更新的批处理逻辑，将多个状态更新（即使在定时器、Promise 等异步操作中）合并为一次渲染，减少不必要的重渲染，提升性能。
3. Transitions API
useTransition：标记状态更新为 “非阻塞过渡”，React 可优先处理用户交互等紧急任务，避免界面卡顿。
适用于搜索框输入联想、列表筛选等场景，区分 “输入响应” 和 “结果渲染” 的优先级。
4. 服务器组件（Server Components）预览
+ 允许组件在服务器端渲染，减少客户端 JavaScript 体积，提升首屏加载速度（18 中为实验性特性，19 进一步完善）。
5. 新的客户端与服务器渲染 API
客户端：用 createRoot 替代 ReactDOM.render，支持并发渲染。
服务器：新增 renderToPipeableStream（Node 环境）和 renderToReadableStream（Web 流环境），优化服务器渲染性能。
6. Suspense增强
+ React 18 正式将 Suspense 的适用范围从 “仅组件懒加载” 扩展到 “数据加载”，允许配合符合规范的数据获取库（如 React Query、SWR 的 Suspense 模式），在数据加载期间显示 fallback。
+ 可以与并发特性协同工作，允许中断低优先级的加载任务，优先响应用户交互
+ 支持服务器组件
## React 19 核心新特性（2024 年 10 月发布）
1. 服务器组件（Server Components）稳定版
正式支持服务器组件（RSC），组件默认在服务器渲染，通过 'use client' 指令标记客户端组件。
服务器组件无状态、无副作用，可直接读取后端数据，大幅减少客户端 JS 体积。
2. Actions 与表单处理
引入 useActionState 和表单 action 属性，简化表单提交逻辑，支持服务器端表单处理（结合 RSC）。
自动处理表单提交状态（加载、成功、错误），无需手动管理 isLoading 状态。
3. Suspense 全面支持数据获取
客户端和服务器端均支持通过 Suspense 等待数据获取，配合 use 钩子（替代 React.lazy 的部分功能）处理异步数据。
示例：const data = use(fetchData()); 可在组件中直接使用异步数据，由 Suspense 处理加载状态。
4. 编译时优化（React Compiler）
+ React 团队发布了 React Compiler v1.0，自动优化性能，无需开发者手动编写 useMemo、useCallback 等优化代码。
+ 通过静态分析识别组件依赖，仅在必要时触发重渲染。
5. 简化状态与副作用
useEffect 清理函数支持异步（返回 Promise），便于处理异步清理逻辑（如取消请求）。
useState 支持直接传递函数作为初始值（无需 lazy initializer 模式）。
6. 服务器操作（Server Actions）
允许在客户端组件中直接调用服务器函数（通过 'use server' 指令标记），简化前后端数据交互，无需手动编写 API 调用。
## 总结
React 18 核心是并发渲染架构，为高性能交互奠定基础，同时铺垫服务器组件。
React 19 聚焦服务器组件生态完善，通过 Actions、Suspense 数据获取等特性简化全栈开发，推动 “编译时优化” 减少手动优化成本。
## react18并发特性和fiber机制的关系
+ Fiber 机制（React 16 引入）：是 React 内部重构的协调引擎数据结构，为并发特性奠定了 “技术基础”，但未完全释放并发能力。
+ 并发特性（React 18 完善）：是基于 Fiber 机制实现的渲染调度策略，是 Fiber 机制的 “能力落地”，让 React 具备了 “可中断、优先级调度” 的实际能力。