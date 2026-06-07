<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCheckinConfig, saveCheckinConfig } from '@/api/checkin'
import { ElMessage } from 'element-plus'
import { Upload, Plus, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const saving = ref(false)
const config = ref({
  enabled: true,
  days: 7,
  rewards: [
    { day: 1, items: [{ itemId: 1, itemName: '金币', count: 100, icon: '💰' }] },
    { day: 2, items: [{ itemId: 2, itemName: '爱心', count: 5, icon: '❤️' }] },
    { day: 3, items: [{ itemId: 1, itemName: '金币', count: 200, icon: '💰' }] },
    { day: 4, items: [{ itemId: 3, itemName: '锤子', count: 1, icon: '🔨' }] },
    { day: 5, items: [{ itemId: 1, itemName: '金币', count: 300, icon: '💰' }] },
    { day: 6, items: [{ itemId: 4, itemName: '刷新卡', count: 1, icon: '🔄' }] },
    { day: 7, items: [
      { itemId: 1, itemName: '金币', count: 500, icon: '💰' },
      { itemId: 5, itemName: '宝石', count: 1, icon: '💎' },
    ]},
  ] as any[],
})

const itemOptions = [
  { id: 1, name: '金币', icon: '💰' },
  { id: 2, name: '爱心', icon: '❤️' },
  { id: 3, name: '锤子', icon: '🔨' },
  { id: 4, name: '刷新卡', icon: '🔄' },
  { id: 5, name: '宝石', icon: '💎' },
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCheckinConfig()
    if (res) {
      config.value = res
    }
  } finally {
    loading.value = false
  }
}

const addRewardItem = (dayIndex: number) => {
  config.value.rewards[dayIndex].items.push({ itemId: 0, itemName: '', count: 1, icon: '' })
}

const removeRewardItem = (dayIndex: number, itemIndex: number) => {
  config.value.rewards[dayIndex].items.splice(itemIndex, 1)
}

const onItemChange = (dayIndex: number, itemIndex: number, itemId: number) => {
  const item = itemOptions.find(i => i.id === itemId)
  if (item) {
    config.value.rewards[dayIndex].items[itemIndex].itemName = item.name
    config.value.rewards[dayIndex].items[itemIndex].icon = item.icon
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    await saveCheckinConfig(config.value)
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="checkin-config">
    <div class="page-header">
      <h2>签到配置</h2>
      <div class="header-actions">
        <el-switch
          v-model="config.enabled"
          active-text="启用签到"
          inactive-text="禁用签到"
        />
        <el-button type="primary" :icon="Upload" :loading="saving" @click="handleSave">
          保存配置
        </el-button>
      </div>
    </div>

    <div class="config-card" v-loading="loading">
      <div class="config-info">
        <el-alert
          title="签到规则说明"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <p>• 玩家每日可签到一次，按累计天数发放奖励</p>
          <p>• 签到中断后从第1天重新开始</p>
          <p>• 完成7天签到后循环从第1天开始</p>
        </el-alert>

        <div class="days-config">
          <div class="day-card" v-for="(day, dayIndex) in config.rewards" :key="day.day">
            <div class="day-header">
              <span class="day-number">第 {{ day.day }} 天</span>
            </div>
            <div class="day-rewards">
              <div
                v-for="(item, itemIndex) in day.items"
                :key="itemIndex"
                class="reward-item"
              >
                <el-select
                  v-model="item.itemId"
                  placeholder="选择道具"
                  size="small"
                  style="width: 120px"
                  @change="onItemChange(dayIndex, itemIndex, $event)"
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
                  size="small"
                  placeholder="数量"
                />
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  circle
                  @click="removeRewardItem(dayIndex, itemIndex)"
                />
              </div>
              <el-button
                type="primary"
                plain
                size="small"
                :icon="Plus"
                @click="addRewardItem(dayIndex)"
              >
                添加奖励
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkin-config {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.config-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.days-config {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.day-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.day-header {
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  color: white;
  padding: 12px;
  text-align: center;
  font-weight: 600;
}

.day-number {
  font-size: 16px;
}

.day-rewards {
  padding: 12px;
}

.reward-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
</style>
