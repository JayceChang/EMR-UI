<template>
  <div class="bg-white rounded-xl shadow-card p-5 mb-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <h3 class="font-bold text-lg">药店业务明细查询</h3>
        <p class="text-info text-sm mt-1">支持按多维度筛选药店业务明细数据</p>
      </div>
    </div>

    <!-- 查询条件 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-center">
      <!-- 药店名称 -->
      <div>
        <label class="block text-sm font-medium text-dark-2 mb-2"> 药店名称 </label>
        <a-input v-model:value="searchParams.name" placeholder="请输入药店名称关键词" class="w-full">
          <template #prefix>
            <i class="fas fa-search text-gray-400"></i>
          </template>
        </a-input>
      </div>

      <!-- 业务类型 -->
      <div>
        <label class="block text-sm font-medium text-dark-2 mb-2"> 业务类型 </label>
        <a-select v-model:value="searchParams.type" class="w-full" placeholder="全部类型">
          <a-select-option value="">全部类型</a-select-option>
          <a-select-option v-for="item in props.medicalTypeList" :key="item.code" :value="item.code">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>

      <!-- 按钮区域：调整列占比 + 移除多余 margin -->
      <div class="lg:col-span-2 flex justify-end space-x-3">
        <a-button type="primary" @click="handleSearch" :loading="loading">
          <i class="fas fa-search mr-2"></i>
          查询
        </a-button>
        <a-button @click="handleReset"> 重置 </a-button>
      </div>
    </div>

    <!-- 明细数据表格 -->
    <div class="overflow-x-auto">
      <a-table
        :columns="columns"
        :data-source="data"
        :loading="loading"
        :pagination="false"
        size="small"
        class="min-w-full"
        :row-key="(record) => record.id || `${record.name || ''}-${record.date || ''}-${record.type || ''}`"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="text-sm font-medium">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'region'">
            <span class="text-sm text-dark-2">{{ record.region }}</span>
          </template>
          <template v-else-if="column.key === 'date'">
            <span class="text-sm text-dark-2">{{ record.date }}</span>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ record.type }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'outpatient'">
            <span class="text-sm">{{ record.outpatient }}</span>
          </template>
          <template v-else-if="column.key === 'totalCost'">
            <span class="text-sm">¥{{ formatAmount(record.totalCost) }}</span>
          </template>
          <template v-else-if="column.key === 'poolPayment'">
            <span class="text-sm">¥{{ formatAmount(record.poolPayment) }}</span>
          </template>
          <template v-else-if="column.key === 'personalAccount'">
            <span class="text-sm">¥{{ formatAmount(record.personalAccount) }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <button class="text-primary text-sm hover:underline" @click="handleDrillDown(record)">下钻详情</button>
          </template>
        </template>
      </a-table>
    </div>

    <div class="flex justify-between items-center mt-5">
      <div class="text-sm text-info">共 {{ pagination.total }} 条记录，当前显示 1-{{ Math.min(pagination.pageSize, data.length) }} 条</div>
      <a-pagination
        v-model:current="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        show-size-changer
        show-quick-jumper
        show-total
        :page-size-options="['5', '10', '20', '50', '100']"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
  import { reactive } from 'vue';

  const props = defineProps({
    data: {
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
        pageSize: 5,
        total: 0,
      }),
    },
    districtList: {
      type: Array,
      default: () => [],
    },
    medicalTypeList: {
      type: Array,
      default: () => [],
    },
  });

  const emit = defineEmits(['search', 'reset', 'page-change', 'drill-down']);

  // Search parameters
  const searchParams = reactive({
    name: '',
    region: '',
    date: null,
    type: '',
  });

  // Table columns
  const columns = [
    {
      title: '药店名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '所属区域',
      dataIndex: 'region',
      key: 'region',
      width: 100,
    },
    {
      title: '业务日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: '业务类型',
      dataIndex: 'type',
      key: 'type',
      width: 130,
    },
    {
      title: '就诊人次',
      dataIndex: 'outpatient',
      key: 'outpatient',
      width: 100,
      align: 'right',
    },
    {
      title: '总费用(元)',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      align: 'right',
    },
    {
      title: '统筹支付(元)',
      dataIndex: 'poolPayment',
      key: 'poolPayment',
      width: 130,
      align: 'right',
    },
    {
      title: '个人账户(元)',
      dataIndex: 'personalAccount',
      key: 'personalAccount',
      width: 130,
      align: 'right',
    },
    {
      title: '下钻详情',
      key: 'action',
      width: 100,
      align: 'center',
    },
  ];

  // Get type color
  const getTypeColor = (type) => {
    const colorMap = {
      普通门诊: 'default',
      慢性病门诊: 'green',
      特殊疾病门诊: 'orange',
    };
    return colorMap[type] || 'default';
  };

  const formatAmount = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) {
      return '0.00';
    }
    return num.toFixed(2);
  };

  // Event handlers
  const handleSearch = () => {
    emit('search', { ...searchParams });
  };

  const handleReset = () => {
    searchParams.name = '';
    searchParams.region = '';
    searchParams.date = null;
    searchParams.type = '';
    emit('reset');
  };

  const handlePageChange = (page, pageSize) => {
    emit('page-change', page, pageSize);
  };

  const handleDrillDown = (record) => {
    emit('drill-down', record);
  };
</script>

<style scoped></style>
