<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLevel, createLevel, updateLevel } from '@/api/level'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Upload, Plus, Delete } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const isNew = route.params.id === 'new'
const activeTab = ref('basic')

const form = ref({
  levelNo: 1,
  name: '',
  difficulty: 'easy',
  moves: 20,
  targetScore: 1000,
  rewardCoins: 100,
  rewardItems: [] as any[],
  status: 'active',
  config: {
    gridSize: 8,
    colors: 5,
    obstacles: [] as any[],
    specialBlocks: [] as any[],
  },
})

const itemOptions = [
  { id: 1, name: '金币', icon: '💰' },
  { id: 2, name: '爱心', icon: '❤️' },
  { id: 3, name: '锤子', icon: '🔨' },
  { id: 4, name: '刷新卡', icon: '🔄' },
  { id: 5, name: '宝石', icon: '💎' },
]

const addRewardItem = () => {
  form.value.rewardItems.push({ itemId: 0, itemName: '', count: 1, icon: '' })
}

const removeRewardItem = (index: number) => {
  form.value.rewardItems.splice(index, 1)
}

const onItemChange = (index: number, itemId: number) => {
  const item = itemOptions.find(i => i.id === itemId)
  if (item) {
    form.value.rewardItems[index].itemName = item.name
    form.value.rewardItems[index].icon = item.icon
  }
}

const fetchData = async () => {
  if (isNew) return
  loading.value = true
  try {
    const res = await getLevel(Number(route.params.id))
    if (res) {
      form.value = { ...res, rewardItems: res.rewardItems || [] }
    }
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入关卡名称')
    return
  }

  saving.value = true
  try {
    if (isNew) {
      await createLevel(form.value)
      ElMessage.success('创建成功')
    } else {
      await updateLevel(Number(route.params.id), form.value)
      ElMessage.success('保存成功')
    }
    router.push('/levels')
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
  <div class="level-edit" v-loading="loading">
    <div class="page-header">
      <el-button :icon="ArrowLeft" link @click="handleBack">返回</el-button>
      <h2>{{ isNew ? '新增关卡' : '编辑关卡' }}</h2>
      <el-button type="primary" :icon="Upload" :loading="saving" @click="handleSave">
        保存
      </el-button>
    </div>

    <div class="form-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="form" label-width="120px">
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="关卡编号">
                  <el-input-number v-model="form.levelNo" :min="1" :max="9999" />
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="关卡名称">
                  <el-input v-model="form.name" placeholder="请输入关卡名称" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="难度">
                  <el-select v-model="form.difficulty" style="width: 100%">
                    <el-option label="简单" value="easy" />
                    <el-option label="中等" value="medium" />
                    <el-option label="困难" value="hard" />
                    <el-option label="噩梦" value="nightmare" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="步数">
                  <el-input-number v-model="form.moves" :min="1" :max="100" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="目标分数">
                  <el-input-number v-model="form.targetScore" :min="1" :max="999999" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="金币奖励">
                  <el-input-number v-model="form.rewardCoins" :min="0" :max="99999" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="状态">
                  <el-switch
                    v-model="form.status"
                    active-value="active"
                    inactive-value="inactive"
                    active-text="启用"
                    inactive-text="禁用"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="道具奖励" name="rewards">
          <div class="rewards-section">
            <div
              v-for="(item, index) in form.rewardItems"
              :key="index"
              class="reward-row"
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
              <el-button type="danger" :icon="Delete" circle @click="removeRewardItem(index)" />
            </div>
            <el-button type="primary" plain :icon="Plus" @click="addRewardItem">
              添加奖励道具
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="关卡配置" name="config">
          <el-form :model="form.config" label-width="120px">
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="网格大小">
                  <el-input-number v-model="form.config.gridSize" :min="6" :max="10" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="颜色数量">
                  <el-input-number v-model="form.config.colors" :min="3" :max="8" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-alert
              title="高级配置说明"
              type="info"
              :closable="false"
            >
              <p>• 可配置障碍物位置、特殊方块等高级属性</p>
              <p>• 详细配置请联系开发人员或使用关卡编辑器</p>
            </el-alert>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.level-edit {
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

.rewards-section {
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
