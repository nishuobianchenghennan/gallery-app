# GitHub 完整设置和部署指南

## 📦 第一步：初始化 Git 仓库

项目已经初始化了 Git 仓库。

## 🔧 第二步：提交所有文件

在项目根目录 `d:\Desktop\Code\tools\gallery-app` 打开命令行，执行：

```bash
# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Gallery app with Cloudflare and Vercel support"
```

## 🌐 第三步：创建 GitHub 仓库

1. 访问 [GitHub](https://github.com/)
2. 点击右上角 **+** → **New repository**
3. 填写信息：
   - **Repository name**: `gallery-app`（或其他名称）
   - **Description**: `画廊应用 - 支持 Cloudflare 和 Vercel 部署`
   - **Public** 或 **Private**（推荐 Private）
   - **不要**勾选 "Initialize this repository with a README"
4. 点击 **Create repository**

## 📤 第四步：推送代码到 GitHub

GitHub 会显示推送命令，复制执行：

```bash
# 添加远程仓库（替换为你的 GitHub 用户名和仓库名）
git remote add origin https://github.com/your-username/gallery-app.git

# 设置主分���名称
git branch -M main

# 推送代码
git push -u origin main
```

**注意**：如果推送失败，可能需要配置 GitHub 认证：
- 使用 GitHub CLI: `gh auth login`
- 或使用 Personal Access Token

## ⚙️ 第五步：配置 GitHub Secrets

推送成功后，配置 Cloudflare 凭证：

1. 进入 GitHub 仓库页面
2. **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下 Secrets：

### Secret 1: CLOUDFLARE_API_TOKEN

- **Name**: `CLOUDFLARE_API_TOKEN`
- **Value**: 你的 Cloudflare API Token

**获取方法**：
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 右上角头像 → **My Profile**
3. 左侧 **API Tokens**
4. **Create Token** → **Edit Cloudflare Workers** 模板
5. 配置权限：
   - Account Resources: All accounts - Cloudflare Workers:Edit
   - Account Resources: All accounts - D1:Edit
   - Account Resources: All accounts - R2:Edit
6. **Continue to summary** → **Create Token**
7. 复制 Token（只显示一次！）

### Secret 2: CLOUDFLARE_ACCOUNT_ID

- **Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Value**: 你的 Cloudflare Account ID

**获取方法**：
1. Cloudflare Dashboard 首页
2. 右侧可以看到 **Account ID**
3. 复制

## 🚀 第六步：触发后端部署

配置完 Secrets 后，触发后端部署：

### 方法 A：手动触发（推荐）

1. GitHub 仓库 → **Actions** 标签
2. 左侧选择 **Deploy Backend to Cloudflare Workers**
3. 右侧点击 **Run workflow**
4. 选择 `main` 分支
5. 点击 **Run workflow**

### 方法 B：修改代码触发

```bash
# 修改 backend 目录下的任意文件
echo "# trigger deployment" >> backend/README.md

# 提交并推送
git add backend/
git commit -m "trigger backend deployment"
git push
```

## ✅ 第七步：验证部署

### 检查 GitHub Actions

1. **Actions** 标签
2. 应该看到两个 workflows：
   - ✅ **Deploy Backend to Cloudflare Workers** - 后端部署
   - ✅ **pages build and deployment** - 前端部署（Cloudflare Pages 自动）

### 检查 Cloudflare Dashboard

1. 登录 Cloudflare Dashboard
2. **Workers & Pages**
3. 应该看到：
   - `gallery-backend` - Worker
   - `gallery-app` 或类似名称 - Pages 项目

## 🔐 第八步：配置环境变量

### 配置后端 JWT Secret

1. Cloudflare Dashboard → **Workers & Pages**
2. 点击 `gallery-backend`
3. **Settings** → **Variables**
4. **Add variable**:
   - **Variable name**: `JWT_SECRET`
   - **Value**: 生成随机密钥（见下方）
   - **Type**: Text
5. **Save**

**生成随机密钥**：

Windows PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

或在线生成：https://www.random.org/strings/

### 配置前端 API 地址

如果使用 Cloudflare Pages：

1. Cloudflare Dashboard → **Workers & Pages**
2. 点击你的 Pages 项目
3. **Settings** → **Environment variables**
4. **Add variable**:
   - **Variable name**: `VITE_API_BASE_URL`
   - **Value**: `https://gallery-backend.your-subdomain.workers.dev/api`
   （替换为你的 Worker URL）
5. **Save**
6. **Deployments** → 重新部署

## 🎯 第九步：配置 R2 公共访问

1. Cloudflare Dashboard → **R2**
2. 点击 `gallery-images` 存储桶
3. **Settings** → **Public access**
4. **Allow Access**
5. 复制 **Public R2.dev Bucket URL**（如：`https://pub-xxxxx.r2.dev`）

### 更新后端代码

编辑 `backend/src/routes/artworks.ts`，找到第 95 行左右：

```typescript
const imageUrl = `https://your-r2-domain.com/${fileName}`
```

替换为：

```typescript
const imageUrl = `https://pub-xxxxx.r2.dev/${fileName}`
```

提交并推送：

```bash
git add backend/src/routes/artworks.ts
git commit -m "Update R2 public URL"
git push
```

## 🧪 第十步：测试应用

### 测试后端 API

访问：`https://gallery-backend.your-subdomain.workers.dev`

应该返回：
```json
{
  "message": "画廊 API 服务运行中",
  "version": "1.0.0",
  "timestamp": 1234567890
}
```

### 测试前端

访问 Cloudflare Pages URL（在 Dashboard 中查看）

应该能看到画廊首页。

### 完整功能测试

1. 点击"注册"，创建账号
2. 登录
3. 点击"上传作品"
4. 上传图片，填写标题和心得
5. 提交后，在画廊中应该能看到你的作品

## 🆘 常见问题

### Q: GitHub Actions 失败，提示 "Authentication failed"

**解决**：
- 检查 GitHub Secrets 是否正确配置
- 重新生成 Cloudflare API Token
- 确保 Token 权限足够

### Q: Worker 部署成功但无法访问

**解决**：
- 检查 `wrangler.toml` 中的 `database_id` 是否正确
- 确保 D1 数据库已创建并初始化
- 查看 Worker 日志排查错误

### Q: 图片上传后无法显示

**解决**：
- 检查 R2 存储桶是否启用公共访问
- 确认 `artworks.ts` 中的 R2 域名正确
- 查看浏览器控制台是否有 CORS 错误

### Q: 前端无法连接后端

**解决**：
- 检查前端环境变量 `VITE_API_BASE_URL` 是否正确
- 确认 Worker URL 可以访问
- 检查 CORS 配置

## 📚 相关文档

- [Cloudflare 部署指南](DEPLOY.md)
- [Vercel + Supabase 部署指南](DEPLOY_VERCEL_SUPABASE.md)
- [平台对比指南](PLATFORM_COMPARISON.md)
- [问题排查指南](TROUBLESHOOTING.md)
- [D1 数据库初始化指南](database/D1_INIT_GUIDE.md)

## 🎉 部署完成

恭喜！你的画廊应用已成功部署到 Cloudflare。

**前端地址**: `https://your-project.pages.dev`
**后端地址**: `https://gallery-backend.your-subdomain.workers.dev`

享受你的画廊应用吧！🎨

---

## 💡 提示

- 定期备份 D1 数据库数据
- 监控 Cloudflare Analytics
- 根据使用情况优化性能
- 考虑配置自定义域名

## 🔄 更新应用

修改代码后：

```bash
git add .
git commit -m "描述你的修改"
git push
```

GitHub Actions 会自动部署更新。
