<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getEvent, createEvent, updateEvent } from '@/api/event'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Upload, Plus, Delete } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const isNew = route.params.id === 'new'

const form = ref({
  name: '',
  type: 'festival',
  description: '',
  startTime: '',
  endTime: '',
  status: 'active',
  rules: {
    rewardMultiplier: 1,
    dropRateBonus: 0,
    dailyLimit: 0,
    specialRewards: [] as any[],
  },
})

const itemOptions = [
  { id: 1, name: '金币', icon: '💰' },
  { id: 2, name: '爱心', icon: '❤️' },
  { id: 3, name: '锤子', icon: '🔨' },
  { id: 4, name: '刷新卡', icon: '🔄' },
  { id: 5, name: '宝石', icon: '💎' },
]

const addReward = () => {
  form.value.rules.specialRewards.push({ itemId: 0, itemName: '', count: 1, icon: '', condition: '' })
}

const removeReward = (index: number) => {
  form.value.rules.specialRewards.splice(index, 1)
}

const onItemChange = (index: number, itemId: number) => {
  const item = itemOptions.find(i => i.id === itemId)
  if (item) {
    form.value.rules.specialRewards[index].itemName = item.name
    form.value.rules.specialRewards[index].icon = item.icon
  }
}

const fetchData = async () => {
  if (isNew) return
  loading.value = true
  try {
    const res = await getEvent(Number(route.params.id))
    if (res) {
      form.value = res
    }
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入活动名称')
    return
  }
  if (!form.value.startTime || !form.value.endTime) {
    ElMessage.warning('请设置活动时间')
    return
  }

  saving.value = true
  try {
    if (isNew) {
      await createEvent(form.value)
      ElMessage.success('创建成功')
    } else {
      await updateEvent(Number(route.params.id), form.value)
      ElMessage.success('保存成功')
    }
    router.push('/events')
  } finally {
    saving.value = false
  }
}

const handleBack = () => {
  router.back()
}

onMounted(fetchData)
</script>

<template>
  <div class="event-edit" v-loading="loading">
    <div class="page-header">
      <el-button :icon="ArrowLeft" link @click="handleBack">返回</el-button>
      <h2>{{ isNew ? '新增活动' : '编辑活动' }}</h2>
      <el-button type="primary" :icon="Upload" :loading="saving" @click="handleSave">
        保存
      </el-button>
    </div>

    <div class="form-card">
      <el-form :model="form" label-width="120px">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="活动名称">
              <el-input v-model="form.name" placeholder="请输入活动名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动类型">
              <el-select v-model="form.type" style="width: 100%">
                <el-option label="新手活动" value="newbie" />
                <el-option label="节日活动" value="festival" />
                <el-option label="挑战活动" value="challenge" />
                <el-option label="日常活动" value="daily" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="活动描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
          />
        </el-form-item>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="活动状态">
          <el-switch
            v-model="form.status"
            active-value="active"
            inactive-value="inactive"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>

        <el-divider content-position="left">活动规则</el-divider>

        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="奖励倍率">
              <el-input-number
                v-model="form.rules.rewardMultiplier"
                :min="0.1"
                :max="10"
                :step="0.1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="掉落加成(%)">
              <el-input-number
                v-model="form.rules.dropRateBonus"
                :min="0"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="每日参与上限">
              <el-input-number
                v-model="form.rules.dailyLimit"
                :min="0"
                :max="999"
                style="width: 100%"
              >
                <template #append>次（0不限）</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="特殊奖励">
          <div class="rewards-list">
            <div
              v-for="(reward, index) in form.rules.specialRewards"
              :key="index"
              class="reward-row"
            >
              <el-select
                v-model="reward.itemId"
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
              <el-input-number v-model="reward.count" :min="1" :max="9999" placeholder="数量" />
              <el-input
                v-model="reward.condition"
                placeholder="触发条件"
                style="width: 150px"
              />
              <el-button type="danger" :icon="Delete" circle @click="removeReward(index)" />
            </div>
            <el-button type="primary" plain :icon="Plus" @click="addReward">
              添加特殊奖励
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.event-edit {
  padding: 0;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h2 {
  flex: 1;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.rewards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reward-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
