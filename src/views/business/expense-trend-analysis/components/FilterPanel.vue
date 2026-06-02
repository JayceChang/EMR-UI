<template>
  <div class="bg-white p-6 rounded-xl shadow-lg mb-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-filter text-indigo-600 mr-2"></i>
      筛选条件
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- District Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          区县选择
        </label>
        <a-select
          v-model:value="localDistrict"
          placeholder="请选择区县"
          class="w-full"
          allowClear
        >
          <a-select-option
            v-for="district in districts"
            :key="district.value"
            :value="district.value"
          >
            {{ district.label }}
          </a-select-option>
        </a-select>
      </div>

      <!-- Category Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          费用分类
        </label>
        <a-select
          v-model:value="localCategory"
          placeholder="请选择费用分类"
          class="w-full"
          allowClear
        >
          <a-select-option
            v-for="category in categories"
            :key="category.value"
            :value="category.value"
          >
            {{ category.label }}
          </a-select-option>
        </a-select>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-end gap-2">
        <a-button type="primary" @click="handleApply" class="flex-1">
          <template #icon>
            <i class="fas fa-search"></i>
          </template>
          查询
        </a-button>
        <a-button @click="handleReset" class="flex-1">
          <template #icon>
            <i class="fas fa-redo"></i>
          </template>
          重置
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  selectedDistrict: {
    type: String,
    default: ''
  },
  selectedCategory: {
    type: String,
    default: ''
  },
  districts: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:selectedDistrict', 'update:selectedCategory', 'apply']);

// Local state
const localDistrict = ref(props.selectedDistrict);
const localCategory = ref(props.selectedCategory);

// Watch for prop changes
watch(() => props.selectedDistrict, (newVal) => {
  localDistrict.value = newVal;
});

watch(() => props.selectedCategory, (newVal) => {
  localCategory.value = newVal;
});

// Handle apply
const handleApply = () => {
  emit('update:selectedDistrict', localDistrict.value);
  emit('update:selectedCategory', localCategory.value);
  emit('apply');
};

// Handle reset
const handleReset = () => {
  localDistrict.value = '';
  localCategory.value = '';
  emit('update:selectedDistrict', '');
  emit('update:selectedCategory', '');
  emit('apply');
};
</script>

<style scoped>
/* Add any additional styles here */
</style>