<template>
  <div class="min-h-screen flex flex-col p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-lg rounded-xl p-6 flex items-center justify-between">
      <h1 class="text-3xl font-extrabold text-gray-800 flex items-center">
        <i class="fas fa-chart-line text-blue-600 mr-3"></i>
        安阳市医保监管平台 - 外转数据分析
      </h1>
      <div class="flex items-center space-x-4">
        <a-range-picker v-model:value="dateRange" picker="month" format="YYYY-MM" :placeholder="['开始月份', '结束月份']" />
      </div>
    </header>

    <!-- Main Content Grid -->
    <main class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
      <!-- Overview Cards (Top Row) -->
      <section class="lg:col-span-3">
        <OverviewCards
          :loading="loading"
          :totalData="overviewTotalData"
          :cityData="overviewCityData"
          :provinceData="overviewProvinceData"
          @drill-down="handleDrillDown"
        />
      </section>

      <!-- Left Column: Overview and Monthly Trend -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Monthly Trend Chart -->
        <section class="bg-white p-6 rounded-xl shadow-lg">
          <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-chart-area text-blue-600 mr-2"></i>
            外转患者人次数月度趋势
          </h3>
          <div class="w-full h-80">
            <MonthlyTrendChart :data="monthlyTrendData" :loading="loading" />
          </div>
        </section>
      </div>

      <!-- Right Column: Summary and Filters -->
      <!-- <div class="lg:col-span-1 space-y-6">
        <FilterPanel
          :loading="loading"
          @apply="handleApplyFilter"
        />
      </div> -->
    </main>

    <!-- Medical Institutions Summary -->
    <section class="bg-white p-6 rounded-xl shadow-lg">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <i class="fas fa-hospital text-blue-600 mr-2"></i>
        全市外转医疗机构汇总信息
      </h3>
      <MedicalInstitutionsTable
        :data="institutionsData"
        :loading="institutionsLoading"
        :pagination="institutionsPagination"
        @drill-down="handleDrillDown"
        @page-change="handleInstitutionsPageChange"
      />
    </section>

    <!-- Medical Group Analysis -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MedicalGroupAnalysis :data="medicalGroupData.peopleHospital" />
      <MedicalGroupAnalysis :data="medicalGroupData.tcmHospital" />
    </section>

    <!-- Transfer Rate Radar Charts -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TransferRateRadarChart :data="fiveCountiesData" title="五县住院外转率分析" color="#8860D0" />
      <TransferRateRadarChart :data="fourDistrictsData" title="四区住院外转率分析" color="#4CAF50" />
    </section>

    <!-- Out Transfer Analysis -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <OutTransferAnalysis :data="outTransferData" :loading="loading" />
      </div>
      <div class="lg:col-span-2">
        <OutTransferTable :data="outTransferTableData" :loading="loading" @drill-down="handleDrillDown" />
      </div>
    </section>

    <!-- County/District Summary -->
    <section class="bg-white p-6 rounded-xl shadow-lg">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <i class="fas fa-map-marked-alt text-blue-600 mr-2"></i>
        各县区外转数据汇总
      </h3>
      <CountySummaryTable :data="countyData" :loading="loading" @drill-down="handleDrillDown" />
    </section>

    <!-- ICD10 Disease Category Ranking -->
    <section class="bg-white p-6 rounded-xl shadow-lg">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <i class="fas fa-notes-medical text-blue-600 mr-2"></i>
        ICD10病种类目外转分类排行前十名
      </h3>
      <Icd10RankingTable :data="icd10Data" :loading="loading" @drill-down="handleDrillDown" />
    </section>

    <TransferDrillDownModal v-model:open="drillDownModalOpen" :context="drillDownContext" />
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';

  // Components
  // API
  import {
    TransferAnalysisAPI,
    OverviewAPI,
    MonthlyTrendAPI,
    MedicalInstitutionAPI,
    TransferRateAPI,
    CountySummaryAPI,
    Icd10RankingAPI,
    OutTransferAPI,
  } from '/@/api/business/transfer-analysis/transfer-analysis-api';
  import OverviewCards from './components/OverviewCards.vue';
  import MonthlyTrendChart from './components/MonthlyTrendChart.vue';
  import MedicalInstitutionsTable from './components/MedicalInstitutionsTable.vue';
  import MedicalGroupAnalysis from './components/MedicalGroupAnalysis.vue';
  import TransferRateRadarChart from './components/TransferRateRadarChart.vue';
  import OutTransferAnalysis from './components/OutTransferAnalysis.vue';
  import OutTransferTable from './components/OutTransferTable.vue';
  import CountySummaryTable from './components/CountySummaryTable.vue';
  import Icd10RankingTable from './components/Icd10RankingTable.vue';
  import TransferDrillDownModal from './components/TransferDrillDownModal.vue';

  // Import styles
  import '/@/assets/css/all.min.css';

  // Date range - 使用单个 dateRange 数组，RangePicker 选择完毕后一次性更新
  const dateRange = ref([dayjs().startOf('year'), dayjs()]);

  // Loading state
  const loading = ref(false);
  const institutionsLoading = ref(false);

  // 医疗机构分页状态
  const institutionsPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  let latestLoadRequestId = 0;
  let dateRangeReloadTimer = null;

  const drillDownModalOpen = ref(false);
  const drillDownContext = ref({});

  // Overview Card Data
  const overviewTotalData = ref({});
  const overviewCityData = ref({});
  const overviewProvinceData = ref({});

  // Data
  const monthlyTrendData = ref();
  //   {
  //   months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  //   data: [1000, 1200, 1100, 1300, 1500, 1400, 1600, 1700, 1800, 1900, 2000, 2100]
  // }

  const institutionsData = ref([
    // {
    //   name: '北京协和医院',
    //   transfers: 800,
    //   totalCost: 8000000,
    //   totalCoordinationCost: 5600000,
    //   avgCost: 10000,
    //   avgDays: 8.5,
    //   avgCoordinationCost: 7000
    // },
    // {
    //   name: '上海华山医院',
    //   transfers: 750,
    //   totalCost: 7800000,
    //   totalCoordinationCost: 5400000,
    //   avgCost: 10400,
    //   avgDays: 8.0,
    //   avgCoordinationCost: 7200
    // },
    // {
    //   name: '广州中山一院',
    //   transfers: 700,
    //   totalCost: 7500000,
    //   totalCoordinationCost: 5200000,
    //   avgCost: 10700,
    //   avgDays: 9.0,
    //   avgCoordinationCost: 7400
    // },
    // {
    //   name: '郑州大学第一附属医院',
    //   transfers: 650,
    //   totalCost: 7000000,
    //   totalCoordinationCost: 4900000,
    //   avgCost: 10800,
    //   avgDays: 8.8,
    //   avgCoordinationCost: 7500
    // },
    // {
    //   name: '西安交通大学第一附属医院',
    //   transfers: 600,
    //   totalCost: 6500000,
    //   totalCoordinationCost: 4500000,
    //   avgCost: 10833,
    //   avgDays: 8.2,
    //   avgCoordinationCost: 7500
    // }
  ]);

  const medicalGroupData = reactive({
    peopleHospital: {
      // name: '安阳市人民医院医疗集团',
      // transfers: 5678,
      // transfersYoy: 8.2,
      // totalCost: 55.6,
      // totalCostYoy: -1.1,
      // totalCoordinationCost: 38.9,
      // totalCoordinationCostYoy: 7.5,
      // avgCost: 9700,
      // avgCostYoy: 3.0,
      // avgCoordinationCost: 6800,
      // avgCoordinationCostYoy: 5.5,
      // trendData: {
      //   months: ['1月', '2月', '3月', '4月', '5月', '6月'],
      //   patients: [450, 480, 460, 510, 540, 520],
      //   cost: [4.5, 4.8, 4.6, 5.1, 5.4, 5.2]
      // }
    },
    tcmHospital: {
      // name: '安阳市中医院医疗集团',
      // transfers: 3456,
      // transfersYoy: 10.5,
      // totalCost: 32.1,
      // totalCostYoy: 2.5,
      // totalCoordinationCost: 22.3,
      // totalCoordinationCostYoy: 9.0,
      // avgCost: 9300,
      // avgCostYoy: 4.5,
      // avgCoordinationCost: 6500,
      // avgCoordinationCostYoy: 7.0,
      // trendData: {
      //   months: ['1月', '2月', '3月', '4月', '5月', '6月'],
      //   patients: [280, 300, 290, 320, 340, 330],
      //   cost: [2.6, 2.8, 2.7, 3.0, 3.2, 3.1]
      // }
    },
    cancerAlliance: {
      // name: '安阳市肿瘤联盟',
      // transfers: 3456,
      // transfersYoy: 10.5,
      // totalCost: 32.1,
      // totalCostYoy: 2.5,
      // totalCoordinationCost: 22.3,
      // totalCoordinationCostYoy: 9.0,
      // avgCost: 9300,
      // avgCostYoy: 4.5,
      // avgCoordinationCost: 6500,
      // avgCoordinationCostYoy: 7.0,
      // trendData: {
      //   months: ['1月', '2月', '3月', '4月', '5月', '6月'],
      //   patients: [280, 300, 290, 320, 340, 330],
      //   cost: [2.6, 2.8, 2.7, 3.0, 3.2, 3.1]
      // }
    },
  });

  const fiveCountiesData = ref([
    // { name: '林州市', value: 0.25 },
    // { name: '安阳县', value: 0.20 },
    // { name: '内黄县', value: 0.22 },
    // { name: '滑县', value: 0.28 },
    // { name: '汤阴县', value: 0.18 }
  ]);

  const fourDistrictsData = ref([
    // { name: '殷都区', value: 0.08 },
    // { name: '文峰区', value: 0.05 },
    // { name: '北关区', value: 0.10 },
    // { name: '龙安区', value: 0.12 }
  ]);

  const outTransferData = ref();
  //   {
  //   totalPatients: 850,
  //   totalCost: 4250000
  // }

  const outTransferTableData = ref([
    // { name: '文峰区', count: 200, cityRatio: 0.05, provinceRatio: 0.95 },
    // { name: '北关区', count: 150, cityRatio: 0.10, provinceRatio: 0.90 },
    // { name: '殷都区', count: 120, cityRatio: 0.07, provinceRatio: 0.93 },
    // { name: '龙安区', count: 100, cityRatio: 0.08, provinceRatio: 0.92 },
    // { name: '安阳县', count: 80, cityRatio: 0.15, provinceRatio: 0.85 },
    // { name: '汤阴县', count: 70, cityRatio: 0.12, provinceRatio: 0.88 },
    // { name: '滑县', count: 60, cityRatio: 0.18, provinceRatio: 0.82 },
    // { name: '内黄县', count: 50, cityRatio: 0.16, provinceRatio: 0.84 }
  ]);

  const countyData = ref([
    // { county: '文峰区', transfers: 2500, totalCost: 25000000, totalCoordinationCost: 18000000, avgCost: 10000, avgCoordinationCost: 7200, avgDays: 7.5, growth: 5.2 },
    // { county: '北关区', transfers: 2200, totalCost: 22000000, totalCoordinationCost: 16000000, avgCost: 10000, avgCoordinationCost: 7272, avgDays: 7.8, growth: 4.8 },
    // { county: '殷都区', transfers: 2000, totalCost: 20000000, totalCoordinationCost: 14500000, avgCost: 10000, avgCoordinationCost: 7250, avgDays: 7.2, growth: 6.1 },
    // { county: '龙安区', transfers: 1800, totalCost: 18000000, totalCoordinationCost: 13000000, avgCost: 10000, avgCoordinationCost: 7222, avgDays: 7.0, growth: 5.5 },
    // { county: '安阳县', transfers: 1500, totalCost: 15000000, totalCoordinationCost: 10500000, avgCost: 10000, avgCoordinationCost: 7000, avgDays: 8.0, growth: 4.0 }
  ]);

  const icd10Data = ref([
    // { category: '循环系统疾病', transfers: 1500, totalCost: 15000000, totalCoordinationCost: 10000000, avgCost: 10000, avgCoordinationCost: 6667, avgDays: 9.0, growth: 7.0 },
    // { category: '肿瘤', transfers: 1200, totalCost: 18000000, totalCoordinationCost: 12000000, avgCost: 15000, avgCoordinationCost: 10000, avgDays: 12.0, growth: 8.5 },
    // { category: '呼吸系统疾病', transfers: 1000, totalCost: 9000000, totalCoordinationCost: 6000000, avgCost: 9000, avgCoordinationCost: 6000, avgDays: 7.0, growth: 3.0 },
    // { category: '消化系统疾病', transfers: 900, totalCost: 8000000, totalCoordinationCost: 5500000, avgCost: 8889, avgCoordinationCost: 6111, avgDays: 6.5, growth: 4.5 },
    // { category: '损伤、中毒和外因的某些其他后果', transfers: 800, totalCost: 7500000, totalCoordinationCost: 5000000, avgCost: 9375, avgCoordinationCost: 6250, avgDays: 8.0, growth: 6.0 }
  ]);

  // 加载医疗机构数据（分页）
  const loadInstitutionsData = async (pageNum = institutionsPagination.current, pageSize = institutionsPagination.pageSize, requestId = null) => {
    try {
      institutionsLoading.value = true;

      const params = {
        startMonth: dateRange.value?.[0]?.format('YYYY-MM'),
        endMonth: dateRange.value?.[1]?.format('YYYY-MM'),
        pageNum,
        pageSize,
      };

      const response = await MedicalInstitutionAPI.getTransferInstitutionList(params);
      if (requestId && requestId !== latestLoadRequestId) {
        return;
      }
      if (response.data) {
        institutionsData.value = response.data.list || [];
        institutionsPagination.current = response.data.pageNum || 1;
        institutionsPagination.pageSize = response.data.pageSize || 10;
        institutionsPagination.total = response.data.total || 0;
      }
    } catch (error) {
      console.error('加载医疗机构数据失败:', error);
    } finally {
      if (!requestId || requestId === latestLoadRequestId) {
        institutionsLoading.value = false;
      }
    }
  };

  // 医疗机构分页变化事件处理
  const handleInstitutionsPageChange = async ({ pageNum, pageSize }) => {
    await loadInstitutionsData(pageNum, pageSize);
  };

  const handleDrillDown = (payload) => {
    const context = payload || {};
    drillDownContext.value = {
      ...context,
      startMonth: dateRange.value?.[0]?.format('YYYY-MM'),
      endMonth: dateRange.value?.[1]?.format('YYYY-MM'),
    };
    drillDownModalOpen.value = true;
  };

  // Load all data
  const loadAllData = async () => {
    const requestId = ++latestLoadRequestId;
    const isStaleRequest = () => requestId !== latestLoadRequestId;

    try {
      loading.value = true;

      // Prepare date range params
      const params = {
        startMonth: dateRange.value?.[0]?.format('YYYY-MM'),
        endMonth: dateRange.value?.[1]?.format('YYYY-MM'),
      };

      institutionsPagination.current = 1;

      const tasks = [
        {
          label: '概览卡片',
          run: async () => {
            const [totalResponse, cityResponse, provinceResponse] = await Promise.all([
              OverviewAPI.getTotalTransferData(params),
              OverviewAPI.getCityTransferData(params),
              OverviewAPI.getProvinceTransferData(params),
            ]);
            if (isStaleRequest()) return;
            overviewTotalData.value = totalResponse.data || {};
            overviewCityData.value = cityResponse.data || {};
            overviewProvinceData.value = provinceResponse.data || {};
          },
        },
        {
          label: '月度趋势',
          run: async () => {
            const trendResponse = await MonthlyTrendAPI.getMonthlyPatientTrend(params);
            if (isStaleRequest()) return;
            monthlyTrendData.value = trendResponse.data;
          },
        },
        {
          label: '医疗机构分页',
          run: async () => {
            await loadInstitutionsData(1, institutionsPagination.pageSize, requestId);
          },
        },
        {
          label: '医疗集团',
          run: async () => {
            const groupResponse = await TransferAnalysisAPI.getTransferStatistics(params);
            if (isStaleRequest()) return;
            if (groupResponse.data) {
              const responseData = groupResponse.data;
              if (responseData.peopleHospital) {
                Object.assign(medicalGroupData.peopleHospital, responseData.peopleHospital);
              }
              if (responseData.tcmHospital) {
                Object.assign(medicalGroupData.tcmHospital, responseData.tcmHospital);
              }
              if (responseData.cancerAlliance) {
                Object.assign(medicalGroupData.cancerAlliance, responseData.cancerAlliance);
              }
            }
          },
        },
        {
          label: '外转率',
          run: async () => {
            const [fiveCountiesResponse, fourDistrictsResponse] = await Promise.all([
              TransferRateAPI.getFiveCountiesRate(params),
              TransferRateAPI.getFourDistrictsRate(params),
            ]);
            if (isStaleRequest()) return;
            fiveCountiesData.value = fiveCountiesResponse.data || [];
            fourDistrictsData.value = fourDistrictsResponse.data || [];
          },
        },
        {
          label: '外转患者分析',
          run: async () => {
            const outTransferResponse = await OutTransferAPI.getOutTransferAnalysis(params);
            if (isStaleRequest()) return;
            outTransferData.value = outTransferResponse.data;
          },
        },
        {
          label: '外转患者统计',
          run: async () => {
            const outTransferStatsResponse = await OutTransferAPI.getOutTransferStats(params);
            if (isStaleRequest()) return;
            outTransferTableData.value = outTransferStatsResponse.data || [];
          },
        },
        {
          label: '县区汇总',
          run: async () => {
            const countyResponse = await CountySummaryAPI.getCountyTransferSummary(params);
            if (isStaleRequest()) return;
            countyData.value = countyResponse.data || [];
          },
        },
        {
          label: 'ICD10排行',
          run: async () => {
            const icd10Response = await Icd10RankingAPI.getIcd10TransferRanking(params);
            if (isStaleRequest()) return;
            icd10Data.value = icd10Response.data || [];
          },
        },
      ];

      const settledResults = await Promise.allSettled(tasks.map((item) => item.run()));
      if (isStaleRequest()) {
        return;
      }

      const failedTasks = settledResults
        .map((result, index) => ({ result, label: tasks[index].label }))
        .filter((item) => item.result.status === 'rejected');

      failedTasks.forEach((item) => {
        console.error(`加载${item.label}数据失败:`, item.result.reason);
      });

      if (failedTasks.length) {
        message.warning(`部分模块加载失败（${failedTasks.length}/${tasks.length}）`);
      } else {
        message.success('数据加载完成');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      message.warning('使用模拟数据（API暂不可用）');
    } finally {
      if (requestId === latestLoadRequestId) {
        loading.value = false;
      }
    }
  };

  // Watch for date range changes - RangePicker 选择完毕后两个值同时更新，只触发一次
  watch(dateRange, (newRange) => {
    if (newRange && newRange[0] && newRange[1]) {
      console.log('日期范围变化:', newRange[0].format('YYYY-MM'), '—', newRange[1].format('YYYY-MM'));
      if (dateRangeReloadTimer) {
        clearTimeout(dateRangeReloadTimer);
      }
      dateRangeReloadTimer = setTimeout(() => {
        loadAllData();
      }, 250);
    }
  });

  onUnmounted(() => {
    if (dateRangeReloadTimer) {
      clearTimeout(dateRangeReloadTimer);
      dateRangeReloadTimer = null;
    }
  });

  // Page load
  onMounted(async () => {
    await loadAllData();
  });
</script>

<style scoped></style>
