<script lang="ts" setup>
import { onMounted } from "vue"

onMounted(() => {
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

})



</script>

<template>
  <div style="border: 1px dotted">
    <canvas id="canvas-comp4" width="320" height="240"></canvas>
  </div>
</template>

<style scoped lang="scss">

</style>