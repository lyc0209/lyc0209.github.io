---
{
"title": "记录rclone基本用法",
"date": "2023-09-11",
"category": "技术",
"tags": ["nas"]
}
---
# 记录rclone基本用法

以Windows下挂载OneDrive为例

## 常用命令

```bash
# 本地到网盘
rclone [功能选项] <本地路径> <配置名称:路径> [参数] [参数]

# 网盘到本地
rclone [功能选项] <配置名称:路径> <本地路径> [参数] [参数]

# 网盘到网盘
rclone [功能选项] <配置名称:路径> <配置名称:路径> [参数] [参数]

# [参数]为可选项
```

示例

```bash
# 挂载
rclone mount onedrive_alist:/ N: --cache-dir C:\\Users\\lyc12\\rclone_cache --vfs-cache-mode writes &

# 复制到网盘，并显示实时传输进度，设置并行上传数为8
rclone copy -P /home/SunPma onedrive_1:/home/SunPma --transfers=8

# 如果需要服务端对服务端的传输可加以下参数（不消耗本地流量）
rclone copy 配置名称:网盘路径 配置名称:网盘路径 --drive-server-side-across-configs
```

功能

| 命令          | 说明                                                         |
| :------------ | :----------------------------------------------------------- |
| rclone copy   | 复制                                                         |
| rclone move   | 移动，如果要在移动后删除空源目录，加上 --delete-empty-src-dirs 参数 |
| rclone sync   | 同步：将源目录同步到目标目录，只更改目标目录                 |
| rclone size   | 查看网盘文件占用大小                                         |
| rclone delete | 删除路径下的文件内容                                         |
| rclone purge  | 删除路径及其所有文件内容                                     |
| rclone mkdir  | 创建目录                                                     |
| rclone rmdir  | 删除目录                                                     |
| rclone rmdirs | 删除指定环境下的空目录。如果加上 --leave-root 参数，则不会删除根目录 |
| rclone check  | 检查源和目的地址数据是否匹配                                 |
| rclone ls     | 列出指定路径下的所有的文件以及文件大小和路径                 |
| rclone lsl    | 比上面多一个显示上传时间                                     |
| rclone lsd    | 列出指定路径下的目录                                         |
| rclone lsf    | 列出指定路径下的目录和文件                                   |

参数

| 命令                                | 说明                                                         |
| :---------------------------------- | :----------------------------------------------------------- |
| -n = --dry-run                      | 测试运行，查看Rclon在实际运行中会进行哪些操作                |
| -P = --progress                     | 显示实时传输进度，500mS刷新一次，否则默认1分钟刷新一次       |
| --cache-chunk-size 5M               | 块的大小，默认5M越大上传越快，占用内存越多，太大可能会导致进程中断 |
| --onedrive-chunk-size 100M          | 提高OneDrive上传速度适用于G口宽带服务器（默认为320KB）       |
| --drive-chunk-size 64M              | 提高Google Drive上传速度适用于G口宽带服务器（默认为8M）      |
| --cache-chunk-total-size SizeSuffix | 块可以在本地磁盘上占用的总大小，默认10G                      |
| --transfers=N                       | 并行文件数，默认为4                                          |
| --config string                     | 指定配置文件路径，string为配置文件路径                       |
| --ignore-errors                     | 跳过错误                                                     |
| --size-only                         | 根据文件大小校验，不校验hash                                 |
| --drive-server-side-across-configs  | 服务端对服务端传输                                           |

## 安装

1. 前往rclone官网下载对应的安装包[Rclone downloads](https://rclone.org/downloads/)

2. 解压到任意目录，如`C:\\Program Files\\rclone`

3. 配置环境变量，将上述目录配置到Path中

4. 验证：命令行中输入`rclone --version`，出现类似下面信息即成功

   ```
   rclone v1.63.1
   - os/version: Microsoft Windows 11 Pro 22H2 (64 bit)
   - os/kernel: 10.0.22621.2215 (x86_64)
   - os/type: windows
   - os/arch: amd64
   - go/version: go1.20.6
   - go/linking: static
   - go/tags: cmount
   ```

## 配置存储源

1. 打开命令行，输入`rclone config`

   ```
   Current remotes:
   
   Name                 Type
   ====                 ====
   
   e) Edit existing remote
   n) New remote
   d) Delete remote
   r) Rename remote
   c) Copy remote
   s) Set configuration password
   q) Quit config
   e/n/d/r/c/s/q>
   ```

   输入`n`，并回车，新建存储源

2. 输入名称

   ```
   name>
   ```

   设置当前存储源的名称，在后续上传下载中需要用到

3. 选择存储源类型

   ...
