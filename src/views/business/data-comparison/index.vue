<template>
  <div class="p-6 space-y-6 bg-gray-50 min-h-screen">
    <!-- 头部：选择对比维度和对象 -->
    <header class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center space-x-4">
          <div class="bg-blue-600 p-2 rounded-lg">
            <i class="fas fa-balance-scale text-white text-xl"></i>
          </div>
          <h1 class="text-2xl font-bold text-gray-800 m-0">指标参数对比分析</h1>
        </div>
        
        <div class="flex flex-wrap items-center gap-4">
          <a-checkbox v-model:checked="enableHospitalCondition">增加医疗机构条件</a-checkbox>
          <a-checkbox v-model:checked="enableYearCondition">增加年度条件</a-checkbox>
          <a-button type="primary" @click="fetchComparisonData" :loading="loading">
            <template #icon><SearchOutlined /></template>
            开始对比
          </a-button>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-start">
        <!-- 对比对象 A -->
        <div class="space-y-3">
          <div class="text-gray-600 font-semibold">对比对象 A</div>
          <a-select
            v-model:value="entityA"
            class="w-full"
            placeholder="请选择县区"
            show-search
            :options="optionsForA"
            @change="(value) => handleDistrictChange('A', value)"
          />
          <a-select
            v-if="enableHospitalCondition"
            v-model:value="hospitalA"
            class="w-full"
            placeholder="请选择医疗机构"
            show-search
            option-filter-prop="label"
            :filter-option="filterSelectOption"
            :disabled="!entityA"
            :loading="hospitalLoadingA"
            :options="hospitalOptionsForA"
            @change="handleEntityChange"
          />
          <a-select
            v-if="enableYearCondition"
            v-model:value="yearA"
            class="w-full"
            placeholder="请选择年度"
            :options="yearOptions"
            @change="handleEntityChange"
          />
        </div>

        <!-- VS 图标 -->
        <div class="hidden md:flex items-center justify-center">
          <div class="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg border-4 border-white">
            VS
          </div>
        </div>

        <!-- 对比对象 B -->
        <div class="space-y-3">
          <div class="text-gray-600 font-semibold">对比对象 B</div>
          <a-select
            v-model:value="entityB"
            class="w-full"
            placeholder="请选择县区"
            show-search
            :options="optionsForB"
            @change="(value) => handleDistrictChange('B', value)"
          />
          <a-select
            v-if="enableHospitalCondition"
            v-model:value="hospitalB"
            class="w-full"
            placeholder="请选择医疗机构"
            show-search
            option-filter-prop="label"
            :filter-option="filterSelectOption"
            :disabled="!entityB"
            :loading="hospitalLoadingB"
            :options="hospitalOptionsForB"
            @change="handleEntityChange"
          />
          <a-select
            v-if="enableYearCondition"
            v-model:value="yearB"
            class="w-full"
            placeholder="请选择年度"
            :options="yearOptions"
            @change="handleEntityChange"
          />
        </div>
      </div>
    </header>

    <div v-if="loading" class="bg-white rounded-xl shadow-sm border border-gray-100 p-20 flex flex-col items-center justify-center text-gray-400">
      <a-spin size="large" />
      <p class="text-xl mt-6">正在生成对比结果，请稍候...</p>
    </div>

    <!-- 内容：对比结果展示 -->
    <main v-else-if="showResult" class="grid grid-cols-1 gap-6">
      <!-- 概览与可视化 -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 左侧分组指标卡片 -->
        <div class="lg:col-span-1 space-y-4">
          <ComparisonCard 
            v-for="group in indicatorGroups"
            :key="group.id"
            :title="group.title"
            :active="activeGroupId === group.id"
            :entity-a-name="getCardEntityName('A', group.id)"
            :entity-b-name="getCardEntityName('B', group.id)"
            :data="group.indicators"
            @click="activeGroupId = group.id"
          />
        </div>

        <!-- 右侧图表可视化 -->
        <div class="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold mb-4 flex items-center">
            <i class="fas fa-chart-bar text-blue-500 mr-2"></i>
            {{ activeGroupTitle }} - 可视化对比
          </h3>
          <div class="space-y-4">
            <div
              v-for="unitGroup in indicatorsByUnit"
              :key="unitGroup.unit"
              class="border border-gray-100 rounded-lg p-3"
            >
              <div class="text-xs text-gray-500 mb-2">单位：{{ unitGroup.unit }}</div>
              <div :ref="(el) => setChartRef(unitGroup.unit, el)" class="h-64"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细对比表格 -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold m-0">{{ activeGroupTitle }} - 详细对照表</h3>
        </div>
        <ComparisonTable 
          :entity-a-name="detailEntityAName"
          :entity-b-name="detailEntityBName"
          :data="activeGroupIndicators"
        />
      </section>
    </main>

    <!-- 未选择时的提示 -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-20 flex flex-col items-center justify-center text-gray-400">
      <i class="fas fa-balance-scale text-6xl mb-6 opacity-20"></i>
      <p class="text-xl">请选择对比维度及对象，点击“开始对比”查看分析结果</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import ComparisonCard from './components/ComparisonCard.vue';
import ComparisonTable from './components/ComparisonTable.vue';
import { AdministrativeDistrictAPI } from '/@/api/system/administrative-district-api';
import { medicalInstitutionApi } from '/@/api/system/medical-institution-api';
import { InsuranceAnalysisAPI } from '/@/api/business/insurance-analysis/insurance-analysis-api';
import { DistrictAPI as HospitalDetailDistrictAPI } from '/@/api/business/hospital-detail-analysis/hospital-detail-analysis-api';
import { CountySummaryAPI } from '/@/api/business/transfer-analysis/transfer-analysis-api';

// 状态
const entityA = ref(null);
const entityB = ref(null);
const hospitalA = ref(null);
const hospitalB = ref(null);
const yearA = ref(dayjs().year());
const yearB = ref(dayjs().year());
const enableHospitalCondition = ref(false);
const enableYearCondition = ref(false);
const loading = ref(false);
const showResult = ref(false);
const districtOptions = ref([]);
const hospitalOptionsA = ref([]);
const hospitalOptionsB = ref([]);
const hospitalLoadingA = ref(false);
const hospitalLoadingB = ref(false);
const chartRefs = ref({});
const chartInstances = new Map();

// 指标分组数据
const activeGroupId = ref('insurance');
const indicatorGroups = ref([]);

// 计算属性
const activeGroup = computed(() => indicatorGroups.value.find(g => g.id === activeGroupId.value));
const activeGroupTitle = computed(() => activeGroup.value?.title || '');
const activeGroupIndicators = computed(() => activeGroup.value?.indicators || []);
const indicatorsByUnit = computed(() => {
  const grouped = new Map();
  activeGroupIndicators.value.forEach((item) => {
    const key = item.unit || '数值';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });
  return Array.from(grouped.entries()).map(([unit, indicators]) => ({ unit, indicators }));
});

const entityAName = computed(() => {
  const option = districtOptions.value.find(o => o.value === entityA.value);
  return option ? option.label : '对象A';
});

const entityBName = computed(() => {
  const option = districtOptions.value.find(o => o.value === entityB.value);
  return option ? option.label : '对象B';
});

const hospitalAName = computed(() => {
  const option = hospitalOptionsA.value.find((o) => o.value === hospitalA.value);
  return option ? option.label : '';
});

const hospitalBName = computed(() => {
  const option = hospitalOptionsB.value.find((o) => o.value === hospitalB.value);
  return option ? option.label : '';
});

const getCardEntityName = (side, groupId) => {
  const districtName = side === 'A' ? entityAName.value : entityBName.value;
  const hospitalName = side === 'A' ? hospitalAName.value : hospitalBName.value;
  if (groupId !== 'insurance' && enableHospitalCondition.value && hospitalName) {
    return `${districtName} / ${hospitalName}`;
  }
  return districtName;
};

const detailEntityAName = computed(() => getCardEntityName('A', activeGroupId.value));
const detailEntityBName = computed(() => getCardEntityName('B', activeGroupId.value));

const yearOptions = computed(() => {
  const currentYear = dayjs().year();
  return Array.from({ length: 10 }, (_, i) => ({
    label: `${currentYear - i}年度`,
    value: currentYear - i,
  }));
});

const optionsForA = computed(() =>
  districtOptions.value.map((item) => ({
    ...item,
    disabled: entityB.value !== null && item.value === entityB.value,
  }))
);

const optionsForB = computed(() =>
  districtOptions.value.map((item) => ({
    ...item,
    disabled: entityA.value !== null && item.value === entityA.value,
  }))
);

const hospitalOptionsForA = computed(() =>
  hospitalOptionsA.value.map((item) => ({
    ...item,
    disabled:
      entityA.value === entityB.value &&
      hospitalB.value !== null &&
      item.value === hospitalB.value,
  }))
);

const hospitalOptionsForB = computed(() =>
  hospitalOptionsB.value.map((item) => ({
    ...item,
    disabled:
      entityA.value === entityB.value &&
      hospitalA.value !== null &&
      item.value === hospitalA.value,
  }))
);

const loadDistrictOptions = async () => {
  try {
    const res = await AdministrativeDistrictAPI.getDistrictList('3');
    districtOptions.value = (res?.data || []).map((d) => ({ label: d.name, value: d.code }));
  } catch (error) {
    message.error('加载县区列表失败，请稍后重试');
  }
};

const loadHospitalOptions = async (side, districtCode) => {
  if (!districtCode) return;
  const isA = side === 'A';
  const loadingRef = isA ? hospitalLoadingA : hospitalLoadingB;
  const optionsRef = isA ? hospitalOptionsA : hospitalOptionsB;
  try {
    loadingRef.value = true;
    const res = await medicalInstitutionApi.listHospitalByXzjgid(districtCode);
    optionsRef.value = (res?.data || []).map((h) => {
      const value = h.yyid ?? h.jgid ?? h.id ?? h.yiyuanId ?? h.value;
      const label = h.yymc ?? h.jgmc ?? h.gbmc ?? h.name ?? h.label ?? String(value ?? '');
      return { label, value };
    });
  } catch (error) {
    optionsRef.value = [];
    message.error('加载医疗机构列表失败，请稍后重试');
  } finally {
    loadingRef.value = false;
  }
};

const handleEntityChange = () => {
  showResult.value = false;
};

const handleDistrictChange = async (side, districtCode) => {
  handleEntityChange();
  if (side === 'A') {
    hospitalA.value = null;
    hospitalOptionsA.value = [];
  } else {
    hospitalB.value = null;
    hospitalOptionsB.value = [];
  }
  if (enableHospitalCondition.value && districtCode) {
    await loadHospitalOptions(side, districtCode);
  }
};

watch(enableHospitalCondition, async (enabled) => {
  handleEntityChange();
  if (!enabled) {
    hospitalA.value = null;
    hospitalB.value = null;
    hospitalOptionsA.value = [];
    hospitalOptionsB.value = [];
    return;
  }
  if (entityA.value) await loadHospitalOptions('A', entityA.value);
  if (entityB.value) await loadHospitalOptions('B', entityB.value);
});

watch(enableYearCondition, () => {
  handleEntityChange();
});

const handleChartResize = () => {
  chartInstances.forEach((chart) => chart.resize());
};

const filterSelectOption = (input, option) =>
  String(option?.label ?? '')
    .toLowerCase()
    .includes(String(input ?? '').trim().toLowerCase());

const parseNumberWithUnit = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const str = String(value).trim();
  if (!str || str === '--') return 0;

  const unitMultiplier = str.includes('亿') ? 1e8 : str.includes('万') ? 1e4 : 1;
  const cleaned = str
    .replace(/[,\s]/g, '')
    .replace(/[¥￥]/g, '')
    .replace(/[亿万元人次天%元]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num * unitMultiplier : 0;
};

const isAmountUnit = (unit) => unit === '元' || unit === '万元';

const buildIndicator = ({ key, name, unit, a, b, precision = 0 }) => {
  let aNum = Number.isFinite(a) ? a : parseNumberWithUnit(a);
  let bNum = Number.isFinite(b) ? b : parseNumberWithUnit(b);
  let normalizedUnit = unit;
  let normalizedPrecision = precision;

  if (isAmountUnit(unit)) {
    normalizedUnit = '万元';
    const factor = unit === '元' ? 10000 : 1;
    aNum = aNum / factor;
    bNum = bNum / factor;
    normalizedPrecision = 2;
  }

  const aRounded = Number(aNum.toFixed(normalizedPrecision));
  const bRounded = Number(bNum.toFixed(normalizedPrecision));
  const diff = Number((aRounded - bRounded).toFixed(normalizedPrecision));
  const pct = bRounded !== 0 ? Number((((aRounded - bRounded) / bRounded) * 100).toFixed(1)) : 0;

  return { key, name, unit: normalizedUnit, a: aRounded, b: bRounded, diff, pct };
};

const yearSelectionToMonthRange = () => {
  const currentYear = dayjs().year();
  const startYear = enableYearCondition.value ? Number(yearA.value) : currentYear;
  const endYear = enableYearCondition.value ? Number(yearB.value) : currentYear;
  const start = Math.min(startYear, endYear);
  const end = Math.max(startYear, endYear);
  return {
    startMonth: `${start}-01`,
    endMonth: `${end}-12`,
  };
};

const yearSelectionToDateRange = () => {
  const currentYear = dayjs().year();
  const startYear = enableYearCondition.value ? Number(yearA.value) : currentYear;
  const endYear = enableYearCondition.value ? Number(yearB.value) : currentYear;
  const start = Math.min(startYear, endYear);
  const end = Math.max(startYear, endYear);
  return {
    startDate: `${start}-01-01`,
    endDate: `${end}-12-31`,
  };
};

const findByNameLoose = (list, key, name) => {
  if (!Array.isArray(list) || !name) return null;
  const exact = list.find((item) => String(item?.[key] ?? '').trim() === String(name).trim());
  if (exact) return exact;
  return list.find((item) => String(item?.[key] ?? '').includes(String(name).trim())) || null;
};

const buildInpatientQueryParams = ({ startDate, endDate, side, districtName, districtCode }) => {
  const isA = side === 'A';
  const hospitalId = isA ? hospitalA.value : hospitalB.value;
  const hospitalName = isA ? hospitalAName.value : hospitalBName.value;
  const params = {
    startDate,
    endDate,
    districtId: districtCode,
    districtName,
    pageNum: 1,
    pageSize: 500,
  };
  if (enableHospitalCondition.value && hospitalId) {
    params.hospitalId = hospitalId;
  }
  if (enableHospitalCondition.value && hospitalName) {
    params.hospitalName = hospitalName;
  }
  return params;
};

const buildTransferQueryParams = ({ startMonth, endMonth, side, districtCode }) => {
  const hospitalName = side === 'A' ? hospitalAName.value : hospitalBName.value;
  const params = {
    startMonth,
    endMonth,
    regionCode: districtCode,
  };
  if (enableHospitalCondition.value && hospitalName) {
    params.institutionName = hospitalName;
  }
  return params;
};

// 获取对比数据
const fetchComparisonData = async () => {
  if (!entityA.value || !entityB.value) {
    message.warning('请选择完整的对比对象后再开始对比');
    return;
  }

  if (entityA.value === entityB.value) {
    message.warning('对比对象A和B不能相同');
    return;
  }

  if (enableHospitalCondition.value && (!hospitalA.value || !hospitalB.value)) {
    message.warning('已开启医疗机构条件，请选择对象A和对象B的医疗机构');
    return;
  }

  if (enableYearCondition.value && (!yearA.value || !yearB.value)) {
    message.warning('已开启年度条件，请选择对象A和对象B的年度');
    return;
  }

  loading.value = true;
  showResult.value = false;

  try {
    const { startMonth, endMonth } = yearSelectionToMonthRange();
    const { startDate, endDate } = yearSelectionToDateRange();
    const districtAName = entityAName.value;
    const districtBName = entityBName.value;
    const districtACode = entityA.value;
    const districtBCode = entityB.value;

    const inpatientParamsA = buildInpatientQueryParams({
      startDate,
      endDate,
      side: 'A',
      districtName: districtAName,
      districtCode: districtACode,
    });
    const inpatientParamsB = buildInpatientQueryParams({
      startDate,
      endDate,
      side: 'B',
      districtName: districtBName,
      districtCode: districtBCode,
    });
    const transferParamsA = buildTransferQueryParams({
      startMonth,
      endMonth,
      side: 'A',
      districtCode: districtACode,
    });
    const transferParamsB = buildTransferQueryParams({
      startMonth,
      endMonth,
      side: 'B',
      districtCode: districtBCode,
    });

    const [insuranceRes, inpatientResA, inpatientResB, transferCountyResA, transferCountyResB] = await Promise.all([
      InsuranceAnalysisAPI.getDistrictTableData({ startMonth, endMonth }),
      HospitalDetailDistrictAPI.getDistrictStats(inpatientParamsA),
      HospitalDetailDistrictAPI.getDistrictStats(inpatientParamsB),
      CountySummaryAPI.getCountyTransferSummary(transferParamsA),
      CountySummaryAPI.getCountyTransferSummary(transferParamsB),
    ]);

    const insuranceList = insuranceRes?.data || [];
    const inpatientListA = inpatientResA?.data?.list || inpatientResA?.data || [];
    const inpatientListB = inpatientResB?.data?.list || inpatientResB?.data || [];
    const transferCountyListA = transferCountyResA?.data || [];
    const transferCountyListB = transferCountyResB?.data || [];

    const insuranceA = findByNameLoose(insuranceList, 'name', districtAName);
    const insuranceB = findByNameLoose(insuranceList, 'name', districtBName);

    const inpatientA = findByNameLoose(inpatientListA, 'districtName', districtAName) || inpatientListA[0] || null;
    const inpatientB = findByNameLoose(inpatientListB, 'districtName', districtBName) || inpatientListB[0] || null;

    const transferA = findByNameLoose(transferCountyListA, 'county', districtAName) || transferCountyListA[0] || null;
    const transferB = findByNameLoose(transferCountyListB, 'county', districtBName) || transferCountyListB[0] || null;

    indicatorGroups.value = [
      {
        id: 'insurance',
        title: '参保指标',
        indicators: [
          buildIndicator({ key: 'insurance-0', name: '参保人数', unit: '人', a: insuranceA?.insured, b: insuranceB?.insured }),
          buildIndicator({ key: 'insurance-1', name: '征缴金额', unit: '元', a: insuranceA?.collection, b: insuranceB?.collection }),
        ],
      },
      {
        id: 'inpatient',
        title: '住院指标',
        indicators: [
          buildIndicator({ key: 'inpatient-0', name: '住院人次', unit: '人次', a: inpatientA?.admissions, b: inpatientB?.admissions }),
          buildIndicator({ key: 'inpatient-1', name: '次均费用', unit: '元', a: inpatientA?.avgCost, b: inpatientB?.avgCost, precision: 2 }),
          buildIndicator({ key: 'inpatient-2', name: '报销比例', unit: '%', a: inpatientA?.reimbursementRate, b: inpatientB?.reimbursementRate, precision: 2 }),
        ],
      },
      {
        id: 'transfer',
        title: '外转指标',
        indicators: [
          buildIndicator({ key: 'transfer-0', name: '外转人次', unit: '人次', a: transferA?.transfers, b: transferB?.transfers }),
          buildIndicator({ key: 'transfer-1', name: '外转总费用', unit: '元', a: transferA?.totalCost, b: transferB?.totalCost, precision: 2 }),
          buildIndicator({ key: 'transfer-2', name: '外转次均费用', unit: '元', a: transferA?.avgCost, b: transferB?.avgCost, precision: 2 }),
          buildIndicator({ key: 'transfer-3', name: '外转率', unit: '%', a: inpatientA?.transferRate, b: inpatientB?.transferRate, precision: 2 }),
        ],
      },
    ];
    activeGroupId.value = 'insurance';

    if (!insuranceA || !insuranceB) {
      message.warning('参保区县数据未完全匹配，已用0填充缺失项');
    }
    if (!inpatientA || !inpatientB) {
      message.warning('住院/外转率区县数据未完全匹配，已用0填充缺失项');
    }
    if (!transferA || !transferB) {
      message.warning('外转汇总区县数据未完全匹配，已用0填充缺失项');
    }

    showResult.value = true;
  } catch (error) {
    indicatorGroups.value = [];
    message.error('生成对比结果失败，请稍后重试');
  } finally {
    loading.value = false;
    if (showResult.value) {
      nextTick(() => initCharts());
    }
  }
};

const setChartRef = (unit, el) => {
  if (el) {
    chartRefs.value[unit] = el;
  } else {
    delete chartRefs.value[unit];
  }
};

const disposeCharts = () => {
  chartInstances.forEach((chart) => chart.dispose());
  chartInstances.clear();
};

const initCharts = () => {
  if (!activeGroupIndicators.value.length) return;
  disposeCharts();

  indicatorsByUnit.value.forEach((unitGroup) => {
    const chartEl = chartRefs.value[unitGroup.unit];
    if (!chartEl) return;

    const chart = echarts.init(chartEl);
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: [detailEntityAName.value, detailEntityBName.value], top: 8 },
      grid: { left: '4%', right: '4%', bottom: '6%', top: '18%', containLabel: true },
      xAxis: { type: 'category', data: unitGroup.indicators.map((i) => i.name) },
      yAxis: { type: 'value', name: unitGroup.unit },
      series: [
        {
          name: detailEntityAName.value,
          type: 'bar',
          data: unitGroup.indicators.map((i) => i.a),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#60a5fa' },
              { offset: 1, color: '#3b82f6' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: '28%',
        },
        {
          name: detailEntityBName.value,
          type: 'bar',
          data: unitGroup.indicators.map((i) => i.b),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#94a3b8' },
              { offset: 1, color: '#64748b' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: '28%',
        },
      ],
    };
    chart.setOption(option);
    chartInstances.set(unitGroup.unit, chart);
  });
};

// 监听分组变化更新图表
watch(activeGroupId, () => {
  nextTick(() => {
    initCharts();
  });
});

onMounted(() => {
  loadDistrictOptions();
  window.addEventListener('resize', handleChartResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleChartResize);
  disposeCharts();
});
</script>

<style scoped>
:deep(.ant-select-selector) {
  border-radius: 8px !important;
  height: 40px !important;
  display: flex;
  align-items: center;
}
</style>
