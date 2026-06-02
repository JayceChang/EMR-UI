<template>
  <div class="bg-white rounded-xl p-5 card-shadow" style="position: relative">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
      <h3 class="text-lg font-semibold">参保明细列表</h3>
      <!-- <div class="flex items-center mt-3 sm:mt-0 space-x-3">
        <div class="relative">
          <input
            v-model="localSearchKeyword"
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary text-sm w-full sm:w-64"
            placeholder="搜索..."
            type="text"
            @input="handleSearch"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fas fa-search text-gray-400"></i>
          </div>
        </div>
        <a-button type="default" @click="handleExport">
          <i class="fas fa-download mr-2"></i>
          导出
        </a-button>
      </div> -->
    </div>

    <!-- 表格 -->
    <div class="overflow-x-auto flex-grow">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
        :row-key="(record) => record.id"
        size="middle"
        class="min-w-full"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'area'">
            <div class="font-medium text-gray-900">{{ record.area }}</div>
          </template>

          <template v-else-if="column.key === 'insuredCount'">
            {{ record.insuredCount.toLocaleString() }}
          </template>

          <template v-else-if="column.key === 'yoy'">
            <span :class="trendClass(record.yoy)" class="flex items-center">
              <i v-if="hasTrendArrow(record.yoy)" :class="trendArrowIcon(record.yoy)" class="text-xs mr-1"></i>
              {{ formatTrendPercent(record.yoy) }}%
            </span>
          </template>

          <template v-else-if="column.key === 'mom'">
            <span :class="trendClass(record.mom)" class="flex items-center">
              <i v-if="hasTrendArrow(record.mom)" :class="trendArrowIcon(record.mom)" class="text-xs mr-1"></i>
              {{ formatTrendPercent(record.mom) }}%
            </span>
          </template>

          <template v-else-if="column.key === 'fundAmount'"> ¥{{ record.fundAmount.toLocaleString() }} </template>

          <template v-else-if="column.key === 'fundYoy'">
            <span :class="trendClass(record.fundYoy)" class="flex items-center">
              <i v-if="hasTrendArrow(record.fundYoy)" :class="trendArrowIcon(record.fundYoy)" class="text-xs mr-1"></i>
              {{ formatTrendPercent(record.fundYoy) }}%
            </span>
          </template>

          <template v-else-if="column.key === 'fundMom'">
            <span :class="trendClass(record.fundMom)" class="flex items-center">
              <i v-if="hasTrendArrow(record.fundMom)" :class="trendArrowIcon(record.fundMom)" class="text-xs mr-1"></i>
              {{ formatTrendPercent(record.fundMom) }}%
            </span>
          </template>

          <template v-else-if="column.key === 'fundUsageRate'">
            <div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-success h-2 rounded-full" :style="{ width: record.fundUsageRate + '%' }"></div>
              </div>
              <span class="text-xs text-gray-500">{{ record.fundUsageRate }}%</span>
            </div>
          </template>

          <template v-else-if="column.key === 'hospitalization'">
            {{ record.hospitalization }}
          </template>

          <template v-else-if="column.key === 'avgCost'"> ¥{{ record.avgCost.toLocaleString() }} </template>

          <template v-else-if="column.key === 'hospitalizationRate'"> {{ record.hospitalizationRate }}% </template>

          <template v-else-if="column.key === 'outwardTransferRate'"> {{ record.outwardTransferRate }}% </template>

          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="handleViewDetail(record)">
              <i class="fas fa-eye mr-1"></i>
              查看
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between mt-6">
      <div class="text-sm text-gray-700">
        显示
        <span class="font-medium">1</span>
        到
        <span class="font-medium">{{ Math.min(pagination.pageSize, pagination.total) }}</span>
        条，共
        <span class="font-medium">{{ pagination.total }}</span>
        条记录
      </div>
      <a-pagination
        :current="pagination.current"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        :show-size-changer="true"
        :show-quick-jumper="true"
        :page-size-options="['10', '20', '50', '100']"
        @change="handlePageChange"
        class="flex"
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
        pageSize: 10,
        total: 0,
      }),
    },
    searchKeyword: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits(['search', 'page-change', 'view-detail', 'export']);

  // Local search keyword
  const localSearchKeyword = ref(props.searchKeyword);

  // Watch for external search keyword changes
  watch(
    () => props.searchKeyword,
    (newValue) => {
      localSearchKeyword.value = newValue;
    }
  );

  const parseTrendValue = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const text = String(value)
      .replace(/[%\s,↑↓]/g, '')
      .trim();
    if (!text) return 0;
    const num = Number(text);
    return Number.isFinite(num) ? num : 0;
  };

  const normalizeTrendValue = (value, digits = 2) => {
    const num = parseTrendValue(value);
    const factor = 10 ** digits;
    return Math.round(num * factor) / factor;
  };

  const isZeroTrend = (value, digits = 2) => {
    const num = normalizeTrendValue(value, digits);
    return Math.abs(num) < 1 / 10 ** digits;
  };

  const formatTrendPercent = (value) => {
    const num = Math.abs(normalizeTrendValue(value, 2));
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const getDisplayedTrendValue = (value) => {
    const text = formatTrendPercent(value).replace(/,/g, '');
    const num = Number(text);
    return Number.isFinite(num) ? num : 0;
  };

  const trendClass = (value) => {
    if (getDisplayedTrendValue(value) === 0) {
      return '';
    }
    const num = normalizeTrendValue(value, 2);
    return num > 0 ? 'text-red-600' : 'text-green-600';
  };

  const hasTrendArrow = (value) => {
    return getDisplayedTrendValue(value) > 0;
  };

  const trendArrowIcon = (value) => {
    const num = normalizeTrendValue(value, 2);
    return num > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  };

  // Table columns
  const columns = [
    {
      title: '地区',
      dataIndex: 'area',
      key: 'area',
      width: 120,
      fixed: 'left',
    },
    {
      title: '参保人数',
      dataIndex: 'insuredCount',
      key: 'insuredCount',
      width: 120,
      sorter: (a, b) => a.insuredCount - b.insuredCount,
    },
    {
      title: '同比',
      dataIndex: 'yoy',
      key: 'yoy',
      width: 80,
      sorter: (a, b) => a.yoy - b.yoy,
    },
    {
      title: '环比',
      dataIndex: 'mom',
      key: 'mom',
      width: 80,
      sorter: (a, b) => a.mom - b.mom,
    },
    {
      title: '统筹总金额',
      dataIndex: 'fundAmount',
      key: 'fundAmount',
      width: 140,
      sorter: (a, b) => a.fundAmount - b.fundAmount,
    },
    {
      title: '统筹同比',
      dataIndex: 'fundYoy',
      key: 'fundYoy',
      width: 100,
      sorter: (a, b) => a.fundYoy - b.fundYoy,
    },
    {
      title: '统筹环比',
      dataIndex: 'fundMom',
      key: 'fundMom',
      width: 100,
      sorter: (a, b) => a.fundMom - b.fundMom,
    },
    {
      title: '资金进度',
      dataIndex: 'fundUsageRate',
      key: 'fundUsageRate',
      width: 120,
      sorter: (a, b) => a.fundUsageRate - b.fundUsageRate,
    },
    {
      title: '住院人次',
      dataIndex: 'hospitalization',
      key: 'hospitalization',
      width: 100,
      sorter: (a, b) => a.hospitalization - b.hospitalization,
    },
    {
      title: '次均费用',
      dataIndex: 'avgCost',
      key: 'avgCost',
      width: 120,
      sorter: (a, b) => a.avgCost - b.avgCost,
    },
    {
      title: '住院率',
      dataIndex: 'hospitalizationRate',
      key: 'hospitalizationRate',
      width: 100,
      sorter: (a, b) => a.hospitalizationRate - b.hospitalizationRate,
    },
    {
      title: '外转率',
      dataIndex: 'outwardTransferRate',
      key: 'outwardTransferRate',
      width: 100,
      sorter: (a, b) => a.outwardTransferRate - b.outwardTransferRate,
    },
    // {
    //   title: '操作',
    //   key: 'action',
    //   fixed: 'right',
    //   width: 100
    // }
  ];

  // Event handlers
  const handleSearch = () => {
    emit('search', localSearchKeyword.value);
  };

  const handlePageChange = (page, pageSize) => {
    emit('page-change', page, pageSize);
  };

  const handleViewDetail = (record) => {
    emit('view-detail', record);
  };

  const handleExport = () => {
    emit('export');
  };
</script>

<style scoped>
  .card-shadow {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
</style>
