<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-hospital-alt text-orange-500 mr-3"></i>
      医疗集团数据分析
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- RMYy Group -->
      <div class="bg-yellow-50 p-6 rounded-lg shadow-inner border border-yellow-200">
        <h3 class="text-xl font-semibold text-gray-700 mb-3 flex items-center">
          <i class="fas fa-building mr-2 text-yellow-600"></i>
          {{ data.rmyy?.name || '安阳市人民医院医疗集团' }}
        </h3>
        <div class="space-y-3 text-gray-700">
          <p class="flex justify-between items-center">
            住院人次:
            <span class="font-bold text-lg">
              {{ data.rmyy?.hospitalizations?.toLocaleString() || '--' }}
            </span>
            <span class="text-sm ml-2 inline-flex items-center" :class="trendClass(data.rmyy?.hospitalizationsYOY)">
              <i v-if="hasTrendArrow(data.rmyy?.hospitalizationsYOY)" class="fas mr-1" :class="trendArrowIcon(data.rmyy?.hospitalizationsYOY)"></i>
              {{ formatTrendPercent(data.rmyy?.hospitalizationsYOY) }}
            </span>
          </p>
          <p class="flex justify-between items-center">
            次均费用:
            <span class="font-bold text-lg"> ¥{{ data.rmyy?.avgCost?.toFixed(2) || '--' }} </span>
            <span class="text-sm ml-2 inline-flex items-center" :class="trendClass(data.rmyy?.avgCostYOY)">
              <i v-if="hasTrendArrow(data.rmyy?.avgCostYOY)" class="fas mr-1" :class="trendArrowIcon(data.rmyy?.avgCostYOY)"></i>
              {{ formatTrendPercent(data.rmyy?.avgCostYOY) }}
            </span>
          </p>
          <p class="flex justify-between items-center">
            总费用:
            <span class="font-bold text-lg"> ¥{{ formatTotalCost(data.rmyy?.totalCost) }} </span>
            <span class="text-sm ml-2 inline-flex items-center" :class="trendClass(data.rmyy?.totalCostYOY)">
              <i v-if="hasTrendArrow(data.rmyy?.totalCostYOY)" class="fas mr-1" :class="trendArrowIcon(data.rmyy?.totalCostYOY)"></i>
              {{ formatTrendPercent(data.rmyy?.totalCostYOY) }}
            </span>
          </p>
          <p class="flex justify-between items-center">
            次均统筹报销:
            <span class="font-bold text-lg"> ¥{{ data.rmyy?.avgReimbursement?.toFixed(2) || '--' }} </span>
            <span class="text-sm ml-2 inline-flex items-center" :class="trendClass(data.rmyy?.avgReimbursementYOY)">
              <i v-if="hasTrendArrow(data.rmyy?.avgReimbursementYOY)" class="fas mr-1" :class="trendArrowIcon(data.rmyy?.avgReimbursementYOY)"></i>
              {{ formatTrendPercent(data.rmyy?.avgReimbursementYOY) }}
            </span>
          </p>
        </div>
        <button
          class="mt-4 w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition duration-300 ease-in-out text-sm"
          @click="handleDrillDown('rmyy')"
        >
          <i class="fas fa-search-plus mr-2"></i>
          明细详情
        </button>
      </div>

      <!-- ZYY Group -->
      <div class="bg-red-50 p-6 rounded-lg shadow-inner border border-red-200">
        <h3 class="text-xl font-semibold text-gray-700 mb-3 flex items-center">
          <i class="fas fa-clinic-medical mr-2 text-red-600"></i>
          {{ data.zyy?.name || '安阳市中医院医疗集团' }}
        </h3>
        <div class="space-y-3 text-gray-700">
          <p class="flex justify-between items-center">
            住院人次:
            <span class="font-bold text-lg">
              {{ data.zyy?.hospitalizations?.toLocaleString() || '--' }}
            </span>
            <span class="text-sm ml-2 inline-flex items-center" :class="trendClass(data.zyy?.hospitalizationsYOY)">
              <i v-if="hasTrendArrow(data.zyy?.hospitalizationsYOY)" class="fas mr-1" :class="trendArrowIcon(data.zyy?.hospitalizationsYOY)"></i>
              {{ formatTrendPercent(data.zyy?.hospitalizationsYOY) }}
            </span>
          </p>
          <p class="flex justify-between items-center">
            次均费用:
            <span class="font-bold text-lg"> ¥{{ data.zyy?.avgCost?.toFixed(2) || '--' }} </span>
            <span class="text-sm ml-2 inline-flex items-center" :class="trendClass(data.zyy?.avgCostYOY)">
              <i v-if="hasTrendArrow(data.zyy?.avgCostYOY)" class="fas mr-1" :class="trendArrowIcon(data.zyy?.avgCostYOY)"></i>
              {{ formatTrendPercent(data.zyy?.avgCostYOY) }}
            </span>
          </p>
          <p class="flex justify-between items-center">
            总费用:
            <span class="font-bold text-lg"> ¥{{ formatTotalCost(data.zyy?.totalCost) }} </span>
            <span class="text-sm ml-2 inline-flex items-center" :class="trendClass(data.zyy?.totalCostYOY)">
              <i v-if="hasTrendArrow(data.zyy?.totalCostYOY)" class="fas mr-1" :class="trendArrowIcon(data.zyy?.totalCostYOY)"></i>
              {{ formatTrendPercent(data.zyy?.totalCostYOY) }}
            </span>
          </p>
          <p class="flex justify-between items-center">
            次均统筹报销:
            <span class="font-bold text-lg"> ¥{{ data.zyy?.avgReimbursement?.toFixed(2) || '--' }} </span>
            <span class="text-sm ml-2 inline-flex items-center" :class="trendClass(data.zyy?.avgReimbursementYOY)">
              <i v-if="hasTrendArrow(data.zyy?.avgReimbursementYOY)" class="fas mr-1" :class="trendArrowIcon(data.zyy?.avgReimbursementYOY)"></i>
              {{ formatTrendPercent(data.zyy?.avgReimbursementYOY) }}
            </span>
          </p>
        </div>
        <button
          class="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 ease-in-out text-sm"
          @click="handleDrillDown('zyy')"
        >
          <i class="fas fa-search-plus mr-2"></i>
          明细详情
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['drill-down']);

  // Format total cost
  const formatTotalCost = (value) => {
    if (!value) return '--';
    return `${(value / 10000).toFixed(2)}万`;
  };

  const parseTrendValue = (value) => {
    if (value === null || value === undefined) return 0;
    const text = String(value)
      .replace(/[%\s,↑↓]/g, '')
      .trim();
    if (!text) return 0;
    const num = Number(text);
    return Number.isFinite(num) ? num : 0;
  };

  const trendClass = (value) => {
    const num = parseTrendValue(value);
    if (Math.abs(num) < 0.05) return '';
    return num > 0 ? 'text-red-600' : 'text-green-600';
  };

  const hasTrendArrow = (value) => {
    const num = parseTrendValue(value);
    return Math.abs(num) >= 0.05;
  };

  const trendArrowIcon = (value) => {
    const num = parseTrendValue(value);
    return num > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  };

  const formatTrendPercent = (value) => {
    if (value === null || value === undefined) return '--';
    const num = parseTrendValue(value);
    return `${Math.abs(num).toFixed(1)}%`;
  };

  // Handle drill down
  const handleDrillDown = (groupName) => {
    emit('drill-down', groupName);
  };
</script>
