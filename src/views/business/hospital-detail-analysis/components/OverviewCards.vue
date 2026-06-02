<template>
  <div class="bg-white rounded-xl p-5 filter-card">
    <h3 class="text-lg font-semibold mb-4 flex items-center">
      <i class="fas fa-chart-pie text-primary mr-2"></i>
      数据概览
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 总住院人次 -->
      <div class="flex justify-between items-center p-4 bg-light rounded-lg">
        <div>
          <p class="text-sm text-gray-600">总住院人次
            <a-tooltip>
                      <template #title>当前年度住院总人次</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
          </p>
          <p class="text-2xl font-bold text-primary mt-1">
            {{ data.totalAdmissions?.toLocaleString() || '--' }}
          </p>
        </div>
        <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
          <i class="fas fa-user-injured text-primary text-xl"></i>
        </div>
      </div>

      <!-- 次均费用 -->
      <div class="flex justify-between items-center p-4 bg-secondary/10 rounded-lg">
        <div>
          <p class="text-sm text-gray-600">次均费用
            <a-tooltip>
                      <template #title>次均费用 = 住院总费用 / 住院总人次</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
          </p>
          <p class="text-2xl font-bold text-secondary mt-1">
            ¥{{ data.avgCost?.toLocaleString() || '--' }}
          </p>
        </div>
        <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
          <i class="fas fa-wallet text-secondary text-xl"></i>
        </div>
      </div>

      <!-- 报销病历 -->
      <div class="flex justify-between items-center p-4 bg-success/10 rounded-lg">
        <div>
          <p class="text-sm text-gray-600">次均统筹费用
            <a-tooltip>
                      <template #title>次均统筹费用 = 住院统筹总费用 / 住院总人次</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
          </p>
          <p class="text-2xl font-bold text-success mt-1">
            {{ data.avgReimbursement?.toLocaleString() || '--' }}
          </p>
        </div>
        <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
          <i class="fas fa-file-invoice-dollar text-success text-xl"></i>
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
      totalReimbursed: 0
    })
  }
});
</script>

<style scoped>
.filter-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
