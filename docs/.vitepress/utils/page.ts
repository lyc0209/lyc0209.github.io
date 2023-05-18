export const splitToPage = <T = any>(page: number, limit: number, list: T[]) => {
  const offset = (page - 1) * limit
  return offset + limit >= list.length
    ? list.slice(offset, list.length)
    : list.slice(offset, offset + limit)
}
