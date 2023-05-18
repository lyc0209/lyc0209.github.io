import list from "../docs.json"
import {Blog, Page} from "../types/blog"
import {ref, watchEffect} from "vue"
import {splitToPage} from "../utils/page"
export const useBlogHook = (pagination: Page) => {
  const allBlogList: Blog[] = list
  allBlogList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const categories = new Set()
  const tags = new Set()
  let docNum = 0, tagNum = 0, categoryNum = 0
  allBlogList.map(item => {
    docNum++
    if (item.category) {
      categories.add(item.category)
    }
    if (item.tags) {
      item.tags.map(c => {
        tags.add(c)
      })
    }
  })
  tagNum = tags.size
  categoryNum = categories.size
  pagination.total = docNum

  let blogList = ref<Blog[]>([])
  watchEffect(() => {
    blogList.value = splitToPage(pagination.page, pagination.limit, allBlogList)
  })

  return {
    blogList, categories, tags, docNum, tagNum, categoryNum
  }
}
