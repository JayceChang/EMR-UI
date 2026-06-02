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
  },
  activeChart: {
    type: String,
    default: 'outpatient'
  }
});

const chartContainer = ref(null);
let chartInstance = null;

// 根据 activeChart 获取图表配置
const getChartConfig = () => {
  const configs = {
    outpatient: {
      name: '门诊人次',
      color: '#165DFF',
      yAxisName: '人次',
      dataKey: 'outpatient',
      type: 'bar',
      formatter: (value) => value.toLocaleString()
    },
    avgCost: {
      name: '次均费用',
      color: '#0FC6C2',
      yAxisName: '元',
      dataKey: 'avgCost',
      type: 'line',
      formatter: (value) => `¥${value.toFixed(2)}`
    },
    totalCost: {
      name: '总费用',
      color: '#FF7D00',
      yAxisName: '万元',
      dataKey: 'totalCost',
      type: 'bar',
      formatter: (value) => `¥${(value / 10000).toFixed(2)}万`
    }
  };
  return configs[props.activeChart] || configs.outpatient;
};

const initChart = () => {
  if (!chartContainer.value) return;

  chartInstance = echarts.init(chartContainer.value);
  updateChart();
};

const updateChart = () => {
  if (!chartInstance || !props.data || props.data.length === 0) return;

  const config = getChartConfig();

  // 获取数据，如果是总费用则转换为万元
  const chartData = props.data.map(item => {
    const value = item[config.dataKey];
    return config.dataKey === 'totalCost' ? value / 10000 : value;
  });

  const option = {
    color: [config.color],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: config.type === 'bar' ? 'shadow' : 'line'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E6EB',
      borderWidth: 1,
      padding: 10,
      textStyle: {
        color: '#1D2129'
      },
      formatter: function(params) {
        const item = params[0];
        const originalValue = props.data[item.dataIndex][config.dataKey];
        return `<div class="font-medium">${item.name}</div>
          <div class="flex justify-between mt-1">
            <span style="color: ${item.color}">${config.name}</span>
            <span class="font-medium ml-4">${config.formatter(originalValue)}</span>
          </div>`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '40px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.map(item => item.month),
      axisLine: {
        lineStyle: {
          color: '#E5E6EB'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#4E5969',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: config.yAxisName,
      nameTextStyle: {
        color: '#4E5969',
        fontSize: 12
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#4E5969',
        fontSize: 12,
        formatter: config.dataKey === 'totalCost' ? '{value}万' : '{value}'
      },
      splitLine: {
        lineStyle: {
          color: '#F2F3F5'
        }
      }
    },
    series: [
      {
        name: config.name,
        type: config.type,
        data: chartData,
        barWidth: config.type === 'bar' ? '40%' : undefined,
        itemStyle: config.type === 'bar' ? {
          borderRadius: [4, 4, 0, 0]
        } : undefined,
        symbol: config.type === 'line' ? 'circle' : undefined,
        symbolSize: config.type === 'line' ? 8 : undefined,
        lineStyle: config.type === 'line' ? {
          width: 3
        } : undefined,
        areaStyle: config.type === 'line' ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: config.color + '40' },
            { offset: 1, color: config.color + '05' }
          ])
        } : undefined
      }
    ]
  };

  // 使用 notMerge 确保完全替换之前的配置
  chartInstance.setOption(option, { notMerge: true });
};

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (chartInstance) {
    chartInstance.dispose();
  }
});

// 监听数据变化
watch(() => props.data, () => {
  updateChart();
}, { deep: true });

// 监听 activeChart 变化，重新渲染图表
watch(() => props.activeChart, () => {
  updateChart();
});
</script>

<style scoped>
</style>
