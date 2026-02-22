# CSS 知识体系构建与工程化指南

## 1. CSS 新体系如何学习？

学习 CSS 不再只是记忆属性，而是理解其渲染机制与工程化演进。

*   **权威文档**: [MDN Web Docs (Mozilla Developer Network)](https://developer.mozilla.org/zh-CN/docs/Web/CSS) - **永远的第一手资料**。
*   **学习路径**:
    1.  **基础**: 盒模型、选择器权重、层叠上下文 (Stacking Context)。
    2.  **布局**: Flexbox (一维布局) 和 Grid (二维布局) 是核心，放弃 float 布局（除文字环绕场景）。
    3.  **响应式**: Media Queries, 移动端适配 (`rem`, `vw/vh`).
    4.  **工程化**: 预处理器、PostCSS、CSS Modules、CSS-in-JS、Atomic CSS。
*   **前沿关注**:
    *   [web.dev](https://web.dev/learn/css/) (Google 出品)
    *   CSS Tricks
    *   State of CSS (年度调查，看技术趋势)

---

## 2. CSS 在服务端渲染 (SSR) 的坑与解决方案

在 Next.js, Nuxt.js 或 SSR 架构中，CSS 处理不当会导致严重的用户体验问题。

### 常见坑 (Pitfalls)
1.  **FOUC (Flash of Unstyled Content)**: 样式闪烁。页面 HTML 先加载出来，但 CSS 还没加载或执行，导致用户看到裸奔的 HTML，瞬间后样式才生效。
2.  **Hydration Mismatch**: 服务端生成的样式类名与客户端 JS 执行后生成的类名不一致（常见于 CSS-in-JS），导致控制台报错甚至样式错乱。

### 解决方案
1.  **提取关键 CSS (Critical CSS)**:
    *   构建时分析首屏用到的 CSS，直接**内联 (Inline)** 到 HTML 的 `<head>` 中。
    *   其余 CSS 异步加载。
2.  **CSS-in-JS 的服务端收集 (ServerStyleSheet)**:
    *   对于 `styled-components` 或 `emotion`，需要在服务端渲染时创建一个 `ServerStyleSheet` 上下文，收集组件渲染过程中生成的所有样式字符串，并手动注入到 HTML 响应中。
    *   *Next.js (App Router) 推荐使用 Zero-runtime 方案或官方支持的库。*
3.  **使用零运行时 (Zero-runtime) 或 原子化 CSS**:
    *   **Tailwind CSS**: 也就是构建时生成静态 CSS 文件，SSR 直接引入 CSS 文件链接，完全避免 JS 执行时的样式注入延迟问题，是目前 SSR 的**最佳实践**之一。

---

## 3. CSS 现代工程开发模式

CSS 的开发早已告别了手写原生 CSS 的时代，经历了以下几个阶段的演进：

### 3-1. 预处理器 (Preprocessor)
*   **代表**: **Sass (SCSS)**, **Less**, Stylus。
*   **核心能力**: 变量 (`$var`), 嵌套 (`&`), Mixins, 函数。
*   **现状**: 依然广泛使用，但随着原生 CSS 能力增强（原生嵌套、CSS Variables），其不可替代性在降低。很多项目只用它来做简单的嵌套。

### 3-2. CSS Next + PostCSS (后处理器)
*   **理念**: 使用未来的 CSS 语法（如嵌套、变量、色彩函数），通过工具转译成浏览器能兼容的 CSS。类似 JS 里的 Babel。
*   **核心工具**: **PostCSS**
    *   `autoprefixer`: 自动加浏览器前缀 (`-webkit-`, `-moz-`)。
    *   `postcss-preset-env`: 允许使用最新的 CSS 语法。
*   **现状**: 现代前端工程的标配底层工具。

### 3-3. CSS Modules (局部作用域)
*   **解决痛点**: 全局类名冲突（Global Namespace Pollution）。
*   **原理**: 构建时将类名编译成唯一的 Hash 值。
*   **使用方式**:
    ```javascript
    // style.module.css
    .test { color: red; }

    // Component.js
    import styles from './style.module.css';
    // 编译后: <div class="style_test__Hash123">...</div>
    <div className={styles.test}>Hello</div>
    ```
*   **现状**: React 项目中的主流选择之一，安全可靠。

### 3-4. CSS-in-JS (Runtime)
*   **理念**: "All in JS"，将 CSS 作为 JS 组件的一部分。
*   **代表库**:
    *   **styled-components**: 经典的模板字符串写法。
    *   **Emotion**: 灵活性更高，支持 Object 和 String 写法。
    *   **MUI (Material UI)**: 顶流组件库，深度集成 Emotion。
*   **写法**:
    ```javascript
    const Button = styled.a`
      color: red;
      font-size: 16px;
      ${props => props.primary && 'background: blue;'}
    `;
    <Button href="#">Click</Button>
    ```
*   **争议**: 运行时有性能开销（Runtime Overhead），增加了 JS 包体积。React 18+ 和 RSC (Server Components) 时代面临挑战。

### 3-5. JS-in-CSS (Houdini) - [已趋于小众/特定领域]
*   **理念**: 也就是 CSS Houdini。允许开发者直接介入浏览器的渲染引擎（Layout, Paint, Animation Worklet）。
*   **示例**:
    ```css
    /* 注册 Paint Worklet 后 */
    .el {
        --bg-painter: (ctx, geom) => { /* JS 绘制逻辑 */ };
        background: paint(my-painter);
    }
    ```
*   **现状**: 学习曲线极其陡峭，兼容性推进缓慢，除了一些炫酷特效外，未能在业务开发中大规模普及（"夭折"说法虽夸张，但在主流业务开发中确实存在感低）。

### 3-6. Atomic CSS (Utility-first) + JIT
*   **理念**: **原子化 CSS**。不再写语义化的 class (`.btn-primary`)，而是组合单一功能的类名。
*   **代表**: **Tailwind CSS** (霸主地位), UnoCSS, WindiCSS.
*   **核心技术**: **JIT (Just-In-Time) 引擎**。
    *   不再预生成几万行的 CSS 文件。
    *   **按需生成**: 扫描你的代码，看到 `mt-[5px]`，才生成对应的 CSS 规则。
*   **写法**:
    ```html
    <!-- 任意值支持 -->
    <div className="mt-[5px] text-[#123456] hover:bg-red-500">
      Atomic!
    </div>
    ```
*   **优势**:
    *   开发速度极快（不用想类名，不用切文件）。
    *   产物 CSS 体积极小（只包含用到的样式）。
    *   设计系统约束强。
*   **现状**: **目前最火热的前端开发模式**。

---

## 4. CSS 面试八股文 (高频考点)

1.  **盒模型 (Box Model)**
    *   **标准盒模型**: `box-sizing: content-box` (默认)。Width = content。
    *   **IE/怪异盒模型**: `box-sizing: border-box` (推荐)。Width = content + padding + border。**面试必答：通常我们在 Reset CSS 中会将所有元素设置为 border-box 以便于布局计算。**

2.  **BFC (Block Formatting Context)**
    *   **是什么**: 块级格式化上下文，一个独立的渲染区域，内部元素渲染不影响外部。
    *   **如何触发**: `overflow: hidden/auto`, `display: flex/grid/inline-block`, `position: absolute/fixed`, `float`。
    *   **解决了什么问题**:
        1.  清除浮动（父元素高度塌陷）。
        2.  防止外边距重叠 (Margin Collapse)。
        3.  防止元素被浮动元素覆盖（两栏自适应布局）。

3.  **居中方案**
    *   **Flex**: `justify-content: center; align-items: center;` (最常用)。
    *   **Grid**: `place-items: center;` (最简洁)。
    *   **Absolute + Transform**: `top: 50%; left: 50%; transform: translate(-50%, -50%);` (未知宽高)。
    *   **Absolute + Margin auto**: `top: 0; left: 0; right: 0; bottom: 0; margin: auto;` (已知宽高)。

4.  **Flexbox 常用属性**
    *   容器: `flex-direction`, `flex-wrap`, `justify-content`, `align-items`.
    *   项目: `flex-grow` (放大), `flex-shrink` (缩小), `flex-basis` (基准大小).
    *   **简写**: `flex: 1` => `flex: 1 1 0%`.

5.  **重排 (Reflow) 与 重绘 (Repaint)**
    *   **重排**: 布局引擎重新计算元素位置和大小（开销大）。触发：修改宽/高/margin/padding/font-size，读取 offsetWidth 等属性。
    *   **重绘**: 像素引擎重新绘制元素外观（开销小）。触发：修改 color/background/visibility。
    *   **优化**: 使用 `transform` 和 `opacity` 做动画（合成层，不触发重排重绘）；批量修改 DOM；使用 `requestAnimationFrame`。

6.  **选择器权重 (Specificity)**
    *   `!important` > 行内样式 > ID选择器 > 类/伪类/属性选择器 > 标签/伪元素选择器 > 通配符。
    *   口诀：(行内, ID, 类, 标签) => (1, 0, 0, 0)。

7.  **隐藏元素区别**
    *   `display: none`: 彻底消失，触发重排，不占据空间。
    *   `visibility: hidden`: 视觉不可见，触发重绘，**占据空间**，事件不触发。
    *   `opacity: 0`: 透明度为0，占据空间，**事件可触发**。

---

## 5. 其他相关技术

### Lottie.js
Lottie.js 是一个用来在网页上播放 Lottie 动画的 JavaScript 库。
*   **流程**: 设计师 (After Effects) -> Bodymovin 插件 -> 导出 JSON -> 前端 Lottie 渲染。
*   **优势**: 矢量渲染（不失真），体积小，跨平台（Web/iOS/Android）。
