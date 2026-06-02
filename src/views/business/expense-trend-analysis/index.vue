<template>
  <div class="min-h-screen flex flex-col p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-lg rounded-xl p-6 mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-800 flex items-center">
        <i class="fas fa-chart-line text-blue-600 mr-3"></i>
        医保费用趋势分析
      </h1>
      <div class="flex items-center space-x-4">
        <a-radio-group v-model:value="viewMode" button-style="solid">
          <a-radio-button value="month">月度分析</a-radio-button>
          <a-radio-button value="year">年度分析</a-radio-button>
        </a-radio-group>
        <a-range-picker
          v-if="viewMode === 'month'"
          v-model:value="monthRange"
          picker="month"
          format="YYYY-MM"
          :placeholder="['开始月份', '结束月份']"
        />
        <a-range-picker
          v-else
          v-model:value="yearRange"
          picker="year"
          format="YYYY"
          :placeholder="['开始年份', '结束年份']"
        />
      </div>
    </header>

    <!-- Main Content -->
    <a-spin :spinning="loading">
      <!-- Statistics Cards -->
      <StatsCards
        :total-expense="statsData.totalExpense"
        :employee-expense="statsData.employeeExpense"
        :resident-expense="statsData.residentExpense"
        :growth-rate="statsData.growthRate"
        :loading="loading"
      />

      <!-- Filter Panel -->
      <FilterPanel
        v-model:selected-district="selectedDistrict"
        v-model:selected-category="selectedCategory"
        :districts="districtList"
        :categories="categoryList"
        @apply="handleFilterApply"
      />

      <!-- Trend Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Monthly Trend Chart -->
        <MonthlyTrendChart
          v-if="viewMode === 'month'"
          :chart-data="monthlyTrendData"
          :loading="loading"
        />
        
        <!-- Yearly Trend Chart -->
        <YearlyTrendChart
          v-if="viewMode === 'year'"
          :chart-data="yearlyTrendData"
          :loading="loading"
        />

        <!-- Category Distribution -->
        <CategoryDistribution
          :chart-data="categoryData"
          :loading="loading"
        />
      </div>

      <!-- Expense Category Table -->
      <ExpenseCategoryTable
        :data-source="categoryTableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      />
    </a-spin>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

// Components
import StatsCards from './components/StatsCards.vue';
import FilterPanel from './components/FilterPanel.vue';
import MonthlyTrendChart from './components/MonthlyTrendChart.vue';
import YearlyTrendChart from './components/YearlyTrendChart.vue';
import CategoryDistribution from './components/CategoryDistribution.vue';
import ExpenseCategoryTable from './components/ExpenseCategoryTable.vue';

// Import styles
import '/@/assets/css/all.min.css';

// Import API
import { ExpenseTrendAPI } from '/@/api/business/expense-trend/expense-trend-api.js';

// View mode: month or year
const viewMode = ref('month');

// Date range
const monthRange = ref([dayjs().startOf('year'), dayjs()]);
const yearRange = ref([dayjs().subtract(5, 'year'), dayjs()]);

// Loading state
const loading = ref(false);

// Filter
const selectedDistrict = ref('');
const selectedCategory = ref('');
const districtList = ref([]);
const categoryList = ref([
  { value: '', label: '全部' },
  { value: 'hospital', label: '住院费用' },
  { value: 'outpatient', label: '门诊费用' },
  { value: 'drug', label: '药品费用' },
  { value: 'inspection', label: '检查费用' },
  { value: 'treatment', label: '治疗费用' }
]);

// Statistics data
const statsData = ref({
  totalExpense: 0,
  employeeExpense: 0,
  residentExpense: 0,
  growthRate: 0
});

// Chart data
const monthlyTrendData = ref({
  months: [],
  totalExpense: [],
  employeeExpense: [],
  residentExpense: []
});

const yearlyTrendData = ref({
  years: [],
  totalExpense: [],
  employeeExpense: [],
  residentExpense: []
});

const categoryData = ref([]);

// Table data
const categoryTableData = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

// Initialize
onMounted(() => {
  loadDistrictList();
  loadAllData();
});

// Load district list
const loadDistrictList = async () => {
  try {
    const response = await ExpenseTrendAPI.getDistrictList();
    if (response.data) {
      districtList.value = [
        { value: '', label: '全部区县' },
        ...response.data.map(d => ({ value: d.code, label: d.name }))
      ];
    }
  } catch (error) {
    console.error('加载区县列表失败:', error);
    // Mock data
    districtList.value = [
      { value: '', label: '全部区县' },
      { value: '410502', label: '文峰区' },
      { value: '410503', label: '北关区' },
      { value: '410505', label: '殷都区' },
      { value: '410506', label: '龙安区' },
      { value: '410522', label: '安阳县' },
      { value: '410523', label: '汤阴县' },
      { value: '410526', label: '滑县' },
      { value: '410527', label: '内黄县' },
      { value: '410581', label: '林州市' }
    ];
  }
};

// Load all data
const loadAllData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      loadStatsData(),
      loadTrendData(),
      loadCategoryData(),
      loadTableData()
    ]);
  } catch (error) {
    console.error('加载数据失败:', error);
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

// Load statistics data
const loadStatsData = async () => {
  try {
    const params = getRequestParams();
    const response = await ExpenseTrendAPI.getStatsData(params);
    if (response.data) {
      statsData.value = response.data;
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
    // Mock data
    statsData.value = {
      totalExpense: 125680000,
      employeeExpense: 75400000,
      residentExpense: 50280000,
      growthRate: 8.5
    };
  }
};

// Load trend data
const loadTrendData = async () => {
  try {
    const params = getRequestParams();
    const response = await ExpenseTrendAPI.getTrendData(params);
    if (response.data) {
      if (viewMode.value === 'month') {
        monthlyTrendData.value = response.data;
      } else {
        yearlyTrendData.value = response.data;
      }
    }
  } catch (error) {
    console.error('加载趋势数据失败:', error);
    // Mock data
    if (viewMode.value === 'month') {
      monthlyTrendData.value = {
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        totalExpense: [9500, 9800, 10200, 10500, 10800, 11000, 11200, 11500, 11800, 12000, 12300, 12500],
        employeeExpense: [5700, 5900, 6100, 6300, 6500, 6600, 6700, 6900, 7100, 7200, 7400, 7500],
        residentExpense: [3800, 3900, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000]
      };
    } else {
      yearlyTrendData.value = {
        years: ['2019', '2020', '2021', '2022', '2023', '2024'],
        totalExpense: [95000, 102000, 108000, 115000, 120000, 125680],
        employeeExpense: [57000, 61200, 64800, 69000, 72000, 75400],
        residentExpense: [38000, 40800, 43200, 46000, 48000, 50280]
      };
    }
  }
};

// Load category data
const loadCategoryData = async () => {
  try {
    const params = getRequestParams();
    const response = await ExpenseTrendAPI.getCategoryData(params);
    if (response.data) {
      categoryData.value = response.data;
    }
  } catch (error) {
    console.error('加载分类数据失败:', error);
    // Mock data
    categoryData.value = [
      { name: '住院费用', value: 65000000 },
      { name: '门诊费用', value: 25000000 },
      { name: '药品费用', value: 20000000 },
      { name: '检查费用', value: 10000000 },
      { name: '治疗费用', value: 5680000 }
    ];
  }
};

// Load table data
const loadTableData = async () => {
  try {
    const params = {
      ...getRequestParams(),
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    };
    const response = await ExpenseTrendAPI.getCategoryTableData(params);
    if (response.data) {
      categoryTableData.value = response.data.list || [];
      pagination.total = response.data.total || 0;
    }
  } catch (error) {
    console.error('加载表格数据失败:', error);
    // Mock data
    categoryTableData.value = [
      {
        category: '住院费用',
        totalAmount: 65000000,
        employeeAmount: 39000000,
        residentAmount: 26000000,
        growth: 8.5,
        ratio: 51.7
      },
      {
        category: '门诊费用',
        totalAmount: 25000000,
        employeeAmount: 15000000,
        residentAmount: 10000000,
        growth: 6.2,
        ratio: 19.9
      },
      {
        category: '药品费用',
        totalAmount: 20000000,
        employeeAmount: 12000000,
        residentAmount: 8000000,
        growth: 9.1,
        ratio: 15.9
      },
      {
        category: '检查费用',
        totalAmount: 10000000,
        employeeAmount: 6000000,
        residentAmount: 4000000,
        growth: 7.8,
        ratio: 8.0
      },
      {
        category: '治疗费用',
        totalAmount: 5680000,
        employeeAmount: 3400000,
        residentAmount: 2280000,
        growth: 10.2,
        ratio: 4.5
      }
    ];
    pagination.total = categoryTableData.value.length;
  }
};

// Get request params
const getRequestParams = () => {
  const params = {
    viewMode: viewMode.value,
    districtCode: selectedDistrict.value,
    category: selectedCategory.value
  };

  if (viewMode.value === 'month') {
    params.startMonth = monthRange.value?.[0]?.format('YYYY-MM');
    params.endMonth = monthRange.value?.[1]?.format('YYYY-MM');
  } else {
    params.startYear = yearRange.value?.[0]?.format('YYYY');
    params.endYear = yearRange.value?.[1]?.format('YYYY');
  }

  return params;
};

// Handle filter apply
const handleFilterApply = () => {
  loadAllData();
};

// Handle page change
const handlePageChange = ({ pageNum, pageSize }) => {
  pagination.current = pageNum;
  pagination.pageSize = pageSize;
  loadTableData();
};

// Watch view mode changes
watch(viewMode, () => {
  loadTrendData();
});

// Watch date range changes
watch([monthRange, yearRange], () => {
  loadAllData();
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