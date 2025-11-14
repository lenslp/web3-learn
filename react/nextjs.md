## nextjs核心特性
+ RSC：默认使用服务器组件，服务端代码不需要发送给客户端，减少客户端JavaScript体积，提升性能。
+ Server Actions：直接在组件中定义服务器端逻辑，直接与数据库交互，无需创建API路由
  - 在组件中使用 `'use server'` 指令，将函数标记为服务器端函数。
  - 服务器端函数可以直接与数据库交互，例如查询、插入、更新、删除等操作。
  - 必须由客户端组件调用。
  - 可以结合 useFormState 或 useFormStatus 等表单状态钩子，实现表单提交和状态管理。
+ Streaming：流式渲染，逐步渲染UI，提高用户体验和感知性能
  - 通过 `React.Suspense` 组件实现，将组件的渲染过程分解为多个小任务，每个任务完成后立即渲染到页面上，避免长时间的白屏等待。
+ App Router：基于文件系统的路由方案，无需配置路由，直接根据文件结构来定义路由。
+ 内置优化：自动图像、字体和脚本优化，无需额外配置
+ 内置元数据API和结构化数据支持，提升搜索引擎可见性
+ Middleware：在请求处理流程中添加自定义逻辑，例如鉴权、日志记录、请求重定向等。
  - 请求到达页面或 API 路由之前 执行的代码，用于处理请求的预处理逻辑
+ 国际化路由：支持多语言路由，根据用户的语言偏好来渲染不同的页面。

## nextjs的路由解决方案
1. pages router
2. app router, 从 v13.4 起，App Router 已成为默认的路由方案。

## App Router
1. 基于React server components设计，分为服务端组件和客户端组件。
2. 默认情况下，组件在服务端渲染（生成 RSC payload 数据），不包含客户端交互逻辑，也不能使用浏览器 API。
3. 通过 `'use client'` 指令，标记客户端组件。
4. 服务端负责渲染初始内容（解决首屏速度和 SEO），客户端负责激活交互（保持 SPA 体验），符合同构的核心目标。

## template和layout的区别
+ layout：布局，多个页面间共享UI结构，共享状态（比如导航栏、页脚）
+ template：路由切换时重置状态，互不影响（比如表单、弹框），模板的 DOM 结构在子路由切换时会被重新创建。
    - 应用场景：
        - 将一些公共UI抽离出来，比如进入页面时的加载动画、鉴权等，这些UI在多个页面中都需要展示，但是它们的状态是互不影响的。

## 中间件
+ 在项目的根目录定义一个名为 middleware.js的文件
```typescript
// middleware.js
import { NextResponse } from 'next/server'
 
// 中间件可以是 async 函数，如果使用了 await
export function middleware(request) {
  return NextResponse.redirect(new URL('/home', request.url))
}

// 设置匹配路径：/about/a、/about/b、/about/a/c 等
export const config = {
  matcher: '/about/:path*',
}

// 匹配路径：/api/*
// 要求：
// 1. 请求头中必须包含 Authorization: Bearer Token
// 2. 查询参数中必须包含 userId=123
// 3. cookie 里的 session 值不是 active
export const config = {
  matcher: [
    {
      source: '/api/*',
      has: [
        { type: 'header', key: 'Authorization', value: 'Bearer Token' },
        { type: 'query', key: 'userId', value: '123' },
      ],
      missing: [{ type: 'cookie', key: 'session', value: 'active' }],
    },
  ],
}
```

## ssr、ssg、isr、csr、rsc 有什么区别？
+ ssr：服务器端渲染，每次请求都在服务器端渲染页面，返回给客户端。
    + 适用于需要实时性高的场景，例如股票价格、官网、门户网站。
    + 优点：
        - 优化首屏加载速度（对应FCP和LCP指标）
        - 优化搜索引擎优化（SEO），因为搜索引擎爬虫可以直接解析html内容。
    + 缺点：
        - 每次请求都需要在服务器端渲染页面，高并发下服务器压力较大
        - 服务器需要先请求数据，然后渲染完整的html返回给客户端，增加了延迟。
        - 客户端只有加载完整的js之后才会进行水合。
+ ssg：静态站点生成，在构建时渲染页面，生成静态 HTML 文件，每次请求直接返回静态文件。
    + 适用于内容不经常变化的场景，例如博客、产品介绍页。
+ isr：增量静态渲染，在构建时渲染页面，生成静态 HTML 文件，但是在每次请求时会检查是否有新的数据，如果有则重新渲染页面，返回给客户端。
    + 适用于内容偶尔变化的场景，例如新闻网站、商品列表。
    + 使用 getStaticProps 来实现，并且需要设置 revalidate 选项来指定检查数据更新的时间间隔。
+ csr：客户端渲染，在浏览器端渲染页面，需要从服务器端获取数据。
    + 首次返回的是一个基本的 HTML 骨架，主要内容由浏览器下载 JS 后在客户端进行渲染。
+ rsc：React 服务端组件(react v18+)，在服务器端渲染 React 组件，返回给客户端。
    + 服务器端渲染组件后，不是生成html文件，而是生成序列化的json数据（包含组件结构、文本内容，引用关系等）
    + 客户端接收到序列化数据后，进行组装和渲染，这个时候不需要下载服务器端组件的js文件，只需要下载客户端的js文件以及react框架相关的js即可。
    + 状态保持：相比于ssr，rsc可以保持组件的状态，避免了每次请求都需要重新渲染页面的问题。

## 如何在 App Router 中实现 SSR、SSG、ISR？
App Router 中不再有专门的 getStaticProps 等 API，而是通过 fetch 选项、路由配置 或 重新验证 API 控制渲染和缓存行为，对应传统模式如下：
+ SSG：服务端组件中，对 fetch设置: { cache: 'force-cache' }（默认缓存），或者在路由配置中设置 export const dynamic = 'force-static'（整个路由启用缓存）
+ SSR：
  - 服务端组件中，对 fetch 设置 cache: 'no-store'（禁用缓存），或者在路由配置中设置 export const dynamic = 'force-dynamic'（整个路由禁用缓存）（定时重新验证）
  - 服务端组件中，对 fetch 设置 next: { revalidate: 0 }，或者在路由配置中设置 export const revalidate = 0
+ ISR：服务端组件中，对 fetch 设置 next: { revalidate: 秒数 }（定时重新验证），或者在路由中设置 export const revalidate = 秒数
+ 客户端组件默认也是预渲染的，只是在服务端渲染完成后，会在客户端进行水合，变成交互式组件。（ssr）
  - 如何禁用：
    - 通过dynamic加载时，设置ssr: false
    - 若客户端组件的渲染依赖仅在客户端存在的数据（如 localStorage 中的用户配置），且无法在服务端模拟，服务端预渲染会失败。

## ssr实现原理
1. 接收客户端请求
2. 数据预获取
3. 组件渲染为html字符串：通过renderToString方法将组件渲染为html字符串。
4. 拼接html并返回：服务器将渲染出的 HTML 字符串嵌入到一个完整的 HTML 模板中，并将预请求的数据注入到html中（<script>window.__INITIAL_STATE__ = { user: { name: '张三' } }</script>）
5. 客户端激活：客户端接收html之后立即渲染，同时记载js，复用服务端预请求的数据进行水合，是静态html可交互。

## rsc模式为什么能保持组件的状态
1. 核心原理：客户端与服务端组件分离
    + 服务端组件：专注于数据获取和静态内容渲染，无状态，无浏览器api访问能力
    + 客户端组件，负责交互逻辑和状态管理，通过use client指令标记为客户端组件。
    + 这种分离使得状态管理完全由客户端组件负责，不会因为服务器渲染而丢失
2. 和ssr的根本区别
    + 渲染产物：ssr返回的是html文件，而rsc返回的是序列化的json数据。
        - 服务端预先获取的数据
        - 客户端组件的占位位置和引用文件
        - 缓存信息
        - 可以逐行发送给客户端，流式渲染
    + 状态处理：ssr每次请求都需要重新渲染页面，状态会丢失；而rsc客户端组件独立管理状态，不受服务端渲染影响。
    + 组件类型：ssr本质上都是客户端组件，服务端只是提前渲染他们的html，最终都需要在客户端加载对应的js并进行水合，而rsc区分客户端组件和服务端组件
    + 水合过程：ssr需水合客户端和服务端组件，而rsc只需要水合客户端组件，无需水合服务端组件。

## 数据请求、缓存、重新验证
1. Next.js 对原生 fetch 进行了扩展，内置缓存和重新验证功能，无需额外配置
    + 永久缓存：cache: 'force-cache'。默认就是 'force-cache', 平时写的时候可以省略
    + 无缓存：cache: 'no-store'
    + ISR模式：next: { revalidate: 60 }，指定缓存时间为60秒，先缓存数据，到期后或手动触发时重新验证。
    + 在服务端组件和只有 GET 方法的路由处理程序中使用 fetch，返回结果会自动缓存。
        - GET 方法：默认启用缓存（cache: 'force-cache'），即数据会被自动缓存，后续请求优先使用缓存，直到缓存失效或被重新验证。
        - 非 GET 方法（POST/PUT/DELETE 等）：默认不缓存（cache: 'no-store'），每次请求都会重新发起网络请求，因为非 GET 方法通常涉及数据修改，缓存可能导致数据不一致。
        - 客户端组件中使用 fetch 时，需要手动配置缓存策略，例如 cache: 'force-cache' 或 cache: 'no-store'。

2. 如果使用第三方库，比如axios，需手动配置缓存
```
import axios from 'axios';
import { cache } from 'next/cache';

// 手动标记为可缓存
const getUsers = cache(async () => {
  const res = await axios.get('https://api.example.com/users');
  return res.data;
});

export default async function UsersPage() {
  const users = await getUsers();
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```
3. 重新验证：更新缓存数据
+ 时间驱动：通过 fetch 的 revalidate 选项设置过期时间，到期后自动重新获取数据（即 ISR）
+ 路径驱动：通过 revalidatePath 手动触发指定路径的缓存更新（适合表单提交、后台编辑等场景）
+ 标签驱动：为 fetch 请求添加标签（tags），通过 revalidateTag 只更新关联数据，不影响其他缓存
```
// 1. 给请求添加标签
async function getProductsByCategory(category) {
  return fetch(`https://api.example.com/products?category=${category}`, {
    next: { tags: [`products:${category}`] },
  }).then(res => res.json());
}

// 2. 服务器操作中触发重新验证
'use server';
import { revalidateTag } from 'next/cache';

export async function updateCategoryProducts(category) {
  // 更新数据...
  revalidateTag(`products:${category}`); // 只清除该标签的缓存
}
```
4. 路由级缓存配置：在 app/layout.js 或 app/page.js 中通过 dynamic 或 revalidate 配置全局策略
```
// app/products/layout.js
export const dynamic = 'force-dynamic'; // 该路由下所有页面均不缓存
// 或
export const revalidate = 60; // 该路由下所有数据默认60秒重新验证
```

## 如何在 client component 里面 fetch 时使用 server component fetch 的数据缓存
1. 服务端预取数据，通过 Props 传递给客户端组件
2. 使用 fetch 的 next: { tags } 共享缓存键，触发协同重新验证
    + 客户端组件中使用 fetch 时，添加相同的 tags 参数，即可共享缓存。
    + 服务器端组件中触发 revalidateTag 时，会自动清除所有包含该标签的缓存（包括客户端组件的缓存）。
3. 服务端预取数据后，将数据存入全局状态管理（如zustand或redux），客户端组件从全局状态获取数据。

## server actions
Next.js 13+（基于 App Router）推出的一项核心功能，简化客户端与服务器的交互链路，让服务器端逻辑（如数据库操作）可以被客户端直接调用，无需手动编写 API 路由，同时保证安全性。
1. 优点：
    - 减少了客户端与服务器之间的通信链路，无需手动编写 API 路由即可实现客户端与服务器的交互。
    - 避免跨域问题，因为所有请求都在服务器端处理。
    - 在服务器端执行敏感操作，避免客户端安全风险
2. 实现方式：
    - 通过'use server' 标记服务器端函数，可以直接在服务器函数中与数据库交互（增删改查）
    - 可以直接在客户端组件中调用该函数，无需手动编写API调用代码。
    - 调用该函数时，会自动将参数发送到服务器端执行，返回结果后更新客户端状态。
3. 示例：
```
// app/actions.js
'use server';
import db from '@/lib/db'; // 数据库客户端（包含敏感连接信息）

export async function getPrivateData(userId) {
  // 直接在服务器端查询数据库，无需通过客户端请求中转
  const data = await db.user.findUnique({
    where: { id: userId },
    select: { privateField: true }, // 可安全返回敏感字段
  });
  return data;
}
```
```
// 客户端组件
'use client';

import { getPrivateData } from '@/app/actions';

async function fetchPrivateData() {
  const data = await getPrivateData('123'); // 假设用户ID为123
  console.log(data); // 输出: { privateField: 'sensitive data' }
}
```
4. 应用
    + 处理表单提交：结合react-dom提供的useFormStatus hook，实现表单提交时的loading状态和禁用提交按钮。结合useFormState hook，实现表单提交后的状态更新。

## 流式渲染（Streaming）
Next.js 13+ 引入的一项核心功能，将页面渲染结果分块发送给客户端，允许用户先看到部分内容，再逐步加载剩余部分，提升首屏加载体验。
针对ssr模式下需要渲染完整的html之后才发送给客户端，增加了延迟。
1. 优点：
    - 提升用户体验：用户可以更早地看到页面内容，避免长时间的白屏等待。
2. 实现方式：
    - Next.js App Router 默认支持流式渲染
    - Suspense 包裹含异步操作的服务器组件时，会优先发送外部内容的 HTML，待内部组件异步操作完成后，再流式发送其 HTML，提升首屏加载体验
3. 示例：
```
// app/home/page.js（服务器组件）
import { Suspense } from 'react';
import Header from './Header'; // 无异步操作，优先渲染
import ProductList from './ProductList'; // 含异步数据请求
import Loading from './Loading'; // fallback 骨架屏

export default function HomePage() {
  return (
    <div>
      <Header /> {/* 优先渲染，随初始 HTML 发送 */}
      <Suspense fallback={<Loading />}>
        <ProductList /> {/* 等待数据，完成后流式发送 */}
      </Suspense>
    </div>
  );
}
```

## 什么是同构
一套代码同时在服务器（Node.js） 和客户端（浏览器） 运行，兼顾服务端渲染（SSR）的首屏速度 / SEO 优势和客户端渲染（CSR）的交互体验。

## 国际化
1. nextjs内置了i18n，支持语言国际化
```typescript
// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'zh', 'ja'],  // 支持的语言
    defaultLocale: 'en',           // 默认语言
    localeDetection: true,         // 自动检测浏览器语言
  },
};
```
2. 配置后，Next.js 会自动生成国际化路由：
  - /about → 英文 About 页面
  - /zh/about → 中文 About 页面
3. 可以通过useRouter获取当前语言信息
4. 可以通过router.push切换语言
```typescript
import { useRouter } from 'next/router';

export default function LanguageSwitcher() {
  const router = useRouter();

  const changeLanguage = (locale) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>EN</button>
      <button onClick={() => changeLanguage('zh')}>中文</button>
    </div>
  );
}
```
5. 生产环境往往使用：next-i18next + SmartLing

## 环境变量
+ 只有以 NEXT_PUBLIC_ 开头的环境变量可以在客户端，其他变量仅在服务端中可见。

## 懒加载
1. React.lazy + Suspense
2. next/dynamic
  + dynamic() 跟 lazy() 函数一样，需要放在模块顶层
  + 只应用于客户端，如果动态导入的是一个服务端组件，只有这个服务端组件中的客户端组件才会被懒加载。
  + 跳过ssr：客户端组件默认也是预渲染的，如果想禁用，则可以设置ssr:false
```typescript
'use client'
import dynamic from 'next/dynamic'

const ComponentA = dynamic(() => import('../components/a.js'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
  suspense: true,
})
const ComponentB = dynamic(() => import('../components/b.js'), { ssr: false })
 
export default function Page() {
  return (
    <div>
      <ComponentA />
      <ComponentB />
    </div>
  )
}
```
3. 通过import按需加载外部库
```typescript
    <input
      type="text"
      placeholder="Search"
      onChange={async (e) => {
        const { value } = e.currentTarget
        const Fuse = (await import('fuse.js')).default
        const fuse = new Fuse(names)
        setResults(fuse.search(value))
      }}
    />
```
4. 应用场景：
  + 用户点击切换后才展示的组件启用懒加载
  + K线、深度、成交量独立异步模块，用户进入交易页后再按需加载。减少首屏bundle大小

## Edge Runtime
+ Edge Runtime = 无服务器、低延迟、全球分布式的执行环境。
+ Next.js 默认的执行环境是 Node.js Runtime，如果需要开启 Edge Runtime，需要在 next.config.js 中配置：
```typescript
export const runtime = 'edge'
```
+ Next.js 会将该页面或 API 路由部署到 Edge Runtime，即运行在 V8 引擎的轻量执行环境中（类似 Cloudflare Workers、Vercel Edge Functions）
+ 局限性：
  ❌ 不能使用 Node 原生模块（如 fs, path, crypto 的部分函数）
  ❌ 不支持持久化连接（如 WebSocket、长轮询）
  ❌ 不适合 CPU 密集计算（如加密、压缩）
  ✅ 支持 Web 标准 API（fetch, Request, Response, URL, Headers）
+ 应用场景：国际化路由、Auth 校验、请求预处理、中间件（默认）、A/B 分流、轻量 API
+ 不适用场景：SSR 页面渲染、大型数据请求、文件上传、数据库交互

## nextjs缓存机制
1. 请求记忆：
  + 同一请求在同一个渲染过程中多次被调用时，Next.js 不会真的发多次请求，而是从内存中直接返回第一次结果
  ```typescript
  // 在同一组件树中多次调用
  const user = await fetch('/api/user').then(res => res.json());
  const again = await fetch('/api/user').then(res => res.json());
  // 实际只发了一次请求！
  ```
2. 数据缓存
  + Next.js 内置的 “fetch 请求级缓存”。用于跨请求缓存接口数据
  + 可以通过 cache 选项配置缓存策略
  ```typescript
  fetch(url, { cache: 'force-cache' });        // 永久缓存（默认）
  fetch(url, { cache: 'no-store' });           // 不缓存（实时请求）
  fetch(url, { next: { revalidate: 60 } });    // 每60秒重新验证（ISR式）
  ```
  + 通过 revalidatePath、revalidateTag 触发缓存失效
    - revalidatePath：根据路径失效缓存
    - revalidateTag：根据标签失效缓存
3. 完整路由缓存（服务端）
  + 缓存整个页面的 最终输出（HTML + RSC Payload）
  + 用于服务端
  ```typescript
  export const revalidate = 60;  // 每60秒重新生成整个页面
  export const dynamic = 'force-dynamic'; // 禁止缓存
  ```
  + 可以通过 revalidatePath 触发缓存失效
4. 路由缓存（客户端）
  + 客户端层的页面状态缓存
  + 用户在浏览器内切换页面（客户端路由跳转）时，上一个页面的 React 组件状态 + 数据 + DOM 会被保留在内存中，回退时无需重新请求数据。
  ```typescript
  // 在 app/layout.tsx 里配置
  export const dynamic = 'force-dynamic'; // 关闭
  ```
  + 可以通过 router.refresh() 手动刷新当前页面，触发缓存失效。
  ```typescript
  'use client';
  import { useRouter } from 'next/navigation';

  export default function RefreshButton() {
    const router = useRouter();
    return <button onClick={() => router.refresh()}>刷新</button>;
  }
  ```

## Next.js 服务端和客户端渲染不一致导致的水合报错该怎么解决
```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```
之所以出现这个报错，是因为服务端预渲染的 React 树和浏览器首次渲染的 React 树不一致。
常见原因：
1. 渲染的时候，使用了诸如 typeof window !== 'undefined' 这样的判断，导致服务端和客户端渲染结果不一致。 
2. 渲染的时候，使用了仅限浏览器的 API，比如 window 、document、 localStorage、Date
3. 有些库（如 chart.js, echarts）在 SSR 时无法正常生成一致的结构。
4. 服务端渲染通过 fetch 生成初始 HTML，客户端 Hydration 时如果重新 fetch 出了不同结果，就会报错。
解决方案：
1. 条件渲染时避免结构变化，通过 useEffect 在客户端阶段再切换内容
2. 如果某组件依赖浏览器环境（window/document），可以禁用ssr
```typescript
import dynamic from 'next/dynamic'
const NoSSR = dynamic(() => import('../components/no-ssr'), { ssr: false })
```
3. 确保客户端和服务端使用同一数据源、用 Next.js 的 fetch 缓存（Data Cache）、或启用 React Query/SWR，在客户端 “rehydrate” 时保持同数据。

## nextjs性能优化
1. 默认开启了splitChunks，每个页面只会打包该页面依赖的 JS，公共依赖会拆分成 commons 或 vendors chunk，多个页面共享，node_modules 的库也会拆成单独 chunk，提高缓存命中率。