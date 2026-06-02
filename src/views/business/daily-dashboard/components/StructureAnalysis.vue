<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <h2 class="text-xl font-semibold mb-4 border-b pb-2 flex items-center text-gray-700">
      <i class="fas fa-chart-pie mr-2 text-blue-500"></i>
      门诊住院就诊分析
    </h2>

    <!-- 左右两栏布局 -->
    <div class="grid grid-cols-2 gap-6">
      <!-- 左边：门诊结构 -->
      <div class="border-r pr-6">
        <h3 class="font-medium text-lg mb-4 text-indigo-600 flex items-center">
          <i class="fas fa-stethoscope mr-2"></i>
          门诊
        </h3>
        <div class="space-y-4">
          <!-- 职工 -->
          <div class="p-3 bg-indigo-50 rounded-lg">
            <div class="flex justify-between text-sm font-medium mb-1">
              <span class="text-indigo-700">职工</span>
              <span class="text-indigo-600">{{ outpatientStaffRatio }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                :style="{ width: outpatientStaffRatio + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-2">
              <span>人次: <span class="font-medium text-gray-700">{{ formatNumber(data.outpatientStaffCount) }}</span></span>
              <span>费用: <span class="font-medium text-gray-700">{{ formatNumber(data.outpatientStaffFee, 2) }}</span> 万元</span>
            </div>
          </div>

          <!-- 居民 -->
          <div class="p-3 bg-indigo-50 rounded-lg">
            <div class="flex justify-between text-sm font-medium mb-1">
              <span class="text-indigo-700">居民</span>
              <span class="text-indigo-600">{{ outpatientResidentRatio }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-indigo-300 h-2.5 rounded-full transition-all duration-500"
                :style="{ width: outpatientResidentRatio + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-2">
              <span>人次: <span class="font-medium text-gray-700">{{ formatNumber(data.outpatientResidentCount) }}</span></span>
              <span>费用: <span class="font-medium text-gray-700">{{ formatNumber(data.outpatientResidentFee, 2) }}</span> 万元</span>
            </div>
          </div>
        </div>

        <!-- 门诊汇总 -->
        <div class="mt-4 pt-3 border-t border-indigo-100">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">总人次:</span>
            <span class="font-semibold text-indigo-600">{{ formatNumber(outpatientTotalCount) }}</span>
          </div>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-600">总费用:</span>
            <span class="font-semibold text-indigo-600">{{ formatNumber(outpatientTotalFee, 2) }} 万元</span>
          </div>
        </div>
      </div>

      <!-- 右边：住院结构 -->
      <div class="pl-2">
        <h3 class="font-medium text-lg mb-4 text-green-600 flex items-center">
          <i class="fas fa-hospital mr-2"></i>
          住院
        </h3>
        <div class="space-y-4">
          <!-- 职工 -->
          <div class="p-3 bg-green-50 rounded-lg">
            <div class="flex justify-between text-sm font-medium mb-1">
              <span class="text-green-700">职工</span>
              <span class="text-green-600">{{ inpatientStaffRatio }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                :style="{ width: inpatientStaffRatio + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-2">
              <span>人次: <span class="font-medium text-gray-700">{{ formatNumber(data.inpatientStaffCount) }}</span></span>
              <span>费用: <span class="font-medium text-gray-700">{{ formatNumber(data.inpatientStaffFee, 2) }}</span> 万元</span>
            </div>
          </div>

          <!-- 居民 -->
          <div class="p-3 bg-green-50 rounded-lg">
            <div class="flex justify-between text-sm font-medium mb-1">
              <span class="text-green-700">居民</span>
              <span class="text-green-600">{{ inpatientResidentRatio }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-green-300 h-2.5 rounded-full transition-all duration-500"
                :style="{ width: inpatientResidentRatio + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-2">
              <span>人次: <span class="font-medium text-gray-700">{{ formatNumber(data.inpatientResidentCount) }}</span></span>
              <span>费用: <span class="font-medium text-gray-700">{{ formatNumber(data.inpatientResidentFee, 2) }}</span> 万元</span>
            </div>
          </div>
        </div>

        <!-- 住院汇总 -->
        <div class="mt-4 pt-3 border-t border-green-100">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">总人次:</span>
            <span class="font-semibold text-green-600">{{ formatNumber(inpatientTotalCount) }}</span>
          </div>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-600">总费用:</span>
            <span class="font-semibold text-green-600">{{ formatNumber(inpatientTotalFee, 2) }} 万元</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      outpatientStaffCount: 0,
      outpatientResidentCount: 0,
      outpatientStaffFee: 0,
      outpatientResidentFee: 0,
      inpatientStaffCount: 0,
      inpatientResidentCount: 0,
      inpatientStaffFee: 0,
      inpatientResidentFee: 0
    })
  }
});

// 门诊总计
const outpatientTotalCount = computed(() => {
  return (props.data.outpatientStaffCount || 0) + (props.data.outpatientResidentCount || 0);
});

const outpatientTotalFee = computed(() => {
  return (props.data.outpatientStaffFee || 0) + (props.data.outpatientResidentFee || 0);
});

// 住院总计
const inpatientTotalCount = computed(() => {
  return (props.data.inpatientStaffCount || 0) + (props.data.inpatientResidentCount || 0);
});

const inpatientTotalFee = computed(() => {
  return (props.data.inpatientStaffFee || 0) + (props.data.inpatientResidentFee || 0);
});

// 门诊结构比例
const outpatientStaffRatio = computed(() => {
  const total = outpatientTotalCount.value;
  if (total === 0) return 0;
  return ((props.data.outpatientStaffCount / total) * 100).toFixed(1);
});

const outpatientResidentRatio = computed(() => {
  const total = outpatientTotalCount.value;
  if (total === 0) return 0;
  return ((props.data.outpatientResidentCount / total) * 100).toFixed(1);
});

// 住院结构比例
const inpatientStaffRatio = computed(() => {
  const total = inpatientTotalCount.value;
  if (total === 0) return 0;
  return ((props.data.inpatientStaffCount / total) * 100).toFixed(1);
});

const inpatientResidentRatio = computed(() => {
  const total = inpatientTotalCount.value;
  if (total === 0) return 0;
  return ((props.data.inpatientResidentCount / total) * 100).toFixed(1);
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
