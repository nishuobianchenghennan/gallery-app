<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, User, Calendar, Delete } from '@element-plus/icons-vue'
import { artworkApi } from '@/api'
import type { Artwork } from '@/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 作品详情
const artwork = ref<Artwork | null>(null)

// 加载状态
const loading = ref(false)

// 删除加载状态
const deleteLoading = ref(false)

/**
 * 加载作品详情
 */
const loadArtwork = async () => {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('作品ID无效')
    router.push('/')
    return
  }

  loading.value = true
  try {
    artwork.value = await artworkApi.getArtworkById(id)
  } catch (error: any) {
    ElMessage.error(error.message || '加载作品失败')
    router.push('/')
  } finally {
    loading.value = false
  }
}

/**
 * 返回首页
 */
const goBack = () => {
  router.push('/')
}

/**
 * 删除作品
 */
const handleDelete = async () => {
  if (!artwork.value) return

  try {
    await ElMessageBox.confirm(
      '确定要删除这个作品吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    deleteLoading.value = true
    await artworkApi.deleteArtwork(artwork.value.id)
    ElMessage.success('作品已删除')
    router.push('/')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    deleteLoading.value = false
  }
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

/**
 * 是否是作品作者
 */
const isAuthor = computed(() => {
  return artwork.value && userStore.userInfo?.id === artwork.value.userId
})

onMounted(() => {
  loadArtwork()
})
</script>

<template>
  <div class="artwork-detail-container">
    <div v-loading="loading" class="detail-content">
      <div v-if="artwork" class="artwork-detail">
        <!-- 顶部操作栏 -->
        <div class="detail-header">
          <el-button :icon="ArrowLeft" @click="goBack">
            返回
          </el-button>
          <el-button
            v-if="isAuthor"
            type="danger"
            :icon="Delete"
            :loading="deleteLoading"
            @click="handleDelete"
          >
            删除作品
          </el-button>
        </div>

        <!-- 作品图片 -->
        <div class="artwork-image-container">
          <img :src="artwork.imageUrl" :alt="artwork.title" class="artwork-image" />
        </div>

        <!-- 作品信息 -->
        <div class="artwork-info-container">
          <h1 class="artwork-title">{{ artwork.title }}</h1>

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

          <el-divider />

          <div class="artwork-description-section">
            <h3>作画心得感悟</h3>
            <p class="artwork-description">{{ artwork.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.artwork-detail-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 24px;

  .detail-content {
    max-width: 1200px;
    margin: 0 auto;
    min-height: 600px;

    .artwork-detail {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

      .detail-header {
        padding: 16px 24px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .artwork-image-container {
        width: 100%;
        max-height: 600px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #000;

        .artwork-image {
          max-width: 100%;
          max-height: 600px;
          object-fit: contain;
        }
      }

      .artwork-info-container {
        padding: 32px;

        .artwork-title {
          margin: 0 0 16px;
          font-size: 32px;
          font-weight: bold;
          color: #333;
        }

        .artwork-meta {
          display: flex;
          gap: 24px;
          font-size: 14px;
          color: #666;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
          }
        }

        .artwork-description-section {
          h3 {
            margin: 0 0 16px;
            font-size: 20px;
            font-weight: 600;
            color: #333;
          }

          .artwork-description {
            margin: 0;
            font-size: 16px;
            line-height: 1.8;
            color: #666;
            white-space: pre-wrap;
            word-break: break-word;
          }
        }
      }
    }
  }
}
</style>
