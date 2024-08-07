---
{
"title": "利用网盘实现家庭监控的免费存储",
"date": "2024-08-07",
"category": "技术",
"tags": ["nas", "OneDrive", "HomeServer"]
}
---

# 利用网盘实现家庭监控的免费存储

## 前言

​	前段时间入手了一个**小米智能摄像机3 Pro 云台版**。小米的摄像头存储方案支持 SD卡、云服务、NAS存储（SMB协议）。其中SD卡容量有限，云服务收费，显然都不是我这个白嫖党想要的。正好我前段时间入手了一台**N100 mini主机**，丢在角落当HomeServer使用。那我就可以利用这台主机，将网盘映射到本地，同时开启SMB服务，路径指向映射的网盘，摄像头将监控内容通过SMB协议传输到小主机，即可实现免费存储监控内容。

## 所需设备、软件

![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog202408071514590.png)

设备：

1. 支持SMB协议的摄像头（以 小米智能摄像机3 Pro 云台版 为例）
2. 安装Linux操作系统的主机（以 Ubuntu 24.04 LTS 为例）
3. 网盘（能通过各种方法映射到本地即可。以OndeDrive为例）

软件：

1. [AList](https://alist.nn.ci/zh/guide/)：用于挂载各种网盘，同时内置WebDAV服务，供其他设备挂载

   注意：**Alist非必须**。下面提到的Rclone完全支持挂载OneDrive，我用Alist还有其他用途，之前已经在主机上安装了。对于Rclone来说，挂载WebDAV服务比挂载OneDrive步骤更少，所以我这里额外使用了Alist

2. [Rclone](https://rclone.org/)：用于将网盘挂载到本地。支持多种网盘，WebDAV、OneDrive均支持，所以上面提到的AList非必须。

3. [Samba](https://www.samba.org/)：小主机中启动SMB服务，供摄像头使用

## 步骤

### 一. Alist挂载网盘

1. 安装

   我这里使用docker compose安装

   compose.yaml

   ```
   services:
     alist:
       container_name: ${STACK_NAME}_app
       image: "xhofe/alist:${APP_VERSION}"
       volumes:
         - ${STACK_DIR}/data:/opt/alist/data
       ports:
         - ${APP_PORT}:5244
       environment:
         - PUID=1000
         - PGID=1000
         - UMASK=022
       restart: always
   ```

   .env

   ```
   STACK_NAME=alist
   STACK_DIR=~/docker/data/alist # 自定义项目储存路径，例如 ./alist
   
   # alist
   APP_VERSION=latest
   APP_PORT=5244 # 自定义访问端口，选择不被占用的即可
   ```

2. 配置

​	可以参考[OneDrive | AList文档 (nn.ci)](https://alist.nn.ci/zh/guide/drivers/onedrive.html)

​	可选：挂载网盘后，再额外开启加密挂载[Crypt(加密) | AList文档 (nn.ci)](https://alist.nn.ci/zh/guide/drivers/Crypt.html)，毕竟监控内容可能会涉及隐私。

### 二. Rclone挂载WebDAV到本地

1. 安装

   参考[Install (rclone.org)](https://rclone.org/install/)

2. 配置

   命令行输入`rclone config`并回车

   ```bash
   lyc@ubuntu-server:~$ rclone config
   Current remotes:
   
   Name                 Type
   ====                 ====
   test         webdav
   
   e) Edit existing remote
   n) New remote
   d) Delete remote
   r) Rename remote
   c) Copy remote
   s) Set configuration password
   q) Quit config
   e/n/d/r/c/s/q> 
   ```

   输入`n`并回车，新建一个远程

   ```bash
   Enter name for new remote.
   name>
   ```

   输入远程名称，并回车

   ```bash
   Option Storage.
   Type of storage to configure.
   Choose a number from below, or type in your own value.
    1 / 1Fichier
      \ (fichier)
    2 / Akamai NetStorage
      \ (netstorage)
    3 / Alias for an existing remote
      \ (alias)
    ...
    ...
    51 / WebDAV
      \ (webdav)
   Storage>
   ```

   输入51，并回车（不同版本序号可能不同，找到webDAV即可。同时也支持OneDrive）

   ```bash
   Option url.
   URL of http host to connect to.
   E.g. https://example.com.
   Enter a value.
   url>
   ```

   输入webDAV服务URL，例如：`http://127.0.0.1:5244/dav`（Alist开启的webDAV服务默认路径为/dav）

   ```bash
   Option vendor.
   Name of the WebDAV site/service/software you are using.
   Choose a number from below, or type in your own value.
   Press Enter to leave empty.
    1 / Fastmail Files
      \ (fastmail)
    2 / Nextcloud
      \ (nextcloud)
    3 / Owncloud
      \ (owncloud)
    4 / Sharepoint Online, authenticated by Microsoft account
      \ (sharepoint)
    5 / Sharepoint with NTLM authentication, usually self-hosted or on-premises
      \ (sharepoint-ntlm)
    6 / rclone WebDAV server to serve a remote over HTTP via the WebDAV protocol
      \ (rclone)
    7 / Other site/service or software
      \ (other)
    vendor>
   ```

   选择7并回车

   ```bash
   Option user.
   User name.
   In case NTLM authentication is used, the username should be in the format 'Domain\User'.
   Enter a value. Press Enter to leave empty.
   user>
   ```

   输入Alist 用户名，并回车

   ```bash
   Option pass.
   Password.
   Choose an alternative below. Press Enter for the default (n).
   y) Yes, type in my own password
   g) Generate random password
   n) No, leave this optional password blank (default)
   y/g/n>
   ```

   输入y，并回车

   ```bash
   Enter the password:
   password:
   ```

   输入密码，并回车

   ```bash
   Option bearer_token.
   Bearer token instead of user/pass (e.g. a Macaroon).
   Enter a value. Press Enter to leave empty.
   bearer_token>
   ```

   直接回车

   ```bash
   Edit advanced config?
   y) Yes
   n) No (default)
   y/n> 
   ```

   输入n，并回车

   ```bash
   Configuration complete.
   Options:
   - type: webdav
   - url: http://127.0.0.1:5244/dav
   - vendor: other
   - user: lyc
   - pass: *** ENCRYPTED ***
   Keep this "test3" remote?
   y) Yes this is OK (default)
   e) Edit this remote
   d) Delete this remote
   y/e/d> 
   ```

   输入y，并回车



上述步骤完成即可添加webDAV远程。下面将这个远程挂载到本地

（可以使用systemctl实现开机自启动挂载，具体可自行百度）

   ```bash
   rclone mount Alist: /volume3/6T/Alist --use-mmap --umask 000 --allow-other --allow-non-empty --dir-cache-time 24h --cache-dir=/home/cache --vfs-cache-mode full --buffer-size 512M --vfs-read-chunk-size 16M --vfs-read-chunk-size-limit 64M --vfs-cache-max-size 10G --daemon
   ```

各个参数的作用（可参考rclone文档）：

`rclone mount Alist: /volume3/6T/Alist`：将名为 `Alist` 的远程存储挂载到本地路径 `/volume3/6T/Alist`。

`--use-mmap`：使用内存映射来访问缓存文件，通常可以提高性能。

`--umask 000`：设置文件权限掩码，`000` 表示所有用户都有读写执行权限。

`--allow-other`：允许非 `root` 用户访问挂载的文件系统。需要在系统配置中启用相应权限（例如在 `/etc/fuse.conf` 文件中添加 `user_allow_other`）。

`--allow-non-empty`：允许挂载点目录非空。默认情况下，`rclone` 不允许在非空目录上进行挂载。

`--dir-cache-time 24h`：将目录缓存保留 24 小时，这可以减少频繁访问目录的开销。

`--cache-dir=/home/cache`：指定缓存目录为 `/home/cache`。

`--vfs-cache-mode full`：启用完全 VFS 缓存模式，这意味着所有文件都会被下载到本地缓存目录。

`--buffer-size 512M`：设置传输缓冲区大小为 512MB，有助于提高大文件传输的效率。

`--vfs-read-chunk-size 16M`：设置 VFS 的初始读取块大小为 16MB。每次读取都会首先尝试读取这个大小的数据块。

`--vfs-read-chunk-size-limit 64M`：设置 VFS 的最大读取块大小为 64MB。

`--vfs-cache-max-size 10G`：设置 VFS 缓存的最大尺寸为 10GB。

`--daemon`：以守护进程的方式运行，使命令在后台运行。

### 三. 开启SMB服务

1. 安装

   ```bash
   sudo apt install samba
   ```

2. 配置

   ```bash
   sudo vim /etc/samba/smb.conf
   ```

   ```bash
   [shared]
      path = /volume3/6T/Alist
      browsable = yes
      writable = yes
      guest ok = no
      read only = no
   ```

3. 创建samba用户

   ```bash
   sudo smbpasswd -a yourusername
   ```

4. 重启samba服务

   ```bash
   sudo systemctl restart smbd
   sudo systemctl restart nmbd
   ```

   