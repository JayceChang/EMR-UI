<template>
  <section class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-hospital-user mr-3 text-orange-500"></i>
      医疗集团门诊数据分析
    </h2>

    <!-- 加载状态 -->
    <a-spin :spinning="loading">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <template v-for="(group, index) in medicalGroups" :key="group.groupCode">
          <div :class="getGroupBgClass(index)" class="p-4 rounded-lg shadow-sm">
            <h3 :class="getGroupTitleClass(index)" class="text-xl font-semibold mb-3 flex items-center">
              <i class="fas fa-hospital mr-2"></i>
              {{ group.groupName }}
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-700">门诊人次数:</span>
                <span :class="getGroupValueClass(index)" class="font-bold">
                  {{ formatNumber(group.visits) }}
                  <span v-if="group.visitsYoy != null" :class="trendClass(group.visitsYoy)" class="text-sm ml-2">
                    <i v-if="hasTrendArrow(group.visitsYoy)" :class="trendArrowIcon(group.visitsYoy)"></i> {{ Math.abs(group.visitsYoy || 0) }}%
                  </span>
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-700">次均费用:</span>
                <span :class="getGroupValueClass(index)" class="font-bold">
                  {{ group.avgCost }}
                  <span v-if="group.avgCostYoy != null" :class="trendClass(group.avgCostYoy)" class="text-sm ml-2">
                    <i v-if="hasTrendArrow(group.avgCostYoy)" :class="trendArrowIcon(group.avgCostYoy)"></i> {{ Math.abs(group.avgCostYoy || 0) }}%
                  </span>
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-700">总费用:</span>
                <span :class="getGroupValueClass(index)" class="font-bold">
                  {{ group.totalCost }} 万
                  <span v-if="group.totalCostYoy != null" :class="trendClass(group.totalCostYoy)" class="text-sm ml-2">
                    <i v-if="hasTrendArrow(group.totalCostYoy)" :class="trendArrowIcon(group.totalCostYoy)"></i>
                    {{ Math.abs(group.totalCostYoy || 0) }}%
                  </span>
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-700">次均统筹报销:</span>
                <span :class="getGroupValueClass(index)" class="font-bold">
                  {{ group.avgReimbursement }}
                  <span v-if="group.avgReimbursementYoy != null" :class="trendClass(group.avgReimbursementYoy)" class="text-sm ml-2">
                    <i v-if="hasTrendArrow(group.avgReimbursementYoy)" :class="trendArrowIcon(group.avgReimbursementYoy)"></i>
                    {{ Math.abs(group.avgReimbursementYoy || 0) }}%
                  </span>
                </span>
              </div>
            </div>
            <a-button type="primary" :class="getGroupBtnClass(index)" class="mt-4 w-full" @click="showGroupDetails(group)">
              查看集团内机构详情
              <i class="fas fa-chevron-right ml-2"></i>
            </a-button>
          </div>
        </template>
      </div>
    </a-spin>

    <!-- 集团内机构详情弹窗 -->
    <a-modal v-model:open="showDetails" :title="null" width="800px" centered destroyOnClose :closable="false">
      <template #title>
        <div class="flex items-center text-lg font-semibold text-gray-700">
          <i class="fas fa-clinic-medical mr-2 text-blue-500"></i>
          {{ currentGroupName }} 所辖医疗机构数据
        </div>
      </template>
      <a-spin :spinning="detailLoading">
        <a-table
          :columns="detailColumns"
          :data-source="detailData"
          :pagination="pagination"
          size="middle"
          :row-key="(record) => record.name"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <span class="font-medium text-gray-900">{{ record.name }}</span>
            </template>
            <template v-else-if="column.key === 'visits'">
              <span class="text-gray-700">{{ record.visits }}</span>
            </template>
            <template v-else-if="column.key === 'avgCost'">
              <span class="text-gray-700">{{ record.avgCost }}</span>
            </template>
            <template v-else-if="column.key === 'avgReimbursement'">
              <span class="text-gray-700">{{ record.avgReimbursement }}</span>
            </template>
            <template v-else-if="column.key === 'yoy'">
              <span :class="trendTextClass(record.yoy)">
                {{ record.yoy }}
              </span>
            </template>
            <template v-else-if="column.key === 'mom'">
              <span :class="trendTextClass(record.mom)">
                {{ record.mom }}
              </span>
            </template>
          </template>
        </a-table>
      </a-spin>
      <template #footer>
        <div class="flex justify-end">
          <a-button type="primary" @click="closeModal">关闭</a-button>
        </div>
      </template>
    </a-modal>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { MedicalGroupAPI } from '/@/api/business/clinic-analysis/clinic-analysis-api';

  const props = defineProps({
    startMonth: {
      type: String,
      required: true,
    },
    endMonth: {
      type: String,
      required: true,
    },
  });

  const emit = defineEmits(['show-details']);

  // State
  const loading = ref(false);
  const detailLoading = ref(false);
  const showDetails = ref(false);
  const currentGroupName = ref('');
  const currentGroupCode = ref('');
  const medicalGroups = ref([]);
  const detailData = ref([]);

  // 分页配置
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (total) => `共 ${total} 条`,
  });

  // 样式配置
  const groupStyles = [
    { bg: 'bg-orange-50', title: 'text-orange-700', value: 'text-orange-800', btn: 'bg-orange-600 border-orange-600 hover:bg-orange-700' },
    { bg: 'bg-lime-50', title: 'text-lime-700', value: 'text-lime-800', btn: 'bg-lime-600 border-lime-600 hover:bg-lime-700' },
    { bg: 'bg-indigo-50', title: 'text-indigo-700', value: 'text-indigo-800', btn: 'bg-indigo-600 border-indigo-600 hover:bg-indigo-700' },
    { bg: 'bg-teal-50', title: 'text-teal-700', value: 'text-teal-800', btn: 'bg-teal-600 border-teal-600 hover:bg-teal-700' },
    { bg: 'bg-pink-50', title: 'text-pink-700', value: 'text-pink-800', btn: 'bg-pink-600 border-pink-600 hover:bg-pink-700' },
  ];

  const getGroupBgClass = (index) => groupStyles[index % groupStyles.length].bg;
  const getGroupTitleClass = (index) => groupStyles[index % groupStyles.length].title;
  const getGroupValueClass = (index) => groupStyles[index % groupStyles.length].value;
  const getGroupBtnClass = (index) => groupStyles[index % groupStyles.length].btn;

  const trendClass = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num) || num === 0) return '';
    return num > 0 ? 'text-red-500' : 'text-green-500';
  };

  const hasTrendArrow = (value) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) && Math.abs(num) >= 0.005;
  };

  const trendArrowIcon = (value) => {
    const num = Number(value ?? 0);
    return num > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  };

  const trendTextClass = (text) => {
    const value = String(text || '').trim();
    if (!value || value === '--' || value === '0%' || value === '0.0%' || value === '0.00%') {
      return '';
    }
    if (value.includes('↑') || value.startsWith('+')) {
      return 'text-red-600';
    }
    if (value.includes('↓') || value.startsWith('-')) {
      return 'text-green-600';
    }
    return '';
  };

  // Table columns
  const detailColumns = [
    { title: '机构名称', dataIndex: 'name', key: 'name' },
    { title: '门诊人次', dataIndex: 'visits', key: 'visits' },
    { title: '次均费用', dataIndex: 'avgCost', key: 'avgCost' },
    { title: '次均报销', dataIndex: 'avgReimbursement', key: 'avgReimbursement' },
    { title: '同比增幅', dataIndex: 'yoy', key: 'yoy' },
    { title: '环比增幅', dataIndex: 'mom', key: 'mom' },
  ];

  // 格式化数字
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString();
  };

  // 获取医疗集团列表数据
  const fetchMedicalGroupList = async () => {
    if (!props.startMonth || !props.endMonth) return;

    loading.value = true;
    try {
      const res = await MedicalGroupAPI.getMedicalGroupList({
        startMonth: props.startMonth,
        endMonth: props.endMonth,
      });
      if (res.ok && res.data) {
        medicalGroups.value = res.data;
      } else {
        message.error(res.msg || '获取医疗集团数据失败');
      }
    } catch (error) {
      console.error('获取医疗集团数据失败:', error);
      message.error('获取医疗集团数据失败');
    } finally {
      loading.value = false;
    }
  };

  // 获取医疗集团详情数据
  const fetchMedicalGroupDetail = async (groupId, pageNo = 1, pageSize = 10) => {
    if (!props.startMonth || !props.endMonth) return;

    detailLoading.value = true;
    try {
      const res = await MedicalGroupAPI.getMedicalGroupDetail(groupId, {
        startMonth: props.startMonth,
        endMonth: props.endMonth,
        pageNum: pageNo,
        pageSize: pageSize,
      });
      if (res.ok && res.data) {
        detailData.value = res.data.list || [];
        pagination.value.total = res.data.total || 0;
        pagination.value.current = pageNo;
        pagination.value.pageSize = pageSize;
      } else {
        message.error(res.msg || '获取集团详情数据失败');
      }
    } catch (error) {
      console.error('获取集团详情数据失败:', error);
      message.error('获取集团详情数据失败');
    } finally {
      detailLoading.value = false;
    }
  };

  // 处理表格分页变化
  const handleTableChange = (pag) => {
    fetchMedicalGroupDetail(currentGroupCode.value, pag.current, pag.pageSize);
  };

  // 关闭弹窗
  const closeModal = () => {
    showDetails.value = false;
  };

  // Methods
  const showGroupDetails = async (group) => {
    currentGroupName.value = group.groupName;
    currentGroupCode.value = group.groupCode;
    showDetails.value = true;
    emit('show-details', group.groupName);

    // 重置分页
    pagination.value.current = 1;

    // 获取集团详情数据
    await fetchMedicalGroupDetail(group.groupCode, 1, pagination.value.pageSize);
  };

  // 监听时间范围变化
  watch(
    () => [props.startMonth, props.endMonth],
    () => {
      fetchMedicalGroupList();
      // 如果详情面板已打开，也刷新详情数据
      if (showDetails.value && currentGroupCode.value) {
        fetchMedicalGroupDetail(currentGroupCode.value, pagination.value.current, pagination.value.pageSize);
      }
    },
    { immediate: false }
  );

  // 组件挂载时获取数据
  onMounted(() => {
    fetchMedicalGroupList();
  });
</script>

<style scoped></style>
