<template>
  <div class="bg-gray-50 min-h-screen font-sans text-dark bg-gradient-to-br from-blue-50 to-indigo-100">
    <main class="mx-auto px-4 py-6 w-full">
      <div class="flex flex-col lg:flex-row gap-6" style="position: relative">
        <!-- 左侧筛选面板 -->
        <aside class="w-72 bg-white rounded-lg shadow-lg flex-shrink-0 overflow-y-auto">
          <FilterPanel :loading="loading" @search="handleSearch" @reset="handleReset" />
        </aside>
        <!-- 右侧查询结果 -->
        <div class="flex-1 rounded-lg flex flex-col overflow-hidden">
          <!-- 数据概览卡片 -->
          <div class="bg-white rounded-xl p-5 filter-card" style="margin-bottom: 20px">
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <i class="fas fa-chart-pie text-primary mr-2"></i>
              外转患者数据概览
            </h3>
            <OverviewCards :data="overviewData" />
          </div>

          <!-- 数据统计图表 -->
          <div class="bg-white rounded-xl p-5 filter-card" style="margin-bottom: 20px">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-lg font-semibold flex items-center">
                <i class="fas fa-chart-line text-primary mr-2"></i>
                外转患者费用趋势
              </h3>
              <!-- <div class="flex space-x-2">
                <a-button
                  v-for="period in periods"
                  :key="period"
                  :type="selectedPeriod === period ? 'primary' : 'default'"
                  @click="handlePeriodChange(period)"
                  class="px-3 py-1"
                >
                  {{ period }}
                </a-button>
              </div> -->
            </div>
            <div class="w-full h-[220px]">
              <TrendChart :data="trendData" :loading="loading" />
            </div>
          </div>

          <!-- 表格结果 -->
          <div class="bg-white rounded-xl p-5 filter-card overflow-hidden">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 class="text-lg font-semibold flex items-center">
                <i class="fas fa-table text-primary mr-2"></i>
                外转患者按区域汇总
              </h3>
              <div class="flex flex-wrap gap-2 mt-3 sm:mt-0">
                <a-input-search v-model:value="districtSearchKeyword" placeholder="搜索区域..." style="width: 200px" @search="handleDistrictSearch" />
              </div>
            </div>
            <DistrictTable :data="districtData" :loading="loading" @drill-down="handleDrillDown" />
          </div>

          <!-- 医疗机构汇总表格 -->
          <div class="bg-white rounded-xl p-5 filter-card overflow-hidden mt-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 class="text-lg font-semibold flex items-center">
                <i class="fas fa-hospital text-primary mr-2"></i>
                外转患者按医疗机构汇总
              </h3>
              <div class="flex flex-wrap gap-2 mt-3 sm:mt-0">
                <a-input-search
                  v-model:value="hospitalSearchKeyword"
                  placeholder="搜索医疗机构..."
                  style="width: 200px"
                  @search="handleHospitalSearch"
                />
              </div>
            </div>
            <HospitalTable :data="hospitalData" :loading="loading" @drill-down="handleDrillDown" />
          </div>

          <!-- 病种汇总表格 -->
          <div class="bg-white rounded-xl p-5 filter-card overflow-hidden mt-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 class="text-lg font-semibold flex items-center">
                <i class="fas fa-disease text-primary mr-2"></i>
                外转患者按病种汇总
              </h3>
              <div class="flex flex-wrap gap-2 mt-3 sm:mt-0">
                <a-input-search v-model:value="diseaseSearchKeyword" placeholder="搜索病种..." style="width: 200px" @search="handleDiseaseSearch" />
              </div>
            </div>
            <DiseaseTable :data="diseaseData" :loading="loading" @drill-down="handleDrillDown" />
          </div>
        </div>
      </div>
    </main>

    <!-- 住院明细数据模态框 -->
    <DetailsModal v-model:visible="detailsModalVisible" :drill-down-params="currentDrillDownParams" />
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';
  // Components
  // API
  import {
    TransferDetailAnalysisAPI,
    OverviewAPI,
    TrendChartAPI,
    DistrictAPI,
    HospitalAPI,
    DiseaseAPI,
  } from '/@/api/business/transfer-detail-analysis/transfer-detail-analysis-api';
  import FilterPanel from './components/FilterPanel.vue';
  import OverviewCards from './components/OverviewCards.vue';
  import TrendChart from './components/TrendChart.vue';
  import DistrictTable from './components/DistrictTable.vue';
  import HospitalTable from './components/HospitalTable.vue';
  import DiseaseTable from './components/DiseaseTable.vue';
  import DetailsModal from './components/DetailsModal.vue';

  // Import styles
  import '/@/assets/css/all.min.css';

  // State
  const loading = ref(false);
  const selectedPeriod = ref('月度');
  const periods = ['月度', '季度', '年度'];
  const currentYear = dayjs().year();

  // Filter parameters (字段名与FilterPanel保持一致)
  const filterParams = reactive({
    startMonth: dayjs(`${currentYear}-01`).format('YYYY-MM'),
    endMonth: dayjs(`${currentYear}-12`).format('YYYY-MM'),
    searchKeyword: '',
    districtId: '',
    districtName: '',
    town: '',
    insuranceType: '',
    hospitalLevel: '',
    hospitalName: '',
    diseaseType: '',
  });

  // Search keywords
  const districtSearchKeyword = ref('');
  const hospitalSearchKeyword = ref('');
  const diseaseSearchKeyword = ref('');

  // Modal state
  const detailsModalVisible = ref(false);
  const currentDrillDownParams = ref({});

  // Data
  const overviewData = ref();
  //   {
  //   totalPatients: 12589,
  //   avgCost: 5280,
  //   totalReimbursement: 10245
  // }

  const trendData = ref();
  //   {
  //   months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  //   avgCost: [5200, 5350, 5420, 5580, 5720, 5850, 5920, 6050, 6180, 6320, 6450, 6580],
  //   reimbursementRate: [62.5, 63.2, 63.8, 64.5, 65.2, 65.8, 66.3, 66.8, 67.2, 67.5, 67.8, 68.2],
  //   patients: [9200, 9500, 9800, 10200, 10500, 10800, 11200, 11500, 11800, 12200, 12500, 12800]
  // }

  const districtData = ref([
    // {
    //   district: '安阳市区',
    //   type: '市辖区',
    //   admissionCount: 2356,
    //   admissionCountYoy: 5.2,
    //   admissionCountMom: null,
    //   avgCost: 6850,
    //   avgCostYoy: 3.8,
    //   avgCostMom: -1.2,
    //   avgReimbursement: 4280,
    //   reimbursementRate: 62.5,
    //   reimbursementRateYoy: 2.1,
    //   reimbursementRateMom: 0.8,
    //   transferRate: 12.8,
    //   transferRateYoy: 1.5,
    //   transferRateMom: -0.3
    // },
    // {
    //   district: '林州市',
    //   type: '县级市',
    //   admissionCount: 1842,
    //   admissionCountYoy: 3.7,
    //   admissionCountMom: null,
    //   avgCost: 5260,
    //   avgCostYoy: 2.4,
    //   avgCostMom: -0.5,
    //   avgReimbursement: 3520,
    //   reimbursementRate: 66.9,
    //   reimbursementRateYoy: 1.8,
    //   reimbursementRateMom: 0.4,
    //   transferRate: 10.5,
    //   transferRateYoy: 1.2,
    //   transferRateMom: 0.1
    // },
    // {
    //   district: '汤阴县',
    //   type: '县',
    //   admissionCount: 1254,
    //   admissionCountYoy: -1.3,
    //   admissionCountMom: null,
    //   avgCost: 4120,
    //   avgCostYoy: -2.1,
    //   avgCostMom: -0.8,
    //   avgReimbursement: 2980,
    //   reimbursementRate: 72.3,
    //   reimbursementRateYoy: 2.5,
    //   reimbursementRateMom: 0.6,
    //   transferRate: 8.7,
    //   transferRateYoy: -0.5,
    //   transferRateMom: -0.2
    // }
  ]);

  const hospitalData = ref([
    // {
    //   name: '郑州大学第一附属医院',
    //   level: '三级甲等',
    //   admissionCount: 1256,
    //   admissionCountYoy: 5.2,
    //   admissionCountMom: 1.2,
    //   avgCost: 7850,
    //   avgCostYoy: 3.8,
    //   avgCostMom: -1.2,
    //   reimbursementRate: 62.5,
    //   avgLengthOfStay: 8.2
    // },
    // {
    //   name: '河南省人民医院',
    //   level: '二级甲等',
    //   admissionCount: 987,
    //   admissionCountYoy: 4.3,
    //   admissionCountMom: 0.8,
    //   avgCost: 6230,
    //   avgCostYoy: 2.5,
    //   avgCostMom: -0.5,
    //   reimbursementRate: 65.3,
    //   avgLengthOfStay: 7.5
    // },
    // {
    //   name: '河南省胸科医院',
    //   level: '三级甲等',
    //   admissionCount: 753,
    //   admissionCountYoy: 6.7,
    //   admissionCountMom: 2.1,
    //   avgCost: 6980,
    //   avgCostYoy: 4.2,
    //   avgCostMom: 0.8,
    //   reimbursementRate: 63.8,
    //   avgLengthOfStay: 9.1
    // }
  ]);

  const diseaseData = ref([
    // {
    //   name: '高血压',
    //   code: 'I10-I15',
    //   admissionCount: 1256,
    //   admissionCountYoy: 8.2,
    //   admissionCountMom: 2.3,
    //   avgCost: 5850,
    //   avgCostYoy: 4.5,
    //   avgCostMom: -0.8,
    //   avgReimbursement: 3820,
    //   reimbursementRate: 65.3,
    //   avgLengthOfStay: 6.5
    // },
    // {
    //   name: '糖尿病',
    //   code: 'E10-E14',
    //   admissionCount: 987,
    //   admissionCountYoy: 6.7,
    //   admissionCountMom: 1.5,
    //   avgCost: 6230,
    //   avgCostYoy: 5.2,
    //   avgCostMom: 0.5,
    //   avgReimbursement: 4120,
    //   reimbursementRate: 66.1,
    //   avgLengthOfStay: 7.2
    // },
    // {
    //   name: '急性心肌梗死',
    //   code: 'I21-I22',
    //   admissionCount: 453,
    //   admissionCountYoy: 3.2,
    //   admissionCountMom: 1.2,
    //   avgCost: 18750,
    //   avgCostYoy: 6.8,
    //   avgCostMom: 2.1,
    //   avgReimbursement: 12450,
    //   reimbursementRate: 66.4,
    //   avgLengthOfStay: 10.5
    // }
  ]);

  let latestLoadRequestId = 0;
  let periodReloadTimer = null;
  let districtSearchRequestId = 0;
  let hospitalSearchRequestId = 0;
  let diseaseSearchRequestId = 0;

  const getRequestParams = () => ({
    ...filterParams,
    period: selectedPeriod.value,
  });

  // Load all data
  const loadAllData = async () => {
    const requestId = ++latestLoadRequestId;
    const isStaleRequest = () => requestId !== latestLoadRequestId;

    try {
      loading.value = true;
      const params = getRequestParams();

      console.log('加载数据参数:', params);

      const tasks = [
        {
          label: '概览',
          run: async () => {
            const response = await OverviewAPI.getTransferDetailOverview(params);
            if (isStaleRequest()) return;
            overviewData.value = response.data;
          },
        },
        {
          label: '趋势图',
          run: async () => {
            const response = await TrendChartAPI.getTransferDetailTrend(params);
            if (isStaleRequest()) return;
            trendData.value = response.data;
          },
        },
        {
          label: '区域汇总',
          run: async () => {
            const response = await DistrictAPI.getTransferDetailDistrict(params);
            if (isStaleRequest()) return;
            districtData.value = response.data || [];
          },
        },
        {
          label: '医疗机构汇总',
          run: async () => {
            const response = await HospitalAPI.getTransferDetailHospital(params);
            if (isStaleRequest()) return;
            hospitalData.value = response.data || [];
          },
        },
        {
          label: '病种汇总',
          run: async () => {
            const response = await DiseaseAPI.getTransferDetailDisease(params);
            if (isStaleRequest()) return;
            diseaseData.value = response.data || [];
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
        console.error(`加载${item.label}失败:`, item.result.reason);
      });

      if (failedTasks.length) {
        message.warning(`部分模块加载失败（${failedTasks.length}/${tasks.length}）`);
        return;
      }

      message.success('数据加载完成');
    } catch (error) {
      console.error('加载数据失败:', error);
      message.warning('使用模拟数据（API暂不可用）');
    } finally {
      if (requestId === latestLoadRequestId) {
        loading.value = false;
      }
    }
  };

  // Event handlers
  const handleSearch = async (params) => {
    Object.assign(filterParams, params);
    await loadAllData();
    message.success('筛选条件已应用');
  };

  const handleReset = async () => {
    filterParams.startMonth = dayjs(`${currentYear}-01`).format('YYYY-MM');
    filterParams.endMonth = dayjs(`${currentYear}-12`).format('YYYY-MM');
    filterParams.searchKeyword = '';
    filterParams.districtId = '';
    filterParams.town = '';
    filterParams.insuranceType = '';
    filterParams.hospitalLevel = '';
    filterParams.hospitalName = '';
    filterParams.diseaseType = '';
    await loadAllData();
    message.info('已重置筛选条件');
  };

  const handlePeriodChange = (period) => {
    selectedPeriod.value = period;
    message.info(`已切换到${period}数据`);
  };

  const handleDistrictSearch = (value) => {
    console.log('搜索区域:', value);
    const requestId = ++districtSearchRequestId;
    const params = getRequestParams();
    params.districtName = value;
    DistrictAPI.getTransferDetailDistrict(params)
      .then((response) => {
        if (requestId !== districtSearchRequestId) {
          return;
        }
        districtData.value = response.data || [];
      })
      .catch((error) => {
        console.error('搜索区域失败:', error);
      });
  };

  const handleHospitalSearch = (value) => {
    console.log('搜索医院:', value);
    const requestId = ++hospitalSearchRequestId;
    const params = getRequestParams();
    params.hospitalName = value;
    HospitalAPI.getTransferDetailHospital(params)
      .then((response) => {
        if (requestId !== hospitalSearchRequestId) {
          return;
        }
        hospitalData.value = response.data || [];
      })
      .catch((error) => {
        console.error('搜索医院失败:', error);
      });
  };

  const handleDiseaseSearch = (value) => {
    console.log('搜索病种:', value);
    const requestId = ++diseaseSearchRequestId;
    const params = getRequestParams();
    params.searchKeyword = value;
    DiseaseAPI.getTransferDetailDisease(params)
      .then((response) => {
        if (requestId !== diseaseSearchRequestId) {
          return;
        }
        diseaseData.value = response.data || [];
      })
      .catch((error) => {
        console.error('搜索病种失败:', error);
      });
  };

  const handleDrillDown = (params) => {
    currentDrillDownParams.value = params;
    detailsModalVisible.value = true;
  };

  // Watch for selectedPeriod changes
  watch(selectedPeriod, (newPeriod) => {
    console.log('时间段变化:', newPeriod);
    if (periodReloadTimer) {
      clearTimeout(periodReloadTimer);
    }
    periodReloadTimer = setTimeout(() => {
      loadAllData();
    }, 200);
  });

  onUnmounted(() => {
    if (periodReloadTimer) {
      clearTimeout(periodReloadTimer);
      periodReloadTimer = null;
    }
  });

  // Page load
  onMounted(async () => {
    await loadAllData();
  });
</script>

<style scoped>
  .filter-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .table-shadow {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  .btn-hover {
    @apply transition-all duration-200 hover:shadow-md hover:-translate-y-0.5;
  }
</style>
