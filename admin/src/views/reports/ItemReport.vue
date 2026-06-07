<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getItemReport } from '@/api/report'

const loading = ref(false)
let barChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const initCharts = () => {
  const barDom = document.getElementById('item-bar-chart')
  const pieDom = document.getElementById('item-pie-chart')

  if (barDom) {
    barChart = echarts.init(barDom)
    barChart.setOption({
      title: { text: '道具消耗趋势', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      legend: { data: ['金币', '爱心', '锤子', '刷新卡'], bottom: 10 },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['03-01', '03-02', '03-03', '03-04', '03-05', '03-06', '03-07'],
      },
      yAxis: { type: 'value' },
      series: [
        { name: '金币', type: 'bar', stack: 'total', data: [12580, 13200, 11800, 14500, 15200, 14800, 16000], itemStyle: { color: '#fdcb6e' } },
        { name: '爱心', type: 'bar', stack: 'total', data: [8960, 9200, 8500, 9800, 10200, 9600, 11000], itemStyle: { color: '#e17055' } },
        { name: '锤子', type: 'bar', stack: 'total', data: [3280, 3500, 3100, 3800, 4100, 3900, 4500], itemStyle: { color: '#6c5ce7' } },
        { name: '刷新卡', type: 'bar', stack: 'total', data: [2150, 2300, 2000, 2600, 2800, 2700, 3000], itemStyle: { color: '#00b894' } },
      ],
    })
  }

  if (pieDom) {
    pieChart = echarts.init(pieDom)
    pieChart.setOption({
      title: { text: '消耗占比', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left', top: 'center' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 20, fontWeight: 'bold' },
          },
          labelLine: { show: false },
          data: [
            { value: 98080, name: '金币', itemStyle: { color: '#fdcb6e' } },
            { value: 67260, name: '爱心', itemStyle: { color: '#e17055' } },
            { value: 26180, name: '锤子', itemStyle: { color: '#6c5ce7' } },
            { value: 17550, name: '刷新卡', itemStyle: { color: '#00b894' } },
            { value: 5420, name: '宝石', itemStyle: { color: '#0984e3' } },
          ],
        },
      ],
    })
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    await getItemReport()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  setTimeout(initCharts, 100)
})
</script>

<template>
  <div class="item-report">
    <div class="page-header">
      <h2>道具消耗</h2>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-label">今日消耗总价值</div>
        <div class="stat-value">¥1,284</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">人均消耗</div>
        <div class="stat-value">12.5</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">付费率</div>
        <div class="stat-value">8.3%</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">ARPU</div>
        <div class="stat-value">¥0.45</div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card" v-loading="loading">
        <div id="item-bar-chart" class="chart-container"></div>
      </div>
      <div class="chart-card" v-loading="loading">
        <div id="item-pie-chart" class="chart-container"></div>
      </div>
    </div>

    <div class="table-card">
      <h3>消耗明细</h3>
      <el-table :data="[]" border stripe>
        <el-table-column prop="itemName" label="道具名称" width="150" />
        <el-table-column prop="totalUsed" label="总消耗" width="120" align="center" />
        <el-table-column prop="avgUsed" label="人均消耗" width="120" align="center" />
        <el-table-column prop="totalValue" label="总价值" width="120" align="center" />
        <el-table-column prop="ratio" label="占比" width="100" align="center" />
        <el-table-column prop="trend" label="趋势" width="120" align="center" />
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.item-report {
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
  color: #6c5ce7;
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
