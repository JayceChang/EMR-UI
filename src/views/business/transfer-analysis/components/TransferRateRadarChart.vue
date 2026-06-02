<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-chart-pie text-purple-500 mr-3"></i>
      {{ title }}
    </h2>
    <div class="h-64 w-full">
      <div ref="chartRef" class="w-full h-full"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#8860D0'
  }
});

const chartRef = ref(null);
let chart = null;

const initChart = () => {
  if (chartRef.value && !chart) {
    chart = echarts.init(chartRef.value);
  }
};

const renderChart = () => {
  if (!chart || !props.data || props.data.length === 0) {
    if (chart) {
      chart.clear();
      chart.showLoading({ text: '暂无数据' });
    }
    return;
  }

  const data = props.data;
  const maxValue = Math.max(...data.map(item => item.value)) * 1.2;

  const indicator = data.map(item => ({
    name: item.name,
    max: maxValue
  }));

  const seriesData = data.map(item => item.value);

  chart.hideLoading();
  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        // 雷达图的 params.value 是数组，需要遍历显示每个维度的值
        if (Array.isArray(params.value)) {
          let result = params.name + '<br/>';
          params.value.forEach((val, index) => {
            const name = indicator[index]?.name || '';
            result += name + ': ' + (val * 100).toFixed(2) + '%<br/>';
          });
          return result;
        }
        return params.name + ': ' + (params.value * 100).toFixed(2) + '%';
      }
    },
    radar: {
      indicator: indicator,
      radius: '65%',
      center: ['50%', '55%'],
      axisName: {
        color: '#333',
        fontSize: 14
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(255, 255, 255, 0.8)', 'rgba(240, 240, 240, 0.8)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.2)'
        }
      }
    },
    series: [{
      name: '住院外转率',
      type: 'radar',
      data: [{
        value: seriesData,
        name: '外转率'
      }],
      lineStyle: {
        color: props.color,
        width: 2
      },
      itemStyle: {
        color: props.color
      },
      areaStyle: {
        opacity: 0.6,
        color: props.color
      }
    }]
  });
};

const resizeChart = () => {
  if (chart) {
    chart.resize();
  }
};

watch(() => props.data, () => {
  nextTick(() => {
    renderChart();
  });
}, { deep: true });

onMounted(() => {
  nextTick(() => {
    initChart();
    renderChart();
    window.addEventListener('resize', resizeChart);
  });
});

onUnmounted(() => {
  if (chart) {
    chart.dispose();
    chart = null;
  }
  window.removeEventListener('resize', resizeChart);
});
</script>

<style scoped>
</style>
