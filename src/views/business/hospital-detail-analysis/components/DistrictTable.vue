<template>
  <div class="bg-white rounded-xl p-5 filter-card overflow-hidden mb-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
      <h3 class="text-lg font-semibold flex items-center">
        <i class="fas fa-table text-primary mr-2"></i>
        住院数据按区域汇总
      </h3>
      <!-- <div class="flex flex-wrap gap-2 mt-3 sm:mt-0">
        <div class="relative">
          <a-input
            v-model:value="searchKeyword"
            class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-48"
            placeholder="搜索..."
            allow-clear
            @input="handleSearch"
          >
            <template #prefix>
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </template>
          </a-input>
        </div>
      </div> -->
    </div>

    <!-- 表格容器 -->
    <div class="overflow-x-auto scrollbar-hide">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
        :row-key="(record) => record.id"
        size="middle"
        class="min-w-full table-shadow"
        @row-click="handleRowClick"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'districtName'">
            <div class="flex items-center">
              <div>
                <p class="font-medium">{{ record.districtName }}</p>
                <p class="text-xs text-gray-500">{{ record.districtType }}</p>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'admissions'">
            <div>
              <p class="font-medium">{{ record.admissions.toLocaleString() }}</p>
              <p class="text-xs flex items-center" :class="trendClass(record.admissionsYoy)">
                <i v-if="hasTrendArrow(record.admissionsYoy)" :class="trendArrowIcon(record.admissionsYoy)" class="mr-1"></i>
                {{ record.admissionsYoy }}%
                <span class="text-gray-500 ml-1">(同比)</span>
              </p>
            </div>
          </template>

          <template v-else-if="column.key === 'avgCost'">
            <div>
              <p class="font-medium">¥{{ record.avgCost.toLocaleString() }}</p>
              <p class="text-xs flex items-center" :class="trendClass(record.avgCostYoy)">
                <i v-if="hasTrendArrow(record.avgCostYoy)" :class="trendArrowIcon(record.avgCostYoy)" class="mr-1"></i>
                {{ record.avgCostYoy }}%
                <span class="text-gray-500 ml-1">(同比)</span>
              </p>
              <p class="text-xs flex items-center" :class="trendClass(record.avgCostMom)">
                <i v-if="hasTrendArrow(record.avgCostMom)" :class="trendArrowIcon(record.avgCostMom)" class="mr-1"></i>
                {{ record.avgCostMom }}%
                <span class="text-gray-500 ml-1">(环比)</span>
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
              <p class="font-medium">{{ record.reimbursementRate }}%</p>
              <p class="text-xs flex items-center" :class="trendClass(record.reimbursementRateYoy)">
                <i v-if="hasTrendArrow(record.reimbursementRateYoy)" :class="trendArrowIcon(record.reimbursementRateYoy)" class="mr-1"></i>
                {{ record.reimbursementRateYoy }}%
                <span class="text-gray-500 ml-1">(同比)</span>
              </p>
              <p class="text-xs flex items-center" :class="trendClass(record.reimbursementRateMom)">
                <i v-if="hasTrendArrow(record.reimbursementRateMom)" :class="trendArrowIcon(record.reimbursementRateMom)" class="mr-1"></i>
                {{ record.reimbursementRateMom }}%
                <span class="text-gray-500 ml-1">(环比)</span>
              </p>
            </div>
          </template>

          <template v-else-if="column.key === 'admissionRate'">
            <div>
              <p class="font-medium">{{ record.admissionRate }}%</p>
              <p class="text-xs flex items-center" :class="trendClass(record.admissionRateYoy)">
                <i v-if="hasTrendArrow(record.admissionRateYoy)" :class="trendArrowIcon(record.admissionRateYoy)" class="mr-1"></i>
                {{ record.admissionRateYoy }}%
                <span class="text-gray-500 ml-1">(同比)</span>
              </p>
              <p class="text-xs flex items-center" :class="trendClass(record.admissionRateMom)">
                <i v-if="hasTrendArrow(record.admissionRateMom)" :class="trendArrowIcon(record.admissionRateMom)" class="mr-1"></i>
                {{ record.admissionRateMom }}%
                <span class="text-gray-500 ml-1">(环比)</span>
              </p>
            </div>
          </template>

          <template v-else-if="column.key === 'transferRate'">
            <div>
              <p class="font-medium">{{ record.transferRate }}%</p>
              <p class="text-xs flex items-center" :class="trendClass(record.transferRateYoy)">
                <i v-if="hasTrendArrow(record.transferRateYoy)" :class="trendArrowIcon(record.transferRateYoy)" class="mr-1"></i>
                {{ record.transferRateYoy }}%
                <span class="text-gray-500 ml-1">(同比)</span>
              </p>
              <p class="text-xs flex items-center" :class="trendClass(record.transferRateMom)">
                <i v-if="hasTrendArrow(record.transferRateMom)" :class="trendArrowIcon(record.transferRateMom)" class="mr-1"></i>
                {{ record.transferRateMom }}%
                <span class="text-gray-500 ml-1">(环比)</span>
              </p>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 分页 -->
    <div class="mt-6 flex flex-col sm:flex-row justify-between items-center">
      <div class="text-sm text-gray-500 mb-4 sm:mb-0">
        显示 1 至 {{ Math.min(pagination.pageSize, pagination.total) }} 条，共 {{ pagination.total }} 条记录
      </div>
      <a-pagination
        :current="pagination.current"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        :show-size-changer="true"
        :show-quick-jumper="true"
        :page-size-options="['3', '5', '10', '20']"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';

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
        pageSize: 3,
        total: 0,
      }),
    },
  });

  const emit = defineEmits(['view-detail', 'page-change', 'search']);

  const searchKeyword = ref('');

  // Table columns
  const columns = [
    {
      title: '区县',
      dataIndex: 'districtName',
      key: 'districtName',
      width: 160,
    },
    {
      title: '住院人次',
      dataIndex: 'admissions',
      key: 'admissions',
      width: 120,
    },
    {
      title: '次均费用',
      dataIndex: 'avgCost',
      key: 'avgCost',
      width: 140,
    },
    {
      title: '次均统筹',
      dataIndex: 'avgReimbursement',
      key: 'avgReimbursement',
      width: 120,
    },
    {
      title: '报销比例',
      dataIndex: 'reimbursementRate',
      key: 'reimbursementRate',
      width: 140,
    },
    {
      title: '住院率',
      dataIndex: 'admissionRate',
      key: 'admissionRate',
      width: 140,
    },
    {
      title: '外转率',
      dataIndex: 'transferRate',
      key: 'transferRate',
      width: 140,
    },
  ];

  // Event handlers
  const handleSearch = () => {
    emit('search', searchKeyword.value);
  };

  const handlePageChange = (page, pageSize) => {
    emit('page-change', page, pageSize);
  };

  const handleRowClick = (record) => {
    emit('view-detail', 'area', record.district, record.district);
  };

  const trendClass = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num) || Math.abs(num) < 0.005) return '';
    return num > 0 ? 'text-danger' : 'text-success';
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
  .filter-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .table-shadow {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
