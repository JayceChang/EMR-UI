<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-hospital-user text-cyan-500 mr-3"></i>
      医疗机构数据
    </h2>

    <!-- Filters -->
    <div class="flex mb-4 space-x-4 flex-wrap">
      <a-select v-model:value="filters.group" class="w-48" placeholder="选择集团" allow-clear>
        <a-select-option value="all">所有集团</a-select-option>
        <a-select-option value="rmyy">安阳市人民医院医疗集团</a-select-option>
        <a-select-option value="zyy">安阳市中医院医疗集团</a-select-option>
      </a-select>

      <a-select v-model:value="filters.level" class="w-48" placeholder="选择级别">
        <a-select-option value="all">全部级别</a-select-option>
        <a-select-option v-for="level in levelList" :key="level.code" :value="level.code">
          {{ level.name }}
        </a-select-option>
      </a-select>

      <a-select v-model:value="filters.district" class="w-48" placeholder="选择行政区划" allow-clear>
        <a-select-option value="all">所有行政区划</a-select-option>
        <a-select-option value="文峰区">文峰区</a-select-option>
        <a-select-option value="北关区">北关区</a-select-option>
        <a-select-option value="殷都区">殷都区</a-select-option>
        <a-select-option value="龙安区">龙安区</a-select-option>
        <a-select-option value="安阳县">安阳县</a-select-option>
        <a-select-option value="汤阴县">汤阴县</a-select-option>
        <a-select-option value="滑县">滑县</a-select-option>
        <a-select-option value="林州市">林州市</a-select-option>
        <a-select-option value="内黄县">内黄县</a-select-option>
      </a-select>

      <a-button type="primary" @click="handleFilter">
        <i class="fas fa-filter mr-2"></i>
        筛选
      </a-button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">医疗机构</th>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">住院人次</th>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">次均费用</th>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">次均天数</th>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">次均报销</th>
            <th class="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in filteredData" :key="item.name" class="hover:bg-gray-50 transition duration-150 ease-in-out">
            <td class="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ item.name }}
            </td>
            <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
              {{ item.hospitalizations?.toLocaleString() || '--' }}
              <span :class="trendClass(item.yoy)" class="text-xs ml-1 inline-flex items-center">
                <i v-if="hasTrendArrow(item.yoy)" class="fas mr-1" :class="trendArrowIcon(item.yoy)"></i>
                {{ formatPercentage(item.yoy) }}
              </span>
            </td>
            <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
              ¥{{ item.avgCost?.toFixed(2) || '--' }}
              <span :class="trendClass(item.mom)" class="text-xs ml-1 inline-flex items-center">
                <i v-if="hasTrendArrow(item.mom)" class="fas mr-1" :class="trendArrowIcon(item.mom)"></i>
                {{ formatPercentage(item.mom) }}
              </span>
            </td>
            <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{{ item.avgDays?.toFixed(1) || '--' }}天</td>
            <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-700">¥{{ item.avgReimbursement?.toFixed(2) || '--' }}</td>
            <td class="py-3 px-4 whitespace-nowrap text-center text-sm font-medium">
              <a
                href="javascript:void(0);"
                class="text-blue-600 hover:text-blue-900 transition duration-150 ease-in-out"
                @click="handleDrillDown(item.name)"
              >
                <i class="fas fa-search-plus mr-1"></i>
                详情
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="mt-4 flex justify-end">
      <a-pagination
        v-model:current="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :show-size-changer="true"
        :show-total="(total) => `共 ${total} 条`"
        :page-size-options="['10', '20', '50', '100']"
        @change="handlePageChange"
        @showSizeChange="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch, nextTick } from 'vue';
  import { MedicalInstitutionLevelAPI } from '/@/api/system/medical-institution-level-api';
  import * as echarts from 'echarts';

  const props = defineProps({
    dataSource: {
      type: Object,
      default: () => ({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 10,
      }),
    },
  });

  const emit = defineEmits(['drill-down', 'filter', 'page-change']);

  // Filters
  const filters = ref({
    group: 'all',
    level: 'all',
    district: 'all',
  });

  // 医疗机构级别列表
  const levelList = ref([]);

  // Filtered data - 现在从后端获取数据，不需要前端过滤
  const filteredData = ref([]);

  // 分页状态
  const pagination = ref({
    current: props.dataSource.pageNum || 1,
    pageSize: props.dataSource.pageSize || 10,
    total: props.dataSource.total || 0,
  });

  // 获取医疗机构级别列表
  const fetchLevelList = async () => {
    try {
      const response = await MedicalInstitutionLevelAPI.getLevelList();
      if (response.data) {
        levelList.value = response.data;
      }
    } catch (error) {
      console.error('获取医疗机构级别列表失败:', error);
    }
  };

  // Get chart ID
  const getChartId = (name) => {
    return name.replace(/\s/g, '').replace(/[()]/g, '');
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

  // Render mini trend chart
  const renderMiniChart = (elementId, data) => {
    nextTick(() => {
      const chartDom = document.getElementById(elementId);
      if (!chartDom) return;

      const myChart = echarts.init(chartDom);
      const option = {
        grid: {
          left: '0%',
          right: '0%',
          top: '10%',
          bottom: '10%',
          containLabel: false,
        },
        xAxis: {
          type: 'category',
          show: false,
          data: Array.from({ length: data.length }, (_, i) => i + 1),
        },
        yAxis: {
          type: 'value',
          show: false,
        },
        series: [
          {
            data: data,
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 2,
              color: '#4CAF50',
            },
            areaStyle: {
              opacity: 0.2,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#4CAF50',
                },
                {
                  offset: 1,
                  color: '#E8F5E9',
                },
              ]),
            },
          },
        ],
        tooltip: {
          trigger: 'axis',
          formatter: '趋势值: {c}',
          axisPointer: {
            type: 'shadow',
          },
        },
      };
      myChart.setOption(option);
    });
  };

  // Filter data - 直接使用后端返回的数据
  const filterData = () => {
    filteredData.value = props.dataSource.list || [];

    // Render trend charts
    nextTick(() => {
      filteredData.value.forEach((item) => {
        if (item.trend && item.trend.length > 0) {
          const elementId = `trend-${getChartId(item.name)}`;
          renderMiniChart(elementId, item.trend);
        }
      });
    });
  };

  // Event handlers
  const handleFilter = () => {
    emit('filter', { ...filters.value });
  };

  const handleDrillDown = (institutionName) => {
    emit('drill-down', institutionName);
  };

  // 分页变更处理
  const handlePageChange = (page, pageSize) => {
    emit('page-change', page, pageSize);
  };

  // 每页数量变更处理
  const handlePageSizeChange = (current, size) => {
    emit('page-change', 1, size);
  };

  // Watch for data source changes
  watch(
    () => props.dataSource,
    (newVal) => {
      filterData();
      // 更新分页状态
      if (newVal) {
        pagination.value.current = newVal.pageNum || 1;
        pagination.value.pageSize = newVal.pageSize || 10;
        pagination.value.total = newVal.total || 0;
      }
    },
    { deep: true }
  );

  onMounted(() => {
    filterData();
    fetchLevelList();
  });
</script>
