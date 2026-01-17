import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { supabase } from '../../lib/db'
import { success, fail, isValidEmail, isValidUsername } from '../../lib/utils'

/**
 * 用户注册 API
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
    const { username, password, email } = req.body

    // 参数验证
    if (!username || !password || !email) {
      return res.status(400).json(fail(400, '用户名、密码和邮箱不能为空'))
    }

    if (!isValidUsername(username)) {
      return res.status(400).json(fail(400, '用户名只能包含字母、数字和下划线，长度3-20个字符'))
    }

    if (password.length < 6) {
      return res.status(400).json(fail(400, '密码长度至少6个字符'))
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(fail(400, '邮箱格式不正确'))
    }

    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return res.status(400).json(fail(400, '用户名已存在'))
    }

    // 检查邮箱是否已存在
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingEmail) {
      return res.status(400).json(fail(400, '邮箱已被注册'))
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10)

    // 插入用户
    const { error } = await supabase
      .from('users')
      .insert({
        username,
        password: hashedPassword,
        email
      })

    if (error) {
      throw error
    }

    return res.status(200).json(success(null, '注册成功'))
  } catch (error: any) {
    console.error('注册失败:', error)
    return res.status(500).json(fail(500, '注册失败'))
  }
}
