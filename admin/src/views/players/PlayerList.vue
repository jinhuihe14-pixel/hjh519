<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPlayers } from '@/api/player'
import { Search, Present, View } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const searchForm = ref({
  keyword: '',
  platform: '',
})
const tableData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPlayers({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value,
    })
    tableData.value = res?.items || [
      { id: 'P00001', nickname: '快乐消消乐', avatar: '😀', level: 45, coins: 12580, hearts: 45, platform: 'wechat', lastLogin: '2024-03-15 14:30:00', createdAt: '2024-01-01' },
      { id: 'P00002', nickname: '糖果达人', avatar: '🍬', level: 128, coins: 89650, hearts: 99, platform: 'wechat', lastLogin: '2024-03-15 13:20:00', createdAt: '2024-01-02' },
      { id: 'P00003', nickname: '宝石猎人', avatar: '💎', level: 86, coins: 45230, hearts: 30, platform: 'h5', lastLogin: '2024-03-15 10:15:00', createdAt: '2024-01-05' },
      { id: 'P00004', nickname: '新手小白', avatar: '🐣', level: 8, coins: 5600, hearts: 5, platform: 'h5', lastLogin: '2024-03-14 18:45:00', createdAt: '2024-03-10' },
      { id: 'P00005', nickname: '消消乐大师', avatar: '🏆', level: 256, coins: 999999, hearts: 999, platform: 'wechat', lastLogin: '2024-03-15 15:00:00', createdAt: '2023-12-20' },
    ]
    total.value = res?.total || tableData.value.length
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleCompensate = (row: any) => {
  router.push({
    path: '/players/compensation',
    query: { playerId: row.id },
  })
}

const getPlatformTag = (platform: string) => {
  return platform === 'wechat'
    ? { type: 'success', text: '微信' }
    : { type: 'primary', text: 'H5' }
}

onMounted(fetchData)
</script>

<template>
  <div class="player-list">
    <div class="page-header">
      <h2>玩家管理</h2>
    </div>

    <div class="filter-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="玩家ID/昵称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="平台">
          <el-select v-model="searchForm.platform" placeholder="全部" clearable style="width: 120px">
            <el-option label="微信" value="wechat" />
            <el-option label="H5" value="h5" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="玩家ID" width="120" align="center" />
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <span style="font-size: 24px">{{ row.avatar }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="level" label="关卡进度" width="100" align="center" />
        <el-table-column prop="coins" label="金币" width="120" align="center" />
        <el-table-column prop="hearts" label="爱心" width="80" align="center" />
        <el-table-column label="平台" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getPlatformTag(row.platform).type" size="small">
              {{ getPlatformTag(row.platform).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="170" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button :icon="View" type="primary" size="small" link>详情</el-button>
            <el-button :icon="Present" type="warning" size="small" link @click="handleCompensate(row)">补发</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          :total="total"
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="(size: number) => { pageSize = size; fetchData() }"
          @current-change="(page: number) => { currentPage = page; fetchData() }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-list {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.filter-card,
.table-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
