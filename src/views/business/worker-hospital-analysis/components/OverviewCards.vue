<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-chart-line text-green-500 mr-3"></i>
      全市职工住院人次概览
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center text-sm">
      <!-- Current Hospitalizations -->
      <div class="bg-blue-50 p-4 rounded-lg shadow-inner border border-blue-200">
        <p class="text-gray-600 text-base mb-1">
          当前住院人次
          <a-tooltip>
            <template #title>当前年度职工住院总人次</template>
            <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
          </a-tooltip>
        </p>
        <p class="text-3xl font-extrabold text-blue-700">
          {{ data.currentHospitalizations?.toLocaleString() || '--' }}
        </p>
        <div class="mt-2 text-xs space-y-1">
          <p class="flex items-center justify-center">
            同比:
            <span class="inline-flex items-center ml-1" :class="trendClass(data.yoyHospitalizations)">
              <i v-if="hasTrendArrow(data.yoyHospitalizations)" class="fas mr-1" :class="trendArrowIcon(data.yoyHospitalizations)"></i>
              {{ formatTrendPercent(data.yoyHospitalizations) }}
            </span>
          </p>
          <p class="flex items-center justify-center">
            环比:
            <span class="inline-flex items-center ml-1" :class="trendClass(data.momHospitalizations)">
              <i v-if="hasTrendArrow(data.momHospitalizations)" class="fas mr-1" :class="trendArrowIcon(data.momHospitalizations)"></i>
              {{ formatTrendPercent(data.momHospitalizations) }}
            </span>
          </p>
        </div>
      </div>

      <!-- Avg Cost -->
      <div class="bg-green-50 p-4 rounded-lg shadow-inner border border-green-200">
        <p class="text-gray-600 text-base mb-1">
          次均费用
          <a-tooltip>
            <template #title>次均费用 = 职工住院总费用 / 职工住院总人次</template>
            <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
          </a-tooltip>
        </p>
        <p class="text-3xl font-extrabold text-green-700">¥{{ data.avgCost?.toFixed(2) || '--' }}</p>
        <div class="mt-2 text-xs space-y-1">
          <p class="flex items-center justify-center">
            同比:
            <span class="inline-flex items-center ml-1" :class="trendClass(data.yoyAvgCost)">
              <i v-if="hasTrendArrow(data.yoyAvgCost)" class="fas mr-1" :class="trendArrowIcon(data.yoyAvgCost)"></i>
              {{ formatTrendPercent(data.yoyAvgCost) }}
            </span>
          </p>
          <p class="flex items-center justify-center">
            环比:
            <span class="inline-flex items-center ml-1" :class="trendClass(data.momAvgCost)">
              <i v-if="hasTrendArrow(data.momAvgCost)" class="fas mr-1" :class="trendArrowIcon(data.momAvgCost)"></i>
              {{ formatTrendPercent(data.momAvgCost) }}
            </span>
          </p>
        </div>
      </div>

      <!-- Avg Reimbursement -->
      <div class="bg-purple-50 p-4 rounded-lg shadow-inner border border-purple-200">
        <p class="text-gray-600 text-base mb-1">
          次均统筹报销
          <a-tooltip>
            <template #title>次均统筹报销 = 职工统筹报销总金额 / 职工住院总人次</template>
            <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
          </a-tooltip>
        </p>
        <p class="text-3xl font-extrabold text-purple-700">¥{{ data.avgReimbursement?.toFixed(2) || '--' }}</p>
        <div class="mt-2 text-xs space-y-1">
          <p class="flex items-center justify-center">
            同比:
            <span class="inline-flex items-center ml-1" :class="trendClass(data.yoyAvgReimbursement)">
              <i v-if="hasTrendArrow(data.yoyAvgReimbursement)" class="fas mr-1" :class="trendArrowIcon(data.yoyAvgReimbursement)"></i>
              {{ formatTrendPercent(data.yoyAvgReimbursement) }}
            </span>
          </p>
          <p class="flex items-center justify-center">
            环比:
            <span class="inline-flex items-center ml-1" :class="trendClass(data.momAvgReimbursement)">
              <i v-if="hasTrendArrow(data.momAvgReimbursement)" class="fas mr-1" :class="trendArrowIcon(data.momAvgReimbursement)"></i>
              {{ formatTrendPercent(data.momAvgReimbursement) }}
            </span>
          </p>
        </div>
      </div>

      <!-- Avg Hospital Days -->
      <div class="bg-orange-50 p-4 rounded-lg shadow-inner border border-orange-200">
        <p class="text-gray-600 text-base mb-1">
          次均住院日
          <a-tooltip>
            <template #title>次均住院日 = 职工住院总天数 / 职工住院总人次</template>
            <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
          </a-tooltip>
        </p>
        <p class="text-3xl font-extrabold text-orange-700">{{ data.avgHospitalDays?.toFixed(1) || '--' }}天</p>
        <div class="mt-2 text-xs space-y-1">
          <p class="flex items-center justify-center">
            同比:
            <span class="inline-flex items-center ml-1" :class="trendClass(data.yoyAvgHospitalDays)">
              <i v-if="hasTrendArrow(data.yoyAvgHospitalDays)" class="fas mr-1" :class="trendArrowIcon(data.yoyAvgHospitalDays)"></i>
              {{ formatTrendPercent(data.yoyAvgHospitalDays) }}
            </span>
          </p>
          <p class="flex items-center justify-center">
            环比:
            <span class="inline-flex items-center ml-1" :class="trendClass(data.momAvgHospitalDays)">
              <i v-if="hasTrendArrow(data.momAvgHospitalDays)" class="fas mr-1" :class="trendArrowIcon(data.momAvgHospitalDays)"></i>
              {{ formatTrendPercent(data.momAvgHospitalDays) }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Trend Chart -->
    <div class="mt-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <i class="fas fa-chart-area text-blue-500 mr-2"></i>
        趋势分析
      </h3>
      <div ref="chartRef" class="h-64 w-full"></div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch, nextTick } from 'vue';
  import * as echarts from 'echarts';

  const props = defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
  });

  const chartRef = ref(null);
  let chartInstance = null;

  const normalizeTrendValue = (value, decimals = 1) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return 0;
    const factor = 10 ** decimals;
    return Math.round(num * factor) / factor;
  };

  const trendClass = (value) => {
    const num = normalizeTrendValue(value);
    if (num === 0) return '';
    return num > 0 ? 'text-red-600' : 'text-green-600';
  };

  const hasTrendArrow = (value) => Math.abs(normalizeTrendValue(value)) >= 0.05;

  const trendArrowIcon = (value) => (normalizeTrendValue(value) > 0 ? 'fa-arrow-up' : 'fa-arrow-down');

  const formatTrendPercent = (value) => {
    if (value === undefined || value === null) return '--';
    const num = Number(value);
    if (!Number.isFinite(num)) return '--';
    return `${Math.abs(num).toFixed(1)}%`;
  };

  // Initialize chart
  const initChart = () => {
    nextTick(() => {
      // 严格验证数据完整性
      if (!chartRef.value || !props.data || !props.data.trendData) {
        console.log('图表渲染跳过: chartRef或数据不存在', {
          hasChartRef: !!chartRef.value,
          hasData: !!props.data,
          hasTrendData: !!props.data?.trendData,
          trendDataType: typeof props.data?.trendData,
          trendDataKeys: props.data?.trendData ? Object.keys(props.data.trendData) : [],
        });
        return;
      }

      // 验证trendData的必要字段
      const trendData = props.data.trendData;
      if (!trendData.months || !Array.isArray(trendData.months) || trendData.months.length === 0) {
        console.log('图表渲染跳过: trendData数据不完整', {
          hasMonths: !!trendData.months,
          isArray: Array.isArray(trendData.months),
          monthsLength: trendData.months?.length,
          trendData: trendData,
        });
        return;
      }

      console.log('开始初始化图表', trendData);
      chartInstance = echarts.init(chartRef.value);
      renderChart();
    });
  };

  // Render chart
  const renderChart = () => {
    if (!chartInstance || !props.data || !props.data.trendData) {
      console.log('渲染图表跳过: 实例或数据不存在');
      return;
    }

    const trendData = props.data.trendData;

    // 再次验证数据完整性
    if (!trendData.months || !Array.isArray(trendData.months) || trendData.months.length === 0) {
      console.log('渲染图表跳过: trendData数据不完整', trendData);
      return;
    }
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      legend: {
        data: ['住院人次', '次均费用', '次均统筹报销', '次均住院日'],
        textStyle: {
          color: '#666',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: trendData.months || [],
        axisLabel: {
          color: '#666',
        },
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '人次/费用',
          position: 'left',
          axisLabel: {
            formatter: function (value) {
              if (value >= 10000) {
                return (value / 10000).toFixed(1) + '万';
              }
              return value;
            },
            color: '#666',
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#eee',
            },
          },
        },
        {
          type: 'value',
          name: '天数',
          position: 'right',
          axisLabel: {
            formatter: '{value} 天',
            color: '#666',
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: '住院人次',
          type: 'line',
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
          data: trendData.hospitalizations || [],
          itemStyle: {
            color: '#4CAF50',
          },
          lineStyle: {
            width: 3,
          },
        },
        {
          name: '次均费用',
          type: 'line',
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
          data: trendData.avgCost || [],
          itemStyle: {
            color: '#2196F3',
          },
          lineStyle: {
            width: 3,
          },
        },
        {
          name: '次均统筹报销',
          type: 'line',
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
          data: trendData.avgReimbursement || [],
          itemStyle: {
            color: '#FFC107',
          },
          lineStyle: {
            width: 3,
          },
        },
        {
          name: '次均住院日',
          type: 'line',
          yAxisIndex: 1,
          emphasis: {
            focus: 'series',
          },
          data: trendData.avgHospitalDays || [],
          itemStyle: {
            color: '#9C27B0',
          },
          lineStyle: {
            width: 3,
          },
        },
      ],
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

  // Watch for data changes
  watch(
    () => props.data,
    (newVal, oldVal) => {
      console.log('数据变化检测', {
        newVal: newVal,
        oldVal: oldVal,
        hasTrendData: !!newVal?.trendData,
        trendDataKeys: newVal?.trendData ? Object.keys(newVal.trendData) : [],
      });

      // 只有当图表实例存在且数据完整时才重新渲染
      if (chartInstance && newVal?.trendData?.months?.length > 0) {
        renderChart();
      } else if (newVal?.trendData?.months?.length > 0) {
        // 如果没有图表实例但数据完整，则初始化
        initChart();
      }
    },
    { deep: true }
  );

  onMounted(() => {
    initChart();
  });
</script>
