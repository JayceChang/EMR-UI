<template>
  <div class="bg-white rounded-xl p-5 shadow-md overflow-hidden">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
      <h3 class="text-lg font-semibold flex items-center">
        <i class="fas fa-table text-blue-600 mr-2"></i>
        住院数据按区域汇总
      </h3>
      <div class="flex flex-wrap gap-2 mt-3 sm:mt-0">
        <a-input-search v-model:value="searchText" placeholder="搜索..." style="width: 200px" @search="handleSearch" />
      </div>
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredData"
      :pagination="pagination"
      :loading="loading"
      size="small"
      :row-key="(record) => record.district"
      :scroll="{ x: 800 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'district'">
          <div class="flex items-center cursor-pointer" @click="handleRowClick(record)">
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 shrink-0">
              <i class="fas fa-map-marker-alt text-sm"></i>
            </div>
            <div>
              <p class="font-medium">{{ record.district }}</p>
              <p class="text-xs text-gray-500">{{ record.districtType }}</p>
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'admissionCount'">
          <div>
            <p class="font-medium">{{ formatNumber(record.admissionCount) }}</p>
            <p class="text-xs flex items-center" :class="trendClass(record.admissionYoy)">
              <i v-if="hasTrendArrow(record.admissionYoy)" :class="trendArrowIcon(record.admissionYoy)" class="mr-1"></i>
              {{ Math.abs(record.admissionYoy) }}%
              <span class="text-gray-500 ml-1">(同比)</span>
            </p>
          </div>
        </template>
        <template v-else-if="column.key === 'avgCost'">
          <div>
            <p class="font-medium">{{ formatCurrency(record.avgCost) }}</p>
            <p class="text-xs flex items-center">
              <span :class="trendClass(record.avgCostYoy)" class="flex items-center">
                <i v-if="hasTrendArrow(record.avgCostYoy)" :class="trendArrowIcon(record.avgCostYoy)" class="mr-1"></i>
                {{ Math.abs(record.avgCostYoy) }}%
                <span class="text-gray-500 ml-1">(同比)</span>
              </span>
              <span class="mx-1">|</span>
              <span :class="trendClass(record.avgCostMom)" class="flex items-center">
                <i v-if="hasTrendArrow(record.avgCostMom)" :class="trendArrowIcon(record.avgCostMom)" class="mr-1"></i>
                {{ Math.abs(record.avgCostMom) }}%
                <span class="text-gray-500 ml-1">(环比)</span>
              </span>
            </p>
          </div>
        </template>
        <template v-else-if="column.key === 'avgReimbursement'">
          <p class="font-medium">{{ formatCurrency(record.avgReimbursement) }}</p>
        </template>
        <template v-else-if="column.key === 'reimbursementRate'">
          <div>
            <p class="font-medium">{{ record.reimbursementRate }}%</p>
            <p class="text-xs flex items-center">
              <span :class="trendClass(record.reimbursementRateYoy)" class="flex items-center">
                <i v-if="hasTrendArrow(record.reimbursementRateYoy)" :class="trendArrowIcon(record.reimbursementRateYoy)" class="mr-1"></i>
                {{ Math.abs(record.reimbursementRateYoy) }}%
                <span class="text-gray-500 ml-1">(同比)</span>
              </span>
              <span class="mx-1">|</span>
              <span :class="trendClass(record.reimbursementRateMom)" class="flex items-center">
                <i v-if="hasTrendArrow(record.reimbursementRateMom)" :class="trendArrowIcon(record.reimbursementRateMom)" class="mr-1"></i>
                {{ Math.abs(record.reimbursementRateMom) }}%
                <span class="text-gray-500 ml-1">(环比)</span>
              </span>
            </p>
          </div>
        </template>
        <template v-else-if="column.key === 'admissionRate'">
          <div>
            <p class="font-medium">{{ record.admissionRate }}%</p>
            <p class="text-xs flex items-center">
              <span :class="trendClass(record.admissionRateYoy)" class="flex items-center">
                <i v-if="hasTrendArrow(record.admissionRateYoy)" :class="trendArrowIcon(record.admissionRateYoy)" class="mr-1"></i>
                {{ Math.abs(record.admissionRateYoy) }}%
                <span class="text-gray-500 ml-1">(同比)</span>
              </span>
              <span class="mx-1">|</span>
              <span :class="trendClass(record.admissionRateMom)" class="flex items-center">
                <i v-if="hasTrendArrow(record.admissionRateMom)" :class="trendArrowIcon(record.admissionRateMom)" class="mr-1"></i>
                {{ Math.abs(record.admissionRateMom) }}%
                <span class="text-gray-500 ml-1">(环比)</span>
              </span>
            </p>
          </div>
        </template>
        <template v-else-if="column.key === 'transferRate'">
          <div>
            <p class="font-medium">{{ record.transferRate }}%</p>
            <p class="text-xs flex items-center">
              <span :class="trendClass(record.transferRateYoy)" class="flex items-center">
                <i v-if="hasTrendArrow(record.transferRateYoy)" :class="trendArrowIcon(record.transferRateYoy)" class="mr-1"></i>
                {{ Math.abs(record.transferRateYoy) }}%
                <span class="text-gray-500 ml-1">(同比)</span>
              </span>
              <span class="mx-1">|</span>
              <span :class="trendClass(record.transferRateMom)" class="flex items-center">
                <i v-if="hasTrendArrow(record.transferRateMom)" :class="trendArrowIcon(record.transferRateMom)" class="mr-1"></i>
                {{ Math.abs(record.transferRateMom) }}%
                <span class="text-gray-500 ml-1">(环比)</span>
              </span>
            </p>
          </div>
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
    { title: '区县', dataIndex: 'district', key: 'district', width: 160, sorter: true },
    { title: '住院人次', dataIndex: 'admissionCount', key: 'admissionCount', width: 120, sorter: true },
    { title: '次均费用', dataIndex: 'avgCost', key: 'avgCost', width: 140, sorter: true },
    { title: '次均统筹', dataIndex: 'avgReimbursement', key: 'avgReimbursement', width: 120, sorter: true },
    { title: '报销比例', dataIndex: 'reimbursementRate', key: 'reimbursementRate', width: 140, sorter: true },
    { title: '住院率', dataIndex: 'admissionRate', key: 'admissionRate', width: 140, sorter: true },
    { title: '外转率', dataIndex: 'transferRate', key: 'transferRate', width: 140, sorter: true },
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
    return props.data.filter((item) => item.district.toLowerCase().includes(searchText.value.toLowerCase()));
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
    emit('drill-down', 'area', record);
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
