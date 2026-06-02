<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <h2 class="text-xl font-semibold mb-4 border-b pb-2 flex items-center text-gray-700">
      <i class="fas fa-trophy mr-2 text-yellow-600"></i>
      住院诊断排行榜
    </h2>

    <!-- 左右两列布局 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 域内住院诊断排行 -->
      <div>
        <div class="text-base font-medium text-green-600 mb-3 flex items-center">
          <span class="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          域内住院诊断排行
        </div>
        <div class="h-64 overflow-y-auto">
          <ol class="space-y-2">
            <li
              v-for="(item, index) in inRegionData"
              :key="'in-' + index"
              class="flex justify-between items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg shadow-sm border-l-4 border-green-400 cursor-pointer transition duration-150"
              @click="handleItemClick(item, 'in')"
            >
              <div class="flex items-center">
                <span class="text-lg font-bold w-8 text-center text-green-600">{{ index + 1 }}</span>
                <span class="ml-3 text-base font-medium text-gray-800">{{ item.name }}</span>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-gray-900">{{ formatNumber(item.count) }}例</p>
                <p class="text-xs text-gray-500">占比:{{ item.rate }}%</p>
              </div>
            </li>
          </ol>
          <p v-if="!inRegionData || inRegionData.length === 0" class="text-center text-gray-500 py-10">
            暂无数据
          </p>
        </div>
      </div>

      <!-- 域外住院诊断排行 -->
      <div>
        <div class="text-base font-medium text-red-600 mb-3 flex items-center">
          <span class="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
          域外住院诊断排行
        </div>
        <div class="h-64 overflow-y-auto">
          <ol class="space-y-2">
            <li
              v-for="(item, index) in outRegionData"
              :key="'out-' + index"
              class="flex justify-between items-center p-3 bg-red-50 hover:bg-red-100 rounded-lg shadow-sm border-l-4 border-red-400 cursor-pointer transition duration-150"
              @click="handleItemClick(item, 'out')"
            >
              <div class="flex items-center">
                <span class="text-lg font-bold w-8 text-center text-red-600">{{ index + 1 }}</span>
                <span class="ml-3 text-base font-medium text-gray-800">{{ item.name }}</span>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-gray-900">{{ formatNumber(item.count) }}例</p>
                <p class="text-xs text-gray-500">占比:{{ item.rate }}%</p>
              </div>
            </li>
          </ol>
          <p v-if="!outRegionData || outRegionData.length === 0" class="text-center text-gray-500 py-10">
            暂无数据
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  inRegionData: {
    type: Array,
    default: () => []
  },
  outRegionData: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['item-click']);

const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '--';
  return Number(num).toLocaleString('zh-CN');
};

const handleItemClick = (item, type) => {
  emit('item-click', { ...item, regionType: type });
};
</script>

<style scoped>
</style>
