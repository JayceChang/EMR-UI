<template>
  <div class="bg-white rounded-xl shadow-lg p-6" style="height: 584px">
    <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-exclamation-triangle text-red-600 mr-2"></i>
      医保资金使用支出预警
    </h2>
    <div class="space-y-3">
      <div
        v-for="(warning, index) in warnings"
        :key="index"
        :class="getWarningClass(warning.level)"
        class="p-4 rounded-md flex items-center justify-between"
      >
        <div>
          <p class="font-bold">{{ warning.district }}</p>
          <p class="text-sm">
            {{ warning.message }}
            <span class="font-semibold"> {{ warning.percentage }}% </span>
          </p>
        </div>
        <!-- 合并为一个 :class，使用对象语法组合多个类 -->
        <i
          :class="{
            [getIconClass(warning.level)]: true, // 执行方法获取的类名
            'text-xl': true, // 固定类名
            'animate-pulse': warning.level === 'high', // 条件类名
          }"
        ></i>
      </div>
    </div>
    <button
      class="mt-5 w-full bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
    >
      <i class="fas fa-chart-pie mr-2"></i>
      查看预警详情
    </button>
  </div>
</template>

<script setup>
  const props = defineProps({
    warnings: {
      type: Array,
      default: () => [],
    },
  });

  // Get warning class based on level
  const getWarningClass = (level) => {
    if (level === 'high') {
      return 'bg-red-50 border-l-4 border-red-500 text-red-800';
    } else if (level === 'medium') {
      return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800';
    } else {
      return 'bg-blue-50 border-l-4 border-blue-500 text-blue-800';
    }
  };

  // Get icon class based on level
  const getIconClass = (level) => {
    if (level === 'high') {
      return 'fas fa-bell text-red-600';
    } else if (level === 'medium') {
      return 'fas fa-bell text-yellow-600';
    } else {
      return 'fas fa-bell text-blue-600';
    }
  };
</script>
