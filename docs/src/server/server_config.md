---
{
"title": "服务器初始化配置",
"date": "2021-11-25",
"category": "技术",
"tags": ["server"]
}
---
# 服务器配置

## 初始化

### 更新

`sudo apt update`

`sudo apt upgrade`

### 创建新用户并禁用root登录

1. 创建新用户

   `sudo adduser lyc`

2. 加入sudo组

   `usermod -aG sudo lyc`

3. 测试

   ```bash
   su lyc
   sudo ls -la /root
   ```

4. 配置lyc用户密钥登录

   `sudo mv /root/.ssh/authorized_keys /home/lyc/.ssh/`

5. 禁用root登录

   `sudo vim etc/ssh/sshd_config`，将`PermitRootLogin yes`改为`PermitRootLogin no`

   `sudo service ssh restart` 重启ssh服务

### 更改文件所有者

1. 查看文件所有者

   `ls -la`

2. 更改文件所有者

   `sudo chown -R lyc:lyc files/` -R递归

3. 更改文件权限

   `chmod -R 755 ./file` 

### 安装mysql5.7

由于ubuntu20.04使用apt默认安装mysql8.0，使用deb安装包安装

1. 下载5.7.33版本

   `wget https://downloads.mysql.com/archives/get/p/23/file/mysql-server_5.7.33-1ubuntu18.04_amd64.deb-bundle.tar`

2. 安装

   ```bash
   mkdir mysql5.7.33
   tar -xvf mysql-server_5.7.33-1ubuntu18.04_amd64.deb-bundle.tar ./mysql5.7.33
   cd mysql5.7.33
   ```

   ```bash
   # 解压出来的deb安装包如下：
   libmysqlclient20_5.7.33-1ubuntu18.04_amd64.deb
   mysql-client_5.7.33-1ubuntu18.04_amd64.deb
   mysql-community-source_5.7.33-1ubuntu18.04_amd64.deb
   mysql-server_5.7.33-1ubuntu18.04_amd64.deb
   mysql-common_5.7.33-1ubuntu18.04_amd64.deb
   mysql-testsuite_5.7.33-1ubuntu18.04_amd64.deb
   libmysqlclient-dev_5.7.33-1ubuntu18.04_amd64.deb
   mysql-community-client_5.7.33-1ubuntu18.04_amd64.deb
   mysql-community-server_5.7.33-1ubuntu18.04_amd64.deb
   libmysqld-dev_5.7.33-1ubuntu18.04_amd64.deb
   mysql-community-test_5.7.33-1ubuntu18.04_amd64.deb
   # 删除2个测试相关的包
   sudo rm -f mysql-testsuite_5.7.33-1ubuntu18.04_amd64.deb
   sudo rm -f mysql-community-test_5.7.33-1ubuntu18.04_amd64.deb
   ```

   ```bash
   sudo dpkg -i mysql-*.deb
   # 查看mysql版本
   mysql -V
   ```

3. 修改密码

   ```bash
   use mysql;
   update user set authentication_string=password('新密码') where user='root' and Host='localhost';
   flush privileges;
   ```

4. 允许远程登录

   ```bash
   # 进入/etc/mysql/mysql.conf.d/目录，编辑mysqld.cnf
   # 将其修改为0.0.0.0
   bind-address = 0.0.0.0
   
   # root用户登录
   mysql -uroot -ppassword
   grant all on *.* to root@'%' identified by 'password';
   flush privileges;
   sudo /etc/init.d/mysql restart
   ```

5. 修改端口号

   `sudo vim sudo /etc/init.d/mysql restart`

   ```bash
     [mysqld]
      ...
      port            = 33306  #3306
      ...
      bind-address    = 127.0.0.1  #绑定本机访问，注释这条就可以远程访问了
   ```

### 安装nodejs

```bash
sudo apt install nodejs npm
npm config set registry http://registry.npm.taobao.org
```

### 安装openjdk8

`sudo apt install openjdk-8-jdk`

