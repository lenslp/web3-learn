## webpack的构建流程
webpack 的构建流程可分为 初始化、编译、输出 三大阶段，核心是将多个模块（JS、CSS、图片等）按依赖关系打包成最终资源。具体流程如下：
### 初始化阶段
+ 解析配置：读取 webpack 配置文件（如 webpack.config.js）、命令行参数，合并生成最终配置对象。
+ 创建 Compiler 实例：Compiler 是 webpack 的核心对象，负责统筹整个构建流程，包含配置信息和生命周期钩子。
+ 初始化插件：执行插件的 apply 方法，让插件订阅 Compiler 的生命周期事件，参与构建过程。
### 编译阶段
+ 入口处理：从配置的 entry 入口文件开始，调用 loader 对文件进行转译（如 babel-loader 转 ES6+ 为 ES5），得到标准 JS 模块。
+ 依赖解析：解析转译后的 JS 代码，生成抽象语法树（AST），分析模块依赖的其他文件（如 import/require），递归处理所有依赖，生成模块依赖图。
+ 生成 Chunk：将相互依赖的模块组合成 Chunk（代码块），如入口 chunk、异步加载的 chunk。
    + 入口 chunk：从 entry 配置开始，递归解析所有依赖，将互相依赖的模块打包到一个 chunk 中。
    + 异步 chunk：在代码中使用 import().then等动态导入语法，会生成独立的异步 chunk。
    ```
        // 动态导入（路径可动态生成，返回 Promise）
        button.addEventListener('click', () => {
        import('./Component').then(({ default: Component }) => {
            // 使用 Component
        });
        });
    ```
### 输出阶段
+ 优化 Chunk：通过内置插件或第三方插件（压缩 JS、分割 CSS、提取公共代码等）对 Chunk 进行优化。
+ 生成输出文件：根据 output 配置，将优化后的 Chunk 写入磁盘，生成最终的 bundle 文件（如 main.js、style.css）。
### 插件机制
在以上过程中, Webpack 会在特定的时间点广播出特定的事件, 插件在监听到感兴趣的事件后会执行特定的逻辑, 并且插件可以调用 Webpack 提供的 API 改变 Webpack 的运行结果。
### 如何将第三方库、公共组件拆分成独立 chunk
+ 如果希望对静态 import 的依赖进行拆分（如将第三方库、公共组件拆分成独立 chunk），需要通过 Webpack 的 splitChunks 配置手动开启。
```
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all', // 对所有 chunk（包括初始 chunk 和异步 chunk）生效
      cacheGroups: {
        // 拆分第三方库（如 node_modules 中的依赖）
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors', // 生成的 chunk 名称
          chunks: 'all',
        },
        // 拆分公共组件（被多个模块引用的组件）
        common: {
          minChunks: 2, // 被至少 2 个模块引用
          name: 'common',
          chunks: 'all',
          priority: -20, // 优先级低于 vendor
        },
      },
    },
  },
};
```
### 为什么要将第三方库、公共组件拆分成独立 chunk
1. 优化缓存策略：第三方库通常更新频率低，拆分成独立chunk后，其哈希值很少变化，用户只需下载一次并长期缓存。
2. 并行加载：浏览器可以并行下载多个较小的chunk，而不是一个大chunk，提高了资源加载效率。
3. 代码复用：将公共组件拆分成独立 chunk 后，多个模块可以共享使用，避免重复打包。
4. 构建优化：修改应用代码时，只需要重新编译应用代码chunk，加速开发构建过程。

## externals
+ 默认情况下，webpack 会把你 import 的所有模块打包进 JS 文件里。
+ 使用 externals 后，webpack 不再打包这些模块，而是期望它们在运行时 从全局变量或外部 CDN 获取

## Tree Shaking
+ Tree Shaking 是一种优化技术，用于移除未使用的代码，从而减少最终打包文件的大小。
+ 实现原理：
    + 静态分析：在编译时，通过静态分析代码，确定哪些模块被引用，哪些模块未被引用。
    + 标记未使用代码：将未被引用的模块标记为「未使用」状态。
    + 移除未使用代码：在打包时，根据标记结果，将未使用的模块从最终 bundle 中移除。
+ 生产环境默认开启 Tree Shaking：
    + 在 webpack 配置中，设置 mode 为 production，即可开启 Tree Shaking 优化。
```
// webpack.config.js
module.exports = {
  mode: 'production', // 开启 production 模式，自动开启 Tree Shaking
};
```

## loader
+ webpack 只能处理 JS 文件，其他类型的文件（如 CSS、图片、字体等）需要通过 loader 进行转换，才能被 webpack 理解和打包。
+ 从右到左：每个 loader 从右到左执行，将上一个 loader 的输出作为下一个 loader 的输入。

### 常用loader
1. postcss-loader
    + 用于处理 CSS 文件，自动添加浏览器前缀，确保 CSS 兼容性。
    + Tailwind CSS 的“引擎”，把那些 flex, p-4, dark:bg-black编译成标准的 CSS。
2. css-loader
    + 解析 CSS 文件，处理 CSS 中的 import/require 语句，将 CSS 模块转换为 CommonJS 模块。
3. style-loader
    + 将 CSS 模块注入到 DOM 中，通过 style 标签的方式应用 CSS。
4. babel-loader
    + 将 ES6+ 代码转换为 ES5 代码，支持 JSX 语法转换。
5. file-loader
    + 处理文件资源（如图片、字体等），将文件复制到输出目录，并返回文件路径。
6. url-loader
    + 类似 file-loader，但当文件大小小于阈值时，会将文件转换为 Base64 URL，内联到代码中。
7. html-loader
    + 处理 HTML 文件，支持内联 CSS、JS、图片等资源。
8. less-loader
    + 将 Less 文件转换为 CSS 文件。
9. ts-loader
    + 将 TypeScript 文件转换为 JavaScript 文件。   

### loader执行顺序
+ 从右到左：每个 loader 从右到左执行，将上一个 loader 的输出作为下一个 loader 的输入。

### 自定义loader 
```js
// 接收原始文件内容作为参数，返回转换后的内容
module.exports = function (source) {
    return source.replace(/import/g, 'require');
}
```
## plugin
插件是 webpack 的核心机制，用于扩展其功能。插件通过监听 webpack 生命周期事件，在特定时机执行自定义逻辑。

### 自定义plugin
+ 定义一个插件类，接收配置参数，在 apply 方法中监听 webpack 生命周期事件，在特定时机执行自定义逻辑。
+ apply 方法：
    + 接收 compiler 对象作为参数，用于访问 webpack 的内部状态和 API。
    + 在 apply 方法中，通过 compiler.hooks 监听 webpack 生命周期事件，如 emit、done 等。
    + 在事件回调中，执行自定义逻辑，如修改输出文件、添加自定义代码等。
```js
// 插件类，接收配置参数
class MyPlugin {
    constructor(options) {
        this.options = options;
    }
    // 插件应用方法，接收 compiler 对象
    apply(compiler) {
        // 监听 webpack 生命周期事件，在bundle输出前对代码进行压缩
        compiler.hooks.emit.tap('MyPlugin', (compilation) => {
            // 插件逻辑，如修改输出文件内容
            compilation.assets['my-file.txt'] = {
                source: () => 'Hello, World!',
                size: () => 13
            };
        });
    }
}
```
## loader和plugin的区别
+ loader 用于转换特定类型的文件（如 CSS、图片等）为 js，使 webpack 能够理解和打包。
+ plugin 用于扩展 webpack 的功能，如优化输出、添加自定义逻辑等。

## webpack和vite的区别
1. Vite 开发环境：「不打包，按需编译」
+ 启动逻辑：
    + 直接启动一个基于原生 ESM 的开发服务器，不预先打包所有模块。浏览器通过 <script type="module"> 加载入口文件，遇到 import 语句时，会实时向服务器请求对应模块。
+ 模块处理：
    + 服务器收到模块请求后，才会即时编译该模块（如用 esbuild 转译 JS/TS、处理 CSS 等），然后返回给浏览器。
    + 这种 “按需编译” 模式避免了对整个项目的预打包，因此启动速度极快（毫秒级）。
+ 热更新：
    + 修改文件后，仅重新编译该模块及其直接依赖，通过 ESM 机制通知浏览器替换模块，无需重新打包整个应用，热更新几乎无延迟。
2. webpack 开发环境：「先打包，再运行」
+ 启动逻辑：
    + 启动时必须从入口文件开始，递归解析所有依赖关系，将所有模块打包成一个或多个 bundle（即使是未被立即使用的模块），打包完成后才启动开发服务器。
    + 项目越大（模块越多），预打包时间越长（可能达数十秒）。
+ 模块处理：
    + 所有模块在启动阶段就被编译、合并到 bundle 中，浏览器直接加载打包后的文件，后续交互无需再请求单个模块。
+ 热更新：
    + 修改文件后，需要重新计算依赖关系，打包受影响的 chunk，再通过 HMR 机制替换更新部分，大型项目可能出现明显卡顿。

## 如何给不同环境设置不同的配置
在webpack.config.js或者next.config.js中，根据环境变量（如process.env.NODE_ENV）设置不同的配置。 