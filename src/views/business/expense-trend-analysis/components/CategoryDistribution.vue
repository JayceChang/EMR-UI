<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-chart-pie text-green-600 mr-2"></i>
      费用分类占比分析
    </h3>
    <div class="w-full h-96">
      <a-spin :spinning="loading">
        <div ref="chartRef" class="w-full h-full"></div>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  chartData: {
    type: Array,
    default: () => []
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
      trigger: 'item',
      formatter: (params) => {
        return `
          <div style="font-weight: bold; margin-bottom: 5px;">${params.name}</div>
          <div style="display: flex; align-items: center;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${params.color}; margin-right: 5px;"></span>
            <span>金额: ${formatMoney(params.value)} 万元</span>
          </div>
          <div style="margin-top: 3px;">占比: ${params.percent}%</div>
        `;
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '费用分类',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: true
        },
        data: props.chartData || [],
        color: [
          '#3b82f6', // 蓝色 - 住院费用
          '#22c55e', // 绿色 - 门诊费用
          '#f59e0b', // 橙色 - 药品费用
          '#8b5cf6', // 紫色 - 检查费用
          '#ec4899'  // 粉色 - 治疗费用
        ]
      }
    ]
  };

  chartInstance.setOption(option);
};

// Format money
const formatMoney = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value / 10000).toLocaleString('zh-CN', { 
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