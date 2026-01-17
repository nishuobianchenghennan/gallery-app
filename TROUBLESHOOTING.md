# Cloudflare Workers 部署问题排查指南

## 问题现象

GitHub Actions 运行后，Cloudflare Dashboard 中没有出现 `gallery-backend` Worker。

## 🔍 排查步骤

### 第一步：检查 GitHub Actions 是否触发

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看是否有 **Deploy Backend to Cloudflare Workers** 的运行记录

**预期结果**：
- ✅ 应该看到 "Deploy Backend to Cloudflare Workers" workflow
- ✅ 状态应该是绿色（成功）

**如果没有看到**：
- ❌ 说明 workflow 没有被触发
- ��因：可能是 workflow 文件路径不对或触发条件不满足

### 第二步：检查 workflow 文件是否存在

确认以下文件存在：
```
.github/workflows/deploy-backend.yml
```

如果不存在，需要创建这个文件。

### 第三步：检查 GitHub Secrets

1. 进入 GitHub 仓库
2. **Settings** → **Secrets and variables** → **Actions**
3. 确认存在以下 Secrets：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

**如果缺少**：
- 需要添加这些 Secrets
- 参考 [DEPLOY.md](../DEPLOY.md) 第二步

### 第四步：检查 wrangler.toml 配置

查看 `backend/wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "gallery-db"
database_id = ""  # ⚠️ 这里不能为空！
```

**问题**：如果 `database_id` 为空，部署会失败。

**解决**：填入你的 D1 Database ID。

---

## ✅ 解决方案

### 方案一：手动触发 GitHub Actions（推荐）

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 左侧选择 **Deploy Backend to Cloudflare Workers**
4. 点击右侧 **Run workflow** 按钮
5. 选择 `main` 分支
6. 点击 **Run workflow**

**等待部署完成**（约 1-2 分钟）

### 方案二：修改代码触发自动部署

1. 修改 `backend/` 目录下的任意文件（例如添加一个空行）
2. 提交并推送：
```bash
git add backend/
git commit -m "trigger backend deployment"
git push
```

这会自动触发后端部署。

### 方案三：本地手动部署（最直接）

如果 GitHub Actions 一直有问题，可以本地手动部署：

#### 前置条件
```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

#### 部署步骤

1. **更新 wrangler.toml**

编辑 `backend/wrangler.toml`，填入你的 Database ID：

```toml
[[d1_databases]]
binding = "DB"
database_name = "gallery-db"
database_id = "你的-database-id"  # 替换为实际的 ID
```

2. **安装依赖**

```bash
cd backend
npm install
```

3. **部署到 Cloudflare**

```bash
npm run deploy
# 或
wrangler deploy
```

4. **查看部署结果**

部署成功后会显示 Worker URL：
```
Published gallery-backend (0.xx sec)
  https://gallery-backend.your-subdomain.workers.dev
```

5. **在 Dashboard 验证**

- 登录 Cloudflare Dashboard
- **Workers & Pages** → 应该能看到 `gallery-backend`

---

## 🔧 常见问题

### Q1: GitHub Actions 显示 "Authentication failed"

**原因**：API Token 无效或权限不足

**解决**：
1. 重新生成 Cloudflare API Token
2. 确保权限包含：
   - Cloudflare Workers:Edit
   - D1:Edit
   - R2:Edit
3. 更新 GitHub Secrets

### Q2: 部署失败，提示 "Database not found"

**原因**：`database_id` 不正确或为空

**解决**：
1. 在 Cloudflare Dashboard 查看 D1 数据库
2. 复制正确的 Database ID
3. 更新 `backend/wrangler.toml`

### Q3: Worker 部署成功但无法访问

**原因**：可能是路由配置问题

**解决**：
1. 检查 Worker URL 是否正确
2. 访问 `https://your-worker.workers.dev` 测试
3. 应该返回 JSON 响应

### Q4: 前端部署了但后端没有

**原因**：GitHub Actions workflow 没有触发

**解决**：
1. 检查 `.github/workflows/deploy-backend.yml` 是否存在
2. 检查触发条件：
```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
```
3. 确保修改了 `backend/` 目录下的文件

---

## 📝 完整的部署检查清单

### 准备阶段
- [ ] Cloudflare 账号已注册
- [ ] D1 数据库已创建
- [ ] R2 存储桶已创建
- [ ] 获取了 API Token 和 Account ID

### GitHub 配置
- [ ] 代码已推送到 GitHub
- [ ] `.github/workflows/deploy-backend.yml` 文件存在
- [ ] GitHub Secrets 已配置：
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`

### 后端配置
- [ ] `backend/wrangler.toml` 中的 `database_id` 已填写
- [ ] `backend/package.json` 依赖正确
- [ ] JWT_SECRET 已配置（部署后）

### 部署验证
- [ ] GitHub Actions 运行成功
- [ ] Cloudflare Dashboard 中看到 `gallery-backend`
- [ ] Worker URL 可以访问
- [ ] 返回正确的 JSON 响应

---

## 🎯 推荐操作流程

### 如果你是第一次部署：

1. **先本地手动部署**（方案三）
   - 确保配置正确
   - 验证 Worker 可以正常运行

2. **再配置 GitHub Actions**
   - 添加 Secrets
   - 手动触发一次测试

3. **最后配置自动部署**
   - 确认触发条件
   - 测试自动部署

### 如果你已经部署过：

1. **检查 GitHub Actions 日志**
   - 查看具体错误信息
   - 根据错误修复

2. **手动触发部署**
   - 使用方案一或方案二

3. **验证部署结果**
   - 检查 Cloudflare Dashboard
   - 测试 API 接口

---

## 💡 快速解决方案

**最快的方法**：本地手动部署

```bash
# 1. 登录 Cloudflare
wrangler login

# 2. 进入后端目录
cd backend

# 3. 确保 wrangler.toml 中的 database_id 已填写

# 4. 部署
npm run deploy

# 5. 记录 Worker URL
# 输出类似：https://gallery-backend.xxx.workers.dev
```

部署成功后，继续配置 JWT Secret 和前端环境变量。

---

## 🆘 仍然无法部署？

如果以上方法都不行，考虑使用 **Vercel + Supabase** 替代方案：

- ✅ 部署更简单
- ✅ 不需要复杂的 CLI 工具
- ✅ GitHub 集成更好
- ✅ 国内访问更快

查看 [DEPLOY_VERCEL_SUPABASE.md](../DEPLOY_VERCEL_SUPABASE.md)

---

**下一步**：选择一个方案部署后端，然后继续配置 JWT Secret。
