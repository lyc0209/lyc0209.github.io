---
{
"title": "Linux crontab 和 nvm问题记录",
"date": "2023-08-22",
"category": "技术",
"tags": ["server"]
}
---
# Linux crontab 和 nvm问题记录

## 问题

使用nvm安装node后，crontab执行node脚本会遇到 `node not found`、`import not found`、`const not found`等报错

## 原因

在cron中不能正确加载nvm环境变量导致。

## 解决

1. 新建`cronjob.env.sh`

   ```sh
   #!/bin/bash
   
   # NVM needs the ability to modify your current shell session's env vars,
   # which is why it's a sourced function
   
   # found in the current user's .bashrc - update [user] below with your user! 
   export NVM_DIR="/home/[user]/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
   
   # uncomment the line below if you need a specific version of node
   # other than the one specified as `default` alias in NVM (optional)
   # nvm use 4 1> /dev/null
   ```

2. 修改`crontab`命令

   ```
   0 8 * * * (. ~/scripts/cronjob.env.sh; ~/task/start.sh;)
   ```

3. 修改`start.sh`

   ```sh
   #!/bin/bash
   
   # paths can be relative to the current user that owns the crontab configuration
   
   # $(which node) returns the path to the current node version
   # either the one specified as `default` alias in NVM or a specific version set above
   # executing `nvm use 4 1> /dev/null` here won't work!
   $(which node) ~/task/index.js
   ```

4. `index.js`

   ```js
   console.log("task")
   ```

   
