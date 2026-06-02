<template>
  <div class="bg-white rounded-xl shadow-lg p-6 flex-grow">
    <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-info-circle text-blue-600 mr-2"></i>
      区域参保详情
    </h2>

    <div v-if="selectedDistrict">
      <div v-if="districtDetailData && Object.keys(districtDetailData).length > 0">
        <h3 class="text-lg font-bold text-gray-700 mb-3">{{ selectedDistrict }} 参保数据</h3>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-blue-50 p-3 rounded-md flex items-center justify-between">
            <p class="text-sm text-gray-600">参保人数:</p>
            <p class="text-lg font-semibold text-blue-700">{{ districtDetailData.insured }}</p>
          </div>
          <div class="bg-green-50 p-3 rounded-md flex items-center justify-between">
            <p class="text-sm text-gray-600">征缴资金:</p>
            <p class="text-lg font-semibold text-green-700">{{ districtDetailData.collection }}</p>
          </div>
        </div>

        <h4 class="text-md font-semibold text-gray-700 mb-2">下辖乡镇/街道数据</h4>
        <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
          <table class="min-w-full bg-white">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">人数</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">资金</th>
                <!-- <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">趋势</th> -->
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="town in districtDetailData.towns" :key="town.name">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{{ town.name }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{{ town.insured }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{{ town.collection }}</td>
                <!-- <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  <div
                    :id="`mini-chart-${getMiniChartId(selectedDistrict)}-${getMiniChartId(town.name)}`"
                    class="w-16 h-6 inline-block"
                  ></div>
                </td> -->
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="districtDetailData.overallTrend && districtDetailData.overallTrend.length > 0"
          class="w-full h-64 mt-4"
        >
          <div :id="detailTrendChartId" class="w-full h-full"></div>
        </div>
      </div>
      <div v-else class="text-center py-10">
        <p class="text-gray-500">正在加载 {{ selectedDistrict }} 的详细数据...</p>
      </div>
    </div>

    <div v-else class="text-center py-10">
      <p class="text-gray-500">点击左侧表格中的"查看详情"以显示具体区域数据。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  selectedDistrict: {
    type: String,
    default: ''
  },
  districtDetailData: {
    type: Object,
    default: () => ({})
  }
});

const detailTrendChartId = ref('detail-trend-chart');

// Get mini chart ID
const getMiniChartId = (name) => {
  return name.replace(/区|县|市|乡|街道/g, '');
};

// Render mini chart
const renderMiniChart = (elementId, data) => {
  nextTick(() => {
    const chartDom = document.getElementById(elementId);
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
    const option = {
      grid: {
        left: '0%',
        right: '0%',
        top: '0%',
        bottom: '0%',
        containLabel: false
      },
      xAxis: {
        type: 'category',
        show: false,
        data: ['19', '20', '21', '22', '23', '24']
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [{
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#4F46E5'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(79, 70, 229, 0.2)'
          }, {
            offset: 1,
            color: 'rgba(79, 70, 229, 0)'
          }])
        },
        data: data
      }]
    };
    myChart.setOption(option);
  });
};

// Render detail trend chart
const renderDetailTrendChart = (districtName, data) => {
  nextTick(() => {
    const chartDom = document.getElementById(detailTrendChartId.value);
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
    const option = {
      title: {
        text: `${districtName} 历年参保人数趋势`,
        left: 'center',
        textStyle: {
          fontSize: 14,
          color: '#333'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '20%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['2019', '2020', '2021', '2022', '2023', '2024'],
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        name: '参保人数 (万人)',
        axisLabel: {
          color: '#666'
        }
      },
      series: [{
        name: '参保人数',
        type: 'line',
        smooth: true,
        data: data,
        itemStyle: {
          color: '#10B981'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(16, 185, 129, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(16, 185, 129, 0)'
          }])
        }
      }]
    };
    myChart.setOption(option);

    window.addEventListener('resize', () => {
      myChart.resize();
    });
  });
};

// Watch for district detail data changes
watch(() => props.districtDetailData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    // Render mini charts for towns
    if (newData.towns && newData.towns.length > 0) {
      newData.towns.forEach(town => {
        const elementId = `mini-chart-${getMiniChartId(props.selectedDistrict)}-${getMiniChartId(town.name)}`;
        renderMiniChart(elementId, town.trend);
      });
    }

    // Render overall trend chart
    if (newData.overallTrend && newData.overallTrend.length > 0) {
      renderDetailTrendChart(props.selectedDistrict, newData.overallTrend);
    }
  }
}, { deep: true });
</script>
