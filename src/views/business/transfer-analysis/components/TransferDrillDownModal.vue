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
  import { TransferDrillDownAPI } from '/@/api/business/transfer-analysis/transfer-analysis-api';

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
    insuranceUnit: '参保单位/社区',
    insuranceOrg: '参保单位/社区',
    name: '姓名',
    patientName: '姓名',
    idCard: '身份证号',
    idNo: '身份证号',
    hospital: '医疗机构',
    hospitalName: '医疗机构',
    institutionName: '医疗机构',
    admissionDate: '入院日期',
    inHospitalDate: '入院日期',
    dischargeDate: '出院日期',
    outHospitalDate: '出院日期',
    diagnosisCode: '诊断编码',
    diseaseCode: '病种编码',
    diagnosisName: '诊断名称',
    diseaseName: '病种名称',
    category: '病种',
    categoryName: '病种名称',
    region: '区域',
    regionName: '区域',
    districtName: '区域',
    county: '县区',
    countyName: '县区',
    transfers: '人次数',
    transferCount: '人次数',
    count: '数量',
    totalCost: '总费用(元)',
    coordinationCost: '统筹费用(元)',
    totalCoordinationCost: '总统筹费用(元)',
    avgCost: '次均费用(元)',
    avgCoordinationCost: '次均统筹费用(元)',
    reimbursement: '统筹报销(元)',
    lengthOfStay: '住院天数',
    hospitalDays: '住院日',
    avgDays: '次均住院日',
    ratio: '占比',
    transferRate: '外转率',
    cityRatio: '市域占比',
    provinceRatio: '省域占比',
  };

  const orderedKeys = [
    'jsid',
    'jzid',
    'insuranceUnit',
    'insuranceOrg',
    'name',
    'patientName',
    'idCard',
    'idNo',
    'hospital',
    'hospitalName',
    'institutionName',
    'admissionDate',
    'inHospitalDate',
    'dischargeDate',
    'outHospitalDate',
    'diagnosisCode',
    'diseaseCode',
    'diagnosisName',
    'diseaseName',
    'category',
    'categoryName',
    'region',
    'regionName',
    'districtName',
    'county',
    'countyName',
    'transfers',
    'transferCount',
    'count',
    'totalCost',
    'coordinationCost',
    'totalCoordinationCost',
    'avgCost',
    'avgCoordinationCost',
    'reimbursement',
    'lengthOfStay',
    'hospitalDays',
    'avgDays',
    'ratio',
    'transferRate',
    'cityRatio',
    'provinceRatio',
  ];

  const modalTitle = computed(() => props.context?.title || '下钻明细');

  const contextDescription = computed(() => {
    const startMonth = props.context?.startMonth || '--';
    const endMonth = props.context?.endMonth || '--';
    return `时间范围: ${startMonth} 至 ${endMonth}`;
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
      if (lowerKey.includes('ratio') || lowerKey.includes('rate')) {
        const ratio = value <= 1 ? value * 100 : value;
        return `${ratio.toFixed(2)}%`;
      }
      if (lowerKey.includes('cost') || lowerKey.includes('amount') || lowerKey.includes('reimbursement')) {
        return value.toLocaleString('zh-CN');
      }
      if (lowerKey.includes('count') || lowerKey.includes('transfers') || lowerKey.includes('times')) {
        return value.toLocaleString('zh-CN');
      }
    }
    return value;
  };

  const getApiRequest = (params) => {
    const scene = props.context?.scene;
    if (scene === 'institution') {
      const institutionName = encodeURIComponent(props.context?.institutionName || '');
      return TransferDrillDownAPI.getInstitutionDetail(institutionName, params);
    }
    if (scene === 'disease') {
      const diseaseCode = encodeURIComponent(props.context?.diseaseCode || props.context?.category || props.context?.categoryName || '');
      return TransferDrillDownAPI.getDiseaseDetail(diseaseCode, params);
    }
    if (scene === 'region') {
      const regionName = encodeURIComponent(props.context?.regionName || props.context?.county || props.context?.name || '');
      return TransferDrillDownAPI.getRegionDetail(regionName, params);
    }
    return TransferDrillDownAPI.getPatientDetail(params);
  };

  const loadData = async (pageNum = currentPage.value, size = pageSize.value) => {
    if (!modalOpen.value) return;
    try {
      loading.value = true;
      const params = {
        startMonth: props.context?.startMonth,
        endMonth: props.context?.endMonth,
        scope: props.context?.scope,
        scopeType: props.context?.scope,
        scene: props.context?.scene,
        keyword: searchKeyword.value || undefined,
        pageNum,
        pageSize: size,
      };

      const response = await getApiRequest(params);
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
      console.error('加载下钻明细失败:', error);
      message.error('加载下钻明细失败');
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

  const getRowKey = (record, index) => record?.jsid || record?.jzid || record?.id || record?.idCard || `${index}`;

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
