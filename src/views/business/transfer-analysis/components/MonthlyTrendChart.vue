<template>
  <div ref="chartRef" class="w-full h-full"></div>
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

const chartRef = ref(null);
let chart = null;

const initChart = () => {
  if (chartRef.value && !chart) {
    chart = echarts.init(chartRef.value);
  }
};

const renderChart = () => {
  if (!chart || !props.data || !props.data.months) {
    if (chart) {
      chart.clear();
      chart.showLoading({ text: '暂无数据' });
    }
    return;
  }

  const { months, data } = props.data;

  chart.hideLoading();
  chart.setOption({
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
      data: months,
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '人次数',
      axisLabel: {
        color: '#666'
      }
    },
    series: [
      {
        name: '外转人次数',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#4A90E2'
        },
        itemStyle: {
          color: '#4A90E2'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(74, 144, 226, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(74, 144, 226, 0)'
          }])
        },
        data: data
      }
    ]
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
