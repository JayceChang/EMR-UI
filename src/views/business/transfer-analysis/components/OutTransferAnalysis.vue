<template>
  <div class="bg-white p-6 rounded-xl shadow-lg" style="height: 445px;">
    <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-plane-departure text-pink-500 mr-3"></i>
      市外转和省外转分析
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="bg-pink-50 p-4 rounded-lg shadow-inner border border-pink-200 text-center">
        <p class="text-gray-600 text-sm">全市市外转和省外转总人次</p>
        <p class="text-3xl font-bold text-pink-700">
          {{ data.totalPatients ? data.totalPatients.toLocaleString() : '--' }}
        </p>
      </div>
      <div class="bg-pink-50 p-4 rounded-lg shadow-inner border border-pink-200 text-center">
        <p class="text-gray-600 text-sm">市外转和省外转总费用</p>
        <p class="text-3xl font-bold text-pink-700">
          ¥{{ data.totalCost ? (data.totalCost / 10000).toFixed(2) + '万' : '--' }}
        </p>
      </div>
    </div>
    <div class="h-64 w-full mb-4">
      <div ref="chartRef" class="w-full h-full"></div>
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

const chartRef = ref(null);
let chart = null;

const initChart = () => {
  if (chartRef.value && !chart) {
    chart = echarts.init(chartRef.value);
  }
};

const renderChart = () => {
  if (!chart) return;

  // 使用从后端获取的饼图数据，如果没有数据则使用默认空数组
  const chartData = props.data?.chartData || [];

  // 转换数据格式用于 ECharts
  const data = chartData.map(item => ({
    value: item.value,
    name: item.name,
    count: item.count
  }));

  // 如果没有数据，显示空状态
  // if (data.length === 0) {
  //   chart.setOption({
  //     title: {
  //       text: '暂无数据',
  //       left: 'center',
  //       top: 'center',
  //       textStyle: {
  //         color: '#999',
  //         fontSize: 16
  //       }
  //     },
  //     series: []
  //   });
  //   return;
  // }

  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const percent = (params.value * 100).toFixed(2);
        return `${params.seriesName} <br/>${params.name}: ${params.data.count}人次 (${percent}%)`;
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.name),
      textStyle: {
        color: '#666'
      }
    },
    series: [{
      name: '外转占比',
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '20',
          fontWeight: 'bold',
          color: '#333'
        }
      },
      labelLine: {
        show: false
      },
      data: data,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      }
    }],
    color: ['#FF6B6B', '#4ECDC4', '#FFD166']
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
