<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCompensationRecords, createCompensation } from '@/api/player'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

const route = useRoute()
const loading = ref(false)
const submitting = ref(false)
const playerId = ref(route.query.playerId as string || '')
const reason = ref('')
const items = ref<Array<{ itemId: number; itemName: string; count: number; icon: string }>>([])
const tableData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const itemOptions = [
  { id: 1, name: '金币', icon: '💰' },
  { id: 2, name: '爱心', icon: '❤️' },
  { id: 3, name: '锤子', icon: '🔨' },
  { id: 4, name: '刷新卡', icon: '🔄' },
  { id: 5, name: '宝石', icon: '💎' },
]

const addItem = () => {
  items.value.push({ itemId: 0, itemName: '', count: 1, icon: '' })
}

const removeItem = (index: number) => {
  items.value.splice(index, 1)
}

const onItemChange = (index: number, itemId: number) => {
  const item = itemOptions.find(i => i.id === itemId)
  if (item) {
    items.value[index].itemName = item.name
    items.value[index].icon = item.icon
  }
}

const handleSubmit = async () => {
  if (!playerId.value) {
    ElMessage.warning('请输入玩家ID')
    return
  }
  if (items.value.length === 0) {
    ElMessage.warning('请添加补发道具')
    return
  }
  if (!reason.value) {
    ElMessage.warning('请输入补发原因')
    return
  }

  submitting.value = true
  try {
    await createCompensation({
      playerId: playerId.value,
      items: items.value.map(i => ({ itemId: i.itemId, count: i.count })),
      reason: reason.value,
    })
    ElMessage.success('补发成功')
    items.value = []
    reason.value = ''
    fetchData()
  } finally {
    submitting.value = false
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCompensationRecords({
      page: currentPage.value,
      pageSize: pageSize.value,
      playerId: playerId.value,
    })
    tableData.value = res?.items || [
      { id: 1, playerId: 'P00001', playerName: '快乐消消乐', items: '[{"name":"金币","count":500},{"name":"爱心","count":10}]', reason: 'bug补偿', operator: 'admin', createdAt: '2024-03-15 14:30:00' },
      { id: 2, playerId: 'P00003', playerName: '宝石猎人', items: '[{"name":"锤子","count":5}]', reason: '活动奖励补发', operator: 'admin', createdAt: '2024-03-14 10:20:00' },
    ]
    total.value = res?.total || tableData.value.length
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="compensation">
    <div class="page-header">
      <h2>定向补发</h2>
    </div>

    <div class="form-card">
      <h3>补发信息</h3>
      <el-form label-width="100px">
        <el-form-item label="玩家ID">
          <el-input
            v-model="playerId"
            placeholder="请输入玩家ID"
            style="width: 300px"
            clearable
          />
        </el-form-item>

        <el-form-item label="补发道具">
          <div class="items-container">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="item-row"
            >
              <el-select
                v-model="item.itemId"
                placeholder="选择道具"
                style="width: 150px"
                @change="onItemChange(index, $event)"
              >
                <el-option
                  v-for="opt in itemOptions"
                  :key="opt.id"
                  :label="`${opt.icon} ${opt.name}`"
                  :value="opt.id"
                />
              </el-select>
              <el-input-number
                v-model="item.count"
                :min="1"
                :max="9999"
                placeholder="数量"
              />
              <el-button type="danger" size="small" @click="removeItem(index)">删除</el-button>
            </div>
            <el-button type="primary" plain :icon="Plus" @click="addItem">添加道具</el-button>
          </div>
        </el-form-item>

        <el-form-item label="补发原因">
          <el-input
            v-model="reason"
            type="textarea"
            :rows="3"
            placeholder="请输入补发原因，用于存档记录"
            style="width: 500px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            确认补发
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <h3>补发记录</h3>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="playerId" label="玩家ID" width="120" align="center" />
        <el-table-column prop="playerName" label="玩家昵称" width="120" />
        <el-table-column label="补发内容" min-width="200">
          <template #default="{ row }">
            <span v-html="row.items.replace(/\[|\]/g, '').replace(/,/g, '<br/>')" />
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="150" />
        <el-table-column prop="operator" label="操作人" width="100" align="center" />
        <el-table-column prop="createdAt" label="时间" width="170" align="center" />
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
.compensation {
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

.form-card,
.table-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-card h3,
.table-card h3 {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
