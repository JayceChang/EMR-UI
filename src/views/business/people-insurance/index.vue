<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="flex-grow mx-auto px-4 py-6 w-full">
      <div class="flex flex-1 pt-0 space-x-6 overflow-hidden">
        <!-- 左侧筛选条件 -->
        <FilterPanel
          :loading="loading"
          :town-data="townData"
          :village-data="villageData"
          @search="handleSearch"
          @reset="handleReset"
          @county-change="handleCountyChange"
          @town-change="handleTownChange"
        />

        <!-- 右侧查询结果 -->
        <main class="flex-1 rounded-lg flex flex-col overflow-hidden">
          <!-- 统计卡片 -->
          <StatsOverview :stats-data="statsData" :yoy-tooltip-text="yoyTooltipText" class="mb-6" />

          <!-- 表格区域 -->
          <DataTable
            :data-source="tableData"
            :loading="loading"
            :pagination="pagination"
            :search-keyword="searchKeyword"
            @search="handleTableSearch"
            @page-change="handlePageChange"
            @view-detail="handleViewDetail"
            @export="handleExport"
          />
        </main>
      </div>
    </div>

    <!-- 详情模态框 -->
    <DetailModal v-model:visible="detailModalVisible" :detail-data="selectedDetail" @close="handleCloseModal" />
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue';
  import { message } from 'ant-design-vue';

  // Components
  import FilterPanel from './components/FilterPanel.vue';
  import StatsOverview from './components/StatsOverview.vue';
  import DataTable from './components/DataTable.vue';
  import DetailModal from './components/DetailModal.vue';

  // Import styles
  import '/@/assets/css/all.min.css';

  // Import API
  import { PeopleInsuranceAPI, RegionDataAPI } from '/@/api/business/people-insurance/people-insurance-api.js';

  // Reactive data
  const loading = ref(false);
  const tableLoading = ref(false);
  const statsLoading = ref(false);
  const searchKeyword = ref('');
  const detailModalVisible = ref(false);
  const selectedDetail = ref({});

  const tableData = ref([]);
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 42,
  });

  const statsData = ref({
    insuredCount: 0,
    insuredIncrease: 5.2,
    totalFund: 0,
    fundIncrease: 8.7,
    hospitalizationCount: 0,
    hospitalizationIncrease: 2.3,
    fundUsageRate: 68.5,
  });

  const filterParams = ref({
    year: null,
    county: '',
    town: '',
    village: '',
    insuranceType: '390',
  });

  const yoyTooltipText = computed(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const selectedYear = Number(filterParams.value.year || currentYear);

    if (selectedYear === currentYear) {
      return `同比口径：${selectedYear}年1-${currentMonth}月累计，对比${selectedYear - 1}年1-${currentMonth}月累计`;
    }
    return `同比口径：${selectedYear}年1-12月累计，对比${selectedYear - 1}年1-12月累计`;
  });

  // Mock data (用于API失败时的降级数据)
  const mockData = {
    totalRecords: 42,
    tableData: [
      {
        id: 1,
        area: '文峰区',
        insuredCount: 3250,
        yoy: 5.2,
        mom: 1.8,
        fundAmount: 985600,
        fundYoy: 7.5,
        fundMom: 2.3,
        hospitalization: 215,
        avgCost: 4850,
        hospitalizationRate: 6.6,
        outwardTransferRate: 12.3,
        fundUsageRate: 68.5,
      },
      {
        id: 2,
        area: '北关区',
        insuredCount: 2840,
        yoy: 4.8,
        mom: 1.5,
        fundAmount: 865200,
        fundYoy: 6.8,
        fundMom: 1.9,
        hospitalization: 189,
        avgCost: 4620,
        hospitalizationRate: 6.7,
        outwardTransferRate: 10.8,
        fundUsageRate: 65.2,
      },
      {
        id: 3,
        area: '殷都区',
        insuredCount: 3120,
        yoy: 6.1,
        mom: 2.1,
        fundAmount: 945800,
        fundYoy: 8.2,
        fundMom: 2.5,
        hospitalization: 203,
        avgCost: 5120,
        hospitalizationRate: 6.5,
        outwardTransferRate: 13.5,
        fundUsageRate: 72.1,
      },
      {
        id: 4,
        area: '龙安区',
        insuredCount: 2480,
        yoy: 3.5,
        mom: 0.9,
        fundAmount: 765400,
        fundYoy: 5.3,
        fundMom: 1.2,
        hospitalization: 168,
        avgCost: 4480,
        hospitalizationRate: 6.8,
        outwardTransferRate: 9.7,
        fundUsageRate: 58.3,
      },
      {
        id: 5,
        area: '高新区',
        insuredCount: 2960,
        yoy: 5.7,
        mom: 1.7,
        fundAmount: 912500,
        fundYoy: 7.9,
        fundMom: 2.1,
        hospitalization: 192,
        avgCost: 4980,
        hospitalizationRate: 6.5,
        outwardTransferRate: 11.2,
        fundUsageRate: 69.8,
      },
    ],
  };

  const townData = ref({
    county1: [
      { id: 'town1-1', name: '东大街街道' },
      { id: 'town1-2', name: '西大街街道' },
      { id: 'town1-3', name: '甜水井街道' },
      { id: 'town1-4', name: '北大街街道' },
      { id: 'town1-5', name: '光华路街道' },
    ],
    county2: [
      { id: 'town2-1', name: '红旗路街道' },
      { id: 'town2-2', name: '解放路街道' },
      { id: 'town2-3', name: '灯塔路街道' },
      { id: 'town2-4', name: '豆腐营街道' },
      { id: 'town2-5', name: '洹北街道' },
    ],
    county3: [
      { id: 'town3-1', name: '梅园庄街道' },
      { id: 'town3-2', name: '李珍街道' },
      { id: 'town3-3', name: '电厂路街道' },
      { id: 'town3-4', name: '纱厂路街道' },
      { id: 'town3-5', name: '水冶镇' },
    ],
    county4: [
      { id: 'town4-1', name: '文昌大道街道' },
      { id: 'town4-2', name: '文明大道街道' },
      { id: 'town4-3', name: '太行小区街道' },
      { id: 'town4-4', name: '龙泉镇' },
      { id: 'town4-5', name: '马投涧镇' },
    ],
    county5: [
      { id: 'town5-1', name: '开元街道' },
      { id: 'town5-2', name: '振林街道' },
      { id: 'town5-3', name: '龙山街道' },
      { id: 'town5-4', name: '桂园街道' },
      { id: 'town5-5', name: '临淇镇' },
    ],
  });

  const villageData = ref({
    'town1-1': [
      { id: 'village1-1-1', name: '东风村' },
      { id: 'village1-1-2', name: '红旗村' },
      { id: 'village1-1-3', name: '光明村' },
    ],
    'town1-2': [
      { id: 'village1-2-1', name: '和平一村' },
      { id: 'village1-2-2', name: '和平二村' },
      { id: 'village1-2-3', name: '和平三村' },
    ],
  });

  // Load table data
  const loadTableData = async () => {
    tableLoading.value = true;
    try {
      const response = await PeopleInsuranceAPI.getTableData({
        pageNum: pagination.value.current,
        pageSize: pagination.value.pageSize,
        keyword: searchKeyword.value,
        ...filterParams.value,
      });
      if (response.data) {
        tableData.value = response.data.list || [];
        pagination.value.total = response.data.total || 0;
      }
    } catch (error) {
      console.error('加载表格数据失败:', error);
      // 使用模拟数据作为降级
      tableData.value = mockData.tableData;
      pagination.value.total = mockData.totalRecords;
    } finally {
      tableLoading.value = false;
    }
  };

  // Update statistics
  const updateStatsData = async () => {
    statsLoading.value = true;
    try {
      const response = await PeopleInsuranceAPI.getStatsData(filterParams.value);
      if (response.data) {
        statsData.value = response.data;
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      // 使用计算数据作为降级
      const totalInsured = mockData.tableData.reduce((sum, item) => sum + item.insuredCount, 0);
      const totalFund = mockData.tableData.reduce((sum, item) => sum + item.fundAmount, 0);
      const totalHospitalization = mockData.tableData.reduce((sum, item) => sum + item.hospitalization, 0);

      statsData.value = {
        insuredCount: totalInsured,
        insuredIncrease: 5.2,
        totalFund: totalFund,
        fundIncrease: 8.7,
        hospitalizationCount: totalHospitalization,
        hospitalizationIncrease: 2.3,
        fundUsageRate: 68.5,
      };
    } finally {
      statsLoading.value = false;
    }
  };

  const searchToken = ref(0);
  const runSearch = async () => {
    const token = ++searchToken.value;
    loading.value = true;
    try {
      await loadTableData();
      if (token !== searchToken.value) return;
      await updateStatsData();
      if (token !== searchToken.value) return;
      message.success('查询成功');
    } catch (error) {
      console.error('查询失败:', error);
      message.error('查询失败');
    } finally {
      if (token === searchToken.value) {
        loading.value = false;
      }
    }
  };

  // Event handlers
  const handleSearch = async (params) => {
    filterParams.value = { ...params };
    filterParams.value.insuranceType = '390';
    pagination.value.current = 1; // 重置页码
    await runSearch();
  };

  const handleReset = async () => {
    filterParams.value = {
      year: null,
      county: '',
      town: '',
      village: '',
    };
    pagination.value.current = 1;
    searchKeyword.value = '';
    await runSearch();
    message.info('已重置筛选条件');
  };

  const handleCountyChange = async (countyValue) => {
    console.log('County changed:', countyValue);
    // 重置乡镇和村数据
    if (countyValue) {
      // 可以在这里加载该县下的乡镇数据
    } else {
      filterParams.value.town = '';
      filterParams.value.village = '';
    }
  };

  const handleTownChange = async (townValue) => {
    console.log('Town changed:', townValue);
    // 重置村数据
    if (townValue) {
      // 可以在这里加载该镇下的村数据
    } else {
      filterParams.value.village = '';
    }
  };

  const handleTableSearch = (keyword) => {
    searchKeyword.value = keyword;
    pagination.value.current = 1;
    loadTableData();
  };

  const handlePageChange = (page) => {
    pagination.value.current = page;
    loadTableData();
  };

  const handleViewDetail = async (item) => {
    try {
      const response = await PeopleInsuranceAPI.getDetailData(item.id);
      if (response.data) {
        selectedDetail.value = response.data;
      } else {
        selectedDetail.value = item;
      }
    } catch (error) {
      console.error('获取详情失败:', error);
      selectedDetail.value = item; // 使用当前数据作为降级
    }
    detailModalVisible.value = true;
  };

  const handleCloseModal = () => {
    detailModalVisible.value = false;
    selectedDetail.value = {};
  };

  const handleExport = async () => {
    try {
      const response = await PeopleInsuranceAPI.exportData({
        ...filterParams.value,
        keyword: searchKeyword.value,
      });
      message.success('数据导出成功');
    } catch (error) {
      console.error('导出数据失败:', error);
      message.error('导出数据失败');
    }
  };

  // Page load
  onMounted(async () => {
    await runSearch();
  });
</script>

<style scoped>
  /* Custom scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>
