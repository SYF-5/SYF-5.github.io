// src/utils/route.ts
/**
 * 安全获取路由查询参数中的字符串值
 */
export function getQueryString(query: string | string[] | undefined): string {
  if (typeof query === 'string') {
    return query
  }
  if (Array.isArray(query) && query.length > 0) {
    return query[0]
  }
  return ''
}

/**
 * 安全获取路由查询参数中的数字值
 */
export function getQueryNumber(query: string | string[] | undefined, defaultValue = 0): number {
  const str = getQueryString(query)
  const num = parseInt(str, 10)
  return isNaN(num) ? defaultValue : num
}

/**
 * 安全获取路由查询参数中的布尔值
 */
export function getQueryBoolean(query: string | string[] | undefined): boolean {
  const str = getQueryString(query)
  return str === 'true' || str === '1'
}