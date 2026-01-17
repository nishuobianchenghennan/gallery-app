# Cloudflare D1 快速初始化

## 🚀 最简单的方法（推荐）

### 通过 Dashboard Console 逐条执行

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers & Pages** → **D1** → 选择 `gallery-db` → **Console**
3. 逐条复制执行以下 SQL：

---

### SQL 1: 创建用户表

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

✅ 点击 **Execute**

---

### SQL 2: 创建作品表

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

✅ 点击 **Execute**

---

### SQL 3: 创建索引 1

```sql
CREATE INDEX IF NOT EXISTS idx_artworks_user_id ON artworks(user_id);
```

✅ 点击 **Execute**

---

### SQL 4: 创建索引 2

```sql
CREATE INDEX IF NOT EXISTS idx_artworks_create_time ON artworks(create_time DESC);
```

✅ 点击 **Execute**

---

### 验证

```sql
SELECT name FROM sqlite_master WHERE type='table';
```

应该看到：`users` 和 `artworks`

---

## 💡 为什么会报错？

原始 SQL 文件包含注释（`--`），Cloudflare D1 在某些情况下不支持。

已修复：
- ✅ `database/schema.sql` - 已移除所有注释
- ✅ `database/schema-clean.sql` - 备份文件

---

## 🔧 命令行方式（可选）

```bash
cd backend

# 方式 1: 使用文件
wrangler d1 execute gallery-db --file=../database/schema.sql

# 方式 2: 逐条执行（如果方式1失败）
wrangler d1 execute gallery-db --command="CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, email TEXT NOT NULL UNIQUE, create_time DATETIME DEFAULT CURRENT_TIMESTAMP, update_time DATETIME DEFAULT CURRENT_TIMESTAMP);"
```

---

## 📚 详细文档

查看 [D1_INIT_GUIDE.md](D1_INIT_GUIDE.md) 了解：
- 完整的错误排查
- 多种初始化方法
- 常见问题解决

---

## 🌟 替代方案

如果 D1 初始化仍有问题，推荐使用：

**Vercel + Supabase** - 更简单、更稳定

查看 [DEPLOY_VERCEL_SUPABASE.md](../DEPLOY_VERCEL_SUPABASE.md)
