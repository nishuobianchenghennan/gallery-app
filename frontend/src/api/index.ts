import { request } from '@/utils/request'
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  UserInfo,
  Artwork,
  UploadArtworkRequest
} from '@/types'

/**
 * 用户相关API
 */
export const userApi = {
  /**
   * 用户登录
   */
  login(data: LoginRequest): Promise<LoginResponse> {
    return request.post('/auth/login', data)
  },

  /**
   * 用户注册
   */
  register(data: RegisterRequest): Promise<void> {
    return request.post('/auth/register', data)
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): Promise<UserInfo> {
    return request.get('/user/current')
  }
}

/**
 * 作品相关API
 */
export const artworkApi = {
  /**
   * 获取所有作品列表
   */
  getArtworks(page: number = 1, pageSize: number = 20): Promise<Artwork[]> {
    return request.get('/artworks', {
      params: { page, pageSize }
    })
  },

  /**
   * 获取单个作品详情
   */
  getArtworkById(id: number): Promise<Artwork> {
    return request.get(`/artworks/${id}`)
  },

  /**
   * 上传作品
   */
  async uploadArtwork(data: UploadArtworkRequest): Promise<Artwork> {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('image', data.image)

    return request.post('/artworks', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 删除作品
   */
  deleteArtwork(id: number): Promise<void> {
    return request.delete(`/artworks/${id}`)
  }
}
