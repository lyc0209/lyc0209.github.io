---
{
"title": "Ubuntu Server初始化",
"date": "2023-09-11",
"category": "技术",
"tags": ["server"]
}
---
# 服务器初始化
## 更新

```sh
sudo apt update
sudo apt upgrade
```



## 更改ssh端口

```sh
sudo vim /etc/ssh/sshd_config
```

```sh
// 添加 Port 12345
Port 12345
```

`:wq`保存退出

`sudo service ssh restart` 重启ssh服务



## 创建新用户并禁用root登录

1. 创建新用户

   `sudo adduser test`

2. 加入sudo组

   `usermod -aG sudo test`

3. 测试

   ```sh
   su test
   sudo ls -la /root
   ```

4. 配置test用户密钥登录

   将`/root/.ssh/authorized_keys`中的内容复制到`home/test/.ssh/authorized_keys`

5. 禁用root登录

   `sudo vim /etc/ssh/sshd_config`，将`PermitRootLogin yes`改为`PermitRootLogin no`

   `sudo service ssh restart` 重启ssh服务

## 安装fail2ban

```sh
sudo apt install fail2ban
```

## Zerotier

1. 安装

   ```bash
   curl -s https://install.zerotier.com | sudo bash
   ```

2. 加入网络

   ```sh
   sudo zerotier-cli join xxxxxxxxx
   ```

3. 搭建moon节点

   ```sh
   cd /var/lib/zerotier-one
   sudo zerotier-idtool initmoon identity.public > moon.json
   ```

   编辑`moon.json`

   ```
   # stableEndpoints中加上服务器的ip、port
   "stableEndpoints": ["ip/port"]
   ```

   生成Moon节点特征文件

   ```sh
   zerotier-idtool genmoon moon.json
   ```

   ```sh
   mkdir moons.d && mv 00000xxxxxx.moon moons.d
   ```

   重启zerotier服务：

   ```sh
   sudo systemctl restart zerotier-one
   ```

   查看moon节点id：

   ```sh
   zerotier-cli info
   ```

   

   (其他客户端加入moon节点)：

   ```sh
   # xxx均是moon节点id
   zerotier-cli orbit xxx xxx
   ```

   ```sh
   # 查看moon节点状态，已经变成moon
   zerotier-cli listpeers
   ```

   ```sh
   # 移除moon节点
   zerotier-cli deorbit xxx xxx
   ```

## Docker

[Install Docker Engine on Ubuntu | Docker Docs](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)



## Aria2

docker启动：

```sh
docker run -d \
    --name aria2-pro \
    --restart unless-stopped \
    --log-opt max-size=1m \
    --network host \
    -e PUID=$UID \
    -e PGID=$GID \
    -e RPC_SECRET=<TOKEN> \
    -e RPC_PORT=6800 \
    -e LISTEN_PORT=6888 \
    -v $PWD/aria2-config:/config \
    -v $PWD/aria2-downloads:/downloads \
    p3terx/aria2-pro
```



## screen

1. 安装

   ```sh
   sudo apt install screen
   ```

2. 状态

   - ***Attached***：表示当前screen正在作为主终端使用，为活跃状态。
   - ***Detached***：表示当前screen正在后台使用，为非激发状态。

3. 常用命令

   ```sh
   # 将列出窗口列表
   screen -ls 
   ```

   ```sh
   # 新建名为hello的终端
   screen -S hello
   
   # 或者
   screen -R hello
   
   # 区别
   # 使用-R创建，如果之前有创建唯一一个同名的screen，则直接进入之前创建的screen
   # 使用-S创建和直接输入screen创建的虚拟终端，不会检录之前创建的screen（也就是会创建同名的screen)
   ```

   ```sh
   # 回到主终端
   # 按住 Ctrl + A + D
   ```

   ```sh
   # 进入之前的终端
   # 使用screen -r命令
   screen -r [pid/name]
   ```

   ```sh
   # 清楚screen终端
   
   # screen终端中输入 exit
   # 或者
   # 主终端中输入，（使用-R/-r/-S均可）
   screen -R [pid/Name] -X quit
   ```

   
