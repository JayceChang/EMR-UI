<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
    <main class="flex-grow mx-auto px-4 py-6 w-full">
      <div class="flex flex-1 lg:flex-row gap-6">
        <!-- 左侧筛选条件 -->
        <FilterPanel :loading="loading" :town-data="townData" @search="handleSearch" @reset="handleReset" />

        <!-- 右侧查询结果 -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <!-- 数据概览 -->
          <OverviewCards :data="overviewData" class="mb-6" />

          <!-- 趋势图表 -->
          <TrendChart :data="trendData" :period="chartPeriod" @period-change="handlePeriodChange" class="mb-6" />

          <!-- 区域汇总表格 -->
          <DistrictTable
            :data-source="districtData"
            :loading="loading"
            :pagination="districtPagination"
            @view-detail="handleViewDetail"
            @page-change="handleDistrictPageChange"
            @search="handleDistrictSearch"
          />

          <!-- 医疗机构汇总表格 -->
          <HospitalTable
            :data-source="hospitalData"
            :loading="loading"
            :pagination="hospitalPagination"
            @view-detail="handleViewDetail"
            @page-change="handleHospitalPageChange"
            @search="handleHospitalSearch"
          />

          <!-- 病种汇总表格 -->
          <DiseaseTable
            :data-source="diseaseData"
            :loading="loading"
            :pagination="diseasePagination"
            @view-detail="handleViewDetail"
            @page-change="handleDiseasePageChange"
            @search="handleDiseaseSearch"
          />
        </div>
      </div>
    </main>

    <!-- 住院明细数据模态框 -->
    <DetailModal
      v-model:visible="detailModalVisible"
      :detail-type="detailType"
      :detail-name="detailName"
      :detail-code="detailCode"
      @close="handleCloseModal"
    />
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';

  // Components
  import FilterPanel from './components/FilterPanel.vue';
  import OverviewCards from './components/OverviewCards.vue';
  import TrendChart from './components/TrendChart.vue';
  import DistrictTable from './components/DistrictTable.vue';
  import HospitalTable from './components/HospitalTable.vue';
  import DiseaseTable from './components/DiseaseTable.vue';
  import DetailModal from './components/DetailModal.vue';

  // API
  import {
    HospitalDetailAnalysisAPI,
    OverviewAPI,
    TrendChartAPI,
    DistrictAPI,
    HospitalAPI,
    DiseaseAPI,
  } from '/@/api/business/hospital-detail-analysis/hospital-detail-analysis-api';

  // Import styles
  import '/@/assets/css/all.min.css';

  // Reactive data
  const loading = ref(false);
  const detailModalVisible = ref(false);
  const detailType = ref('');
  const detailName = ref('');
  const detailCode = ref('');

  const chartPeriod = ref('month'); // 'day', 'week', 'month' (与后端SQL保持一致)

  const overviewData = ref(
  //   {
  //   totalAdmissions: 12589,
  //   avgCost: 5280,
  //   totalReimbursed: 10245,
  // }
);

  const startMonth = ref(null);
  const endMonth = ref(null);

  // Initialize date range
  const initDateRange = () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    startMonth.value = dayjs(`${currentYear}-01`).format('YYYY-MM');
    endMonth.value = dayjs(`${currentYear}-12`).format('YYYY-MM');
  };

  const trendData = ref(
  //   {
  //   months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  //   avgCost: [5200, 5350, 5420, 5580, 5720, 5850, 5920, 6050, 6180, 6320, 6450, 6580],
  //   reimbursementRate: [62.5, 63.2, 63.8, 64.5, 65.2, 65.8, 66.3, 66.8, 67.2, 67.5, 67.8, 68.2],
  //   admissions: [9200, 9500, 9800, 10200, 10500, 10800, 11200, 11500, 11800, 12200, 12500, 12800],
  // }
);

  const districtData = ref([]);
  const hospitalData = ref([]);
  const diseaseData = ref([]);

  const districtPagination = ref({
    current: 1,
    pageSize: 3,
    total: 12,
  });

  const hospitalPagination = ref({
    current: 1,
    pageSize: 3,
    total: 15,
  });

  const diseasePagination = ref({
    current: 1,
    pageSize: 3,
    total: 20,
  });

  // Filter params (字段名与后端DTO保持一致)
  const filterParams = ref({
    startDate: startMonth,
    endDate: endMonth,
    districtId: '',
    town: '',
    insuranceType: '',
    hospitalLevel: '',
    hospitalName: '',
    diseaseCode: '',
  });

  // Town data for district-town linkage
  const townData = ref(
  //   {
  //   anyang: ['全部乡镇', '文峰区', '北关区', '殷都区', '龙安区', '高新技术产业开发区'],
  //   linzhou: ['全部乡镇', '开元街道', '振林街道', '龙山街道', '桂园街道', '合涧镇', '原康镇'],
  //   tangyin: ['全部乡镇', '城关镇', '宜沟镇', '韩庄镇', '白营镇', '古贤镇', '菜园镇'],
  //   anyangxian: ['全部乡镇', '水冶镇', '铜冶镇', '善应镇', '柏庄镇', '蒋村镇', '吕村镇'],
  //   huaixian: ['全部乡镇', '道口镇', '城关镇', '白道口镇', '留固镇', '上官镇', '牛屯镇'],
  // }
);

  // Mock data
  const mockDistrictData = [
    // {
    //   id: 1,
    //   district: '安阳市区',
    //   districtType: '市辖区',
    //   admissions: 2356,
    //   admissionsYoy: 5.2,
    //   admissionsMom: null,
    //   avgCost: 6850,
    //   avgCostYoy: 3.8,
    //   avgCostMom: 1.2,
    //   avgReimbursement: 4280,
    //   reimbursementRate: 62.5,
    //   reimbursementRateYoy: 2.1,
    //   reimbursementRateMom: 0.8,
    //   admissionRate: 12.8,
    //   admissionRateYoy: 1.5,
    //   admissionRateMom: 0.3,
    //   transferRate: 8.3,
    //   transferRateYoy: 2.1,
    //   transferRateMom: 0.5,
    // },
    // {
    //   id: 2,
    //   district: '林州市',
    //   districtType: '县级市',
    //   admissions: 1842,
    //   admissionsYoy: 3.7,
    //   admissionsMom: null,
    //   avgCost: 5260,
    //   avgCostYoy: 2.4,
    //   avgCostMom: 0.5,
    //   avgReimbursement: 3520,
    //   reimbursementRate: 66.9,
    //   reimbursementRateYoy: 1.8,
    //   reimbursementRateMom: 0.4,
    //   admissionRate: 10.5,
    //   admissionRateYoy: 1.2,
    //   admissionRateMom: 0.1,
    //   transferRate: 6.7,
    //   transferRateYoy: -1.3,
    //   transferRateMom: -0.4,
    // },
    // {
    //   id: 3,
    //   district: '汤阴县',
    //   districtType: '县',
    //   admissions: 1254,
    //   admissionsYoy: -1.3,
    //   admissionsMom: null,
    //   avgCost: 4120,
    //   avgCostYoy: -2.1,
    //   avgCostMom: 0.8,
    //   avgReimbursement: 2980,
    //   reimbursementRate: 72.3,
    //   reimbursementRateYoy: 2.5,
    //   reimbursementRateMom: 0.6,
    //   admissionRate: 8.7,
    //   admissionRateYoy: -0.5,
    //   admissionRateMom: -0.2,
    //   transferRate: 12.5,
    //   transferRateYoy: 3.2,
    //   transferRateMom: 1.1,
    // },
  ];

  const mockHospitalData = [
    // {
    //   id: 1,
    //   hospitalName: '安阳市第一人民医院',
    //   level: '三级甲等',
    //   admissions: 1256,
    //   admissionsYoy: 5.2,
    //   admissionsMom: 1.2,
    //   avgCost: 7850,
    //   avgCostYoy: 3.8,
    //   avgCostMom: -1.2,
    //   reimbursementRate: 62.5,
    //   avgLengthOfStay: 8.2,
    // },
    // {
    //   id: 2,
    //   hospitalName: '安阳市第二人民医院',
    //   level: '二级甲等',
    //   admissions: 987,
    //   admissionsYoy: 4.3,
    //   admissionsMom: 0.8,
    //   avgCost: 6230,
    //   avgCostYoy: 2.5,
    //   avgCostMom: 0.5,
    //   reimbursementRate: 65.3,
    //   avgLengthOfStay: 7.5,
    // },
    // {
    //   id: 3,
    //   hospitalName: '安阳市中医院',
    //   level: '三级乙等',
    //   admissions: 753,
    //   admissionsYoy: 6.7,
    //   admissionsMom: 2.1,
    //   avgCost: 6980,
    //   avgCostYoy: 4.2,
    //   avgCostMom: 0.8,
    //   reimbursementRate: 63.8,
    //   avgLengthOfStay: 9.1,
    // },
  ];

  const mockDiseaseData = [
    // {
    //   id: 1,
    //   diseaseName: '高血压',
    //   diseaseCode: 'I10-I15',
    //   admissions: 1256,
    //   admissionsYoy: 8.2,
    //   admissionsMom: 2.3,
    //   avgCost: 5850,
    //   avgCostYoy: 4.5,
    //   avgCostMom: 0.8,
    //   avgReimbursement: 3820,
    //   reimbursementRate: 65.3,
    //   avgLengthOfStay: 6.5,
    // },
    // {
    //   id: 2,
    //   diseaseName: '糖尿病',
    //   diseaseCode: 'E10-E14',
    //   admissions: 987,
    //   admissionsYoy: 6.7,
    //   admissionsMom: 1.5,
    //   avgCost: 6230,
    //   avgCostYoy: 5.2,
    //   avgCostMom: 0.5,
    //   avgReimbursement: 4120,
    //   reimbursementRate: 66.1,
    //   avgLengthOfStay: 7.2,
    // },
    // {
    //   id: 3,
    //   diseaseName: '急性心肌梗死',
    //   diseaseCode: 'I21-I22',
    //   admissions: 453,
    //   admissionsYoy: 3.2,
    //   admissionsMom: -1.2,
    //   avgCost: 18750,
    //   avgCostYoy: 6.8,
    //   avgCostMom: 2.1,
    //   avgReimbursement: 12450,
    //   reimbursementRate: 66.4,
    //   avgLengthOfStay: 10.5,
    // },
  ];

  // Fetch all data
  const fetchData = async () => {
    try {

      // Fetch overview data
      const overviewResponse = await OverviewAPI.getOverview(filterParams.value);
      if (overviewResponse && overviewResponse.data) {
        overviewData.value = overviewResponse.data;
      }

      // Fetch trend data
      const trendResponse = await TrendChartAPI.getTrendData(filterParams.value, chartPeriod.value);
      if (trendResponse && trendResponse.data) {
        trendData.value = trendResponse.data;
      }

      // Fetch district data (with pagination)
      const districtParams = {
        ...filterParams.value,
        pageNum: districtPagination.value.current,
        pageSize: districtPagination.value.pageSize,
      };
      const districtResponse = await DistrictAPI.getDistrictStats(districtParams);
      if (districtResponse && districtResponse.data) {
        districtData.value = districtResponse.data.list || districtResponse.data || [];
        districtPagination.value.total = districtResponse.data.total || districtData.value.length;
      }

      // Fetch hospital data (with pagination)
      const hospitalParams = {
        ...filterParams.value,
        pageNum: hospitalPagination.value.current,
        pageSize: hospitalPagination.value.pageSize,
      };
      const hospitalResponse = await HospitalAPI.getHospitalStats(hospitalParams);
      if (hospitalResponse && hospitalResponse.data) {
        hospitalData.value = hospitalResponse.data.list || hospitalResponse.data || [];
        hospitalPagination.value.total = hospitalResponse.data.total || hospitalData.value.length;
      }

      // Fetch disease data (with pagination)
      const diseaseParams = {
        ...filterParams.value,
        pageNum: diseasePagination.value.current,
        pageSize: diseasePagination.value.pageSize,
      };
      const diseaseResponse = await DiseaseAPI.getDiseaseStats(diseaseParams);
      if (diseaseResponse && diseaseResponse.data) {
        diseaseData.value = diseaseResponse.data.list || diseaseResponse.data || [];
        diseasePagination.value.total = diseaseResponse.data.total || diseaseData.value.length;
      }

    } catch (error) {
      console.error('加载数据失败:', error);
      // Keep using mock data - already set as default values
      initData();
      message.warning('使用模拟数据(API暂不可用)');
    }
  };

  // Initialize data
  const initData = () => {
    districtData.value = mockDistrictData;
    hospitalData.value = mockHospitalData;
    diseaseData.value = mockDiseaseData;
  };

  // Event handlers
  const handleSearch = async (params) => {
    filterParams.value = { ...params };
    loading.value = true;

    await fetchData();
    loading.value = false;
  };

  const handleReset = async () => {
    filterParams.value = {
      startDate: startMonth.value,
      endDate: endMonth.value,
      districtId: '',
      town: '',
      insuranceType: '',
      hospitalLevel: '',
      hospitalName: '',
      diseaseCode: '',
    };
    await fetchData();
    message.info('已重置筛选条件');
  };

  const handlePeriodChange = async (period) => {
    chartPeriod.value = period;
    await fetchData();
    const periodText = period === 'day' ? '日度' : period === 'week' ? '周度' : '月度';
    message.info(`图表周期切换为:${periodText}`);
  };

  const handleViewDetail = (type, name, code) => {
    detailType.value = type;
    detailName.value = name;
    detailCode.value = code;
    detailModalVisible.value = true;
  };

  const handleCloseModal = () => {
    detailModalVisible.value = false;
    detailType.value = '';
    detailName.value = '';
    detailCode.value = '';
  };

  const handleDistrictPageChange = async (page) => {
    districtPagination.value.current = page;
    await fetchData();
  };

  const handleDistrictSearch = (keyword) => {
    console.log('区域搜索:', keyword);
  };

  const handleHospitalPageChange = async (page) => {
    hospitalPagination.value.current = page;
    await fetchData();
  };

  const handleHospitalSearch = (keyword) => {
    console.log('医疗机构搜索:', keyword);
  };

  const handleDiseasePageChange = async (page) => {
    diseasePagination.value.current = page;
    await fetchData();
  };

  const handleDiseaseSearch = (keyword) => {
    console.log('病种搜索:', keyword);
  };

  // Page load
  onMounted(() => {
    initDateRange();
    fetchData();
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
