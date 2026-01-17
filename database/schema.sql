-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,  -- 存储哈希后的密码
    email TEXT NOT NULL UNIQUE,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 作品表
CREATE TABLE IF NOT EXISTS artworks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,  -- R2存储的图片URL
    title TEXT NOT NULL,
    description TEXT,  -- 作画心得感悟
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_artworks_user_id ON artworks(user_id);
CREATE INDEX IF NOT EXISTS idx_artworks_create_time ON artworks(create_time DESC);
