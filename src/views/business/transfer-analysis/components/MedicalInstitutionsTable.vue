<template>
  <div class="overflow-x-auto">
    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      :pagination="paginationConfig"
      size="small"
      class="min-w-full"
      :row-key="(record) => record.name"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <span class="text-sm font-medium text-gray-900">{{ record.name }}</span>
        </template>
        <template v-else-if="column.key === 'transfers'">
          <span class="text-sm text-gray-900">{{ record.transfers?.toLocaleString() || 0 }}</span>
        </template>
        <template v-else-if="column.key === 'totalCost'">
          <span class="text-sm text-gray-900">¥{{ record.totalCost?.toLocaleString() || 0 }}</span>
        </template>
        <template v-else-if="column.key === 'totalCoordinationCost'">
          <span class="text-sm text-gray-900">¥{{ record.totalCoordinationCost?.toLocaleString() || 0 }}</span>
        </template>
        <template v-else-if="column.key === 'avgCost'">
          <span class="text-sm text-gray-900">¥{{ record.avgCost?.toLocaleString() || 0 }}</span>
        </template>
        <template v-else-if="column.key === 'avgDays'">
          <span class="text-sm text-gray-900">{{ record.avgDays?.toFixed(1) || '0.0' }}</span>
        </template>
        <template v-else-if="column.key === 'avgCoordinationCost'">
          <span class="text-sm text-gray-900">¥{{ record.avgCoordinationCost?.toLocaleString() || 0 }}</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button type="link" size="small" @click="handleDrillDown(record)">
            <i class="fas fa-search mr-1"></i>
            下钻分析
          </a-button>
        </template>
      </template>
    </a-table>
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
    pagination: {
      type: Object,
      default: () => ({
        current: 1,
        pageSize: 10,
        total: 0,
      }),
    },
  });

  const emit = defineEmits(['drill-down', 'page-change']);

  // 分页配置
  const paginationConfig = computed(() => ({
    current: props.pagination.current,
    pageSize: props.pagination.pageSize,
    total: props.pagination.total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条记录`,
    pageSizeOptions: ['10', '20', '50', '100'],
  }));

  // Table columns
  const columns = [
    {
      title: '医疗机构',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '人次数',
      dataIndex: 'transfers',
      key: 'transfers',
      width: 120,
      sorter: (a, b) => a.transfers - b.transfers,
    },
    {
      title: '总费用 (¥)',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 150,
      sorter: (a, b) => a.totalCost - b.totalCost,
      align: 'right',
    },
    {
      title: '总统筹费用 (¥)',
      dataIndex: 'totalCoordinationCost',
      key: 'totalCoordinationCost',
      width: 150,
      sorter: (a, b) => a.totalCoordinationCost - b.totalCoordinationCost,
      align: 'right',
    },
    {
      title: '次均费用 (¥)',
      dataIndex: 'avgCost',
      key: 'avgCost',
      width: 130,
      sorter: (a, b) => a.avgCost - b.avgCost,
      align: 'right',
    },
    {
      title: '次均住院日 (天)',
      dataIndex: 'avgDays',
      key: 'avgDays',
      width: 130,
      sorter: (a, b) => a.avgDays - b.avgDays,
      align: 'right',
    },
    {
      title: '次均统筹费用 (¥)',
      dataIndex: 'avgCoordinationCost',
      key: 'avgCoordinationCost',
      width: 150,
      sorter: (a, b) => a.avgCoordinationCost - b.avgCoordinationCost,
      align: 'right',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      align: 'center',
    },
  ];

  // 处理表格变化（分页、排序等）
  const handleTableChange = (pagination) => {
    emit('page-change', {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const handleDrillDown = (record) => {
    emit('drill-down', {
      scene: 'institution',
      title: `医疗机构下钻 - ${record.name}`,
      institutionName: record.name,
      sourceRecord: record,
    });
  };
</script>

<style scoped>
  :deep(.ant-table-tbody > tr:hover) {
    background-color: #f5f5f5;
  }
</style>
