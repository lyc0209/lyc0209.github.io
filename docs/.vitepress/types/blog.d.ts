export interface Blog {
  title: string
  date: string
  category: string
  tags: string[]
  link: string
  isHiddenAtIndex?: boolean
}

export interface Page {
  page: number
  limit: number
  total: number
}
