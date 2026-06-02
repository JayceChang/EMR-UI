<template>
  <div class="overflow-x-auto scrollbar-hide">
    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      :pagination="{ pageSize: 5 }"
      size="small"
      class="min-w-full"
      :row-key="(record) => record.district"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'district'">
          <div>
            <p class="font-medium">{{ record.district }}</p>
            <p class="text-xs text-gray-500">{{ record.type }}</p>
          </div>
        </template>
        <template v-else-if="column.key === 'admissionCount'">
          <div>
            <p class="font-medium">{{ record.admissionCount.toLocaleString() }}</p>
            <p class="text-xs flex items-center" :class="trendClass(record.admissionCountYoy)">
              <i v-if="hasTrendArrow(record.admissionCountYoy)" :class="trendArrowIcon(record.admissionCountYoy)" class="mr-1"></i>
              {{ Math.abs(record.admissionCountYoy).toFixed(1) }}% <span class="text-gray-500 ml-1">(同比)</span>
            </p>
          </div>
        </template>
        <template v-else-if="column.key === 'avgCost'">
          <div>
            <p class="font-medium">¥{{ record.avgCost.toLocaleString() }}</p>
            <p class="text-xs flex items-center" :class="trendClass(record.avgCostYoy)">
              <i v-if="hasTrendArrow(record.avgCostYoy)" :class="trendArrowIcon(record.avgCostYoy)" class="mr-1"></i>
              {{ Math.abs(record.avgCostYoy).toFixed(1) }}% <span class="text-gray-500 ml-1">(同比)</span>
              <span class="mx-1">|</span>
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
            <p class="text-xs flex items-center" :class="trendClass(record.reimbursementRateYoy)">
              <i v-if="hasTrendArrow(record.reimbursementRateYoy)" :class="trendArrowIcon(record.reimbursementRateYoy)" class="mr-1"></i>
              {{ record.reimbursementRateYoy.toFixed(1) }}% <span class="text-gray-500 ml-1">(同比)</span>
              <span class="mx-1">|</span>
              <i v-if="hasTrendArrow(record.reimbursementRateMom)" :class="trendArrowIcon(record.reimbursementRateMom)" class="mr-1"></i>
              {{ record.reimbursementRateMom?.toFixed(1) }}% <span class="text-gray-500 ml-1">(环比)</span>
            </p>
          </div>
        </template>
        <template v-else-if="column.key === 'transferRate'">
          <div>
            <p class="font-medium">{{ record.transferRate.toFixed(1) }}%</p>
            <p class="text-xs flex items-center" :class="trendClass(record.transferRateYoy)">
              <i v-if="hasTrendArrow(record.transferRateYoy)" :class="trendArrowIcon(record.transferRateYoy)" class="mr-1"></i>
              {{ Math.abs(record.transferRateYoy).toFixed(1) }}% <span class="text-gray-500 ml-1">(同比)</span>
              <span class="mx-1">|</span>
              <i v-if="hasTrendArrow(record.transferRateMom)" :class="trendArrowIcon(record.transferRateMom)" class="mr-1"></i>
              {{ Math.abs(record.transferRateMom).toFixed(1) }}% <span class="text-gray-500 ml-1">(环比)</span>
            </p>
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
      title: '区县',
      dataIndex: 'district',
      key: 'district',
      width: 160,
      sorter: (a, b) => a.district.localeCompare(b.district),
    },
    {
      title: '住院人次',
      dataIndex: 'admissionCount',
      key: 'admissionCount',
      width: 120,
      sorter: (a, b) => a.admissionCount - b.admissionCount,
    },
    {
      title: '次均费用',
      dataIndex: 'avgCost',
      key: 'avgCost',
      width: 140,
      sorter: (a, b) => a.avgCost - b.avgCost,
    },
    {
      title: '次均统筹',
      dataIndex: 'avgReimbursement',
      key: 'avgReimbursement',
      width: 120,
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
      title: '外转率',
      dataIndex: 'transferRate',
      key: 'transferRate',
      width: 140,
      sorter: (a, b) => a.transferRate - b.transferRate,
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
