<template>
  <section class="bg-white p-6 rounded-xl shadow-lg" style="height: 412px;">
    <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-filter text-blue-600 mr-2"></i>
      数据筛选
    </h3>
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          时间范围:
        </label>
        <a-select v-model:value="localParams.timeRange" class="w-full" placeholder="选择时间范围">
          <a-select-option value="lastMonth">近一月</a-select-option>
          <a-select-option value="lastQuarter">近一季度</a-select-option>
          <a-select-option value="lastYear">近一年</a-select-option>
          <a-select-option value="custom">自定义</a-select-option>
        </a-select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          数据类型:
        </label>
        <a-select v-model:value="localParams.dataType" class="w-full" placeholder="选择数据类型">
          <a-select-option value="all">全部</a-select-option>
          <a-select-option value="cityOut">市域外</a-select-option>
          <a-select-option value="provinceOut">省域外</a-select-option>
        </a-select>
      </div>
      <a-button
        type="primary"
        class="w-full"
        :loading="loading"
        @click="handleApply"
      >
        <i class="fas fa-search mr-2"></i>
        应用筛选
      </a-button>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['apply']);

// Local filter parameters
const localParams = reactive({
  timeRange: 'lastYear',
  dataType: 'all'
});

// Event handlers
const handleApply = () => {
  emit('apply', { ...localParams });
};
</script>

<style scoped>
</style>
