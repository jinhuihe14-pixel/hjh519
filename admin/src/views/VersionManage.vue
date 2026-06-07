<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getConfigVersions, rollbackConfig, publishConfig } from '@/api/version'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Upload, View } from '@element-plus/icons-vue'

const loading = ref(false)
const publishing = ref(false)
const searchForm = ref({
  type: '',
  operator: '',
})
const tableData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getConfigVersions({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value,
    })
    tableData.value = res?.items || [
      { id: 1, version: 'v1.0.5', type: 'all', description: '新增春节活动配置', operator: 'admin', isPublished: true, createdAt: '2024-03-15 14:30:00' },
      { id: 2, version: 'v1.0.4', type: 'level', description: '调整第5关难度', operator: 'planner1', isPublished: true, createdAt: '2024-03-14 10:20:00' },
      { id: 3, version: 'v1.0.3', type: 'item', description: '修改道具价格', operator: 'planner2', isPublished: false, createdAt: '2024-03-13 16:45:00' },
      { id: 4, version: 'v1.0.2', type: 'event', description: '更新周末活动奖励', operator: 'operator1', isPublished: true, createdAt: '2024-03-12 09:00:00' },
      { id: 5, version: 'v1.0.1', type: 'all', description: '初始版本发布', operator: 'admin', isPublished: true, createdAt: '2024-03-01 00:00:00' },
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

const handleRollback = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要回滚到版本 ${row.version} 吗？`,
      '版本回滚',
      { type: 'warning' }
    )
    await rollbackConfig(row.id)
    ElMessage.success('回滚成功')
    fetchData()
  } catch {}
}

const handlePublish = async () => {
  publishing.value = true
  try {
    await publishConfig('all')
    ElMessage.success('发布成功')
    fetchData()
  } finally {
    publishing.value = false
  }
}

const getTypeTag = (type: string) => {
  const map: Record<string, { type: string; text: string }> = {
    all: { type: 'primary', text: '全部' },
    level: { type: 'success', text: '关卡' },
    item: { type: 'warning', text: '道具' },
    event: { type: 'danger', text: '活动' },
    checkin: { type: 'info', text: '签到' },
  }
  return map[type] || { type: 'info', text: type }
}

onMounted(fetchData)
</script>

<template>
  <div class="version-manage">
    <div class="page-header">
      <h2>配置版本管理</h2>
      <el-button type="primary" :icon="Upload" :loading="publishing" @click="handlePublish">
        发布最新配置
      </el-button>
    </div>

    <div class="filter-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="配置类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="all" />
            <el-option label="关卡" value="level" />
            <el-option label="道具" value="item" />
            <el-option label="活动" value="event" />
            <el-option label="签到" value="checkin" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-input
            v-model="searchForm.operator"
            placeholder="操作人账号"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="version" label="版本号" width="120" align="center" />
        <el-table-column label="配置类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type).type" size="small">
              {{ getTypeTag(row.type).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="版本描述" min-width="200" />
        <el-table-column prop="operator" label="操作人" width="120" align="center" />
        <el-table-column label="发布状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isPublished ? 'success' : 'info'" size="small">
              {{ row.isPublished ? '已发布' : '未发布' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button :icon="View" type="primary" size="small" link>查看</el-button>
            <el-button :icon="Refresh" type="warning" size="small" link @click="handleRollback(row)">
              回滚
            </el-button>
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
.version-manage {
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
