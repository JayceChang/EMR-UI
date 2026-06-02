<template>
  <div class="bg-white rounded-xl p-5 filter-card">
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-lg font-semibold flex items-center">
        <i class="fas fa-chart-line text-primary mr-2"></i>
        住院费用趋势
      </h3>
      <!-- <div class="flex space-x-2">
        <a-button
          :type="period === 'day' ? 'primary' : 'default'"
          class="px-3 py-1 rounded-full text-sm"
          @click="handlePeriodChange('day')"
        >
          日度
        </a-button>
        <a-button
          :type="period === 'week' ? 'primary' : 'default'"
          class="px-3 py-1 rounded-full text-sm"
          @click="handlePeriodChange('week')"
        >
          周度
        </a-button>
        <a-button
          :type="period === 'month' ? 'primary' : 'default'"
          class="px-3 py-1 rounded-full text-sm"
          @click="handlePeriodChange('month')"
        >
          月度
        </a-button>
      </div> -->
    </div>
    <div class="w-full h-[220px]" ref="chartRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  period: {
    type: String,
    default: 'month'
  }
});

const emit = defineEmits(['period-change']);

const chartRef = ref(null);
let chartInstance = null;

// Initialize chart
const initChart = () => {
  nextTick(() => {
    if (!chartRef.value) return;

    chartInstance = echarts.init(chartRef.value);
    renderChart();
  });
};

// Render chart
const renderChart = () => {
  if (!chartInstance || !props.data.months) return;

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        let result = params[0].name + '<br/>';
        params.forEach(item => {
          if (item.seriesType === 'line') {
            // 折线图：报销比例
            result += item.marker + item.seriesName + ': ' + item.value + '%<br/>';
          } else if (item.seriesName === '住院人次') {
            // 住院人次：纯数字
            result += item.marker + item.seriesName + ': ' + item.value.toLocaleString() + '<br/>';
          } else {
            // 次均费用：货币格式
            result += item.marker + item.seriesName + ': ¥' + item.value.toLocaleString() + '<br/>';
          }
        });
        return result;
      }
    },
    legend: {
      data: ['次均费用', '报销比例', '住院人次'],
      top: 0,
      right: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.months || [],
      axisLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#333'
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
        formatter: function(value) {
          return '¥' + value;
        }
      },
      {
        type: 'value',
        name: '报销比例(%)',
        nameTextStyle: {
          color: '#52C41A'
        },
        min: 50,
        max: 80,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        formatter: function(value) {
          return value + '%';
        }
      }
    ],
    series: [
      {
        name: '次均费用',
        type: 'bar',
        data: props.data.avgCost || [],
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
        data: props.data.reimbursementRate || [],
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
        data: props.data.admissions || [],
        itemStyle: {
          color: '#FAAD14',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '25%'
      }
    ]
  };

  chartInstance.setOption(option);
  window.addEventListener('resize', handleResize);
};

// Handle resize
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// Handle period change
const handlePeriodChange = (period) => {
  emit('period-change', period);
};

// Watch for data changes
watch(() => props.data, () => {
  if (chartInstance) {
    renderChart();
  }
}, { deep: true });

onMounted(() => {
  initChart();
});
</script>

<style scoped>
.filter-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
