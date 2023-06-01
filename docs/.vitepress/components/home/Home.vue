<script setup lang="ts">
import { ref } from "vue"
import BlogList from "./BlogList.vue"
import {computed} from "vue"

const pageInfo = ref({ page: 1, limit: 10, total: 1 })

const totalPage = computed(() => {
  return Math.ceil(pageInfo.value.total / pageInfo.value.limit)
})

const onPrePageClick = () => {
  pageInfo.value.page -= 1
}
const onNextPageClick = () => {
  pageInfo.value.page += 1
}

</script>

<template>
  <div class="home-container">
    <BlogList :pagination="pageInfo" />
    <div class="page-container">
      <div :class="{ 'docs-disabled': pageInfo.page <= 1 }" class="page-btn" @click="onPrePageClick">&lt;上一页</div>
      <div>{{ pageInfo.page }} / {{ totalPage }}</div>
      <div :class="{ 'docs-disabled': pageInfo.page >= totalPage }" class="page-btn" @click="onNextPageClick">下一页&gt;</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  .page-container {
    display: flex;
    justify-content: space-between;
    width: 70vw;
    margin-top: 1.5rem;

    .page-btn {
      cursor: pointer;

      //&:hover {
      //  color: red;
      //  transition-property: transform;
      //  transition-timing-function: ease-out;
      //  transition-duration: 300ms;
      //}
    }
  }
}
</style>
