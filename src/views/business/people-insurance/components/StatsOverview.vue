<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- 参保人数 -->
    <div class="bg-white rounded-xl p-5 card-shadow transition-all duration-300 hover:shadow-lg hover:scale-105 transform">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">
            参保人数
            <a-tooltip>
              <template #title>年度{{ insuredTypeText }}参保总人数</template>
              <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
            </a-tooltip>
          </p>
          <h4 class="text-2xl font-bold mt-1">
            {{ formatNumber(statsData.insuredCount) }}
          </h4>
          <div class="flex items-center mt-2 text-sm" :class="trendClass(statsData.insuredIncrease)">
            <i v-if="hasTrendArrow(statsData.insuredIncrease)" class="fas mr-1" :class="trendArrowIcon(statsData.insuredIncrease)"></i>
            <span>{{ formatTrendPercent(statsData.insuredIncrease) }}%</span>
            <span class="text-gray-500 ml-1">同比</span>
            <a-tooltip>
              <template #title>{{ yoyTooltipText }}</template>
              <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
            </a-tooltip>
          </div>
        </div>
        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <i class="fas fa-users text-xl"></i>
        </div>
      </div>
    </div>

    <!-- 统筹总金额 -->
    <div class="bg-white rounded-xl p-5 card-shadow transition-all duration-300 hover:shadow-lg hover:scale-105 transform">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">
            统筹总金额
            <a-tooltip>
              <template #title>{{ insuredTypeText }}基本医保统筹基金年度收入总额</template>
              <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
            </a-tooltip>
          </p>
          <h4 class="text-2xl font-bold mt-1">¥{{ formatNumber(statsData.totalFund) }}</h4>
          <div class="flex items-center mt-2 text-sm" :class="trendClass(statsData.fundIncrease)">
            <i v-if="hasTrendArrow(statsData.fundIncrease)" class="fas mr-1" :class="trendArrowIcon(statsData.fundIncrease)"></i>
            <span>{{ formatTrendPercent(statsData.fundIncrease) }}%</span>
            <span class="text-gray-500 ml-1">同比</span>
            <a-tooltip>
              <template #title>{{ yoyTooltipText }}</template>
              <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
            </a-tooltip>
          </div>
        </div>
        <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
          <i class="fas fa-wallet text-xl"></i>
        </div>
      </div>
    </div>

    <!-- 住院人次 -->
    <div class="bg-white rounded-xl p-5 card-shadow transition-all duration-300 hover:shadow-lg hover:scale-105 transform">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">
            住院人次
            <a-tooltip>
              <template #title>{{ insuredTypeText }}住院总人次</template>
              <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
            </a-tooltip>
          </p>
          <h4 class="text-2xl font-bold mt-1">
            {{ statsData.hospitalizationCount }}
          </h4>
          <div class="flex items-center mt-2 text-sm" :class="trendClass(statsData.hospitalizationIncrease)">
            <i
              v-if="hasTrendArrow(statsData.hospitalizationIncrease)"
              class="fas mr-1"
              :class="trendArrowIcon(statsData.hospitalizationIncrease)"
            ></i>
            <span>{{ formatTrendPercent(statsData.hospitalizationIncrease) }}%</span>
            <span class="text-gray-500 ml-1">同比</span>
            <a-tooltip>
              <template #title>{{ yoyTooltipText }}</template>
              <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
            </a-tooltip>
          </div>
        </div>
        <div class="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning">
          <i class="fas fa-hospital-user text-xl"></i>
        </div>
      </div>
    </div>

    <!-- 资金使用进度 -->
    <div class="bg-white rounded-xl p-5 card-shadow transition-all duration-300 hover:shadow-lg hover:scale-105 transform">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">
            {{ insuredTypeText }}住院资金使用进度
            <a-tooltip>
              <template #title
                >{{ insuredTypeText }}住院资金使用进度={{ insuredTypeText }}住院医保统筹支付总额 / {{ insuredTypeText }}基本医保统筹基金年度收入总额 ×
                100%<br />
              </template>
              <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
            </a-tooltip>
          </p>
          <h4 class="text-2xl font-bold mt-1">{{ statsData.fundUsageRate }}%</h4>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div class="bg-success h-2 rounded-full transition-all duration-500" :style="{ width: statsData.fundUsageRate + '%' }"></div>
          </div>
        </div>
        <div class="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
          <i class="fas fa-chart-line text-xl"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  const props = defineProps({
    statsData: {
      type: Object,
      default: () => ({
        insuredCount: 0,
        insuredIncrease: 0,
        totalFund: 0,
        fundIncrease: 0,
        hospitalizationCount: 0,
        hospitalizationIncrease: 0,
        fundUsageRate: 0,
      }),
    },
    yoyTooltipText: {
      type: String,
      default: '同比口径：本期累计值与去年同期累计值对比',
    },
  });

  const insuredTypeText = ref('居民');
  watch(
    () => props.statsData.insuredType,
    (newType) => {
      if (newType === '310') {
        insuredTypeText.value = '职工';
      } else {
        insuredTypeText.value = '居民';
      }
    },
    { immediate: true }
  );

  // Format number with thousand separators
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('zh-CN');
  };

  const parseTrendValue = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const text = String(value)
      .replace(/[%\s,↑↓]/g, '')
      .trim();
    if (!text) return 0;
    const num = Number(text);
    return Number.isFinite(num) ? num : 0;
  };

  const normalizeTrendValue = (value, digits = 2) => {
    const num = parseTrendValue(value);
    const factor = 10 ** digits;
    return Math.round(num * factor) / factor;
  };

  const isZeroTrend = (value, digits = 2) => {
    const num = normalizeTrendValue(value, digits);
    return Math.abs(num) < 1 / 10 ** digits;
  };

  const trendClass = (value) => {
    const num = normalizeTrendValue(value, 2);
    if (isZeroTrend(num, 2)) {
      return '';
    }
    return num > 0 ? 'text-red-600' : 'text-green-600';
  };

  const hasTrendArrow = (value) => !isZeroTrend(value, 2);

  const trendArrowIcon = (value) => {
    const num = normalizeTrendValue(value, 2);
    return num > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  };

  const formatTrendPercent = (value) => {
    const num = Math.abs(normalizeTrendValue(value, 2));
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };
</script>

<style scoped>
  .card-shadow {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
</style>
