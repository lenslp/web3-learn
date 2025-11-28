## 三次握手和四次挥手
1. 三次握手：
    + 客户端向服务端发送建立连接请求，客户端进入 SYN-SEND 状态
    + 服务端收到建立连接请求后，向客户端发送一个应答，服务端进入 SYN-RECEIVED 状态
    + 客户端接收到应答后，向服务端发送确认接收到应答，客户端进入 ESTABLISHED 状态
2. 四次挥手：
    + 客户端向服务端发送断开连接请求
    + 服务端收到断开连接请求后，回复客户端收到断开连接请求
    + 服务端向客户端发送剩余数据，并发送 FINBIT 包，告知客户端数据发送完成
    + 客户端收到服务端的断开连接请求后，向服务端确认应答

## http1.0、http1.1、http2.0、http3.0 有什么区别？
+ http1.0：
    - 每个请求都需要建立一个新的连接，请求完成后连接就会关闭。
    - 队头阻塞：同一时间内，一个 TCP 连接只能处理一个请求，下一个请求必须等待上一个完成
    - 只支持 GET、POST 方法，头部字段有限，无缓存控制、断点续传等高级功能
+ http1.1：
    - 默认开启 Connection: keep-alive，TCP 连接在一次请求后不关闭，可复用连接处理多个请求
    - 多个请求需要按顺序执行，若一个请求阻塞了，其他请求也会被阻塞。
    - 支持 GET、POST、PUT、DELETE、HEAD、OPTIONS 等方法、支持缓存控制、断点续传等高级功能
+ http2.0：
    - 二进制帧：将请求/响应数据拆分为二进制帧，效率更高且易于机器解析。
    - 多路复用：一个 TCP 连接中可同时处理多个流（Stream），每个流对应一个请求 / 响应。流通过唯一标识区分，可并行发送 / 接收。
    - 主动推送：服务器可主动向客户端推送关联资源（如请求 HTML 时，主动推送其依赖的 CSS/JS），无需客户端显式请求，减少请求次数。
    - 队头阻塞未完全解决：基于TCP协议，若 TCP 包丢失，整个连接的所有流都需等待重传。
+ http3.0：
    - 使用 QUIC协议，基于 UDP，每个流互相独立，彻底解决了队头阻塞问题。
    - 连接速度更快：QUIC 协议基于 UDP，无需 TCP 三次握手，连接建立更快。
    - 内建 TLS 1.3，更高效的加密和安全性
    - 更低的延迟和更好的网络表现，尤其在 移动网络 或 高延迟 的环境下。

## 如何开启http2.0
+ 获取ssl证书：HTTP/2 依赖 HTTPS，需要先配置证书绑定域名。
+ 下载证书文件上传至服务器
+ 配置nginx
```
server {
    listen 80;
    server_name example.com www.example.com;  # 你的域名
    # 强制 HTTP 跳转 HTTPS（推荐）
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;  # 关键：开启 443 端口 + SSL + HTTP/2
    server_name example.com www.example.com;

    # SSL 证书配置（阿里云下载的证书路径）
    ssl_certificate /etc/nginx/ssl/example.com.pem;    # 公钥证书
    ssl_certificate_key /etc/nginx/ssl/example.com.key;  # 私钥

    # 优化 SSL 配置（提升安全性和兼容性）
    ssl_protocols TLSv1.2 TLSv1.3;  # 仅支持现代 TLS 版本
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;  # 启用 SSL 会话缓存
    ssl_session_timeout 10m;

    # 网站根目录（根据你的项目路径修改）
    root /var/www/html;
    index index.html index.htm;

    # 其他常规配置（如静态资源缓存）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```
+ 重启nginx
```
# 检查配置是否正确
nginx -t

# 如果配置正确，重启Nginx
# CentOS/RHEL 7：
nginx -s reload
```

## https加密过程
核心：非对称加密用于安全交换密钥，对称加密用于高效传输数据
1. 客户端发起 HTTPS 连接请求
2. 服务端返回公钥证书
3. 客户端验证证书有效性（包括域名、过期时间、证书链等）
4. 交换密钥：客户端生成随机对称密钥，用服务端公钥加密后发送给服务端，服务端用私钥解密对称密钥
6. 后续通信双方使用对称密钥加密/解密数据

## HTTP 请求跨域时为何要发送 options 请求
+ 浏览器在发送跨域请求前，会先发送一个 OPTIONS 请求，询问服务器是否允许该请求。
+ 服务器收到 OPTIONS 请求后，会返回一个响应，包含允许的请求方法、请求头等信息。
+ 浏览器收到响应后，会判断是否允许该请求，若允许，则发送实际请求；若不允许，则不发送请求。
+ OPTIONS 请求通常不会携带 Cookie。它是一个预检请求，用于检查实际请求是否可以安全地发送。浏览器在发送 OPTIONS 请求时，不会自动附带 Cookie 和 Authorization 等认证信息，除非明确设置了 credentials 选项

## async和defer
+ async：异步加载脚本，不阻塞页面渲染，脚本加载完成后立即执行。多个 async 脚本的执行顺序不确定，取决于下载完成时间。
+ defer：异步加载脚本，不阻塞页面渲染，脚本加载完成后等待dom加载完成后执行。多个 defer 脚本的执行顺序按照加载顺序执行。