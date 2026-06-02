<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
    <!-- Total Expense Card -->
    <div
      class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <i class="fas fa-coins text-3xl opacity-80"></i>
        </div>
        <div class="text-right">
          <div class="text-sm opacity-90">总费用</div>
          <div class="text-3xl font-bold">
            <a-skeleton-input v-if="loading" :active="true" size="small" />
            <span v-else>{{ formatMoney(totalExpense) }}</span>
          </div>
          <div class="text-xs opacity-80 mt-1">万元</div>
        </div>
      </div>
      <div class="flex items-center text-sm">
        <i v-if="hasTrendArrow(growthRate)" :class="['fas', trendArrowIcon(growthRate), trendClass(growthRate), 'mr-2']"></i>
        <span>同比增长 {{ formatPercent(growthRate) }}%</span>
      </div>
    </div>

    <!-- Employee Expense Card -->
    <div
      class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <i class="fas fa-user-tie text-3xl opacity-80"></i>
        </div>
        <div class="text-right">
          <div class="text-sm opacity-90">职工医保费用</div>
          <div class="text-3xl font-bold">
            <a-skeleton-input v-if="loading" :active="true" size="small" />
            <span v-else>{{ formatMoney(employeeExpense) }}</span>
          </div>
          <div class="text-xs opacity-80 mt-1">万元</div>
        </div>
      </div>
      <div class="flex items-center text-sm">
        <i class="fas fa-chart-pie mr-2"></i>
        <span>占比 {{ formatPercent(employeeRatio) }}%</span>
      </div>
    </div>

    <!-- Resident Expense Card -->
    <div
      class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <i class="fas fa-users text-3xl opacity-80"></i>
        </div>
        <div class="text-right">
          <div class="text-sm opacity-90">居民医保费用</div>
          <div class="text-3xl font-bold">
            <a-skeleton-input v-if="loading" :active="true" size="small" />
            <span v-else>{{ formatMoney(residentExpense) }}</span>
          </div>
          <div class="text-xs opacity-80 mt-1">万元</div>
        </div>
      </div>
      <div class="flex items-center text-sm">
        <i class="fas fa-chart-pie mr-2"></i>
        <span>占比 {{ formatPercent(residentRatio) }}%</span>
      </div>
    </div>

    <!-- Average Expense Card -->
    <div
      class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <i class="fas fa-calculator text-3xl opacity-80"></i>
        </div>
        <div class="text-right">
          <div class="text-sm opacity-90">人均费用</div>
          <div class="text-3xl font-bold">
            <a-skeleton-input v-if="loading" :active="true" size="small" />
            <span v-else>{{ formatMoney(avgExpense) }}</span>
          </div>
          <div class="text-xs opacity-80 mt-1">元</div>
        </div>
      </div>
      <div class="flex items-center text-sm">
        <i class="fas fa-info-circle mr-2"></i>
        <span>参保人员平均</span>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    totalExpense: {
      type: Number,
      default: 0,
    },
    employeeExpense: {
      type: Number,
      default: 0,
    },
    residentExpense: {
      type: Number,
      default: 0,
    },
    growthRate: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  });

  // Computed properties
  const employeeRatio = computed(() => {
    if (props.totalExpense === 0) return 0;
    return (props.employeeExpense / props.totalExpense) * 100;
  });

  const residentRatio = computed(() => {
    if (props.totalExpense === 0) return 0;
    return (props.residentExpense / props.totalExpense) * 100;
  });

  const avgExpense = computed(() => {
    // Assume total participants is 4,750,000 (this should come from API)
    const totalParticipants = 4750000;
    if (totalParticipants === 0) return 0;
    return props.totalExpense / totalParticipants;
  });

  // Format money (convert to 万元)
  const formatMoney = (value) => {
    if (value === null || value === undefined) return '0';
    const wan = value / 10000;
    return wan.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format percentage
  const formatPercent = (value) => {
    if (value === null || value === undefined) return '0.00';
    return Number(value).toFixed(2);
  };

  const trendClass = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num) || Math.abs(num) < 0.005) return '';
    return num > 0 ? 'text-red-300' : 'text-green-300';
  };

  const hasTrendArrow = (value) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) && Math.abs(num) >= 0.005;
  };

  const trendArrowIcon = (value) => {
    const num = Number(value ?? 0);
    return num > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  };
</script>

<style scoped>
  /* Add any additional styles here */
</style>
