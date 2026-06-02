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
  // 确保 DOM 已挂载且 chart 已初始化
  if (!chartRef.value) {
    return;
  }

  if (!chart) {
    initChart();
  }

  // 检查数据是否有效
  if (!chart || !props.data || !props.data.months || props.data.months.length === 0) {
    if (chart) {
      chart.clear();
      // chart.showLoading({ text: '暂无数据' });
    }
    return;
  }

  const { months, avgCost = [], reimbursementRate = [], patients = [] } = props.data;

  chart.hideLoading();
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        let result = params[0].name + '<br/>';
        params.forEach(item => {
          if (item.seriesName === '报销比例') {
            result += item.marker + item.seriesName + ': ' + item.value + '%<br/>';
          } else if (item.seriesName === '住院人次') {
            result += item.marker + item.seriesName + ': ' + item.value.toLocaleString() + '人次<br/>';
          } else {
            result += item.marker + item.seriesName + ': ¥' + item.value.toLocaleString() + '<br/>';
          }
        });
        return result;
      }
    },
    legend: {
      data: ['次均费用', '报销比例', '住院人次'],
      top: 0,
      right: 0,
      textStyle: {
        color: '#666'
      }
    },
    grid: {
      left: '3%',
      right: '12%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '次均费用(元)',
        nameTextStyle: {
          color: '#165DFF'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        },
        axisLabel: {
          color: '#666',
          formatter: function(value) {
            return '¥' + value;
          }
        }
      },
      {
        type: 'value',
        name: '报销比例(%)',
        position: 'right',
        offset: 0,
        nameTextStyle: {
          color: '#52C41A',
          padding: [0, 0, 0, 0]
        },
        // 自动计算范围，留出适当边距
        min: function(value) {
          return Math.floor(value.min - 5);
        },
        max: function(value) {
          return Math.ceil(value.max + 5);
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#52C41A'
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          color: '#666',
          formatter: function(value) {
            return value + '%';
          }
        }
      },
      {
        type: 'value',
        name: '住院人次',
        position: 'right',
        offset: 60,
        nameTextStyle: {
          color: '#FAAD14',
          padding: [0, 0, 0, 0]
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#FAAD14'
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          color: '#666',
          formatter: function(value) {
            return value >= 10000 ? (value / 10000).toFixed(1) + '万' : value;
          }
        }
      }
    ],
    series: [
      {
        name: '次均费用',
        type: 'bar',
        data: avgCost,
        itemStyle: {
          color: '#165DFF',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '40%'
      },
      {
        name: '报销比例',
        type: 'line',
        yAxisIndex: 1,
        data: reimbursementRate,
        lineStyle: {
          color: '#52C41A',
          width: 2
        },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#52C41A',
          borderWidth: 2,
          borderColor: '#fff'
        }
      },
      {
        name: '住院人次',
        type: 'bar',
        yAxisIndex: 2,
        data: patients,
        itemStyle: {
          color: '#FAAD14',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '25%'
      }
    ]
  });
};

const resizeChart = () => {
  if (chart) {
    chart.resize();
  }
};

watch(
  () => props.data,
  (newData) => {
    console.log('TrendChart: 数据变化', newData);
    nextTick(() => {
      renderChart();
    });
  },
  { deep: true, immediate: true }
);

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
