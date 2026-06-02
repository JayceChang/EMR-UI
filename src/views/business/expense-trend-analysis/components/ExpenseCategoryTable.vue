<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-table text-teal-600 mr-2"></i>
      费用分类明细表
    </h3>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="paginationConfig"
      @change="handleTableChange"
      row-key="category"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'totalAmount'">
          <span class="font-semibold text-blue-600">
            {{ formatMoney(record.totalAmount) }}
          </span>
        </template>
        <template v-if="column.key === 'employeeAmount'">
          <span class="text-purple-600">
            {{ formatMoney(record.employeeAmount) }}
          </span>
        </template>
        <template v-if="column.key === 'residentAmount'">
          <span class="text-green-600">
            {{ formatMoney(record.residentAmount) }}
          </span>
        </template>
        <template v-if="column.key === 'growth'">
          <span :class="trendClass(record.growth)">
            <i v-if="hasTrendArrow(record.growth)" :class="['fas', trendArrowIcon(record.growth), 'mr-1']"></i>
            {{ Math.abs(record.growth).toFixed(2) }}%
          </span>
        </template>
        <template v-if="column.key === 'ratio'">
          <div class="flex items-center">
            <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
              <div class="bg-blue-500 h-2 rounded-full" :style="{ width: record.ratio + '%' }"></div>
            </div>
            <span class="text-sm text-gray-600">{{ record.ratio.toFixed(1) }}%</span>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    dataSource: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    pagination: {
      type: Object,
      default: () => ({
        current: 1,
        pageSize: 10,
        total: 0,
      }),
    },
  });

  const emit = defineEmits(['page-change']);

  // Table columns
  const columns = [
    {
      title: '费用分类',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      fixed: 'left',
    },
    {
      title: '总金额(万元)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: '职工医保(万元)',
      dataIndex: 'employeeAmount',
      key: 'employeeAmount',
      width: 150,
      sorter: (a, b) => a.employeeAmount - b.employeeAmount,
    },
    {
      title: '居民医保(万元)',
      dataIndex: 'residentAmount',
      key: 'residentAmount',
      width: 150,
      sorter: (a, b) => a.residentAmount - b.residentAmount,
    },
    {
      title: '同比增长',
      dataIndex: 'growth',
      key: 'growth',
      width: 120,
      sorter: (a, b) => a.growth - b.growth,
    },
    {
      title: '占比',
      dataIndex: 'ratio',
      key: 'ratio',
      width: 200,
      sorter: (a, b) => a.ratio - b.ratio,
    },
  ];

  // Pagination config
  const paginationConfig = computed(() => ({
    current: props.pagination.current,
    pageSize: props.pagination.pageSize,
    total: props.pagination.total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条记录`,
    pageSizeOptions: ['10', '20', '50', '100'],
  }));

  // Format money
  const formatMoney = (value) => {
    if (value === null || value === undefined) return '0.00';
    const wan = value / 10000;
    return wan.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Handle table change (pagination, sorting, filtering)
  const handleTableChange = (pag, filters, sorter) => {
    emit('page-change', {
      pageNum: pag.current,
      pageSize: pag.pageSize,
    });
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
    return num > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  };
</script>

<style scoped>
  /* Custom table styles */
  :deep(.ant-table) {
    font-size: 14px;
  }

  :deep(.ant-table-thead > tr > th) {
    background-color: #f3f4f6;
    font-weight: 600;
    color: #374151;
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background-color: #f9fafb;
  }
</style>
