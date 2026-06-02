<template>
  <div class="bg-white rounded-xl p-5 shadow-md">
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-lg font-semibold flex items-center">
        <i class="fas fa-chart-line text-blue-600 mr-2"></i>
        住院费用趋势
      </h3>
      <div class="flex space-x-2">
        <a-button
          v-for="period in periodOptions"
          :key="period.value"
          :type="activePeriod === period.value ? 'primary' : 'default'"
          size="small"
          shape="round"
          @click="handlePeriodChange(period.value)"
        >
          {{ period.label }}
        </a-button>
      </div>
    </div>
    <div ref="chartContainer" class="w-full h-56"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      months: [],
      avgCost: [],
      reimbursementRate: [],
      admissions: []
    })
  }
});

const emit = defineEmits(['period-change']);

const chartContainer = ref(null);
let chartInstance = null;

const activePeriod = ref('month');

const periodOptions = [
  { value: 'month', label: '月度' },
  { value: 'quarter', label: '季度' },
  { value: 'year', label: '年度' }
];

const handlePeriodChange = (period) => {
  activePeriod.value = period;
  emit('period-change', period);
};

const initChart = () => {
  if (!chartContainer.value) return;

  chartInstance = echarts.init(chartContainer.value);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params) {
        let result = params[0].name + '<br/>';
        params.forEach((item) => {
          if (item.seriesType === 'line') {
            result += item.marker + item.seriesName + ': ' + item.value + '%<br/>';
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
      data: props.data.months || ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      },
      axisTick: {
        show: false
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
        }
      }
    ],
    series: [
      {
        name: '次均费用',
        type: 'bar',
        data: props.data.avgCost || [5200, 5350, 5420, 5580, 5720, 5850, 5920, 6050, 6180, 6320, 6450, 6580],
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
        data: props.data.reimbursementRate || [62.5, 63.2, 63.8, 64.5, 65.2, 65.8, 66.3, 66.8, 67.2, 67.5, 67.8, 68.2],
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
        data: props.data.admissions || [9200, 9500, 9800, 10200, 10500, 10800, 11200, 11500, 11800, 12200, 12500, 12800],
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

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

const updateChart = () => {
  if (chartInstance) {
    chartInstance.setOption({
      xAxis: {
        data: props.data.months
      },
      series: [
        { data: props.data.avgCost },
        { data: props.data.reimbursementRate },
        { data: props.data.admissions }
      ]
    });
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

watch(
  () => props.data,
  () => {
    updateChart();
  },
  { deep: true }
);
</script>

<style scoped>
</style>
