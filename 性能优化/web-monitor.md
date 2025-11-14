## 表结构设计
1. 项目表：存储项目相关信息，包括项目名称、项目ID等。
    + 字段：
        - id：项目ID，主键，自增
        - name：项目名称
        - created_at：创建时间
2. 性能指标表：存储性能指标数据，包括长任务、资源加载时间、导航时间、绘制时间等。
    + 字段：
        - id：指标ID，主键，自增
        - project_id：项目ID，外键，引用项目表的id字段
        - metric_name：指标名称（如：长任务、资源加载时间等）
        - metric_value：指标值（如：任务执行时间、资源加载时间等）
        - timestamp：指标采集时间
3. 错误日志表：存储错误日志数据，包括js错误、promise错误、资源加载错误等。
    + 字段：
        - id：错误日志ID，主键，自增
        - project_id：项目ID，外键，引用项目表的id字段
        - error_type：错误类型（如：js错误、promise错误、资源加载错误等）
        - error_message：错误信息（如：错误描述、错误栈等）
        - timestamp：错误发生时间

## sdk架构设计
### 指标类型
1. 性能指标
2. 错误日志指标
### 采集指标
1. Web Vitals指标 ：CLS(累计布局偏移)、FID(首次输入延迟)、FCP(首次内容绘制)、LCP(最大内容绘制)、TTFB(首字节时间)
2. 页面加载性能 ：DNS解析、TCP连接、响应时间等指标
3. 资源加载监控 ：图片、脚本、样式等资源的加载时间和大小
4. 长任务检测 ：执行时间超过50ms的JavaScript任务
5. 错误监控 ：JavaScript错误、Promise拒绝、资源加载错误
6. 自定义指标 ：支持手动记录自定义性能数据
    + 如何记录：
        - 使用performance.mark方法记录自定义指标
        - 使用performance.measure方法计算指标之间的时间差
7. 接口请求时长：performance.getEntriesByType('resource')
    ```typescript
    // 获取所有资源请求的性能数据
    const resources = performance.getEntriesByType('resource');

    // 筛选出接口请求（XHR 或 fetch）
    const apiRequests = resources.filter(resource => {
    // 接口请求的 initiatorType 通常是 'xmlhttprequest' 或 'fetch'
    return resource.initiatorType === 'xmlhttprequest' || resource.initiatorType === 'fetch';
    });
    ```
8. 设备信息 ：包括浏览器类型、浏览器版本、操作系统类型、操作系统版本、设备类型等。（从navigator.userAgent中解析）
### 上报指标
1. 即时上报，设置reportImmediately为true，指标数据会立即上报到服务器。
2. 批量上报，设置reportImmediately为false，指标数据会存入队列中，在大于10条数据时批量上报到服务器。
3. 自定义上报，支持手动调用上报方法，将指标数据上报到服务器。
4. 页面卸载时上报，在页面卸载前，如果队列中还有数据，将队列中的指标数据上报到服务器。
    - 通过navigator.sendBeacon方法上报数据（可靠且不阻塞页面卸载）
    - fetch在页面卸载时可能会中断
5. 页面不可见时上报，在页面不可见时（如切换到其他标签页），如果队列中还有数据，将队列中的指标数据上报到服务器。
    - 通过visibilitychange事件监听页面可见性变化
    - 当页面不可见时，检查队列中是否有数据，如果有，调用上报方法将数据上报到服务器