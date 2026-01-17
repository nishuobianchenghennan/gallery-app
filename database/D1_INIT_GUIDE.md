# Cloudflare D1 数据库初始化指南

如果你在初始化 Cloudflare D1 数据库时遇到问题，这里提供了多种解决方案。

## 问题原因

Cloudflare D1 在某些执行方式下不支持：
- SQL 注释（`--` 开头的行）
- 多条语句一次性执行（某些情况下）
- 空行或格式问题

## ✅ 解决方案

### 方案一：通过 Dashboard Console（最简单）⭐

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **D1**
3. 选择你的数据库 `gallery-db`
4. 点击 **Console** 标签
5. **逐条**复制并执行以下 SQL：

#### 第一步：创建 users 表

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

点击 **Execute** 执行。

#### 第二步：创建 artworks 表

```sql
CREATE TABLE IF NOT EXISTS artworks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

点击 **Execute** 执行。

#### 第三步：创建索引

```sql
CREATE INDEX IF NOT EXISTS idx_artworks_user_id ON artworks(user_id);
```

点击 **Execute** 执行。

```sql
CREATE INDEX IF NOT EXISTS idx_artworks_create_time ON artworks(create_time DESC);
```

点击 **Execute** 执行。

#### 第四步：验证表创建

```sql
SELECT name FROM sqlite_master WHERE type='table';
```

应该看到 `users` 和 `artworks` 两个表。

---

### 方案二：通过 Wrangler CLI（命令行）

如果你已经安装了 Wrangler CLI：

#### 方法 A：使用清理后的 SQL 文件

```bash
cd backend
wrangler d1 execute gallery-db --file=../database/schema.sql
```

如果还是报错，尝试逐条执行：

#### 方法 B：逐条执行 SQL

```bash
# 创建 users 表
wrangler d1 execute gallery-db --command="CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, email TEXT NOT NULL UNIQUE, create_time DATETIME DEFAULT CURRENT_TIMESTAMP, update_time DATETIME DEFAULT CURRENT_TIMESTAMP);"

# 创建 artworks 表
wrangler d1 execute gallery-db --command="CREATE TABLE IF NOT EXISTS artworks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, image_url TEXT NOT NULL, title TEXT NOT NULL, description TEXT, create_time DATETIME DEFAULT CURRENT_TIMESTAMP, update_time DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);"

# 创建索引
wrangler d1 execute gallery-db --command="CREATE INDEX IF NOT EXISTS idx_artworks_user_id ON artworks(user_id);"

wrangler d1 execute gallery-db --command="CREATE INDEX IF NOT EXISTS idx_artworks_create_time ON artworks(create_time DESC);"
```

#### 验证表创建

```bash
wrangler d1 execute gallery-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

---

### 方案三：通过 GitHub Actions（自动化）

如果你使用 GitHub Actions 部署，可以手动触发数据库初始化：

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 选择 **Initialize Database** workflow
4. 点击 **Run workflow**
5. 输入你的 Database ID
6. 点击 **Run workflow**

**注意**：确保已经配置了 GitHub Secrets：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## 🔍 常见错误和解决方法

### 错误 1: "Requests without any query are not supported"

**原因**：SQL 文件包含注释或空行

**解决**：
- 使用 Dashboard Console 逐条执行
- 或使用清理后的 `schema.sql`（已移除所有注释）

### 错误 2: "Database not found"

**原因**：Database ID 不正确或数据库未创建

**解决**：
1. 检查 `wrangler.toml` 中的 `database_id`
2. 确认数据库已在 Dashboard 中创建
3. 运行 `wrangler d1 list` 查看所有数据库

### 错误 3: "Authentication failed"

**原因**：未登录或 API Token 无效

**解决**：
```bash
wrangler login
```

或检查 GitHub Secrets 中的 `CLOUDFLARE_API_TOKEN`

### 错误 4: "Table already exists"

**原因**：表已经创建过了

**解决**：
- 这不是错误，可以忽略
- 或者先删除表：`DROP TABLE IF EXISTS users;`

---

## ✅ 验证数据库初始化成功

### 方法 1：通过 Dashboard

1. 进入 D1 数据库 Console
2. 执行：
```sql
SELECT name FROM sqlite_master WHERE type='table';
```

应该看到：
- `users`
- `artworks`

### 方法 2：通过 Wrangler

```bash
wrangler d1 execute gallery-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### 方法 3：查看表结构

```sql
PRAGMA table_info(users);
```

应该看到 6 个字段：id, username, password, email, create_time, update_time

```sql
PRAGMA table_info(artworks);
```

应该看到 7 个字段：id, user_id, image_url, title, description, create_time, update_time

---

## 📝 数据库表说明

### users 表（用户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| username | TEXT | 用户名，唯一 |
| password | TEXT | 密码（bcrypt 加密） |
| email | TEXT | 邮箱，唯一 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### artworks 表（作品表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 用户ID（外键） |
| image_url | TEXT | 图片URL（R2） |
| title | TEXT | 作品标题 |
| description | TEXT | 作画心得感悟 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### 索引

- `idx_artworks_user_id`: 用户ID索引，加速按用户查询
- `idx_artworks_create_time`: 创建时间索引，加速按时间排序

---

## 🎯 推荐流程

1. **首选**：通过 Dashboard Console 逐条执行（最稳定）
2. **备选**：使用 Wrangler CLI 逐条执行
3. **自动化**：配置 GitHub Actions 自动初始化

---

## 💡 提示

- 如果 Dashboard Console 执行失败，尝试刷新页面重试
- 每次执行后等待 1-2 秒再执行下一条
- 如果遇到问题，可以先删除数据库重新创建
- 数据库初始化只需要执行一次

---

## 🆘 仍然遇到问题？

如果以上方法都不行，可以考虑：

1. **使用 Vercel + Supabase 替代方案**
   - 查看 [DEPLOY_VERCEL_SUPABASE.md](../DEPLOY_VERCEL_SUPABASE.md)
   - Supabase 的数据库初始化更简单

2. **联系 Cloudflare 支持**
   - 访问 [Cloudflare Community](https://community.cloudflare.com/)
   - 或查看 [D1 文档](https://developers.cloudflare.com/d1/)

---

**初始化成功后，继续查看 [DEPLOY.md](../DEPLOY.md) 完成后续部署步骤。**
