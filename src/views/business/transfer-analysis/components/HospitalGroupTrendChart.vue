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

  const { months, patients = [], cost = [] } = props.data;

  chart.hideLoading();
  chart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['人次数', '总费用'],
      textStyle: {
        color: '#666'
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
      boundaryGap: false,
      data: months,
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '人次数',
        axisLabel: {
          formatter: '{value}',
          color: '#666'
        }
      },
      {
        type: 'value',
        name: '总费用 (M)',
        axisLabel: {
          formatter: '{value}',
          color: '#666'
        }
      }
    ],
    series: [
      {
        name: '人次数',
        type: 'line',
        smooth: true,
        yAxisIndex: 0,
        itemStyle: {
          color: '#5cb85c'
        },
        data: patients
      },
      {
        name: '总费用',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        itemStyle: {
          color: '#f0ad4e'
        },
        data: cost
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
