<script setup lang="ts">
import { defineProps } from "vue"
import { type Blog } from "../../types/blog"

defineProps<{
  item: Blog
}>()
</script>

<template>
  <div class="card-container">
    <div class="card-title docs-title">{{ item.title }}</div>
    <div class="card-bottom docs-footer">
      <div>{{ item.date }}</div>
      <div>{{ item.tags.join(" ") }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-container {
  display: flex;
  flex-direction: column;
  margin: 10px;

  transition: all 0.2s linear;
  border-radius: 10px;
  padding: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 2, 4, 0.06), 0 0 1px rgba(0, 2, 4, 0.11);
  background: #fff;
  color: #2f3d4e;


  .card-title {
    font-weight: 700;
    font-size: 20px;
  }

  .card-bottom {
    margin-top: 10px;
    display: flex;

    & div + div {
      margin-left: 12px;
    }
  }
}
</style>
