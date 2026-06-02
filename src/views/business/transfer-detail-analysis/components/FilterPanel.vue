<template>
  <div class="w-72 rounded-lg">
    <!-- 筛选卡片 -->
    <div class="bg-white rounded-xl p-5 filter-card sticky top-6">
      <h3 class="text-lg font-semibold mb-4 flex items-center">
        <i class="fas fa-filter text-primary mr-2"></i>
        筛选条件
      </h3>

      <a-form class="space-y-3" layout="vertical">
        <!-- 起止月度筛选 -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 block">起止月度</label>
          <div class="space-y-1">
            <a-date-picker
              v-model:value="filterParams.startMonth"
              class="w-full"
              picker="month"
              format="YYYY-MM"
              placeholder="选择开始月份"
            />
            <a-date-picker
              v-model:value="filterParams.endMonth"
              class="w-full"
              picker="month"
              format="YYYY-MM"
              placeholder="选择结束月份"
            />
          </div>
        </div>

        <!-- 区县筛选 -->
        <a-form-item label="区县">
          <a-select
            v-model:value="filterParams.districtId"
            class="w-full"
            placeholder="选择区县"
            @change="handleDistrictChange"
          >
            <a-select-option value="">全部区县</a-select-option>
            <a-select-option
              v-for="district in districtList"
              :key="district.code"
              :value="district.code"
            >
              {{ district.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 乡镇筛选 -->
        <a-form-item label="乡镇">
          <a-select
            v-model:value="filterParams.town"
            class="w-full"
            placeholder="选择乡镇"
            :disabled="!filterParams.districtId"
            :loading="townLoading"
          >
            <a-select-option value="">全部乡镇</a-select-option>
            <a-select-option
              v-for="town in availableTowns"
              :key="town.code"
              :value="town.code"
            >
              {{ town.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 险种筛选 -->
        <a-form-item label="险种类别">
          <a-select
            v-model:value="filterParams.insuranceType"
            class="w-full"
            placeholder="选择险种"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="worker">职工医保</a-select-option>
            <a-select-option value="resident">居民医保</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 医疗机构级别 -->
        <a-form-item label="医疗机构级别">
          <a-select
            v-model:value="filterParams.hospitalLevel"
            class="w-full"
            placeholder="选择级别"
          >
            <a-select-option value="">全部级别</a-select-option>
            <a-select-option
              v-for="level in levelList"
              :key="level.code"
              :value="level.code"
            >
              {{ level.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 医疗机构名称 -->
        <a-form-item label="医疗机构名称">
          <a-input
            v-model:value="filterParams.hospitalName"
            placeholder="请输入医疗机构名称"
            class="w-full"
            allow-clear
          />
        </a-form-item>

        <!-- ICD病种类目 -->
        <!-- <a-form-item label="分析维度">
          <a-select v-model:value="filterParams.diseaseType" class="w-full" placeholder="选择分析维度">
            <a-select-option value="icd10Category">ICD10 类别</a-select-option>
            <a-select-option value="icd10SubCategory">ICD10 类目</a-select-option>
            <a-select-option value="icdDiagnosis">ICD10 亚目</a-select-option>
          </a-select>
        </a-form-item> -->

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import { AdministrativeDistrictAPI } from '/@/api/system/administrative-district-api';
import { MedicalInstitutionLevelAPI } from '/@/api/system/medical-institution-level-api';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['search', 'reset']);

// 行政区划数据
const districtList = ref([]);
// 乡镇列表数据
const townList = ref([]);
// 乡镇加载状态
const townLoading = ref(false);
// 医疗机构级别列表
const levelList = ref([]);

// 获取当前年份（例如：2025）
const currentYear = dayjs().year();

// 当前年度的1月份（格式：YYYY-MM）
const startMonth = dayjs(`${currentYear}-01`);

// 当前年度的12月份（格式：YYYY-MM）
const endMonth = dayjs(`${currentYear}-12`);

// Filter parameters (字段名与后端DTO保持一致)
const filterParams = ref({
  startMonth: startMonth,
  endMonth: endMonth,
  districtId: '',
  town: '',
  insuranceType: '',
  hospitalLevel: '',
  hospitalName: '',
  diseaseCode: '',
  diseaseType: ''  // 病种类型: icd10Category(类别), icd10SubCategory(类目), icdDiagnosis(亚目)
});

// 获取行政区划列表（县区级别）
const fetchDistrictList = async () => {
  try {
    const response = await AdministrativeDistrictAPI.getDistrictList('2,3');
    if (response.data) {
      districtList.value = response.data;
    }
  } catch (error) {
    console.error('获取行政区划列表失败:', error);
  }
};

// 获取医疗机构级别列表
const fetchLevelList = async () => {
  try {
    const response = await MedicalInstitutionLevelAPI.getLevelList();
    if (response.data) {
      levelList.value = response.data;
    }
  } catch (error) {
    console.error('获取医疗机构级别列表失败:', error);
  }
};

// 根据区县编码获取乡镇列表
const fetchTownList = async (districtCode) => {
  if (!districtCode) {
    townList.value = [];
    return;
  }

  try {
    townLoading.value = true;
    const response = await AdministrativeDistrictAPI.getDistrictByParent(districtCode);
    if (response.data) {
      townList.value = response.data;
    } else {
      townList.value = [];
    }
  } catch (error) {
    console.error('获取乡镇列表失败:', error);
    townList.value = [];
  } finally {
    townLoading.value = false;
  }
};

// 组件加载时获取数据
onMounted(() => {
  fetchDistrictList();
  fetchLevelList();
});

// Available towns based on selected district
const availableTowns = computed(() => {
  return townList.value;
});

// Event handlers
const handleSearch = () => {
  // 将日期对象转换为字符串格式
  const startMonthStr = filterParams.value.startMonth?.format('YYYY-MM');
  const endMonthStr = filterParams.value.endMonth?.format('YYYY-MM');

  const searchParams = {
    ...filterParams.value,
    startMonth: startMonthStr || undefined,
    endMonth: endMonthStr || undefined
  };
  emit('search', searchParams);
};

const handleReset = () => {
  filterParams.value = {
    startMonth: dayjs(`${currentYear}-01`),
    endMonth: dayjs(`${currentYear}-12`),
    districtId: '',
    town: '',
    insuranceType: '',
    hospitalLevel: '',
    hospitalName: '',
    diseaseCode: '',
    diseaseType: ''
  };
  emit('reset');
};

const handleDistrictChange = (value) => {
  // Reset town when district changes
  filterParams.value.town = '';
  // Load towns for selected district
  fetchTownList(value);
};
</script>

<style scoped>
.filter-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
