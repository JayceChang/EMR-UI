<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <h2 class="text-xl font-semibold mb-4 border-b pb-2 flex items-center text-gray-700">
      <i :class="[iconClass, 'mr-2']"></i>
      {{ title }}
    </h2>
    <div class="max-h-96 overflow-y-auto">
      <a-table
        :columns="columns"
        :data-source="data"
        :pagination="false"
        size="small"
        :row-key="(record) => record.rank"
        class="min-w-full"
        :scroll="{ x: 900 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'rank'">
            <span class="font-medium text-gray-900">{{ record.rank }}</span>
          </template>
          <template v-else-if="column.key === 'name'">
            <span class="text-gray-700">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'inpatientCount'">
            <span class="text-gray-900">{{ formatNumber(record.inpatientCount) }}</span>
          </template>
          <template v-else-if="column.key === 'totalFee'">
            <span class="text-gray-700">{{ record.totalFee }}</span>
          </template>
          <template v-else-if="column.key === 'avgFee'">
            <span class="text-green-600">{{ formatNumber(record.avgFee) }}</span>
          </template>
          <template v-else-if="column.key === 'avgCoordinationFee'">
            <span class="text-blue-600">{{ formatNumber(record.avgCoordinationFee) }}</span>
          </template>
          <template v-else-if="column.key === 'avgStayDays'">
            <span class="text-orange-600">{{ record.avgStayDays }}</span>
          </template>
          <template v-else-if="column.key === 'avgReimbursementRate'">
            <span class="text-purple-600">{{ record.avgReimbursementRate }}%</span>
          </template>
        </template>
      </a-table>
      <p v-if="!data || data.length === 0" class="text-center text-gray-500 py-10">
        暂无数据
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '医院住院人次排行'
  },
  iconClass: {
    type: String,
    default: 'fas fa-hospital text-purple-600'
  },
  data: {
    type: Array,
    default: () => []
  }
});

const columns = [
  { title: '排名', dataIndex: 'rank', key: 'rank', width: 60, fixed: 'left' },
  { title: '医院名称', dataIndex: 'name', key: 'name', width: 180 },
  { title: '住院人次', dataIndex: 'inpatientCount', key: 'inpatientCount', align: 'right', width: 90 },
  { title: '总费用(万)', dataIndex: 'totalFee', key: 'totalFee', align: 'right', width: 100 },
  { title: '次均费用(元)', dataIndex: 'avgFee', key: 'avgFee', align: 'right', width: 110 },
  { title: '次均统筹(元)', dataIndex: 'avgCoordinationFee', key: 'avgCoordinationFee', align: 'right', width: 110 },
  { title: '次均住院日', dataIndex: 'avgStayDays', key: 'avgStayDays', align: 'right', width: 100 },
  { title: '报销比例', dataIndex: 'avgReimbursementRate', key: 'avgReimbursementRate', align: 'right', width: 90 }
];

const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '--';
  return Number(num).toLocaleString('zh-CN');
};
</script>

<style scoped>
:deep(.ant-table-row:hover) {
  background-color: #f9fafb;
}
</style>
