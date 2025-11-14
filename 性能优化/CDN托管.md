## CDN托管
核心是通过配置让 Next.js 生成的资源路径自动指向 CDN 域名，并将构建产物部署到 CDN 服务
1. 配置cdn基础路径：通过在 next.config.js 中添加 assetPrefix 配置项，指定 CDN 域名前缀
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 静态资源（JS、CSS、静态文件等）的 CDN 前缀
  // 所有静态资源引用会自动拼接该前缀（如 /_next/static/js/main.js → https://cdn.example.com/next-app/_next/static/js/main.js）
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.example.com/next-app'  // 生产环境 CDN 路径
    : '',  // 开发环境无需 CDN

  // 2. 配置图片 CDN（如果图片单独使用不同 CDN 域名 或 相对路径）
  images: {
    // 允许的图片域名（CDN 域名需添加到这里，否则 next/image 会报错）
    domains: ['cdn.example.com'],
    // 若图片路径包含 CDN 前缀，可通过 path 配置简化
    path: 'https://cdn.example.com/next-app/_next/image',
  },
};

module.exports = nextConfig;
```

