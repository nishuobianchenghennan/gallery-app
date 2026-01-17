import { Context, Next } from 'hono'
import { SignJWT, jwtVerify } from 'jose'
import type { Env, JWTPayload } from './types'
import { fail } from './utils'

/**
 * 生成 JWT Token
 */
export async function generateToken(payload: JWTPayload, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const secretKey = encoder.encode(secret)

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)

  return token
}

/**
 * 验证 JWT Token
 */
export async function verifyToken(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const encoder = new TextEncoder()
    const secretKey = encoder.encode(secret)

    const { payload } = await jwtVerify(token, secretKey)
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * JWT 认证中间件
 */
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(fail(401, '未认证'), 401)
  }

  const token = authHeader.substring(7)
  const payload = await verifyToken(token, c.env.JWT_SECRET)

  if (!payload) {
    return c.json(fail(401, 'Token无效或已过期'), 401)
  }

  // 将用户信息存储到上下文中
  c.set('user', payload)

  await next()
}
