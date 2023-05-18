---
{
"title": "记录斐讯N1编译并刷入openwrt固件",
"date": "2022-05-03",
"category": "技术",
"tags": ["openwrt", "斐讯N1"]
}
---
# 记录斐讯N1编译并刷入openwrt固件

## 前置条件

1. 一个可以访问的Linux系统，如Ubuntu 20.04 LTS

2. 安装编译依赖

   ```bash
   sudo apt update -y
   sudo apt full-upgrade -y
   sudo apt install -y ack antlr3 asciidoc autoconf automake autopoint binutils bison build-essential \
   bzip2 ccache cmake cpio curl device-tree-compiler fastjar flex gawk gettext gcc-multilib g++-multilib \
   git gperf haveged help2man intltool libc6-dev-i386 libelf-dev libglib2.0-dev libgmp3-dev libltdl-dev \
   libmpc-dev libmpfr-dev libncurses5-dev libncursesw5-dev libreadline-dev libssl-dev libtool lrzsz \
   mkisofs msmtp nano ninja-build p7zip p7zip-full patch pkgconf python2.7 python3 python3-pip qemu-utils \
   rsync scons squashfs-tools subversion swig texinfo uglifyjs upx-ucl unzip vim wget xmlto xxd zlib1g-dev
   ```

## 编译openwrt

1. 下载源代码，更新 feeds 并选择配置

   ```bash
   git clone https://github.com/coolsnowwolf/lede
   cd lede
   sed -i '$a src-git kenzo https://github.com/kenzok8/openwrt-packages' feeds.conf.default
   sed -i '$a src-git small https://github.com/kenzok8/small' feeds.conf.default
   ./scripts/feeds update -a
   ./scripts/feeds install -a
   make menuconfig
   ```

   其中3-4行向`feeds.conf.default`中添加openwrt常用软件包

2. menuconfig选择

   ```
   Target System  ->  QEMU ARM Virtual Machine 
   Subtarget ->  QEMU ARMv8 Virtual Machine (cortex-a53)
   Target Profile  ->  Default
   Target Images  ->   tar.gz
   *** 必选软件包(基础依赖包，仅保证打出的包可以写入EMMC,可以在EMMC上在线升级，不包含具体的应用)： 
   Languages -> Perl               
                ->  perl-http-date
                ->  perlbase-getopt
                ->  perlbase-time
                ->  perlbase-unicode                              
                ->  perlbase-utf8        
   Utilities -> Disc -> blkid、fdisk、lsblk、parted            
             -> Filesystem -> attr、btrfs-progs(Build with zstd support)、chattr、dosfstools、
                              e2fsprogs、f2fs-tools、f2fsck、lsattr、mkf2fs、xfs-fsck、xfs-mkfs
             -> Compression -> bsdtar 或 p7zip(非官方源)、pigz
             -> Shells  ->  bash         
             -> gawk、getopt、losetup、tar、uuidgen
   
    * (可选)Wifi基础包：
    *     打出的包可支持博通SDIO无线模块,Firmware不用选，
    *     因为打包源码中已经包含了来自Armbian的firmware，
    *     会自动覆盖openwrt rootfs中已有的firmware
    Kernel modules  ->   Wireless Drivers -> kmod-brcmfmac(SDIO) 
                                          -> kmod-brcmutil
                                          -> kmod-cfg80211
                                          -> kmod-mac80211
    Network  ->  WirelessAPD -> hostapd-common
                             -> wpa-cli
                             -> wpad-basic
             ->  iw
   ```

3. 下载 dl 库，编译固件

   ```bash
   make download -j8
   make V=s -j1
   ```

   输出固件在`./lede/bin/targets/armvirt/64`目录下。后面需要`openwrt-armvirt-64-default-rootfs.tar.gz`文件。

## 下载Armbian内核

1. 下载Flippy预编译好的 Arm64 内核 (在 https://t.me/openwrt_flippy 及 https://pan.baidu.com/s/1tY_-l-Se2qGJ0eKl7FZBuQ 提取码：846l)
2. 移动到/opt/kernel目录下

## 合并openwrt固件和Armbian内核

```bash
cd /opt
git clone https://github.com/unifreq/openwrt_packit
cd /opt/openwrt_packit
./mk_s905d_n1.sh
```

输出目录` /opt/openwrt_packit/output `，文件名为`xxx.img`。

使用`balenaEtcher`将固件写入U盘

## N1盒子刷回电视固件(非必须步骤)

1. 打开`Amlogic USB Burning Tool`导入电视固件，勾选清除flash(请勿勾选BootLoader)
2. usb双头线连接盒子和电脑
3. `Amlogic USB Burning Tool`中点击开始
4. ssh连接N1，输入命令`reboot update`，回车
5. 等待进度条走完，断电-上电重启

## 刷入openwrt固件

**注意**：这里指的的openwrt固件是上述步骤中openwrt和armbian内核合并后的固件。

1. 打开Android TV调试模式，查看Android TV 局域网ip，如`192.168.1.10`

2. 电脑命令行输入

   ```bash
   adb connect 192.168.1.10
   adb shell reboot update
   ```

3. 上述命令执行完瞬间将写入了固件的U盘插入N1盒子USB口

4. 等待初始化

## 配置

1. 固件从U盘写入EMMC

   ```bash
   cd /root
   ./install-to-emmc.sh
   reboot
   ```

2. 更改Lan口ip

   ```bash
   vim /etc/config/network
   reboot
   ```

