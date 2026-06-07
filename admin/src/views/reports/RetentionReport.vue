<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { getRetentionReport } from '@/api/report'

import { Search } from '@element-plus/icons-vue'

const loading = ref(false)
const dateRange = ref<[Date, Date] | null>(null)
let chart: echarts.ECharts | null = null

const initChart = () => {
  const dom = document.getElementById('retention-chart')
  if (dom) {
    chart = echarts.init(dom)
    updateChart()
  }
}

const updateChart = () => {
  if (!chart) return

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['次日留存', '3日留存', '7日留存', '14日留存', '30日留存'],
      top: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '80px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['03-01', '03-02', '03-03', '03-04', '03-05', '03-06', '03-07', '03-08', '03-09', '03-10'],
      axisLabel: { rotate: 0 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' },
    },
    series: [
      {
        name: '次日留存',
        type: 'line',
        smooth: true,
        data: [65, 68, 62, 70, 75, 80, 72, 68, 70, 73],
        lineStyle: { width: 2, color: '#6c5ce7' },
        itemStyle: { color: '#6c5ce7' },
        areaStyle: { opacity: 0.1, color: '#6c5ce7' },
      },
      {
        name: '3日留存',
        type: 'line',
        smooth: true,
        data: [45, 48, 42, 50, 55, 60, 52, 48, 50, 53],
        lineStyle: { width: 2, color: '#00b894' },
        itemStyle: { color: '#00b894' },
        areaStyle: { opacity: 0.1, color: '#00b894' },
      },
      {
        name: '7日留存',
        type: 'line',
        smooth: true,
        data: [35, 38, 32, 40, 45, 50, 42, 38, 40, 43],
        lineStyle: { width: 2, color: '#fdcb6e' },
        itemStyle: { color: '#fdcb6e' },
        areaStyle: { opacity: 0.1, color: '#fdcb6e' },
      },
      {
        name: '14日留存',
        type: 'line',
        smooth: true,
        data: [25, 28, 22, 30, 35, 40, 32, 28, 30, 33],
        lineStyle: { width: 2, color: '#e17055' },
        itemStyle: { color: '#e17055' },
        areaStyle: { opacity: 0.1, color: '#e17055' },
      },
      {
        name: '30日留存',
        type: 'line',
        smooth: true,
        data: [15, 18, 12, 20, 25, 30, 22, 18, 20, 23],
        lineStyle: { width: 2, color: '#0984e3' },
        itemStyle: { color: '#0984e3' },
        areaStyle: { opacity: 0.1, color: '#0984e3' },
      },
    ],
  })
}

const fetchData = async () => {
  loading.value = true
  try {
    await getRetentionReport({ dateRange: dateRange.value })
    updateChart()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  setTimeout(initChart, 100)
})
</script>

<template>
  <div class="retention-report">
    <div class="page-header">
      <h2>留存分析</h2>
      <div class="filter-bar">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="default"
        />
        <el-button type="primary" :icon="Search" @click="fetchData">查询</el-button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-label">平均次日留存</div>
        <div class="stat-value value-high">70.3%</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">平均7日留存</div>
        <div class="stat-value value-medium">40.5%</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">平均30日留存</div>
        <div class="stat-value value-low">20.1%</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">统计周期</div>
        <div class="stat-value">近30天</div>
      </div>
    </div>

    <div class="chart-card" v-loading="loading">
      <div id="retention-chart" class="chart-container"></div>
    </div>

    <div class="table-card">
      <h3>留存明细</h3>
      <el-table :data="[]" border stripe>
        <el-table-column prop="date" label="日期" width="120" align="center" />
        <el-table-column prop="newUsers" label="新增用户" width="120" align="center" />
        <el-table-column prop="d1" label="次日留存" width="100" align="center" />
        <el-table-column prop="d3" label="3日留存" width="100" align="center" />
        <el-table-column prop="d7" label="7日留存" width="100" align="center" />
        <el-table-column prop="d14" label="14日留存" width="100" align="center" />
        <el-table-column prop="d30" label="30日留存" width="100" align="center" />
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.retention-report {
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

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.stat-value.value-high {
  color: #00b894;
}

.stat-value.value-medium {
  color: #fdcb6e;
}

.stat-value.value-low {
  color: #e17055;
}

.chart-card,
.table-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.chart-container {
  height: 400px;
}

.table-card h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
</style>
