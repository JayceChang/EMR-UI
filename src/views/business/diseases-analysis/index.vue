<template>
  <div class="min-h-screen bg-gray-50 font-sans text-dark bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="mx-auto px-4 py-6 relative z-10 w-full">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 左侧筛选面板 -->
        <aside class="w-72 bg-white rounded-lg shadow-lg flex-shrink-0 overflow-y-auto">
          <FilterPanel :loading="loading" @search="handleSearch" @reset="handleResetFilters" />
        </aside>

        <!-- 右侧主内容面板 -->
        <div class="flex-1 rounded-lg flex flex-col overflow-hidden">
          <main class="bg-white rounded-xl p-5 table-shadow w-full lg:w-full overflow-x-auto">
            <!-- Tab导航 -->
            <a-tabs v-model:activeKey="activeTab" class="mb-6">
              <a-tab-pane key="summary" tab="汇总分析">
                <SummaryTable
                  :data="summaryData"
                  :loading="loading"
                  :analysis-type="filterParams.analysisType"
                  :pagination="summaryPagination"
                  @view-detail="handleViewDetail"
                  @page-change="handleSummaryPageChange"
                />
              </a-tab-pane>
              <!-- <a-tab-pane key="trend" tab="趋势分析">
                <TrendAnalysis
                  :data="trendData"
                  :selected-disease="selectedDisease"
                  :loading="loading"
                />
              </a-tab-pane>
              <a-tab-pane key="outpatient" tab="外转患者分析">
                <OutpatientTable
                  :data="outpatientData"
                  :loading="loading"
                  :analysis-type="filterParams.analysisType"
                  @view-detail="handleViewDetail"
                />
              </a-tab-pane> -->
            </a-tabs>
          </main>
        </div>
      </div>
    </div>
    <DiseaseDrillDownModal v-model:open="drillDownModalOpen" :context="drillDownContext" />
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';

  // Components
  // API
  import {
    DiseasesAnalysisAPI,
    SummaryAnalysisAPI,
    TrendAnalysisAPI,
    OutpatientAnalysisAPI,
    DiseaseDrillDownAPI,
    DiseaseChartAPI,
  } from '/@/api/business/diseases-analysis/diseases-analysis-api';

  import FilterPanel from './components/FilterPanel.vue';
  import SummaryTable from './components/SummaryTable.vue';
  import TrendAnalysis from './components/TrendAnalysis.vue';
  import OutpatientTable from './components/OutpatientTable.vue';
  import DiseaseDrillDownModal from './components/DiseaseDrillDownModal.vue';

  // Import styles
  import '/@/assets/css/all.min.css';

  // Active tab
  const activeTab = ref('summary');

  // Loading state
  const loading = ref(false);

  // Selected disease for trend analysis
  const selectedDisease = ref('');
  const currentYear = dayjs().year();

  // Filter parameters
  const filterParams = reactive({
    startDate: `${currentYear}-01`,
    endDate: `${currentYear}-12`,
    districtId: '',
    town: '',
    insuranceType: '',
    hospitalLevel: '',
    hospitalName: '',
    diseaseCode: '',
    diseaseType: '',
    analysisType: 'icd10Category', // 默认分析类型
  });

  // Summary data
  const summaryData = ref([]);

  // Summary pagination
  const summaryPagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });

  // Outpatient data
  const outpatientData = ref([]);

  // Trend data
  const trendData = ref({});
  const drillDownModalOpen = ref(false);
  const drillDownContext = ref({});

  // Mock data
  const mockData = {
    icd10Category: [
      {
        name: '传染病和寄生虫病 (A00-B99)',
        patients: 1200,
        patientsGrowth: 0.15,
        totalCost: 1200000,
        costGrowth: 0.12,
        totalMedCost: 800000,
        medCostGrowth: 0.1,
        avgCost: 1000,
        avgCostGrowth: -0.03,
        avgMedCost: 666,
        avgMedCostGrowth: -0.05,
        avgDays: 7,
        avgDaysGrowth: -0.02,
      },
      {
        name: '肿瘤 (C00-D48)',
        patients: 850,
        patientsGrowth: 0.2,
        totalCost: 2500000,
        costGrowth: 0.18,
        totalMedCost: 1800000,
        medCostGrowth: 0.16,
        avgCost: 2941,
        avgCostGrowth: -0.02,
        avgMedCost: 2117,
        avgMedCostGrowth: -0.03,
        avgDays: 15,
        avgDaysGrowth: 0.01,
      },
      {
        name: '循环系统疾病 (I00-I99)',
        patients: 1500,
        patientsGrowth: 0.1,
        totalCost: 1800000,
        costGrowth: 0.08,
        totalMedCost: 1200000,
        medCostGrowth: 0.07,
        avgCost: 1200,
        avgCostGrowth: -0.02,
        avgMedCost: 800,
        avgMedCostGrowth: -0.01,
        avgDays: 8,
        avgDaysGrowth: -0.01,
      },
      {
        name: '呼吸系统疾病 (J00-J99)',
        patients: 1000,
        patientsGrowth: 0.05,
        totalCost: 900000,
        costGrowth: 0.03,
        totalMedCost: 600000,
        medCostGrowth: 0.02,
        avgCost: 900,
        avgCostGrowth: -0.02,
        avgMedCost: 600,
        avgMedCostGrowth: -0.01,
        avgDays: 6,
        avgDaysGrowth: -0.01,
      },
      {
        name: '消化系统疾病 (K00-K93)',
        patients: 900,
        patientsGrowth: 0.08,
        totalCost: 1000000,
        costGrowth: 0.07,
        totalMedCost: 700000,
        medCostGrowth: 0.06,
        avgCost: 1111,
        avgCostGrowth: -0.01,
        avgMedCost: 777,
        avgMedCostGrowth: -0.01,
        avgDays: 7,
        avgDaysGrowth: 0.0,
      },
      {
        name: '损伤、中毒和外因的某些其他后果 (S00-T98)',
        patients: 700,
        patientsGrowth: 0.12,
        totalCost: 1500000,
        costGrowth: 0.1,
        totalMedCost: 1000000,
        medCostGrowth: 0.09,
        avgCost: 2142,
        avgCostGrowth: -0.02,
        avgMedCost: 1428,
        avgMedCostGrowth: -0.03,
        avgDays: 10,
        avgDaysGrowth: 0.01,
      },
    ],
    outpatient: {
      icd10Category: [
        {
          name: '传染病和寄生虫病 (A00-B99)',
          patients: 50,
          patientsGrowth: 0.25,
          totalCost: 80000,
          costGrowth: 0.2,
          totalMedCost: 50000,
          medCostGrowth: 0.18,
          avgCost: 1600,
          avgCostGrowth: -0.05,
          avgMedCost: 1000,
          avgMedCostGrowth: -0.07,
          avgDays: 8,
          avgDaysGrowth: -0.03,
        },
        {
          name: '肿瘤 (C00-D48)',
          patients: 120,
          patientsGrowth: 0.3,
          totalCost: 400000,
          costGrowth: 0.28,
          totalMedCost: 300000,
          medCostGrowth: 0.25,
          avgCost: 3333,
          avgCostGrowth: -0.03,
          avgMedCost: 2500,
          avgMedCostGrowth: -0.04,
          avgDays: 18,
          avgDaysGrowth: 0.02,
        },
      ],
    },
    trendData: {
      '传染病和寄生虫病 (A00-B99)': {
        months: ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06', '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12'],
        patients: [1200, 1250, 1300, 1280, 1350, 1400, 1380, 1450, 1500, 1480, 1550, 1600],
        avgCost: [1000, 1020, 1010, 1030, 1050, 1040, 1060, 1080, 1070, 1090, 1100, 1120],
        avgDays: [7.0, 7.1, 7.0, 7.2, 7.1, 7.3, 7.2, 7.4, 7.3, 7.5, 7.4, 7.6],
      },
      '肿瘤 (C00-D48)': {
        months: ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06', '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12'],
        patients: [850, 880, 900, 890, 920, 950, 930, 960, 980, 970, 1000, 1020],
        avgCost: [2941, 2960, 2950, 2980, 3000, 2990, 3020, 3050, 3040, 3070, 3100, 3120],
        avgDays: [15.0, 15.1, 15.0, 15.2, 15.1, 15.3, 15.2, 15.4, 15.3, 15.5, 15.4, 15.6],
      },
    },
  };

  let latestFetchRequestId = 0;

  const formatMonthParam = (value, fallback = '') => {
    if (!value) {
      return fallback;
    }
    if (dayjs.isDayjs(value)) {
      return value.format('YYYY-MM');
    }
    if (typeof value === 'string') {
      return value.slice(0, 7);
    }
    return fallback;
  };

  const buildQueryParams = () => {
    return {
      ...filterParams,
      startDate: formatMonthParam(filterParams.startDate, `${currentYear}-01`),
      endDate: formatMonthParam(filterParams.endDate, `${currentYear}-12`),
    };
  };

  const loadTrendData = async (diseaseCode, requestId = latestFetchRequestId) => {
    if (!diseaseCode) {
      trendData.value = {};
      return;
    }
    try {
      const trendResponse = await TrendAnalysisAPI.getDiseasePatientTrend(diseaseCode, buildQueryParams());
      if (requestId !== latestFetchRequestId) {
        return;
      }
      if (trendResponse.data) {
        trendData.value = trendResponse.data;
      } else {
        trendData.value = mockData.trendData[diseaseCode] || {};
      }
    } catch (error) {
      console.error('加载趋势数据失败:', error);
      if (requestId !== latestFetchRequestId) {
        return;
      }
      trendData.value = mockData.trendData[diseaseCode] || {};
    }
  };

  // Fetch data based on filters
  const fetchData = async () => {
    const requestId = ++latestFetchRequestId;

    try {
      loading.value = true;

      if (filterParams.analysisType !== 'icd10Category') {
        summaryData.value = [];
        summaryPagination.total = 0;
        outpatientData.value = [];
        trendData.value = {};
        return;
      }

      const baseParams = buildQueryParams();
      const requestParams = {
        ...baseParams,
        pageNum: summaryPagination.pageNum,
        pageSize: summaryPagination.pageSize,
      };

      const tasks = [
        {
          label: '汇总数据',
          run: async () => {
            const response = await SummaryAnalysisAPI.getICD10CategoryList(requestParams);
            if (requestId !== latestFetchRequestId) {
              return;
            }
            if (response.data) {
              summaryData.value = response.data.list || [];
              summaryPagination.total = response.data.total || 0;
              summaryPagination.pageNum = response.data.pageNum || 1;
              summaryPagination.pageSize = response.data.pageSize || 10;
              return;
            }
            summaryData.value = mockData.icd10Category;
            summaryPagination.total = mockData.icd10Category.length;
          },
        },
        {
          label: '外转患者',
          run: async () => {
            const response = await OutpatientAnalysisAPI.getOutpatientList(baseParams);
            if (requestId !== latestFetchRequestId) {
              return;
            }
            outpatientData.value = response.data || mockData.outpatient.icd10Category;
          },
        },
      ];

      const settledResults = await Promise.allSettled(tasks.map((item) => item.run()));
      if (requestId !== latestFetchRequestId) {
        return;
      }

      const failedTasks = settledResults
        .map((result, index) => ({ result, label: tasks[index].label }))
        .filter((item) => item.result.status === 'rejected');

      failedTasks.forEach((item) => {
        console.error(`加载${item.label}失败:`, item.result.reason);
      });

      if (summaryData.value.length > 0) {
        selectedDisease.value = summaryData.value[0].name;
        if (activeTab.value === 'trend') {
          await loadTrendData(selectedDisease.value, requestId);
        }
      } else {
        trendData.value = {};
      }

      if (failedTasks.length) {
        message.warning(`部分模块加载失败（${failedTasks.length}/${tasks.length}）`);
        return;
      }

      message.success('查询完成');
    } catch (error) {
      console.error('加载数据失败:', error);
      message.warning('使用模拟数据（API暂不可用）');
    } finally {
      if (requestId === latestFetchRequestId) {
        loading.value = false;
      }
    }
  };

  // Event handlers
  const handleSearch = async (params) => {
    Object.assign(filterParams, {
      ...params,
      startDate: formatMonthParam(params.startDate, `${currentYear}-01`),
      endDate: formatMonthParam(params.endDate, `${currentYear}-12`),
    });
    // 搜索时重置分页到第一页
    summaryPagination.pageNum = 1;
    await fetchData();
  };

  const handleResetFilters = async () => {
    filterParams.startDate = `${currentYear}-01`;
    filterParams.endDate = `${currentYear}-12`;
    filterParams.districtId = '';
    filterParams.town = '';
    filterParams.insuranceType = '';
    filterParams.hospitalLevel = '';
    filterParams.hospitalName = '';
    filterParams.diseaseCode = '';
    filterParams.diseaseType = '';
    filterParams.analysisType = 'icd10Category';
    // 重置分页
    summaryPagination.pageNum = 1;
    summaryPagination.pageSize = 10;
    await fetchData();
    message.info('已重置筛选条件');
  };

  // 处理汇总表格分页变化
  const handleSummaryPageChange = async (paginationInfo) => {
    summaryPagination.pageNum = paginationInfo.pageNum;
    summaryPagination.pageSize = paginationInfo.pageSize;
    await fetchData();
  };

  const handleViewDetail = async (record) => {
    const queryParams = buildQueryParams();
    const isObjectRecord = record && typeof record === 'object';
    const diseaseCode = isObjectRecord ? record.code || record.name || '' : record || '';
    const diseaseName = isObjectRecord ? record.name || record.code || '病种' : record || '病种';
    drillDownContext.value = {
      title: `病种下钻 - ${diseaseName}`,
      diseaseCode,
      diseaseName,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
      districtId: queryParams.districtId,
      town: queryParams.town,
      insuranceType: queryParams.insuranceType,
      hospitalLevel: queryParams.hospitalLevel,
      hospitalName: queryParams.hospitalName,
      analysisType: queryParams.analysisType,
    };
    drillDownModalOpen.value = true;
  };

  // Watch for tab changes
  watch(activeTab, async (newTab) => {
    if (newTab === 'trend' && selectedDisease.value) {
      await loadTrendData(selectedDisease.value, latestFetchRequestId);
    }
  });

  // Page load
  onMounted(async () => {
    await fetchData();
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
