<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <main class="mx-auto px-4 py-6" style="width: 100%">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 左侧筛选条件 -->
        <div class="w-72">
          <FilterPanel
            :start-month="startMonth"
            :end-month="endMonth"
            @query="handleQuery"
            @reset="handleReset"
            @filter-change="handleFilterChange"
          />
        </div>

        <!-- 右侧查询结果 -->
        <div class="flex-1 flex flex-col gap-6 overflow-hidden">
          <!-- 数据概览卡片 -->
          <OverviewCards :data="overviewData" />

          <!-- 住院费用趋势图表 -->
          <TrendChart :data="trendData" @period-change="handlePeriodChange" />

          <!-- 住院数据按区域汇总 -->
          <AreaSummaryTable
            :data="areaSummaryData"
            :loading="areaLoading"
            @row-click="handleAreaRowClick"
            @drill-down="handleDrillDown"
          />

          <!-- 住院数据按医疗机构汇总 -->
          <HospitalSummaryTable
            :data="hospitalSummaryData"
            :loading="hospitalLoading"
            @row-click="handleHospitalRowClick"
            @drill-down="handleDrillDown"
          />

          <!-- 住院数据按病种汇总 -->
          <DiseaseSummaryTable
            :data="diseaseSummaryData"
            :loading="diseaseLoading"
            @row-click="handleDiseaseRowClick"
            @drill-down="handleDrillDown"
          />
        </div>
      </div>
    </main>

    <!-- 住院明细数据模态框 -->
    <DetailModal
      v-model:open="detailModalVisible"
      :drill-down-type="drillDownType"
      :drill-down-params="drillDownParams"
      :data="detailData"
      :loading="detailLoading"
      @close="handleDetailModalClose"
      @search="handleDetailSearch"
      @page-change="handleDetailPageChange"
    />

    <!-- 加载中状态 -->
    <a-spin :spinning="globalLoading" tip="数据加载中...">
      <template #indicator>
        <LoadingOutlined style="font-size: 24px" spin />
      </template>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { LoadingOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';

// 组件
import FilterPanel from './components/FilterPanel.vue';
import OverviewCards from './components/OverviewCards.vue';
import TrendChart from './components/TrendChart.vue';
import AreaSummaryTable from './components/AreaSummaryTable.vue';
import HospitalSummaryTable from './components/HospitalSummaryTable.vue';
import DiseaseSummaryTable from './components/DiseaseSummaryTable.vue';
import DetailModal from './components/DetailModal.vue';

// API (后续需要创建)
// import { HospitalAnalysisAPI } from '/@/api/business/hospital-analysis/hospital-analysis-api';

// 日期范围
const startMonth = ref(dayjs().startOf('year'));
const endMonth = ref(dayjs());

// 加载状态
const globalLoading = ref(false);
const areaLoading = ref(false);
const hospitalLoading = ref(false);
const diseaseLoading = ref(false);
const detailLoading = ref(false);

// 数据概览
const overviewData = ref({
  totalAdmissions: 12589,
  avgCost: 5280,
  reimbursedCases: 10245
});

// 趋势图表数据
const trendData = ref({
  months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  avgCost: [5200, 5350, 5420, 5580, 5720, 5850, 5920, 6050, 6180, 6320, 6450, 6580],
  reimbursementRate: [62.5, 63.2, 63.8, 64.5, 65.2, 65.8, 66.3, 66.8, 67.2, 67.5, 67.8, 68.2],
  admissions: [9200, 9500, 9800, 10200, 10500, 10800, 11200, 11500, 11800, 12200, 12500, 12800]
});

// 区域汇总数据
const areaSummaryData = ref([
  {
    district: '安阳市区',
    districtType: '市辖区',
    admissionCount: 2356,
    admissionYoy: 5.2,
    avgCost: 6850,
    avgCostYoy: 3.8,
    avgCostMom: -1.2,
    avgReimbursement: 4280,
    reimbursementRate: 62.5,
    reimbursementRateYoy: 2.1,
    reimbursementRateMom: 0.8,
    admissionRate: 12.8,
    admissionRateYoy: 1.5,
    admissionRateMom: -0.3,
    transferRate: 8.3,
    transferRateYoy: 2.1,
    transferRateMom: 0.5
  },
  {
    district: '林州市',
    districtType: '县级市',
    admissionCount: 1842,
    admissionYoy: 3.7,
    avgCost: 5260,
    avgCostYoy: 2.4,
    avgCostMom: -0.5,
    avgReimbursement: 3520,
    reimbursementRate: 66.9,
    reimbursementRateYoy: 1.8,
    reimbursementRateMom: 0.4,
    admissionRate: 10.5,
    admissionRateYoy: 1.2,
    admissionRateMom: 0.1,
    transferRate: 6.7,
    transferRateYoy: -1.3,
    transferRateMom: -0.4
  },
  {
    district: '汤阴县',
    districtType: '县',
    admissionCount: 1254,
    admissionYoy: -1.3,
    avgCost: 4120,
    avgCostYoy: -2.1,
    avgCostMom: -0.8,
    avgReimbursement: 2980,
    reimbursementRate: 72.3,
    reimbursementRateYoy: 2.5,
    reimbursementRateMom: 0.6,
    admissionRate: 8.7,
    admissionRateYoy: -0.5,
    admissionRateMom: -0.2,
    transferRate: 12.5,
    transferRateYoy: 3.2,
    transferRateMom: 1.1
  }
]);

// 医疗机构汇总数据
const hospitalSummaryData = ref([
  {
    hospitalName: '安阳市第一人民医院',
    hospitalLevel: '三级甲等',
    admissionCount: 1256,
    admissionYoy: 5.2,
    admissionMom: 1.2,
    avgCost: 7850,
    avgCostYoy: 3.8,
    avgCostMom: -1.2,
    reimbursementRate: 62.5,
    avgLengthOfStay: 8.2
  },
  {
    hospitalName: '安阳市第二人民医院',
    hospitalLevel: '二级甲等',
    admissionCount: 987,
    admissionYoy: 4.3,
    admissionMom: -0.8,
    avgCost: 6230,
    avgCostYoy: 2.5,
    avgCostMom: -0.5,
    reimbursementRate: 65.3,
    avgLengthOfStay: 7.5
  },
  {
    hospitalName: '安阳市中医院',
    hospitalLevel: '三级乙等',
    admissionCount: 753,
    admissionYoy: 6.7,
    admissionMom: 2.1,
    avgCost: 6980,
    avgCostYoy: 4.2,
    avgCostMom: 0.8,
    reimbursementRate: 63.8,
    avgLengthOfStay: 9.1
  }
]);

// 病种汇总数据
const diseaseSummaryData = ref([
  {
    diseaseName: '高血压',
    diseaseCode: 'I10-I15',
    admissionCount: 1256,
    admissionYoy: 8.2,
    admissionMom: 2.3,
    avgCost: 5850,
    avgCostYoy: 4.5,
    avgCostMom: -0.8,
    avgReimbursement: 3820,
    reimbursementRate: 65.3,
    avgLengthOfStay: 6.5
  },
  {
    diseaseName: '糖尿病',
    diseaseCode: 'E10-E14',
    admissionCount: 987,
    admissionYoy: 6.7,
    admissionMom: 1.5,
    avgCost: 6230,
    avgCostYoy: 5.2,
    avgCostMom: 0.5,
    avgReimbursement: 4120,
    reimbursementRate: 66.1,
    avgLengthOfStay: 7.2
  },
  {
    diseaseName: '急性心肌梗死',
    diseaseCode: 'I21-I22',
    admissionCount: 453,
    admissionYoy: 3.2,
    admissionMom: -1.2,
    avgCost: 18750,
    avgCostYoy: 6.8,
    avgCostMom: 2.1,
    avgReimbursement: 12450,
    reimbursementRate: 66.4,
    avgLengthOfStay: 10.5
  }
]);

// 住院明细数据
const detailData = ref([
  {
    insuranceUnit: '文峰区社区',
    name: '张**',
    idCard: '4105********1234',
    hospital: '安阳市第一人民医院',
    admissionDate: '2023-12-01',
    dischargeDate: '2023-12-08',
    totalCost: 8560,
    reimbursement: 5620,
    hospitalDays: 7,
    diagnosisCode: 'I10',
    diagnosisName: '高血压'
  },
  {
    insuranceUnit: '北关区社区',
    name: '李**',
    idCard: '4105********5678',
    hospital: '安阳市第一人民医院',
    admissionDate: '2023-12-02',
    dischargeDate: '2023-12-09',
    totalCost: 7240,
    reimbursement: 4820,
    hospitalDays: 7,
    diagnosisCode: 'E11',
    diagnosisName: '2型糖尿病'
  },
  {
    insuranceUnit: '殷都区社区',
    name: '王**',
    idCard: '4105********9012',
    hospital: '安阳市第二人民医院',
    admissionDate: '2023-12-03',
    dischargeDate: '2023-12-10',
    totalCost: 9120,
    reimbursement: 6050,
    hospitalDays: 8,
    diagnosisCode: 'I21',
    diagnosisName: '急性心肌梗死'
  },
  {
    insuranceUnit: '龙安区社区',
    name: '赵*',
    idCard: '4105********3456',
    hospital: '安阳市中医院',
    admissionDate: '2023-12-04',
    dischargeDate: '2023-12-11',
    totalCost: 6850,
    reimbursement: 4520,
    hospitalDays: 7,
    diagnosisCode: 'J44',
    diagnosisName: '慢性阻塞性肺病'
  },
  {
    insuranceUnit: '高新区社区',
    name: '刘**',
    idCard: '4105********7890',
    hospital: '安阳市第一人民医院',
    admissionDate: '2023-12-05',
    dischargeDate: '2023-12-12',
    totalCost: 8230,
    reimbursement: 5420,
    hospitalDays: 7,
    diagnosisCode: 'N18',
    diagnosisName: '慢性肾衰竭'
  },
  {
    insuranceUnit: '文峰区社区',
    name: '陈**',
    idCard: '4105********2345',
    hospital: '安阳市第二人民医院',
    admissionDate: '2023-12-06',
    dischargeDate: '2023-12-18',
    totalCost: 7560,
    reimbursement: 4980,
    hospitalDays: 12,
    diagnosisCode: 'K80',
    diagnosisName: '胆石症'
  },
  {
    insuranceUnit: '北关区社区',
    name: '杨**',
    idCard: '4105********6789',
    hospital: '安阳市中医院',
    admissionDate: '2023-12-07',
    dischargeDate: '2023-12-14',
    totalCost: 6940,
    reimbursement: 4580,
    hospitalDays: 7,
    diagnosisCode: 'M17',
    diagnosisName: '膝关节病'
  },
  {
    insuranceUnit: '殷都区社区',
    name: '黄**',
    idCard: '4105********0123',
    hospital: '安阳市第一人民医院',
    admissionDate: '2023-12-08',
    dischargeDate: '2023-12-15',
    totalCost: 9580,
    reimbursement: 6320,
    hospitalDays: 7,
    diagnosisCode: 'C34',
    diagnosisName: '支气管和肺恶性肿瘤'
  },
  {
    insuranceUnit: '龙安区社区',
    name: '吴**',
    idCard: '4105********4567',
    hospital: '安阳市第二人民医院',
    admissionDate: '2023-12-09',
    dischargeDate: '2023-12-16',
    totalCost: 8120,
    reimbursement: 5360,
    hospitalDays: 7,
    diagnosisCode: 'G40',
    diagnosisName: '癫痫'
  },
  {
    insuranceUnit: '高新区社区',
    name: '郑**',
    idCard: '4105********8901',
    hospital: '安阳市中医院',
    admissionDate: '2023-12-10',
    dischargeDate: '2023-12-17',
    totalCost: 7350,
    reimbursement: 4850,
    hospitalDays: 7,
    diagnosisCode: 'H35',
    diagnosisName: '黄斑变性'
  }
]);

// 明细模态框状态
const detailModalVisible = ref(false);
const drillDownType = ref('');
const drillDownParams = ref({});

// 获取数据
const fetchData = async () => {
  globalLoading.value = true;
  try {
    // TODO: 调用API获取数据
    // const overviewRes = await HospitalAnalysisAPI.getOverview(startMonth.value.format('YYYY-MM'), endMonth.value.format('YYYY-MM'));
    // if (overviewRes && overviewRes.data) {
    //   overviewData.value = overviewRes.data;
    // }

    // 使用模拟数据
    message.success('数据加载成功');
  } catch (error) {
    console.error('加载数据失败:', error);
    message.error('数据加载失败');
  } finally {
    globalLoading.value = false;
  }
};

// 查询处理
const handleQuery = (params) => {
  console.log('查询参数:', params);
  startMonth.value = dayjs(params.startMonth);
  endMonth.value = dayjs(params.endMonth);
  fetchData();
};

// 重置处理
const handleReset = () => {
  startMonth.value = dayjs().startOf('year');
  endMonth.value = dayjs();
  fetchData();
};

// 筛选条件变化
const handleFilterChange = (params) => {
  console.log('筛选条件变化:', params);
};

// 周期变化
const handlePeriodChange = (period) => {
  console.log('周期变化:', period);
  // TODO: 根据周期重新获取趋势数据
};

// 区域行点击
const handleAreaRowClick = (record) => {
  console.log('区域行点击:', record);
};

// 医疗机构行点击
const handleHospitalRowClick = (record) => {
  console.log('医疗机构行点击:', record);
};

// 病种行点击
const handleDiseaseRowClick = (record) => {
  console.log('病种行点击:', record);
};

// 下钻处理
const handleDrillDown = (type, record) => {
  drillDownType.value = type;
  drillDownParams.value = record;
  detailModalVisible.value = true;
};

// 关闭明细模态框
const handleDetailModalClose = () => {
  drillDownType.value = '';
  drillDownParams.value = {};
};

// 明细搜索
const handleDetailSearch = (searchText) => {
  console.log('明细搜索:', searchText);
};

// 明细分页变化
const handleDetailPageChange = ({ page, pageSize }) => {
  console.log('明细分页变化:', page, pageSize);
};

// 页面加载
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 自定义滚动条样式 */
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
