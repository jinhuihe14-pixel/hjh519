<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Menu,
  Fold,
  Expand,
  DataAnalysis,
  Grid,
  Goods,
  Calendar,
  Present,
  User,
  Document,
  TrendCharts,
  SwitchButton,
  Avatar,
  CaretBottom,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const userDropdown = ref(false)

const menuItems = [
  { path: '/dashboard', title: '仪表盘', icon: DataAnalysis },
  { path: '/levels', title: '关卡管理', icon: Grid },
  { path: '/items', title: '道具商城', icon: Goods },
  { path: '/checkin', title: '签到配置', icon: Calendar },
  { path: '/events', title: '活动管理', icon: Present },
  { path: '/players', title: '玩家管理', icon: User },
  { path: '/versions', title: '配置版本', icon: Document },
  {
    title: '数据报表',
    icon: TrendCharts,
    children: [
      { path: '/reports/retention', title: '留存分析' },
      { path: '/reports/items', title: '道具消耗' },
      { path: '/reports/ads', title: '广告收益' },
    ],
  },
]

const activeMenu = computed(() => route.path)

const handleLogout = async () => {
  await userStore.handleLogout()
  router.push('/login')
}
</script>

<template>
  <div class="layout-container">
    <el-container class="h-full">
      <el-aside
        :width="isCollapse ? '64px' : '220px'"
        class="sidebar"
        :class="{ collapsed: isCollapse }"
      >
        <div class="logo">
          <span v-if="!isCollapse">🎮 三消运营后台</span>
          <span v-else>🎮</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :unique-opened="true"
          router
          background-color="#1f2937"
          text-color="#9ca3af"
          active-text-color="#6c5ce7"
        >
          <template v-for="item in menuItems" :key="item.path || item.title">
            <el-sub-menu v-if="item.children" :index="item.title">
              <template #title>
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{ item.title }}</span>
              </template>
              <el-menu-item
                v-for="child in item.children"
                :key="child.path"
                :index="child.path"
              >
                {{ child.title }}
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="item.path">
              <el-icon><component :is="item.icon" /></el-icon>
              <template #title>{{ item.title }}</template>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <el-container class="main-container">
        <el-header class="header">
          <div class="header-left">
            <el-button
              class="toggle-btn"
              :icon="isCollapse ? Expand : Fold"
              circle
              @click="isCollapse = !isCollapse"
            />
          </div>
          <div class="header-right">
            <el-dropdown @command="handleLogout">
              <div class="user-info">
                <el-avatar :size="32" :icon="Avatar" />
                <span class="username">{{ userStore.userInfo?.username }}</span>
                <el-icon><CaretBottom /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background: #1f2937;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 64px;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #374151;
}

.main-container {
  margin-left: 220px;
  transition: margin-left 0.3s;
}

:deep(.sidebar.collapsed + .main-container) {
  margin-left: 64px;
}

.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.toggle-btn {
  background: transparent;
  border: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f3f4f6;
}

.username {
  font-size: 14px;
  color: #374151;
}

.main-content {
  background: #f9fafb;
  min-height: calc(100vh - 60px);
  padding: 24px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.el-menu) {
  border-right: none;
}
</style>
