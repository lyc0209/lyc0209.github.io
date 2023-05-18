---
{
"title": "记录Magisk安装",
"date": "2021-11-28",
"category": "技术",
"tags": ["android", "magisk"]
}
---
# 记录Magisk安装

## 条件

1. BootLoader已解锁
2. 手机
3. 电脑(安装ADB)

## 步骤

1. 下载系统包(xxx.zip)，提取压缩包里的boot.img
2. 打开Magisk App，选择`安装-选择并修补一个文件-选择boot.img`
3. 修复完的boot.img被命名为`magiskxxxx.img`，将boot.img和补丁包都复制到电脑
4. 手机连接电脑，开启usb调试模式
5. 电脑打开cmd
   - 输入`adb reboot bootloader`进入bootloader
   - 输入`fastboot flash boot magiskxxx.img`刷入
   - 完成后输入`fastboot reboot`重启
6. 不出意外即可完成。如果出问题可通过`fastboot flash boot boot.img`刷入原版img尝试还原

