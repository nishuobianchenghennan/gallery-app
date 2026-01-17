# 部署检查清单

在部署画廊应用之前，请确保完成以下所有步骤。

## 准备阶段

- [ ] 注册 Cloudflare 账号
- [ ] 创建 GitHub 仓库
- [ ] 获取 Cloudflare API Token
- [ ] 获取 Cloudflare Account ID

## GitHub 配置

- [ ] 代码已推送到 GitHub
- [ ] 配置 GitHub Secrets:
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`

## Cloudflare D1 数据库

- [ ] 创建 D1 数据库 `gallery-db`
- [ ] 获取 Database ID
- [ ] 更新 `backend/wrangler.toml` 中的 `database_id`
- [ ] 执行 `database/schema.sql` 初始化表结构
- [ ] 验证表创建成功（users 和 artworks 表）

## Cloudflare R2 存储

- [ ] 创建 R2 存储桶 `gallery-images`
- [ ] 启用公共访问
- [ ] 获取 R2 公共域名（`https://pub-xxxxx.r2.dev`）
- [ ] 更新 `backend/src/routes/artworks.ts` 中的 `imageUrl`

## 后端部署

- [ ] 提交并推送代码到 GitHub
- [ ] GitHub Actions 自动部署成功
- [ ] 获取 Worker URL
- [ ] 访问 Worker URL 验证 API 运行正常
- [ ] 配置 Worker 环境变量 `JWT_SECRET`（强随机密钥）

## 前端部署

- [ ] 连接 GitHub 仓库到 Cloudflare Pages
- [ ] 配置构建设置：
  - [ ] Build command: `cd frontend && npm install && npm run build`
  - [ ] Build output: `frontend/dist`
- [ ] 配置环境变量 `VITE_API_BASE_URL`（Worker URL + `/api`）
- [ ] 部署成功
- [ ] 获取 Pages URL

## 功能测试

- [ ] 访问前端 URL，页面正常加载
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 上传作品功能正常
- [ ] 图片正常显示
- [ ] 画廊列表正常显示
- [ ] 作品详情页正常显示
- [ ] 删除作品功能正常（仅作者）

## 可选配置

- [ ] 配置自定义域名（前端）
- [ ] 配置自定义域名（后端）
- [ ] 更新前端环境变量为自定义域名
- [ ] 配置 Cloudflare Analytics
- [ ] 配置告警通知

## 安全检查

- [ ] JWT_SECRET 使用强随机密钥
- [ ] R2 存储桶仅启用必要的公共访问
- [ ] API Token 权限最小化
- [ ] GitHub Secrets 正确配置
- [ ] 生产环境不使用默认密钥

## 备份

- [ ] 导出 D1 数据库备份
- [ ] 记录所有配置信息
- [ ] 保存 API Token（安全存储）

---

## 部署完成���

恭喜！你的画廊应用已成功部署。

**前端地址**: `https://gallery-frontend.pages.dev`
**后端地址**: `https://gallery-backend.your-subdomain.workers.dev`

### 下一步

1. 分享你的画廊链接
2. 邀请用户注册和上传作品
3. 监控应用性能和使用情况
4. 根据需要进行优化和扩展

### 遇到问题？

- 查看 [DEPLOY.md](DEPLOY.md) 的常见问题部分
- 检查 Cloudflare Dashboard 的日志
- 查看 GitHub Actions 的部署日志
- 检查浏览器控制台的错误信息
