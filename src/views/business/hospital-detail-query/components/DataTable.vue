<template>
  <div class="flex-1 bg-white rounded-xl p-5 filter-card overflow-hidden">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
      <h3 class="text-lg font-semibold flex items-center">
        <i class="fas fa-table text-primary mr-2"></i>
        住院明细数据
      </h3>
      <div class="flex flex-wrap gap-2">
        <a-input-search
          v-model:value="searchKeyword"
          class="w-full sm:w-64"
          placeholder="搜索姓名、身份证或住院号..."
          @search="handleSearch"
          allow-clear
        />
        <a-button @click="handleRefresh" :loading="loading">
          <i class="fas fa-sync-alt mr-2"></i>
          刷新
        </a-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="mb-4 text-sm text-gray-600">
      <i class="fas fa-info-circle mr-1"></i>
      共找到 <span class="font-semibold text-primary">{{ totalCount }}</span> 条记录
    </div>

    <!-- 表格容器 -->
    <div class="overflow-x-auto scrollbar-hide">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
        :row-key="(record) => record.idCard + record.hospitalizationNo"
        size="small"
        class="min-w-full table-shadow"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'idCard'">
            <span class="font-mono text-sm">{{ record.idCard }}</span>
          </template>

          <template v-else-if="column.key === 'hospitalizationNo'">
            <span class="text-blue-600 font-medium">{{ record.hospitalizationNo }}</span>
          </template>

          <template v-else-if="column.key === 'name'">
            <span class="font-medium">{{ record.name }}</span>
          </template>

          <template v-else-if="column.key === 'gender'">
            <a-tag :color="record.gender === '男' ? 'blue' : 'pink'">
              {{ record.gender }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'age'">
            <span class="font-medium">{{ record.age }}岁</span>
          </template>

          <template v-else-if="column.key === 'hospital'">
            <span class="text-gray-800">{{ record.hospital }}</span>
          </template>

          <template v-else-if="column.key === 'admissionDate'">
            <span class="text-gray-600">{{ record.admissionDate }}</span>
          </template>

          <template v-else-if="column.key === 'dischargeDate'">
            <span class="text-gray-600">{{ record.dischargeDate }}</span>
          </template>

          <template v-else-if="column.key === 'totalCost'">
            <span class="font-semibold text-red-600">¥{{ record.totalCost.toLocaleString() }}</span>
          </template>

          <template v-else-if="column.key === 'reimbursement'">
            <span class="font-semibold text-green-600">¥{{ record.reimbursement.toLocaleString() }}</span>
          </template>

          <template v-else-if="column.key === 'diagnosisCode'">
            <code class="bg-gray-100 px-2 py-1 rounded text-xs">{{ record.diagnosisCode }}</code>
          </template>

          <template v-else-if="column.key === 'diagnosisName'">
            <span class="text-gray-800">{{ record.diagnosisName }}</span>
          </template>

          <template v-else-if="column.key === 'settlementDate'">
            <span class="text-gray-600">{{ record.settlementDate }}</span>
          </template>

          <template v-else-if="column.key === 'insuranceUnit'">
            <span class="text-gray-600">{{ record.insuranceUnit }}</span>
          </template>

          <template v-else-if="column.key === 'insuranceType'">
            <a-tag :color="record.insuranceType === '职工' ? 'gold' : 'cyan'">
              {{ record.insuranceType }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 分页 -->
    <div class="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
      <div class="text-sm text-gray-500">
        显示 {{ paginationInfo.start }} 至 {{ paginationInfo.end }} 条，共 {{ paginationInfo.total }} 条记录
      </div>
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :total="totalCount"
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
      description="暂无数据"
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
  pagination: {
    type: Object,
    default: () => ({
      current: 1,
      pageSize: 10,
      total: 0
    })
  },
  searchKeyword: {
    type: String,
    default: ''
  },
  totalCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['search', 'refresh', 'page-change', 'page-size-change']);

// Local state
const currentPage = ref(props.pagination.current);
const pageSize = ref(props.pagination.pageSize);
const searchKeyword = ref(props.searchKeyword);

// Watch for prop changes
watch(() => props.pagination, (newVal) => {
  currentPage.value = newVal.current;
  pageSize.value = newVal.pageSize;
}, { deep: true });

watch(() => props.searchKeyword, (newVal) => {
  searchKeyword.value = newVal;
});

// Columns configuration
const columns = [
  {
    title: '身份证号',
    dataIndex: 'idCard',
    key: 'idCard',
    width: 150,
    sorter: (a, b) => {
      const aNum = a.idCard.replace(/\D/g, '');
      const bNum = b.idCard.replace(/\D/g, '');
      return aNum.localeCompare(bNum);
    },
    ellipsis: true
  },
  {
    title: '住院号',
    dataIndex: 'hospitalizationNo',
    key: 'hospitalizationNo',
    width: 130,
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
    width: 180,
    sorter: (a, b) => a.hospital.localeCompare(b.hospital),
    ellipsis: true
  },
  {
    title: '入院日期',
    dataIndex: 'admissionDate',
    key: 'admissionDate',
    width: 110,
    sorter: (a, b) => new Date(a.admissionDate) - new Date(b.admissionDate)
  },
  {
    title: '出院日期',
    dataIndex: 'dischargeDate',
    key: 'dischargeDate',
    width: 110,
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
    title: '报销金额',
    dataIndex: 'reimbursement',
    key: 'reimbursement',
    width: 120,
    sorter: (a, b) => a.reimbursement - b.reimbursement,
    align: 'right'
  },
  {
    title: '诊断代码',
    dataIndex: 'diagnosisCode',
    key: 'diagnosisCode',
    width: 100,
    sorter: (a, b) => a.diagnosisCode.localeCompare(b.diagnosisCode)
  },
  {
    title: '诊断名称',
    dataIndex: 'diagnosisName',
    key: 'diagnosisName',
    width: 150,
    sorter: (a, b) => a.diagnosisName.localeCompare(b.diagnosisName),
    ellipsis: true
  },
  {
    title: '结算日期',
    dataIndex: 'settlementDate',
    key: 'settlementDate',
    width: 110,
    sorter: (a, b) => new Date(a.settlementDate) - new Date(b.settlementDate)
  },
  {
    title: '参保单位',
    dataIndex: 'insuranceUnit',
    key: 'insuranceUnit',
    width: 150,
    sorter: (a, b) => a.insuranceUnit.localeCompare(b.insuranceUnit),
    ellipsis: true
  },
  {
    title: '险种类型',
    dataIndex: 'insuranceType',
    key: 'insuranceType',
    width: 100,
    sorter: (a, b) => a.insuranceType.localeCompare(b.insuranceType)
  }
];

// Pagination info
const paginationInfo = computed(() => {
  const total = props.dataSource.length;
  const start = total > 0 ? (currentPage.value - 1) * pageSize.value + 1 : 0;
  const end = Math.min(currentPage.value * pageSize.value, total);
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
  currentPage.value = page;
  pageSize.value = size;
  emit('page-change', page, size);
};

const handlePageSizeChange = (current, size) => {
  currentPage.value = 1;
  pageSize.value = size;
  emit('page-size-change', size);
};
</script>

<style scoped>
.filter-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.table-shadow {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
