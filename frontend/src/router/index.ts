import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

/**
 * 路由配置
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Gallery.vue'),
    meta: { title: '画廊' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/Upload.vue'),
    meta: { title: '上传作品', requiresAuth: true }
  },
  {
    path: '/artwork/:id',
    name: 'ArtworkDetail',
    component: () => import('@/views/ArtworkDetail.vue'),
    meta: { title: '作品详情' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 路由守卫
 */
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  document.title = (to.meta.title as string) || '画廊'

  // 需要登录的页面
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 已登录用户访问登录/注册页，重定向到首页
  if ((to.name === 'Login' || to.name === 'Register') && userStore.isLoggedIn) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
