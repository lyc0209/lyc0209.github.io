<script lang="ts" setup>
import { onMounted } from "vue"

onMounted(() => {
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
})



</script>

<template>
  <div style="border: 1px dotted">
    <canvas id="canvas-comp1" width="320" height="240"></canvas>
  </div>
</template>

<style scoped lang="scss">

</style>