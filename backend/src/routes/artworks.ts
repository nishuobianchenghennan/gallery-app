import { Hono } from 'hono'
import type { Env, Artwork, JWTPayload } from '../types'
import { success, fail, generateFileName } from '../utils'
import { authMiddleware } from '../auth'

const artworkRouter = new Hono<{ Bindings: Env }>()

/**
 * 获取所有作品列表
 */
artworkRouter.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const pageSize = parseInt(c.req.query('pageSize') || '20')
    const offset = (page - 1) * pageSize

    const { results } = await c.env.DB.prepare(`
      SELECT
        a.id,
        a.user_id,
        a.image_url,
        a.title,
        a.description,
        a.create_time,
        a.update_time,
        u.username
      FROM artworks a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.create_time DESC
      LIMIT ? OFFSET ?
    `).bind(pageSize, offset).all()

    const artworks = results.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      username: row.username,
      imageUrl: row.image_url,
      title: row.title,
      description: row.description,
      createTime: row.create_time,
      updateTime: row.update_time
    }))

    return c.json(success(artworks))
  } catch (error: any) {
    console.error('获取作品列表失败:', error)
    return c.json(fail(500, '获取作品列表失败'))
  }
})

/**
 * 获取单个作品详情
 */
artworkRouter.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))

    const artwork = await c.env.DB.prepare(`
      SELECT
        a.id,
        a.user_id,
        a.image_url,
        a.title,
        a.description,
        a.create_time,
        a.update_time,
        u.username
      FROM artworks a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `).bind(id).first()

    if (!artwork) {
      return c.json(fail(404, '作品不存在'))
    }

    return c.json(success({
      id: artwork.id,
      userId: artwork.user_id,
      username: artwork.username,
      imageUrl: artwork.image_url,
      title: artwork.title,
      description: artwork.description,
      createTime: artwork.create_time,
      updateTime: artwork.update_time
    }))
  } catch (error: any) {
    console.error('获取作品详情失败:', error)
    return c.json(fail(500, '获取作品详情失败'))
  }
})

/**
 * 上传作品
 */
artworkRouter.post('/', authMiddleware, async (c) => {
  try {
    const userPayload = c.get('user') as JWTPayload
    const formData = await c.req.formData()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageFile = formData.get('image') as File

    // 参数验证
    if (!title || !description || !imageFile) {
      return c.json(fail(400, '标题、描述和图片不能为空'))
    }

    if (title.length > 100) {
      return c.json(fail(400, '标题长度不能超过100个字符'))
    }

    if (description.length < 10 || description.length > 2000) {
      return c.json(fail(400, '描述长度应在10-2000个字符之间'))
    }

    // 验证文件类型
    if (!imageFile.type.startsWith('image/')) {
      return c.json(fail(400, '只能上传图片文件'))
    }

    // 验证文件大小（10MB）
    if (imageFile.size > 10 * 1024 * 1024) {
      return c.json(fail(400, '图片大小不能超过10MB'))
    }

    // 生成文件名并上传到 R2
    const fileName = generateFileName(imageFile.name)
    const imageBuffer = await imageFile.arrayBuffer()

    await c.env.BUCKET.put(fileName, imageBuffer, {
      httpMetadata: {
        contentType: imageFile.type
      }
    })

    // 生成图片URL（需要配置R2的公共访问域名）
    const imageUrl = `https://your-r2-domain.com/${fileName}`

    // 插入作品记录
    const result = await c.env.DB.prepare(`
      INSERT INTO artworks (user_id, image_url, title, description)
      VALUES (?, ?, ?, ?)
    `).bind(userPayload.userId, imageUrl, title, description).run()

    // 获取插入的作品信息
    const artwork = await c.env.DB.prepare(`
      SELECT
        a.id,
        a.user_id,
        a.image_url,
        a.title,
        a.description,
        a.create_time,
        a.update_time,
        u.username
      FROM artworks a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `).bind(result.meta.last_row_id).first()

    return c.json(success({
      id: artwork.id,
      userId: artwork.user_id,
      username: artwork.username,
      imageUrl: artwork.image_url,
      title: artwork.title,
      description: artwork.description,
      createTime: artwork.create_time,
      updateTime: artwork.update_time
    }, '作品上传成功'))
  } catch (error: any) {
    console.error('上传作品失败:', error)
    return c.json(fail(500, '上传作品失败'))
  }
})

/**
 * 删除作品
 */
artworkRouter.delete('/:id', authMiddleware, async (c) => {
  try {
    const userPayload = c.get('user') as JWTPayload
    const id = parseInt(c.req.param('id'))

    // 查询作品
    const artwork = await c.env.DB.prepare(
      'SELECT * FROM artworks WHERE id = ?'
    ).bind(id).first<Artwork>()

    if (!artwork) {
      return c.json(fail(404, '作品不存在'))
    }

    // 验证权限
    if (artwork.user_id !== userPayload.userId) {
      return c.json(fail(403, '无权限删除此作品'))
    }

    // 从R2删除图片
    const fileName = artwork.image_url.split('/').pop()
    if (fileName) {
      await c.env.BUCKET.delete(fileName)
    }

    // 删除数据库记录
    await c.env.DB.prepare(
      'DELETE FROM artworks WHERE id = ?'
    ).bind(id).run()

    return c.json(success(null, '作品已删除'))
  } catch (error: any) {
    console.error('删除作品失败:', error)
    return c.json(fail(500, '删除作品失败'))
  }
})

export default artworkRouter
