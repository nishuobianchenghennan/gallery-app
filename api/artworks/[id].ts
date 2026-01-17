import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../lib/db'
import { getUserFromRequest } from '../../lib/auth'
import { success, fail } from '../../lib/utils'

/**
 * 作品详情 API
 * GET: 获取作品详情
 * DELETE: 删除作品
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const id = parseInt(req.query.id as string)

  if (!id || isNaN(id)) {
    return res.status(400).json(fail(400, '作品ID无效'))
  }

  if (req.method === 'GET') {
    return handleGetArtwork(id, req, res)
  }

  if (req.method === 'DELETE') {
    return handleDeleteArtwork(id, req, res)
  }

  return res.status(405).json(fail(405, '方法不允许'))
}

/**
 * 获取作品详情
 */
async function handleGetArtwork(id: number, req: VercelRequest, res: VercelResponse) {
  try {
    const { data: artwork, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error || !artwork) {
      return res.status(404).json(fail(404, '作品不存在'))
    }

    return res.status(200).json(success({
      id: artwork.id,
      userId: artwork.user_id,
      username: artwork.users?.username || '未知用户',
      imageUrl: artwork.image_url,
      title: artwork.title,
      description: artwork.description,
      createTime: artwork.create_time,
      updateTime: artwork.update_time
    }))
  } catch (error: any) {
    console.error('获取作品详情失败:', error)
    return res.status(500).json(fail(500, '获取作品详情失败'))
  }
}

/**
 * 删除作品
 */
async function handleDeleteArtwork(id: number, req: VercelRequest, res: VercelResponse) {
  try {
    // 验证用户身份
    const userPayload = await getUserFromRequest(req)
    if (!userPayload) {
      return res.status(401).json(fail(401, '未认证'))
    }

    // 查询作品
    const { data: artwork, error: queryError } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', id)
      .single()

    if (queryError || !artwork) {
      return res.status(404).json(fail(404, '作品不存在'))
    }

    // 验证权限
    if (artwork.user_id !== userPayload.userId) {
      return res.status(403).json(fail(403, '无权限删除此作品'))
    }

    // 从 Storage 删除图片
    const fileName = artwork.image_url.split('/').pop()
    if (fileName) {
      await supabase.storage
        .from('gallery-images')
        .remove([fileName])
    }

    // 删除数据库记录
    const { error: deleteError } = await supabase
      .from('artworks')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return res.status(200).json(success(null, '作品已删除'))
  } catch (error: any) {
    console.error('删除作品失败:', error)
    return res.status(500).json(fail(500, '删除作品失败'))
  }
}
