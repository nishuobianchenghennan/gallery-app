import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from './types'
import authRouter from './routes/auth'
import artworkRouter from './routes/artworks'

const app = new Hono<{ Bindings: Env }>()

// CORS 中间件
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// 健康检查
app.get('/', (c) => {
  return c.json({
    message: '画廊 API 服务运行中',
    version: '1.0.0',
    timestamp: Date.now()
  })
})

// 路由注册
app.route('/api/auth', authRouter)
app.route('/api/user', authRouter)
app.route('/api/artworks', artworkRouter)

// 404 处理
app.notFound((c) => {
  return c.json({
    code: 404,
    message: '接口不存在',
    data: null,
    timestamp: Date.now()
  }, 404)
})

// 错误处理
app.onError((err, c) => {
  console.error('服务器错误:', err)
  return c.json({
    code: 500,
    message: '服务器内部错误',
    data: null,
    timestamp: Date.now()
  }, 500)
})

export default app
