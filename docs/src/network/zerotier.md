---
{
"title": "zerotier配置",
"date": "2022-05-27",
"category": "技术",
"tags": ["zerotier"]
}
---
# zerotier配置

## Moon配置

1. 安装

   ```bash
   curl -s https://install.zerotier.com | sudo bash
   ```

2. 加入网络

   ```bash
   zerotier-cli join xxx
   ```

3. 离开网络

   ```bash
   zerotier-cli leave xxx
   ```

4. 网络列表

   ```bash
   zerotier-cli listnetworks
   ```

5. 生成及修改 moon.json

   ```bash
   cd /var/lib/zerotier-one
   zerotier-idtool initmoon identity.public >>moon.json
   ```

   ```json
   {
    "id": "xxx",
    "objtype": "world",
    "roots": [
     {
      "identity": "xxx",
      "stableEndpoints": ["ip/port"]
     }
    ],
    "signingKey": "xxx",
    "signingKey_SECRET": "xxx",
    "updatesMustBeSignedBy": "xxx",
    "worldType": "moon"
   }
   ```

   其中，id为moon客户端id，通过命令`zerotier-cli info `等命令查到

   stableEndpoints填入moon公网ip，端口默认9993

6. 生成签名文件

   ```bash
   sudo zerotier-idtool genmoon moon.json
   ```

   会在当前目录下生成000000xxx.moon(其中xxx为moon id)。

7. moon节点加入网络

   ```bash
   mkdir moons.d
   mv 000000xxx.moon moons.d/
   ```

8. 重启zerotier服务器

   ```bash
   service zerotier-one restart
   # 或者杀死进程后启动服务
   ps -aux | grep zerotier
   kill xxx
   zerotier-one -d
   ```

   **注**：上述生成的文件和文件夹可能存在权限问题， 通过以下命令修改

   ```bash
   # 文件夹
   sudo chown -R zerotier-one:zerotier-one moons.d
   # 文件
   sudo chown zerotier-one:zerotier-one moon.json
   ```

   

## 客户端配置

```bash
zerotier-cli orbit xxx xxx
```

其中xxx为moon id

显示成功后重启客户端服务

输入`zerotier-cli listpeers`，若某一行后面带有moon字样，说明加入moon节点成功

## 后台设置访问openwrt等路由器的LAN资源

Advanced-Add Routes

**Destination**: 192.168.1.0/24

**(Via)**: 192.168.11.12

例如，via为zerotier为openwrt分配的ip，通过上述设置即可访问路由器下的设备，如192.168.1.2

**注**：我的openwrt集成了zerotier，有“自动允许客户端 NAT”选项，否则可能需要再设置。



