<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getLevels, deleteLevel } from '@/api/level'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, View } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const searchForm = ref({
  keyword: '',
  difficulty: '',
  status: '',
})
const tableData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getLevels({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value,
    })
    tableData.value = res?.items || [
      { id: 1, levelNo: 1, name: '新手村', difficulty: 'easy', moves: 20, targetScore: 1000, rewardCoins: 100, rewardItems: '[]', status: 'active', createdAt: '2024-01-01' },
      { id: 2, levelNo: 2, name: '果园', difficulty: 'easy', moves: 25, targetScore: 2000, rewardCoins: 150, rewardItems: '[]', status: 'active', createdAt: '2024-01-01' },
      { id: 3, levelNo: 3, name: '森林', difficulty: 'medium', moves: 30, targetScore: 3500, rewardCoins: 200, rewardItems: '[]', status: 'active', createdAt: '2024-01-02' },
      { id: 4, levelNo: 4, name: '山脉', difficulty: 'medium', moves: 35, targetScore: 5000, rewardCoins: 250, rewardItems: '[{"itemId":1,"count":5}]', status: 'active', createdAt: '2024-01-03' },
      { id: 5, levelNo: 5, name: '海底', difficulty: 'hard', moves: 40, targetScore: 8000, rewardCoins: 350, rewardItems: '[{"itemId":2,"count":3}]', status: 'inactive', createdAt: '2024-01-05' },
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
  router.push('/levels/new')
}

const handleEdit = (row: any) => {
  router.push(`/levels/${row.id}`)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该关卡吗？', '提示', {
      type: 'warning',
    })
    await deleteLevel(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchData()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

const getDifficultyTag = (difficulty: string) => {
  const map: Record<string, { type: string; text: string }> = {
    easy: { type: 'success', text: '简单' },
    medium: { type: 'warning', text: '中等' },
    hard: { type: 'danger', text: '困难' },
    nightmare: { type: 'info', text: '噩梦' },
  }
  return map[difficulty] || { type: 'info', text: difficulty }
}

const getStatusTag = (status: string) => {
  return status === 'active'
    ? { type: 'success', text: '启用' }
    : { type: 'info', text: '禁用' }
}

onMounted(fetchData)
</script>

<template>
  <div class="level-list">
    <div class="page-header">
      <h2>关卡管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增关卡</el-button>
    </div>

    <div class="filter-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="关卡名称/编号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="searchForm.difficulty" placeholder="全部" clearable style="width: 120px">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="levelNo" label="关卡编号" width="100" align="center" />
        <el-table-column prop="name" label="关卡名称" min-width="120" />
        <el-table-column label="难度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getDifficultyTag(row.difficulty).type">
              {{ getDifficultyTag(row.difficulty).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="moves" label="步数" width="80" align="center" />
        <el-table-column prop="targetScore" label="目标分数" width="120" align="center" />
        <el-table-column prop="rewardCoins" label="金币奖励" width="100" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type" size="small">
              {{ getStatusTag(row.status).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" align="center" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button :icon="Edit" type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button :icon="Delete" type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.level-list {
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
