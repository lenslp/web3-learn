## 组件开发为什么要使用rollup
1. Tree-shaking效果更好
2. 配置更简洁
3. 输出产物更 “干净”，体积更小
    + 相比之下，webpack会包含一些运行时的代码（比如react、用于管理模块间依赖关系的加载机制）
    + Rollup 默认会将第三方依赖标记为 “外部依赖”（external），不打包进产物
+ 打包速度更快，Webpack 构建时间相对较长（会执行许多额外的工作，比如模块解析、插件处理、加载器等）

## 为什么一般要打包出ESM、CJS两种格式
1. 不同运行环境/构建工具支持的模块标准不一样，为了兼容性 + 最佳性能，需要同时提供两种入口
2. ESM（import/export）
    + 现代浏览器、Node.js 等支持原生 ESM 模块
    + 可以直接在浏览器中使用 `<script type="module">` 引入
    + 更容易 Tree-Shaking
3. CJS（require/module.exports）
    + Node.js 传统的 CommonJS 模块格式
    + Jest 等测试框架默认支持 CJS 模块
    + 一些旧的构建系统/脚本工具