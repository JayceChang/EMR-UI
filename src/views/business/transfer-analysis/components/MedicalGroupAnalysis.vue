<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-hospital-user text-blue-600 mr-2"></i>
      {{ data.name }}
    </h3>
    <div class="space-y-3 text-gray-700 mb-4">
      <p class="flex justify-between items-center">
        <span class="font-medium">外转人次数:</span>
        <span class="text-blue-600 font-bold">
          {{ data.transfers?.toLocaleString() }}
          <span :class="trendClass(data.transfersYoy)" class="text-sm ml-2">
            <i v-if="hasTrendArrow(data.transfersYoy)" :class="trendArrowIcon(data.transfersYoy)"></i>
            {{ formatRate(data.transfersYoy) }}% (同比)
          </span>
        </span>
      </p>
      <p class="flex justify-between items-center">
        <span class="font-medium">总费用:</span>
        <span class="text-blue-600 font-bold">
          ¥ {{ formatYi(data.totalCost) }}亿元
          <span :class="trendClass(data.totalCostYoy)" class="text-sm ml-2">
            <i v-if="hasTrendArrow(data.totalCostYoy)" :class="trendArrowIcon(data.totalCostYoy)"></i>
            {{ Math.abs(data.totalCostYoy)?.toFixed(1) }}% (同比)
          </span>
        </span>
      </p>
      <p class="flex justify-between items-center">
        <span class="font-medium">统筹总支出:</span>
        <span class="text-blue-600 font-bold">
          ¥ {{ formatYi(data.totalCoordinationCost) }}亿元
          <span :class="trendClass(data.totalCoordinationCostYoy)" class="text-sm ml-2">
            <i v-if="hasTrendArrow(data.totalCoordinationCostYoy)" :class="trendArrowIcon(data.totalCoordinationCostYoy)"></i>
            {{ formatRate(data.totalCoordinationCostYoy) }}% (同比)
          </span>
        </span>
      </p>
      <p class="flex justify-between items-center">
        <span class="font-medium">次均费用:</span>
        <span class="text-blue-600 font-bold">
          ¥ {{ data.avgCost?.toLocaleString() }}
          <span :class="trendClass(data.avgCostYoy)" class="text-sm ml-2">
            <i v-if="hasTrendArrow(data.avgCostYoy)" :class="trendArrowIcon(data.avgCostYoy)"></i>
            {{ formatRate(data.avgCostYoy) }}% (同比)
          </span>
        </span>
      </p>
      <p class="flex justify-between items-center">
        <span class="font-medium">次均统筹报销:</span>
        <span class="text-blue-600 font-bold">
          ¥ {{ data.avgCoordinationCost?.toLocaleString() }}
          <span :class="trendClass(data.avgCoordinationCostYoy)" class="text-sm ml-2">
            <i v-if="hasTrendArrow(data.avgCoordinationCostYoy)" :class="trendArrowIcon(data.avgCoordinationCostYoy)"></i>
            {{ formatRate(data.avgCoordinationCostYoy) }}% (同比)
          </span>
        </span>
      </p>
      <p class="flex justify-between items-center">
        <span class="font-medium">外转率:</span>
        <span class="text-blue-600 font-bold">
          {{ formatRate(data.outwardTransferRate) }}%
          <span :class="trendClass(data.outwardTransferIncrease)" class="text-sm ml-2">
            <i v-if="hasTrendArrow(data.outwardTransferIncrease)" :class="trendArrowIcon(data.outwardTransferIncrease)"></i>
            {{ formatRate(data.outwardTransferIncrease) }}% (同比)
          </span>
        </span>
      </p>
    </div>
    <div class="w-full h-64">
      <HospitalGroupTrendChart :data="data.trendData" />
    </div>
  </div>
</template>

<script setup>
  import HospitalGroupTrendChart from './HospitalGroupTrendChart.vue';

  defineProps({
    data: {
      type: Object,
      required: true,
    },
  });

  const trendClass = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num) || num === 0) return '';
    return num > 0 ? 'text-red-500' : 'text-green-500';
  };

  const hasTrendArrow = (value) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) && Math.abs(num) >= 0.005;
  };

  const trendArrowIcon = (value) => {
    const num = Number(value ?? 0);
    return num > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  };

  const formatRate = (value) => Math.abs(Number(value ?? 0)).toFixed(1);

  const formatYi = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return '0.00';
    return num.toFixed(2);
  };
</script>

<style scoped></style>
