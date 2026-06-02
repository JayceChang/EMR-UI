<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <!-- 门诊人次汇总 -->
    <div class="bg-white p-5 rounded-xl shadow-lg border-l-4 border-indigo-500 transform hover:scale-[1.02] transition duration-300">
      <div class="flex justify-between items-center mb-2">
        <p class="text-sm font-medium text-gray-500">门诊人次</p>
        <i class="fas fa-user-injured text-indigo-500 text-xl"></i>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ formatNumber(data.totalOutpatientCount) }}</p>
      <p class="text-xs text-gray-400 mt-1">总计人次</p>
    </div>

    <!-- 门诊费用总额 -->
    <div class="bg-white p-5 rounded-xl shadow-lg border-l-4 border-yellow-500 transform hover:scale-[1.02] transition duration-300">
      <div class="flex justify-between items-center mb-2">
        <p class="text-sm font-medium text-gray-500">门诊费用总额</p>
        <i class="fas fa-money-bill-wave text-yellow-500 text-xl"></i>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ formatNumber(data.totalOutpatientFee, 2) }}</p>
      <p class="text-xs text-gray-400 mt-1">万元</p>
    </div>

    <!-- 门诊统筹总额 -->
    <div class="bg-white p-5 rounded-xl shadow-lg border-l-4 border-purple-500 transform hover:scale-[1.02] transition duration-300">
      <div class="flex justify-between items-center mb-2">
        <p class="text-sm font-medium text-gray-500">门诊统筹总额</p>
        <i class="fas fa-hand-holding-usd text-purple-500 text-xl"></i>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ formatNumber(data.totalMzTczfFee, 2) }}</p>
      <p class="text-xs text-gray-400 mt-1">万元</p>
    </div>

    <!-- 住院人次汇总 -->
    <div class="bg-white p-5 rounded-xl shadow-lg border-l-4 border-green-500 transform hover:scale-[1.02] transition duration-300">
      <div class="flex justify-between items-center mb-2">
        <p class="text-sm font-medium text-gray-500">住院人次</p>
        <i class="fas fa-hospital-user text-green-500 text-xl"></i>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ formatNumber(data.totalInpatientCount) }}</p>
      <p class="text-xs text-gray-400 mt-1">总计人次</p>
    </div>

    <!-- 住院费用总额 -->
    <div class="bg-white p-5 rounded-xl shadow-lg border-l-4 border-red-500 transform hover:scale-[1.02] transition duration-300">
      <div class="flex justify-between items-center mb-2">
        <p class="text-sm font-medium text-gray-500">住院费用总额</p>
        <i class="fas fa-wallet text-red-500 text-xl"></i>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ formatNumber(data.totalInpatientFee, 2) }}</p>
      <p class="text-xs text-gray-400 mt-1">万元</p>
    </div>

    <!-- 住院统筹总额 -->
    <div class="bg-white p-5 rounded-xl shadow-lg border-l-4 border-purple-500 transform hover:scale-[1.02] transition duration-300">
      <div class="flex justify-between items-center mb-2">
        <p class="text-sm font-medium text-gray-500">住院统筹总额</p>
        <i class="fas fa-hand-holding-usd text-purple-500 text-xl"></i>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ formatNumber(data.totalZyTczfFee, 2) }}</p>
      <p class="text-xs text-gray-400 mt-1">万元</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      totalOutpatientCount: 0,
      totalInpatientCount: 0,
      totalOutpatientFee: 0,
      totalInpatientFee: 0,
      totalCoordinationFee: 0
    })
  }
});

const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined || isNaN(num)) return '--';
  return Number(num).toLocaleString('zh-CN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  });
};
</script>

<style scoped>
</style>
