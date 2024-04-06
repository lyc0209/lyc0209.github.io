---
{
"title": "NaiveProxy记录",
"date": "2024-04-06",
"category": "代理",
"tags": ["proxy", "naiveproxy"]
}
---
# NaiveProxy记录

## 前提条件

系统：Ubuntu Server 22.04

## 初始化设置

1. 更新

   ```bash
   sudo apt update
   sudo apt upgrade
   ```

2. 更改ssh端口

   ```bash
   sudo vim /etc/ssh/sshd_config
   ```

   ```bash
   # 添加 Port 12345
   Port 12345
   ```

   `:wq`保存退出

   ```sudo service ssh restart``` 重启ssh服务

3. 创建新用户并禁用root登录

   ```bash
   # 1. 创建新用户
   sudo adduser test
   
   # 2. 加入sudo组
   usermod -aG sudo test
   
   # 3. 测试
   su test
   sudo ls -la /root
   ```

   在客户端上创建密钥对

   ```bash
   # 默认存储在~/.ssh中
   ssh-keygen
   ```

   将公钥复制到刚刚在服务器中创建的test用户目录的的.ssh目录下

   保存私钥id_rsa备用

   ```bash
   vim ~/.ssh/authorized_keys
   ```

   配置test使用密钥登录 并 禁用root登录

   ```bash
   sudo vim /etc/ssh/sshd_config
   
   # 将PermitRootLogin yes 改为PermitRootLogin no
   # 增加 PasswordAuthentication no
   
   # :wq 退出
   sudo systemctl restart ssh
   ```

4. 安装fail2ban

   ```bash
   sudo apt install fail2ban
   ```

   ```bash
   # 配置
   cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
   ```

   ```bash
   # 重启服务
   sudo systemctl restart fail2ban
   ```

   ```bash
   # 查看fail2ban状态
   sudo fail2ban-client status sshd
   ```

5. 配置防火墙

   ```bash
   sudo apt install ufw
   ```

   ```bash
   # ssh
   sudo ufw allow 12345
   # naiveproxy
   sudo ufw allow 80
   # naiveproxy
   sudo ufw allow 443
   
   ```

   ```bash
   # 启用
   sudo ufw enable
   # 禁用
   sudo ufw disable
   # 查看状态
   sudo ufw status
   ```

## 安装go

1. 下载

   ```bash
   wget https://golang.google.cn/dl/go1.22.2.linux-amd64.tar.gz
   ```

2. 安装

   ```bash
   sudo rm -rf /usr/local/go
   sudo tar -C /usr/local -xzf go1.22.2.linux-amd64.tar.gz
   ```

3. 配置环境变量

   ```bash
   vim /etc/profile
   
   # 加到最后一行
   export PATH=$PATH:/usr/local/go/bin
   ```

   ```bash
   source /etc/profile
   ```

4. 验证

   ```bash
   go version
   ```

## 构建服务端

1. 编译

   ```bash
   go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
   ~/go/bin/xcaddy build --with github.com/caddyserver/forwardproxy=github.com/klzgrad/forwardproxy@naive
   ```

2. 配置

   ```bash
   vim ./Caddyfile
   ```

   ```
   {
     order forward_proxy before file_server
   }
   :443, example.com { # 替换域名
     tls me@example.com # 替换成邮箱
     forward_proxy {
       basic_auth user pass #替换 user pass
       hide_ip
       hide_via
       probe_resistance
     }
     file_server {
       root /var/www/html # 默认访问的html
     }
     log {
       output file /home/test/proxy/log.txt {	# 日志文件
   
       }
     }
   }
   ```

3. 启动

   ```bash
   sudo setcap cap_net_bind_service=+ep ./caddy
   ./caddy start
   ```

