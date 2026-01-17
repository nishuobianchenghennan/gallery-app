import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../lib/db'
import { getUserFromRequest } from '../../lib/auth'
import { success, fail } from '../../lib/utils'
import type { User } from '../../lib/db'

/**
 * 获取当前用户信息 API
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json(fail(405, '方法不允许'))
  }

  try {
    // 验证用户身份
    const userPayload = await getUserFromRequest(req)
    if (!userPayload) {
      return res.status(401).json(fail(401, '未认证'))
    }

    // 查询用户信息
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, create_time')
      .eq('id', userPayload.userId)
      .single<User>()

    if (error || !user) {
      return res.status(404).json(fail(404, '用户不存在'))
    }

    return res.status(200).json(success({
      id: user.id,
      username: user.username,
      email: user.email,
      createTime: user.create_time
    }))
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    return res.status(500).json(fail(500, '获取用户信息失败'))
  }
}
