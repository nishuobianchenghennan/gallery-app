# 快速开始指南

## 5分钟部署到 Cloudflare

### 前置条件

- GitHub 账号
- Cloudflare 账号（免费）

### 部署步骤

#### 1. Fork 或克隆仓库

```bash
git clone https://github.com/your-username/gallery-app.git
cd gallery-app
```

#### 2. 推送到你的 GitHub 仓库

```bash
git remote set-url origin https://github.com/your-username/gallery-app.git
git push -u origin main
```

#### 3. 配置 Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 获取 API Token 和 Account ID（参考 [DEPLOY.md](DEPLOY.md)）
3. 在 GitHub 仓库设置中添加 Secrets：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

#### 4. 创建 D1 数据库

```bash
# 方式一：通过 Dashboard
Cloudflare Dashboard → Workers & Pages → D1 → Create database → 名称: gallery-db

# 方式二：通过命令行
wrangler d1 create gallery-db
```

复制 Database ID，更新 `backend/wrangler.toml`。

#### 5. 创建 R2 存储桶

```bash
Cloudflare Dashboard → R2 → Create bucket → 名称: gallery-images
```

启用公共访问，复制公共域名，更新 `backend/src/routes/artworks.ts`。

#### 6. 初始化数据库

通过 Dashboard Console 执行 `database/schema.sql` 中的 SQL。

#### 7. 部署后端

推送代码到 GitHub，GitHub Actions 会自动部署：

```bash
git add .
git commit -m "Configure Cloudflare"
git push
```

#### 8. 部署前端

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
2. 选择仓库 → 配置构建：
   - Build command: `cd frontend && npm install && npm run build`
   - Build output: `frontend/dist`
   - 环境变量: `VITE_API_BASE_URL` = 你的 Worker URL + `/api`
3. Save and Deploy

#### 9. 完成！

访问 Cloudflare Pages 提供的 URL，开始使用你的画廊应用！

---

详细步骤请查看 [完整部署指南](DEPLOY.md)。
