---
{
"title": "WPS JS 宏",
"date": "2023-12-03",
"category": "技术",
"tags": ["WPS", "Excel"]
}
---
# WPS JS 宏

记录一下WPS JS宏的用法

## 示例

### 1. 提取两列的数据，转json 对象数组

```js
function main() {
    const sheet = Application.ActiveSheet
    
    const begin = 2
    const end = 24

   	const labels = sheet.Range(`A${begin}:A${end}`).Value().flat()
	const props = sheet.Range(`B${begin}:B${end}`).Value().flat()
    
    const jsonList = labels.map((item, index) => {
        return {
            label: item,
            prop: props[index]
        }
    })
    
    console.log(JSON.stringify(jsonList))
}
```

