<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getItems, deleteItem } from '@/api/item'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, Upload } from '@element-plus/icons-vue'

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
    const res = await getItems({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value,
    })
    tableData.value = res?.items || [
      { id: 1, name: '金币', type: 'currency', icon: '💰', price: 0, dailyLimit: 0, globalDailyLimit: 0, status: 'active', createdAt: '2024-01-01' },
      { id: 2, name: '爱心', type: 'currency', icon: '❤️', price: 0, dailyLimit: 50, globalDailyLimit: 10000, status: 'active', createdAt: '2024-01-01' },
      { id: 3, name: '锤子', type: 'consumable', icon: '🔨', price: 100, dailyLimit: 0, globalDailyLimit: 500, status: 'active', createdAt: '2024-01-02' },
      { id: 4, name: '刷新卡', type: 'consumable', icon: '🔄', price: 150, dailyLimit: 0, globalDailyLimit: 300, status: 'active', createdAt: '2024-01-03' },
      { id: 5, name: '宝石', type: 'premium', icon: '💎', price: 500, dailyLimit: 10, globalDailyLimit: 100, status: 'inactive', createdAt: '2024-01-05' },
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
  router.push('/items/new')
}

const handleEdit = (row: any) => {
  router.push(`/items/${row.id}`)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该道具吗？', '提示', {
      type: 'warning',
    })
    await deleteItem(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

const getTypeTag = (type: string) => {
  const map: Record<string, { type: string; text: string }> = {
    currency: { type: 'success', text: '货币' },
    consumable: { type: 'warning', text: '消耗品' },
    premium: { type: 'danger', text: '稀有' },
  }
  return map[type] || { type: 'info', text: type }
}

const getStatusTag = (status: string) => {
  return status === 'active'
    ? { type: 'success', text: '上架' }
    : { type: 'info', text: '下架' }
}

onMounted(fetchData)
</script>

<template>
  <div class="item-list">
    <div class="page-header">
      <h2>道具商城</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增道具</el-button>
    </div>

    <div class="filter-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="道具名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 120px">
            <el-option label="货币" value="currency" />
            <el-option label="消耗品" value="consumable" />
            <el-option label="稀有" value="premium" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="上架" value="active" />
            <el-option label="下架" value="inactive" />
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
        <el-table-column label="图标" width="80" align="center">
          <template #default="{ row }">
            <span style="font-size: 24px">{{ row.icon }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="道具名称" min-width="120" />
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type).type" size="small">
              {{ getTypeTag(row.type).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100" align="center" />
        <el-table-column prop="dailyLimit" label="个人日限" width="100" align="center">
          <template #default="{ row }">
            {{ row.dailyLimit || '不限' }}
          </template>
        </el-table-column>
        <el-table-column prop="globalDailyLimit" label="全服日限" width="100" align="center">
          <template #default="{ row }">
            {{ row.globalDailyLimit || '不限' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type" size="small">
              {{ getStatusTag(row.status).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
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
          @size-change="(size: number) => { pageSize = size; fetchData() }"
          @current-change="(page: number) => { currentPage = page; fetchData() }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-list {
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
