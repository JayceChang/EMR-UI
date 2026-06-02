<template>
  <div class="min-h-screen flex flex-col p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- 页面头部 -->
    <header class="bg-white shadow-lg rounded-xl p-6 flex items-center justify-between">
      <h1 class="text-3xl font-extrabold text-gray-800 flex items-center">
        <i class="fas fa-chart-line text-blue-600 mr-3"></i>
        安阳市医保监管平台 - 门诊数据分析
      </h1>
      <div class="flex items-center space-x-4">
        <a-date-picker v-model:value="startMonth" picker="month" class="w-full" placeholder="开始月份" />
        <span class="text-gray-600">—</span>
        <a-date-picker v-model:value="endMonth" picker="month" class="w-full" placeholder="结束月份" />
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
      <!-- 左列 - 概览和趋势 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 全市门诊患者就诊情况 -->
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-users-medical mr-3 text-blue-500"></i>
            全市门诊患者就诊情况
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-blue-50 p-4 rounded-lg flex items-center justify-between shadow-sm">
              <div>
                <p class="text-gray-600 text-lg">
                  就诊人次
                  <a-tooltip>
                    <template #title>当前年度门诊总人次</template>
                    <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                  </a-tooltip>
                </p>
                <p class="text-4xl font-bold text-blue-700 mt-1">{{ (overviewStats.visits ?? 0).toLocaleString() }}</p>
              </div>
              <i class="fas fa-user-injured text-blue-400 text-5xl opacity-50"></i>
            </div>
            <div :class="[monthlyTrendStyle.bgClass, 'p-4 rounded-lg flex items-center justify-between shadow-sm']">
              <div>
                <p class="text-gray-600 text-lg">
                  月度趋势
                  <a-tooltip>
                    <template #title>月度趋势 =（当月门诊总人次 - 上月门诊总人次） / 上月门诊总人次 × 100%</template>
                    <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                  </a-tooltip>
                </p>
                <p :class="['text-2xl font-semibold mt-1', monthlyTrendStyle.textClass]">
                  {{ monthlyTrendStyle.label }}
                  <i :class="[monthlyTrendStyle.iconClass, 'ml-2']"></i>
                  <span v-if="totalStats.visitsMom !== null && totalStats.visitsMom !== undefined" class="text-lg ml-1"
                    >{{ Math.abs(totalStats.visitsMom) }}%</span
                  >
                </p>
              </div>
              <i :class="[monthlyTrendStyle.bgIconClass, 'text-5xl opacity-50']"></i>
            </div>
          </div>
          <MonthlyTrendChart :data="monthlyTrendData" />
        </section>

        <!-- 全市门诊数据总览 -->
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-chart-pie mr-3 text-purple-500"></i>
            全市门诊数据总览
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-purple-50 p-4 rounded-lg shadow-sm">
              <p class="text-gray-600 text-sm">
                门诊人次数
                <a-tooltip>
                  <template #title>当前年度门诊总人次</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
              </p>
              <p class="text-2xl font-bold text-purple-700 mt-1">{{ (totalStats.visits ?? 0).toLocaleString() }}</p>
              <div class="flex items-center text-sm mt-2">
                <span class="mr-2 inline-flex items-center" :class="trendClass(totalStats.visitsYoy)">
                  <i v-if="hasTrendArrow(totalStats.visitsYoy)" class="fas" :class="trendArrowIcon(totalStats.visitsYoy)"></i>
                  <span class="ml-1">{{ formatTrendPercent(totalStats.visitsYoy) }}%</span>
                </span>
                <span class="inline-flex items-center" :class="trendClass(totalStats.visitsMom)">
                  <i v-if="hasTrendArrow(totalStats.visitsMom)" class="fas" :class="trendArrowIcon(totalStats.visitsMom)"></i>
                  <span class="ml-1">{{ formatTrendPercent(totalStats.visitsMom) }}%</span>
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">同比 / 环比</p>
            </div>
            <div class="bg-red-50 p-4 rounded-lg shadow-sm">
              <p class="text-gray-600 text-sm">
                总费用 (万元)
                <a-tooltip>
                  <template #title>当前年度门诊总费用</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
              </p>
              <p class="text-2xl font-bold text-red-700 mt-1">{{ totalStats.totalCost ?? 0 }}</p>
              <div class="flex items-center text-sm mt-2">
                <span class="mr-2 inline-flex items-center" :class="trendClass(totalStats.totalCostYoy)">
                  <i v-if="hasTrendArrow(totalStats.totalCostYoy)" class="fas" :class="trendArrowIcon(totalStats.totalCostYoy)"></i>
                  <span class="ml-1">{{ formatTrendPercent(totalStats.totalCostYoy) }}%</span>
                </span>
                <span class="inline-flex items-center" :class="trendClass(totalStats.totalCostMom)">
                  <i v-if="hasTrendArrow(totalStats.totalCostMom)" class="fas" :class="trendArrowIcon(totalStats.totalCostMom)"></i>
                  <span class="ml-1">{{ formatTrendPercent(totalStats.totalCostMom) }}%</span>
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">同比 / 环比</p>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg shadow-sm">
              <p class="text-gray-600 text-sm">
                次均费用 (元)
                <a-tooltip>
                  <template #title>次均费用 = 当前年度门诊总费用 / 当前年度门诊总人次</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
              </p>
              <p class="text-2xl font-bold text-yellow-700 mt-1">{{ totalStats.avgCost ?? 0 }}</p>
              <div class="flex items-center text-sm mt-2">
                <span class="mr-2 inline-flex items-center" :class="trendClass(totalStats.avgCostYoy)">
                  <i v-if="hasTrendArrow(totalStats.avgCostYoy)" class="fas" :class="trendArrowIcon(totalStats.avgCostYoy)"></i>
                  <span class="ml-1">{{ formatTrendPercent(totalStats.avgCostYoy) }}%</span>
                </span>
                <span class="inline-flex items-center" :class="trendClass(totalStats.avgCostMom)">
                  <i v-if="hasTrendArrow(totalStats.avgCostMom)" class="fas" :class="trendArrowIcon(totalStats.avgCostMom)"></i>
                  <span class="ml-1">{{ formatTrendPercent(totalStats.avgCostMom) }}%</span>
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">同比 / 环比</p>
            </div>

            <div class="bg-teal-50 p-4 rounded-lg shadow-sm">
              <p class="text-gray-600 text-sm">
                次均统筹报销 (元)
                <a-tooltip>
                  <template #title>次均统筹报销费用 = 当前年度门诊统筹报销总费用 / 当前年度门诊总人次</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
              </p>
              <p class="text-2xl font-bold text-teal-700 mt-1">{{ totalStats.avgReimbursement ?? 0 }}</p>
              <div class="flex items-center text-sm mt-2">
                <span class="mr-2 inline-flex items-center" :class="trendClass(totalStats.avgReimbursementYoy)">
                  <i v-if="hasTrendArrow(totalStats.avgReimbursementYoy)" class="fas" :class="trendArrowIcon(totalStats.avgReimbursementYoy)"></i>
                  <span class="ml-1">{{ formatTrendPercent(totalStats.avgReimbursementYoy) }}%</span>
                </span>
                <span class="inline-flex items-center" :class="trendClass(totalStats.avgReimbursementMom)">
                  <i v-if="hasTrendArrow(totalStats.avgReimbursementMom)" class="fas" :class="trendArrowIcon(totalStats.avgReimbursementMom)"></i>
                  <span class="ml-1">{{ formatTrendPercent(totalStats.avgReimbursementMom) }}%</span>
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">同比 / 环比</p>
            </div>
          </div>
        </section>

        <!-- 医疗集团门诊数据分析 -->
        <MedicalGroupAnalysis
          :start-month="startMonth ? startMonth.format('YYYY-MM') : ''"
          :end-month="endMonth ? endMonth.format('YYYY-MM') : ''"
          @show-details="handleShowGroupDetails"
        />
      </div>

      <!-- 右列 - 区县和机构分析 -->
      <div class="lg:col-span-1 space-y-6">
        <!-- 各县区门诊数据统计 -->
        <section class="bg-white p-8 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-map-marked-alt mr-3 text-cyan-500"></i>
            各县区门诊数据统计
          </h2>
          <CountyTable :data="countyData" @drill-down="handleDrillDownCounty" />
        </section>

        <!-- 各医疗机构门诊数据 -->
        <section class="bg-white p-5 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-hospital-alt mr-3 text-indigo-500"></i>
            各医疗机构门诊数据
          </h2>
          <InstitutionTable
            :start-month="startMonth ? startMonth.format('YYYY-MM') : ''"
            :end-month="endMonth ? endMonth.format('YYYY-MM') : ''"
            @filter-change="handleFilterChange"
            @drill-down="handleDrillDownInstitution"
          />
        </section>
      </div>
    </main>

    <!-- 门诊病种分析 -->
    <section class="p-6 bg-white rounded-lg">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
        <i class="fas fa-viruses mr-3 text-red-500"></i>
        门诊病种分析 (全市排名前十)
      </h2>
      <DiseaseAnalysisTable :data="diseaseData" />
    </section>

    <ClinicDrillDownModal v-model:open="drillDownModalOpen" :context="drillDownContext" />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import dayjs from 'dayjs';
  import { message } from 'ant-design-vue';

  // Components
  import MonthlyTrendChart from './components/MonthlyTrendChart.vue';
  import MedicalGroupAnalysis from './components/MedicalGroupAnalysis.vue';
  import CountyTable from './components/CountyTable.vue';
  import InstitutionTable from './components/InstitutionTable.vue';
  import DiseaseAnalysisTable from './components/DiseaseAnalysisTable.vue';
  import ClinicDrillDownModal from './components/ClinicDrillDownModal.vue';

  // API
  import { ClinicAnalysisAPI, CountyAPI, DiseaseAnalysisAPI } from '/@/api/business/clinic-analysis/clinic-analysis-api';

  // Date range
  const startMonth = ref(dayjs().startOf('year'));
  const endMonth = ref(dayjs());
  const drillDownModalOpen = ref(false);
  const drillDownContext = ref({});
  const institutionFilters = ref({
    level: '',
    division: '',
  });

  // Overview statistics
  const overviewStats = ref({
    visits: 0,
    visitsYoy: null,
    visitsMom: null,
  });

  // 月度趋势样式计算属性（使用totalStats中的visitsMom）
  const monthlyTrendStyle = computed(() => {
    const mom = totalStats.value.visitsMom;
    if (mom === null || mom === undefined || mom === 0) {
      return {
        label: '基本持平',
        bgClass: 'bg-gray-50',
        textClass: 'text-gray-700',
        iconClass: 'fas fa-minus text-gray-500',
        bgIconClass: 'fas fa-chart-line text-gray-400',
      };
    } else if (mom > 0) {
      return {
        label: '稳步增长',
        bgClass: 'bg-red-50',
        textClass: 'text-red-700',
        iconClass: 'fas fa-arrow-up text-red-500',
        bgIconClass: 'fas fa-chart-line text-red-400',
      };
    } else {
      return {
        label: '有所下降',
        bgClass: 'bg-green-50',
        textClass: 'text-green-700',
        iconClass: 'fas fa-arrow-down text-green-500',
        bgIconClass: 'fas fa-chart-line text-green-400',
      };
    }
  });

  const trendClass = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num) || Math.abs(num) < 0.005) {
      return '';
    }
    return num > 0 ? 'text-red-500' : 'text-green-500';
  };

  const hasTrendArrow = (value) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) && Math.abs(num) >= 0.005;
  };

  const trendArrowIcon = (value) => {
    const num = Number(value ?? 0);
    return num > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  };

  const formatTrendPercent = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) {
      return '0';
    }
    return Math.abs(num);
  };

  // Total statistics
  const totalStats = ref({
    // visits: 123456,
    // visitsYoy: 5.2,
    // visitsMom: 1.8,
    // avgCost: 150.23,
    // avgCostYoy: 1.5,
    // avgCostMom: 0.8,
    // totalCost: 1854.7,
    // totalCostYoy: 4.9,
    // totalCostMom: 2.1,
    // avgReimbursement: 85.60,
    // avgReimbursementYoy: 6.1,
    // avgReimbursementMom: 3.5
  });

  // Monthly trend data
  const monthlyTrendData = ref([
    // { month: '1月', value: 10000 },
    // { month: '2月', value: 12000 },
    // { month: '3月', value: 11500 },
    // { month: '4月', value: 13000 },
    // { month: '5月', value: 14500 },
    // { month: '6月', value: 13800 },
    // { month: '7月', value: 15000 },
    // { month: '8月', value: 16000 },
    // { month: '9月', value: 15500 },
    // { month: '10月', value: 17000 },
    // { month: '11月', value: 18000 },
    // { month: '12月', value: 17500 }
  ]);

  // County data
  const countyData = ref([
    // { name: '文峰区', visits: '35,000', totalCost: '525.0', totalReimbursement: '297.5', avgCost: '150.00', avgReimbursement: '85.00', yoyGrowth: '↑ 6.5%' },
    // { name: '北关区', visits: '28,000', totalCost: '420.0', totalReimbursement: '238.0', avgCost: '150.00', avgReimbursement: '85.00', yoyGrowth: '↑ 5.8%' },
    // { name: '殷都区', visits: '22,000', totalCost: '330.0', totalReimbursement: '187.0', avgCost: '150.00', avgReimbursement: '85.00', yoyGrowth: '↑ 7.2%' },
    // { name: '龙安区', visits: '18,000', totalCost: '270.0', totalReimbursement: '153.0', avgCost: '150.00', avgReimbursement: '85.00', yoyGrowth: '↑ 4.9%' },
    // { name: '安阳县', visits: '20,456', totalCost: '306.8', totalReimbursement: '173.8', avgCost: '150.00', avgReimbursement: '85.00', yoyGrowth: '↑ 6.1%' },
    // { name: '林州市', visits: '15,000', totalCost: '225.0', totalReimbursement: '127.5', avgCost: '150.00', avgReimbursement: '85.00', yoyGrowth: '↑ 5.5%' },
    // { name: '滑县', visits: '12,000', totalCost: '180.0', totalReimbursement: '102.0', avgCost: '150.00', avgReimbursement: '85.00', yoyGrowth: '↑ 6.0%' },
    // { name: '汤阴县', visits: '10,000', totalCost: '150.0', totalReimbursement: '85.0', avgCost: '150.00', avgReimbursement: '85.00', yoyGrowth: '↑ 5.3%' },
    // { name: '内黄县', visits: '8,000', totalCost: '120.0', totalReimbursement: '68.0', avgCost: '150.00', avgReimbursement: '85.00', yoyGrowth: '↑ 6.8%' }
  ]);

  // Disease data
  const diseaseData = ref([
    // { icd10: 'J00-J99 呼吸系统疾病', visits: '15,200', avgCost: '120.50', reimbursement: '65.30', yoy: '↑ 8.2%', mom: '↑ 1.5%' },
    // { icd10: 'I00-I99 循环系统疾病', visits: '12,800', avgCost: '180.20', reimbursement: '95.80', yoy: '↑ 7.5%', mom: '↑ 1.2%' },
    // { icd10: 'K00-K93 消化系统疾病', visits: '10,500', avgCost: '110.00', reimbursement: '58.00', yoy: '↑ 9.0%', mom: '↑ 1.8%' },
    // { icd10: 'M00-M99 肌肉骨骼系统和结缔组织疾病', visits: '9,800', avgCost: '135.70', reimbursement: '72.50', yoy: '↑ 6.8%', mom: '↑ 1.0%' },
    // { icd10: 'N00-N99 泌尿生殖系统疾病', visits: '8,500', avgCost: '145.00', reimbursement: '78.00', yoy: '↑ 7.0%', mom: '↑ 1.3%' },
    // { icd10: 'E00-E90 内分泌、营养和代谢疾病', visits: '7,200', avgCost: '160.80', reimbursement: '85.00', yoy: '↑ 8.5%', mom: '↑ 1.6%' },
    // { icd10: 'G00-G99 神经系统疾病', visits: '6,500', avgCost: '170.00', reimbursement: '90.00', yoy: '↑ 6.5%', mom: '↑ 0.9%' },
    // { icd10: 'H00-H59 眼和附件疾病', visits: '5,800', avgCost: '95.00', reimbursement: '50.00', yoy: '↑ 9.5%', mom: '↑ 2.0%' },
    // { icd10: 'H60-H95 耳和乳突疾病', visits: '5,100', avgCost: '105.00', reimbursement: '55.00', yoy: '↑ 8.8%', mom: '↑ 1.7%' },
    // { icd10: 'L00-L99 皮肤和皮下组织疾病', visits: '4,500', avgCost: '88.00', reimbursement: '48.00', yoy: '↑ 7.8%', mom: '↑ 1.1%' }
  ]);

  // Fetch all data
  const fetchData = async () => {
    try {
      // Fetch overview statistics
      const overviewResponse = await ClinicAnalysisAPI.getOverview(startMonth.value.format('YYYY-MM'), endMonth.value.format('YYYY-MM'));
      if (overviewResponse && overviewResponse.data) {
        overviewStats.value = overviewResponse.data;
      }

      // Fetch total statistics
      const totalResponse = await ClinicAnalysisAPI.getTotalStats(startMonth.value.format('YYYY-MM'), endMonth.value.format('YYYY-MM'));
      if (totalResponse && totalResponse.data) {
        totalStats.value = totalResponse.data;
      }

      // Fetch monthly trend data
      const trendResponse = await ClinicAnalysisAPI.getMonthlyTrend(startMonth.value.format('YYYY-MM'), endMonth.value.format('YYYY-MM'));
      if (trendResponse && trendResponse.data) {
        monthlyTrendData.value = trendResponse.data;
      }

      // Fetch county data
      const countyResponse = await CountyAPI.getCountyStats(startMonth.value.format('YYYY-MM'), endMonth.value.format('YYYY-MM'));
      if (countyResponse && countyResponse.data) {
        countyData.value = countyResponse.data;
      }

      // Fetch disease data
      const diseaseResponse = await DiseaseAnalysisAPI.getTopDiseases(startMonth.value.format('YYYY-MM'), endMonth.value.format('YYYY-MM'));
      if (diseaseResponse && diseaseResponse.data) {
        diseaseData.value = diseaseResponse.data;
      }

      message.success('数据加载成功');
    } catch (error) {
      console.error('加载数据失败:', error);
      // Keep using mock data - already set as default values
      //message.warning('使用模拟数据（API暂不可用）');
    }
  };

  // Event handlers
  const handleShowGroupDetails = (groupName) => {
    message.info(`查看 ${groupName} 所辖医疗机构数据`);
  };

  const getMonthValue = (value) => (value ? value.format('YYYY-MM') : '');

  const openClinicDrillDown = (context = {}) => {
    const countyName = context.mode === 'row' ? context.countyName || '' : '';
    const institutionName = context.mode === 'row' ? context.institutionName || '' : '';
    const sourceText = context.source === 'institution' ? '医疗机构' : '区县';
    const scopeText = institutionName || countyName || '全部';

    drillDownContext.value = {
      title: `门诊下钻 - ${sourceText}-${scopeText}`,
      source: context.source || 'unknown',
      mode: context.mode || 'all',
      startMonth: getMonthValue(startMonth.value),
      endMonth: getMonthValue(endMonth.value),
      countyName,
      institutionName,
      level: context.level || institutionFilters.value.level,
      division: context.division || institutionFilters.value.division,
    };
    drillDownModalOpen.value = true;
  };

  const handleDrillDownCounty = (payload) => {
    if (typeof payload === 'string') {
      openClinicDrillDown({
        source: 'county',
        mode: payload === '全部区县' ? 'all' : 'row',
        countyName: payload === '全部区县' ? '' : payload,
      });
      return;
    }
    openClinicDrillDown({
      source: 'county',
      mode: payload?.mode || 'all',
      countyName: payload?.countyName || '',
    });
  };

  const handleDrillDownInstitution = (payload) => {
    if (typeof payload === 'string') {
      openClinicDrillDown({
        source: 'institution',
        mode: payload === '全部医疗机构' ? 'all' : 'row',
        institutionName: payload === '全部医疗机构' ? '' : payload,
        level: institutionFilters.value.level,
        division: institutionFilters.value.division,
      });
      return;
    }
    openClinicDrillDown({
      source: 'institution',
      mode: payload?.mode || 'all',
      institutionName: payload?.institutionName || '',
      level: payload?.level,
      division: payload?.division,
    });
  };

  const handleFilterChange = ({ level, division }) => {
    institutionFilters.value = {
      level: level || '',
      division: division || '',
    };
    console.log('筛选条件变化:', { level, division });
  };

  // Watch for date range changes
  watch([startMonth, endMonth], async ([newStart, newEnd]) => {
    if (newStart && newEnd) {
      console.log('日期范围变化:', newStart.format('YYYY-MM'), '—', newEnd.format('YYYY-MM'));
      await fetchData();
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
