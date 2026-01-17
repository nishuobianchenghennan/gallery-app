# Vercel + Supabase 部署指南

这是使用 Vercel 和 Supabase 替代 Cloudflare 的完整部署方案。

## 技术栈变更

| 组件 | Cloudflare 方案 | Vercel + Supabase 方案 |
|------|----------------|----------------------|
| 前端托管 | Cloudflare Pages | Vercel |
| 后端 | Cloudflare Workers | Vercel Serverless Functions |
| 数据库 | Cloudflare D1 (SQLite) | Supabase (PostgreSQL) |
| 对象存储 | Cloudflare R2 | Supabase Storage |
| 认证 | 自建 JWT | Supabase Auth（可选） |

## 优势

1. **国内访问友好**：Vercel 在国内速度快
2. **免费额度充足**：适合个人和小型项目
3. **功能更强大**：Supabase 提供实时订阅、行级安全等
4. **部署更简单**：一键部署，自动 HTTPS
5. **开发体验好**：本地开发工具完善

## 前置准备

### 1. 注册账号

- [Vercel](https://vercel.com/signup) - 使用 GitHub 账号登录
- [Supabase](https://supabase.com/) - 使用 GitHub 账号登录

### 2. 安装工具

```bash
# 安装 Vercel CLI（可选，用于本地开发）
npm install -g vercel

# 安装 Supabase CLI（可选）
npm install -g supabase
```

## 第一步：创建 Supabase 项目

### 1.1 创建项目

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 点击 **New Project**
3. 填写项目信息：
   - **Name**: `gallery-app`
   - **Database Password**: 设置强密码（记住它）
   - **Region**: 选择 **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)**
   - **Pricing Plan**: **Free**
4. 点击 **Create new project**
5. 等待项目创建（约 2 分钟）

### 1.2 创建数据库表

1. 进入项目后，点击左侧 **SQL Editor**
2. 点击 **New query**
3. 复制以下 SQL 并执行：

```sql
-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    create_time TIMESTAMPTZ DEFAULT NOW(),
    update_time TIMESTAMPTZ DEFAULT NOW()
);

-- 作品表
CREATE TABLE IF NOT EXISTS artworks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    create_time TIMESTAMPTZ DEFAULT NOW(),
    update_time TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_artworks_user_id ON artworks(user_id);
CREATE INDEX IF NOT EXISTS idx_artworks_create_time ON artworks(create_time DESC);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_time = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at BEFORE UPDATE ON artworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. 点击 **Run** 执行

### 1.3 配置存储桶

1. 点击左侧 **Storage**
2. 点击 **Create a new bucket**
3. 填写信息：
   - **Name**: `gallery-images`
   - **Public bucket**: ✅ 勾选（允许公共访问）
4. 点击 **Create bucket**

### 1.4 获取连接信息

1. 点击左侧 **Settings** → **API**
2. 记录以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`（很长的字符串）
   - **service_role key**: `eyJhbGc...`（用于后端）

## 第二步：修改后端代码

### 2.1 创建 Vercel Serverless Functions 版本

创建新的后端目录结构：

```bash
gallery-app/
├── api/                    # Vercel Functions
│   ├── auth/
│   │   ├── login.ts
│   │   └── register.ts
│   ├── user/
│   │   └── current.ts
│   └── artworks/
│       ├── index.ts
│       ├── [id].ts
│       └── upload.ts
├── frontend/               # 前端（不变）
└── lib/                    # 共享代码
    ├── db.ts              # Supabase 客户端
    ├── auth.ts            # JWT 认证
    └── utils.ts           # 工具函数
```

### 2.2 安装依赖

在项目根目录创建 `package.json`：

```json
{
  "name": "gallery-app",
  "version": "1.0.0",
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "bcryptjs": "^2.4.3",
    "jose": "^5.2.0",
    "formidable": "^3.5.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5.3.3"
  }
}
```

### 2.3 创建 Supabase 客户端

创建 `lib/db.ts`：

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 2.4 创建 API 路由

详细的 API 代码我会在后续文件中提供。

## 第三步：部署到 Vercel

### 3.1 通过 GitHub 部署（推荐）

1. 将代码推送到 GitHub
2. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 **Add New** → **Project**
4. 选择你的 GitHub 仓库
5. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
6. 添加环境变量：
   - `SUPABASE_URL`: 你的 Supabase URL
   - `SUPABASE_SERVICE_KEY`: 你的 service_role key
   - `JWT_SECRET`: 随机生成的密钥
7. 点击 **Deploy**

### 3.2 通过 CLI 部署

```bash
# 登录 Vercel
vercel login

# 部署
vercel

# 设置环境变量
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
vercel env add JWT_SECRET

# 生产部署
vercel --prod
```

## 第四步：配置前端

### 4.1 更新环境变量

编辑 `frontend/.env`：

```env
VITE_API_BASE_URL=/api
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4.2 更新 API 请求

前端代码基本不需要修改，只需要确保 API 路径正确。

## 第五步：测试部署

### 5.1 访问应用

部署完成后，Vercel 会提供一个 URL：
- `https://your-project.vercel.app`

### 5.2 测试功能

1. ✅ 用户注册
2. ✅ 用户登录
3. ✅ 上传作品
4. ✅ 查看画廊
5. ✅ 作品详情
6. ✅ 删除作品

## 配置自定义域名（可选）

### 在 Vercel 配置

1. 进入项目 **Settings** → **Domains**
2. 添加你的域名
3. 按照提示配置 DNS 记录

## 成本对比

### Vercel 免费套餐
- 100GB 带宽/月
- 无限请求
- 100GB-小时 Serverless Functions 执行时间

### Supabase 免费套餐
- 500MB 数据库存储
- 1GB 文件存储
- 50,000 月活用户
- 2GB 数据传输

**结论**: 对于个人画廊应用，免费套餐完全够用。

## 常见问题

### Q: Vercel 在国内访问速度如何？
A: Vercel 在国内访问速度较快，有 CDN 加速。如果需要更快，可以配置自定义域名并使用国内 CDN。

### Q: Supabase 数据库在哪里？
A: 选择 Tokyo 或 Singapore 区域，延迟较低。

### Q: 如何备份数据？
A: Supabase 提供自动备份，也可以手动导出 SQL。

### Q: 免费套餐有什么限制？
A: 主要是存储和带宽限制，对于小型应用完全够用。超出后可以升级付费套餐。

## 优化建议

1. **图片优化**: 使用 Supabase Image Transformation
2. **缓存策略**: 配置 Vercel Edge Caching
3. **CDN 加速**: 使用 Vercel CDN
4. **监控**: 使用 Vercel Analytics

## 技术支持

- [Vercel 文档](https://vercel.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Vercel 中文社区](https://vercel.com/zh)

---

**部署完成！** 享受 Vercel + Supabase 带来的便利吧！🎉
