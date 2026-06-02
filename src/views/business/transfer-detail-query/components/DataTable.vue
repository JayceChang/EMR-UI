<template>
  <div class="bg-white rounded-xl p-5 table-shadow w-full lg:w-full overflow-x-auto">
    <!-- 表格工具栏 -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div class="flex items-center space-x-4">
        <h2 class="text-xl font-semibold">外转患者明细数据</h2>
        <span class="bg-blue-50 text-primary px-3 py-1 rounded-full text-sm font-medium">
          共 {{ total }} 条记录
        </span>
      </div>
    </div>

    <div class="flex items-center space-x-3 w-full sm:w-auto mb-4">
      <a-input-search
        v-model:value="searchKeywordLocal"
        class="w-full sm:w-64"
        placeholder="搜索表格内容..."
        @search="handleSearch"
        allow-clear
      />
      <a-button @click="handleRefresh" :loading="loading">
        <i class="fas fa-sync-alt"></i>
      </a-button>
    </div>

    <!-- 表格容器 -->
    <div class="overflow-x-auto">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
        size="small"
        class="min-w-full"
        :row-key="(record) => record.idCard + record.hospitalizationNo"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'idCard'">
            <span class="text-sm font-mono">{{ record.idCard }}</span>
          </template>
          <template v-else-if="column.key === 'hospitalizationNo'">
            <span class="text-sm">{{ record.hospitalizationNo }}</span>
          </template>
          <template v-else-if="column.key === 'name'">
            <span class="text-sm font-medium">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'gender'">
            <a-tag :color="record.gender === '男' ? 'blue' : 'pink'">
              {{ record.gender }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'age'">
            <span class="text-sm">{{ record.age }}岁</span>
          </template>
          <template v-else-if="column.key === 'hospital'">
            <span class="text-sm text-gray-800">{{ record.hospital }}</span>
          </template>
          <template v-else-if="column.key === 'admissionDate'">
            <span class="text-sm text-gray-600">{{ record.admissionDate }}</span>
          </template>
          <template v-else-if="column.key === 'dischargeDate'">
            <span class="text-sm text-gray-600">{{ record.dischargeDate }}</span>
          </template>
          <template v-else-if="column.key === 'totalCost'">
            <span class="text-sm font-semibold text-red-600">¥{{ record.totalCost.toFixed(2) }}</span>
          </template>
          <template v-else-if="column.key === 'reimbursement'">
            <span class="text-sm font-semibold text-primary">¥{{ record.reimbursement.toFixed(2) }}</span>
          </template>
          <template v-else-if="column.key === 'diagnosisCode'">
            <span class="text-sm text-gray-700">{{ record.diagnosisCode }}</span>
          </template>
          <template v-else-if="column.key === 'diagnosisName'">
            <span class="text-sm text-gray-700">{{ record.diagnosisName }}</span>
          </template>
          <template v-else-if="column.key === 'settlementDate'">
            <span class="text-sm text-gray-600">{{ record.settlementDate }}</span>
          </template>
          <template v-else-if="column.key === 'insuranceUnit'">
            <span class="text-sm text-gray-600">{{ record.insuranceUnit }}</span>
          </template>
          <template v-else-if="column.key === 'insuranceType'">
            <a-tag :color="record.insuranceType === '职工' ? 'gold' : 'cyan'">
              {{ record.insuranceType }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 分页控件 -->
    <div class="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="text-sm text-gray-500">
        显示
        <span class="text-gray-700 font-medium">{{ paginationInfo.start }}</span>
        到
        <span class="text-gray-700 font-medium">{{ paginationInfo.end }}</span>
        条，共
        <span class="text-primary font-semibold">{{ paginationInfo.total }}</span>
        条
      </div>
      <a-pagination
        v-model:current="currentPageLocal"
        v-model:page-size="pageSizeLocal"
        :total="total"
        :show-size-changer="true"
        :show-quick-jumper="true"
        :show-total="(total) => `共 ${total} 条`"
        :page-size-options="['10', '20', '50', '100']"
        @change="handlePageChange"
        @show-size-change="handlePageSizeChange"
      />
    </div>

    <!-- 空状态 -->
    <a-empty
      v-if="!loading && dataSource.length === 0"
      class="my-10"
      description="请使用左侧筛选条件查询数据"
    >
      <a-button type="primary" @click="handleRefresh">刷新数据</a-button>
    </a-empty>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  dataSource: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },
  searchKeyword: {
    type: String,
    default: ''
  },
  pagination: {
    type: Object,
    default: () => ({
      current: 1,
      pageSize: 10,
      total: 0
    })
  }
});

const emit = defineEmits(['search', 'refresh', 'page-change', 'page-size-change']);

// Local state
const currentPageLocal = ref(props.pagination.current);
const pageSizeLocal = ref(props.pagination.pageSize);
const searchKeywordLocal = ref(props.searchKeyword);

// Watch for prop changes
watch(() => props.pagination, (newVal) => {
  currentPageLocal.value = newVal.current;
  pageSizeLocal.value = newVal.pageSize;
}, { deep: true });

watch(() => props.searchKeyword, (newVal) => {
  searchKeywordLocal.value = newVal;
});

// Table columns
const columns = [
  {
    title: '身份证号（脱敏）',
    dataIndex: 'idCard',
    key: 'idCard',
    width: 150,
    sorter: (a, b) => a.idCard.localeCompare(b.idCard)
  },
  {
    title: '住院号',
    dataIndex: 'hospitalizationNo',
    key: 'hospitalizationNo',
    width: 140,
    sorter: (a, b) => a.hospitalizationNo.localeCompare(b.hospitalizationNo)
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: 100,
    sorter: (a, b) => a.name.localeCompare(b.name)
  },
  {
    title: '性别',
    dataIndex: 'gender',
    key: 'gender',
    width: 80,
    sorter: (a, b) => a.gender.localeCompare(b.gender)
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
    width: 80,
    sorter: (a, b) => a.age - b.age
  },
  {
    title: '医疗机构',
    dataIndex: 'hospital',
    key: 'hospital',
    width: 200,
    sorter: (a, b) => a.hospital.localeCompare(b.hospital),
    ellipsis: true
  },
  {
    title: '入院日期',
    dataIndex: 'admissionDate',
    key: 'admissionDate',
    width: 120,
    sorter: (a, b) => new Date(a.admissionDate) - new Date(b.admissionDate)
  },
  {
    title: '出院日期',
    dataIndex: 'dischargeDate',
    key: 'dischargeDate',
    width: 120,
    sorter: (a, b) => new Date(a.dischargeDate) - new Date(b.dischargeDate)
  },
  {
    title: '总费用',
    dataIndex: 'totalCost',
    key: 'totalCost',
    width: 120,
    sorter: (a, b) => a.totalCost - b.totalCost,
    align: 'right'
  },
  {
    title: '统筹报销',
    dataIndex: 'reimbursement',
    key: 'reimbursement',
    width: 120,
    sorter: (a, b) => a.reimbursement - b.reimbursement,
    align: 'right'
  },
  {
    title: '诊断编码',
    dataIndex: 'diagnosisCode',
    key: 'diagnosisCode',
    width: 120,
    sorter: (a, b) => a.diagnosisCode.localeCompare(b.diagnosisCode)
  },
  {
    title: '诊断名称',
    dataIndex: 'diagnosisName',
    key: 'diagnosisName',
    width: 180,
    sorter: (a, b) => a.diagnosisName.localeCompare(b.diagnosisName),
    ellipsis: true
  },
  {
    title: '结算日期',
    dataIndex: 'settlementDate',
    key: 'settlementDate',
    width: 120,
    sorter: (a, b) => new Date(a.settlementDate) - new Date(b.settlementDate)
  },
  {
    title: '参保单位',
    dataIndex: 'insuranceUnit',
    key: 'insuranceUnit',
    width: 180,
    sorter: (a, b) => a.insuranceUnit.localeCompare(b.insuranceUnit),
    ellipsis: true
  },
  {
    title: '参保类型',
    dataIndex: 'insuranceType',
    key: 'insuranceType',
    width: 100,
    sorter: (a, b) => a.insuranceType.localeCompare(b.insuranceType)
  }
];

// Pagination info
const paginationInfo = computed(() => {
  const total = props.dataSource.length;
  const start = total > 0 ? (currentPageLocal.value - 1) * pageSizeLocal.value + 1 : 0;
  const end = Math.min(currentPageLocal.value * pageSizeLocal.value, total);
  return { start, end, total };
});

// Event handlers
const handleSearch = (value) => {
  emit('search', value);
};

const handleRefresh = () => {
  emit('refresh');
};

const handlePageChange = (page, size) => {
  currentPageLocal.value = page;
  pageSizeLocal.value = size;
  emit('page-change', page, size);
};

const handlePageSizeChange = (current, size) => {
  currentPageLocal.value = 1;
  pageSizeLocal.value = size;
  emit('page-size-change', size);
};
</script>

<style scoped>
.table-shadow {
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.06);
}

:deep(.ant-table-tbody > tr:hover) {
  background-color: #f5f5f5;
}
</style>
