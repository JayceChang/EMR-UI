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
          <StatsOverview :stats-data="statsData" class="mb-6" />

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
  import { ref, onMounted } from 'vue';
  import { message } from 'ant-design-vue';

  // Components
  import FilterPanel from '../people-insurance/components/FilterPanel.vue';
  import StatsOverview from '../people-insurance/components/StatsOverview.vue';
  import DataTable from '../people-insurance/components/DataTable.vue';
  import DetailModal from '../people-insurance/components/DetailModal.vue';

  // Import styles
  import '/@/assets/css/all.min.css';

  // Import API
  import { PeopleInsuranceAPI, RegionDataAPI } from '/@/api/business/people-insurance/people-insurance-api.js';

  // Reactive data
  const loading = ref(false);
  const searchKeyword = ref('');
  const detailModalVisible = ref(false);
  const selectedDetail = ref({});

  const tableData = ref([]);
  const pagination = ref({
    current: 1,
    pageSize: 10,
  });

  const statsData = ref();
  //   {
  //   insuredCount: 0,
  //   insuredIncrease: 5.2,
  //   totalFund: 0,
  //   fundIncrease: 8.7,
  //   hospitalizationCount: 0,
  //   hospitalizationIncrease: 2.3,
  //   fundUsageRate: 68.5
  // }

  const filterParams = ref({
    year: null,
    county: '',
    town: '',
    village: '',
    insuranceType: '310',
  });

  const ZERO_PROGRESS_AREAS = new Set(['文峰区', '北关区', '殷都区', '龙安区', '开发区', '高新区']);

  const normalizeFundUsageRate = (list = []) => {
    return list.map((item) => {
      if (ZERO_PROGRESS_AREAS.has(item.area)) {
        return {
          ...item,
          fundUsageRate: 0,
        };
      }
      return item;
    });
  };

  // 乡镇和村组数据
  const townData = ref({});
  const villageData = ref({});

  // Mock data (用于API失败时的降级数据)
  const mockData = {
    totalRecords: 42,
    tableData: [
      {
        id: 1,
        area: '文峰区',
        company: '安阳钢铁集团',
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
        company: '安阳化工集团',
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
        company: '安阳卷烟厂',
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
        company: '安阳电业局',
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
        company: '安阳高新技术产业园',
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

  // Load table data
  const loadTableData = async () => {
    loading.value = true;
    try {
      const response = await PeopleInsuranceAPI.getTableData({
        pageNum: pagination.value.current,
        pageSize: pagination.value.pageSize,
        ...filterParams.value,
        // 如果有表格搜索关键词，添加到请求参数
        keyword: searchKeyword.value || '',
      });
      if (response.data) {
        tableData.value = normalizeFundUsageRate(response.data.list || []);
        pagination.value.total = response.data.total || 0;
      }
    } catch (error) {
      console.error('加载表格数据失败:', error);
      // 使用模拟数据作为降级
      tableData.value = normalizeFundUsageRate(mockData.tableData);
      pagination.value.total = mockData.totalRecords;
    } finally {
      loading.value = false;
    }
  };

  // Update statistics
  const updateStatsData = async () => {
    try {
      const response = await PeopleInsuranceAPI.getStatsData(filterParams.value);
      if (response.data) {
        statsData.value = { ...response.data, insuredType: '310' };
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
    }
  };

  // Event handlers
  const handleSearch = async (params) => {
    // 直接使用 FilterPanel 传来的参数，添加 insuranceType
    filterParams.value = {
      year: params.year || null,
      county: params.county || '',
      town: params.town || '',
      village: params.village || '',
      insuranceType: '310',
    };
    pagination.value.current = 1; // 重置页码
    try {
      await Promise.all([loadTableData(), updateStatsData()]);
      message.success('查询成功');
    } catch (error) {
      console.error('查询失败:', error);
      message.error('查询失败');
    }
  };

  const handleReset = async () => {
    filterParams.value = {
      year: null,
      county: '',
      town: '',
      village: '',
      insuranceType: '310',
    };
    pagination.value.current = 1;
    searchKeyword.value = '';
    await Promise.all([loadTableData(), updateStatsData()]);
    message.info('已重置筛选条件');
  };

  // 县区变化时加载乡镇数据
  const handleCountyChange = async (countyCode) => {
    // if (!countyCode) {
    //   townData.value = {};
    //   villageData.value = {};
    //   return;
    // }
    // try {
    //   const response = await RegionDataAPI.getTowns(countyCode);
    //   if (response.data) {
    //     townData.value = { [countyCode]: response.data };
    //   }
    // } catch (error) {
    //   console.error('加载乡镇数据失败:', error);
    // }
  };

  // 乡镇变化时加载村组数据
  const handleTownChange = async (townCode) => {
    if (!townCode) {
      villageData.value = {};
      return;
    }
    try {
      const countyCode = filterParams.value.county;
      const response = await RegionDataAPI.getVillages(countyCode, townCode);
      if (response.data) {
        villageData.value = { [townCode]: response.data };
      }
    } catch (error) {
      console.error('加载村组数据失败:', error);
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
    await Promise.all([loadTableData(), updateStatsData()]);
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
