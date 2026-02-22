# SEO优化

## 工具篇
1. Google Search Console：用来监控网站的搜索引擎流量，追踪其搜索表现，并找出不利于搜索排名的问题。
2. Bing Webmaster Tools（必应）：是微软提供的免费服务，你可以利用这款工具将商店的网站添加到必应的网页抓取程序中。在必应网站管理员工具的注册页面免费开设账号，然后添加并验证网站。这样，你的网站就可以出现在必应的搜索结果里。
3. Google Analytics：可以提供用户与网站互动的数据。
4. 一些免费和付费的seo优化工具：
    + Moz：提供完整的SEO营销套件。
    + Ahrefs：一个全面的SEO工具，具备审核、研究和追踪等功能。
    + Semrush：追踪关键词和探索竞争对手网站等。
    + Keywords Everywhere：做简单的关键词研究。
5. 在搜索引擎里搜索网站，查看是否被收录。

## 方案篇
### 站内优化：
1. ssr渲染
2. 关键词研究：列出一些目标受众最有可能搜索的关键词，分析竞品的关键词
3. Meta标签配置：设置title、description、keywords
```typescript
<Head>
    <title>页面标题</title>
    <meta name="description" content="页面描述" />
    <meta name="keywords" content="关键字1, 关键字2, 关键字3" />
</Head>
```
4. Open Graph 和 Twitter Card：通过 <meta> 标签配置 Open Graph 和 Twitter Card 信息，确保页面在社交媒体平台分享时有好的展示效果
```typescript
<Head>
  <meta property="og:title" content="页面标题" />
  <meta property="og:description" content="页面描述" />
  <meta property="og:image" content="图片URL" />
  <meta name="twitter:card" content="summary_large_image" />
</Head>
```
5. 优化页面性能，保证网站的加载速度快，提升核心指标：FCP、LCP、INP、TTFB。
6. url设计要简单且容易理解。
7. 使用内部链接帮助搜索引擎理解不同页面间的关系。
8. next-seo插件，可以简化 SEO 配置，提供更易于管理的 SEO 功能
```typescript
import { NextSeo } from 'next-seo';

const Page = () => (
  <>
    <NextSeo
      title="页面标题"
      description="页面描述"
      openGraph={{
        url: 'https://www.example.com/page',
        title: '页面标题',
        description: '页面描述',
        images: [
          {
            url: 'https://www.example.com/images/og-image.jpg',
            width: 800,
            height: 600,
            alt: '图片描述',
          },
        ],
        site_name: 'Example',
      }}
    />
    <h1>页面内容</h1>
  </>
);

export default Page;

```
9. 如果谷歌发现页面加载缓慢，或者网站不适合移动设备，就不太可能在搜索引擎排名中推荐你的网站。

### 站外优化：
1. 反向链接建设：
    + 通过发布有价值的、高质量的内容，吸引其他网站主动链接到你的站点。
    + 找到行业相关的资源页面，并尝试向这些页面推荐你的站点
    + 与行业内的其他网站或博客建立合作关系，互相交换链接或共同开展营销活动。
2. 社交媒体等平台营销