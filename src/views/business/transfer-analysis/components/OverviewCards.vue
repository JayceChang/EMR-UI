<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- 市外转和省外转总数据 -->
    <a-spin :spinning="loading">
      <div
        class="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg flex flex-col transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl border-l-4 border-blue-500 cursor-pointer"
        @click="handleCardDrillDown('total', '市外转和省外转数据')"
      >
        <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-globe text-blue-600 mr-2"></i>
          市外转和省外转数据
        </h3>
        <div class="space-y-3 text-gray-700">
          <p class="flex justify-between items-center">
            <span class="font-medium">市省外转人次数:</span>
            <span class="text-blue-600 font-bold">
              {{ formatNumber(totalData?.transferCount) }}人
              <span :class="getYoyClass(totalData?.transferCountYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(totalData?.transferCountYoy)" class="fas mr-1" :class="getYoyArrow(totalData?.transferCountYoy)"></i>
                {{ formatYoy(totalData?.transferCountYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">医疗总费用:</span>
            <span class="text-blue-600 font-bold">
              {{ formatMoney(totalData?.totalCost) }}
              <span :class="getYoyClass(totalData?.totalCostYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(totalData?.totalCostYoy)" class="fas mr-1" :class="getYoyArrow(totalData?.totalCostYoy)"></i>
                {{ formatYoy(totalData?.totalCostYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">统筹资金花费:</span>
            <span class="text-blue-600 font-bold">
              {{ formatMoney(totalData?.coordinationCost) }}
              <span :class="getYoyClass(totalData?.coordinationCostYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(totalData?.coordinationCostYoy)" class="fas mr-1" :class="getYoyArrow(totalData?.coordinationCostYoy)"></i>
                {{ formatYoy(totalData?.coordinationCostYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">统筹花费占比:</span>
            <span class="text-blue-600 font-bold">
              {{ formatPercent(totalData?.coordinationRatio) }}
              <span :class="getYoyClass(totalData?.coordinationRatioYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(totalData?.coordinationRatioYoy)" class="fas mr-1" :class="getYoyArrow(totalData?.coordinationRatioYoy)"></i>
                {{ formatYoy(totalData?.coordinationRatioYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">次均费用:</span>
            <span class="text-blue-600 font-bold">
              ¥ {{ formatNumber(totalData?.avgCost) }}
              <span :class="getYoyClass(totalData?.avgCostYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(totalData?.avgCostYoy)" class="fas mr-1" :class="getYoyArrow(totalData?.avgCostYoy)"></i>
                {{ formatYoy(totalData?.avgCostYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">次均统筹花费:</span>
            <span class="text-blue-600 font-bold">
              ¥ {{ formatNumber(totalData?.avgCoordinationCost) }}
              <span :class="getYoyClass(totalData?.avgCoordinationCostYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(totalData?.avgCoordinationCostYoy)" class="fas mr-1" :class="getYoyArrow(totalData?.avgCoordinationCostYoy)"></i>
                {{ formatYoy(totalData?.avgCoordinationCostYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">次均住院日:</span>
            <span class="text-blue-600 font-bold">
              {{ totalData?.avgDays || 0 }}天
              <span :class="getYoyClass(totalData?.avgDaysYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(totalData?.avgDaysYoy)" class="fas mr-1" :class="getYoyArrow(totalData?.avgDaysYoy)"></i>
                {{ formatYoy(totalData?.avgDaysYoy) }}
              </span>
            </span>
          </p>
        </div>
      </div>
    </a-spin>

    <!-- 市域外转数据 -->
    <a-spin :spinning="loading">
      <div
        class="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl shadow-lg flex flex-col transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl border-l-4 border-green-500 cursor-pointer"
        @click="handleCardDrillDown('city', '市域外转数据')"
      >
        <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-city text-green-600 mr-2"></i>
          市域外转数据
        </h3>
        <div class="space-y-3 text-gray-700">
          <p class="flex justify-between items-center">
            <span class="font-medium">外转人次数:</span>
            <span class="text-green-600 font-bold">
              {{ formatNumber(cityData?.transferCount) }}人
              <span :class="getYoyClass(cityData?.transferCountYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(cityData?.transferCountYoy)" class="fas mr-1" :class="getYoyArrow(cityData?.transferCountYoy)"></i>
                {{ formatYoy(cityData?.transferCountYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">医疗总费用:</span>
            <span class="text-green-600 font-bold">
              {{ formatMoney(cityData?.totalCost) }}
              <span :class="getYoyClass(cityData?.totalCostYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(cityData?.totalCostYoy)" class="fas mr-1" :class="getYoyArrow(cityData?.totalCostYoy)"></i>
                {{ formatYoy(cityData?.totalCostYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">统筹资金花费:</span>
            <span class="text-green-600 font-bold">
              {{ formatMoney(cityData?.coordinationCost) }}
              <span :class="getYoyClass(cityData?.coordinationCostYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(cityData?.coordinationCostYoy)" class="fas mr-1" :class="getYoyArrow(cityData?.coordinationCostYoy)"></i>
                {{ formatYoy(cityData?.coordinationCostYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">统筹花费占比:</span>
            <span class="text-green-600 font-bold">
              {{ formatPercent(cityData?.coordinationRatio) }}
              <span :class="getYoyClass(cityData?.coordinationRatioYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(cityData?.coordinationRatioYoy)" class="fas mr-1" :class="getYoyArrow(cityData?.coordinationRatioYoy)"></i>
                {{ formatYoy(cityData?.coordinationRatioYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">次均费用:</span>
            <span class="text-green-600 font-bold">
              ¥ {{ formatNumber(cityData?.avgCost) }}
              <span :class="getYoyClass(cityData?.avgCostYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(cityData?.avgCostYoy)" class="fas mr-1" :class="getYoyArrow(cityData?.avgCostYoy)"></i>
                {{ formatYoy(cityData?.avgCostYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">次均统筹花费:</span>
            <span class="text-green-600 font-bold">
              ¥ {{ formatNumber(cityData?.avgCoordinationCost) }}
              <span :class="getYoyClass(cityData?.avgCoordinationCostYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(cityData?.avgCoordinationCostYoy)" class="fas mr-1" :class="getYoyArrow(cityData?.avgCoordinationCostYoy)"></i>
                {{ formatYoy(cityData?.avgCoordinationCostYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">次均住院日:</span>
            <span class="text-green-600 font-bold">
              {{ cityData?.avgDays || 0 }}天
              <span :class="getYoyClass(cityData?.avgDaysYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(cityData?.avgDaysYoy)" class="fas mr-1" :class="getYoyArrow(cityData?.avgDaysYoy)"></i>
                {{ formatYoy(cityData?.avgDaysYoy) }}
              </span>
            </span>
          </p>
        </div>
      </div>
    </a-spin>

    <!-- 省域外转数据 -->
    <a-spin :spinning="loading">
      <div
        class="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg flex flex-col transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl border-l-4 border-purple-500 cursor-pointer"
        @click="handleCardDrillDown('province', '省域外转数据')"
      >
        <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-map-marker-alt text-purple-600 mr-2"></i>
          省域外转数据
        </h3>
        <div class="space-y-3 text-gray-700">
          <p class="flex justify-between items-center">
            <span class="font-medium">外转人次数:</span>
            <span class="text-purple-600 font-bold">
              {{ formatNumber(provinceData?.transferCount) }}人
              <span :class="getYoyClass(provinceData?.transferCountYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(provinceData?.transferCountYoy)" class="fas mr-1" :class="getYoyArrow(provinceData?.transferCountYoy)"></i>
                {{ formatYoy(provinceData?.transferCountYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">医疗总费用:</span>
            <span class="text-purple-600 font-bold">
              {{ formatMoney(provinceData?.totalCost) }}
              <span :class="getYoyClass(provinceData?.totalCostYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(provinceData?.totalCostYoy)" class="fas mr-1" :class="getYoyArrow(provinceData?.totalCostYoy)"></i>
                {{ formatYoy(provinceData?.totalCostYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">统筹资金花费:</span>
            <span class="text-purple-600 font-bold">
              {{ formatMoney(provinceData?.coordinationCost) }}
              <span :class="getYoyClass(provinceData?.coordinationCostYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(provinceData?.coordinationCostYoy)" class="fas mr-1" :class="getYoyArrow(provinceData?.coordinationCostYoy)"></i>
                {{ formatYoy(provinceData?.coordinationCostYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">统筹花费占比:</span>
            <span class="text-purple-600 font-bold">
              {{ formatPercent(provinceData?.coordinationRatio) }}
              <span :class="getYoyClass(provinceData?.coordinationRatioYoy)" class="text-sm ml-2 inline-flex items-center">
                <i
                  v-if="hasYoyArrow(provinceData?.coordinationRatioYoy)"
                  class="fas mr-1"
                  :class="getYoyArrow(provinceData?.coordinationRatioYoy)"
                ></i>
                {{ formatYoy(provinceData?.coordinationRatioYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">次均费用:</span>
            <span class="text-purple-600 font-bold">
              ¥ {{ formatNumber(provinceData?.avgCost) }}
              <span :class="getYoyClass(provinceData?.avgCostYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(provinceData?.avgCostYoy)" class="fas mr-1" :class="getYoyArrow(provinceData?.avgCostYoy)"></i>
                {{ formatYoy(provinceData?.avgCostYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">次均统筹花费:</span>
            <span class="text-purple-600 font-bold">
              ¥ {{ formatNumber(provinceData?.avgCoordinationCost) }}
              <span :class="getYoyClass(provinceData?.avgCoordinationCostYoy)" class="text-sm ml-2 inline-flex items-center">
                <i
                  v-if="hasYoyArrow(provinceData?.avgCoordinationCostYoy)"
                  class="fas mr-1"
                  :class="getYoyArrow(provinceData?.avgCoordinationCostYoy)"
                ></i>
                {{ formatYoy(provinceData?.avgCoordinationCostYoy) }}
              </span>
            </span>
          </p>
          <p class="flex justify-between items-center">
            <span class="font-medium">次均住院日:</span>
            <span class="text-purple-600 font-bold">
              {{ provinceData?.avgDays || 0 }}天
              <span :class="getYoyClass(provinceData?.avgDaysYoy)" class="text-sm ml-2 inline-flex items-center">
                <i v-if="hasYoyArrow(provinceData?.avgDaysYoy)" class="fas mr-1" :class="getYoyArrow(provinceData?.avgDaysYoy)"></i>
                {{ formatYoy(provinceData?.avgDaysYoy) }}
              </span>
            </span>
          </p>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  const emit = defineEmits(['drill-down']);

  defineProps({
    loading: {
      type: Boolean,
      default: false,
    },
    totalData: {
      type: Object,
      default: () => ({}),
    },
    cityData: {
      type: Object,
      default: () => ({}),
    },
    provinceData: {
      type: Object,
      default: () => ({}),
    },
  });

  // 格式化数字（千分位）
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('zh-CN');
  };

  // 格式化金额（自动转换为万/亿）
  const formatMoney = (num) => {
    if (num === null || num === undefined) return '¥ 0';
    const n = Number(num);
    if (n >= 100000000) {
      return `¥ ${(n / 100000000).toFixed(2)}亿`;
    } else if (n >= 10000) {
      return `¥ ${(n / 10000).toFixed(2)}万`;
    }
    return `¥ ${n.toLocaleString('zh-CN')}`;
  };

  // 格式化百分比
  const formatPercent = (num) => {
    if (num === null || num === undefined) return '0%';
    return `${Number(num).toFixed(1)}%`;
  };

  // 格式化同比
  const formatYoy = (yoy) => {
    if (yoy === null || yoy === undefined) return '0%';
    return `${Math.abs(Number(yoy)).toFixed(1)}%`;
  };

  // 获取同比样式类
  const getYoyClass = (yoy) => {
    const numYoy = Number(yoy);
    if (yoy === null || yoy === undefined || isNaN(numYoy) || Math.abs(numYoy) < 0.05) return '';
    return numYoy > 0 ? 'text-red-500' : 'text-green-500';
  };

  const hasYoyArrow = (yoy) => {
    const numYoy = Number(yoy);
    return !(yoy === null || yoy === undefined || isNaN(numYoy) || Math.abs(numYoy) < 0.05);
  };

  // 获取同比箭头类
  const getYoyArrow = (yoy) => {
    const numYoy = Number(yoy);
    return numYoy > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  };

  const handleCardDrillDown = (scope, label) => {
    emit('drill-down', {
      scene: 'overview',
      scope,
      title: `${label}下钻明细`,
    });
  };
</script>

<style scoped></style>
