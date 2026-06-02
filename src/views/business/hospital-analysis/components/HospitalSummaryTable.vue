<template>
  <div class="bg-white rounded-xl p-5 shadow-md overflow-hidden">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
      <h3 class="text-lg font-semibold flex items-center">
        <i class="fas fa-hospital text-blue-600 mr-2"></i>
        住院数据按医疗机构汇总
      </h3>
      <div class="flex flex-wrap gap-2 mt-3 sm:mt-0">
        <a-input-search v-model:value="searchText" placeholder="搜索医疗机构..." style="width: 200px" @search="handleSearch" />
      </div>
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredData"
      :pagination="pagination"
      :loading="loading"
      size="small"
      :row-key="(record) => record.hospitalName"
      :scroll="{ x: 1000 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'hospitalName'">
          <div class="flex items-center cursor-pointer" @click="handleRowClick(record)">
            <div class="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center mr-3 shrink-0">
              <i class="fas fa-hospital text-sm"></i>
            </div>
            <div>
              <p class="font-medium">{{ record.hospitalName }}</p>
              <p class="text-xs text-gray-500">{{ record.hospitalLevel }}</p>
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'admissionCount'">
          <p class="font-medium">{{ formatNumber(record.admissionCount) }}</p>
        </template>
        <template v-else-if="column.key === 'admissionYoyMom'">
          <div class="space-y-1">
            <p class="text-xs flex items-center" :class="trendClass(record.admissionYoy)">
              <i v-if="hasTrendArrow(record.admissionYoy)" :class="trendArrowIcon(record.admissionYoy)" class="mr-1"></i>
              {{ Math.abs(record.admissionYoy) }}%
              <span class="text-gray-500 ml-1">(同比)</span>
            </p>
            <p class="text-xs flex items-center" :class="trendClass(record.admissionMom)">
              <i v-if="hasTrendArrow(record.admissionMom)" :class="trendArrowIcon(record.admissionMom)" class="mr-1"></i>
              {{ Math.abs(record.admissionMom) }}%
              <span class="text-gray-500 ml-1">(环比)</span>
            </p>
          </div>
        </template>
        <template v-else-if="column.key === 'avgCost'">
          <p class="font-medium">{{ formatCurrency(record.avgCost) }}</p>
        </template>
        <template v-else-if="column.key === 'avgCostYoyMom'">
          <div class="space-y-1">
            <p class="text-xs flex items-center" :class="trendClass(record.avgCostYoy)">
              <i v-if="hasTrendArrow(record.avgCostYoy)" :class="trendArrowIcon(record.avgCostYoy)" class="mr-1"></i>
              {{ Math.abs(record.avgCostYoy) }}%
              <span class="text-gray-500 ml-1">(同比)</span>
            </p>
            <p class="text-xs flex items-center" :class="trendClass(record.avgCostMom)">
              <i v-if="hasTrendArrow(record.avgCostMom)" :class="trendArrowIcon(record.avgCostMom)" class="mr-1"></i>
              {{ Math.abs(record.avgCostMom) }}%
              <span class="text-gray-500 ml-1">(环比)</span>
            </p>
          </div>
        </template>
        <template v-else-if="column.key === 'reimbursementRate'">
          <p class="font-medium">{{ record.reimbursementRate }}%</p>
        </template>
        <template v-else-if="column.key === 'avgLengthOfStay'">
          <p class="font-medium">{{ record.avgLengthOfStay }}</p>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  const props = defineProps({
    data: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['row-click', 'drill-down']);

  const searchText = ref('');

  const columns = [
    { title: '医疗机构名称', dataIndex: 'hospitalName', key: 'hospitalName', width: 200, sorter: true },
    { title: '住院人次', dataIndex: 'admissionCount', key: 'admissionCount', width: 120, sorter: true },
    { title: '住院人次同比环比', key: 'admissionYoyMom', width: 160 },
    { title: '次均费用', dataIndex: 'avgCost', key: 'avgCost', width: 140, sorter: true },
    { title: '次均费用同比环比', key: 'avgCostYoyMom', width: 160 },
    { title: '报销比例', dataIndex: 'reimbursementRate', key: 'reimbursementRate', width: 140, sorter: true },
    { title: '次均住院日', dataIndex: 'avgLengthOfStay', key: 'avgLengthOfStay', width: 140, sorter: true },
  ];

  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条记录`,
  });

  const filteredData = computed(() => {
    if (!searchText.value) return props.data;
    return props.data.filter((item) => item.hospitalName.toLowerCase().includes(searchText.value.toLowerCase()));
  });

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
  };

  const formatCurrency = (num) => {
    if (num === null || num === undefined) return '¥0';
    return '¥' + num.toLocaleString();
  };

  const handleSearch = () => {
    pagination.value.current = 1;
  };

  const handleTableChange = (pag, filters, sorter) => {
    pagination.value.current = pag.current;
    pagination.value.pageSize = pag.pageSize;
  };

  const handleRowClick = (record) => {
    emit('row-click', record);
    emit('drill-down', 'hospital', record);
  };

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
  :deep(.ant-table-row) {
    cursor: pointer;
  }
  :deep(.ant-table-row:hover) {
    background-color: #e8f3ff;
  }
</style>
