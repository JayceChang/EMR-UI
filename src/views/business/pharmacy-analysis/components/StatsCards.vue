<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="bg-white rounded-xl shadow-card p-5 card-transition hover:shadow-card-hover transform hover:-translate-y-1"
    >
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="text-info text-sm font-medium">
            {{ stat.title }}
          </p>
          <h3 class="text-2xl md:text-3xl font-bold mt-1">{{ stat.prefix }}{{ formatValue(stat.value) }}</h3>
        </div>
        <div :style="{ backgroundColor: `${stat.color}10` }" class="p-3 rounded-lg">
          <i :class="[stat.icon, 'text-xl']" :style="{ color: stat.color }"></i>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <div class="flex items-center text-sm" :class="trendClass(stat.yoy)">
          <i v-if="hasTrendArrow(stat.yoy)" :class="trendArrowIcon(stat.yoy)" class="mr-1"></i>
          <span>{{ formatTrendPercent(stat.yoy) }}%</span>
          <span class="text-info ml-1">同比</span>
        </div>
        <div class="flex items-center text-sm" :class="trendClass(stat.mom)">
          <i v-if="hasTrendArrow(stat.mom)" :class="trendArrowIcon(stat.mom)" class="mr-1"></i>
          <span>{{ formatTrendPercent(stat.mom) }}%</span>
          <span class="text-info ml-1">环比</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    stats: {
      type: Array,
      default: () => [],
    },
  });

  // Format large numbers
  const formatValue = (value) => {
    if (value >= 10000) {
      return value.toLocaleString();
    }
    return value.toString();
  };

  const trendClass = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num) || Math.abs(num) < 0.005) return '';
    return num > 0 ? 'text-danger' : 'text-success';
  };

  const hasTrendArrow = (value) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) && Math.abs(num) >= 0.005;
  };

  const trendArrowIcon = (value) => {
    const num = Number(value ?? 0);
    return num > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  };

  const formatTrendPercent = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return '0';
    return Math.abs(num);
  };
</script>

<style scoped>
  .card-transition {
    transition: all 0.3s ease;
  }
</style>
