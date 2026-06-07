<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getEvents, toggleEventStatus } from '@/api/event'
import { ElMessage } from 'element-plus'
import { Search, Plus, Edit, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const searchForm = ref({
  keyword: '',
  type: '',
  status: '',
})
const tableData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getEvents({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value,
    })
    tableData.value = res?.items || [
      { id: 1, name: '新手福利活动', type: 'newbie', startTime: '2024-01-01 00:00:00', endTime: '2024-12-31 23:59:59', status: 'active', isRunning: true, createdAt: '2024-01-01' },
      { id: 2, name: '春节双倍奖励', type: 'festival', startTime: '2024-02-09 00:00:00', endTime: '2024-02-17 23:59:59', status: 'active', isRunning: true, createdAt: '2024-01-20' },
      { id: 3, name: '周末限时挑战', type: 'challenge', startTime: '2024-03-01 00:00:00', endTime: '2024-03-03 23:59:59', status: 'inactive', isRunning: false, createdAt: '2024-02-25' },
      { id: 4, name: '五一劳动节活动', type: 'festival', startTime: '2024-05-01 00:00:00', endTime: '2024-05-05 23:59:59', status: 'active', isRunning: false, createdAt: '2024-04-20' },
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

const handleAdd = () => {
  router.push('/events/new')
}

const handleEdit = (row: any) => {
  router.push(`/events/${row.id}`)
}

const handleToggle = async (row: any) => {
  try {
    await toggleEventStatus(row.id, row.status === 'active' ? 'inactive' : 'active')
    ElMessage.success('状态更新成功')
    fetchData()
  } catch {}
}

const getTypeTag = (type: string) => {
  const map: Record<string, { type: string; text: string }> = {
    newbie: { type: 'success', text: '新手' },
    festival: { type: 'warning', text: '节日' },
    challenge: { type: 'primary', text: '挑战' },
    daily: { type: 'info', text: '日常' },
  }
  return map[type] || { type: 'info', text: type }
}

const getStatusTag = (status: string, isRunning: boolean) => {
  if (status !== 'active') return { type: 'info', text: '未开启' }
  return isRunning
    ? { type: 'success', text: '进行中' }
    : { type: 'warning', text: '待开始' }
}

onMounted(fetchData)
</script>

<template>
  <div class="event-list">
    <div class="page-header">
      <h2>活动管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增活动</el-button>
    </div>

    <div class="filter-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="活动名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 120px">
            <el-option label="新手" value="newbie" />
            <el-option label="节日" value="festival" />
            <el-option label="挑战" value="challenge" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="进行中" value="running" />
            <el-option label="待开始" value="pending" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="活动名称" min-width="150" />
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type).type" size="small">
              {{ getTypeTag(row.type).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="170" align="center" />
        <el-table-column prop="endTime" label="结束时间" width="170" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status, row.isRunning).type" size="small">
              {{ getStatusTag(row.status, row.isRunning).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="启停" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="inactive"
              @change="handleToggle(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button :icon="Edit" type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
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
.event-list {
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
