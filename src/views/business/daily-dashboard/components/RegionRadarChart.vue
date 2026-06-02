<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <h2 class="text-xl font-semibold mb-2 flex items-center text-gray-700">
      <i class="fas fa-map-marker-alt mr-2 text-orange-500"></i>
      {{ title }}
    </h2>
    <p class="text-sm text-gray-500 mb-2">{{ subtitle }}</p>

    <!-- 区域序号标识 -->
    <div class="text-sm text-gray-600 mb-4 text-center">
      <span v-for="(name, index) in data.names" :key="index">
        <span class="font-medium">{{ index + 1 }}</span>-{{ name }}<span v-if="index < data.names.length - 1">、</span>
      </span>
    </div>

    <!-- 三个独立雷达图 -->
    <div class="grid grid-cols-3 gap-2">
      <!-- 门诊就诊率 -->
      <div class="text-center">
        <div class="text-sm font-medium text-red-600 mb-1 flex items-center justify-center">
          <span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
          门诊就诊率
        </div>
        <div ref="outpatientChartRef" class="w-full h-64"></div>
      </div>

      <!-- 住院就诊率 -->
      <div class="text-center">
        <div class="text-sm font-medium text-yellow-600 mb-1 flex items-center justify-center">
          <span class="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
          住院就诊率
        </div>
        <div ref="inpatientChartRef" class="w-full h-64"></div>
      </div>

      <!-- 住院外转率 -->
      <div class="text-center">
        <div class="text-sm font-medium text-blue-600 mb-1 flex items-center justify-center">
          <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
          住院外转率
        </div>
        <div ref="transferChartRef" class="w-full h-64"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  title: {
    type: String,
    default: '区域指标对比'
  },
  subtitle: {
    type: String,
    default: ''
  },
  data: {
    type: Object,
    default: () => ({
      names: [],
      outpatientRate: [],
      inpatientRate: [],
      transferRate: []
    })
  }
});

const outpatientChartRef = ref(null);
const inpatientChartRef = ref(null);
const transferChartRef = ref(null);

let outpatientChart = null;
let inpatientChart = null;
let transferChart = null;

// 创建单个雷达图配置
const createRadarOption = (names, values, color, rgbaColor) => {
  // 计算当前数据的最大值，并设置为雷达图的最大值（放大1.2倍，留出余量）
  const maxValue = Math.max(...values, 0);
  const radarMax = Math.ceil(maxValue * 1.2);

  const indicators = names.map((name) => ({ name, max: radarMax }));

  return {
    tooltip: {
      trigger: 'item',
      formatter: () => {
        let result = '';
        names.forEach((name, index) => {
          result += `${index + 1}-${name}: ${values[index] || 0}%<br/>`;
        });
        return result;
      }
    },
    radar: {
      indicator: indicators,
      center: ['50%', '50%'],
      radius: '75%', // 增大雷达图半径，让图形更占空间
      name: {
        color: '#666',
        fontSize: 10,
        formatter: (value) => {
          // 将名称转换为序号
          const index = names.indexOf(value);
          return index >= 0 ? String(index + 1) : value;
        }
      },
      splitNumber: 4,
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#eee'
        }
      },
      splitArea: {
        areaStyle: {
          color: ['#fff', '#fafafa']
        }
      }
    },
    series: [
      {
        type: 'radar',
        symbol: 'circle',
        symbolSize: 8, // 增大数据点大小
        data: [
          {
            value: values,
            lineStyle: { color: color, width: 3 }, // 增粗线条
            itemStyle: { color: color },
            areaStyle: { color: rgbaColor.replace('0.3', '0.5') } // 提高填充透明度
          }
        ]
      }
    ]
  };
};

const initCharts = () => {
  // 初始化门诊就诊率雷达图
  if (outpatientChartRef.value) {
    if (outpatientChart) outpatientChart.dispose();
    outpatientChart = echarts.init(outpatientChartRef.value);
    outpatientChart.setOption(
      createRadarOption(
        props.data.names,
        props.data.outpatientRate,
        '#ef4444',
        'rgba(239, 68, 68, 0.3)'
      )
    );
  }

  // 初始化住院就诊率雷达图
  if (inpatientChartRef.value) {
    if (inpatientChart) inpatientChart.dispose();
    inpatientChart = echarts.init(inpatientChartRef.value);
    inpatientChart.setOption(
      createRadarOption(
        props.data.names,
        props.data.inpatientRate,
        '#f59e0b',
        'rgba(245, 158, 11, 0.3)'
      )
    );
  }

  // 初始化住院外转率雷达图
  if (transferChartRef.value) {
    if (transferChart) transferChart.dispose();
    transferChart = echarts.init(transferChartRef.value);
    transferChart.setOption(
      createRadarOption(
        props.data.names,
        props.data.transferRate,
        '#3b82f6',
        'rgba(59, 130, 246, 0.3)'
      )
    );
  }

  window.addEventListener('resize', handleResize);
};

const handleResize = () => {
  outpatientChart?.resize();
  inpatientChart?.resize();
  transferChart?.resize();
};

const updateCharts = () => {
  if (outpatientChart) {
    outpatientChart.setOption(
      createRadarOption(
        props.data.names,
        props.data.outpatientRate,
        '#ef4444',
        'rgba(239, 68, 68, 0.3)'
      )
    );
  }

  if (inpatientChart) {
    inpatientChart.setOption(
      createRadarOption(
        props.data.names,
        props.data.inpatientRate,
        '#f59e0b',
        'rgba(245, 158, 11, 0.3)'
      )
    );
  }

  if (transferChart) {
    transferChart.setOption(
      createRadarOption(
        props.data.names,
        props.data.transferRate,
        '#3b82f6',
        'rgba(59, 130, 246, 0.3)'
      )
    );
  }
};

onMounted(async () => {
  await nextTick();
  initCharts();
});

onUnmounted(() => {
  outpatientChart?.dispose();
  inpatientChart?.dispose();
  transferChart?.dispose();
  window.removeEventListener('resize', handleResize);
});

watch(
  () => props.data,
  () => {
    if (outpatientChart && inpatientChart && transferChart) {
      updateCharts();
    } else {
      initCharts();
    }
  },
  { deep: true }
);
</script>

<style scoped>
</style>