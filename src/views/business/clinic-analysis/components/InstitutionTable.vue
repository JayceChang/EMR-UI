<template>
  <div>
    <!-- 筛选器 -->
    <div class="mb-4 flex space-x-4">
      <a-select v-model:value="queryParams.level" class="block w-1/2" placeholder="按级别筛选" allow-clear @change="handleFilterChange">
        <a-select-option value="一级">一级</a-select-option>
        <a-select-option value="二级">二级</a-select-option>
        <a-select-option value="三级">三级</a-select-option>
        <a-select-option value="未定级">未定级</a-select-option>
      </a-select>
      <a-select v-model:value="queryParams.division" class="block w-1/2" placeholder="按行政区划筛选" allow-clear @change="handleFilterChange">
        <a-select-option value="文峰区">文峰区</a-select-option>
        <a-select-option value="北关区">北关区</a-select-option>
        <a-select-option value="殷都区">殷都区</a-select-option>
        <a-select-option value="龙安区">龙安区</a-select-option>
        <a-select-option value="安阳县">安阳县</a-select-option>
      </a-select>
    </div>

    <!-- 表格 -->
    <div>
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :loading="loading"
        size="small"
        class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm"
        :row-key="(record) => record.name"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="font-medium text-gray-900 cursor-pointer" @click="handleRowClick(record)">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'visits'">
            <span class="text-gray-700">{{ record.visits }}</span>
          </template>
          <template v-else-if="column.key === 'avgCost'">
            <span class="text-gray-700">{{ record.avgCost }}</span>
          </template>
          <template v-else-if="column.key === 'avgReimbursement'">
            <span class="text-gray-700">{{ record.avgReimbursement }}</span>
          </template>
          <template v-else-if="column.key === 'yoy'">
            <span :class="trendClass(record.yoy)">
              {{ record.yoy }}
            </span>
          </template>
          <template v-else-if="column.key === 'mom'">
            <span :class="trendClass(record.mom)">
              {{ record.mom }}
            </span>
          </template>
        </template>
      </a-table>
    </div>

    <a-button type="primary" class="mt-4 w-full bg-indigo-600 border-indigo-600 hover:bg-indigo-700" @click="handleDrillDown">
      下钻分析
      <i class="fas fa-search-plus ml-2"></i>
    </a-button>
  </div>
</template>

<script setup>
  import { ref, reactive, watch, onMounted, h, computed } from 'vue';
  import { Tooltip } from 'ant-design-vue';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import { InstitutionAPI } from '/@/api/business/clinic-analysis/clinic-analysis-api';

  const props = defineProps({
    startMonth: {
      type: String,
      default: '',
    },
    endMonth: {
      type: String,
      default: '',
    },
  });

  const yoyTooltipText = computed(() => {
    if (!props.startMonth || !props.endMonth) {
      return '同比口径：当前筛选区间累计值，对比去年同期区间累计值';
    }
    return `同比口径：${props.startMonth}至${props.endMonth}累计值，对比去年同期区间累计值`;
  });

  const momTooltipText = computed(() => '环比口径：当前筛选区间与上一统计期对比');

  const withTooltipTitle = (text, tooltipText) =>
    h('span', { class: 'inline-flex items-center' }, [
      text,
      h(
        Tooltip,
        { title: tooltipText },
        {
          default: () => h(QuestionCircleOutlined, { class: 'ml-1 text-gray-400 cursor-help' }),
        }
      ),
    ]);

  const trendClass = (text) => {
    const value = String(text || '').trim();
    if (!value || value === '0%' || value === '0.0%' || value === '0.00%' || value === '--') {
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

  const emit = defineEmits(['filter-change', 'drill-down']);

  // 加载状态
  const loading = ref(false);

  // 表格数据
  const tableData = ref([]);

  // 查询参数
  const queryParams = reactive({
    level: undefined,
    division: undefined,
    keyword: undefined,
    pageNum: 1,
    pageSize: 5,
  });

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 5,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['5'],
    showTotal: (total) => `共 ${total} 条记录`,
  });

  // Table columns
  const columns = [
    { title: '机构名称', dataIndex: 'name', key: 'name' },
    { title: '人次', dataIndex: 'visits', key: 'visits' },
    { title: '次均费用', dataIndex: 'avgCost', key: 'avgCost' },
    { title: '次均报销', dataIndex: 'avgReimbursement', key: 'avgReimbursement' },
    { title: () => withTooltipTitle('同比', yoyTooltipText.value), dataIndex: 'yoy', key: 'yoy' },
    { title: () => withTooltipTitle('环比', momTooltipText.value), dataIndex: 'mom', key: 'mom' },
  ];

  // 加载数据
  const fetchData = async () => {
    if (!props.startMonth || !props.endMonth) {
      return;
    }

    loading.value = true;
    try {
      const params = {
        startMonth: props.startMonth,
        endMonth: props.endMonth,
        level: queryParams.level,
        division: queryParams.division,
        keyword: queryParams.keyword,
        pageNum: queryParams.pageNum,
        pageSize: queryParams.pageSize,
      };

      const response = await InstitutionAPI.getInstitutionList(params);
      if (response && response.data) {
        const { list, total, pageNum, pageSize } = response.data;
        tableData.value = list || [];
        pagination.total = total || 0;
        pagination.current = pageNum || 1;
        pagination.pageSize = pageSize || 5;
      }
    } catch (error) {
      console.error('加载医疗机构数据失败:', error);
      tableData.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 处理筛选变化
  const handleFilterChange = () => {
    queryParams.pageNum = 1; // 筛选变化时重置到第一页
    fetchData();
    emit('filter-change', {
      level: queryParams.level,
      division: queryParams.division,
    });
  };

  // 处理表格分页变化
  const handleTableChange = (pag) => {
    queryParams.pageNum = pag.current;
    queryParams.pageSize = pag.pageSize;
    fetchData();
  };

  const handleRowClick = (record) => {
    emit('drill-down', {
      source: 'institution',
      mode: 'row',
      institutionName: record?.name || '',
      level: queryParams.level,
      division: queryParams.division,
    });
  };

  const handleDrillDown = () => {
    emit('drill-down', {
      source: 'institution',
      mode: 'all',
      level: queryParams.level,
      division: queryParams.division,
    });
  };

  // 监听时间范围变化
  watch(
    [() => props.startMonth, () => props.endMonth],
    ([newStart, newEnd]) => {
      if (newStart && newEnd) {
        queryParams.pageNum = 1; // 时间变化时重置到第一页
        fetchData();
      }
    },
    { immediate: true }
  );

  onMounted(() => {
    // 组件挂载时如果有时间参数则加载数据
    if (props.startMonth && props.endMonth) {
      fetchData();
    }
  });
</script>

<style scoped>
  :deep(.ant-table-row) {
    cursor: pointer;
  }
  :deep(.ant-table-row:hover) {
    background-color: #f5f5f5;
  }
</style>
