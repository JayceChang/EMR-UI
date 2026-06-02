<template>
  <div class="overflow-x-auto scrollbar-hide">
    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      :pagination="{ pageSize: 5 }"
      size="small"
      class="min-w-full"
      :row-key="(record) => record.name"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <div>
            <p class="font-medium">{{ record.name }}</p>
            <p class="text-xs text-gray-500">{{ record.code }}</p>
          </div>
        </template>
        <template v-else-if="column.key === 'admissionCount'">
          <div>
            <p class="font-medium">{{ record.admissionCount.toLocaleString() }}</p>
          </div>
        </template>
        <template v-else-if="column.key === 'admissionGrowth'">
          <div class="space-y-1">
            <p class="text-xs flex items-center" :class="trendClass(record.admissionCountYoy)">
              <i v-if="hasTrendArrow(record.admissionCountYoy)" :class="trendArrowIcon(record.admissionCountYoy)" class="mr-1"></i>
              {{ record.admissionCountYoy.toFixed(1) }}% <span class="text-gray-500 ml-1">(同比)</span>
            </p>
            <p class="text-xs flex items-center" :class="trendClass(record.admissionCountMom)">
              <i v-if="hasTrendArrow(record.admissionCountMom)" :class="trendArrowIcon(record.admissionCountMom)" class="mr-1"></i>
              {{ Math.abs(record.admissionCountMom).toFixed(1) }}% <span class="text-gray-500 ml-1">(环比)</span>
            </p>
          </div>
        </template>
        <template v-else-if="column.key === 'avgCost'">
          <div>
            <p class="font-medium">¥{{ record.avgCost.toLocaleString() }}</p>
          </div>
        </template>
        <template v-else-if="column.key === 'avgCostGrowth'">
          <div class="space-y-1">
            <p class="text-xs flex items-center" :class="trendClass(record.avgCostYoy)">
              <i v-if="hasTrendArrow(record.avgCostYoy)" :class="trendArrowIcon(record.avgCostYoy)" class="mr-1"></i>
              {{ Math.abs(record.avgCostYoy).toFixed(1) }}% <span class="text-gray-500 ml-1">(同比)</span>
            </p>
            <p class="text-xs flex items-center" :class="trendClass(record.avgCostMom)">
              <i v-if="hasTrendArrow(record.avgCostMom)" :class="trendArrowIcon(record.avgCostMom)" class="mr-1"></i>
              {{ Math.abs(record.avgCostMom).toFixed(1) }}% <span class="text-gray-500 ml-1">(环比)</span>
            </p>
          </div>
        </template>
        <template v-else-if="column.key === 'avgReimbursement'">
          <div>
            <p class="font-medium">¥{{ record.avgReimbursement.toLocaleString() }}</p>
          </div>
        </template>
        <template v-else-if="column.key === 'reimbursementRate'">
          <div>
            <p class="font-medium">{{ record.reimbursementRate.toFixed(1) }}%</p>
          </div>
        </template>
        <template v-else-if="column.key === 'avgLengthOfStay'">
          <div>
            <p class="font-medium">{{ record.avgLengthOfStay.toFixed(1) }}</p>
          </div>
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

  // Table columns
  const columns = [
    {
      title: '病种名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '住院人次',
      dataIndex: 'admissionCount',
      key: 'admissionCount',
      width: 120,
      sorter: (a, b) => a.admissionCount - b.admissionCount,
    },
    {
      title: '住院人次同比环比',
      key: 'admissionGrowth',
      width: 160,
    },
    {
      title: '次均费用',
      dataIndex: 'avgCost',
      key: 'avgCost',
      width: 140,
      sorter: (a, b) => a.avgCost - b.avgCost,
    },
    {
      title: '次均费用同比环比',
      key: 'avgCostGrowth',
      width: 160,
    },
    {
      title: '次均统筹',
      dataIndex: 'avgReimbursement',
      key: 'avgReimbursement',
      width: 140,
      sorter: (a, b) => a.avgReimbursement - b.avgReimbursement,
    },
    {
      title: '报销比例',
      dataIndex: 'reimbursementRate',
      key: 'reimbursementRate',
      width: 140,
      sorter: (a, b) => a.reimbursementRate - b.reimbursementRate,
    },
    {
      title: '次均住院日',
      dataIndex: 'avgLengthOfStay',
      key: 'avgLengthOfStay',
      width: 140,
      sorter: (a, b) => a.avgLengthOfStay - b.avgLengthOfStay,
    },
  ];

  const trendClass = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num) || num === 0) return '';
    return num > 0 ? 'text-red-500' : 'text-green-500';
  };

  const hasTrendArrow = (value) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) && Math.abs(num) >= 0.005;
  };

  const trendArrowIcon = (value) => {
    const num = Number(value ?? 0);
    return num > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  };
</script>

<style scoped>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  :deep(.ant-table-tbody > tr:hover) {
    background-color: #f5f5f5;
  }
</style>
