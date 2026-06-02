<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">
      <i class="fas fa-exchange-alt mr-2 text-orange-500"></i>
      外转患者分析
    </h2>
    <div class="overflow-auto flex-1">
      <a-table
        :columns="columns"
        :data-source="data"
        :loading="loading"
        :pagination="false"
        size="small"
        class="min-w-full shadow-sm rounded-lg"
        :row-key="(record) => record.name"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="text-sm font-medium text-gray-900">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'patients'">
            <span class="text-sm text-gray-900">{{ record.patients.toLocaleString() }}</span>
          </template>
          <template v-else-if="column.key === 'patientsGrowth'">
            <span :class="trendClass(record.patientsGrowth)" class="text-sm flex items-center">
              <i v-if="hasTrendArrow(record.patientsGrowth)" :class="trendArrowIcon(record.patientsGrowth)" class="mr-1"></i>
              {{ (record.patientsGrowth * 100).toFixed(2) }}%
            </span>
          </template>
          <template v-else-if="column.key === 'totalCost'">
            <span class="text-sm text-gray-900">{{ formatNumber(record.totalCost) }}</span>
          </template>
          <template v-else-if="column.key === 'costGrowth'">
            <span :class="trendClass(record.costGrowth)" class="text-sm flex items-center">
              <i v-if="hasTrendArrow(record.costGrowth)" :class="trendArrowIcon(record.costGrowth)" class="mr-1"></i>
              {{ (record.costGrowth * 100).toFixed(2) }}%
            </span>
          </template>
          <template v-else-if="column.key === 'totalMedCost'">
            <span class="text-sm text-gray-900">{{ formatNumber(record.totalMedCost) }}</span>
          </template>
          <template v-else-if="column.key === 'medCostGrowth'">
            <span :class="trendClass(record.medCostGrowth)" class="text-sm flex items-center">
              <i v-if="hasTrendArrow(record.medCostGrowth)" :class="trendArrowIcon(record.medCostGrowth)" class="mr-1"></i>
              {{ (record.medCostGrowth * 100).toFixed(2) }}%
            </span>
          </template>
          <template v-else-if="column.key === 'avgCost'">
            <span class="text-sm text-gray-900">{{ formatNumber(record.avgCost) }}</span>
          </template>
          <template v-else-if="column.key === 'avgCostGrowth'">
            <span :class="trendClass(record.avgCostGrowth)" class="text-sm flex items-center">
              <i v-if="hasTrendArrow(record.avgCostGrowth)" :class="trendArrowIcon(record.avgCostGrowth)" class="mr-1"></i>
              {{ (record.avgCostGrowth * 100).toFixed(2) }}%
            </span>
          </template>
          <template v-else-if="column.key === 'avgMedCost'">
            <span class="text-sm text-gray-900">{{ formatNumber(record.avgMedCost) }}</span>
          </template>
          <template v-else-if="column.key === 'avgMedCostGrowth'">
            <span :class="trendClass(record.avgMedCostGrowth)" class="text-sm flex items-center">
              <i v-if="hasTrendArrow(record.avgMedCostGrowth)" :class="trendArrowIcon(record.avgMedCostGrowth)" class="mr-1"></i>
              {{ (record.avgMedCostGrowth * 100).toFixed(2) }}%
            </span>
          </template>
          <template v-else-if="column.key === 'avgDays'">
            <span class="text-sm text-gray-900">{{ record.avgDays.toFixed(2) }}</span>
          </template>
          <template v-else-if="column.key === 'avgDaysGrowth'">
            <span :class="trendClass(record.avgDaysGrowth)" class="text-sm flex items-center">
              <i v-if="hasTrendArrow(record.avgDaysGrowth)" :class="trendArrowIcon(record.avgDaysGrowth)" class="mr-1"></i>
              {{ (record.avgDaysGrowth * 100).toFixed(2) }}%
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="handleViewDetail(record)">
              <i class="fas fa-info-circle mr-1"></i>
              详情
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
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
  });

  const emit = defineEmits(['view-detail']);

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
      title: '外转人次',
      dataIndex: 'patients',
      key: 'patients',
      width: 120,
      sorter: (a, b) => a.patients - b.patients,
    },
    {
      title: '人次增幅',
      dataIndex: 'patientsGrowth',
      key: 'patientsGrowth',
      width: 120,
    },
    {
      title: '总费用 (元)',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 140,
      sorter: (a, b) => a.totalCost - b.totalCost,
    },
    {
      title: '费用增幅',
      dataIndex: 'costGrowth',
      key: 'costGrowth',
      width: 120,
    },
    {
      title: '统筹总费用 (元)',
      dataIndex: 'totalMedCost',
      key: 'totalMedCost',
      width: 150,
      sorter: (a, b) => a.totalMedCost - b.totalMedCost,
    },
    {
      title: '统筹费用增幅',
      dataIndex: 'medCostGrowth',
      key: 'medCostGrowth',
      width: 140,
    },
    {
      title: '次均费用 (元)',
      dataIndex: 'avgCost',
      key: 'avgCost',
      width: 140,
      sorter: (a, b) => a.avgCost - b.avgCost,
    },
    {
      title: '次均费用增幅',
      dataIndex: 'avgCostGrowth',
      key: 'avgCostGrowth',
      width: 140,
    },
    {
      title: '次均统筹费用 (元)',
      dataIndex: 'avgMedCost',
      key: 'avgMedCost',
      width: 160,
      sorter: (a, b) => a.avgMedCost - b.avgMedCost,
    },
    {
      title: '次均统筹费用增幅',
      dataIndex: 'avgMedCostGrowth',
      key: 'avgMedCostGrowth',
      width: 160,
    },
    {
      title: '次均住院日 (天)',
      dataIndex: 'avgDays',
      key: 'avgDays',
      width: 140,
      sorter: (a, b) => a.avgDays - b.avgDays,
    },
    {
      title: '住院日增幅',
      dataIndex: 'avgDaysGrowth',
      key: 'avgDaysGrowth',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      align: 'center',
    },
  ];

  // Format number
  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Handle view detail
  const handleViewDetail = (record) => {
    emit('view-detail', record.name);
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
</script>

<style scoped>
  :deep(.ant-table-tbody > tr:hover) {
    background-color: #f5f5f5;
  }
</style>
