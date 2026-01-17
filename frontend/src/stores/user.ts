import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginRequest, RegisterRequest } from '@/types'
import { userApi } from '@/api'

/**
 * 用户状态管理
 */
export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)

  /**
   * 设置Token
   */
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  /**
   * 设置用户信息
   */
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  /**
   * 用户登录
   */
  const login = async (data: LoginRequest) => {
    const response = await userApi.login(data)
    setToken(response.token)
    setUserInfo(response.user)
  }

  /**
   * 用户注册
   */
  const register = async (data: RegisterRequest) => {
    await userApi.register(data)
  }

  /**
   * 获取当前用户信息
   */
  const fetchCurrentUser = async () => {
    if (!token.value) return
    try {
      const user = await userApi.getCurrentUser()
      setUserInfo(user)
    } catch (error) {
      // Token无效，清除登录状态
      logout()
    }
  }

  /**
   * 用户登出
   */
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    setToken,
    setUserInfo,
    login,
    register,
    fetchCurrentUser,
    logout
  }
})
