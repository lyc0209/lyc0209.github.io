---
{
"title": "Canvas",
"date": "2024-03-26",
"category": "技术",
"tags": ["web", "canvas"]
}
---

<script setup>
import Comp1 from "./component/canvas/Comp1.vue";
import Comp2 from "./component/canvas/Comp2.vue";
import Comp3 from "./component/canvas/Comp3.vue";
import Comp4 from "./component/canvas/Comp4.vue";
import Comp5 from "./component/canvas/Comp5.vue";
</script>

# Canvas

## 基本使用

在 HTML 文件中插入一个`<canvas>`元素，以界定网页中的绘图区域。



```html
<canvas width="320" height="240"></canvas>
```

确定canvas的尺寸，得到了一个充满窗口的画布

```js
const canvas = document.querySelector(".myCanvas")
const width = (canvas.width = window.innerWidth)
const height = (canvas.height = window.innerHeight)
```



获取画布上下文

`ctx` 变量包含一个 [`CanvasRenderingContext2D`](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D) 对象，画布上所有绘画操作都会涉及到这个对象。

```js
const ctx = canvas.getContext("2d")
```



绘制一个矩形：

```js
ctx.fillStyle = "rgb(0, 0, 0)"
ctx.fillRect(0, 0, width, height)
```



## 2D画布基础

绘制矩形、边框：

<Comp1 />

```ts
const canvas = document.querySelector("#canvas-comp1") as HTMLCanvasElement

const ctx = canvas.getContext("2d")

ctx.fillStyle = "rgb(220, 0, 0)"
ctx.fillRect(50, 50, 100, 150)

ctx.fillStyle = "rgba(255, 0, 255, 0.40)"
ctx.fillRect(25, 100, 175, 50)

// 绘制边框
ctx.strokeStyle = "#e6e6e6"
ctx.lineWidth = 5
ctx.strokeRect(25, 25, 175, 200)
```



绘制线条：

<Comp2 />

```ts
const degToRad = (degrees: number) => {
    return (degrees * Math.PI) / 180
}

const canvas = document.querySelector("#canvas-comp2") as HTMLCanvasElement

const ctx = canvas.getContext("2d")

ctx.fillStyle = "rgb(220, 0, 0)"
ctx.beginPath()
ctx.moveTo(50, 50)
ctx.lineTo(150, 50)
const triHeight = 50 * Math.tan(degToRad(60))
ctx.lineTo(100, 50 + triHeight)
ctx.lineTo(50, 50)
ctx.fill()


ctx.fillStyle = 'rgb(0, 0, 220)'
ctx.beginPath()
ctx.arc(150, 106, 50, degToRad(0), degToRad(360), false)
ctx.fill()


ctx.fillStyle = 'rgb(220, 220, 0)'
ctx.beginPath()
ctx.arc(200, 106, 50, degToRad(-45), degToRad(45), true)
ctx.lineTo(200, 106)
ctx.fill()
```


绘制文本：

<Comp3 />

```ts
const canvas = document.querySelector("#canvas-comp3") as HTMLCanvasElement

const ctx = canvas.getContext("2d")

ctx.strokeStyle = "black"
ctx.lineWidth = 1
ctx.font = "36px arial"
ctx.strokeText("Canvas text", 50, 50)

ctx.fillStyle = "red"
ctx.font = "48px georgia"
ctx.fillText("Canvas text", 50, 150)

const image = new Image()
image.src = "blogqrcode_icon.png"
image.onload = function () {
ctx.drawImage(image, 50, 50)
}
```


循环：

<Comp4 />

```ts
const canvas = document.querySelector("#canvas-comp4") as HTMLCanvasElement

const ctx = canvas.getContext("2d")

ctx.translate(canvas.width / 2, canvas.height / 2)

const degToRad = (degrees: number) => {
return (degrees * Math.PI) / 180
}

let length = 250
let moveOffset = 20

for (let i = 0; i < length; i++) {
ctx.fillStyle =
    "rgba(" + (255 - length) + ", 0, " + (255 - length) + ", 0.9)";
ctx.beginPath()
ctx.moveTo(moveOffset, moveOffset)
ctx.lineTo(moveOffset + length, moveOffset)
const triHeight = (length / 2) * Math.tan(degToRad(60))
ctx.lineTo(moveOffset + length / 2, moveOffset + triHeight)
ctx.lineTo(moveOffset, moveOffset)
ctx.fill()

length--
moveOffset += 0.7
ctx.rotate(degToRad(5))
}
```


动画：
<Comp5 />

```ts
const canvas = document.querySelector("#canvas-comp5") as HTMLCanvasElement

const ctx = canvas.getContext("2d")

const width = canvas.width
const height = canvas.height

function random(min, max) {
return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function to generate random RGB color value

function randomRGB() {
return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

class Ball {
x: any
y: any
velX: any
velY: any
color: any
size: any
constructor(x, y, velX, velY, color, size) {
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.color = color;
  this.size = size;
}

draw() {
  ctx.beginPath();
  ctx.fillStyle = this.color;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.fill();
}

update() {
  if (this.x + this.size >= width) {
    this.velX = -Math.abs(this.velX);
  }

  if (this.x - this.size <= 0) {
    this.velX = Math.abs(this.velX);
  }

  if (this.y + this.size >= height) {
    this.velY = -Math.abs(this.velY);
  }

  if (this.y - this.size <= 0) {
    this.velY = Math.abs(this.velY);
  }

  this.x += this.velX;
  this.y += this.velY;
}

collisionDetect() {
  for (const ball of balls) {
    if (!(this === ball)) {
      const dx = this.x - ball.x;
      const dy = this.y - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size + ball.size) {
        ball.color = this.color = randomRGB();
      }
    }
  }
}
}

const balls = [];

while (balls.length < 25) {
const size = random(10, 20)
const ball = new Ball(
    // ball position always drawn at least one ball width
    // away from the edge of the canvas, to avoid drawing errors
    random(0 + size, width - size),
    random(0 + size, height - size),
    random(-7, 7),
    random(-7, 7),
    randomRGB(),
    size
);

balls.push(ball)
}


function loop() {
ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
ctx.fillRect(0, 0, width, height)

for (const ball of balls) {
  ball.draw()
  ball.update()
  ball.collisionDetect()
}

requestAnimationFrame(loop)
}

loop()
```