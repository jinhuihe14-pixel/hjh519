import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Login from '@/views/Login.vue'
import Layout from '@/layout/Layout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘' },
      },
      {
        path: 'levels',
        name: 'Levels',
        component: () => import('@/views/levels/LevelList.vue'),
        meta: { title: '关卡管理' },
      },
      {
        path: 'levels/:id',
        name: 'LevelEdit',
        component: () => import('@/views/levels/LevelEdit.vue'),
        meta: { title: '关卡编辑' },
      },
      {
        path: 'items',
        name: 'Items',
        component: () => import('@/views/items/ItemList.vue'),
        meta: { title: '道具商城' },
      },
      {
        path: 'items/:id',
        name: 'ItemEdit',
        component: () => import('@/views/items/ItemEdit.vue'),
        meta: { title: '道具编辑' },
      },
      {
        path: 'checkin',
        name: 'Checkin',
        component: () => import('@/views/CheckinConfig.vue'),
        meta: { title: '签到配置' },
      },
      {
        path: 'events',
        name: 'Events',
        component: () => import('@/views/events/EventList.vue'),
        meta: { title: '活动管理' },
      },
      {
        path: 'events/:id',
        name: 'EventEdit',
        component: () => import('@/views/events/EventEdit.vue'),
        meta: { title: '活动编辑' },
      },
      {
        path: 'players',
        name: 'Players',
        component: () => import('@/views/players/PlayerList.vue'),
        meta: { title: '玩家管理' },
      },
      {
        path: 'players/compensation',
        name: 'Compensation',
        component: () => import('@/views/players/Compensation.vue'),
        meta: { title: '定向补发' },
      },
      {
        path: 'versions',
        name: 'Versions',
        component: () => import('@/views/VersionManage.vue'),
        meta: { title: '配置版本' },
      },
      {
        path: 'reports/retention',
        name: 'RetentionReport',
        component: () => import('@/views/reports/RetentionReport.vue'),
        meta: { title: '留存报表' },
      },
      {
        path: 'reports/items',
        name: 'ItemReport',
        component: () => import('@/views/reports/ItemReport.vue'),
        meta: { title: '道具消耗' },
      },
      {
        path: 'reports/ads',
        name: 'AdReport',
        component: () => import('@/views/reports/AdReport.vue'),
        meta: { title: '广告收益' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (!to.meta.public && !userStore.token) {
    next('/login')
  } else if (to.path === '/login' && userStore.token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
