<template>
  <div class="min-h-screen flex flex-col p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-lg rounded-xl p-6 mb-6 flex items-center justify-between">
      <h1 class="text-4xl font-extrabold text-gray-800 flex items-center">
        <i class="fas fa-hospital-user text-blue-600 mr-4"></i>
        职工住院数据分析总览
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
          <OverviewCards :data="overviewData" />
        </section>

        <!-- Medical Group Analysis -->
        <section class="bg-white shadow-lg rounded-xl p-6">
          <MedicalGroups :data="medicalGroupData" @drill-down="handleGroupDrillDown" />
        </section>
      </div>

      <!-- Right Column - District Analysis -->
      <div class="lg:col-span-1 space-y-6 flex-shrink">
        <!-- District Hospitalization Analysis -->
        <section class="bg-white shadow-lg rounded-xl p-6 h-full">
          <DistrictAnalysis
            :data="districtData"
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
            @page-change="handleInstitutionPageChange"
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
import { WorkerHospitalAnalysisAPI } from '/@/api/business/worker-hospital-analysis/worker-hospital-analysis-api.js';

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
      loadDistrictData()
    ]);
    // 单独加载医疗机构数据（带分页）
    await loadInstitutionData();
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

// Load overview data
const loadOverviewData = async () => {
  try {
    const response = await WorkerHospitalAnalysisAPI.getOverviewData({
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
      currentHospitalizations: 12500,
      yoyHospitalizations: 15.2,
      momHospitalizations: -3.5,
      avgCost: 3250.75,
      yoyAvgCost: 8.1,
      momAvgCost: 1.2,
      avgReimbursement: 2100.50,
      yoyAvgReimbursement: -0.8,
      momAvgReimbursement: 0.5,
      avgHospitalDays: 9.2,
      yoyAvgHospitalDays: -1.5,
      momAvgHospitalDays: 0.3,
      trendData: {
        months: ['1月', '2月', '3月', '4月', '5月'],
        hospitalizations: [10000, 11000, 10500, 12000, 12500],
        avgCost: [3000, 3100, 3050, 3200, 3250],
        avgReimbursement: [2000, 2050, 2020, 2080, 2100],
        avgHospitalDays: [9.5, 9.3, 9.4, 9.1, 9.2]
      }
    };
  }
};

// Load medical group data
const loadMedicalGroupData = async () => {
  try {
    const response = await WorkerHospitalAnalysisAPI.getMedicalGroupData({
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
        hospitalizations: 7800,
        hospitalizationsYOY: '+12.3%',
        avgCost: 3500.20,
        avgCostYOY: '-2.1%',
        totalCost: 27300000,
        totalCostYOY: '+9.8%',
        avgReimbursement: 2300.10,
        avgReimbursementYOY: '-1.5%'
      },
      zyy: {
        name: '安阳市中医院医疗集团',
        hospitalizations: 4700,
        hospitalizationsYOY: '+18.5%',
        avgCost: 2900.80,
        avgCostYOY: '+5.6%',
        totalCost: 13630000,
        totalCostYOY: '+25.0%',
        avgReimbursement: 1850.70,
        avgReimbursementYOY: '+3.2%'
      },
      zl: {
        name: '安阳肿瘤联盟',
        hospitalizations: 4300,
        hospitalizationsYOY: '+12.5%',
        avgCost: 2400.80,
        avgCostYOY: '+5.6%',
        totalCost: 13520000,
        totalCostYOY: '+25.0%',
        avgReimbursement: 1780.70,
        avgReimbursementYOY: '+3.5%'
      }
    };
  }
};

// Load district data
const loadDistrictData = async () => {
  try {
    const response = await WorkerHospitalAnalysisAPI.getDistrictData({
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
        hospitalizations: 4500,
        totalCost: 15000000,
        avgCost: 3333,
        yoyIncrease: 12.5
      },
      {
        name: '北关区',
        hospitalizations: 3000,
        totalCost: 9500000,
        avgCost: 3166,
        yoyIncrease: 10.2
      },
      {
        name: '殷都区',
        hospitalizations: 2500,
        totalCost: 8000000,
        avgCost: 3200,
        yoyIncrease: 8.9
      },
      {
        name: '龙安区',
        hospitalizations: 2000,
        totalCost: 6500000,
        avgCost: 3250,
        yoyIncrease: 15.0
      },
      {
        name: '安阳县',
        hospitalizations: 1800,
        totalCost: 5500000,
        avgCost: 3055,
        yoyIncrease: 7.8
      },
      {
        name: '汤阴县',
        hospitalizations: 1500,
        totalCost: 4800000,
        avgCost: 3200,
        yoyIncrease: 9.1
      },
      {
        name: '滑县',
        hospitalizations: 1200,
        totalCost: 3800000,
        avgCost: 3166,
        yoyIncrease: 11.3
      },
      {
        name: '内黄县',
        hospitalizations: 1000,
        totalCost: 3000000,
        avgCost: 3000,
        yoyIncrease: 6.5
      }
    ];
  }
};

// Load institution data
const loadInstitutionData = async (page = 1, pageSize = 10, filters = { group: 'all', level: 'all', district: 'all' }) => {
  try {
    const requestData = {
      startMonth: startMonth.value?.format('YYYY-MM'),
      endMonth: endMonth.value?.format('YYYY-MM'),
      pageNum: page,
      pageSize: pageSize
    };

    // 处理筛选条件
    if (filters.group && filters.group !== 'all') {
      requestData.group = filters.group;
    }
    if (filters.level && filters.level !== 'all') {
      requestData.level = filters.level;
    }
    if (filters.district && filters.district !== 'all') {
      requestData.district = filters.district;
    }

    const response = await WorkerHospitalAnalysisAPI.getInstitutionData(requestData);
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
          hospitalizations: 5000,
          avgCost: 3800,
          avgDays: 8.5,
          avgReimbursement: 2500,
          yoy: 10,
          mom: -2,
          trend: [100, 120, 110, 130, 125]
        },
        {
          name: '安阳市第二人民医院',
          group: 'rmyy',
          level: '二级',
          district: '北关区',
          hospitalizations: 1500,
          avgCost: 2800,
          avgDays: 7.0,
          avgReimbursement: 1800,
          yoy: 5,
          mom: 1,
          trend: [80, 85, 90, 88, 92]
        },
        {
          name: '安阳市第三人民医院',
          group: 'rmyy',
          level: '二级',
          district: '殷都区',
          hospitalizations: 1300,
          avgCost: 2900,
          avgDays: 7.2,
          avgReimbursement: 1900,
          yoy: 7,
          mom: -0.5,
          trend: [70, 75, 72, 78, 75]
        },
        {
          name: '安阳市中医院',
          group: 'zyy',
          level: '三级',
          district: '文峰区',
          hospitalizations: 3000,
          avgCost: 3100,
          avgDays: 9.0,
          avgReimbursement: 2000,
          yoy: 15,
          mom: 3,
          trend: [90, 95, 100, 105, 110]
        },
        {
          name: '安阳市骨科医院',
          group: 'zyy',
          level: '二级',
          district: '龙安区',
          hospitalizations: 1000,
          avgCost: 2700,
          avgDays: 6.5,
          avgReimbursement: 1700,
          yoy: 8,
          mom: -1,
          trend: [60, 62, 65, 63, 68]
        },
        {
          name: '安阳县人民医院',
          group: 'rmyy',
          level: '二级',
          district: '安阳县',
          hospitalizations: 800,
          avgCost: 2500,
          avgDays: 6.8,
          avgReimbursement: 1600,
          yoy: 6,
          mom: 0.5,
          trend: [50, 55, 52, 58, 56]
        },
        {
          name: '汤阴县人民医院',
          group: 'rmyy',
          level: '二级',
          district: '汤阴县',
          hospitalizations: 700,
          avgCost: 2600,
          avgDays: 6.9,
          avgReimbursement: 1650,
          yoy: 4,
          mom: -0.2,
          trend: [45, 48, 46, 50, 49]
        },
        {
          name: '滑县中医院',
          group: 'zyy',
          level: '二级',
          district: '滑县',
          hospitalizations: 600,
          avgCost: 2400,
          avgDays: 6.0,
          avgReimbursement: 1500,
          yoy: 9,
          mom: 1.5,
          trend: [40, 42, 45, 43, 46]
        },
        {
          name: '安阳市肿瘤医院',
          group: 'zl',
          level: '三级',
          district: '文峰区',
          hospitalizations: 5000,
          avgCost: 3800,
          avgDays: 8.5,
          avgReimbursement: 2500,
          yoy: 10,
          mom: -2,
          trend: [100, 120, 110, 130, 125]
        },
        {
          name: '林州市肿瘤医院',
          group: 'zl',
          level: '二级',
          district: '林州市',
          hospitalizations: 5000,
          avgCost: 3800,
          avgDays: 8.5,
          avgReimbursement: 2500,
          yoy: 10,
          mom: -2,
          trend: [100, 120, 110, 130, 125]
        },
        {
          name: '林州市食管癌医院',
          group: 'zl',
          level: '二级',
          district: '林州市',
          hospitalizations: 5000,
          avgCost: 3800,
          avgDays: 8.5,
          avgReimbursement: 2500,
          yoy: 10,
          mom: -2,
          trend: [100, 120, 110, 130, 125]
        }
      ],
      total: 11,
      pageNum: page,
      pageSize: pageSize
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
  insuranceType: 'worker',
});

const fetchInstitutionPageForDrill = (params) => {
  return WorkerHospitalAnalysisAPI.getInstitutionData(params);
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

const handleInstitutionFilter = (filters) => {
  console.log('筛选条件:', filters);
  // 重新加载数据时应用筛选条件
  loadInstitutionData(1, 10, filters);
};

// 处理分页变更
const handleInstitutionPageChange = (page, pageSize) => {
  console.log('分页变更:', page, pageSize);
  loadInstitutionData(page, pageSize);
};

// Watch date range changes
watch([startMonth, endMonth], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    console.log('日期范围变化:', newStart.format('YYYY-MM'), '—', newEnd.format('YYYY-MM'));
    // Reload data based on new date range
    loadAllData();
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
