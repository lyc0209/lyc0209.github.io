---
{
"title": "css",
"date": "2022-03-28",
"category": "技术",
"tags": ["web", "css"]
}
---
## position定位

1. static

   不受left、right、top、bottom影响，始终根据页面正常流进行定位

2. relative

   相对其自身的正常位置进行定位

3. fixed

   相对于窗口定位，位置不受页面滚动影响

4. absolute

   相对于最近的父元素进行定位，(父元素不能是static，否则相对于body定位，并随页面滚动一起移动)

5. sticky

   相对于用户滚动位置进行定位，在相对（relative）和固定（fixed）之间切换，起先它会被相对定位，直到在窗口中遇到给定的偏移位置为止 - 然后将其“粘贴”在适当的位置

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Title</title>
  <link rel="stylesheet/less" type="text/css" href="./test.less" />
</head>
<body>
<h1>LYC</h1>

<p>afhoiaheiwfhpiooooo</p>
<p>afhoiaheiwfhpif</p>

<div class="static">我是static定位</div>

<div class="relative">我是relative定位</div>

<div class="fixed">我是fixed定位</div>

<div class="father">容器
  <div class="absolute">我是absolute定位</div>
</div>

<div class="sticky">我是sticky定位</div>


<p>afhoiaheiwfhpiooooo</p>
<p>afhoiaheiwfhpif</p>

</body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/less.js/3.11.1/less.min.js"></script>
</html>
```

```less
// 默认值static: 不受left、right、top、bottom影响
// 始终根据页面正常流进行定位
.static {
  position: static;
  border: 3px solid brown;
  width: 100%;
}

// 相对其自身的正常位置进行定位
.relative {
  margin-top: 40px;
  position: relative;
  left: 30px;
  border: 3px solid brown;
  width: calc(100% - 30px);
}

// 相对于窗口定位，位置不受页面滚动影响
.fixed {
  position: fixed;
  right: 5px;
  bottom: 5px;
  border: 3px solid brown;
}

.father {
  margin-top: 40px;
  position: relative;
  height: 200px;
  width: 300px;
  border: 3px solid cadetblue;

  // absolute定位：相对于最近的父元素进行定位，(父元素不能是static，否则相对于body定位，并随页面滚动一起移动)
  .absolute {
    position: absolute;
    top:40px;
    left: 10px;
    border: 3px solid darkcyan;
  }
}

// 相对于用户滚动位置进行定位，在相对（relative）和固定（fixed）之间切换
// 起先它会被相对定位，直到在窗口中遇到给定的偏移位置为止 - 然后将其“粘贴”在适当的位置
.sticky {
  position: sticky;
  top: 0;
  margin: 5px;
  background-color: cadetblue;
  border: 3px solid darkcyan;
}
```

## flex布局

### 语法

#### 容器属性

1. flex-direction

   决定项目的排列方向

   - `row`（默认值）：主轴为水平方向，起点在左端。

   - `row-reverse`：主轴为水平方向，起点在右端。
   - `column`：主轴为垂直方向，起点在上沿。
   - `column-reverse`：主轴为垂直方向，起点在下沿。

   ![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/屏幕截图2022-03-17 145234.png)

2. flex-wrap

   定义一行摆放不下时，如何换行

   - `nowrap`（默认值）：不换行

   - `wrap`：换行，第一行在上方。
   - `wrap-reverse`：换行，第一行在下方。

3. flex-flow

   是`flex-direction`和`flex-wrap`的简写形式，默认值：`row nowrap`

4. justify-content

   定义了项目在主轴上的对齐方式

   具体对齐方式与轴的方向有关。下面假设主轴为从左到右。

   - `flex-start`（默认值）：左对齐
   - `flex-end`：右对齐
   - `center`： 居中
   - `space-between`：两端对齐，项目之间的间隔都相等。
   - `space-around`：每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。

5. align-items

   定义项目在交叉轴上如何对齐

   - `flex-start`：交叉轴的起点对齐。
   - `flex-end`：交叉轴的终点对齐。
   - `center`：交叉轴的中点对齐。
   - `baseline`: 项目的第一行文字的基线对齐。
   - `stretch`（默认值）：如果项目未设置高度或设为auto，将占满整个容器的高度。

6. align-content

   定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。

   - `flex-start`：与交叉轴的起点对齐。
   - `flex-end`：与交叉轴的终点对齐。
   - `center`：与交叉轴的中点对齐。
   - `space-between`：与交叉轴两端对齐，轴线之间的间隔平均分布。
   - `space-around`：每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍。
   - `stretch`（默认值）：轴线占满整个交叉轴。

#### 项目属性

1. order

   定义项目的排列顺序。数值越小，排列越靠前，默认为0。

2. flex-grow

   定义项目的放大比例，默认为`0`，即如果存在剩余空间，也不放大。

   如果所有项目的`flex-grow`属性都为1，则它们将等分剩余空间（如果有的话）。如果一个项目的`flex-grow`属性为2，其他项目都为1，则前者占据的剩余空间将比其他项多一倍。

3. flex-shrink

   定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小。

   如果所有项目的`flex-shrink`属性都为1，当空间不足时，都将等比例缩小。如果一个项目的`flex-shrink`属性为0，其他项目都为1，则空间不足时，前者不缩小。

   负值对该属性无效。

4. flex-basis

   定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为`auto`，即项目的本来大小。

   它可以设为跟`width`或`height`属性一样的值（比如350px），则项目将占据固定空间。

5. flex

   是`flex-grow`, `flex-shrink` 和 `flex-basis`的简写，默认值为`0 1 auto`。后两个属性可选。

   该属性有两个快捷值：`auto` (`1 1 auto`) 和 none (`0 0 auto`)。

   建议优先使用这个属性，而不是单独写三个分离的属性，因为浏览器会推算相关值。

   **`flex: 1`和`flex: auto`区别**

   `flex: 1 -> flex: 1 1 0%`    `flex: auto -> flex: 1 1 auto`

   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width">
     <title>JS Bin</title>
   </head>
   <body>
   <div class="box box1">
     <div class="child a">1</div>
     <div class="child b">2</div>
     <div class="child c">3</div>
   </div>
   <div class="box box2">
     <div class="child a">1</div>
     <div class="child b">2</div>
     <div class="child c">3</div>
   </div>
   </body>
   </html>
   ```

   ```css
   .box {
     border: 1px solid black;
     display: flex;
     width: 200px;
   }
   .a {
     width: 100px;
   }
   .b {
     width: 50px;
   }
   .c {
     width: 10px;
   }
   
   .box1 .child {
     border: 1px solid red;
     flex: auto; /*1 1 auto ，如果设置了宽度flex-basis的值是width，子项平分取去掉flex-basis的剩余空间*/
   }
   .box2 .child {
     border: 1px solid red;
     flex: 1; /*1 1 0% ，不管是否设置宽度flex-basis的值是0，子项平分全部的父亲空间*/
   }
   ```

   ![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/屏幕截图2022-03-17164639.png)

6. align-self

   允许单个项目有与其他项目不一样的对齐方式，可覆盖`align-items`属性。默认值为`auto`，表示继承父元素的`align-items`(交叉轴对齐方式)属性，如果没有父元素，则等同于`stretch`。
