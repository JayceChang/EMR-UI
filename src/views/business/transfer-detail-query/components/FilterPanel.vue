<template>
  <div>
    <h3 class="text-lg font-semibold mb-4 flex items-center">
      <i class="fas fa-filter text-primary mr-2"></i>
      筛选条件
    </h3>
    <a-form class="space-y-2" layout="vertical">
      <!-- 起止月度 -->
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700 block">起止月度</label>
        <div class="space-y-1">
          <a-select
            v-model:value="localParams.startMonth"
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
            v-model:value="localParams.endMonth"
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

      <!-- 身份证号 -->
      <a-form-item label="身份证号">
        <a-input
          v-model:value="localParams.idCard"
          placeholder="请输入身份证号"
          class="w-full"
        />
      </a-form-item>

      <!-- 姓名 -->
      <a-form-item label="姓名（脱敏查询）">
        <a-input
          v-model:value="localParams.name"
          placeholder="请输入姓名"
          class="w-full"
        />
      </a-form-item>

      <!-- 年龄范围 -->
      <a-form-item label="年龄范围">
        <div class="grid grid-cols-2 gap-3">
          <a-input
            v-model:value="localParams.minAge"
            placeholder="最小年龄"
            type="number"
            class="w-full"
          />
          <a-input
            v-model:value="localParams.maxAge"
            placeholder="最大年龄"
            type="number"
            class="w-full"
          />
        </div>
      </a-form-item>

      <!-- 区县 -->
      <a-form-item label="区县">
        <a-select
          v-model:value="localParams.district"
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

      <!-- 乡镇 -->
      <a-form-item label="乡镇">
        <a-select
          v-model:value="localParams.town"
          class="w-full"
          placeholder="选择乡镇"
          :disabled="!localParams.district"
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

      <!-- 医疗机构级别 -->
      <a-form-item label="医疗机构级别">
        <a-select
          v-model:value="localParams.hospitalLevel"
          class="w-full"
          placeholder="选择级别"
        >
          <a-select-option value="">全部级别</a-select-option>
          <a-select-option value="secondary">二级</a-select-option>
          <a-select-option value="tertiary">三级</a-select-option>
        </a-select>
      </a-form-item>

      <!-- 医疗机构名称 -->
      <a-form-item label="医疗机构名称">
        <a-input
          v-model:value="localParams.hospitalName"
          placeholder="请输入医疗机构名称"
          class="w-full"
        />
      </a-form-item>

      <!-- ICD类目 -->
      <a-form-item label="ICD类目">
        <a-select
          v-model:value="localParams.icdCategory"
          class="w-full"
          placeholder="选择类目"
        >
          <a-select-option value="">全部类目</a-select-option>
          <a-select-option value="A00-B99">传染病和寄生虫病</a-select-option>
          <a-select-option value="C00-D48">肿瘤</a-select-option>
          <a-select-option value="E00-E90">内分泌、营养和代谢疾病</a-select-option>
          <a-select-option value="F00-F99">精神和行为障碍</a-select-option>
          <a-select-option value="G00-G99">神经系统疾病</a-select-option>
          <a-select-option value="H00-H59">眼和附器疾病</a-select-option>
          <a-select-option value="I00-I99">循环系统疾病</a-select-option>
          <a-select-option value="J00-J99">呼吸系统疾病</a-select-option>
          <a-select-option value="K00-K93">消化系统疾病</a-select-option>
        </a-select>
      </a-form-item>

      <!-- ICD亚目 -->
      <a-form-item label="ICD亚目">
        <a-select
          v-model:value="localParams.icdSubcategory"
          class="w-full"
          placeholder="选择亚目"
        >
          <a-select-option value="">全部亚目</a-select-option>
        </a-select>
      </a-form-item>

      <!-- 外转类型 -->
      <a-form-item label="外转类型">
        <div class="space-y-2">
          <a-checkbox v-model:checked="localParams.countyTransfer">
            县域外转
          </a-checkbox>
          <a-checkbox v-model:checked="localParams.cityTransfer">
            市域外转
          </a-checkbox>
        </div>
      </a-form-item>

      <!-- 查询按钮 -->
      <a-button
        type="primary"
        class="w-full"
        :loading="loading"
        @click="handleSearch"
      >
        <i class="fas fa-search mr-2"></i>
        查询数据
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
import { reactive, computed, watch } from 'vue';

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

// Local filter parameters
const localParams = reactive({
  startMonth: '2023-12',
  endMonth: '2023-12',
  idCard: '',
  name: '',
  minAge: null,
  maxAge: null,
  district: '',
  town: '',
  hospitalLevel: '',
  hospitalName: '',
  icdCategory: '',
  icdSubcategory: '',
  countyTransfer: false,
  cityTransfer: false
});

// Available towns based on selected district
const availableTowns = computed(() => {
  if (props.townData[localParams.district]) {
    return props.townData[localParams.district];
  }
  return [];
});

// Watch for townData changes
watch(() => props.townData, (newVal) => {
  console.log('Town data updated:', newVal);
}, { deep: true });

// Event handlers
const handleSearch = () => {
  emit('search', { ...localParams });
};

const handleReset = () => {
  localParams.startMonth = '2023-12';
  localParams.endMonth = '2023-12';
  localParams.idCard = '';
  localParams.name = '';
  localParams.minAge = null;
  localParams.maxAge = null;
  localParams.district = '';
  localParams.town = '';
  localParams.hospitalLevel = '';
  localParams.hospitalName = '';
  localParams.icdCategory = '';
  localParams.icdSubcategory = '';
  localParams.countyTransfer = false;
  localParams.cityTransfer = false;
  emit('reset');
};

const handleDistrictChange = () => {
  // Reset town when district changes
  localParams.town = '';
};
</script>

<style scoped>
</style>
