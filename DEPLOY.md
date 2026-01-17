# GitHub + Cloudflare 自动部署指南

本指南将帮助你通过 GitHub 和 Cloudflare 实现画廊应用的自动部署，无需本地部署。

## 部署架构

- **前端**: GitHub → Cloudflare Pages（自动部署）
- **后端**: GitHub → Cloudflare Workers（通过 GitHub Actions 自动部署）
- **数据库**: Cloudflare D1
- **存储**: Cloudflare R2

## 前置准备

### 1. 注册 Cloudflare 账号

访问 [Cloudflare](https://dash.cloudflare.com/sign-up) 注册免费账号。

### 2. 获取 Cloudflare API Token

1. 登录 Cloudflare Dashboard
2. 点击右上角头像 → **My Profile**
3. 左侧菜单选择 **API Tokens**
4. 点击 **Create Token**
5. 选择 **Edit Cloudflare Workers** 模板
6. 配置权限：
   - Account Resources: **All accounts** - **Cloudflare Workers:Edit**
   - Account Resources: **All accounts** - **D1:Edit**
   - Account Resources: **All accounts** - **R2:Edit**
7. 点击 **Continue to summary** → **Create Token**
8. **复制并保存** API Token（只显示一次）

### 3. 获取 Cloudflare Account ID

1. 在 Cloudflare Dashboard 首页
2. 右侧可以看到 **Account ID**
3. 复制并保存

## 部署步骤

### 第一步：创建 GitHub 仓库

1. 在 GitHub 创建新仓库（例如：`gallery-app`）
2. 将本地代码推送到 GitHub：

```bash
cd gallery-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/gallery-app.git
git push -u origin main
```

### 第二步：配置 GitHub Secrets

1. 进入 GitHub 仓库页面
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**，添加以下 Secrets：

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `CLOUDFLARE_API_TOKEN` | 你的 API Token | 第一步获取的 |
| `CLOUDFLARE_ACCOUNT_ID` | 你的 Account ID | 第一步获取的 |

### 第三步：创建 Cloudflare D1 数据库

#### 方式一：通过 Dashboard（推荐）

1. 登录 Cloudflare Dashboard
2. 左侧菜单选择 **Workers & Pages**
3. 点击 **D1 SQL Database**
4. 点击 **Create database**
5. 数据库名称输入：`gallery-db`
6. 点击 **Create**
7. **复制 Database ID**（格式：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）

#### 方式二：通过命令行

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建数据库
wrangler d1 create gallery-db

# 复制输出的 database_id
```

#### 初始化数据库表

**方式 A：通过 Dashboard**

1. 进入刚创建的 `gallery-db` 数据库
2. 点击 **Console** 标签
3. 复制 `database/schema.sql` 的内容
4. 粘贴到控制台并执行

**方式 B：通过 GitHub Actions**

1. 进入 GitHub 仓库
2. 点击 **Actions** → **Initialize Database**
3. 点击 **Run workflow**
4. 输入 Database ID
5. 点击 **Run workflow**

#### 更新 wrangler.toml

编辑 `backend/wrangler.toml`，填入 Database ID：

```toml
[[d1_databases]]
binding = "DB"
database_name = "gallery-db"
database_id = "你的-database-id"  # 替换为实际的 Database ID
```

提交并推送更改：

```bash
git add backend/wrangler.toml
git commit -m "Update database ID"
git push
```

### 第四步：创建 Cloudflare R2 存储桶

#### 通过 Dashboard

1. 登录 Cloudflare Dashboard
2. 左侧菜单选择 **R2**
3. 点击 **Create bucket**
4. 存储桶名称输入：`gallery-images`
5. 位置选择：**Automatic**（或选择离你最近的区域）
6. 点击 **Create bucket**

#### 配置公共访问

1. 进入 `gallery-images` 存储桶
2. 点击 **Settings** 标签
3. 找到 **Public access** 部分
4. 点击 **Allow Access**
5. 确认启用公共访问
6. **复制 Public R2.dev Bucket URL**（格式：`https://pub-xxxxx.r2.dev`）

#### 更新后端代码

编辑 `backend/src/routes/artworks.ts`，找到第 95 行左右：

```typescript
// 生成图片URL（需要配置R2的公共访问域名）
const imageUrl = `https://your-r2-domain.com/${fileName}`
```

替换为你的 R2 公共域名：

```typescript
const imageUrl = `https://pub-xxxxx.r2.dev/${fileName}`
```

提交并推送更改：

```bash
git add backend/src/routes/artworks.ts
git commit -m "Update R2 public URL"
git push
```

### 第五步：配置 JWT Secret（重要）

1. 登录 Cloudflare Dashboard
2. 左侧菜单选择 **Workers & Pages**
3. 找到 `gallery-backend` Worker（部署后会自动创建）
4. 点击 **Settings** → **Variables**
5. 点击 **Add variable**
6. 变量名：`JWT_SECRET`
7. 值：生成一个强随机密钥（例如：使用 `openssl rand -base64 32`）
8. 类型：**Text**
9. 点击 **Save**

### 第六步：部署后端（自动）

后端会通过 GitHub Actions 自动部署：

1. 每次推送到 `main` 分支且修改了 `backend/` 目录时自动触发
2. 或者手动触发：
   - 进入 GitHub 仓库
   - 点击 **Actions** → **Deploy Backend to Cloudflare Workers**
   - 点击 **Run workflow** → **Run workflow**

部署完成后：

1. 进入 Cloudflare Dashboard → **Workers & Pages**
2. 找到 `gallery-backend`
3. 复制 Worker URL（格式：`https://gallery-backend.your-subdomain.workers.dev`）

### 第七步：部署前端到 Cloudflare Pages

#### 通过 GitHub 集成（推荐）

1. 登录 Cloudflare Dashboard
2. 左侧菜单选择 **Workers & Pages**
3. 点击 **Create application** → **Pages** → **Connect to Git**
4. 选择 **GitHub**，授权 Cloudflare 访问你的仓库
5. 选择 `gallery-app` 仓库
6. 配置构建设置：
   - **Project name**: `gallery-frontend`
   - **Production branch**: `main`
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/`（留空或填 `/`）
7. 点击 **Environment variables (advanced)**
8. 添加环境变量：
   - 变量名：`VITE_API_BASE_URL`
   - 值：`https://gallery-backend.your-subdomain.workers.dev/api`（替换为第六步获取的 Worker URL）
9. 点击 **Save and Deploy**

#### 等待部署完成

1. 部署过程大约需要 2-5 分钟
2. 部署成功后，会显示前端访问地址（格式：`https://gallery-frontend.pages.dev`）
3. 点击链接访问你的画廊应用！

### 第八步：配置自定义域名（可选）

#### 为前端配置域名

1. 进入 Cloudflare Pages 项目 `gallery-frontend`
2. 点击 **Custom domains**
3. 点击 **Set up a custom domain**
4. 输入你的域名（例如：`gallery.yourdomain.com`）
5. 按照提示添加 DNS 记录
6. 等待 DNS 生效（通常几分钟）

#### 为后端配置域名

1. 进入 Cloudflare Workers `gallery-backend`
2. 点击 **Triggers** → **Custom Domains**
3. 点击 **Add Custom Domain**
4. 输入域名（例如：`api.yourdomain.com`）
5. 按照提示添加 DNS 记录

配置完成后，更新前端环境变量：

1. 进入 Cloudflare Pages 项目设置
2. **Settings** → **Environment variables**
3. 编辑 `VITE_API_BASE_URL`
4. 改为：`https://api.yourdomain.com/api`
5. 保存后会自动重新部署

## 自动部署流程

### 后端自动部署

- **触发条件**: 推送到 `main` 分支且修改了 `backend/` 目录
- **部署流程**: GitHub Actions → Cloudflare Workers
- **查看日志**: GitHub 仓库 → Actions 标签

### 前端自动部署

- **触发条件**: 推送到 `main` 分支
- **部署流程**: Cloudflare Pages 自动检测并构建
- **查看日志**: Cloudflare Dashboard → Pages → 项目 → Deployments

## 验证部署

### 1. 测试后端 API

访问：`https://gallery-backend.your-subdomain.workers.dev`

应该返回：

```json
{
  "message": "画廊 API 服务运行中",
  "version": "1.0.0",
  "timestamp": 1234567890
}
```

### 2. 测试前端

访问：`https://gallery-frontend.pages.dev`

应该能看到画廊首页。

### 3. 测试完整流程

1. 点击"注册"，创建账号
2. 登录成功后，点击"上传作品"
3. 上传一张图片，填写标题和心得
4. 提交后，应该能在画廊中看到你的作品

## 常见问题

### Q1: GitHub Actions 部署失败？

**检查项**：
- GitHub Secrets 是否正确配置
- Cloudflare API Token 权限是否足够
- `wrangler.toml` 中的 `database_id` 是否正确

**解决方法**：
- 查看 Actions 日志获取详细错误信息
- 重新生成 API Token 并更新 GitHub Secrets

### Q2: Cloudflare Pages 构建失败？

**检查项**：
- 构建命令是否正确
- 环境变量 `VITE_API_BASE_URL` 是否配置
- Node.js 版本是否兼容（需要 18+）

**解决方法**：
- 查看 Pages 部署日志
- 确认 `frontend/package.json` 中的依赖版本

### Q3: 图片上传后无法显示？

**检查项**：
- R2 存储桶是否启用公共访问
- `artworks.ts` 中的 R2 公共域名是否正确
- 浏览器控制台是否有 CORS 错误

**解决方法**：
- 重新检查 R2 公共访问设置
- 确认 R2 域名格式正确（`https://pub-xxxxx.r2.dev`）

### Q4: 登录后刷新页面需要重新登录？

**检查项**：
- JWT Token 是否正确存储在 localStorage
- 后端 JWT_SECRET 是否配置

**解决方法**：
- 检查浏览器控制台是否有错误
- 确认后端 Worker 的环境变量配置

### Q5: API 请求失败，显示 CORS 错误？

**检查项**：
- 前端 `VITE_API_BASE_URL` 是否正确
- 后端 CORS 配置是否正确

**解决方法**：
- 确认前端环境变量指向正确的后端地址
- 后端代码已包含 CORS 配置，无需修改

## 更新应用

### 更新代码

1. 修改代码
2. 提交并推送到 GitHub：

```bash
git add .
git commit -m "Update: 描述你的修改"
git push
```

3. GitHub Actions 和 Cloudflare Pages 会自动部署

### 回滚版本

#### 回滚前端

1. 进入 Cloudflare Pages 项目
2. 点击 **Deployments**
3. 找到之前的成功部署
4. 点击 **...** → **Rollback to this deployment**

#### 回滚后端

1. 使用 Git 回滚代码
2. 推送到 GitHub 触发重新部署

## 成本说明

Cloudflare 免费套餐包含：

- **Workers**: 100,000 请求/天
- **D1**: 5GB 存储 + 500万行读取/天
- **R2**: 10GB 存储 + 1000万次读取/月
- **Pages**: 无限请求 + 500次构建/月

对于个人画廊应用，免费套餐完全够用。

## 监控和日志

### 查看 Workers 日志

1. Cloudflare Dashboard → Workers & Pages
2. 选择 `gallery-backend`
3. 点击 **Logs** 标签
4. 实时查看请求日志

### 查看 Pages 部署日志

1. Cloudflare Dashboard → Pages
2. 选择 `gallery-frontend`
3. 点击 **Deployments**
4. 点击具体的部署查看详细日志

### 查看 Analytics

1. Workers 和 Pages 都提供免费的 Analytics
2. 可以查看请求量、错误率、响应时间等指标

## 安全建议

1. **定期更新依赖**: 使用 `npm audit` 检查安全漏洞
2. **强密码策略**: JWT_SECRET 使用强随机密钥
3. **限流保护**: 考虑添加 Cloudflare Rate Limiting
4. **备份数据**: 定期导出 D1 数据库备份
5. **监控异常**: 配置 Cloudflare 告警通知

## 下一步优化

1. **CDN 加速**: Cloudflare 自动提供全球 CDN
2. **图片优化**: 使用 Cloudflare Images 服务
3. **缓存策略**: 配置 Workers 缓存提升性能
4. **自定义域名**: 配置专业的域名
5. **HTTPS**: Cloudflare 自动提供免费 SSL 证书

## 技术支持

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

**恭喜！** 你的画廊应用已经成功部署到 Cloudflare，享受全球 CDN 加速和无服务器架构的便利吧！🎉
