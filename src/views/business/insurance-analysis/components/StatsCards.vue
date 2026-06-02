<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    <div class="bg-white rounded-xl shadow-md p-4 flex items-center justify-between transition duration-300 ease-in-out hover:shadow-lg">
      <div>
        <p class="text-gray-500 text-sm mb-1">
          全市参保人数
          <a-tooltip>
            <template #title>当前年度职工与居民参保总人数</template>
            <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
          </a-tooltip>
        </p>
        <p class="text-2xl font-extrabold text-blue-700">{{ totalInsuredCount }}</p>
      </div>
      <div class="bg-blue-100 p-3 rounded-full">
        <i class="fas fa-users text-blue-600 text-2xl"></i>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-md p-4 flex items-center justify-between transition duration-300 ease-in-out hover:shadow-lg">
      <div>
        <p class="text-gray-500 text-sm mb-1">
          全市医保征缴资金
          <a-tooltip>
            <template #title>职工与居民基本医保统筹基金年度收入总额</template>
            <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
          </a-tooltip>
        </p>
        <p class="text-2xl font-extrabold text-green-700">{{ totalCollectionAmount }}</p>
      </div>
      <div class="bg-green-100 p-3 rounded-full">
        <i class="fas fa-money-bill-wave text-green-600 text-2xl"></i>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-md p-4 flex items-center justify-between transition duration-300 ease-in-out hover:shadow-lg">
      <div>
        <p class="text-gray-500 text-sm mb-1">
          职工人数参保占比
          <a-tooltip>
            <template #title>职工参保人数 / 全市参保人数</template>
            <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
          </a-tooltip>
        </p>
        <p class="text-2xl font-extrabold text-emerald-700">{{ formatPercent(employeeInsuredRatio) }}</p>
      </div>
      <div class="bg-emerald-100 p-3 rounded-full">
        <i class="fas fa-user-tie text-emerald-600 text-2xl"></i>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-md p-4 flex items-center justify-between transition duration-300 ease-in-out hover:shadow-lg">
      <div>
        <p class="text-gray-500 text-sm mb-1">
          居民人数参保占比
          <a-tooltip>
            <template #title>居民参保人数 / 全市参保人数</template>
            <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
          </a-tooltip>
        </p>
        <p class="text-2xl font-extrabold text-orange-700">{{ formatPercent(residentInsuredRatio) }}</p>
      </div>
      <div class="bg-orange-100 p-3 rounded-full">
        <i class="fas fa-people-group text-orange-600 text-2xl"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';

  defineProps({
    totalInsuredCount: {
      type: String,
      default: '--',
    },
    totalCollectionAmount: {
      type: String,
      default: '--',
    },
    insuredIncrease: {
      type: Number,
      default: 0,
    },
    collectionIncrease: {
      type: Number,
      default: 0,
    },
    employeeInsuredRatio: {
      type: [Number, String],
      default: 0,
    },
    residentInsuredRatio: {
      type: [Number, String],
      default: 0,
    },
  });

  const formatPercent = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) {
      return '0.00%';
    }
    return `${num.toFixed(2)}%`;
  };
</script>
