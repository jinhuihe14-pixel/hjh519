<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getAdReport } from '@/api/report'

const loading = ref(false)
let lineChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const initCharts = () => {
  const lineDom = document.getElementById('ad-line-chart')
  const barDom = document.getElementById('ad-bar-chart')

  if (lineDom) {
    lineChart = echarts.init(lineDom)
    lineChart.setOption({
      title: { text: '收益趋势', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      legend: { data: ['激励视频', '插屏', 'Banner'], bottom: 10 },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['03-01', '03-02', '03-03', '03-04', '03-05', '03-06', '03-07'],
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '¥{value}' },
      },
      series: [
        { name: '激励视频', type: 'line', smooth: true, data: [1280, 1450, 1320, 1580, 1650, 1520, 1750], lineStyle: { width: 3, color: '#6c5ce7' }, itemStyle: { color: '#6c5ce7' } },
        { name: '插屏', type: 'line', smooth: true, data: [580, 620, 550, 680, 720, 650, 780], lineStyle: { width: 3, color: '#00b894' }, itemStyle: { color: '#00b894' } },
        { name: 'Banner', type: 'line', smooth: true, data: [280, 320, 290, 350, 380, 340, 420], lineStyle: { width: 3, color: '#fdcb6e' }, itemStyle: { color: '#fdcb6e' } },
      ],
    })
  }

  if (barDom) {
    barChart = echarts.init(barDom)
    barChart.setOption({
      title: { text: 'eCPM对比', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['本周', '上周'], bottom: 10 },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['激励视频', '插屏', 'Banner', '开屏'],
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '¥{value}' },
      },
      series: [
        {
          name: '本周',
          type: 'bar',
          data: [35.8, 28.5, 12.3, 45.2],
          itemStyle: { color: '#6c5ce7', borderRadius: [4, 4, 0, 0] },
        },
        {
          name: '上周',
          type: 'bar',
          data: [32.5, 26.8, 11.5, 42.8],
          itemStyle: { color: '#a29bfe', borderRadius: [4, 4, 0, 0] },
        },
      ],
    })
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    await getAdReport()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  setTimeout(initCharts, 100)
})
</script>

<template>
  <div class="ad-report">
    <div class="page-header">
      <h2>广告收益</h2>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-label">今日收益</div>
        <div class="stat-value value-high">¥2,950</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">本月收益</div>
        <div class="stat-value value-high">¥85,420</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">人均广告次数</div>
        <div class="stat-value">3.2</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">综合eCPM</div>
        <div class="stat-value">¥25.6</div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card" v-loading="loading">
        <div id="ad-line-chart" class="chart-container"></div>
      </div>
      <div class="chart-card" v-loading="loading">
        <div id="ad-bar-chart" class="chart-container"></div>
      </div>
    </div>

    <div class="table-card">
      <h3>广告位明细</h3>
      <el-table :data="[]" border stripe>
        <el-table-column prop="adName" label="广告位" width="150" />
        <el-table-column prop="impressions" label="曝光" width="120" align="center" />
        <el-table-column prop="clicks" label="点击" width="100" align="center" />
        <el-table-column prop="ctr" label="CTR" width="100" align="center" />
        <el-table-column prop="ecpm" label="eCPM" width="100" align="center" />
        <el-table-column prop="revenue" label="收益" width="120" align="center" />
        <el-table-column prop="ratio" label="占比" width="100" align="center" />
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.ad-report {
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

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card,
.table-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.chart-container {
  height: 350px;
}

.table-card h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
</style>
