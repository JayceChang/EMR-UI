<template>
  <div class="bg-white rounded-xl p-5 table-shadow w-full lg:w-full overflow-x-auto">
    <!-- 结果统计和操作区 -->
    <div class="flex bg-white flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div class="flex items-center space-x-4">
        <h2 class="text-xl font-semibold">门诊明细数据</h2>
        <span class="bg-blue-50 text-primary px-3 py-1 rounded-full text-sm font-medium">
          共 {{ totalCount }} 条记录
        </span>
      </div>
      <div class="flex items-center space-x-3 w-full sm:w-auto">
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
    </div>

    <!-- 表格区域 -->
    <div class="overflow-x-auto scrollbar-hide">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
        :row-key="(record) => record.idCard + record.settlementDate"
        size="small"
        class="min-w-full"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'idCard'">
            <span class="font-mono text-sm">{{ record.idCard }}</span>
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

          <template v-else-if="column.key === 'settlementDate'">
            <span class="text-gray-600">{{ record.settlementDate }}</span>
          </template>

          <template v-else-if="column.key === 'hospital'">
            <span class="text-gray-800">{{ record.hospital }}</span>
          </template>

          <template v-else-if="column.key === 'totalAmount'">
            <span class="font-semibold text-red-600">¥{{ record.totalAmount.toFixed(2) }}</span>
          </template>

          <template v-else-if="column.key === 'poolPayment'">
            <span class="font-semibold text-green-600">¥{{ record.poolPayment.toFixed(2) }}</span>
          </template>

          <template v-else-if="column.key === 'accountPayment'">
            <span class="font-semibold text-blue-600">¥{{ record.accountPayment.toFixed(2) }}</span>
          </template>

          <template v-else-if="column.key === 'insuranceType'">
            <a-tag :color="record.insuranceType === '职工' ? 'gold' : 'cyan'">
              {{ record.insuranceType }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'medicalType'">
            <a-tag :color="getMedicalTypeColor(record.medicalType)">
              {{ record.medicalType }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'insuranceUnit'">
            <span class="text-gray-600">{{ record.insuranceUnit }}</span>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 分页控件 -->
    <div class="px-5 py-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
const searchKeywordLocal = ref(props.searchKeyword);

// Watch for prop changes
watch(() => props.pagination, (newVal) => {
  currentPage.value = newVal.current;
  pageSize.value = newVal.pageSize;
}, { deep: true });

watch(() => props.searchKeyword, (newVal) => {
  searchKeywordLocal.value = newVal;
});

// Get medical type color
const getMedicalTypeColor = (type) => {
  const colorMap = {
    '普通': 'default',
    '慢病': 'green',
    '门特': 'orange',
    '急诊': 'red',
    '住院': 'purple'
  };
  return colorMap[type] || 'default';
};

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
    title: '结算日期',
    dataIndex: 'settlementDate',
    key: 'settlementDate',
    width: 110,
    sorter: (a, b) => new Date(a.settlementDate) - new Date(b.settlementDate)
  },
  {
    title: '结算单位',
    dataIndex: 'hospital',
    key: 'hospital',
    width: 180,
    sorter: (a, b) => a.hospital.localeCompare(b.hospital),
    ellipsis: true
  },
  {
    title: '总金额',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    width: 120,
    sorter: (a, b) => a.totalAmount - b.totalAmount,
    align: 'right'
  },
  {
    title: '统筹支付',
    dataIndex: 'poolPayment',
    key: 'poolPayment',
    width: 120,
    sorter: (a, b) => a.poolPayment - b.poolPayment,
    align: 'right'
  },
  {
    title: '账户支付',
    dataIndex: 'accountPayment',
    key: 'accountPayment',
    width: 120,
    sorter: (a, b) => a.accountPayment - b.accountPayment,
    align: 'right'
  },
  {
    title: '险种',
    dataIndex: 'insuranceType',
    key: 'insuranceType',
    width: 100,
    sorter: (a, b) => a.insuranceType.localeCompare(b.insuranceType)
  },
  {
    title: '医疗类别',
    dataIndex: 'medicalType',
    key: 'medicalType',
    width: 100,
    sorter: (a, b) => a.medicalType.localeCompare(b.medicalType)
  },
  {
    title: '参保单位',
    dataIndex: 'insuranceUnit',
    key: 'insuranceUnit',
    width: 180,
    sorter: (a, b) => a.insuranceUnit.localeCompare(b.insuranceUnit),
    ellipsis: true
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
