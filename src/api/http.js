// ==========================
// http.js：统一封装 HTTP 请求（基于 fetch）
// ==========================
// 作用：
// 1. 提供一个通用的 request() 函数（支持 GET / POST / baseURL / timeout / 自动 JSON 解析）
// 2. 目前项目所有页面/业务层不要直接用 fetch，只通过这里暴露的 request/get/post
// 3. 未来接入真实后端时，只需要：
//    - 修改 baseURL 为真实后端地址
//    - 或者在 request() 中补充统一的鉴权头 / 错误处理
//    - 页面和 api/student.js 不需要改接口调用方式

const DEFAULT_TIMEOUT = 8000 // 默认超时时间 8 秒（简单实现）

// 基础地址：
// - 开发阶段可以留空 ''（等于相对路径）
// - 接入真实后端时改成 'https://api.xxx.com' 或 '/api'
export const BASE_URL = ''

/**
 * 通用请求函数
 * @param {string} url 相对路径，例如 '/student/today-lesson'
 * @param {Object} options 其他配置
 *  - method: 'GET' | 'POST'（默认 GET）
 *  - params: Object（仅 GET 使用，自动拼接到 query string）
 *  - data: Object（POST/PUT 请求 body，自动 JSON.stringify）
 *  - timeout: number（可选，毫秒，不传则用默认 8000ms）
 *  - headers: Object（可选，额外 header）
 * @returns {Promise<any>} 解析后的数据（默认按 JSON 解析）
 */
export async function request(url, options = {}) {
  const {
    method = 'GET',
    params,
    data,
    timeout = DEFAULT_TIMEOUT,
    headers = {}
  } = options

  // 拼接 baseURL + url，避免重复斜杠
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`
  let fullUrl = `${BASE_URL}${normalizedUrl}`

  // 处理 GET 查询参数（params）
  if (params && method.toUpperCase() === 'GET') {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
    }
  }

  // 超时控制（简单版）
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort()
  }, timeout)

  try {
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      signal: controller.signal
    }

    // 非 GET 请求携带 body
    if (method.toUpperCase() !== 'GET' && data !== undefined) {
      fetchOptions.body = JSON.stringify(data)
    }

    const res = await fetch(fullUrl, fetchOptions)

    // HTTP 状态码统一错误处理：不是 2xx 就抛错
    if (!res.ok) {
      const error = new Error(`Request failed with status ${res.status}`)
      error.status = res.status
      error.statusText = res.statusText
      throw error
    }

    // 自动 JSON 解析：如果响应有内容并且 Content-Type 包含 json
    const contentType = res.headers.get('Content-Type') || ''
    if (contentType.includes('application/json')) {
      // 204 无内容、或 body 为空时，直接返回 null
      if (res.status === 204) return null
      return await res.json()
    }

    // 非 JSON 的情况，返回文本
    const text = await res.text()
    return text || null
  } catch (err) {
    // 统一以 Error 抛出，让调用方在 api 层/页面层 catch
    if (err.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw err instanceof Error ? err : new Error(String(err))
  } finally {
    clearTimeout(timer)
  }
}

/**
 * GET 简写
 */
export function get(url, params, options = {}) {
  return request(url, {
    ...options,
    method: 'GET',
    params
  })
}

/**
 * POST 简写
 */
export function post(url, data, options = {}) {
  return request(url, {
    ...options,
    method: 'POST',
    data
  })
}