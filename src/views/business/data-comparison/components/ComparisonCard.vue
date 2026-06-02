<template>
  <div 
    :class="[
      'p-6 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden group',
      active ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
    ]"
    @click="$emit('click')"
  >
    <!-- 背景装饰图标 -->
    <div class="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
      <i :class="['fas text-6xl', iconClass]"></i>
    </div>

    <div class="flex items-center justify-between mb-4">
      <h3 :class="['text-base font-bold m-0 flex items-center', active ? 'text-blue-700' : 'text-gray-700']">
        <i :class="['fas mr-2', iconClass, active ? 'text-blue-500' : 'text-gray-400']"></i>
        {{ title }}
      </h3>
      <div v-if="active" class="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
        已选
      </div>
    </div>

    <div class="space-y-3 relative z-10">
      <div v-for="item in data.slice(0, 3)" :key="item.name">
        <div class="rounded-lg border border-gray-100 bg-white/80 p-3">
          <div class="flex justify-between text-xs text-gray-500 mb-2">
            <span class="font-medium">{{ item.name }}</span>
            <span>{{ item.unit }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span :class="['text-xl font-extrabold leading-none', active ? 'text-blue-700' : 'text-gray-700']">{{ formatValue(item.a, item.unit) }}</span>
              <span class="text-[10px] text-gray-400 mt-1">A: {{ entityAName }}</span>
            </div>
            <div class="h-8 w-px bg-gray-200 mx-3"></div>
            <div class="flex flex-col items-end">
              <span class="text-xl font-extrabold leading-none text-gray-700">{{ formatValue(item.b, item.unit) }}</span>
              <span class="text-[10px] text-gray-400 mt-1">B: {{ entityBName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  active: Boolean,
  entityAName: String,
  entityBName: String,
  data: Array
});

defineEmits(['click']);

const iconClass = computed(() => {
  if (props.title.includes('参保')) return 'fa-user-shield';
  if (props.title.includes('住院')) return 'fa-hospital-user';
  if (props.title.includes('外转')) return 'fa-route';
  return 'fa-chart-pie';
});

const formatValue = (value, unit) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0';
  if (unit === '万元') return num.toFixed(2);
  return num.toLocaleString('zh-CN');
};
</script>
