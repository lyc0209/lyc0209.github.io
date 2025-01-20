import * as fs from "fs"
import path from "path"

const out = []
let re = /---(.*?)---/sg
const generate = async (dirPath) => {
  const dirList = fs.readdirSync(dirPath)
  dirList.map(item => {
    const tempPath = path.join(dirPath, item);
    const stats = fs.statSync(tempPath);
    if (stats.isDirectory()) {
      generate(tempPath);
    } else if (path.normalize("./docs/src/index.md") !== tempPath) {
      const content = fs.readFileSync(tempPath, 'utf8')
      let s = re.exec(content)
      re.lastIndex = 0
      if (s) {
        console.log(s[1], tempPath)
        const result = JSON.parse(s[1])
        if (result?.isHideIndex) {
          return
        }
        result.link = tempPath.slice(8, -3).replaceAll("\\", "/")
        out.push(result)
      }
    }
  })
}

generate("./docs/src").then(() => {
  const filePath = './docs/.vitepress/docs.json'
  fs.writeFileSync(
    filePath,
    JSON.stringify(out),
    {
      encoding: 'utf8',
    }
  );
  console.log("初始化成功")
}).catch((err) => {
  console.log("初始化失败", err)
})
