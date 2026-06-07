<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { publishConfig } from '@/api/version'
import { ElMessage } from 'element-plus'
import {
  UserFilled,
  Coin,
  TrendCharts,
  Money,
  Refresh,
  Upload,
} from '@element-plus/icons-vue'

const stats = ref([
  { title: '今日活跃用户', value: 0, icon: UserFilled, color: '#6c5ce7', change: '+12.5%' },
  { title: '新增用户', value: 0, icon: Coin, color: '#00b894', change: '+8.2%' },
  { title: '广告收益', value: '¥0', icon: Money, color: '#fdcb6e', change: '+15.3%' },
  { title: '关卡通过率', value: '0%', icon: TrendCharts, color: '#e17055', change: '-2.1%' },
])

const publishing = ref(false)

let retentionChart: echarts.ECharts | null = null
let itemsChart: echarts.ECharts | null = null

const handlePublish = async () => {
  publishing.value = true
  try {
    await publishConfig('all')
    ElMessage.success('配置发布成功！')
  } finally {
    publishing.value = false
  }
}

const initCharts = () => {
  const retentionDom = document.getElementById('retention-chart')
  if (retentionDom) {
    retentionChart = echarts.init(retentionDom)
    retentionChart.setOption({
      title: { text: '7日留存趋势', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      legend: { data: ['次日留存', '7日留存'], bottom: 10 },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      series: [
        {
          name: '次日留存',
          type: 'line',
          smooth: true,
          data: [65, 68, 62, 70, 75, 80, 72],
          areaStyle: { opacity: 0.1 },
          lineStyle: { color: '#6c5ce7' },
          itemStyle: { color: '#6c5ce7' },
        },
        {
          name: '7日留存',
          type: 'line',
          smooth: true,
          data: [35, 38, 32, 40, 45, 50, 42],
          areaStyle: { opacity: 0.1 },
          lineStyle: { color: '#00b894' },
          itemStyle: { color: '#00b894' },
        },
      ],
    })
  }

  const itemsDom = document.getElementById('items-chart')
  if (itemsDom) {
    itemsChart = echarts.init(itemsDom)
    itemsChart.setOption({
      title: { text: '道具消耗排行', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        data: ['金币', '爱心', '宝石', '锤子', '刷新卡'],
      },
      series: [
        {
          type: 'bar',
          data: [12580, 8960, 5420, 3280, 2150],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#6c5ce7' },
              { offset: 1, color: '#a29bfe' },
            ]),
            borderRadius: [0, 4, 4, 0],
          },
        },
      ],
    })
  }
}

onMounted(() => {
  stats.value[0].value = 2847
  stats.value[1].value = 156
  stats.value[2].value = '¥2,847'
  stats.value[3].value = '68.5%'

  setTimeout(initCharts, 100)
})
</script>

<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>数据概览</h2>
      <el-button type="primary" :icon="Upload" :loading="publishing" @click="handlePublish">
        发布配置
      </el-button>
    </div>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.title" class="stat-card">
        <div class="stat-icon" :style="{ background: stat.color }">
          <el-icon :size="24" color="white"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-change" :class="stat.change.startsWith('+') ? 'up' : 'down'">
            {{ stat.change }}
          </div>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <div id="retention-chart" class="chart-container"></div>
      </div>
      <div class="chart-card">
        <div id="items-chart" class="chart-container"></div>
      </div>
    </div>

    <div class="quick-actions">
      <h3>快捷操作</h3>
      <div class="action-buttons">
        <el-button type="primary" @click="$router.push('/levels')">关卡管理</el-button>
        <el-button type="success" @click="$router.push('/events')">活动管理</el-button>
        <el-button type="warning" @click="$router.push('/players/compensation')">定向补发</el-button>
        <el-button type="info" @click="$router.push('/versions')">版本管理</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
}

.stat-change.up {
  color: #00b894;
}

.stat-change.down {
  color: #e17055;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.chart-container {
  height: 320px;
}

.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.quick-actions h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.action-buttons {
  display: flex;
  gap: 12px;
}
</style>
