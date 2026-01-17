<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadProps, UploadUserFile } from 'element-plus'
import { artworkApi } from '@/api'

const router = useRouter()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  title: '',
  description: '',
  image: null as File | null
})

// 图片列表
const fileList = ref<UploadUserFile[]>([])

// 图片预览URL
const imageUrl = ref<string>('')

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入作品标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入作画心得感悟', trigger: 'blur' },
    { min: 10, max: 2000, message: '心得感悟至少 10 个字符', trigger: 'blur' }
  ]
}

// 加载状态
const loading = ref(false)

/**
 * 图片上传前的校验
 */
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  // 检查文件类型
  const isImage = rawFile.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }

  // 检查文件大小（限制10MB）
  const isLt10M = rawFile.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB')
    return false
  }

  // 保存文件
  form.image = rawFile

  // 生成预览URL
  imageUrl.value = URL.createObjectURL(rawFile)

  return false // 阻止自动上传
}

/**
 * 移除图片
 */
const handleRemove = () => {
  form.image = null
  imageUrl.value = ''
  fileList.value = []
}

/**
 * 处理上传
 */
const handleUpload = async () => {
  // 验证表单
  const valid = await formRef.value?.validate()
  if (!valid) return

  // 验证图片
  if (!form.image) {
    ElMessage.error('请选择要上传的图片')
    return
  }

  loading.value = true
  try {
    await artworkApi.uploadArtwork({
      title: form.title,
      description: form.description,
      image: form.image
    })

    ElMessage.success('作品上传成功')
    router.push('/')
  } catch (error: any) {
    ElMessage.error(error.message || '上传失败')
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
</script>

<template>
  <div class="upload-container">
    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <h2>上传作品</h2>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="作品图片" required>
          <el-upload
            v-model:file-list="fileList"
            class="upload-image"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-remove="handleRemove"
            accept="image/*"
          >
            <img v-if="imageUrl" :src="imageUrl" class="preview-image" />
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">
            支持 JPG、PNG、GIF 等格式，大小不超过 10MB
          </div>
        </el-form-item>

        <el-form-item label="作品标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入作品标题"
            maxlength="100"
            show-word-limit
            clearable
          />
        </el-form-item>

        <el-form-item label="作画心得感悟" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请分享您的作画心得和感悟..."
            :rows="8"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleUpload"
          >
            上传作品
          </el-button>
          <el-button @click="goBack">
            返回
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.upload-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  min-height: 100vh;
  background-color: #f5f7fa;

  .upload-card {
    width: 100%;
    max-width: 800px;

    .card-header {
      text-align: center;

      h2 {
        margin: 0;
        color: #333;
      }
    }

    .upload-image {
      width: 300px;
      height: 300px;
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      cursor: pointer;
      overflow: hidden;
      transition: border-color 0.3s;

      &:hover {
        border-color: #409eff;
      }

      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .upload-icon {
        font-size: 48px;
        color: #8c939d;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .upload-tip {
      margin-top: 8px;
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
