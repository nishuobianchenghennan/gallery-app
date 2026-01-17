import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { supabase } from '../../lib/db'
import { generateToken } from '../../lib/auth'
import { success, fail } from '../../lib/utils'
import type { User } from '../../lib/db'

/**
 * 用户登录 API
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json(fail(405, '方法不允许'))
  }

  try {
    const { username, password } = req.body

    // 参数验证
    if (!username || !password) {
      return res.status(400).json(fail(400, '用户名和密码不能为空'))
    }

    // 查询用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single<User>()

    if (error || !user) {
      return res.status(400).json(fail(400, '用户名或密码错误'))
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json(fail(400, '用户名或密码错误'))
    }

    // 生成 Token
    const token = await generateToken({
      userId: user.id,
      username: user.username
    })

    return res.status(200).json(success({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createTime: user.create_time
      }
    }, '登录成功'))
  } catch (error: any) {
    console.error('登录失败:', error)
    return res.status(500).json(fail(500, '登录失败'))
  }
}
