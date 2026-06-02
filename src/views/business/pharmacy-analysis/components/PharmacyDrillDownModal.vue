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
      :scroll="{ x: 1600 }"
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
  import { PHARMACY_ANALYSIS_DRILL_DOWN_ENDPOINT, getPharmacyPatientDrillPage } from '/@/api/business/pharmacy-analysis/pharmacy-analysis-api';

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
    rybh: '人员编号',
    xm: '姓名',
    name: '姓名',
    sfzh: '身份证号',
    idCard: '身份证号',
    cbqh: '参保区划',
    cbxz: '参保性质',
    rylb: '人员类别编码',
    rylbmc: '人员类别名称',
    dwsq: '单位所属区',
    yybm: '机构编码',
    yymc: '机构名称',
    hospitalName: '机构名称',
    yyssdq: '机构所属地区',
    nd: '年度',
    zddm: '诊断代码',
    diagnosisCode: '诊断代码',
    zdmc: '诊断名称',
    diagnosisName: '诊断名称',
    ryrq: '入院日期',
    admissionDate: '入院日期',
    cyrq: '出院日期',
    dischargeDate: '出院日期',
    jsrq: '结算日期',
    settlementDate: '结算日期',
    jsdd: '结算地点编码',
    jsddmc: '结算地点',
    yllb: '医疗类别编码',
    yllbmc: '医疗类别',
    yylxmc: '医疗类别',
    yyjb: '机构级别',
    zfy: '总费用(元)',
    totalCost: '总费用(元)',
    hgfy: '合规费用(元)',
    tczf: '统筹支付(元)',
    poolPayment: '统筹支付(元)',
    gwybz: '公务员补助(元)',
    dbzf: '大病支付(元)',
    dezf: '大额支付(元)',
    yljz: '医疗救助(元)',
    zf: '自付(元)',
    zhzf: '自负(元)',
    qfx: '起付线(元)',
    cxjzf: '城乡救助支付(元)',
    ynjz: '年度结转',
    is_yd: '是否药店',
    yllx: '医疗类型编码',
    yllxmc: '医疗类型',
    zdlm: '诊断门类',
    zdlb: '诊断类别',
    xzlb: '险种类别',
    xzmc: '险种名称',
  };

  const orderedKeys = [
    'jsid',
    'jzid',
    'rybh',
    'xm',
    'name',
    'sfzh',
    'idCard',
    'cbqh',
    'cbxz',
    'rylb',
    'rylbmc',
    'dwsq',
    'yybm',
    'yymc',
    'hospitalName',
    'yyssdq',
    'nd',
    'zddm',
    'diagnosisCode',
    'zdmc',
    'diagnosisName',
    'ryrq',
    'admissionDate',
    'cyrq',
    'dischargeDate',
    'jsrq',
    'settlementDate',
    'jsdd',
    'jsddmc',
    'yllb',
    'yllbmc',
    'yylxmc',
    'yyjb',
    'zfy',
    'totalCost',
    'hgfy',
    'tczf',
    'poolPayment',
    'gwybz',
    'dbzf',
    'dezf',
    'yljz',
    'zf',
    'zhzf',
    'qfx',
    'cxjzf',
    'ynjz',
    'is_yd',
    'yllx',
    'yllxmc',
    'zdlm',
    'zdlb',
    'xzlb',
    'xzmc',
  ];

  const modalTitle = computed(() => props.context?.title || '药店患者明细下钻');

  const contextDescription = computed(() => {
    const sourceMap = {
      top: 'TOP药店',
      table: '明细表',
      unknown: '其他',
    };
    const sourceText = sourceMap[props.context?.source] || '其他';
    const pharmacyName = props.context?.pharmacyName || '--';
    const region = props.context?.region || '--';
    const period = props.context?.period || '--';
    return `来源: ${sourceText} | 药店: ${pharmacyName} | 区域: ${region} | 周期: ${period}`;
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
    if (value === null || value === undefined || value === '') {
      return '--';
    }
    if (typeof value === 'number') {
      const lowerKey = String(key || '').toLowerCase();
      if (
        lowerKey.includes('cost') ||
        lowerKey.includes('amount') ||
        lowerKey.includes('payment') ||
        lowerKey.includes('zf') ||
        lowerKey.includes('fy')
      ) {
        return value.toLocaleString('zh-CN');
      }
    }
    return value;
  };

  const getRequestParams = (pageNum, size) => {
    const keyword = searchKeyword.value || undefined;
    const detailName = props.context?.detailFilters?.name || '';
    const detailType = props.context?.detailFilters?.type || '';
    return {
      region: props.context?.region,
      period: props.context?.period,
      pharmacyId: props.context?.pharmacyId,
      pharmacyName: props.context?.pharmacyName,
      name: detailName || props.context?.pharmacyName,
      date: props.context?.date,
      type: detailType || props.context?.type,
      detailName,
      detailType,
      searchKeyword: keyword,
      keyword,
      pageNum,
      pageSize: size,
    };
  };

  const loadData = async (pageNum = currentPage.value, size = pageSize.value) => {
    if (!modalOpen.value) return;
    try {
      if (import.meta.env.DEV && PHARMACY_ANALYSIS_DRILL_DOWN_ENDPOINT !== '/business/pharmacy/detail/drill/page') {
        throw new Error(`药房分析下钻接口异常: ${PHARMACY_ANALYSIS_DRILL_DOWN_ENDPOINT}`);
      }
      loading.value = true;
      const response = await getPharmacyPatientDrillPage(getRequestParams(pageNum, size));
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
      console.error('加载药店下钻明细失败:', error);
      message.error('加载药店下钻明细失败');
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

  const getRowKey = (record, index) => {
    return record?.jsid || record?.jzid || record?.id || record?.idCard || `${index}`;
  };

  const getSerialNumber = (index) => {
    return (currentPage.value - 1) * pageSize.value + index + 1;
  };

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
