/**
 * API 响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

/**
 * 成功响应
 */
export function success<T>(data: T, message: string = '操作成功'): ApiResponse<T> {
  return {
    code: 200,
    message,
    data,
    timestamp: Date.now()
  }
}

/**
 * 失败响应
 */
export function fail(code: number, message: string): ApiResponse<null> {
  return {
    code,
    message,
    data: null,
    timestamp: Date.now()
  }
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证用户名格式
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

/**
 * 生成随机文件名
 */
export function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${random}.${ext}`
}
