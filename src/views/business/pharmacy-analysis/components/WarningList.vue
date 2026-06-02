<template>
  <div class="bg-white rounded-xl shadow-card p-5">
    <div class="flex items-center justify-between mb-5">
      <h3 class="font-bold text-lg">
        业务异常增加警示
      </h3>
      <span class="bg-danger/10 text-danger text-xs px-2 py-1 rounded-full">
        {{ warnings.length }}条预警
      </span>
    </div>
    <div class="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
      <div
        v-for="warning in warnings"
        :key="warning.id"
        :class="getWarningClass(warning.level)"
        class="border-l-4 pl-4 py-3 rounded-r-lg"
      >
        <div class="flex justify-between items-start">
          <h4 class="font-medium text-sm">
            {{ warning.name }}
          </h4>
          <span :class="getBadgeClass(warning.level)" class="text-xs px-2 py-0.5 rounded-full">
            {{ warning.type }}
          </span>
        </div>
        <p class="text-info text-xs mt-1">
          {{ warning.message }}
        </p>
        <div class="flex justify-between items-center mt-2">
          <span class="text-xs text-dark-2">
            {{ warning.time }}
          </span>
          <button class="text-primary text-xs flex items-center hover:underline">
            查看详情
            <i class="fas fa-angle-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
    <a-button
      class="w-full mt-4 py-2 text-sm border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
      @click="handleViewAll"
    >
      查看全部异常记录
      <i class="fas fa-angle-right ml-1"></i>
    </a-button>
  </div>
</template>

<script setup>
const props = defineProps({
  warnings: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['view-all']);

// Get warning styling class
const getWarningClass = (level) => {
  const classMap = {
    danger: 'border-danger bg-danger/5',
    warning: 'border-warning bg-warning/5',
    info: 'border-info bg-info/5'
  };
  return classMap[level] || 'border-info bg-info/5';
};

// Get badge styling class
const getBadgeClass = (level) => {
  const classMap = {
    danger: 'bg-danger/10 text-danger',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info'
  };
  return classMap[level] || 'bg-info/10 text-info';
};

const handleViewAll = () => {
  emit('view-all');
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
