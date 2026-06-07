<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getItem, createItem, updateItem } from '@/api/item'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Upload } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const isNew = route.params.id === 'new'

const form = ref<{
  name: string;
  type: string;
  icon: string;
  description?: string;
  price: number;
  dailyLimit: number;
  globalDailyLimit: number;
  maxStack: number;
  status: string;
}>({
  name: '',
  type: 'consumable',
  icon: '',
  description: '',
  price: 0,
  dailyLimit: 0,
  globalDailyLimit: 0,
  maxStack: 999,
  status: 'active',
})

const iconOptions = ['💰', '❤️', '🔨', '🔄', '💎', '⭐', '🎁', '🏆', '⚡', '🔥']

const fetchData = async () => {
  if (isNew) return
  loading.value = true
  try {
    const res = await getItem(Number(route.params.id))
    if (res) {
      form.value = res
    }
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入道具名称')
    return
  }
  if (!form.value.icon) {
    ElMessage.warning('请选择道具图标')
    return
  }

  saving.value = true
  try {
    if (isNew) {
      await createItem(form.value)
      ElMessage.success('创建成功')
    } else {
      await updateItem(Number(route.params.id), form.value)
      ElMessage.success('保存成功')
    }
    router.push('/items')
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
  <div class="item-edit" v-loading="loading">
    <div class="page-header">
      <el-button :icon="ArrowLeft" link @click="handleBack">返回</el-button>
      <h2>{{ isNew ? '新增道具' : '编辑道具' }}</h2>
      <el-button type="primary" :icon="Upload" :loading="saving" @click="handleSave">
        保存
      </el-button>
    </div>

    <div class="form-card">
      <el-form :model="form" label-width="120px">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="道具名称">
              <el-input v-model="form.name" placeholder="请输入道具名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="道具类型">
              <el-select v-model="form.type" style="width: 100%">
                <el-option label="货币" value="currency" />
                <el-option label="消耗品" value="consumable" />
                <el-option label="稀有道具" value="premium" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="选择图标">
          <div class="icon-selector">
            <div
              v-for="icon in iconOptions"
              :key="icon"
              class="icon-item"
              :class="{ active: form.icon === icon }"
              @click="form.icon = icon"
            >
              {{ icon }}
            </div>
          </div>
        </el-form-item>

        <el-form-item label="道具描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入道具描述"
          />
        </el-form-item>

        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="价格（金币）">
              <el-input-number v-model="form.price" :min="0" :max="99999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="个人日限">
              <el-input-number v-model="form.dailyLimit" :min="0" :max="9999" style="width: 100%">
                <template #append>个（0不限）</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="全服日限">
              <el-input-number v-model="form.globalDailyLimit" :min="0" :max="999999" style="width: 100%">
                <template #append>个（0不限）</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="堆叠上限">
              <el-input-number v-model="form.maxStack" :min="1" :max="99999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-switch
                v-model="form.status"
                active-value="active"
                inactive-value="inactive"
                active-text="上架"
                inactive-text="下架"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-alert
          title="数值校验规则"
          type="warning"
          :closable="false"
          style="margin-top: 20px"
        >
          <p>• 稀有道具价格建议 &gt;= 500 金币</p>
          <p>• 全服日限设置可防止稀有道具泛滥</p>
          <p>• 数值异常时系统将自动阻止保存</p>
        </el-alert>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.item-edit {
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

.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.icon-item {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-item:hover {
  border-color: #6c5ce7;
  transform: scale(1.1);
}

.icon-item.active {
  border-color: #6c5ce7;
  background: rgba(108, 92, 231, 0.1);
}
</style>
