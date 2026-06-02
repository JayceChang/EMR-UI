<template>
  <div class="bg-white rounded-xl p-5 shadow-md">
    <h3 class="text-lg font-semibold mb-4 flex items-center">
      <i class="fas fa-chart-pie text-blue-600 mr-2"></i>
      数据概览
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 总住院人次 -->
      <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
        <div>
          <p class="text-sm text-gray-600">总住院人次</p>
          <p class="text-2xl font-bold text-blue-600 mt-1">{{ formatNumber(data.totalAdmissions) }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
          <i class="fas fa-user-injured text-blue-600 text-xl"></i>
        </div>
      </div>

      <!-- 次均费用 -->
      <div class="flex justify-between items-center p-4 bg-teal-50 rounded-lg">
        <div>
          <p class="text-sm text-gray-600">次均费用</p>
          <p class="text-2xl font-bold text-teal-600 mt-1">{{ formatCurrency(data.avgCost) }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
          <i class="fas fa-wallet text-teal-600 text-xl"></i>
        </div>
      </div>

      <!-- 报销病历 -->
      <div class="flex justify-between items-center p-4 bg-green-50 rounded-lg">
        <div>
          <p class="text-sm text-gray-600">报销病历</p>
          <p class="text-2xl font-bold text-green-600 mt-1">{{ formatNumber(data.reimbursedCases) }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
          <i class="fas fa-file-invoice-dollar text-green-600 text-xl"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      totalAdmissions: 0,
      avgCost: 0,
      reimbursedCases: 0
    })
  }
});

// 格式化数字（添加千分位）
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
};

// 格式化货币
const formatCurrency = (num) => {
  if (num === null || num === undefined) return '¥0';
  return '¥' + num.toLocaleString();
};
</script>

<style scoped>
</style>
