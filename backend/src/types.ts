/**
 * Cloudflare Workers 环境变量类型
 */
export interface Env {
  DB: D1Database
  BUCKET: R2Bucket
  JWT_SECRET: string
}

/**
 * 用户数据库模型
 */
export interface User {
  id: number
  username: string
  password: string
  email: string
  create_time: string
  update_time: string
}

/**
 * 作品数据库模型
 */
export interface Artwork {
  id: number
  user_id: number
  image_url: string
  title: string
  description: string
  create_time: string
  update_time: string
}

/**
 * JWT Payload
 */
export interface JWTPayload {
  userId: number
  username: string
}

/**
 * API 响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}
