<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- 总住院人次 -->
    <div class="flex justify-between items-center p-4 bg-light rounded-lg">
      <div>
        <p class="text-sm text-gray-600">总住院人次</p>
        <p class="text-2xl font-bold text-primary mt-1">
          {{ data.totalPatients.toLocaleString() }}
        </p>
      </div>
      <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
        <i class="fas fa-user-injured text-primary text-xl"></i>
      </div>
    </div>

    <!-- 外转次均费用 -->
    <div class="flex justify-between items-center p-4 bg-secondary/10 rounded-lg">
      <div>
        <p class="text-sm text-gray-600">外转次均费用</p>
        <p class="text-2xl font-bold text-secondary mt-1">
          ¥{{ data.avgCost.toLocaleString() }}
        </p>
      </div>
      <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
        <i class="fas fa-wallet text-secondary text-xl"></i>
      </div>
    </div>

    <!-- 报销病历 -->
    <div class="flex justify-between items-center p-4 bg-success/10 rounded-lg">
      <div>
        <p class="text-sm text-gray-600">外转次均统筹费用</p>
        <p class="text-2xl font-bold text-success mt-1">
          {{ data.avgTczfCost.toLocaleString() }}
        </p>
      </div>
      <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
        <i class="fas fa-file-invoice-dollar text-success text-xl"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    default: () => ({
      totalPatients: 0,
      avgCost: 0,
      totalReimbursement: 0,
      avgTczfCost: 0
    })
  }
});
</script>

<style scoped>
</style>
