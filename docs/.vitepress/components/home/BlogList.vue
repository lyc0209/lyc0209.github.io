<script setup lang="ts">
import { useBlogHook } from "../../hook/useBlogHook"
import BlogItem from "./BlogItem.vue"
import {Page} from "../../types/blog"

const props = defineProps<{
  pagination: Page
}>()


const { blogList } = useBlogHook(props.pagination)
</script>

<template>
  <div class="blog-list-container">
    <template v-for="blog in blogList" :key="blog.link">
      <a :href="blog.link" style="text-decoration: none">
        <BlogItem :item="blog" />
      </a>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.blog-list-container {
  width: 70vw;
}
</style>
