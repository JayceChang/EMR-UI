<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-map-marked-alt text-indigo-500 mr-3"></i>
      {{ title || '各县区职工住院数据' }}
    </h2>

    <!-- Chart -->
    <div ref="chartRef" class="h-64 w-full mb-4"></div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">县区</th>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">住院人次</th>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总费用</th>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">次均费用</th>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">同比增幅</th>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in data" :key="item.name" class="hover:bg-gray-50 transition duration-150 ease-in-out">
            <td class="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ item.name }}
            </td>
            <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
              {{ item.hospitalizations?.toLocaleString() || '--' }}
            </td>
            <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-700">¥{{ formatTotalCost(item.totalCost) }}</td>
            <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-700">¥{{ item.avgCost?.toFixed(2) || '--' }}</td>
            <td class="py-3 px-4 whitespace-nowrap text-sm">
              <span class="inline-flex items-center" :class="trendClass(item.yoyIncrease)">
                <i v-if="hasTrendArrow(item.yoyIncrease)" class="fas mr-1" :class="trendArrowIcon(item.yoyIncrease)"></i>
                {{ formatPercentage(item.yoyIncrease) }}
              </span>
            </td>
            <td class="py-3 px-4 whitespace-nowrap text-right text-sm font-medium">
              <a
                href="javascript:void(0);"
                class="text-blue-600 hover:text-blue-900 transition duration-150 ease-in-out"
                @click="handleDrillDown(item.name)"
              >
                <i class="fas fa-search-plus mr-1"></i>
                下钻
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch, nextTick } from 'vue';
  import * as echarts from 'echarts';

  const props = defineProps({
    title: {
      type: String,
      default: '',
    },
    data: {
      type: Array,
      default: () => [],
    },
  });

  const emit = defineEmits(['drill-down']);

  const chartRef = ref(null);
  let chartInstance = null;

  // Format total cost
  const formatTotalCost = (value) => {
    if (!value) return '--';
    return `${(value / 10000).toFixed(2)}万`;
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '--';
    const num = Number(value);
    if (!Number.isFinite(num)) return '--';
    return `${Math.abs(num).toFixed(1)}%`;
  };

  const trendClass = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num) || Math.abs(num) < 0.05) return '';
    return num > 0 ? 'text-red-600' : 'text-green-600';
  };

  const hasTrendArrow = (value) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) && Math.abs(num) >= 0.05;
  };

  const trendArrowIcon = (value) => {
    const num = Number(value ?? 0);
    return num > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  };

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
    if (!chartInstance || !props.data || props.data.length === 0) return;

    const districtNames = props.data.map((item) => item.name);
    const hospitalizationCounts = props.data.map((item) => item.hospitalizations);

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: '{b}<br/>住院人次: {c}',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: districtNames,
        axisLabel: {
          rotate: 45,
          interval: 0,
          color: '#666',
        },
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: '住院人次',
        nameTextStyle: {
          color: '#666',
        },
        axisLabel: {
          color: '#666',
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#eee',
          },
        },
      },
      series: [
        {
          name: '住院人次',
          type: 'bar',
          data: hospitalizationCounts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: '#83bff6',
              },
              {
                offset: 0.5,
                color: '#188df0',
              },
              {
                offset: 1,
                color: '#188df0',
              },
            ]),
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#2378f7',
                },
                {
                  offset: 0.7,
                  color: '#2378f7',
                },
                {
                  offset: 1,
                  color: '#83bff6',
                },
              ]),
            },
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

  // Handle drill down
  const handleDrillDown = (districtName) => {
    emit('drill-down', districtName);
  };

  // Watch for data changes
  watch(
    () => props.data,
    () => {
      if (chartInstance) {
        renderChart();
      }
    },
    { deep: true }
  );

  onMounted(() => {
    initChart();
  });
</script>
