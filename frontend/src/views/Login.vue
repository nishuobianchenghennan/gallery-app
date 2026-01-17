<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { LoginRequest } from '@/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<LoginRequest>({
  username: '',
  password: ''
})

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度至少 6 个字符', trigger: 'blur' }
  ]
}

// 加载状态
const loading = ref(false)

/**
 * 处理登录
 */
const handleLogin = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await userStore.login(form)
    ElMessage.success('登录成功')

    // 跳转到重定向页面或首页
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

/**
 * 跳转到注册页
 */
const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>用户登录</h2>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button
            text
            type="primary"
            style="width: 100%"
            @click="goToRegister"
          >
            还没有账号？立即注册
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-card {
    width: 450px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    .card-header {
      text-align: center;

      h2 {
        margin: 0;
        color: #333;
      }
    }
  }
}
</style>
