<template>
  <div class="overflow-x-auto">
    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="false"
      size="small"
      class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm"
      :row-key="(record) => record.icd10"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'icd10'">
          <span class="font-medium text-gray-900">{{ record.icd10 }}</span>
        </template>
        <template v-else-if="column.key === 'visits'">
          <span class="text-gray-700">{{ record.visits }}</span>
        </template>
        <template v-else-if="column.key === 'avgCost'">
          <span class="text-gray-700">{{ record.avgCost }}</span>
        </template>
        <template v-else-if="column.key === 'reimbursement'">
          <span class="text-gray-700">{{ record.reimbursement }}</span>
        </template>
        <template v-else-if="column.key === 'yoy'">
          <span :class="record.yoy && record.yoy.includes('↑') ? 'text-green-600' : 'text-red-600'">
            {{ record.yoy }}
          </span>
        </template>
        <template v-else-if="column.key === 'mom'">
          <span :class="record.mom && record.mom.includes('↑') ? 'text-green-600' : 'text-red-600'">
            {{ record.mom }}
          </span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

// Table columns
const columns = [
  { title: 'ICD10 亚目', dataIndex: 'icd10', key: 'icd10' },
  { title: '人次', dataIndex: 'visits', key: 'visits' },
  { title: '次均费用 (元)', dataIndex: 'avgCost', key: 'avgCost' },
  { title: '统筹支付 (元)', dataIndex: 'reimbursement', key: 'reimbursement' },
  { title: '同比', dataIndex: 'yoy', key: 'yoy' },
  { title: '环比', dataIndex: 'mom', key: 'mom' }
];
</script>

<style scoped>
</style>
