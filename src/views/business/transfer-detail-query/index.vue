<template>
  <div class="bg-gray-50 min-h-screen font-sans text-dark bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="mx-auto px-4 py-6 relative z-10 w-full">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 左侧筛选区 -->
        <div class="lg:w-72 rounded-lg">
          <div class="bg-white rounded-xl p-5 filter-card sticky top-6">
            <FilterPanel
              :loading="loading"
              :town-data="townData"
              @search="handleSearch"
              @reset="handleReset"
            />
          </div>
        </div>

        <!-- 右侧数据表格区 -->
        <div class="flex-1 rounded-lg flex flex-col overflow-hidden">
          <DataTable
            :data-source="filteredData"
            :loading="loading"
            :total="totalCount"
            :search-keyword="searchKeyword"
            :pagination="pagination"
            @search="handleTableSearch"
            @refresh="handleRefresh"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { message } from 'ant-design-vue';

// Components
// API
import { TransferDetailQueryAPI } from '/@/api/business/transfer-detail-query/transfer-detail-query-api';
import FilterPanel from './components/FilterPanel.vue';
import DataTable from './components/DataTable.vue';

// Import styles
import '/@/assets/css/all.min.css';

// State
const loading = ref(false);
const searchKeyword = ref('');
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// Filter parameters
const filterParams = reactive({
  startMonth: '2023-12',
  endMonth: '2023-12',
  idCard: '',
  name: '',
  minAge: null,
  maxAge: null,
  district: '',
  town: '',
  hospitalName: '',
  diagnosisCode: '',
  insuranceType: ''
});

// Filtered data
const filteredData = ref([]);

// Mock data - 外转患者明细数据
const mockData = ref([
  {
    idCard: "4105********1234",
    hospitalizationNo: "ZY2023120001",
    name: "张**",
    gender: "男",
    age: 45,
    hospital: "河南省人民医院",
    admissionDate: "2023-12-01",
    dischargeDate: "2023-12-07",
    totalCost: 8560.50,
    reimbursement: 5230.80,
    diagnosisCode: "I25.1",
    diagnosisName: "冠心病",
    settlementDate: "2023-12-08",
    insuranceUnit: "安阳市某企业",
    insuranceType: "职工"
  },
  {
    idCard: "4105********5678",
    hospitalizationNo: "ZY2023120002",
    name: "李**",
    gender: "女",
    age: 68,
    hospital: "郑州大学第一附属医院",
    admissionDate: "2023-12-02",
    dischargeDate: "2023-12-10",
    totalCost: 12340.75,
    reimbursement: 8920.30,
    diagnosisCode: "E11.9",
    diagnosisName: "2型糖尿病",
    settlementDate: "2023-12-11",
    insuranceUnit: "安阳市某事业单位",
    insuranceType: "职工"
  },
  {
    idCard: "4105********9012",
    hospitalizationNo: "ZY2023120003",
    name: "王**",
    gender: "男",
    age: 32,
    hospital: "河南省肿瘤医院",
    admissionDate: "2023-12-03",
    dischargeDate: "2023-12-05",
    totalCost: 3200.40,
    reimbursement: 1850.20,
    diagnosisCode: "S82.0",
    diagnosisName: "股骨骨折",
    settlementDate: "2023-12-06",
    insuranceUnit: "林州市某工厂",
    insuranceType: "职工"
  },
  {
    idCard: "4105********3456",
    hospitalizationNo: "ZY2023120004",
    name: "赵**",
    gender: "女",
    age: 55,
    hospital: "河南省中医院",
    admissionDate: "2023-12-04",
    dischargeDate: "2023-12-12",
    totalCost: 9870.25,
    reimbursement: 6540.15,
    diagnosisCode: "J44.9",
    diagnosisName: "慢性阻塞性肺病",
    settlementDate: "2023-12-13",
    insuranceUnit: "汤阴县某学校",
    insuranceType: "居民"
  },
  {
    idCard: "4105********7890",
    hospitalizationNo: "ZY2023120005",
    name: "刘**",
    gender: "男",
    age: 72,
    hospital: "河南省胸科医院",
    admissionDate: "2023-12-05",
    dischargeDate: "2023-12-15",
    totalCost: 15600.80,
    reimbursement: 10250.50,
    diagnosisCode: "I63.9",
    diagnosisName: "脑梗死",
    settlementDate: "2023-12-16",
    insuranceUnit: "安阳市退休人员",
    insuranceType: "职工"
  },
  {
    idCard: "4105********2345",
    hospitalizationNo: "ZY2023120006",
    name: "陈**",
    gender: "女",
    age: 28,
    hospital: "河南省妇幼保健院",
    admissionDate: "2023-12-06",
    dischargeDate: "2023-12-09",
    totalCost: 4500.30,
    reimbursement: 2800.15,
    diagnosisCode: "O80.0",
    diagnosisName: "单胎顺产",
    settlementDate: "2023-12-10",
    insuranceUnit: "安阳市某公司",
    insuranceType: "职工"
  },
  {
    idCard: "4105********6789",
    hospitalizationNo: "ZY2023120007",
    name: "杨**",
    gender: "男",
    age: 48,
    hospital: "郑州大学第二附属医院",
    admissionDate: "2023-12-07",
    dischargeDate: "2023-12-14",
    totalCost: 7650.60,
    reimbursement: 4980.40,
    diagnosisCode: "K80.2",
    diagnosisName: "胆囊结石伴胆囊炎",
    settlementDate: "2023-12-15",
    insuranceUnit: "安阳县某合作社",
    insuranceType: "居民"
  },
  {
    idCard: "4105********0123",
    hospitalizationNo: "ZY2023120008",
    name: "黄**",
    gender: "女",
    age: 62,
    hospital: "郑州大学第三附属医院",
    admissionDate: "2023-12-08",
    dischargeDate: "2023-12-18",
    totalCost: 15600.90,
    reimbursement: 10200.50,
    diagnosisCode: "N18.3",
    diagnosisName: "慢性肾脏病3期",
    settlementDate: "2023-12-19",
    insuranceUnit: "滑县某村委会",
    insuranceType: "居民"
  },
  {
    idCard: "4105********4567",
    hospitalizationNo: "ZY2023120009",
    name: "吴**",
    gender: "男",
    age: 36,
    hospital: "河南省人民医院东区医院",
    admissionDate: "2023-12-09",
    dischargeDate: "2023-12-11",
    totalCost: 2800.50,
    reimbursement: 1560.30,
    diagnosisCode: "J06.9",
    diagnosisName: "急性上呼吸道感染",
    settlementDate: "2023-12-12",
    insuranceUnit: "安阳市某商场",
    insuranceType: "职工"
  },
  {
    idCard: "4105********8901",
    hospitalizationNo: "ZY2023120010",
    name: "郑**",
    gender: "女",
    age: 50,
    hospital: "河南省骨科医院",
    admissionDate: "2023-12-10",
    dischargeDate: "2023-12-25",
    totalCost: 35600.80,
    reimbursement: 25800.60,
    diagnosisCode: "C50.9",
    diagnosisName: "乳腺恶性肿瘤",
    settlementDate: "2023-12-26",
    insuranceUnit: "安阳市某研究所",
    insuranceType: "职工"
  }
]);

// 乡镇数据
const townData = ref({
  'anyang': [
    { value: '', text: '全部乡镇' },
    { value: 'beiguan', text: '北关区' },
    { value: 'wenfeng', text: '文峰区' },
    { value: 'yindu', text: '殷都区' },
    { value: 'longan', text: '龙安区' }
  ],
  'linzhou': [
    { value: '', text: '全部乡镇' },
    { value: 'chengguan', text: '城关镇' },
    { value: 'panshi', text: '磐石镇' },
    { value: 'heshun', text: '合顺镇' }
  ],
  'tangyin': [
    { value: '', text: '全部乡镇' },
    { value: 'baiquan', text: '白泉镇' },
    { value: 'yucun', text: '鱼村镇' }
  ],
  'anyangxian': [
    { value: '', text: '全部乡镇' },
    { value: 'shangguan', text: '上官镇' },
    { value: 'xiaguan', text: '下官镇' }
  ],
  'huaixian': [
    { value: '', text: '全部乡镇' },
    { value: 'matou', text: '马头镇' },
    { value: 'wangdian', text: '王店镇' }
  ]
});

// Pagination
const pagination = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: totalCount.value
}));

// Load data
const loadAllData = async () => {
  try {
    loading.value = true;

    // Call API with pagination
    const response = await TransferDetailQueryAPI.getTransferDetailWithPage(
      currentPage.value,
      pageSize.value,
      filterParams
    );

    if (response && response.data) {
      filteredData.value = response.data.records || response.data || [];
      totalCount.value = response.data.total || filteredData.value.length;
    }
    loading.value = false;
    message.success(`查询完成，共找到 ${totalCount.value} 条记录`);
  } catch (error) {
    console.error('加载数据失败:', error);
    // Fallback to mock data
    let filtered = [...mockData.value];

    // Apply local filters
    if (filterParams.idCard) {
      if (filterParams.idCard.length === 4) {
        filtered = filtered.filter(item => item.idCard.endsWith(filterParams.idCard));
      } else {
        filtered = filtered.filter(item => item.idCard.replace(/\*/g, '') === filterParams.idCard.replace(/\*/g, ''));
      }
    }

    if (filterParams.name) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(filterParams.name.toLowerCase()));
    }

    if (filterParams.minAge !== null) {
      filtered = filtered.filter(item => item.age >= filterParams.minAge);
    }

    if (filterParams.maxAge !== null) {
      filtered = filtered.filter(item => item.age <= filterParams.maxAge);
    }

    if (filterParams.hospitalName) {
      filtered = filtered.filter(item => item.hospital.toLowerCase().includes(filterParams.hospitalName.toLowerCase()));
    }

    // Apply pagination
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    filteredData.value = filtered.slice(start, end);
    totalCount.value = filtered.length;

    loading.value = false;
    message.warning('使用模拟数据（API暂不可用）');
  }
};

// Event handlers
const handleSearch = async (params) => {
  Object.assign(filterParams, params);
  currentPage.value = 1;
  await loadAllData();
};

const handleReset = async () => {
  filterParams.startMonth = '2023-12';
  filterParams.endMonth = '2023-12';
  filterParams.idCard = '';
  filterParams.name = '';
  filterParams.minAge = null;
  filterParams.maxAge = null;
  filterParams.district = '';
  filterParams.town = '';
  filterParams.hospitalName = '';
  filterParams.diagnosisCode = '';
  filterParams.insuranceType = '';
  currentPage.value = 1;
  searchKeyword.value = '';
  await loadAllData();
  message.info('已重置筛选条件');
};

const handleTableSearch = async (value) => {
  searchKeyword.value = value;
  currentPage.value = 1;
  await loadAllData();
};

const handleRefresh = async () => {
  await loadAllData();
  message.info('数据已刷新');
};

const handlePageChange = async (page, size) => {
  currentPage.value = page;
  pageSize.value = size;
  await loadAllData();
};

const handlePageSizeChange = async (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  await loadAllData();
};

// Page load
onMounted(async () => {
  await loadAllData();
});

// Watch for search keyword changes
watch(searchKeyword, async (newKeyword) => {
  console.log('搜索关键词变化:', newKeyword);
  await loadAllData();
});
</script>

<style scoped>
.filter-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-hover {
  @apply transition-all duration-200 hover:shadow-md hover:-translate-y-0.5;
}

.table-shadow {
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.06);
}
</style>
