<template>
  <a-table 
    :columns="columns" 
    :data-source="data" 
    :pagination="false"
    :row-key="(record) => record.key || record.name"
    size="middle"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'comparison'">
        <div class="flex items-center space-x-2">
          <span :class="Number(record.diff) >= 0 ? 'text-red-500' : 'text-green-500'">
            <i :class="['fas', Number(record.diff) >= 0 ? 'fa-caret-up' : 'fa-caret-down']"></i>
            {{ formatValue(Math.abs(record.diff), record.unit) }}
          </span>
          <span class="text-gray-400 text-xs">({{ record.pct }}%)</span>
        </div>
      </template>
      <template v-else-if="column.key === 'aValue'">
        <span class="font-bold text-blue-600">{{ formatValue(record.a, record.unit) }}</span>
      </template>
      <template v-else-if="column.key === 'bValue'">
        <span class="font-bold text-gray-700">{{ formatValue(record.b, record.unit) }}</span>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  entityAName: String,
  entityBName: String,
  data: Array
});

const columns = computed(() => [
  { title: '对比指标', dataIndex: 'name', key: 'name', width: '25%' },
  { title: '单位', dataIndex: 'unit', key: 'unit', width: '10%' },
  { title: props.entityAName, dataIndex: 'a', key: 'aValue', width: '20%' },
  { title: props.entityBName, dataIndex: 'b', key: 'bValue', width: '20%' },
  { title: '差异对比', key: 'comparison', width: '25%' },
]);

const formatValue = (value, unit) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0';
  if (unit === '万元') return num.toFixed(2);
  if (unit === '%') return num.toFixed(2);
  return num.toLocaleString('zh-CN');
};
</script>
