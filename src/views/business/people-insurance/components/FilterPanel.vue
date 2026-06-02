<template>
  <aside class="w-72 bg-white p-6 rounded-lg shadow-lg flex-shrink-0 overflow-y-auto">
    <h3 class="text-lg font-semibold mb-4 flex items-center">
      <i class="fas fa-filter text-primary mr-2"></i>
      筛选条件
    </h3>

    <a-form class="space-y-3" layout="vertical">
      <!-- 年度筛选 -->
      <a-form-item label="年度" class="mb-3">
        <a-date-picker v-model:value="filterParams.year" class="w-full" picker="year" placeholder="选择年度" format="YYYY" :inputReadOnly="true" />
      </a-form-item>

      <!-- 县区筛选 -->
      <a-form-item label="区县" class="mb-3">
        <a-select v-model:value="filterParams.county" class="w-full" placeholder="选择区县" @change="handleCountyChange">
          <a-select-option value="">全部区县</a-select-option>
          <a-select-option v-for="district in districtList" :key="district.code" :value="district.code">
            {{ district.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 乡镇筛选 -->
      <a-form-item label="乡镇" class="mb-3">
        <a-select
          v-model:value="filterParams.town"
          class="w-full"
          placeholder="选择乡镇"
          :disabled="!filterParams.county"
          :loading="townLoading"
          @change="handleTownChange"
        >
          <a-select-option value="">全部乡镇</a-select-option>
          <a-select-option v-for="town in townList" :key="town.code" :value="town.code">
            {{ town.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 村组筛选 -->
      <a-form-item label="村组" class="mb-3">
        <a-select v-model:value="filterParams.village" class="w-full" placeholder="选择村组" :disabled="!filterParams.town" :loading="villageLoading">
          <a-select-option value="">全部村组</a-select-option>
          <a-select-option v-for="village in villageList" :key="village.code" :value="village.code">
            {{ village.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 查询按钮 -->
      <a-button type="primary" class="w-full mt-3" :loading="loading" @click="handleSearch">
        <i class="fas fa-search mr-2"></i>
        {{ loading ? '查询中...' : '查询数据' }}
      </a-button>

      <!-- 重置按钮 -->
      <a-button class="w-full mt-3" @click="handleReset">
        <i class="fas fa-redo-alt mr-2"></i>
        重置条件
      </a-button>
    </a-form>
  </aside>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import dayjs from 'dayjs';
  import { AdministrativeDistrictAPI } from '/@/api/system/administrative-district-api';

  const props = defineProps({
    loading: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['search', 'reset', 'county-change', 'town-change']);

  // 行政区划数据
  const districtList = ref([]);
  // 乡镇列表数据
  const townList = ref([]);
  // 村组列表数据
  const villageList = ref([]);
  // 乡镇加载状态
  const townLoading = ref(false);
  // 村组加载状态
  const villageLoading = ref(false);

  // 获取当前年份
  const currentYear = dayjs();

  // Filter parameters
  const filterParams = ref({
    year: currentYear,
    county: '',
    town: '',
    village: '',
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

  // 根据乡镇编码获取村组列表
  const fetchVillageList = async (townCode) => {
    if (!townCode) {
      villageList.value = [];
      return;
    }

    try {
      villageLoading.value = true;
      const response = await AdministrativeDistrictAPI.getDistrictByParent(townCode);
      if (response.data) {
        villageList.value = response.data;
      } else {
        villageList.value = [];
      }
    } catch (error) {
      console.error('获取村组列表失败:', error);
      villageList.value = [];
    } finally {
      villageLoading.value = false;
    }
  };

  // 组件加载时获取区县数据
  onMounted(() => {
    fetchDistrictList();
  });

  // Event handlers
  const handleSearch = () => {
    // Convert moment object to year string if needed
    const params = { ...filterParams.value };
    if (params.year && typeof params.year === 'object' && params.year.format) {
      params.year = params.year.format('YYYY');
    }
    emit('search', params);
  };

  const handleReset = () => {
    filterParams.value = {
      year: dayjs(),
      county: '',
      town: '',
      village: '',
    };
    townList.value = [];
    villageList.value = [];
    emit('reset');
  };

  const handleCountyChange = (value) => {
    // Reset town and village when county changes
    filterParams.value.town = '';
    filterParams.value.village = '';
    townList.value = [];
    villageList.value = [];
    // Load towns for selected county
    fetchTownList(value);
    emit('county-change', value);
  };

  const handleTownChange = (value) => {
    // Reset village when town changes
    filterParams.value.village = '';
    villageList.value = [];
    // Load villages for selected town
    fetchVillageList(value);
    emit('town-change', value);
  };
</script>
