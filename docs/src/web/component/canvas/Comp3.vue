<script lang="ts" setup>
import { onMounted } from "vue"

onMounted(() => {
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
  image.src = "https://cdn.jsdelivr.net/gh/lyc0209/pic/blogqrcode_icon.png"
  image.onload = function () {
    ctx.drawImage(image, 50, 50)
  }
})



</script>

<template>
  <div style="border: 1px dotted">
    <canvas id="canvas-comp3" width="320" height="240"></canvas>
  </div>
</template>

<style scoped lang="scss">

</style>