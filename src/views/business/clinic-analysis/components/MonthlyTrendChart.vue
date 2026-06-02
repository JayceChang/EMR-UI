<template>
  <div ref="chartContainer" class="w-full h-80 bg-gray-50 rounded-lg p-2"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

const chartContainer = ref(null);
let chartInstance = null;

const initChart = () => {
  if (!chartContainer.value) return;

  chartInstance = echarts.init(chartContainer.value);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['就诊人次']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.map(item => item.month),
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '人次',
      axisLabel: {
        color: '#666'
      }
    },
    series: [{
      name: '就诊人次',
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 3,
        color: '#3B82F6'
      },
      itemStyle: {
        color: '#3B82F6'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: 'rgba(59, 130, 246, 0.3)'
        }, {
          offset: 0.8,
          color: 'rgba(59, 130, 246, 0)'
        }])
      },
      data: props.data.map(item => item.value)
    }]
  };

  chartInstance.setOption(option);

  // Handle window resize
  window.addEventListener('resize', handleResize);
};

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

onMounted(async () => {
  await nextTick();
  initChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener('resize', handleResize);
});

watch(() => props.data, () => {
  if (chartInstance) {
    chartInstance.setOption({
      xAxis: {
        data: props.data.map(item => item.month)
      },
      series: [{
        data: props.data.map(item => item.value)
      }]
    });
  }
}, { deep: true });
</script>

<style scoped>
</style>
