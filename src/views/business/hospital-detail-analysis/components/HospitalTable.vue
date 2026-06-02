<template>
  <div class="bg-white rounded-xl p-5 filter-card overflow-hidden mb-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
      <h3 class="text-lg font-semibold flex items-center">
        <i class="fas fa-hospital text-primary mr-2"></i>
        住院数据按医疗机构汇总
      </h3>
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
          <template v-if="column.key === 'hospitalName'">
            <div class="flex items-center">
              <div>
                <p class="font-medium">{{ record.hospitalName }}</p>
                <p class="text-xs text-gray-500">{{ record.level }}</p>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'admissions'">
            <div>
              <p class="font-medium">{{ record.admissions.toLocaleString() }}</p>
            </div>
          </template>

          <template v-else-if="column.key === 'admissionsTrend'">
            <div class="space-y-1">
              <p class="text-xs flex items-center" :class="trendClass(record.admissionsYoy)">
                <i v-if="hasTrendArrow(record.admissionsYoy)" :class="trendArrowIcon(record.admissionsYoy)" class="mr-1"></i>
                {{ record.admissionsYoy }}%
                <span class="text-gray-500 ml-1">(同比)</span>
              </p>
              <p class="text-xs flex items-center" :class="trendClass(record.admissionsMom)">
                <i v-if="hasTrendArrow(record.admissionsMom)" :class="trendArrowIcon(record.admissionsMom)" class="mr-1"></i>
                {{ record.admissionsMom }}%
                <span class="text-gray-500 ml-1">(环比)</span>
              </p>
            </div>
          </template>

          <template v-else-if="column.key === 'avgCost'">
            <div>
              <p class="font-medium">¥{{ record.avgCost.toLocaleString() }}</p>
            </div>
          </template>

          <template v-else-if="column.key === 'avgCostTrend'">
            <div class="space-y-1">
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

          <template v-else-if="column.key === 'reimbursementRate'">
            <div>
              <p class="font-medium">{{ record.reimbursementRate }}%</p>
            </div>
          </template>

          <template v-else-if="column.key === 'avgLengthOfStay'">
            <div>
              <p class="font-medium">{{ record.avgLengthOfStay }}</p>
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
      title: '医疗机构名称',
      dataIndex: 'hospitalName',
      key: 'hospitalName',
      width: 200,
    },
    {
      title: '住院人次',
      dataIndex: 'admissions',
      key: 'admissions',
      width: 120,
    },
    {
      title: '住院人次同比环比',
      key: 'admissionsTrend',
      width: 160,
    },
    {
      title: '次均费用',
      dataIndex: 'avgCost',
      key: 'avgCost',
      width: 140,
    },
    {
      title: '次均费用同比环比',
      key: 'avgCostTrend',
      width: 160,
    },
    {
      title: '报销比例',
      dataIndex: 'reimbursementRate',
      key: 'reimbursementRate',
      width: 140,
    },
    {
      title: '次均住院日',
      dataIndex: 'avgLengthOfStay',
      key: 'avgLengthOfStay',
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
    emit('view-detail', 'hospital', record.hospitalName, record.hospitalName);
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
