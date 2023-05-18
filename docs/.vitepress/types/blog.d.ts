export interface Blog {
  title: string
  date: string
  category: string
  tags: string[]
  link: string
}

export interface Page {
  page: number
  limit: number
  total: number
}
