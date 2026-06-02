<template>
  <a-modal v-model:open="visibleLocal" :title="modalTitle" width="800px" :footer="null" :centered="true" @cancel="handleClose">
    <div v-if="detailData && Object.keys(detailData).length > 0" class="p-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 基本信息 -->
        <div>
          <h4 class="text-base font-medium text-gray-900 mb-4">基本信息</h4>
          <a-list :data-source="basicInfoList" class="border border-gray-200 rounded-lg">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <span class="text-gray-500">{{ item.label }}:</span>
                  </template>
                  <template #description>
                    <span class="font-medium">
                      <span v-if="item.trendValue !== undefined" :class="trendClass(item.trendValue)">
                        <i v-if="hasTrendArrow(item.trendValue)" :class="trendArrowIcon(item.trendValue)"></i>
                        {{ item.value }}
                      </span>
                      <span v-else>{{ item.value }}</span>
                    </span>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>

        <!-- 资金与医疗情况 -->
        <div>
          <h4 class="text-base font-medium text-gray-900 mb-4">资金与医疗情况</h4>
          <a-list :data-source="fundInfoList" class="border border-gray-200 rounded-lg">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <span class="text-gray-500">{{ item.label }}:</span>
                  </template>
                  <template #description>
                    <span class="font-medium">
                      <span v-if="item.trendValue !== undefined" :class="trendClass(item.trendValue)">
                        <i v-if="hasTrendArrow(item.trendValue)" :class="trendArrowIcon(item.trendValue)"></i>
                        {{ item.value }}
                      </span>
                      <span v-else>{{ item.value }}</span>
                    </span>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>

      <!-- 医疗指标分析 -->
      <div class="md:col-span-2 pt-4">
        <h4 class="text-base font-medium text-gray-900 mb-4">医疗指标分析</h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-gray-500 text-sm">住院率</p>
            <p class="text-2xl font-bold mt-1">{{ detailData.hospitalizationRate }}%</p>
            <p class="text-xs text-gray-500 mt-1">每百人住院人次</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-gray-500 text-sm">外转率</p>
            <p class="text-2xl font-bold mt-1">{{ detailData.outwardTransferRate }}%</p>
            <p class="text-xs text-gray-500 mt-1">外转就医比例</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-gray-500 text-sm">资金使用进度</p>
            <p class="text-2xl font-bold mt-1">{{ detailData.fundUsageRate }}%</p>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div class="bg-success h-2 rounded-full transition-all duration-500" :style="{ width: detailData.fundUsageRate + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="p-5 text-center text-gray-500">
      <i class="fas fa-info-circle text-3xl mb-2"></i>
      <p>暂无详细数据</p>
    </div>

    <template #footer>
      <a-button type="primary" @click="handleClose"> 关闭 </a-button>
    </template>
  </a-modal>
</template>

<script setup>
  import { ref, watch, computed } from 'vue';

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },
    detailData: {
      type: Object,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['update:visible', 'close']);

  // Local visible state
  const visibleLocal = ref(props.visible);

  // Watch for external visible changes
  watch(
    () => props.visible,
    (newValue) => {
      visibleLocal.value = newValue;
    }
  );

  // Watch for local visible changes
  watch(visibleLocal, (newValue) => {
    emit('update:visible', newValue);
  });

  // Modal title
  const modalTitle = computed(() => {
    if (props.detailData && props.detailData.area) {
      return `${props.detailData.area}参保详情`;
    }
    return '参保详情';
  });

  // Basic info list
  const basicInfoList = computed(() => {
    if (!props.detailData) return [];
    return [
      {
        label: '地区名称',
        value: props.detailData.area || '-',
      },
      {
        label: '参保人数',
        value: props.detailData.insuredCount ? props.detailData.insuredCount.toLocaleString() : '-',
      },
      {
        label: '同比增长',
        value: props.detailData.yoy !== undefined ? `${Math.abs(props.detailData.yoy)}%` : '-',
        trendValue: props.detailData.yoy,
      },
      {
        label: '环比增长',
        value: props.detailData.mom !== undefined ? `${Math.abs(props.detailData.mom)}%` : '-',
        trendValue: props.detailData.mom,
      },
    ];
  });

  // Fund info list
  const fundInfoList = computed(() => {
    if (!props.detailData) return [];
    return [
      {
        label: '统筹总金额',
        value: props.detailData.fundAmount ? `¥${props.detailData.fundAmount.toLocaleString()}` : '-',
      },
      {
        label: '资金同比',
        value: props.detailData.fundYoy !== undefined ? `${Math.abs(props.detailData.fundYoy)}%` : '-',
        trendValue: props.detailData.fundYoy,
      },
      {
        label: '住院人次',
        value: props.detailData.hospitalization || '-',
      },
      {
        label: '次均费用',
        value: props.detailData.avgCost ? `¥${props.detailData.avgCost.toLocaleString()}` : '-',
      },
    ];
  });

  // Handle close
  const handleClose = () => {
    visibleLocal.value = false;
    emit('close');
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
    return num > 0 ? 'fas fa-arrow-up text-xs mr-1' : 'fas fa-arrow-down text-xs mr-1';
  };
</script>
