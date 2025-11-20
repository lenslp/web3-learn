## ssr降级
1. 背景：用户访问量剧增时（用户峰值或ddos攻击），node集群被打爆，ssr渲染失败。针对访问量比较大的交易页面，需合理降级减轻服务器压力并利用缓存优化体验。
2. 解决方案：
    + lb层(负载均衡)设置健康检查接口，定期监控后端服务器的负载（如 CPU 使用率、内存、网络带宽等），根据负载情况自动扩容和缩容，实时增加或者减少服务器数量，当超过阈值时，自动或者手动切换流量入口，降级的将流量重定向到/csr/入口。
        - qps >  配置最大机器数 * 一个基数，基数是根据压测得来的
    + 前端维护两个入口，一个ssr，一个csr，组件内容复用，只是在数据获取方面有差异，
3. 保证交易页面在高并发场景下稳定运行
```typescript
// app/[type]/page.js
import React, { useEffect, useState } from 'react';

const Page = ({ initialData, type }) => {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (type === 'csr') {
      // 在客户端获取数据进行 CSR
      fetchData().then(response => {
        setData(response);
      });
    }
  }, [type]);

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </div>
  );
};

export async function getServerSideProps({ params }) {
  if (params.type === 'ssg') {
    const data = await fetchStaticData(); // 静态数据获取
    return {
      props: { initialData: data, type: params.type },
    };
  }

  return {
    props: { initialData: {}, type: params.type },
  };
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { type: 'csr' } },
      { params: { type: 'ssr' } }
    ], // 根据 type 生成路径
    fallback: true, // 预生成静态页面
  };
}

export default Page;

```