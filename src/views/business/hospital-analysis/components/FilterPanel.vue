<template>
  <div class="bg-white rounded-xl p-5 shadow-md sticky top-6">
    <h3 class="text-lg font-semibold mb-4 flex items-center">
      <i class="fas fa-filter text-blue-600 mr-2"></i>
      筛选条件
    </h3>
    <div class="space-y-3">
      <!-- 起止月度筛选 -->
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700 block">起止月度</label>
        <div class="space-y-1">
          <a-date-picker
            v-model:value="localStartMonth"
            picker="month"
            class="w-full"
            placeholder="开始月份"
            @change="handleFilterChange"
          />
          <a-date-picker
            v-model:value="localEndMonth"
            picker="month"
            class="w-full"
            placeholder="结束月份"
            @change="handleFilterChange"
          />
        </div>
      </div>

      <!-- 区县筛选 -->
      <div class="flex items-center space-x-3">
        <label class="text-sm font-medium text-gray-700 min-w-[80px]">区 县</label>
        <a-select
          v-model:value="localDistrict"
          class="flex-1"
          placeholder="全部区县"
          allow-clear
          @change="handleDistrictChange"
        >
          <a-select-option value="">全部区县</a-select-option>
          <a-select-option v-for="item in districtOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </div>

      <!-- 乡镇筛选 -->
      <div class="flex items-center space-x-3">
        <label class="text-sm font-medium text-gray-700 min-w-[80px]">乡镇</label>
        <a-select
          v-model:value="localTown"
          class="flex-1"
          placeholder="全部乡镇"
          allow-clear
          :disabled="!localDistrict"
          @change="handleFilterChange"
        >
          <a-select-option value="">全部乡镇</a-select-option>
          <a-select-option v-for="town in townOptions" :key="town" :value="town">
            {{ town }}
          </a-select-option>
        </a-select>
      </div>

      <!-- 险种筛选 -->
      <div class="flex items-center space-x-3">
        <label class="text-sm font-medium text-gray-700 min-w-[80px]">险种类别</label>
        <a-select
          v-model:value="localInsuranceType"
          class="flex-1"
          placeholder="全部"
          allow-clear
          @change="handleFilterChange"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="employee">职工医保</a-select-option>
          <a-select-option value="resident">居民医保</a-select-option>
        </a-select>
      </div>

      <!-- 医疗机构级别 -->
      <div class="flex items-center space-x-3">
        <label class="text-sm font-medium text-gray-700 min-w-[80px]">医疗机构级别</label>
        <a-select
          v-model:value="localHospitalLevel"
          class="flex-1"
          placeholder="全部级别"
          allow-clear
          @change="handleFilterChange"
        >
          <a-select-option value="">全部级别</a-select-option>
          <a-select-option value="secondary">二级</a-select-option>
          <a-select-option value="tertiary">三级</a-select-option>
        </a-select>
      </div>

      <!-- 医疗机构名称 -->
      <div class="flex items-center space-x-3">
        <label class="text-sm font-medium text-gray-700 min-w-[80px]">医疗机构名称</label>
        <a-input
          v-model:value="localHospitalName"
          class="flex-1"
          placeholder="请输入医疗机构名称"
          allow-clear
          @change="handleFilterChange"
        />
      </div>

      <!-- ICD病种类目 -->
      <div class="flex items-center space-x-3">
        <label class="text-sm font-medium text-gray-700 min-w-[80px]">ICD病种类目</label>
        <a-select
          v-model:value="localIcdCategory"
          class="flex-1"
          placeholder="全部类目"
          allow-clear
          @change="handleFilterChange"
        >
          <a-select-option value="">全部类目</a-select-option>
          <a-select-option v-for="item in icdCategoryOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </div>

      <!-- 查询按钮 -->
      <a-button type="primary" block class="mt-4" @click="handleQuery">
        <i class="fas fa-search mr-2"></i>
        查询数据
      </a-button>

      <!-- 重置按钮 -->
      <a-button block @click="handleReset">
        <i class="fas fa-redo-alt mr-2"></i>
        重置条件
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
  startMonth: {
    type: Object,
    default: () => dayjs().startOf('year')
  },
  endMonth: {
    type: Object,
    default: () => dayjs()
  }
});

const emit = defineEmits(['query', 'reset', 'filter-change']);

// 本地状态
const localStartMonth = ref(props.startMonth);
const localEndMonth = ref(props.endMonth);
const localDistrict = ref('');
const localTown = ref('');
const localInsuranceType = ref('');
const localHospitalLevel = ref('');
const localHospitalName = ref('');
const localIcdCategory = ref('');

// 区县选项
const districtOptions = [
  { value: 'anyang', label: '安阳市区' },
  { value: 'linzhou', label: '林州市' },
  { value: 'tangyin', label: '汤阴县' },
  { value: 'anyangxian', label: '安阳县' },
  { value: 'huaixian', label: '滑县' }
];

// 区县和乡镇的关联数据
const districtTownData = {
  anyang: ['文峰区', '北关区', '殷都区', '龙安区', '高新技术产业开发区'],
  linzhou: ['开元街道', '振林街道', '龙山街道', '桂园街道', '合涧镇', '原康镇'],
  tangyin: ['城关镇', '宜沟镇', '韩庄镇', '白营镇', '古贤镇', '菜园镇'],
  anyangxian: ['水冶镇', '铜冶镇', '善应镇', '柏庄镇', '蒋村镇', '吕村镇'],
  huaixian: ['道口镇', '城关镇', '白道口镇', '留固镇', '上官镇', '牛屯镇']
};

// ICD病种类目选项
const icdCategoryOptions = [
  { value: 'A00-B99', label: '传染病和寄生虫病' },
  { value: 'C00-D48', label: '肿瘤' },
  { value: 'E00-E90', label: '内分泌、营养和代谢疾病' },
  { value: 'F00-F99', label: '精神和行为障碍' },
  { value: 'G00-G99', label: '神经系统疾病' },
  { value: 'H00-H59', label: '眼和附器疾病' },
  { value: 'I00-I99', label: '循环系统疾病' },
  { value: 'J00-J99', label: '呼吸系统疾病' },
  { value: 'K00-K93', label: '消化系统疾病' }
];

// 乡镇选项（根据区县动态获取）
const townOptions = computed(() => {
  if (localDistrict.value && districtTownData[localDistrict.value]) {
    return districtTownData[localDistrict.value];
  }
  return [];
});

// 区县变化时清空乡镇选择
const handleDistrictChange = () => {
  localTown.value = '';
  handleFilterChange();
};

// 筛选条件变化
const handleFilterChange = () => {
  emit('filter-change', getFilterParams());
};

// 获取筛选参数
const getFilterParams = () => {
  return {
    startMonth: localStartMonth.value ? localStartMonth.value.format('YYYY-MM') : '',
    endMonth: localEndMonth.value ? localEndMonth.value.format('YYYY-MM') : '',
    district: localDistrict.value,
    town: localTown.value,
    insuranceType: localInsuranceType.value,
    hospitalLevel: localHospitalLevel.value,
    hospitalName: localHospitalName.value,
    icdCategory: localIcdCategory.value
  };
};

// 查询
const handleQuery = () => {
  emit('query', getFilterParams());
};

// 重置
const handleReset = () => {
  localStartMonth.value = dayjs().startOf('year');
  localEndMonth.value = dayjs();
  localDistrict.value = '';
  localTown.value = '';
  localInsuranceType.value = '';
  localHospitalLevel.value = '';
  localHospitalName.value = '';
  localIcdCategory.value = '';
  emit('reset');
};

// 监听外部props变化
watch(
  () => props.startMonth,
  (val) => {
    localStartMonth.value = val;
  }
);

watch(
  () => props.endMonth,
  (val) => {
    localEndMonth.value = val;
  }
);
</script>

<style scoped>
:deep(.ant-select) {
  width: 100%;
}
</style>
