<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">
      <i class="fas fa-chart-line mr-2 text-purple-500"></i>
      趋势分析图表
    </h2>
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 住院人次数趋势 -->
      <div class="bg-gray-50 p-4 rounded-lg shadow-md flex flex-col">
        <h3 class="text-lg font-medium text-gray-700 mb-3">住院人次数趋势</h3>
        <div ref="patientsChartRef" class="flex-1 min-h-[400px]"></div>
      </div>

      <!-- 次均费用趋势 -->
      <div class="bg-gray-50 p-4 rounded-lg shadow-md flex flex-col">
        <h3 class="text-lg font-medium text-gray-700 mb-3">次均费用趋势</h3>
        <div ref="avgCostChartRef" class="flex-1 min-h-[400px]"></div>
      </div>

      <!-- 次均住院日趋势 -->
      <div class="bg-gray-50 p-4 rounded-lg shadow-md flex flex-col">
        <h3 class="text-lg font-medium text-gray-700 mb-3">次均住院日趋势</h3>
        <div ref="avgDaysChartRef" class="flex-1 min-h-[400px]"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Chart refs
const patientsChartRef = ref(null);
const avgCostChartRef = ref(null);
const avgDaysChartRef = ref(null);

// Chart instances
let patientsChart = null;
let avgCostChart = null;
let avgDaysChart = null;

// Initialize charts
const initCharts = () => {
  if (patientsChartRef.value && !patientsChart) {
    patientsChart = echarts.init(patientsChartRef.value);
  }
  if (avgCostChartRef.value && !avgCostChart) {
    avgCostChart = echarts.init(avgCostChartRef.value);
  }
  if (avgDaysChartRef.value && !avgDaysChart) {
    avgDaysChart = echarts.init(avgDaysChartRef.value);
  }
};

// Render trend charts
const renderTrendCharts = () => {
  if (!props.data || !props.data.months) {
    // Clear charts if no data
    if (patientsChart) {
      patientsChart.clear();
      patientsChart.showLoading({ text: '暂无数据' });
    }
    if (avgCostChart) {
      avgCostChart.clear();
      avgCostChart.showLoading({ text: '暂无数据' });
    }
    if (avgDaysChart) {
      avgDaysChart.clear();
      avgDaysChart.showLoading({ text: '暂无数据' });
    }
    return;
  }

  const { months, patients = [], avgCost = [], avgDays = [] } = props.data;

  // Hide loading
  if (patientsChart) {
    patientsChart.hideLoading();
    patientsChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: { rotate: 45 }
      },
      yAxis: { type: 'value', name: '人次' },
      series: [{
        name: '住院人次',
        type: 'line',
        data: patients,
        smooth: true,
        lineStyle: { color: '#4F46E5', width: 3 },
        itemStyle: { color: '#4F46E5' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(79, 70, 229, 0.3)' },
            { offset: 1, color: 'rgba(79, 70, 229, 0.05)' }
          ])
        }
      }],
      grid: { left: '10%', right: '10%', bottom: '15%', top: '10%' }
    });
  }

  if (avgCostChart) {
    avgCostChart.hideLoading();
    avgCostChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: { rotate: 45 }
      },
      yAxis: { type: 'value', name: '费用 (元)' },
      series: [{
        name: '次均费用',
        type: 'line',
        data: avgCost,
        smooth: true,
        lineStyle: { color: '#10B981', width: 3 },
        itemStyle: { color: '#10B981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
          ])
        }
      }],
      grid: { left: '10%', right: '10%', bottom: '15%', top: '10%' }
    });
  }

  if (avgDaysChart) {
    avgDaysChart.hideLoading();
    avgDaysChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: { rotate: 45 }
      },
      yAxis: { type: 'value', name: '天' },
      series: [{
        name: '次均住院日',
        type: 'line',
        data: avgDays,
        smooth: true,
        lineStyle: { color: '#F59E0B', width: 3 },
        itemStyle: { color: '#F59E0B' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
            { offset: 1, color: 'rgba(245, 158, 11, 0.05)' }
          ])
        }
      }],
      grid: { left: '10%', right: '10%', bottom: '15%', top: '10%' }
    });
  }
};

// Resize charts
const resizeCharts = () => {
  if (patientsChart) patientsChart.resize();
  if (avgCostChart) avgCostChart.resize();
  if (avgDaysChart) avgDaysChart.resize();
};

// Watch for data changes
watch(() => props.data, () => {
  nextTick(() => {
    renderTrendCharts();
  });
}, { deep: true });

// Lifecycle
onMounted(() => {
  nextTick(() => {
    initCharts();
    renderTrendCharts();
    window.addEventListener('resize', resizeCharts);
  });
});

onUnmounted(() => {
  if (patientsChart) {
    patientsChart.dispose();
    patientsChart = null;
  }
  if (avgCostChart) {
    avgCostChart.dispose();
    avgCostChart = null;
  }
  if (avgDaysChart) {
    avgDaysChart.dispose();
    avgDaysChart = null;
  }
  window.removeEventListener('resize', resizeCharts);
});
</script>

<style scoped>
</style>
