import { createClient } from '@supabase/supabase-js'

/**
 * Supabase 客户端
 */
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

/**
 * 数据库类型定义
 */
export interface User {
  id: number
  username: string
  password: string
  email: string
  create_time: string
  update_time: string
}

export interface Artwork {
  id: number
  user_id: number
  image_url: string
  title: string
  description: string
  create_time: string
  update_time: string
}
