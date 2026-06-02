<template>
  <div class="bg-white rounded-xl shadow-lg p-6 flex-grow">
    <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-chart-area text-purple-600 mr-2"></i>
      {{ title }}
    </h2>
    <div :id="chartId" class="w-full h-80"></div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  chartId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: '趋势图'
  }
});

const chartInstance = ref(null);

// Initialize chart
const initChart = () => {
  nextTick(() => {
    const chartDom = document.getElementById(props.chartId);
    if (!chartDom) return;

    chartInstance.value = echarts.init(chartDom);
    renderChart();
  });
};

// Render chart
const renderChart = () => {
  if (!chartInstance.value || !props.chartData) return;

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.chartData.years || [],
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '参保人数 (万人)',
      axisLabel: {
        color: '#666'
      }
    },
    series: [{
      name: '参保人数',
      type: 'line',
      smooth: true,
      data: props.chartData.values || [],
      itemStyle: {
        color: '#6366F1'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: 'rgba(99, 102, 241, 0.3)'
        }, {
          offset: 1,
          color: 'rgba(99, 102, 241, 0)'
        }])
      }
    }]
  };

  chartInstance.value.setOption(option);
  window.addEventListener('resize', handleResize);
};

// Handle resize
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize();
  }
};

// Watch for data changes
watch(() => props.chartData, () => {
  if (chartInstance.value) {
    renderChart();
  }
}, { deep: true });

onMounted(() => {
  initChart();
});
</script>
