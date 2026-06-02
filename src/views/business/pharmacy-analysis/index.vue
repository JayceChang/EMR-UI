<template>
  <div class="flex-1 font-inter text-dark min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
    <main class="container mx-auto px-4 py-6">
      <!-- 页面标题和筛选区 -->
      <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-bold text-dark">
            医保定点药店监管
          </h2>
          <p class="text-info text-sm mt-1">
            实时监控全市医保定点药店业务数据，异常行为智能预警
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <a-select
            v-model:value="selectedRegion"
            class="w-full md:w-40"
            placeholder="全部区域"
          >
            <a-select-option value="">全部区域</a-select-option>
            <a-select-option
              v-for="district in districtList"
              :key="district.code"
              :value="district.code"
            >
              {{ district.name }}
            </a-select-option>
          </a-select>
          <a-select
            v-model:value="selectedPeriod"
            class="w-full md:w-40"
            placeholder="本年度"
          >
            <a-select-option value="30">近30天</a-select-option>
            <a-select-option value="month">本月</a-select-option>
            <a-select-option value="lastMonth">上月</a-select-option>
            <a-select-option value="quarter">本季度</a-select-option>
            <a-select-option value="year">本年度</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch">
            <i class="fas fa-search mr-2"></i>
            查询
          </a-button>
        </div>
      </div>

      <!-- 关键指标卡片区域 -->
      <StatsCards :stats="statsData" />

      <!-- 图表区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- 月度趋势图 -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-card p-5">
          <div class="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h3 class="font-bold text-lg">
                药店业务月度趋势分析
              </h3>
            </div>
            <div class="flex space-x-2 mt-4 md:mt-0">
              <a-button
                :type="activeChart === 'outpatient' ? 'primary' : 'default'"
                size="small"
                @click="activeChart = 'outpatient'"
              >
                门诊人次
              </a-button>
              <a-button
                :type="activeChart === 'avgCost' ? 'primary' : 'default'"
                size="small"
                @click="activeChart = 'avgCost'"
              >
                次均费用
              </a-button>
              <a-button
                :type="activeChart === 'totalCost' ? 'primary' : 'default'"
                size="small"
                @click="activeChart = 'totalCost'"
              >
                总费用
              </a-button>
            </div>
          </div>
          <MonthlyTrendChart :data="monthlyTrendData" :active-chart="activeChart" />
        </div>

        <!-- 同比环比分析 -->
        <div class="bg-white rounded-xl shadow-card p-5">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="font-bold text-lg">
                核心指标同比环比
              </h3>
              <p class="text-info text-sm mt-1">
                与上期数据对比分析
              </p>
            </div>
            <a-button size="small" @click="handleRefresh">
              <i class="fas fa-sync-alt mr-1"></i>
              刷新
            </a-button>
          </div>
          <ComparisonChart :data="comparisonData" />
        </div>
      </div>

      <!-- 异常警示和TOP10区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 业务异常增加警示 -->
        <!-- <WarningList :warnings="warningList" @view-all="handleViewAllWarnings" /> -->

        <!-- 药店TOP10业务量 -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-card p-5">
          <div class="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h3 class="font-bold text-lg">
                药店业务量TOP10
              </h3>
              <p class="text-info text-sm mt-1">
                按门诊人次排序的药店业务量前十排名
              </p>
            </div>
            <div class="flex space-x-2 mt-4 md:mt-0">
              <a-select v-model:value="topSortBy" style="width: 150px">
                <a-select-option value="outpatient">门诊人次</a-select-option>
                <a-select-option value="totalCost">总费用</a-select-option>
                <a-select-option value="personalAccount">个人账户金额</a-select-option>
              </a-select>
            </div>
          </div>
          <TopPharmacies
            :data="topPharmacies"
            :sort-by="topSortBy"
            @view-detail="handleViewPharmacyDetail"
          />
        </div>
      </div>

      <!-- 药店业务明细查询 -->
      <PharmacyDetailTable
        :data="pharmacyDetailData"
        :loading="loading"
        :pagination="pagination"
        :district-list="districtList"
        :medical-type-list="medicalTypeList"
        @search="handleDetailSearch"
        @reset="handleDetailReset"
        @page-change="handlePageChange"
        @drill-down="handleTableDrillDown"
      />
    </main>
    <PharmacyDrillDownModal v-model:open="drillDownModalOpen" :context="drillDownContext" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';

// Components
import StatsCards from './components/StatsCards.vue';
import MonthlyTrendChart from './components/MonthlyTrendChart.vue';
import ComparisonChart from './components/ComparisonChart.vue';
import WarningList from './components/WarningList.vue';
import TopPharmacies from './components/TopPharmacies.vue';
import PharmacyDetailTable from './components/PharmacyDetailTable.vue';
import PharmacyDrillDownModal from './components/PharmacyDrillDownModal.vue';

// Import API
import { PharmacyAnalysisAPI, PharmacyTrendAPI, PharmacyComparisonAPI, PharmacyWarningAPI, PharmacyRankingAPI, PharmacyDetailAPI } from '/@/api/business/pharmacy-analysis/pharmacy-analysis-api';
import { AdministrativeDistrictAPI } from '/@/api/system/administrative-district-api';
import { MedicalTypeAPI } from '/@/api/system/medical-type-api';

// Import styles
import '/@/assets/css/all.min.css';

// Filter state
const selectedRegion = ref('');
const selectedPeriod = ref('year');
const activeChart = ref('outpatient');
const topSortBy = ref('outpatient');

// 行政区划数据
const districtList = ref([]);

// 医疗类别数据
const medicalTypeList = ref([]);

// Loading state
const loading = ref(false);
const drillDownModalOpen = ref(false);
const drillDownContext = ref({});

// Pagination
const pagination = ref({
  current: 1,
  pageSize: 5,
  total: 1256
});

// Statistics data
const statsData = ref([
  // {
  //   title: '门诊业务人次',
  //   value: 125896,
  //   yoy: 8.2,
  //   mom: -2.5,
  //   icon: 'fas fa-user-injured',
  //   color: '#165DFF',
  //   trend: 'success'
  // },
  // {
  //   title: '次均费用',
  //   value: 148.52,
  //   yoy: 5.7,
  //   mom: 1.8,
  //   icon: 'fas fa-coins',
  //   color: '#FF7D00',
  //   trend: 'danger',
  //   prefix: '¥'
  // },
  // {
  //   title: '个人账户总金额',
  //   value: 32589641.25,
  //   yoy: 12.3,
  //   mom: 3.1,
  //   icon: 'fas fa-wallet',
  //   color: '#0FC6C2',
  //   trend: 'success',
  //   prefix: '¥'
  // },
  // {
  //   title: '合计总费用',
  //   value: 18756324.89,
  //   yoy: 9.8,
  //   mom: -0.7,
  //   icon: 'fas fa-money-bill-wave',
  //   color: '#F53F3F',
  //   trend: 'success',
  //   prefix: '¥'
  // }
]);

// Monthly trend data
const monthlyTrendData = ref([
  // { month: '5月', outpatient: 8560, avgCost: 135, totalCost: 1250000 },
  // { month: '6月', outpatient: 9250, avgCost: 138, totalCost: 1350000 },
  // { month: '7月', outpatient: 8970, avgCost: 142, totalCost: 1320000 },
  // { month: '8月', outpatient: 9580, avgCost: 145, totalCost: 1420000 },
  // { month: '9月', outpatient: 10250, avgCost: 148, totalCost: 1520000 },
  // { month: '10月', outpatient: 11560, avgCost: 152, totalCost: 1750000 },
  // { month: '11月', outpatient: 10850, avgCost: 150, totalCost: 1680000 },
  // { month: '12月', outpatient: 11250, avgCost: 148, totalCost: 1720000 },
  // { month: '1月', outpatient: 9850, avgCost: 145, totalCost: 1520000 },
  // { month: '2月', outpatient: 8750, avgCost: 142, totalCost: 1350000 },
  // { month: '3月', outpatient: 9560, avgCost: 145, totalCost: 1480000 },
  // { month: '4月', outpatient: 10250, avgCost: 148, totalCost: 1580000 }
]);

// Comparison data
const comparisonData = ref([
  // { name: '门诊人次', yoy: 8.2, mom: -2.5 },
  // { name: '次均费用', yoy: 5.7, mom: 1.8 },
  // { name: '个人账户金额', yoy: 12.3, mom: 3.1 },
  // { name: '合计总费用', yoy: 9.8, mom: -0.7 }
]);

// Warning list
const warningList = ref([
  // {
  //   id: 1,
  //   name: '康泰大药房(解放路店)',
  //   message: '个人账户消费金额较昨日突增180%',
  //   level: 'danger',
  //   time: '今日 09:42',
  //   type: '紧急'
  // },
  // {
  //   id: 2,
  //   name: '同仁堂药店(北大街店)',
  //   message: '次均费用连续3天高于区域平均值30%',
  //   level: 'warning',
  //   time: '昨日 16:25',
  //   type: '警告'
  // },
  // {
  //   id: 3,
  //   name: '百姓大药房(红旗路店)',
  //   message: '同一社保卡单日消费次数达8次',
  //   level: 'warning',
  //   time: '昨日 14:10',
  //   type: '警告'
  // },
  // {
  //   id: 4,
  //   name: '华氏大药房(东风路店)',
  //   message: '处方药销售占比低于区域平均值',
  //   level: 'info',
  //   time: '2023-06-12',
  //   type: '提示'
  // }
]);

// Top pharmacies
const topPharmacies = ref([
  // {
  //   id: 1,
  //   name: '康泰大药房(总店)',
  //   region: '文峰区',
  //   outpatient: 12856,
  //   totalCost: 1874521.36,
  //   yoy: 12.5,
  //   image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/42fb921e4ffde419b71759a1d8b16b3b.png'
  // },
  // {
  //   id: 2,
  //   name: '同仁堂药店(北大街店)',
  //   region: '北关区',
  //   outpatient: 10523,
  //   totalCost: 1542876.90,
  //   yoy: 8.3,
  //   image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/d91cdf485ddc03bbc8af36d902085aa5.png'
  // },
  // {
  //   id: 3,
  //   name: '百姓大药房(红旗路店)',
  //   region: '文峰区',
  //   outpatient: 9756,
  //   totalCost: 1325698.45,
  //   yoy: -2.1,
  //   image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/bf36de7e9a9022cfddaac45bc73cc31b.png'
  // },
  // {
  //   id: 4,
  //   name: '华安药房(殷都店)',
  //   region: '殷都区',
  //   outpatient: 8952,
  //   totalCost: 1158742.63,
  //   yoy: 5.8,
  //   image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/0b353e508d2456312da38f6fa95f4966.png'
  // },
  // {
  //   id: 5,
  //   name: '民生医药连锁(文化宫店)',
  //   region: '北关区',
  //   outpatient: 7854,
  //   totalCost: 985471.23,
  //   yoy: 7.3,
  //   image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/11bcc40350862213ff8014055013eb0a.png'
  // }
]);

// Pharmacy detail data
const pharmacyDetailData = ref([
  // {
  //   id: 1,
  //   name: '康泰大药房(总店)',
  //   region: '文峰区',
  //   date: '2023-06-15',
  //   type: '普通门诊',
  //   outpatient: 125,
  //   totalCost: 18756.32,
  //   poolPayment: 5241.85,
  //   personalAccount: 13514.47
  // },
  // {
  //   id: 2,
  //   name: '同仁堂药店(北大街店)',
  //   region: '北关区',
  //   date: '2023-06-15',
  //   type: '慢性病门诊',
  //   outpatient: 98,
  //   totalCost: 25632.14,
  //   poolPayment: 18256.78,
  //   personalAccount: 7375.36
  // },
  // {
  //   id: 3,
  //   name: '百姓大药房(红旗路店)',
  //   region: '文峰区',
  //   date: '2023-06-15',
  //   type: '普通门诊',
  //   outpatient: 105,
  //   totalCost: 15247.89,
  //   poolPayment: 3258.41,
  //   personalAccount: 11989.48
  // },
  // {
  //   id: 4,
  //   name: '华安药房(殷都店)',
  //   region: '殷都区',
  //   date: '2023-06-14',
  //   type: '特殊疾病门诊',
  //   outpatient: 76,
  //   totalCost: 32569.74,
  //   poolPayment: 25874.12,
  //   personalAccount: 6695.62
  // },
  // {
  //   id: 5,
  //   name: '民生医药连锁(文化宫店)',
  //   region: '北关区',
  //   date: '2023-06-14',
  //   type: '普通门诊',
  //   outpatient: 92,
  //   totalCost: 12587.36,
  //   poolPayment: 2874.15,
  //   personalAccount: 9713.21
  // }
]);

// 获取行政区划列表（县区级别）
const fetchDistrictList = async () => {
  try {
    const response = await AdministrativeDistrictAPI.getDistrictList('2,3');
    if (response.data) {
      districtList.value = response.data;
    }
  } catch (error) {
    console.error('获取行政区划列表失败:', error);
  }
};

// 获取医疗类别列表（门诊类型）
const fetchMedicalTypeList = async () => {
  try {
    const response = await MedicalTypeAPI.getMedicalTypeList('1'); // 1: 门诊
    if (response.data) {
      medicalTypeList.value = response.data;
    }
  } catch (error) {
    console.error('获取医疗类别列表失败:', error);
  }
};

// Load all data
const loadAllData = async () => {
  try {
    loading.value = true;

    // Prepare filter params
    const filterParams = {
      region: selectedRegion.value,
      period: selectedPeriod.value
    };

    // Load statistics data
    try {
      const statsResponse = await PharmacyAnalysisAPI.getPharmacyStatistics(filterParams);
      if (statsResponse.data) {
        statsData.value = statsResponse.data;
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }

    // Load monthly trend data
    try {
      const trendResponse = await PharmacyTrendAPI.getMonthlyTrend(filterParams);
      if (trendResponse.data) {
        monthlyTrendData.value = trendResponse.data;
      }
    } catch (error) {
      console.error('加载趋势数据失败:', error);
    }

    // Load comparison data
    try {
      const comparisonResponse = await PharmacyComparisonAPI.getYearOverYearComparison(filterParams);
      if (comparisonResponse.data) {
        comparisonData.value = comparisonResponse.data;
      }
    } catch (error) {
      console.error('加载对比数据失败:', error);
    }

    // Load warning list
    // try {
    //   const warningResponse = await PharmacyWarningAPI.getWarningList(filterParams);
    //   if (warningResponse.data) {
    //     warningList.value = warningResponse.data;
    //   }
    // } catch (error) {
    //   console.error('加载警告数据失败:', error);
    // }

    // Load TOP pharmacies
    try {
      const rankingResponse = await PharmacyRankingAPI.getTop10Pharmacies({
        ...filterParams,
        sortBy: topSortBy.value
      });
      if (rankingResponse.data) {
        topPharmacies.value = rankingResponse.data;
      }
    } catch (error) {
      console.error('加载TOP药店数据失败:', error);
    }

    // Load pharmacy detail data
    try {
      const detailResponse = await PharmacyDetailAPI.getBusinessDetailWithPage(
        pagination.value.current,
        pagination.value.pageSize,
        filterParams
      );
      if (detailResponse.data) {
        pharmacyDetailData.value = detailResponse.data.list || detailResponse.data || [];
        pagination.value.total = detailResponse.data.total || pharmacyDetailData.value.length;
      }
    } catch (error) {
      console.error('加载药店明细数据失败:', error);
    }

    loading.value = false;
    message.success('数据加载成功');
  } catch (error) {
    console.error('加载数据失败:', error);
    loading.value = false;
    message.warning('使用模拟数据（API暂不可用）');
  }
};

// Event handlers
const handleSearch = async () => {
  await loadAllData();
};

const handleExport = async () => {
  try {
    message.info('正在导出数据...');
    // Here you would call the export API
    message.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    message.error('导出失败');
  }
};

const handleRefresh = async () => {
  await loadAllData();
  message.info('数据已刷新');
};

const handleViewAllWarnings = () => {
  message.info('查看全部异常记录');
};

const openPharmacyDrillDown = (context = {}) => {
  drillDownContext.value = {
    title: context.title || '药店患者明细下钻',
    source: context.source || 'unknown',
    pharmacyId: context.pharmacyId || '',
    pharmacyName: context.pharmacyName || '',
    region: context.region || selectedRegion.value,
    period: context.period || selectedPeriod.value,
    date: context.date || '',
    type: context.type || '',
    detailFilters: { ...detailSearchParams.value }
  };
  drillDownModalOpen.value = true;
};

const handleViewPharmacyDetail = (pharmacy) => {
  openPharmacyDrillDown({
    title: `药店下钻 - ${pharmacy?.name || '未知药店'}`,
    source: 'top',
    pharmacyId: pharmacy?.id || pharmacy?.pharmacyId || '',
    pharmacyName: pharmacy?.name || '',
    region: pharmacy?.region || selectedRegion.value
  });
};

// 保存明细表格的查询条件
const detailSearchParams = ref({});

// 加载药店明细数据（独立于其他数据加载）
const loadPharmacyDetailData = async (searchParams = {}) => {
  try {
    loading.value = true;

    // 处理日期格式化（DatePicker 返回的是 dayjs 对象，需要转换为字符串）
    const formattedDate = searchParams.date ? searchParams.date.format('YYYY-MM-DD') : '';

    const filterParams = {
      region: searchParams.region || selectedRegion.value,
      period: selectedPeriod.value,
      name: searchParams.name || '',
      date: formattedDate,
      type: searchParams.type || ''
    };

    const detailResponse = await PharmacyDetailAPI.getBusinessDetailWithPage(
      pagination.value.current,
      pagination.value.pageSize,
      filterParams
    );

    if (detailResponse.data) {
      pharmacyDetailData.value = detailResponse.data.list || detailResponse.data || [];
      pagination.value.total = detailResponse.data.total || pharmacyDetailData.value.length;
    }

    loading.value = false;
  } catch (error) {
    console.error('加载药店明细数据失败:', error);
    loading.value = false;
  }
};

const handleDetailSearch = async (params) => {
  // 保存查询条件
  detailSearchParams.value = params;
  // 重置到第一页
  pagination.value.current = 1;
  // 只加载明细表格数据
  await loadPharmacyDetailData(params);
};

const handleDetailReset = async () => {
  // 清空查询条件
  detailSearchParams.value = {};
  // 重置到第一页
  pagination.value.current = 1;
  // 只加载明细表格数据
  await loadPharmacyDetailData({});
};

const handlePageChange = async (page, pageSize) => {
  pagination.value.current = page;
  pagination.value.pageSize = pageSize;
  // 使用保存的查询条件进行分页查询
  await loadPharmacyDetailData(detailSearchParams.value);
};

const handleTableDrillDown = (record) => {
  openPharmacyDrillDown({
    title: `药店下钻 - ${record?.name || '未知药店'}`,
    source: 'table',
    pharmacyId: record?.id || record?.pharmacyId || '',
    pharmacyName: record?.name || '',
    region: record?.region || selectedRegion.value,
    date: record?.date || '',
    type: record?.type || ''
  });
};

// Watch for filter changes
watch([selectedRegion, selectedPeriod, topSortBy], async () => {
  await loadAllData();
});

// Page load
onMounted(async () => {
  await fetchDistrictList();
  await fetchMedicalTypeList();
  await loadAllData();
});
</script>

<style scoped>
</style>
