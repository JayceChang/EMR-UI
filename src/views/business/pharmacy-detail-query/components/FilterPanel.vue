<template>
  <div class="bg-white rounded-xl p-5 filter-card sticky top-6">
    <h3 class="text-lg font-semibold mb-4 flex items-center">
      <i class="fas fa-filter text-primary mr-2"></i>
      筛选条件
    </h3>

    <a-form class="space-y-2" layout="vertical">
      <!-- 起止月度筛选 -->
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700 block">起止月度</label>
        <div class="space-y-1">
          <a-select
            v-model:value="filterParams.startMonth"
            class="w-full"
            placeholder="选择开始月份"
          >
            <a-select-option value="2023-08">2023年08月</a-select-option>
            <a-select-option value="2023-09">2023年09月</a-select-option>
            <a-select-option value="2023-10">2023年10月</a-select-option>
            <a-select-option value="2023-11">2023年11月</a-select-option>
            <a-select-option value="2023-12">2023年12月</a-select-option>
          </a-select>
          <a-select
            v-model:value="filterParams.endMonth"
            class="w-full"
            placeholder="选择结束月份"
          >
            <a-select-option value="2023-08">2023年08月</a-select-option>
            <a-select-option value="2023-09">2023年09月</a-select-option>
            <a-select-option value="2023-10">2023年10月</a-select-option>
            <a-select-option value="2023-11">2023年11月</a-select-option>
            <a-select-option value="2023-12">2023年12月</a-select-option>
          </a-select>
        </div>
      </div>

      <!-- 身份证号筛选 -->
      <a-form-item label="身份证号">
        <a-input
          v-model:value="filterParams.idCard"
          placeholder="请输入身份证号"
          class="w-full"
          allow-clear
        />
      </a-form-item>

      <!-- 姓名筛选 -->
      <a-form-item label="姓名（脱敏查询）">
        <a-input
          v-model:value="filterParams.name"
          placeholder="请输入姓名"
          class="w-full"
          allow-clear
        />
      </a-form-item>

      <!-- 年龄范围筛选 -->
      <a-form-item label="年龄范围">
        <div class="grid grid-cols-2 gap-3">
          <a-input
            v-model:value="filterParams.minAge"
            placeholder="最小年龄"
            type="number"
            class="w-full"
            allow-clear
          />
          <a-input
            v-model:value="filterParams.maxAge"
            placeholder="最大年龄"
            type="number"
            class="w-full"
            allow-clear
          />
        </div>
      </a-form-item>

      <!-- 区县筛选 -->
      <a-form-item label="区县">
        <a-select
          v-model:value="filterParams.district"
          class="w-full"
          placeholder="选择区县"
          @change="handleDistrictChange"
        >
          <a-select-option value="">全部区县</a-select-option>
          <a-select-option value="anyang">安阳市区</a-select-option>
          <a-select-option value="linzhou">林州市</a-select-option>
          <a-select-option value="tangyin">汤阴县</a-select-option>
          <a-select-option value="anyangxian">安阳县</a-select-option>
          <a-select-option value="huaixian">滑县</a-select-option>
        </a-select>
      </a-form-item>

      <!-- 乡镇筛选 -->
      <a-form-item label="乡镇">
        <a-select
          v-model:value="filterParams.town"
          class="w-full"
          placeholder="选择乡镇"
          :disabled="!filterParams.district"
        >
          <a-select-option value="">全部乡镇</a-select-option>
          <a-select-option
            v-for="town in availableTowns"
            :key="town.value"
            :value="town.value"
          >
            {{ town.text }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 药房名称 -->
      <a-form-item label="药房名称">
        <a-input
          v-model:value="filterParams.pharmacyName"
          placeholder="请输入药房名称"
          class="w-full"
          allow-clear
        />
      </a-form-item>

      <!-- 查询按钮 -->
      <a-button
        type="primary"
        class="w-full"
        :loading="loading"
        @click="handleSearch"
      >
        <i class="fas fa-search mr-2"></i>
        {{ loading ? '查询中...' : '查询数据' }}
      </a-button>

      <!-- 重置按钮 -->
      <a-button
        class="w-full"
        @click="handleReset"
      >
        <i class="fas fa-redo-alt mr-2"></i>
        重置条件
      </a-button>
    </a-form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  townData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['search', 'reset']);

// Filter parameters
const filterParams = ref({
  startMonth: '2023-12',
  endMonth: '2023-12',
  idCard: '',
  name: '',
  minAge: null,
  maxAge: null,
  district: '',
  town: '',
  pharmacyName: ''
});

// Available towns based on selected district
const availableTowns = computed(() => {
  if (props.townData[filterParams.value.district]) {
    return props.townData[filterParams.value.district];
  }
  return [];
});

// Event handlers
const handleSearch = () => {
  emit('search', { ...filterParams.value });
};

const handleReset = () => {
  filterParams.value = {
    startMonth: '2023-12',
    endMonth: '2023-12',
    idCard: '',
    name: '',
    minAge: null,
    maxAge: null,
    district: '',
    town: '',
    pharmacyName: ''
  };
  emit('reset');
};

const handleDistrictChange = (value) => {
  // Reset town when district changes
  filterParams.value.town = '';
};
</script>

<style scoped>
.filter-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
