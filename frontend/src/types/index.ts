/**
 * 用户信息
 */
export interface UserInfo {
  id: number
  username: string
  email: string
  createTime: string
}

/**
 * 登录请求
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  username: string
  password: string
  email: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string
  user: UserInfo
}

/**
 * 作品信息
 */
export interface Artwork {
  id: number
  userId: number
  username: string
  imageUrl: string
  title: string
  description: string
  createTime: string
  updateTime: string
}

/**
 * 上传作品请求
 */
export interface UploadArtworkRequest {
  title: string
  description: string
  image: File
}

/**
 * API 统一响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}
