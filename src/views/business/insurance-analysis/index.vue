<template>
  <div class="min-h-screen flex flex-col p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-lg rounded-xl p-6 mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-800 flex items-center">
        <i class="fas fa-chart-line text-blue-600 mr-3"></i>
        参保数据分析总览
      </h1>
      <div class="flex items-center space-x-4">
        <a-date-picker v-model:value="startMonth" picker="month" :placeholder="'开始月份'" class="w-full" :format="'YYYY-MM'" />
        <span class="text-gray-600 text-lg">—</span>
        <a-date-picker v-model:value="endMonth" picker="month" :placeholder="'结束月份'" class="w-full" :format="'YYYY-MM'" />
      </div>
    </header>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 gap-6 flex-grow mb-6">
      <div class="flex flex-col space-y-6">
        <!-- Statistics Cards -->
        <StatsCards
          :total-insured-count="totalInsuredCount"
          :total-collection-amount="totalCollectionAmount"
          :insured-increase="insuredIncrease"
          :collection-increase="collectionIncrease"
          :employee-insured-ratio="employeeInsuredRatio"
          :resident-insured-ratio="residentInsuredRatio"
        />

        <div class="bg-blue-50 border border-blue-100 text-blue-700 rounded-lg px-4 py-2 text-sm">
          总览卡片口径：按年度统计（职工 310 按月折算，当前年截至当前月；居民 390 按年度汇总）。
        </div>

        <!-- City-wide Trend Chart -->
        <TrendChart :chart-data="cityTrendData" chart-id="city-trend-chart" title="全市历年参保人数趋势" />
      </div>
    </div>

    <!-- Bottom Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
      <div class="lg:col-span-2 flex flex-col space-y-6">
        <div class="bg-amber-50 border border-amber-100 text-amber-700 rounded-lg px-4 py-2 text-sm">
          区县与乡镇明细口径：按右上角筛选时间区间统计。
        </div>

        <!-- District/County Data Table -->
        <DistrictTable :data-source="districtTableData" :loading="tableLoading" @view-detail="handleViewDetail" />
      </div>

      <div class="lg:col-span-1 flex flex-col space-y-6">
        <!-- District/Town/Village Detail Panel -->
        <DistrictDetail :selected-district="selectedDistrict" :district-detail-data="districtDetailData" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
  import dayjs from 'dayjs';
  import { message } from 'ant-design-vue';

  // Components
  import StatsCards from './components/StatsCards.vue';
  import TrendChart from './components/TrendChart.vue';
  import DistrictTable from './components/DistrictTable.vue';
  import DistrictDetail from './components/DistrictDetail.vue';

  // Import styles
  import '/@/assets/css/all.min.css';

  // Import API
  import { InsuranceAnalysisAPI } from '/@/api/business/insurance-analysis/insurance-analysis-api.js';

  // Reactive data
  const startMonth = ref(null);
  const endMonth = ref(null);
  const loading = ref(false);

  const totalInsuredCount = ref('--');
  const totalCollectionAmount = ref('--');
  const insuredIncrease = ref(2.5);
  const collectionIncrease = ref(3.1);
  const employeeInsuredRatio = ref(0);
  const residentInsuredRatio = ref(0);

  const cityTrendData = ref([]);
  const districtTableData = ref([]);
  const tableLoading = ref(false);

  const selectedDistrict = ref('');
  const districtDetailData = ref({});

  // Initialize date range
  const initDateRange = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const m = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;

    startMonth.value = dayjs(`${currentYear}-01`);
    endMonth.value = dayjs(`${currentYear}-${m}`);
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    loading.value = true;
    try {
      // Load all data in parallel (except district details which depends on table data)
      await Promise.all([loadOverallData(), loadCityTrendData(), loadDistrictTableData()]);

      // Load district details based on first item from table data
      if (districtTableData.value && districtTableData.value.length > 0) {
        await loadDistrictDetails(districtTableData.value[0].name);
      }
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
      message.error('加载数据失败');
    } finally {
      loading.value = false;
    }
  };

  // Load overall data
  const loadOverallData = async () => {
    try {
      const response = await InsuranceAnalysisAPI.getOverviewData({
        startMonth: startMonth.value?.format('YYYY-MM'),
        endMonth: endMonth.value?.format('YYYY-MM'),
      });
      if (response.data) {
        totalInsuredCount.value = response.data.totalInsuredCount || '--';
        totalCollectionAmount.value = response.data.totalCollectionAmount || '--';
        insuredIncrease.value = response.data.insuredIncrease || 0;
        collectionIncrease.value = response.data.collectionIncrease || 0;
        employeeInsuredRatio.value = response.data.employeeInsuredRatio || 0;
        residentInsuredRatio.value = response.data.residentInsuredRatio || 0;
      }
    } catch (error) {
      console.error('加载整体数据失败:', error);
      // 使用模拟数据
      totalInsuredCount.value = '3,567,890';
      totalCollectionAmount.value = '¥ 12.34 亿';
      insuredIncrease.value = 2.5;
      collectionIncrease.value = 3.1;
      employeeInsuredRatio.value = 28.6;
      residentInsuredRatio.value = 71.4;
    }
  };

  // Load city trend data
  const loadCityTrendData = async () => {
    try {
      const response = await InsuranceAnalysisAPI.getCityTrendData();
      if (response.data) {
        cityTrendData.value = response.data;
      }
    } catch (error) {
      console.error('加载城市趋势数据失败:', error);
      // 使用模拟数据
      cityTrendData.value = {
        years: ['2019', '2020', '2021', '2022', '2023', '2024'],
        values: [280, 300, 320, 335, 350, 357],
      };
    }
  };

  // Load district table data
  const loadDistrictTableData = async () => {
    try {
      const response = await InsuranceAnalysisAPI.getDistrictTableData({
        startMonth: startMonth.value?.format('YYYY-MM'),
        endMonth: endMonth.value?.format('YYYY-MM'),
      });
      if (response.data) {
        districtTableData.value = response.data;
      }
    } catch (error) {
      console.error('加载区县表格数据失败:', error);
      // 使用模拟数据
      districtTableData.value = [
        {
          name: '文峰区',
          insured: '850,000',
          collection: '¥ 2.8 亿',
        },
        {
          name: '北关区',
          insured: '720,000',
          collection: '¥ 2.5 亿',
        },
        {
          name: '殷都区',
          insured: '680,000',
          collection: '¥ 2.3 亿',
        },
        {
          name: '龙安区',
          insured: '550,000',
          collection: '¥ 1.9 亿',
        },
        {
          name: '安阳县',
          insured: '400,000',
          collection: '¥ 1.4 亿',
        },
        {
          name: '林州市',
          insured: '360,000',
          collection: '¥ 1.2 亿',
        },
        {
          name: '滑县',
          insured: '300,000',
          collection: '¥ 1.0 亿',
        },
      ];
    }
  };

  // Load district details
  const loadDistrictDetails = async (districtName) => {
    selectedDistrict.value = districtName;

    try {
      const response = await InsuranceAnalysisAPI.getDistrictDetail(districtName);
      if (response.data) {
        districtDetailData.value = response.data;
      }
    } catch (error) {
      console.error('加载区县详情失败:', error);
      // 使用模拟数据
      const detailedData = {
        文峰区: {
          insured: '850,000',
          collection: '¥ 2.8 亿',
          towns: [
            {
              name: '东风乡',
              insured: '150,000',
              collection: '¥ 0.5 亿',
              trend: [10, 12, 13, 14, 15, 15],
            },
            {
              name: '西大街街道',
              insured: '200,000',
              collection: '¥ 0.7 亿',
              trend: [15, 17, 18, 19, 20, 20],
            },
            {
              name: '南关街道',
              insured: '180,000',
              collection: '¥ 0.6 亿',
              trend: [13, 15, 16, 17, 18, 18],
            },
          ],
          overallTrend: [70, 75, 80, 82, 85, 85],
        },
        北关区: {
          insured: '720,000',
          collection: '¥ 2.5 亿',
          towns: [
            {
              name: '红旗路街道',
              insured: '180,000',
              collection: '¥ 0.6 亿',
              trend: [14, 15, 16, 17, 18, 18],
            },
            {
              name: '解放路街道',
              insured: '160,000',
              collection: '¥ 0.55 亿',
              trend: [12, 13, 14, 15, 16, 16],
            },
          ],
          overallTrend: [60, 65, 68, 70, 72, 72],
        },
      };

      const data = detailedData[districtName];
      if (data) {
        districtDetailData.value = data;
      } else {
        districtDetailData.value = {
          insured: '0',
          collection: '¥ 0',
          towns: [],
          overallTrend: [],
        };
      }
    }
  };

  // Handle view detail event
  const handleViewDetail = async (districtName) => {
    await loadDistrictDetails(districtName);
  };

  // Watch date range changes
  watch([startMonth, endMonth], ([newStart, newEnd]) => {
    if (newStart && newEnd) {
      console.log('日期范围变化:', newStart.format('YYYY-MM'), '—', newEnd.format('YYYY-MM'));
      // Reload data based on new date range
      loadDashboardData();
    }
  });

  // Page load
  onMounted(() => {
    initDateRange();
    loadDashboardData();
  });
</script>

<style scoped>
  /* Custom scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>
