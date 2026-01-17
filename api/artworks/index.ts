import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../lib/db'
import { getUserFromRequest } from '../../lib/auth'
import { success, fail, generateFileName } from '../../lib/utils'
import formidable from 'formidable'
import fs from 'fs'

/**
 * 作品 API
 * GET: 获取作品列表
 * POST: 上传作品
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    return handleGetArtworks(req, res)
  }

  if (req.method === 'POST') {
    return handleUploadArtwork(req, res)
  }

  return res.status(405).json(fail(405, '方法不允许'))
}

/**
 * 获取作品列表
 */
async function handleGetArtworks(req: VercelRequest, res: VercelResponse) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 20
    const offset = (page - 1) * pageSize

    // 查询作品列表（联表查询用户信息）
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select(`
        id,
        user_id,
        image_url,
        title,
        description,
        create_time,
        update_time,
        users (username)
      `)
      .order('create_time', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      throw error
    }

    // 格式化数据
    const formattedArtworks = artworks.map((artwork: any) => ({
      id: artwork.id,
      userId: artwork.user_id,
      username: artwork.users?.username || '未知用户',
      imageUrl: artwork.image_url,
      title: artwork.title,
      description: artwork.description,
      createTime: artwork.create_time,
      updateTime: artwork.update_time
    }))

    return res.status(200).json(success(formattedArtworks))
  } catch (error: any) {
    console.error('获取作品列表失败:', error)
    return res.status(500).json(fail(500, '获取作品列表失败'))
  }
}

/**
 * 上传作品
 */
async function handleUploadArtwork(req: VercelRequest, res: VercelResponse) {
  try {
    // 验证用户身份
    const userPayload = await getUserFromRequest(req)
    if (!userPayload) {
      return res.status(401).json(fail(401, '未认证'))
    }

    // 解析表单数据
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true
    })

    const [fields, files] = await form.parse(req)

    const title = fields.title?.[0]
    const description = fields.description?.[0]
    const imageFile = files.image?.[0]

    // 参数验证
    if (!title || !description || !imageFile) {
      return res.status(400).json(fail(400, '标题、描述和图片不能为空'))
    }

    if (title.length > 100) {
      return res.status(400).json(fail(400, '标题长度不能超过100个字符'))
    }

    if (description.length < 10 || description.length > 2000) {
      return res.status(400).json(fail(400, '描述长度应在10-2000个字符之间'))
    }

    // 验证文件类型
    if (!imageFile.mimetype?.startsWith('image/')) {
      return res.status(400).json(fail(400, '只能上传图片文件'))
    }

    // 生成文件名
    const fileName = generateFileName(imageFile.originalFilename || 'image.jpg')

    // 读取文件内容
    const fileBuffer = fs.readFileSync(imageFile.filepath)

    // 上传到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(fileName, fileBuffer, {
        contentType: imageFile.mimetype || 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    // 获取公共 URL
    const { data: urlData } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(fileName)

    const imageUrl = urlData.publicUrl

    // 插入作品记录
    const { data: artwork, error: insertError } = await supabase
      .from('artworks')
      .insert({
        user_id: userPayload.userId,
        image_url: imageUrl,
        title,
        description
      })
      .select(`
        id,
        user_id,
        image_url,
        title,
        description,
        create_time,
        update_time,
        users (username)
      `)
      .single()

    if (insertError) {
      throw insertError
    }

    // 删除临时文件
    fs.unlinkSync(imageFile.filepath)

    return res.status(200).json(success({
      id: artwork.id,
      userId: artwork.user_id,
      username: artwork.users?.username,
      imageUrl: artwork.image_url,
      title: artwork.title,
      description: artwork.description,
      createTime: artwork.create_time,
      updateTime: artwork.update_time
    }, '作品上传成功'))
  } catch (error: any) {
    console.error('上传作品失败:', error)
    return res.status(500).json(fail(500, '上传作品失败'))
  }
}
