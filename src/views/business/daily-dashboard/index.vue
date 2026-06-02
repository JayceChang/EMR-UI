<template>
  <div class="min-h-screen flex flex-col p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- 页面标题与日期选择 -->
    <header class="mb-2 bg-white p-4 rounded-lg shadow-md border-t-4 border-blue-500">
      <h1 class="text-3xl font-bold text-gray-800 mb-2 flex items-center">
        <i class="fas fa-chart-line mr-3 text-blue-500"></i>
        安阳市医疗数据汇总分析
      </h1>
      <p class="text-sm text-gray-500 mb-4">展示按天统计的医疗服务数据概览。</p>
      <div class="flex flex-wrap gap-4 items-end">
        <!-- 日期选择区域 -->
        <div class="flex flex-col sm:flex-row gap-3 items-center">
          <label class="text-sm font-medium text-gray-700 whitespace-nowrap">统计周期:</label>
          <a-date-picker v-model:value="startDate" placeholder="开始日期" class="w-40" />
          <span class="text-gray-500">至</span>
          <a-date-picker v-model:value="endDate" placeholder="结束日期" class="w-40" />
        </div>
        <!-- 查询按钮 -->
        <a-button type="primary" @click="handleQuery">
          <i class="fas fa-search mr-2"></i>
          查询数据
        </a-button>
      </div>
    </header>

    <!-- 核心汇总指标 -->
    <SummaryCards :data="summaryData" />

    <!-- 门诊住院结构分析 -->
    <StructureAnalysis :data="structureData" />

    <!-- 门诊住院结构与区域雷达图 -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 五县雷达图 -->
      <RegionRadarChart title="五县区域指标对比" subtitle="" :data="countyRadarData" />

      <!-- 四区雷达图 -->
      <RegionRadarChart title="四区区域指标对比" subtitle="" :data="districtRadarData" />
    </section>

    <!-- 排行榜与医院明细 -->
    <section class="space-y-6">
      <!-- 诊断排行榜 -->
      <DiagnosisRankList
        :in-region-data="inRegionDiagnosisRankData"
        :out-region-data="outRegionDiagnosisRankData"
        @item-click="handleDiagnosisClick"
      />

      <!-- 医院住院人次排行榜 -->
      <div class="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <!-- 市内医院 -->
        <HospitalRankTable title="安阳市内医院住院人次 TOP 10" icon-class="fas fa-hospital text-purple-600" :data="top10InCityData" />

        <!-- 市外医院 -->
        <HospitalRankTable title="市外医院住院人次 TOP 10" icon-class="fas fa-globe-americas text-red-600" :data="top10OutCityData" />
      </div>
    </section>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';

  // 组件
  import SummaryCards from './components/SummaryCards.vue';
  import StructureAnalysis from './components/StructureAnalysis.vue';
  import RegionRadarChart from './components/RegionRadarChart.vue';
  import DiagnosisRankList from './components/DiagnosisRankList.vue';
  import HospitalRankTable from './components/HospitalRankTable.vue';

  // API
  import { DailyDashboardAPI } from '/@/api/business/daily-dashboard/daily-dashboard-api';

  // 日期范围
  const startDate = ref(dayjs().subtract(1, 'day'));
  const endDate = ref(dayjs());

  // 汇总数据
  const summaryData = ref({
    totalOutpatientCount: 0,
    totalInpatientCount: 0,
    totalOutpatientFee: 0,
    totalInpatientFee: 0,
    totalCoordinationFee: 0,
  });

  // 结构分析数据
  const structureData = ref({
    outpatientStaffCount: 0,
    outpatientResidentCount: 0,
    outpatientStaffFee: 0,
    outpatientResidentFee: 0,
    inpatientStaffCount: 0,
    inpatientResidentCount: 0,
    inpatientStaffFee: 0,
    inpatientResidentFee: 0,
  });

  // 五县雷达数据
  const countyRadarData = ref({
    names: ['安阳县', '滑县', '林州市', '内黄县', '汤阴县'],
    outpatientRate: [0, 0, 0, 0, 0],
    inpatientRate: [0, 0, 0, 0, 0],
    transferRate: [0, 0, 0, 0, 0],
  });

  // 四区雷达数据
  const districtRadarData = ref({
    names: ['文峰区', '龙安区', '北关区', '殷都区'],
    outpatientRate: [0, 0, 0, 0],
    inpatientRate: [0, 0, 0, 0],
    transferRate: [0, 0, 0, 0],
  });

  // 诊断排行数据
  const inRegionDiagnosisRankData = ref([]);
  const outRegionDiagnosisRankData = ref([]);

  // 市内医院 TOP10
  const top10InCityData = ref([]);

  // 市外医院 TOP10
  const top10OutCityData = ref([]);

  // 生成模拟数据
  const generateMockData = () => {
    const start = startDate.value;
    const end = endDate.value;
    const totalDays = end.diff(start, 'day') + 1;

    // 核心指标
    const totalOutpatientCount = Math.floor(((Math.random() * 50000 + 100000) * totalDays) / 2);
    const totalInpatientCount = Math.floor(((Math.random() * 10000 + 20000) * totalDays) / 2);
    const totalOutpatientFee = ((Math.random() * 5000 + 10000) * totalDays) / 2;
    const totalInpatientFee = ((Math.random() * 8000 + 15000) * totalDays) / 2;
    const totalCoordinationFee = (totalInpatientFee * 0.6 + totalOutpatientFee * 0.4) * 0.7;

    summaryData.value = {
      totalOutpatientCount,
      totalInpatientCount,
      totalOutpatientFee,
      totalInpatientFee,
      totalCoordinationFee,
    };

    // 结构数据
    const outpatientStaffCount = totalOutpatientCount * (0.4 + Math.random() * 0.1);
    const outpatientResidentCount = totalOutpatientCount - outpatientStaffCount;
    const outpatientStaffFee = totalOutpatientFee * (0.45 + Math.random() * 0.1);
    const outpatientResidentFee = totalOutpatientFee - outpatientStaffFee;
    const inpatientStaffCount = totalInpatientCount * (0.35 + Math.random() * 0.1);
    const inpatientResidentCount = totalInpatientCount - inpatientStaffCount;
    const inpatientStaffFee = totalInpatientFee * (0.4 + Math.random() * 0.1);
    const inpatientResidentFee = totalInpatientFee - inpatientStaffFee;

    structureData.value = {
      outpatientStaffCount,
      outpatientResidentCount,
      outpatientStaffFee,
      outpatientResidentFee,
      inpatientStaffCount,
      inpatientResidentCount,
      inpatientStaffFee,
      inpatientResidentFee,
    };

    // 五县雷达数据
    countyRadarData.value = {
      names: ['安阳县', '滑县', '林州市', '内黄县', '汤阴县'],
      outpatientRate: [
        Math.floor(60 + Math.random() * 30),
        Math.floor(55 + Math.random() * 30),
        Math.floor(70 + Math.random() * 20),
        Math.floor(65 + Math.random() * 25),
        Math.floor(50 + Math.random() * 35),
      ],
      inpatientRate: [
        Math.floor(40 + Math.random() * 40),
        Math.floor(35 + Math.random() * 40),
        Math.floor(50 + Math.random() * 30),
        Math.floor(45 + Math.random() * 35),
        Math.floor(30 + Math.random() * 45),
      ],
      transferRate: [
        Math.floor(10 + Math.random() * 15),
        Math.floor(15 + Math.random() * 10),
        Math.floor(5 + Math.random() * 10),
        Math.floor(12 + Math.random() * 13),
        Math.floor(20 + Math.random() * 10),
      ],
    };

    // 四区雷达数据
    districtRadarData.value = {
      names: ['文峰区', '龙安区', '北关区', '殷都区'],
      outpatientRate: [
        Math.floor(75 + Math.random() * 20),
        Math.floor(70 + Math.random() * 20),
        Math.floor(80 + Math.random() * 15),
        Math.floor(72 + Math.random() * 20),
      ],
      inpatientRate: [
        Math.floor(55 + Math.random() * 30),
        Math.floor(50 + Math.random() * 30),
        Math.floor(60 + Math.random() * 25),
        Math.floor(52 + Math.random() * 30),
      ],
      transferRate: [
        Math.floor(5 + Math.random() * 8),
        Math.floor(8 + Math.random() * 7),
        Math.floor(3 + Math.random() * 5),
        Math.floor(6 + Math.random() * 9),
      ],
    };

    // 域内诊断排行
    inRegionDiagnosisRankData.value = [
      { name: '高血压病', count: Math.floor(Math.random() * 1500 + 500), rate: (Math.random() * 0.1 + 0.15).toFixed(2) },
      { name: '糖尿病', count: Math.floor(Math.random() * 1200 + 400), rate: (Math.random() * 0.1 + 0.13).toFixed(2) },
      { name: '急性上呼吸道感染', count: Math.floor(Math.random() * 1000 + 300), rate: (Math.random() * 0.08 + 0.1).toFixed(2) },
      { name: '慢性阻塞性肺疾病', count: Math.floor(Math.random() * 800 + 200), rate: (Math.random() * 0.07 + 0.08).toFixed(2) },
      { name: '胃炎和十二指肠炎', count: Math.floor(Math.random() * 700 + 150), rate: (Math.random() * 0.05 + 0.07).toFixed(2) },
      { name: '骨折', count: Math.floor(Math.random() * 500 + 100), rate: (Math.random() * 0.04 + 0.05).toFixed(2) },
    ].sort((a, b) => b.count - a.count);

    // 域外诊断排行
    outRegionDiagnosisRankData.value = [
      { name: '恶性肿瘤', count: Math.floor(Math.random() * 800 + 300), rate: (Math.random() * 0.1 + 0.2).toFixed(2) },
      { name: '冠心病', count: Math.floor(Math.random() * 600 + 200), rate: (Math.random() * 0.08 + 0.15).toFixed(2) },
      { name: '脑血管病', count: Math.floor(Math.random() * 500 + 150), rate: (Math.random() * 0.07 + 0.1).toFixed(2) },
      { name: '椎间盘疾病', count: Math.floor(Math.random() * 400 + 100), rate: (Math.random() * 0.06 + 0.08).toFixed(2) },
      { name: '先天性心脏病', count: Math.floor(Math.random() * 300 + 80), rate: (Math.random() * 0.05 + 0.06).toFixed(2) },
      { name: '白内障', count: Math.floor(Math.random() * 250 + 50), rate: (Math.random() * 0.04 + 0.05).toFixed(2) },
    ].sort((a, b) => b.count - a.count);

    // 生成医院排行数据
    const generateHospitalData = (isCity) => {
      const data = [];
      const baseName = isCity ? '市人民医院' : '外省三甲医院';
      for (let i = 1; i <= 10; i++) {
        const inpatientCount = Math.floor(Math.random() * (isCity ? 5000 : 8000) + (isCity ? 1000 : 2000));
        const totalFee = (inpatientCount * (Math.random() * 1500 + 10000)) / 10000;
        const avgFee = (totalFee * 10000) / inpatientCount;
        const reimbursementRate = isCity ? Math.random() * 20 + 50 : Math.random() * 15 + 40;
        const avgCoordinationFee = avgFee * (reimbursementRate / 100);
        const avgStayDays = isCity ? Math.random() * 5 + 5 : Math.random() * 8 + 7;
        data.push({
          rank: i,
          name: `${isCity ? '安阳' : '外地'}${i}${baseName}`,
          inpatientCount,
          totalFee: totalFee.toFixed(2),
          avgFee: Math.round(avgFee),
          avgCoordinationFee: Math.round(avgCoordinationFee),
          avgStayDays: avgStayDays.toFixed(1),
          avgReimbursementRate: reimbursementRate.toFixed(2),
        });
      }
      return data;
    };

    top10InCityData.value = generateHospitalData(true);
    top10OutCityData.value = generateHospitalData(false);
  };

  // 加载状态
  const loading = ref(false);

  // 获取数据
  const fetchData = async () => {
    loading.value = true;
    try {
      const params = {
        startDate: startDate.value.format('YYYY-MM-DD'),
        endDate: endDate.value.format('YYYY-MM-DD'),
      };

      // 调用API获取所有仪表盘数据
      const response = await DailyDashboardAPI.getDashboardData(params);

      if (response.data) {
        const data = response.data;

        // 更新汇总数据
        if (data.summary) {
          summaryData.value = data.summary;
        }

        // 更新结构分析数据
        if (data.structure) {
          structureData.value = data.structure;
        }

        // 更新五县雷达数据
        if (data.countyRadar) {
          countyRadarData.value = data.countyRadar;
        }

        // 更新四区雷达数据
        if (data.districtRadar) {
          districtRadarData.value = data.districtRadar;
        }

        // 更新域内诊断排行数据
        if (data.inRegionDiagnosisRank) {
          inRegionDiagnosisRankData.value = data.inRegionDiagnosisRank;
        }

        // 更新域外诊断排行数据
        if (data.outRegionDiagnosisRank) {
          outRegionDiagnosisRankData.value = data.outRegionDiagnosisRank;
        }

        // 更新市内医院 TOP10
        if (data.inCityHospitalTop10) {
          top10InCityData.value = data.inCityHospitalTop10;
        }

        // 更新市外医院 TOP10
        if (data.outCityHospitalTop10) {
          top10OutCityData.value = data.outCityHospitalTop10;
        }

        message.success('数据加载成功');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('数据加载失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  };

  // 查询处理
  const handleQuery = () => {
    if (!startDate.value || !endDate.value) {
      message.warning('请选择完整的统计起止日期！');
      return;
    }
    if (startDate.value.isAfter(endDate.value)) {
      message.warning('开始日期不能晚于结束日期！');
      return;
    }
    fetchData();
  };

  // 诊断项点击
  const handleDiagnosisClick = (item) => {
    message.info(`查看 ${item.name} 详情`);
  };

  // 页面加载
  onMounted(() => {
    fetchData();
  });
</script>

<style scoped></style>
