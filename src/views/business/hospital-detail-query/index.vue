<template>
  <div class="mx-auto px-4 py-6 w-full">
    <div class="flex flex-1 lg:flex-row gap-6">
      <!-- 左侧筛选条件 -->
      <FilterPanel
        :loading="loading"
        :town-data="townData"
        @search="handleSearch"
        @reset="handleReset"
      />

      <!-- 右侧数据表格 -->
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';

// Components
import FilterPanel from './components/FilterPanel.vue';
import DataTable from './components/DataTable.vue';

// API
import { HospitalDetailQueryAPI } from '/@/api/business/hospital-detail-query/hospital-detail-query-api';

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
  startMonth: '2024-07',
  endMonth: '2025-12',
  idCard: '',
  name: '',
  minAge: null,
  maxAge: null,
  district: '',
  town: '',
  insuranceType: '',
  hospitalLevel: '',
  hospitalName: '',
  icdCategory: ''
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
const mockData = [
  // {
  //   idCard: '4105********1234',
  //   hospitalizationNo: 'ZY2023120001',
  //   name: '张**',
  //   gender: '男',
  //   age: 45,
  //   hospital: '安阳市第一人民医院',
  //   admissionDate: '2023-12-01',
  //   dischargeDate: '2023-12-07',
  //   totalCost: 8560.50,
  //   reimbursement: 5230.80,
  //   diagnosisCode: 'I25.1',
  //   diagnosisName: '冠心病',
  //   settlementDate: '2023-12-08',
  //   insuranceUnit: '安阳市某企业',
  //   insuranceType: '职工'
  // },
  // {
  //   idCard: '4105********5678',
  //   hospitalizationNo: 'ZY2023120002',
  //   name: '李**',
  //   gender: '女',
  //   age: 68,
  //   hospital: '安阳市第二人民医院',
  //   admissionDate: '2023-12-02',
  //   dischargeDate: '2023-12-10',
  //   totalCost: 12340.75,
  //   reimbursement: 8920.30,
  //   diagnosisCode: 'E11.9',
  //   diagnosisName: '2型糖尿病',
  //   settlementDate: '2023-12-11',
  //   insuranceUnit: '安阳市某事业单位',
  //   insuranceType: '职工'
  // },
  // {
  //   idCard: '4105********9012',
  //   hospitalizationNo: 'ZY2023120003',
  //   name: '王**',
  //   gender: '男',
  //   age: 32,
  //   hospital: '林州市人民医院',
  //   admissionDate: '2023-12-03',
  //   dischargeDate: '2023-12-05',
  //   totalCost: 3200.40,
  //   reimbursement: 1850.20,
  //   diagnosisCode: 'S82.0',
  //   diagnosisName: '股骨骨折',
  //   settlementDate: '2023-12-06',
  //   insuranceUnit: '林州市某工厂',
  //   insuranceType: '职工'
  // },
  // {
  //   idCard: '4105********3456',
  //   hospitalizationNo: 'ZY2023120004',
  //   name: '赵**',
  //   gender: '女',
  //   age: 55,
  //   hospital: '汤阴县人民医院',
  //   admissionDate: '2023-12-04',
  //   dischargeDate: '2023-12-12',
  //   totalCost: 9870.25,
  //   reimbursement: 6540.15,
  //   diagnosisCode: 'J44.9',
  //   diagnosisName: '慢性阻塞性肺病',
  //   settlementDate: '2023-12-13',
  //   insuranceUnit: '汤阴县某学校',
  //   insuranceType: '居民'
  // },
  // {
  //   idCard: '4105********7890',
  //   hospitalizationNo: 'ZY2023120005',
  //   name: '刘**',
  //   gender: '男',
  //   age: 72,
  //   hospital: '安阳市中医院',
  //   admissionDate: '2023-12-05',
  //   dischargeDate: '2023-12-15',
  //   totalCost: 15600.80,
  //   reimbursement: 10250.50,
  //   diagnosisCode: 'I63.9',
  //   diagnosisName: '脑梗死',
  //   settlementDate: '2023-12-16',
  //   insuranceUnit: '安阳市退休人员',
  //   insuranceType: '职工'
  // },
  // {
  //   idCard: '4105********2345',
  //   hospitalizationNo: 'ZY2023120006',
  //   name: '陈**',
  //   gender: '女',
  //   age: 28,
  //   hospital: '安阳市妇幼保健院',
  //   admissionDate: '2023-12-06',
  //   dischargeDate: '2023-12-09',
  //   totalCost: 4500.30,
  //   reimbursement: 2800.15,
  //   diagnosisCode: 'O80.0',
  //   diagnosisName: '单胎顺产',
  //   settlementDate: '2023-12-10',
  //   insuranceUnit: '安阳市某公司',
  //   insuranceType: '职工'
  // },
  // {
  //   idCard: '4105********6789',
  //   hospitalizationNo: 'ZY2023120007',
  //   name: '杨**',
  //   gender: '男',
  //   age: 48,
  //   hospital: '安阳县人民医院',
  //   admissionDate: '2023-12-07',
  //   dischargeDate: '2023-12-14',
  //   totalCost: 7650.60,
  //   reimbursement: 4980.40,
  //   diagnosisCode: 'K80.2',
  //   diagnosisName: '胆囊结石伴胆囊炎',
  //   settlementDate: '2023-12-15',
  //   insuranceUnit: '安阳县某合作社',
  //   insuranceType: '居民'
  // },
  // {
  //   idCard: '4105********0123',
  //   hospitalizationNo: 'ZY2023120008',
  //   name: '黄**',
  //   gender: '女',
  //   age: 62,
  //   hospital: '滑县人民医院',
  //   admissionDate: '2023-12-08',
  //   dischargeDate: '2023-12-18',
  //   totalCost: 15600.90,
  //   reimbursement: 10200.50,
  //   diagnosisCode: 'N18.3',
  //   diagnosisName: '慢性肾脏病3期',
  //   settlementDate: '2023-12-19',
  //   insuranceUnit: '滑县某村委会',
  //   insuranceType: '居民'
  // },
  // {
  //   idCard: '4105********4567',
  //   hospitalizationNo: 'ZY2023120009',
  //   name: '吴**',
  //   gender: '男',
  //   age: 36,
  //   hospital: '安阳市第三人民医院',
  //   admissionDate: '2023-12-09',
  //   dischargeDate: '2023-12-11',
  //   totalCost: 2800.50,
  //   reimbursement: 1560.30,
  //   diagnosisCode: 'J06.9',
  //   diagnosisName: '急性上呼吸道感染',
  //   settlementDate: '2023-12-12',
  //   insuranceUnit: '安阳市某商场',
  //   insuranceType: '职工'
  // },
  // {
  //   idCard: '4105********8901',
  //   hospitalizationNo: 'ZY2023120010',
  //   name: '郑**',
  //   gender: '女',
  //   age: 50,
  //   hospital: '安阳市肿瘤医院',
  //   admissionDate: '2023-12-10',
  //   dischargeDate: '2023-12-25',
  //   totalCost: 35600.80,
  //   reimbursement: 25800.60,
  //   diagnosisCode: 'C50.9',
  //   diagnosisName: '乳腺恶性肿瘤',
  //   settlementDate: '2023-12-26',
  //   insuranceUnit: '安阳市某研究所',
  //   insuranceType: '职工'
  // }
];

// Perform query
const performQuery = async () => {
  loading.value = true;

  try {
    // Prepare API parameters
    const params = {
      startMonth: filterParams.value.startMonth,
      endMonth: filterParams.value.endMonth,
      idCard: filterParams.value.idCard,
      name: filterParams.value.name,
      minAge: filterParams.value.minAge,
      maxAge: filterParams.value.maxAge,
      district: filterParams.value.district,
      town: filterParams.value.town,
      insuranceType: filterParams.value.insuranceType,
      hospitalLevel: filterParams.value.hospitalLevel,
      hospitalName: filterParams.value.hospitalName,
      icdCategory: filterParams.value.icdCategory,
      page: pagination.value.current,
      pageSize: pagination.value.pageSize
    };

    // Call API
    const response = await HospitalDetailQueryAPI.getHospitalDetailWithPage(
      pagination.value.current,
      pagination.value.pageSize,
      params
    );

    // Handle API response
    if (response && response.data) {
      tableData.value = response.data.records || response.data || [];
      totalCount.value = response.data.total || tableData.value.length;
      pagination.value.total = totalCount.value;
      message.success(`查询成功，共找到 ${totalCount.value} 条记录`);
    } else {
      // Fallback to mock data if API returns no data
      throw new Error('API returned no data');
    }
  } catch (error) {
    console.warn('API call failed, using mock data:', error);

    // Fallback to mock data when API is not available
    let filtered = [...mockData];

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

    if (filterParams.value.hospitalName) {
      filtered = filtered.filter(item => item.hospital.toLowerCase().includes(filterParams.value.hospitalName.toLowerCase()));
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
    insuranceType: '',
    hospitalLevel: '',
    hospitalName: '',
    icdCategory: ''
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
