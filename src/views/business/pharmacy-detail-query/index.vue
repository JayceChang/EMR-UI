<template>
  <div class="min-h-screen bg-gray-50 font-sans text-dark bg-gradient-to-br from-blue-50 to-indigo-100">
    <main class="mx-auto px-4 py-6 w-full">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 左侧查询筛选框 -->
        <div class="w-72 rounded-lg flex-shrink-0">
          <FilterPanel
            :loading="loading"
            :town-data="townData"
            @search="handleSearch"
            @reset="handleReset"
          />
        </div>

        <!-- 右侧查询结果表格 -->
        <div class="flex-1 rounded-lg flex flex-col overflow-hidden">
          <DataTable
            :data-source="tableData"
            :loading="loading"
            :pagination="pagination"
            :search-keyword="tableSearchKeyword"
            :total-count="totalCount"
            @search="handleTableSearch"
            @refresh="handleRefresh"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';

// Components
// API
import { PharmacyDetailQueryAPI } from '/@/api/business/pharmacy-detail-query/pharmacy-detail-query-api';;
import FilterPanel from './components/FilterPanel.vue';
import DataTable from './components/DataTable.vue';

// Import styles
import '/@/assets/css/all.min.css';

// Reactive data
const loading = ref(false);
const tableSearchKeyword = ref('');
const totalCount = ref(0);

const tableData = ref([]);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
});

const filterParams = ref({
  startMonth: '2023-12',
  endMonth: '2023-12',
  idCard: '',
  name: '',
  minAge: null,
  maxAge: null,
  district: '',
  town: '',
  pharmacyName: ''
});

// Town data for district-town linkage
const townData = ref({
  anyang: [
    { value: '', text: '全部乡镇' },
    { value: 'beiguan', text: '北关区' },
    { value: 'wenfeng', text: '文峰区' },
    { value: 'yindu', text: '殷都区' },
    { value: "long'an", text: "龙安区" }
  ],
  linzhou: [
    { value: '', text: '全部乡镇' },
    { value: 'chengguan', text: '城关镇' },
    { value: 'panshi', text: '磐石镇' },
    { value: 'heshun', text: '合顺镇' }
  ],
  tangyin: [
    { value: '', text: '全部乡镇' },
    { value: 'baiquan', text: '白泉镇' },
    { value: 'yucun', text: '鱼村镇' }
  ],
  anyangxian: [
    { value: '', text: '全部乡镇' },
    { value: 'shangguan', text: '上官镇' },
    { value: 'xiaguan', text: '下官镇' }
  ],
  huaixian: [
    { value: '', text: '全部乡镇' },
    { value: 'matou', text: '马头镇' },
    { value: 'wangdian', text: '王店镇' }
  ]
});

// Mock data
const mockData = ref([
  {
    idCard: '4105********1234',
    name: '张**',
    gender: '男',
    age: 45,
    settlementDate: '2023-10-15',
    pharmacy: '张仲景大药房',
    totalAmount: 365.20,
    poolPayment: 210.80,
    accountPayment: 154.40,
    insuranceType: '职工',
    medicalType: '普通',
    insuranceUnit: '安阳市钢铁公司'
  },
  {
    idCard: '4105********5678',
    name: '李**',
    gender: '女',
    age: 68,
    settlementDate: '2023-10-14',
    pharmacy: '益民药房',
    totalAmount: 520.50,
    poolPayment: 380.30,
    accountPayment: 140.20,
    insuranceType: '居民',
    medicalType: '慢病',
    insuranceUnit: '文峰区退休人员管理中心'
  },
  {
    idCard: '4105********9012',
    name: '王**',
    gender: '男',
    age: 32,
    settlementDate: '2023-10-14',
    pharmacy: '紫薇大药房',
    totalAmount: 186.00,
    poolPayment: 102.50,
    accountPayment: 83.50,
    insuranceType: '职工',
    medicalType: '普通',
    insuranceUnit: '安阳市教育局'
  },
  {
    idCard: '4105********3456',
    name: '赵**',
    gender: '女',
    age: 55,
    settlementDate: '2023-10-13',
    pharmacy: '人和大药房',
    totalAmount: 720.80,
    poolPayment: 510.50,
    accountPayment: 210.30,
    insuranceType: '职工',
    medicalType: '门特',
    insuranceUnit: '安阳市人民银行'
  },
  {
    idCard: '4105********7890',
    name: '陈**',
    gender: '男',
    age: 72,
    settlementDate: '2023-10-12',
    pharmacy: '众生大药房',
    totalAmount: 450.30,
    poolPayment: 320.20,
    accountPayment: 130.10,
    insuranceType: '居民',
    medicalType: '慢病',
    insuranceUnit: '汤阴县退休人员管理中心'
  },
  {
    idCard: '4105********2345',
    name: '刘**',
    gender: '女',
    age: 48,
    settlementDate: '2023-10-11',
    pharmacy: '百姓大药房',
    totalAmount: 320.80,
    poolPayment: 210.50,
    accountPayment: 110.30,
    insuranceType: '职工',
    medicalType: '普通',
    insuranceUnit: '滑县教育局'
  },
  {
    idCard: '4105********6789',
    name: '孙**',
    gender: '男',
    age: 52,
    settlementDate: '2023-10-10',
    pharmacy: '益春大药房',
    totalAmount: 620.40,
    poolPayment: 480.20,
    accountPayment: 140.20,
    insuranceType: '居民',
    medicalType: '门特',
    insuranceUnit: '内黄县卫生局'
  },
  {
    idCard: '4105********0123',
    name: '郑**',
    gender: '女',
    age: 36,
    settlementDate: '2023-10-09',
    pharmacy: '仁民大药房',
    totalAmount: 280.50,
    poolPayment: 190.30,
    accountPayment: 90.20,
    insuranceType: '职工',
    medicalType: '普通',
    insuranceUnit: '安阳市妇幼保健院'
  },
  {
    idCard: '4105********4567',
    name: '吴**',
    gender: '男',
    age: 59,
    settlementDate: '2023-10-08',
    pharmacy: '东参大药房',
    totalAmount: 820.60,
    poolPayment: 580.40,
    accountPayment: 240.20,
    insuranceType: '居民',
    medicalType: '慢病',
    insuranceUnit: '北关区社区服务中心'
  },
  {
    idCard: '4105********8901',
    name: '马**',
    gender: '男',
    age: 42,
    settlementDate: '2023-10-07',
    pharmacy: '福林堂大药房',
    totalAmount: 390.40,
    poolPayment: 260.20,
    accountPayment: 130.20,
    insuranceType: '职工',
    medicalType: '普通',
    insuranceUnit: '殷都区矿务局'
  }
]);

// Perform query
const performQuery = async () => {
  loading.value = true;

  try {
    // Call API
    const response = await PharmacyDetailQueryAPI.getPharmacyDetailWithPage(
      pagination.value.current,
      pagination.value.pageSize,
      filterParams.value
    );

    if (response && response.data) {
      tableData.value = response.data.records || response.data || [];
      totalCount.value = response.data.total || tableData.value.length;
      pagination.value.total = totalCount.value;
      message.success(`查询成功，共找到 ${totalCount.value} 条记录`);
    }
  } catch (error) {
    console.error('加载数据失败:', error);

    // Fallback to mock data with filtering
    let filtered = [...mockData.value];

    // Apply filters
    if (filterParams.value.idCard) {
      if (filterParams.value.idCard.length === 4) {
        filtered = filtered.filter(item => item.idCard.endsWith(filterParams.value.idCard));
      } else {
        filtered = filtered.filter(item => item.idCard.replace(/\*/g, '') === filterParams.value.idCard.replace(/\*/g, ''));
      }
    }

    if (filterParams.value.name) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(filterParams.value.name.toLowerCase()));
    }

    if (filterParams.value.minAge !== null) {
      filtered = filtered.filter(item => item.age >= filterParams.value.minAge);
    }

    if (filterParams.value.maxAge !== null) {
      filtered = filtered.filter(item => item.age <= filterParams.value.maxAge);
    }

    if (filterParams.value.pharmacyName) {
      filtered = filtered.filter(item => item.pharmacy.toLowerCase().includes(filterParams.value.pharmacyName.toLowerCase()));
    }

    // Simulate API call
    setTimeout(() => {
      tableData.value = filtered;
      totalCount.value = filtered.length;
      pagination.value.total = filtered.length;
      message.warning('使用模拟数据（API暂不可用）');
    }, 500);
  } finally {
    loading.value = false;
  }
};

// Event handlers
const handleSearch = async (params) => {
  filterParams.value = { ...params };
  pagination.value.current = 1;
  await performQuery();
};

const handleReset = async () => {
  filterParams.value = {
    startMonth: '2023-12',
    endMonth: '2023-12',
    idCard: '',
    name: '',
    minAge: null,
    maxAge: null,
    district: '',
    town: '',
    pharmacyName: ''
  };
  tableSearchKeyword.value = '';
  pagination.value.current = 1;
  await performQuery();
  message.info('已重置筛选条件');
};

const handleTableSearch = (keyword) => {
  tableSearchKeyword.value = keyword;
  console.log('表格搜索:', keyword);
};

const handleRefresh = async () => {
  await performQuery();
  message.info('数据已刷新');
};

const handlePageChange = async (page, pageSize) => {
  pagination.value.current = page;
  pagination.value.pageSize = pageSize;
  await performQuery();
};

const handlePageSizeChange = async (pageSize) => {
  pagination.value.current = 1;
  pagination.value.pageSize = pageSize;
  await performQuery();
};

// Page load
onMounted(async () => {
  // Auto query on page load
  await performQuery();
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
