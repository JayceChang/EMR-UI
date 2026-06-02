<template>
  <div ref="chartContainer" class="h-[300px] w-full"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
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
    color: ['#165DFF', '#F53F3F'],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E6EB',
      borderWidth: 1,
      padding: 10,
      textStyle: {
        color: '#1D2129'
      },
      formatter: function(params) {
        return `<div class="font-medium">${params[0].name}</div>
            <div class="flex justify-between mt-1">
                <span style="color: ${params[0].color}">同比</span>
                <span class="font-medium">${params[0].data}%</span>
            </div>
            <div class="flex justify-between mt-1">
                <span style="color: ${params[1].color}">环比</span>
                <span class="font-medium">${params[1].data}%</span>
            </div>`;
      }
    },
    grid: {
      left: '0%',
      right: '0%',
      bottom: '0%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'category',
      data: props.data.map(item => item.name),
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#4E5969',
        fontSize: 12,
        align: 'right',
        padding: [-10, 0, 0, 0]
      },
      inverse: true
    },
    series: [
      {
        name: '同比',
        type: 'bar',
        data: props.data.map(item => item.yoy),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: '#1D2129',
          fontSize: 12
        },
        itemStyle: {
          borderRadius: [0, 4, 4, 0]
        },
        barWidth: 16
      },
      {
        name: '环比',
        type: 'bar',
        data: props.data.map(item => item.mom),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: '#1D2129',
          fontSize: 12
        },
        itemStyle: {
          borderRadius: [0, 4, 4, 0]
        },
        barWidth: 16
      }
    ]
  };

  chartInstance.setOption(option);
};

const updateChart = () => {
  if (!chartInstance) return;

  const option = {
    yAxis: {
      data: props.data.map(item => item.name)
    },
    series: [
      {
        name: '同比',
        data: props.data.map(item => item.yoy)
      },
      {
        name: '环比',
        data: props.data.map(item => item.mom)
      }
    ]
  };

  chartInstance.setOption(option);
};

onMounted(() => {
  initChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
});

watch(() => props.data, () => {
  updateChart();
}, { deep: true });
</script>

<style scoped>
</style>
