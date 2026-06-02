<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">
      <i class="fas fa-table mr-2 text-green-500"></i>
      数据概览
    </h2>
    <div class="overflow-auto flex-1">
      <a-table
        :columns="columns"
        :data-source="data"
        :loading="loading"
        :pagination="paginationConfig"
        size="small"
        class="min-w-full shadow-sm rounded-lg"
        :row-key="(record) => record.name"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="text-sm font-medium text-gray-900">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'patients'">
            <span class="text-sm text-gray-900">{{ formatNumber(record.patients) }}</span>
          </template>
          <template v-else-if="column.key === 'patientsGrowth'">
            <span v-if="record.patientsGrowth != null" :class="trendClass(record.patientsGrowth)" class="text-sm flex items-center">
              <i v-if="hasTrendArrow(record.patientsGrowth)" :class="trendArrowIcon(record.patientsGrowth)" class="mr-1"></i>
              {{ formatGrowth(record.patientsGrowth) }}
            </span>
            <span v-else class="text-sm text-gray-400">--</span>
          </template>
          <template v-else-if="column.key === 'totalCost'">
            <span class="text-sm text-gray-900">{{ formatNumber(record.totalCost) }}</span>
          </template>
          <template v-else-if="column.key === 'costGrowth'">
            <span v-if="record.costGrowth != null" :class="trendClass(record.costGrowth)" class="text-sm flex items-center">
              <i v-if="hasTrendArrow(record.costGrowth)" :class="trendArrowIcon(record.costGrowth)" class="mr-1"></i>
              {{ formatGrowth(record.costGrowth) }}
            </span>
            <span v-else class="text-sm text-gray-400">--</span>
          </template>
          <template v-else-if="column.key === 'totalMedCost'">
            <span class="text-sm text-gray-900">{{ formatNumber(record.totalMedCost) }}</span>
          </template>
          <template v-else-if="column.key === 'medCostGrowth'">
            <span v-if="record.medCostGrowth != null" :class="trendClass(record.medCostGrowth)" class="text-sm flex items-center">
              <i v-if="hasTrendArrow(record.medCostGrowth)" :class="trendArrowIcon(record.medCostGrowth)" class="mr-1"></i>
              {{ formatGrowth(record.medCostGrowth) }}
            </span>
            <span v-else class="text-sm text-gray-400">--</span>
          </template>
          <template v-else-if="column.key === 'avgCost'">
            <span class="text-sm text-gray-900">{{ formatNumber(record.avgCost) }}</span>
          </template>
          <template v-else-if="column.key === 'avgCostGrowth'">
            <span v-if="record.avgCostGrowth != null" :class="trendClass(record.avgCostGrowth)" class="text-sm flex items-center">
              <i v-if="hasTrendArrow(record.avgCostGrowth)" :class="trendArrowIcon(record.avgCostGrowth)" class="mr-1"></i>
              {{ formatGrowth(record.avgCostGrowth) }}
            </span>
            <span v-else class="text-sm text-gray-400">--</span>
          </template>
          <template v-else-if="column.key === 'avgMedCost'">
            <span class="text-sm text-gray-900">{{ formatNumber(record.avgMedCost) }}</span>
          </template>
          <template v-else-if="column.key === 'avgMedCostGrowth'">
            <span v-if="record.avgMedCostGrowth != null" :class="trendClass(record.avgMedCostGrowth)" class="text-sm flex items-center">
              <i v-if="hasTrendArrow(record.avgMedCostGrowth)" :class="trendArrowIcon(record.avgMedCostGrowth)" class="mr-1"></i>
              {{ formatGrowth(record.avgMedCostGrowth) }}
            </span>
            <span v-else class="text-sm text-gray-400">--</span>
          </template>
          <template v-else-if="column.key === 'avgDays'">
            <span class="text-sm text-gray-900">{{ formatDays(record.avgDays) }}</span>
          </template>
          <template v-else-if="column.key === 'avgDaysGrowth'">
            <span v-if="record.avgDaysGrowth != null" :class="trendClass(record.avgDaysGrowth)" class="text-sm flex items-center">
              <i v-if="hasTrendArrow(record.avgDaysGrowth)" :class="trendArrowIcon(record.avgDaysGrowth)" class="mr-1"></i>
              {{ formatGrowth(record.avgDaysGrowth) }}
            </span>
            <span v-else class="text-sm text-gray-400">--</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="handleViewDetail(record)">
              <i class="fas fa-info-circle mr-1"></i>
              下钻详情
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    data: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    analysisType: {
      type: String,
      default: 'icd10Category',
    },
    pagination: {
      type: Object,
      default: () => ({
        pageNum: 1,
        pageSize: 10,
        total: 0,
      }),
    },
  });

  const emit = defineEmits(['view-detail', 'page-change']);

  // 分页配置
  const paginationConfig = computed(() => ({
    current: props.pagination.pageNum,
    pageSize: props.pagination.pageSize,
    total: props.pagination.total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100'],
  }));

  // 处理表格变化（分页、排序等）
  const handleTableChange = (paginationInfo) => {
    emit('page-change', {
      pageNum: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    });
  };

  // Table columns
  const columns = [
    {
      title: 'ICD10 类目',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '住院人次',
      dataIndex: 'patients',
      key: 'patients',
      width: 120,
      sorter: (a, b) => (a.patients ?? 0) - (b.patients ?? 0),
    },
    /* {
    title: '人次增幅',
    dataIndex: 'patientsGrowth',
    key: 'patientsGrowth',
    width: 120
  }, */
    {
      title: '总费用 (元)',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 140,
      sorter: (a, b) => (a.totalCost ?? 0) - (b.totalCost ?? 0),
    },
    /* {
    title: '费用增幅',
    dataIndex: 'costGrowth',
    key: 'costGrowth',
    width: 120
  }, */
    {
      title: '统筹总费用 (元)',
      dataIndex: 'totalMedCost',
      key: 'totalMedCost',
      width: 150,
      sorter: (a, b) => (a.totalMedCost ?? 0) - (b.totalMedCost ?? 0),
    },
    /* {
    title: '统筹费用增幅',
    dataIndex: 'medCostGrowth',
    key: 'medCostGrowth',
    width: 140
  }, */
    {
      title: '次均费用 (元)',
      dataIndex: 'avgCost',
      key: 'avgCost',
      width: 140,
      sorter: (a, b) => (a.avgCost ?? 0) - (b.avgCost ?? 0),
    },
    /* {
    title: '次均费用增幅',
    dataIndex: 'avgCostGrowth',
    key: 'avgCostGrowth',
    width: 140
  }, */
    {
      title: '次均统筹费用 (元)',
      dataIndex: 'avgMedCost',
      key: 'avgMedCost',
      width: 160,
      sorter: (a, b) => (a.avgMedCost ?? 0) - (b.avgMedCost ?? 0),
    },
    /* {
    title: '次均统筹费用增幅',
    dataIndex: 'avgMedCostGrowth',
    key: 'avgMedCostGrowth',
    width: 160
  }, */
    {
      title: '次均住院日 (天)',
      dataIndex: 'avgDays',
      key: 'avgDays',
      width: 140,
      sorter: (a, b) => (a.avgDays ?? 0) - (b.avgDays ?? 0),
    },
    /* {
    title: '住院日增幅',
    dataIndex: 'avgDaysGrowth',
    key: 'avgDaysGrowth',
    width: 120
  }, */
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      align: 'center',
    },
  ];

  // Format number
  const formatNumber = (num) => {
    // 若num为null/undefined，赋值为0，否则保留原值
    const value = num ?? 0;
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Format growth rate (增长率格式化，处理null值)
  const formatGrowth = (value) => {
    if (value == null) return '--';
    return (value * 100).toFixed(2) + '%';
  };

  // Format days (住院日格式化，处理null值)
  const formatDays = (value) => {
    if (value == null) return '--';
    return value.toFixed(2);
  };

  const trendClass = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num) || num === 0) return '';
    return num > 0 ? 'text-red-600' : 'text-green-600';
  };

  const hasTrendArrow = (value) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) && Math.abs(num) >= 0.005;
  };

  const trendArrowIcon = (value) => {
    const num = Number(value ?? 0);
    return num > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  };

  // Handle view detail
  const handleViewDetail = (record) => {
    emit('view-detail', record);
  };
</script>

<style scoped>
  :deep(.ant-table-tbody > tr:hover) {
    background-color: #f5f5f5;
  }
</style>
