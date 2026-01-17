# 画廊应用

<div align="center">

一个支持多平台部署的现代化画廊应用

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Supported-black)](https://vercel.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green)](https://vuejs.org/)

[在线演示](#) | [快速开始](QUICKSTART.md) | [平台选择](PLATFORM_COMPARISON.md)

</div>

## ✨ 特性

- 🔐 **用户认证**: 完整的注册、登录系统，JWT Token 认证
- 🖼️ **作品上传**: 支持图片上传，记录作画心得感悟
- 🎨 **画廊展示**: 瀑布流式卡片展示，所有用户共享画廊
- 📱 **响应式设计**: 适配各种屏幕尺寸
- ⚡ **全球 CDN**: 全球加速，访问速度快
- 💰 **零成本**: 使用免费套餐即可运行
- 🚀 **自动部署**: 通过 GitHub 实现 CI/CD
- 🌍 **多平台支持**: Cloudflare、Vercel、Railway 等

## 🎯 选择部署平台

### Cloudflare D1 无法创建？

如果你在使用 Cloudflare D1 时遇到问题，我们提供了多个优秀的替代方案：

| 平台 | 推荐指数 | 国内访问 | 免费额度 | 部署难度 |
|------|---------|---------|---------|---------|
| **Vercel + Supabase** ⭐ | ⭐⭐⭐⭐⭐ | ✅ 优秀 | 充足 | 简单 |
| **Cloudflare** | ⭐⭐⭐⭐ | ⚠️ 一般 | 充足 | 中等 |
| **Railway** | ⭐⭐⭐⭐ | ✅ 良好 | $5/月 | 简单 |

**详细对比**: [平台对比指南](PLATFORM_COMPARISON.md)

## 📚 部署文档

### 推荐方案（国内用户）

- **[Vercel + Supabase 部署指南](DEPLOY_VERCEL_SUPABASE.md)** ⭐ 最推荐
  - 国内访问速度快
  - 免费额度充足
  - 部署简单
  - 功能强大

### 其他方案

- **[Cloudflare 部署指南](DEPLOY.md)** - 如果 D1 可用
- **[平台对比指南](PLATFORM_COMPARISON.md)** - 选择最适合你的平台
- **[快速开始](QUICKSTART.md)** - 5分钟快速部署
- **[部署检查清单](CHECKLIST.md)** - 确保部署成功

## 🚀 快速开始

### 方式一：Vercel + Supabase（推荐）

1. 注册 Vercel 和 Supabase 账号
2. 在 Supabase 创建项目和数据库
3. 推送代码到 GitHub
4. 在 Vercel 连接 GitHub 仓库
5. 配置环境变量，自动部署

详细步骤：[Vercel + Supabase 部署指南](DEPLOY_VERCEL_SUPABASE.md)

### 方式二：Cloudflare 全家桶

1. Fork 本仓库到你的 GitHub
2. 在 Cloudflare 创建 D1 数据库和 R2 存储桶
3. 配置 GitHub Secrets
4. 推送代码，自动部署

详细步骤：[Cloudflare 部署指南](DEPLOY.md)

## 技术栈

### 前端
- Vue 3 + TypeScript
- Vite
- Element Plus
- Pinia (状态管理)
- Vue Router
- Axios

### 后端
- Cloudflare Workers (无服务器)
- Hono (Web 框架)
- Cloudflare D1 (SQLite 数据库)
- Cloudflare R2 (对象存储)
- JWT 认证

## 项目结构

```
gallery-app/
├── frontend/           # 前端项目
│   ├── src/
│   │   ├── api/       # API 接口
│   │   ├── router/    # 路由配置
│   │   ├── stores/    # Pinia 状态管理
│   │   ├── types/     # TypeScript 类型
│   │   ├── utils/     # 工具函数
│   │   ├── views/     # 页面组件
│   │   ├── App.vue
│   │   └── main.ts
│   ├── package.json
│   └── vite.config.ts
├── backend/            # 后端项目
│   ├── src/
│   │   ├── routes/    # 路由处理
│   │   ├── auth.ts    # JWT 认证
│   │   ├── types.ts   # 类型定义
│   │   ├── utils.ts   # 工具函数
│   │   └── index.ts   # 入口文件
│   ├── package.json
│   └── wrangler.toml  # Cloudflare 配置
└── database/
    └── schema.sql      # 数据库表结构
```

## 部署步骤

### 1. 前置准备

#### 1.1 安装依赖
- Node.js 18+
- npm 或 pnpm
- Cloudflare 账号

#### 1.2 安装 Wrangler CLI
```bash
npm install -g wrangler
```

#### 1.3 登录 Cloudflare
```bash
wrangler login
```

### 2. 部署后端

#### 2.1 创建 D1 数据库
```bash
cd backend
wrangler d1 create gallery-db
```

记录输出的 `database_id`，更新 `wrangler.toml` 中的 `database_id`。

#### 2.2 初始化数据库表
```bash
wrangler d1 execute gallery-db --file=../database/schema.sql
```

#### 2.3 创建 R2 存储桶
```bash
wrangler r2 bucket create gallery-images
```

#### 2.4 配置 R2 公共访问

1. 登录 Cloudflare Dashboard
2. 进入 R2 -> gallery-images
3. 设置 -> 公共访问 -> 启用
4. 记录公共访问域名（例如：`https://pub-xxxxx.r2.dev`）
5. 更新 `backend/src/routes/artworks.ts` 中的 `imageUrl` 生成逻辑

#### 2.5 配置环境变量

编辑 `backend/wrangler.toml`：
```toml
[vars]
JWT_SECRET = "your-secure-random-secret-key"  # 修改为强密码
```

#### 2.6 安装依赖并部署
```bash
cd backend
npm install
wrangler deploy
```

记录部署后的 Worker URL（例如：`https://gallery-backend.your-subdomain.workers.dev`）

### 3. 部署前端

#### 3.1 配置 API 地址

编辑 `frontend/.env`：
```env
VITE_API_BASE_URL=https://gallery-backend.your-subdomain.workers.dev/api
```

#### 3.2 安装依赖并构建
```bash
cd frontend
npm install
npm run build
```

#### 3.3 部署到 Cloudflare Pages

方式一：使用 Wrangler
```bash
wrangler pages deploy dist --project-name=gallery-frontend
```

方式二：通过 Dashboard
1. 登录 Cloudflare Dashboard
2. Pages -> 创建项目
3. 连接 Git 仓库或上传 `dist` 文件夹
4. 构建设置：
   - 构建命令：`npm run build`
   - 构建输出目录：`dist`
   - 环境变量：`VITE_API_BASE_URL`

### 4. 配置 CORS（如果需要）

如果前后端域名不同，确保后端 CORS 配置正确（已在代码中配置）。

## 本地开发

### 启动后端
```bash
cd backend
npm install
npm run dev
```

后端将运行在 `http://localhost:8787`

### 启动前端
```bash
cd frontend
npm install
npm run dev
```

前端将运行在 `http://localhost:3000`

## 功能说明

### 1. 用户认证
- 用户注册：用户名、邮箱、密码
- 用户登录：JWT Token 认证
- Token 有效期：7天

### 2. 作品管理
- 上传作品：标题、图片、作画心得（需登录）
- 查看画廊：所有用户共享的作品列表
- 作品详情：查看完整的作品信息
- 删除作品：仅作者可删除自己的作品

### 3. 图片存储
- 存储位置：Cloudflare R2
- 文件大小限制：10MB
- 支持格式：JPG、PNG、GIF 等

## 数据库表结构

### users 表
- id: 主键
- username: 用户名（唯一）
- password: 密码（bcrypt 加密）
- email: 邮箱（唯一）
- create_time: 创建时间
- update_time: 更新时间

### artworks 表
- id: 主键
- user_id: 用户ID（外键）
- image_url: 图片URL
- title: 作品标题
- description: 作画心得感悟
- create_time: 创建时间
- update_time: 更新时间

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/user/current` - 获取当前用户信息（需认证）

### 作品接口
- `GET /api/artworks` - 获取作品列表
- `GET /api/artworks/:id` - 获取作品详情
- `POST /api/artworks` - 上传作品（需认证）
- `DELETE /api/artworks/:id` - 删除作品（需认证）

## 安全注意事项

1. **JWT Secret**: 生产环境必须使用强随机密钥
2. **密码加密**: 使用 bcrypt 加密存储
3. **文件验证**: 验证文件类型和大小
4. **权限控制**: 仅作者可删除自己的作品
5. **SQL 注入**: 使用参数化查询防止 SQL 注入

## 常见问题

### Q: 图片上传后无法显示？
A: 检查 R2 存储桶是否启用公共访问，并确认 `imageUrl` 使用正确的公共域名。

### Q: 登录后刷新页面需要重新登录？
A: Token 已存储在 localStorage，检查前端路由守卫是否正确加载用户信息。

### Q: CORS 错误？
A: 确保后端 CORS 配置包含前端域名，或使用通配符 `*`（仅开发环境）。

### Q: 数据库查询失败？
A: 检查 D1 数据库是否正确绑定到 Worker，表结构是否正确创建。

## 成本估算

Cloudflare 免费套餐包含：
- Workers: 100,000 请求/天
- D1: 5GB 存储 + 500万行读取/天
- R2: 10GB 存储 + 1000万次读取/月
- Pages: 无限请求

对于小型画廊应用，免费套餐完全够用。

## 后续优化建议

1. **图片优化**: 添加图片压缩和缩略图生成
2. **分页加载**: 实现无限滚动或分页
3. **搜索功能**: 按标题或作者搜索作品
4. **点赞评论**: 添加社交互动功能
5. **用户主页**: 展示用户的所有作品
6. **图片CDN**: 使用 Cloudflare Images 优化图片加载
7. **监控告警**: 配置 Cloudflare Analytics 监控

## 技术支持

如有问题，请查看：
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Vue 3 文档](https://vuejs.org/)
- [Hono 文档](https://hono.dev/)
