<template>
  <div class="overflow-x-auto">
    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      :pagination="false"
      size="small"
      class="min-w-full"
      :row-key="(record) => record.county"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'county'">
          <span class="text-sm font-medium text-gray-900">{{ record.county }}</span>
        </template>
        <template v-else-if="column.key === 'transfers'">
          <span class="text-sm text-gray-900">{{ record.transfers.toLocaleString() }}</span>
        </template>
        <template v-else-if="column.key === 'totalCost'">
          <span class="text-sm text-gray-900">¥{{ record.totalCost.toLocaleString() }}</span>
        </template>
        <template v-else-if="column.key === 'totalCoordinationCost'">
          <span class="text-sm text-gray-900">¥{{ record.totalCoordinationCost.toLocaleString() }}</span>
        </template>
        <template v-else-if="column.key === 'avgCost'">
          <span class="text-sm text-gray-900">¥{{ record.avgCost.toLocaleString() }}</span>
        </template>
        <template v-else-if="column.key === 'avgCoordinationCost'">
          <span class="text-sm text-gray-900">¥{{ record.avgCoordinationCost.toLocaleString() }}</span>
        </template>
        <template v-else-if="column.key === 'avgDays'">
          <span class="text-sm text-gray-900">{{ record.avgDays.toFixed(1) }}</span>
        </template>
        <template v-else-if="column.key === 'growth'">
          <span :class="trendClass(record.growth)" class="text-sm flex items-center">
            <i v-if="hasTrendArrow(record.growth)" :class="trendArrowIcon(record.growth)" class="mr-1"></i>
            {{ record.growth.toFixed(1) }}%
          </span>
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
  defineProps({
    data: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['drill-down']);

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

  // Table columns
  const columns = [
    {
      title: '县区',
      dataIndex: 'county',
      key: 'county',
      width: 120,
      fixed: 'left',
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
      title: '总统筹支出 (¥)',
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
      title: '次均统筹支出 (¥)',
      dataIndex: 'avgCoordinationCost',
      key: 'avgCoordinationCost',
      width: 150,
      sorter: (a, b) => a.avgCoordinationCost - b.avgCoordinationCost,
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
      title: '同比增幅 (%)',
      dataIndex: 'growth',
      key: 'growth',
      width: 120,
      sorter: (a, b) => a.growth - b.growth,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      align: 'center',
    },
  ];

  const handleDrillDown = (record) => {
    emit('drill-down', {
      scene: 'region',
      title: `县区下钻 - ${record.county}`,
      regionName: record.county,
      sourceRecord: record,
    });
  };
</script>

<style scoped>
  :deep(.ant-table-tbody > tr:hover) {
    background-color: #f5f5f5;
  }
</style>
