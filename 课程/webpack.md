# weback配置

## webpack-merge
1. 用于合并多个 webpack 配置文件
2. 适用于区分开发环境和生产环境的配置

## 常用node命令
1. process.argv
    + 获取命令行参数
    + 例如：node build.js --mode production
    + process.argv 会返回一个数组，包含 ['node', 'build.js', '--mode', 'production']
2. process.env.NODE_ENV
    + 获取当前的环境变量
3. path.join() / path.resolve()
    + path.join：纯粹拼接路径片段，返回“规范化”的路径（不一定是绝对路径）
    + path.resolve：把路径片段“解析”为一个绝对路径，从右往左找第一个绝对路径为起点
    + path.join(__dirname, 'src', 'index.ts') 和 path.resolve(__dirname, 'src', 'index.ts') 结果是一样的。

## 用过的loader
1. swc-loader
    + 将 TypeScript/JavaScript 代码编译为浏览器能识别的 JavaScript 代码
    + 基于 rust 编写，性能优于 babel-loader
2.MiniCssExtractPlugin.loader / style-loader
    + MiniCssExtractPlugin.loader 将 CSS 提取到单独的文件中，性能更好，可缓存，适用于生产环境
    + style-loader 则是将 CSS 内联到 JavaScript 里，支持热更新，适用于开发环境

## 用过的plugin
1. @soda/friendly-errors-webpack-plugin
    + 把终端里的编译日志和报错变得更简洁、可读、对开发者更友好
    + 优化 devServer 输出：配合 quiet: true 使用时，只在编译成功或出错时打印一条简洁提示，避免刷屏
    + clearConsole: true,  // 每次编译前清空控制台
    + 出错时：显示“当前工程最相关”的 1~2 条错误，而不是几百行堆栈
2. MiniCssExtractPlugin
    + 将 CSS 提取到单独的文件中，而不是内联在 JavaScript 里
    + 适用于生产环境，能让 CSS 文件被浏览器单独缓存，提高加载性能
3. 生产环境加上hash，避免浏览器缓存问题
    + contenthash会在文件内容变化时才变化
    + hash会在每次构建时变化
    + chunkhash会在依赖的模块变化时才变化
```typescript
new MiniCssExtractPlugin({
    filename: _modeflag
        ? "styles/[name].[contenthash:5].css"
        : "styles/[name].css",
    chunkFilename: _modeflag
        ? "styles/[name].[contenthash:5].css"
        : "styles/[name].css",
    ignoreOrder: false,
}),
```
4. CleanWebpackPlugin
    + 每次构建前，清理输出目录，避免旧文件残留
5. HtmlWebpackPlugin
    + 自动生成 HTML 文件，并注入打包后的资源
    + 支持模板文件，方便自定义 HTML 结构
6. ThemedProgressPlugin
    + 美化构建进度条，提供更好的视觉体验
    + 支持多种主题，可以根据喜好选择

## 性能优化
1. Webpack 5 内置的 Asset Modules 功能，自动处理图片等静态资源
```typescript
{
    test: /\.(png|jpg|jpeg|gif|svg)$/i,
    type: "asset",
    parser: {
        dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb 以下内联
        },
    },
},
```
2. Webpack 5 内置 performance
```typescript
performance: {
    hints: "warning", // "error" | false
    maxAssetSize: 30000000, // 单个资源最大体积，单位字节
    maxEntrypointSize: 50000000, // 入口文件最大体积，单位字节
},
```
3. 多线程压缩
```typescript
optimization: {
    minimize: true, // 开启压缩
    // css + js 多线程压缩 加快编译速度
    // 如果电脑本身就比较慢的话， 反而会更慢
    minimizer: [
      new CssMinimizerPlugin({
        parallel: true, // 开启多线程压缩css
      }),
      new TerserPlugin({
        parallel: true, // 开启多线程压缩js
      }),
    ],
  },
```
4. externals
+ 用于将指定的第三方库（如 React、ReactDOM）从打包产物中剥离，改为通过 CDN / 外部脚本引入，从而减小打包体积、提升构建速度
```typescript
externals: {
    // 排除对 react 和 react-dom 的打包，使用 CDN 引入
    react: "React",
    "react-dom": "ReactDOM",
},
``` 
+ nextjs项目中不建议把react、react-dom externals掉，原因如下：
    + Next.js 服务端需要 React，externals 排除后服务端会找不到，导致构建失败
    + 版本管理复杂 - 需要保证 CDN React 版本与 package.json 版本一致
    + 多一次 HTTP 请求 - 带来网络延迟，可能抵消 bundle 减小的收益
+ 什么时候可以考虑 external 掉 React？
    + 微前端：多个子应用共享同一 React 实例，避免重复打包
    

## 集群编译
1. 是什么：利用多进程 / 多核 CPU 加速构建
2. 如何开启：
    + 使用 thread-loader：loader 多进程并行
    + Terser 并行压缩：JS 压缩多线程
    + filesystem cache：编译结果缓存
    + Webpack 5 内置并行，默认启用
3. 注意事项：
    + 线程开销：多线程有一定开销，适合大型项目，小项目可能适得其反
    + 资源限制：避免开启过多线程，导致系统资源耗尽
    + 调试复杂度：多线程可能增加调试难度，需权衡