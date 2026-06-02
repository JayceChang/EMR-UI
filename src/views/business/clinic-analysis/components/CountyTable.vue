<template>
  <div class="overflow-y-auto max-h-96">
    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="false"
      size="small"
      class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm"
      :row-key="(record) => record.name"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <span class="font-medium text-primary cursor-pointer hover:underline" @click="handleRowClick(record)">
            {{ record.name }}
          </span>
        </template>
        <template v-else-if="column.key === 'visits'">
          <span class="text-gray-700">{{ record.visits }}</span>
        </template>
        <template v-else-if="column.key === 'totalCost'">
          <span class="text-gray-700">{{ record.totalCost }}万</span>
        </template>
        <template v-else-if="column.key === 'totalReimbursement'">
          <span class="text-gray-700">{{ record.totalReimbursement }}万</span>
        </template>
        <template v-else-if="column.key === 'avgCost'">
          <span class="text-gray-700">{{ record.avgCost }}</span>
        </template>
        <template v-else-if="column.key === 'avgReimbursement'">
          <span class="text-gray-700">{{ record.avgReimbursement }}</span>
        </template>
        <template v-else-if="column.key === 'yoyGrowth'">
          <span :class="trendClass(record.yoyGrowth)">
            {{ record.yoyGrowth }}
          </span>
        </template>
      </template>
    </a-table>
  </div>
  <a-button type="primary" class="mt-4 w-full bg-cyan-600 border-cyan-600 hover:bg-cyan-700" @click="handleDrillDown">
    下钻分析
    <i class="fas fa-search-plus ml-2"></i>
  </a-button>
</template>

<script setup>
  const props = defineProps({
    data: {
      type: Array,
      default: () => [],
    },
  });

  const emit = defineEmits(['drill-down']);

  const trendClass = (text) => {
    const value = String(text || '').trim();
    if (!value || value === '--' || value === '0%' || value === '0.0%' || value === '0.00%') {
      return '';
    }
    if (value.includes('↑') || value.startsWith('+')) {
      return 'text-red-600';
    }
    if (value.includes('↓') || value.startsWith('-')) {
      return 'text-green-600';
    }
    return '';
  };

  // Table columns
  const columns = [
    { title: '县区', dataIndex: 'name', key: 'name' },
    { title: '人次', dataIndex: 'visits', key: 'visits' },
    { title: '总费用', dataIndex: 'totalCost', key: 'totalCost' },
    { title: '统筹花费', dataIndex: 'totalReimbursement', key: 'totalReimbursement' },
    { title: '次均费用', dataIndex: 'avgCost', key: 'avgCost' },
    { title: '平均报销', dataIndex: 'avgReimbursement', key: 'avgReimbursement' },
    { title: '同比增幅', dataIndex: 'yoyGrowth', key: 'yoyGrowth' },
  ];

  // Event handlers
  const handleRowClick = (record) => {
    emit('drill-down', {
      source: 'county',
      mode: 'row',
      countyName: record?.name || '',
    });
  };

  const handleDrillDown = () => {
    emit('drill-down', {
      source: 'county',
      mode: 'all',
    });
  };
</script>

<style scoped>
  :deep(.ant-table-row) {
    cursor: pointer;
  }
  :deep(.ant-table-row:hover) {
    background-color: #f5f5f5;
  }
</style>
