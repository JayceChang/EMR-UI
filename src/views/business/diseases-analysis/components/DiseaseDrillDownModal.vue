<template>
  <a-modal v-model:open="modalOpen" :title="modalTitle" width="92%" :footer="null" :centered="true" @cancel="handleClose">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div class="text-sm text-gray-500">{{ contextDescription }}</div>
      <a-input-search
        v-model:value="searchKeyword"
        placeholder="搜索姓名/身份证号/机构/病种..."
        style="width: 320px"
        allow-clear
        @search="handleSearch"
      />
    </div>

    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="paginationConfig"
      size="small"
      :scroll="{ x: 1400 }"
      :row-key="getRowKey"
      @change="handleTableChange"
      @resizeColumn="handleResizeColumn"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === '__index'">
          {{ getSerialNumber(index) }}
        </template>
        <template v-else>
          <span>{{ formatCellValue(column.dataIndex, record?.[column.dataIndex]) }}</span>
        </template>
      </template>
    </a-table>
  </a-modal>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { DiseaseDrillDownAPI } from '/@/api/business/diseases-analysis/diseases-analysis-api';

  const modalOpen = defineModel('open', { type: Boolean, default: false });

  const props = defineProps({
    context: {
      type: Object,
      default: () => ({}),
    },
  });

  const loading = ref(false);
  const tableData = ref([]);
  const columns = ref([]);
  const columnWidthMap = ref({});
  const searchKeyword = ref('');
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  const keyLabelMap = {
    jsid: '结算ID',
    jzid: '就诊ID',
    name: '姓名',
    idCard: '身份证号',
    hospital: '医疗机构',
    admissionDate: '入院日期',
    dischargeDate: '出院日期',
    settlementDate: '结算日期',
    diagnosisCode: '诊断编码',
    diagnosisName: '诊断名称',
    insuranceUnit: '参保单位/社区',
    insuranceType: '险种类型',
    totalCost: '总费用(元)',
    reimbursement: '统筹报销(元)',
    lengthOfStay: '住院天数',
  };

  const orderedKeys = [
    'jsid',
    'jzid',
    'name',
    'idCard',
    'hospital',
    'admissionDate',
    'dischargeDate',
    'settlementDate',
    'diagnosisCode',
    'diagnosisName',
    'insuranceUnit',
    'insuranceType',
    'totalCost',
    'reimbursement',
    'lengthOfStay',
  ];

  const modalTitle = computed(() => props.context?.title || '病种下钻明细');

  const contextDescription = computed(() => {
    const startDate = props.context?.startDate || '--';
    const endDate = props.context?.endDate || '--';
    return `时间范围: ${startDate} 至 ${endDate}`;
  });

  const paginationConfig = computed(() => ({
    current: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (value) => `共 ${value} 条`,
  }));

  const buildColumns = (list) => {
    if (!Array.isArray(list) || list.length === 0) {
      columns.value = [
        {
          title: '序号',
          key: '__index',
          width: columnWidthMap.value.__index || 80,
          resizable: true,
          fixed: 'left',
          customRender: ({ index }) => (currentPage.value - 1) * pageSize.value + index + 1,
        },
      ];
      return;
    }

    const rowKeys = Object.keys(list[0]);
    const ordered = orderedKeys.filter((key) => rowKeys.includes(key));
    const remaining = rowKeys.filter((key) => !ordered.includes(key));
    const finalKeys = [...ordered, ...remaining];

    columns.value = [
      {
        title: '序号',
        key: '__index',
        width: columnWidthMap.value.__index || 80,
        resizable: true,
        fixed: 'left',
        customRender: ({ index }) => (currentPage.value - 1) * pageSize.value + index + 1,
      },
      ...finalKeys.map((key) => ({
        title: keyLabelMap[key] || key,
        dataIndex: key,
        key,
        width: columnWidthMap.value[key] || 150,
        resizable: true,
        ellipsis: true,
      })),
    ];
  };

  const handleResizeColumn = (width, col) => {
    const targetKey = col?.key || col?.dataIndex;
    if (!targetKey) return;
    columns.value.forEach((item) => {
      if ((item.key || item.dataIndex) === targetKey) {
        const nextWidth = Math.floor(width);
        item.width = nextWidth;
        columnWidthMap.value[targetKey] = nextWidth;
      }
    });
  };

  const formatCellValue = (key, value) => {
    if (value === null || value === undefined || value === '') return '--';
    if (typeof value === 'number') {
      const lowerKey = (key || '').toLowerCase();
      if (lowerKey.includes('cost') || lowerKey.includes('amount') || lowerKey.includes('reimbursement')) {
        return value.toLocaleString('zh-CN');
      }
      if (lowerKey.includes('count') || lowerKey.includes('times') || lowerKey.includes('day')) {
        return value.toLocaleString('zh-CN');
      }
    }
    return value;
  };

  const loadData = async (pageNum = currentPage.value, size = pageSize.value) => {
    if (!modalOpen.value) return;
    try {
      loading.value = true;
      const diseaseCode = encodeURIComponent(props.context?.diseaseCode || props.context?.diseaseName || '');
      const params = {
        startDate: props.context?.startDate,
        endDate: props.context?.endDate,
        districtId: props.context?.districtId,
        town: props.context?.town,
        insuranceType: props.context?.insuranceType,
        hospitalLevel: props.context?.hospitalLevel,
        hospitalName: props.context?.hospitalName,
        analysisType: props.context?.analysisType,
        searchKeyword: searchKeyword.value || undefined,
        pageNum,
        pageSize: size,
      };

      const response = await DiseaseDrillDownAPI.getDiseaseDetail(diseaseCode, params);
      const data = response?.data;

      if (Array.isArray(data)) {
        tableData.value = data;
        total.value = data.length;
      } else {
        const list = data?.list || data?.records || data?.rows || data?.data || [];
        tableData.value = Array.isArray(list) ? list : [];
        total.value = data?.total || data?.count || tableData.value.length;
        currentPage.value = data?.pageNum || data?.current || pageNum;
        pageSize.value = data?.pageSize || data?.size || size;
      }
      buildColumns(tableData.value);
    } catch (error) {
      console.error('加载病种下钻明细失败:', error);
      message.error('加载病种下钻明细失败');
      tableData.value = [];
      total.value = 0;
      buildColumns([]);
    } finally {
      loading.value = false;
    }
  };

  const handleTableChange = async (pagination) => {
    currentPage.value = pagination.current;
    pageSize.value = pagination.pageSize;
    await loadData(pagination.current, pagination.pageSize);
  };

  const handleSearch = async () => {
    currentPage.value = 1;
    await loadData(1, pageSize.value);
  };

  const getRowKey = (record, index) => record?.jsid || record?.jzid || record?.id || `${index}`;

  const getSerialNumber = (index) => (currentPage.value - 1) * pageSize.value + index + 1;

  const resetState = () => {
    searchKeyword.value = '';
    currentPage.value = 1;
    pageSize.value = 10;
    total.value = 0;
    tableData.value = [];
    columns.value = [];
    columnWidthMap.value = {};
  };

  const handleClose = () => {
    modalOpen.value = false;
  };

  watch(
    () => [modalOpen.value, props.context],
    async ([open]) => {
      if (open) {
        currentPage.value = 1;
        await loadData(1, pageSize.value);
      }
    },
    { deep: true }
  );

  watch(
    () => modalOpen.value,
    (open) => {
      if (!open) {
        resetState();
      }
    }
  );
</script>

<style scoped></style>
