import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import type { Env, User, JWTPayload } from './types'
import { success, fail, isValidEmail, isValidUsername } from './utils'
import { generateToken, authMiddleware } from './auth'

const authRouter = new Hono<{ Bindings: Env }>()

/**
 * 用户注册
 */
authRouter.post('/register', async (c) => {
  try {
    const { username, password, email } = await c.req.json()

    // 参数验证
    if (!username || !password || !email) {
      return c.json(fail(400, '用户名、密码和邮箱不能为空'))
    }

    if (!isValidUsername(username)) {
      return c.json(fail(400, '用户名只能包含字母、数字和下划线，长度3-20个字符'))
    }

    if (password.length < 6) {
      return c.json(fail(400, '密码长度至少6个字符'))
    }

    if (!isValidEmail(email)) {
      return c.json(fail(400, '邮箱格式不正确'))
    }

    // 检查用户名是否已存在
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE username = ?'
    ).bind(username).first()

    if (existingUser) {
      return c.json(fail(400, '用户名已存在'))
    }

    // 检查邮箱是否已存在
    const existingEmail = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existingEmail) {
      return c.json(fail(400, '邮箱已被注册'))
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10)

    // 插入用户
    await c.env.DB.prepare(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)'
    ).bind(username, hashedPassword, email).run()

    return c.json(success(null, '注册成功'))
  } catch (error: any) {
    console.error('注册失败:', error)
    return c.json(fail(500, '注册失败'))
  }
})

/**
 * 用户登录
 */
authRouter.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json()

    // 参数验证
    if (!username || !password) {
      return c.json(fail(400, '用户名和密码不能为空'))
    }

    // 查询用户
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE username = ?'
    ).bind(username).first<User>()

    if (!user) {
      return c.json(fail(400, '用户名或密码错误'))
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return c.json(fail(400, '用户名或密码错误'))
    }

    // 生成 Token
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username
    }
    const token = await generateToken(payload, c.env.JWT_SECRET)

    return c.json(success({
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
    return c.json(fail(500, '登录失败'))
  }
})

/**
 * 获取当前用户信息
 */
authRouter.get('/current', authMiddleware, async (c) => {
  try {
    const userPayload = c.get('user') as JWTPayload

    const user = await c.env.DB.prepare(
      'SELECT id, username, email, create_time FROM users WHERE id = ?'
    ).bind(userPayload.userId).first<User>()

    if (!user) {
      return c.json(fail(404, '用户不存在'))
    }

    return c.json(success({
      id: user.id,
      username: user.username,
      email: user.email,
      createTime: user.create_time
    }))
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    return c.json(fail(500, '获取用户信息失败'))
  }
})

export default authRouter
