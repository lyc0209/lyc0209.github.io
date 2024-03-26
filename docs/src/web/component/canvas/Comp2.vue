<script lang="ts" setup>
import { onMounted } from "vue"

onMounted(() => {

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
})



</script>

<template>
  <div style="border: 1px dotted">
    <canvas id="canvas-comp2" width="320" height="240"></canvas>
  </div>
</template>

<style scoped lang="scss">

</style>