<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Plus, User, Calendar } from '@element-plus/icons-vue'
import { artworkApi } from '@/api'
import type { Artwork } from '@/types'

const router = useRouter()
const userStore = useUserStore()

// 作品列表
const artworks = ref<Artwork[]>([])

// 加载状态
const loading = ref(false)

/**
 * 加载作品列表
 */
const loadArtworks = async () => {
  loading.value = true
  try {
    artworks.value = await artworkApi.getArtworks()
  } catch (error: any) {
    ElMessage.error(error.message || '加载作品失败')
  } finally {
    loading.value = false
  }
}

/**
 * 查看作品详情
 */
const viewArtwork = (id: number) => {
  router.push(`/artwork/${id}`)
}

/**
 * 跳转到上传页面
 */
const goToUpload = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push('/upload')
}

/**
 * 跳转到登录页
 */
const goToLogin = () => {
  router.push('/login')
}

/**
 * 退出登录
 */
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
}

/**
 * 格式化日期
 */
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadArtworks()
  // 如果已登录，获取用户信息
  if (userStore.isLoggedIn && !userStore.userInfo) {
    userStore.fetchCurrentUser()
  }
})
</script>

<template>
  <div class="gallery-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <h1 class="logo">艺术画廊</h1>
        <div class="header-actions">
          <el-button
            type="primary"
            :icon="Plus"
            @click="goToUpload"
          >
            上传作品
          </el-button>
          <el-button
            v-if="!userStore.isLoggedIn"
            @click="goToLogin"
          >
            登录
          </el-button>
          <el-dropdown v-else>
            <el-button>
              {{ userStore.userInfo?.username }}
              <el-icon class="el-icon--right"><User /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 作品列表 -->
    <main class="main-content">
      <div v-loading="loading" class="artworks-grid">
        <div
          v-for="artwork in artworks"
          :key="artwork.id"
          class="artwork-card"
          @click="viewArtwork(artwork.id)"
        >
          <div class="artwork-image">
            <img :src="artwork.imageUrl" :alt="artwork.title" />
          </div>
          <div class="artwork-info">
            <h3 class="artwork-title">{{ artwork.title }}</h3>
            <p class="artwork-description">{{ artwork.description }}</p>
            <div class="artwork-meta">
              <span class="meta-item">
                <el-icon><User /></el-icon>
                {{ artwork.username }}
              </span>
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(artwork.createTime) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="!loading && artworks.length === 0"
          description="暂无作品，快来上传第一个作品吧！"
          class="empty-state"
        />
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.gallery-container {
  min-height: 100vh;
  background-color: #f5f7fa;

  .header {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .logo {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
        color: #409eff;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px 24px;

    .artworks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      min-height: 400px;

      .artwork-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .artwork-image {
          width: 100%;
          height: 240px;
          overflow: hidden;
          background-color: #f0f0f0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }

          &:hover img {
            transform: scale(1.05);
          }
        }

        .artwork-info {
          padding: 16px;

          .artwork-title {
            margin: 0 0 8px;
            font-size: 18px;
            font-weight: 600;
            color: #333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .artwork-description {
            margin: 0 0 12px;
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .artwork-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #999;

            .meta-item {
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }
        }
      }

      .empty-state {
        grid-column: 1 / -1;
      }
    }
  }
}
</style>
