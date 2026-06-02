<template>
  <div class="min-h-screen flex flex-col p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-lg rounded-xl p-6 mb-6 flex items-center justify-between">
      <h1 class="text-4xl font-extrabold text-gray-800 flex items-center">
        <i class="fas fa-hospital-user text-blue-600 mr-4"></i>
        居民住院数据分析总览
      </h1>
      <div class="flex items-center space-x-4">
        <a-date-picker
          v-model:value="startMonth"
          picker="month"
          :placeholder="'开始月份'"
          class="w-full"
          :format="'YYYY-MM'"
        />
        <span class="text-gray-600 text-lg">—</span>
        <a-date-picker
          v-model:value="endMonth"
          picker="month"
          :placeholder="'结束月份'"
          class="w-full"
          :format="'YYYY-MM'"
        />
      </div>
    </header>

    <!-- Main Content Grid -->
    <main class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
      <!-- Left Column - Overview and Group Analysis -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Current Hospitalization Overview -->
        <section class="bg-white shadow-lg rounded-xl p-6">
          <OverviewCards :data="overviewData" title="全市居民住院人次概览" />
        </section>

        <!-- Medical Group Analysis -->
        <section class="bg-white shadow-lg rounded-xl p-6">
          <MedicalGroups :data="medicalGroupData" @drill-down="handleGroupDrillDown" />
        </section>
      </div>

      <!-- Right Column - District Analysis -->
      <div class="lg:col-span-1 space-y-6">
        <!-- District Hospitalization Analysis -->
        <section class="bg-white shadow-lg rounded-xl p-6" style="height: 967px;">
          <DistrictAnalysis
            :data="districtData"
            title="各县区居民住院数据"
            @drill-down="handleDistrictDrillDown"
          />
        </section>
      </div>

      <!-- Full Width - Medical Institutions -->
      <div class="lg:col-span-3 space-y-6">
        <section class="bg-white shadow-lg rounded-xl p-6">
          <InstitutionTable
            :data-source="institutionData"
            @drill-down="handleInstitutionDrillDown"
            @filter="handleInstitutionFilter"
            @page-change="handlePageChange"
          />
        </section>
      </div>
    </main>

    <HospitalPatientDrillModal
      v-model:open="drillDownModalOpen"
      :context="drillDownContext"
      :fetch-institution-page="fetchInstitutionPageForDrill"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import dayjs from 'dayjs';

// Components
import OverviewCards from './components/OverviewCards.vue';
import MedicalGroups from './components/MedicalGroups.vue';
import DistrictAnalysis from './components/DistrictAnalysis.vue';
import InstitutionTable from './components/InstitutionTable.vue';
import HospitalPatientDrillModal from '../components/HospitalPatientDrillModal.vue';

// Import styles
import '/@/assets/css/all.min.css';

// Import API
import { PeopleHospitalAnalysisAPI } from '/@/api/business/people-hospital-analysis/people-hospital-analysis-api.js';

// Reactive data
const startMonth = ref(null);
const endMonth = ref(null);

const overviewData = ref({});
const medicalGroupData = ref({});
const districtData = ref([]);
const institutionData = ref({
  list: [],
  total: 0,
  pageNum: 1,
  pageSize: 10
});
const drillDownModalOpen = ref(false);
const drillDownContext = ref({});

// 当前筛选条件
const currentFilters = ref({
  group: '',
  level: '',
  district: ''
});

// Initialize date range
const initDateRange = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const m = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;

  startMonth.value = dayjs(`${currentYear}-01`);
  endMonth.value = dayjs(`${currentYear}-${m}`);
};

// Load all data
const loadAllData = async () => {
  try {
    await Promise.all([
      loadOverviewData(),
      loadMedicalGroupData(),
      loadDistrictData(),
      loadInstitutionData()
    ]);
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

// Load overview data
const loadOverviewData = async () => {
  try {
    const response = await PeopleHospitalAnalysisAPI.getOverviewData({
      startMonth: startMonth.value?.format('YYYY-MM'),
      endMonth: endMonth.value?.format('YYYY-MM')
    });
    if (response.data) {
      overviewData.value = response.data;
    }
  } catch (error) {
    console.error('加载概览数据失败:', error);
    // 使用模拟数据作为降级
    overviewData.value = {
      currentHospitalizations: 15800,
      yoyHospitalizations: 18.5,
      momHospitalizations: -2.8,
      avgCost: 2850.50,
      yoyAvgCost: 6.8,
      momAvgCost: 0.9,
      avgReimbursement: 1850.30,
      yoyAvgReimbursement: -1.2,
      momAvgReimbursement: 0.3,
      avgHospitalDays: 8.5,
      yoyAvgHospitalDays: -2.1,
      momAvgHospitalDays: 0.2,
      trendData: {
        months: ['1月', '2月', '3月', '4月', '5月'],
        hospitalizations: [12000, 13200, 12800, 14500, 15800],
        avgCost: [2800, 2850, 2820, 2870, 2850],
        avgReimbursement: [1800, 1850, 1820, 1880, 1850],
        avgHospitalDays: [8.8, 8.6, 8.7, 8.4, 8.5]
      }
    };
  }
};

// Load medical group data
const loadMedicalGroupData = async () => {
  try {
    const response = await PeopleHospitalAnalysisAPI.getMedicalGroupData({
      startMonth: startMonth.value?.format('YYYY-MM'),
      endMonth: endMonth.value?.format('YYYY-MM')
    });
    if (response.data) {
      medicalGroupData.value = response.data;
    }
  } catch (error) {
    console.error('加载医疗集团数据失败:', error);
    // 使用模拟数据作为降级
    medicalGroupData.value = {
      rmyy: {
        name: '安阳市人民医院医疗集团',
        hospitalizations: 9800,
        hospitalizationsYOY: '+15.8%',
        avgCost: 3200.50,
        avgCostYOY: '-1.5%',
        totalCost: 31360000,
        totalCostYOY: '+12.5%',
        avgReimbursement: 2100.20,
        avgReimbursementYOY: '-0.8%'
      },
      zyy: {
        name: '安阳市中医院医疗集团',
        hospitalizations: 6200,
        hospitalizationsYOY: '+21.2%',
        avgCost: 2650.30,
        avgCostYOY: '+4.8%',
        totalCost: 16430000,
        totalCostYOY: '+27.0%',
        avgReimbursement: 1650.80,
        avgReimbursementYOY: '+2.5%'
      },
      zl: {
        name: '安阳肿瘤联盟',
        hospitalizations: 5500,
        hospitalizationsYOY: '+16.8%',
        avgCost: 2200.60,
        avgCostYOY: '+4.2%',
        totalCost: 12100000,
        totalCostYOY: '+22.0%',
        avgReimbursement: 1580.50,
        avgReimbursementYOY: '+2.8%'
      }
    };
  }
};

// Load district data
const loadDistrictData = async () => {
  try {
    const response = await PeopleHospitalAnalysisAPI.getDistrictData({
      startMonth: startMonth.value?.format('YYYY-MM'),
      endMonth: endMonth.value?.format('YYYY-MM')
    });
    if (response.data) {
      districtData.value = response.data;
    }
  } catch (error) {
    console.error('加载区县数据失败:', error);
    // 使用模拟数据作为降级
    districtData.value = [
      {
        name: '文峰区',
        hospitalizations: 5800,
        totalCost: 18500000,
        avgCost: 3190,
        yoyIncrease: 15.8
      },
      {
        name: '北关区',
        hospitalizations: 4200,
        totalCost: 12000000,
        avgCost: 2857,
        yoyIncrease: 12.5
      },
      {
        name: '殷都区',
        hospitalizations: 3600,
        totalCost: 10500000,
        avgCost: 2917,
        yoyIncrease: 11.2
      },
      {
        name: '龙安区',
        hospitalizations: 2800,
        totalCost: 8200000,
        avgCost: 2929,
        yoyIncrease: 17.3
      },
      {
        name: '安阳县',
        hospitalizations: 2500,
        totalCost: 7000000,
        avgCost: 2800,
        yoyIncrease: 9.5
      },
      {
        name: '汤阴县',
        hospitalizations: 2200,
        totalCost: 6200000,
        avgCost: 2818,
        yoyIncrease: 10.8
      },
      {
        name: '滑县',
        hospitalizations: 1800,
        totalCost: 5000000,
        avgCost: 2778,
        yoyIncrease: 13.6
      },
      {
        name: '内黄县',
        hospitalizations: 1500,
        totalCost: 4100000,
        avgCost: 2733,
        yoyIncrease: 8.2
      },
      {
        name: '林州市',
        hospitalizations: 2000,
        totalCost: 5600000,
        avgCost: 2800,
        yoyIncrease: 11.5
      }
    ];
  }
};

// Load institution data
const loadInstitutionData = async (pageNum = 1, pageSize = 10, filters = {}) => {
  try {
    const response = await PeopleHospitalAnalysisAPI.getInstitutionData({
      startMonth: startMonth.value?.format('YYYY-MM'),
      endMonth: endMonth.value?.format('YYYY-MM'),
      pageNum,
      pageSize,
      group: filters.group,
      level: filters.level,
      district: filters.district
    });
    if (response.data) {
      institutionData.value = response.data;
    }
  } catch (error) {
    console.error('加载医疗机构数据失败:', error);
    // 使用模拟数据作为降级
    institutionData.value = {
      list: [
      {
        name: '安阳市人民医院',
        group: 'rmyy',
        level: '三级',
        district: '文峰区',
        hospitalizations: 6200,
        avgCost: 3500,
        avgDays: 7.8,
        avgReimbursement: 2300,
        yoy: 12,
        mom: -1.5,
        trend: [110, 130, 120, 140, 135]
      },
      {
        name: '安阳市第二人民医院',
        group: 'rmyy',
        level: '二级',
        district: '北关区',
        hospitalizations: 2100,
        avgCost: 2600,
        avgDays: 6.5,
        avgReimbursement: 1650,
        yoy: 6,
        mom: 0.8,
        trend: [85, 90, 95, 92, 96]
      },
      {
        name: '安阳市第三人民医院',
        group: 'rmyy',
        level: '二级',
        district: '殷都区',
        hospitalizations: 1500,
        avgCost: 2700,
        avgDays: 6.8,
        avgReimbursement: 1750,
        yoy: 8,
        mom: -0.3,
        trend: [75, 80, 77, 83, 80]
      },
      {
        name: '安阳市中医院',
        group: 'zyy',
        level: '三级',
        district: '文峰区',
        hospitalizations: 4000,
        avgCost: 2900,
        avgDays: 8.2,
        avgReimbursement: 1850,
        yoy: 18,
        mom: 2.5,
        trend: [95, 100, 105, 110, 115]
      },
      {
        name: '安阳市骨科医院',
        group: 'zyy',
        level: '二级',
        district: '龙安区',
        hospitalizations: 1300,
        avgCost: 2500,
        avgDays: 6.0,
        avgReimbursement: 1550,
        yoy: 9,
        mom: -0.8,
        trend: [65, 67, 70, 68, 73]
      },
      {
        name: '安阳县人民医院',
        group: 'rmyy',
        level: '二级',
        district: '安阳县',
        hospitalizations: 1000,
        avgCost: 2300,
        avgDays: 6.2,
        avgReimbursement: 1450,
        yoy: 7,
        mom: 0.3,
        trend: [55, 60, 57, 63, 61]
      },
      {
        name: '汤阴县人民医院',
        group: 'rmyy',
        level: '二级',
        district: '汤阴县',
        hospitalizations: 900,
        avgCost: 2400,
        avgDays: 6.3,
        avgReimbursement: 1500,
        yoy: 5,
        mom: -0.1,
        trend: [50, 53, 51, 55, 54]
      },
      {
        name: '滑县中医院',
        group: 'zyy',
        level: '二级',
        district: '滑县',
        hospitalizations: 800,
        avgCost: 2200,
        avgDays: 5.8,
        avgReimbursement: 1350,
        yoy: 10,
        mom: 1.2,
        trend: [45, 47, 50, 48, 51]
      },
      {
        name: '安阳市肿瘤医院',
        group: 'zl',
        level: '三级',
        district: '文峰区',
        hospitalizations: 6200,
        avgCost: 3500,
        avgDays: 7.8,
        avgReimbursement: 2300,
        yoy: 12,
        mom: -1.5,
        trend: [110, 130, 120, 140, 135]
      },
      {
        name: '林州市肿瘤医院',
        group: 'zl',
        level: '二级',
        district: '林州市',
        hospitalizations: 1500,
        avgCost: 3000,
        avgDays: 7.5,
        avgReimbursement: 2000,
        yoy: 11,
        mom: -1.2,
        trend: [90, 100, 95, 105, 102]
      },
      {
        name: '林州市食管癌医院',
        group: 'zl',
        level: '二级',
        district: '林州市',
        hospitalizations: 1200,
        avgCost: 2800,
        avgDays: 7.2,
        avgReimbursement: 1900,
        yoy: 10,
        mom: -0.8,
        trend: [80, 85, 82, 88, 86]
      }
    ],
      total: 11,
      pageNum: 1,
      pageSize: 10
    };
  }
};

const GROUP_NAME_MAP = {
  rmyy: '安阳市人民医院医疗集团',
  zyy: '安阳市中医院医疗集团',
  zl: '安阳肿瘤联盟',
};

const buildDrillDownBaseContext = () => ({
  startMonth: startMonth.value?.format('YYYY-MM'),
  endMonth: endMonth.value?.format('YYYY-MM'),
  insuranceType: 'resident',
});

const fetchInstitutionPageForDrill = (params) => {
  return PeopleHospitalAnalysisAPI.getInstitutionData(params);
};

// Event handlers
const handleGroupDrillDown = async (groupName) => {
  drillDownContext.value = {
    ...buildDrillDownBaseContext(),
    sourceType: 'group',
    groupCode: groupName,
    groupName: GROUP_NAME_MAP[groupName] || groupName,
    title: `住院下钻 - ${GROUP_NAME_MAP[groupName] || groupName}`,
  };
  drillDownModalOpen.value = true;
};

const handleDistrictDrillDown = async (districtName) => {
  drillDownContext.value = {
    ...buildDrillDownBaseContext(),
    sourceType: 'district',
    districtName,
    title: `住院下钻 - ${districtName}`,
  };
  drillDownModalOpen.value = true;
};

const handleInstitutionDrillDown = async (institutionName) => {
  drillDownContext.value = {
    ...buildDrillDownBaseContext(),
    sourceType: 'institution',
    institutionName,
    title: `住院下钻 - ${institutionName}`,
  };
  drillDownModalOpen.value = true;
};

const handleInstitutionFilter = async (filters) => {
  console.log('筛选条件:', filters);
  // 处理筛选值：将 'all' 转换为空字符串
  const filterParams = {
    group: filters.group === 'all' ? '' : filters.group,
    level: filters.level === 'all' ? '' : filters.level,
    district: filters.district === 'all' ? '' : filters.district
  };
  // 保存当前筛选条件
  currentFilters.value = filterParams;
  // 重新加载数据时应用筛选条件,重置到第1页
  await loadInstitutionData(1, institutionData.value.pageSize, filterParams);
};

// 分页变更处理
const handlePageChange = async (page, pageSize) => {
  // 分页变更时使用当前的筛选条件
  await loadInstitutionData(page, pageSize, currentFilters.value);
};

// Watch date range changes
watch([startMonth, endMonth], async ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    console.log('日期范围变化:', newStart.format('YYYY-MM'), '—', newEnd.format('YYYY-MM'));
    // Reload data based on new date range
    await loadAllData();
  }
});

// Page load
onMounted(async () => {
  initDateRange();
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
