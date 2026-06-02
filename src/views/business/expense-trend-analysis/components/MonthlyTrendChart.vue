<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-chart-area text-blue-600 mr-2"></i>
      月度费用趋势分析
    </h3>
    <div class="w-full h-96">
      <a-spin :spinning="loading">
        <div ref="chartRef" class="w-full h-full"></div>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  chartData: {
    type: Object,
    default: () => ({
      months: [],
      totalExpense: [],
      employeeExpense: [],
      residentExpense: []
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const chartRef = ref(null);
let chartInstance = null;

// Initialize chart
const initChart = () => {
  if (!chartRef.value) return;

  // Destroy existing instance
  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);
  updateChart();
};

// Update chart with new data
const updateChart = () => {
  if (!chartInstance) return;

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: (params) => {
        let result = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;
        params.forEach(param => {
          result += `
            <div style="display: flex; align-items: center; margin: 3px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 5px;"></span>
              <span>${param.seriesName}: </span>
              <span style="font-weight: bold; margin-left: 5px;">${formatMoney(param.value)} 万元</span>
            </div>
          `;
        });
        return result;
      }
    },
    legend: {
      data: ['总费用', '职工医保', '居民医保'],
      top: 10,
      right: 20
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.chartData.months || [],
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '费用(万元)',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '总费用',
        type: 'line',
        smooth: true,
        data: props.chartData.totalExpense || [],
        itemStyle: {
          color: '#3b82f6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
          ])
        },
        emphasis: {
          focus: 'series'
        }
      },
      {
        name: '职工医保',
        type: 'line',
        smooth: true,
        data: props.chartData.employeeExpense || [],
        itemStyle: {
          color: '#9333ea'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(147, 51, 234, 0.3)' },
            { offset: 1, color: 'rgba(147, 51, 234, 0.05)' }
          ])
        },
        emphasis: {
          focus: 'series'
        }
      },
      {
        name: '居民医保',
        type: 'line',
        smooth: true,
        data: props.chartData.residentExpense || [],
        itemStyle: {
          color: '#22c55e'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 197, 94, 0.3)' },
            { offset: 1, color: 'rgba(34, 197, 94, 0.05)' }
          ])
        },
        emphasis: {
          focus: 'series'
        }
      }
    ]
  };

  chartInstance.setOption(option);
};

// Format money
const formatMoney = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString('zh-CN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

// Handle window resize
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// Lifecycle hooks
onMounted(async () => {
  await nextTick();
  initChart();
  window.addEventListener('resize', handleResize);
});

// Watch for data changes
watch(() => props.chartData, () => {
  if (chartInstance) {
    updateChart();
  }
}, { deep: true });

// Cleanup
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Add any additional styles here */
</style>