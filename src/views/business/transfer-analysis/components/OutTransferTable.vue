<template>
  <div class="bg-white p-6 rounded-xl shadow-lg" style="height: 445px">
    <div class="overflow-x-auto h-full">
      <a-table
        :columns="columns"
        :data-source="data"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        size="small"
        class="min-w-full h-full"
        :row-key="(record) => record.name"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="text-sm font-medium text-gray-900">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'count'">
            <span class="text-sm text-gray-900">{{ record.count.toLocaleString() }}</span>
          </template>
          <template v-else-if="column.key === 'cityRatio'">
            <span class="text-sm text-gray-700">{{ (record.cityRatio * 100).toFixed(1) }}%</span>
          </template>
          <template v-else-if="column.key === 'provinceRatio'">
            <span class="text-sm text-gray-700">{{ (record.provinceRatio * 100).toFixed(1) }}%</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="handleDrillDown(record)">
              <i class="fas fa-search mr-1"></i>
              下钻分析
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
  const emit = defineEmits(['drill-down']);

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

  // Table columns
  const columns = [
    {
      title: '县区',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      fixed: 'left',
    },
    {
      title: '外转数量',
      dataIndex: 'count',
      key: 'count',
      width: 120,
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: '市域外转占比',
      dataIndex: 'cityRatio',
      key: 'cityRatio',
      width: 140,
      sorter: (a, b) => a.cityRatio - b.cityRatio,
    },
    {
      title: '省域外转占比',
      dataIndex: 'provinceRatio',
      key: 'provinceRatio',
      width: 140,
      sorter: (a, b) => a.provinceRatio - b.provinceRatio,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      align: 'center',
    },
  ];

  const handleDrillDown = (record) => {
    emit('drill-down', {
      scene: 'region',
      title: `外转分析下钻 - ${record.name}`,
      regionName: record.name,
      sourceRecord: record,
    });
  };
</script>

<style scoped>
  :deep(.ant-table-tbody > tr:hover) {
    background-color: #f5f5f5;
  }
</style>
