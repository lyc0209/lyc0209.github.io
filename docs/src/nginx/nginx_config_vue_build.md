---
{
"title": "Nginx配置+vue项目部署",
"date": "2023-03-15",
"category": "技术",
"tags": ["nginx", "vue"]
}
---
# Nginx配置+vue项目部署

## Nginx安装与配置

### 1. 安装

```bash
sudo apt update
sudo apt install nginx
```

安装完成后会自动启动，可以从浏览器访问

```bash
# 查看nginx版本
nginx -v
```

```bash
# systemctl命令
# 状态
sudo systemctl status nginx
# 启动
sudo systemctl start nginx
# 停止
sudo systemctl stop nginx
# 重启
sudo systemctl restart nginx
```



**nginx.conf** 配置文件

```bash
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 768;
	# multi_accept on;
}

http {
	sendfile on;
	tcp_nopush on;
	tcp_nodelay on;
	keepalive_timeout 65;
	types_hash_max_size 2048;
	
	include /etc/nginx/mime.types;
	default_type application/octet-stream;

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
	ssl_prefer_server_ciphers on;

	access_log /var/log/nginx/access.log;
	error_log /var/log/nginx/error.log;
	
	gzip on;

	include /etc/nginx/conf.d/*.conf;
	# 可以将这个注释掉，只用conf.d
    # include /etc/nginx/sites-enabled/*;
}
```



在conf.d中新建配置文件

```ba	
server {
    listen       80;
    server_name  localhost; # 可替换为域名

    charset utf-8; # 防止中文显示出现乱码

    #access_log  logs/host.access.log  main;

    location / {
        root   /var/www/html; # 你的静态资源路径
        index  index.html index.htm;# 访问的文件为html, htm
    }
}
```



```bash
# 检查配置文件是否有误
nginx -t
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 重启服务
sudo systemctl restart nginx
```


## vue项目打包

使用vue3+vite4。

要注意如果通过子路径访问，需要设置vite.config.ts的`base`属性

```js
// vite.config.ts
// 这里准备通过子路径web访问
export default defineConfig({
  base: "/web/",
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

```js
// src/router/index.ts
const router = createRouter({
  // 注意路由的base也需要同步修改
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ...
  ]
})
```


将打包后的文件上传至`/var/www/html/web`目录下

Nginx配置

```bash
server {
    listen       80;
    server_name  localhost; # 可替换为域名

    charset utf-8; # 防止中文显示出现乱码

    #access_log  logs/host.access.log  main;

    location /web {
        alias   /var/www/html/web; # 你的静态资源路径
        index  index.html index.htm;# 访问的文件为html, htm
        try_files $uri $uri/ /web/index.html;
    }
}
```

**try_files**要做对应修改：`/web/index.html`



**root 与 alias区别：**

root与alias主要区别在于nginx如何解释location后面的uri，这会使两者分别以不同的方式将请求映射到服务器文件上。

root的处理结果是：root路径＋location路径

alias的处理结果是：使用alias路径替换location路径

例子：

```text
location /test {
    root /var/www/html/test;
}
```

访问地址为：host/test/test.html-->文件目录：/var/www/html/test/test/test.html

```text
location /test {
     alias /var/www/html/test;
}
```



访问地址为：host/test/test.html-->文件目录：/var/www/html/test/test.html

说明root把匹配的字符/test拼接到了文件路径中，而alias没有
