## 组件开发为什么要使用rollup
1. 原生支持 Tree-shaking，配置更简洁
2. 输出产物更 “干净”，体积更小
    + 相比之下，webpack会包含一些运行时的产物
    + Rollup 默认会将第三方依赖标记为 “外部依赖”（external），不打包进产物
