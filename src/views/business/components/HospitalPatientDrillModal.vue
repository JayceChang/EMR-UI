<template>
  <a-modal v-model:open="modalOpen" :title="modalTitle" width="92%" :footer="null" :centered="true" @cancel="handleClose">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="text-sm text-gray-500">{{ contextDescription }}</div>
      <div class="flex items-center gap-2">
        <a-button v-if="showBackToGroupList" size="small" @click="backToGroupList"> 返回集团机构列表 </a-button>
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索姓名/身份证号/机构/病种..."
          style="width: 320px"
          allow-clear
          :disabled="isGroupListMode"
          @search="handleSearch"
        />
      </div>
    </div>

    <a-table
      :columns="currentColumns"
      :data-source="currentTableData"
      :loading="loading"
      :pagination="currentPagination"
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
        <template v-else-if="column.key === '__action'">
          <a @click="openInstitutionDetail(record)">下钻人维度</a>
        </template>
        <template v-else>
          <span>{{ formatCellValue(column.key, record?.[column.dataIndex]) }}</span>
        </template>
      </template>
    </a-table>
  </a-modal>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import dayjs from 'dayjs';
  import { message } from 'ant-design-vue';
  import { AdministrativeDistrictAPI } from '/@/api/system/administrative-district-api';
  import { getHospitalPatientDrillPage } from '/@/api/business/hospital-drill-down/hospital-drill-down-api';

  const modalOpen = defineModel('open', { type: Boolean, default: false });

  const props = defineProps({
    context: {
      type: Object,
      default: () => ({}),
    },
    fetchInstitutionPage: {
      type: Function,
      default: null,
    },
  });

  const loading = ref(false);
  const groupInstitutionRows = ref([]);
  const detailRows = ref([]);
  const selectedInstitutionName = ref('');
  const searchKeyword = ref('');
  const districtCodeMap = ref(new Map());
  const groupColumnWidthMap = ref({});
  const detailColumnWidthMap = ref({});

  const groupPagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const detailPagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const sourceType = computed(() => props.context?.sourceType || 'institution');
  const isGroupListMode = computed(() => sourceType.value === 'group' && !selectedInstitutionName.value);
  const showBackToGroupList = computed(() => sourceType.value === 'group' && !!selectedInstitutionName.value);

  const modalTitle = computed(() => {
    if (sourceType.value === 'group' && selectedInstitutionName.value) {
      return `住院下钻 - ${selectedInstitutionName.value}`;
    }
    return props.context?.title || '住院下钻明细';
  });

  const contextDescription = computed(() => {
    const startMonth = normalizeMonth(props.context?.startMonth) || '--';
    const endMonth = normalizeMonth(props.context?.endMonth) || '--';
    if (isGroupListMode.value) {
      return `来源: 医疗集团 | 范围: ${props.context?.groupName || '--'} | 时间: ${startMonth} 至 ${endMonth}`;
    }
    if (sourceType.value === 'district') {
      return `来源: 区县 | 范围: ${props.context?.districtName || '--'} | 时间: ${startMonth} 至 ${endMonth}`;
    }
    if (sourceType.value === 'group') {
      return `来源: 医疗集团 | 医院: ${selectedInstitutionName.value || '--'} | 时间: ${startMonth} 至 ${endMonth}`;
    }
    return `来源: 医疗机构 | 范围: ${props.context?.institutionName || '--'} | 时间: ${startMonth} 至 ${endMonth}`;
  });

  const groupColumns = ref([
    {
      title: '序号',
      key: '__index',
      width: groupColumnWidthMap.value.__index || 80,
      resizable: true,
      fixed: 'left',
    },
    {
      title: '医疗机构',
      dataIndex: 'name',
      key: 'name',
      width: groupColumnWidthMap.value.name || 240,
      resizable: true,
      ellipsis: true,
    },
    {
      title: '所属区县',
      dataIndex: 'district',
      key: 'district',
      width: groupColumnWidthMap.value.district || 160,
      resizable: true,
    },
    {
      title: '医院等级',
      dataIndex: 'level',
      key: 'level',
      width: groupColumnWidthMap.value.level || 120,
      resizable: true,
    },
    {
      title: '住院人次',
      dataIndex: 'hospitalizations',
      key: 'hospitalizations',
      width: groupColumnWidthMap.value.hospitalizations || 140,
      resizable: true,
    },
    {
      title: '次均费用(元)',
      dataIndex: 'avgCost',
      key: 'avgCost',
      width: groupColumnWidthMap.value.avgCost || 140,
      resizable: true,
    },
    {
      title: '操作',
      key: '__action',
      width: groupColumnWidthMap.value.__action || 130,
      resizable: true,
      fixed: 'right',
    },
  ]);

  const detailColumns = ref([
    {
      title: '序号',
      key: '__index',
      width: detailColumnWidthMap.value.__index || 80,
      resizable: true,
      fixed: 'left',
    },
    {
      title: '姓名',
      dataIndex: 'patientName',
      key: 'patientName',
      width: detailColumnWidthMap.value.patientName || 120,
      resizable: true,
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      key: 'idCard',
      width: detailColumnWidthMap.value.idCard || 180,
      resizable: true,
    },
    {
      title: '医疗机构',
      dataIndex: 'hospitalName',
      key: 'hospitalName',
      width: detailColumnWidthMap.value.hospitalName || 220,
      resizable: true,
      ellipsis: true,
    },
    {
      title: '区县',
      dataIndex: 'districtName',
      key: 'districtName',
      width: detailColumnWidthMap.value.districtName || 140,
      resizable: true,
    },
    {
      title: '入院日期',
      dataIndex: 'admissionDate',
      key: 'admissionDate',
      width: detailColumnWidthMap.value.admissionDate || 130,
      resizable: true,
    },
    {
      title: '出院日期',
      dataIndex: 'dischargeDate',
      key: 'dischargeDate',
      width: detailColumnWidthMap.value.dischargeDate || 130,
      resizable: true,
    },
    {
      title: '住院天数',
      dataIndex: 'hospitalDays',
      key: 'hospitalDays',
      width: detailColumnWidthMap.value.hospitalDays || 120,
      resizable: true,
    },
    {
      title: '病种编码',
      dataIndex: 'diseaseCode',
      key: 'diseaseCode',
      width: detailColumnWidthMap.value.diseaseCode || 150,
      resizable: true,
    },
    {
      title: '病种名称',
      dataIndex: 'diseaseName',
      key: 'diseaseName',
      width: detailColumnWidthMap.value.diseaseName || 220,
      resizable: true,
      ellipsis: true,
    },
    {
      title: '总费用(元)',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: detailColumnWidthMap.value.totalCost || 150,
      resizable: true,
    },
    {
      title: '报销金额(元)',
      dataIndex: 'reimbursement',
      key: 'reimbursement',
      width: detailColumnWidthMap.value.reimbursement || 150,
      resizable: true,
    },
    {
      title: '自费金额(元)',
      dataIndex: 'selfPay',
      key: 'selfPay',
      width: detailColumnWidthMap.value.selfPay || 150,
      resizable: true,
    },
    {
      title: '报销比例(%)',
      dataIndex: 'reimbursementRate',
      key: 'reimbursementRate',
      width: detailColumnWidthMap.value.reimbursementRate || 130,
      resizable: true,
    },
  ]);

  const handleResizeColumn = (width, col) => {
    const targetKey = col?.key || col?.dataIndex;
    if (!targetKey) return;
    const targetColumns = isGroupListMode.value ? groupColumns.value : detailColumns.value;
    const targetWidthMap = isGroupListMode.value ? groupColumnWidthMap.value : detailColumnWidthMap.value;
    targetColumns.forEach((item) => {
      if ((item.key || item.dataIndex) === targetKey) {
        const nextWidth = Math.floor(width);
        item.width = nextWidth;
        targetWidthMap[targetKey] = nextWidth;
      }
    });
  };

  const currentColumns = computed(() => (isGroupListMode.value ? groupColumns.value : detailColumns.value));
  const currentTableData = computed(() => (isGroupListMode.value ? groupInstitutionRows.value : detailRows.value));

  const groupPaginationConfig = computed(() => ({
    current: groupPagination.value.current,
    pageSize: groupPagination.value.pageSize,
    total: groupPagination.value.total,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (value) => `共 ${value} 条`,
  }));

  const detailPaginationConfig = computed(() => ({
    current: detailPagination.value.current,
    pageSize: detailPagination.value.pageSize,
    total: detailPagination.value.total,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (value) => `共 ${value} 条`,
  }));

  const currentPagination = computed(() => (isGroupListMode.value ? groupPaginationConfig.value : detailPaginationConfig.value));

  const normalizeMonth = (value) => {
    if (!value) return '';
    if (dayjs.isDayjs(value)) return value.format('YYYY-MM');
    if (typeof value === 'string') return value.length >= 7 ? value.slice(0, 7) : value;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('YYYY-MM') : '';
  };

  const toBoundaryDate = (monthValue, boundary) => {
    const month = normalizeMonth(monthValue);
    if (!month) return undefined;
    const base = dayjs(`${month}-01`);
    if (!base.isValid()) return undefined;
    return boundary === 'end' ? base.endOf('month').format('YYYY-MM-DD') : base.startOf('month').format('YYYY-MM-DD');
  };

  const parsePagedData = (response, fallbackPageNum, fallbackPageSize) => {
    const data = response?.data;
    if (Array.isArray(data)) {
      return {
        list: data,
        total: data.length,
        pageNum: fallbackPageNum,
        pageSize: fallbackPageSize,
      };
    }

    const list = data?.list || data?.records || data?.rows || data?.data || [];
    return {
      list: Array.isArray(list) ? list : [],
      total: data?.total || data?.count || 0,
      pageNum: data?.pageNum || data?.current || fallbackPageNum,
      pageSize: data?.pageSize || data?.size || fallbackPageSize,
    };
  };

  const ensureDistrictCodeMap = async () => {
    if (districtCodeMap.value.size > 0) return;
    const response = await AdministrativeDistrictAPI.getDistrictList('2,3');
    const list = Array.isArray(response?.data) ? response.data : [];
    const map = new Map();
    list.forEach((item) => {
      if (item?.name && item?.code) {
        map.set(item.name, item.code);
      }
    });
    districtCodeMap.value = map;
  };

  const resolveDistrictIdByName = async (districtName) => {
    if (!districtName) return '';
    await ensureDistrictCodeMap();
    return districtCodeMap.value.get(districtName) || '';
  };

  const getBaseDetailParams = (pageNum, pageSize) => ({
    startDate: toBoundaryDate(props.context?.startMonth, 'start'),
    endDate: toBoundaryDate(props.context?.endMonth, 'end'),
    insuranceType: props.context?.insuranceType,
    searchKeyword: searchKeyword.value?.trim() || undefined,
    keyword: searchKeyword.value?.trim() || undefined,
    pageNum,
    pageSize,
  });

  const loadGroupInstitutionList = async (pageNum = groupPagination.value.current, pageSize = groupPagination.value.pageSize) => {
    if (typeof props.fetchInstitutionPage !== 'function') {
      message.error('缺少集团机构查询方法');
      return;
    }

    try {
      loading.value = true;
      const response = await props.fetchInstitutionPage({
        startMonth: normalizeMonth(props.context?.startMonth),
        endMonth: normalizeMonth(props.context?.endMonth),
        group: props.context?.groupCode,
        pageNum,
        pageSize,
      });
      const parsed = parsePagedData(response, pageNum, pageSize);
      groupInstitutionRows.value = parsed.list;
      groupPagination.value.current = parsed.pageNum;
      groupPagination.value.pageSize = parsed.pageSize;
      groupPagination.value.total = parsed.total;
    } catch (error) {
      console.error('加载集团机构列表失败:', error);
      message.error('加载集团机构列表失败');
      groupInstitutionRows.value = [];
      groupPagination.value.total = 0;
    } finally {
      loading.value = false;
    }
  };

  const loadPatientDetail = async (pageNum = detailPagination.value.current, pageSize = detailPagination.value.pageSize) => {
    try {
      loading.value = true;
      const params = getBaseDetailParams(pageNum, pageSize);

      if (sourceType.value === 'district') {
        const districtId = await resolveDistrictIdByName(props.context?.districtName);
        if (!districtId) {
          message.warning(`未匹配到区县编码: ${props.context?.districtName || '--'}`);
          detailRows.value = [];
          detailPagination.value.total = 0;
          return;
        }
        params.districtId = districtId;
      } else if (sourceType.value === 'group') {
        if (!selectedInstitutionName.value) {
          detailRows.value = [];
          detailPagination.value.total = 0;
          return;
        }
        params.hospitalName = selectedInstitutionName.value;
      } else {
        params.hospitalName = props.context?.institutionName;
      }

      const response = await getHospitalPatientDrillPage(params);
      const parsed = parsePagedData(response, pageNum, pageSize);
      detailRows.value = parsed.list;
      detailPagination.value.current = parsed.pageNum;
      detailPagination.value.pageSize = parsed.pageSize;
      detailPagination.value.total = parsed.total;
    } catch (error) {
      console.error('加载住院下钻明细失败:', error);
      message.error('加载住院下钻明细失败');
      detailRows.value = [];
      detailPagination.value.total = 0;
    } finally {
      loading.value = false;
    }
  };

  const initializeAndLoad = async () => {
    selectedInstitutionName.value = '';
    searchKeyword.value = '';
    groupInstitutionRows.value = [];
    detailRows.value = [];
    groupPagination.value.current = 1;
    groupPagination.value.pageSize = 10;
    groupPagination.value.total = 0;
    detailPagination.value.current = 1;
    detailPagination.value.pageSize = 10;
    detailPagination.value.total = 0;
    groupColumnWidthMap.value = {};
    detailColumnWidthMap.value = {};

    if (sourceType.value === 'group') {
      await loadGroupInstitutionList(1, groupPagination.value.pageSize);
      return;
    }
    await loadPatientDetail(1, detailPagination.value.pageSize);
  };

  const backToGroupList = async () => {
    selectedInstitutionName.value = '';
    searchKeyword.value = '';
    detailRows.value = [];
    detailPagination.value.current = 1;
    detailPagination.value.total = 0;
    await loadGroupInstitutionList(1, groupPagination.value.pageSize);
  };

  const openInstitutionDetail = async (record) => {
    selectedInstitutionName.value = record?.name || '';
    if (!selectedInstitutionName.value) {
      message.warning('医疗机构名称缺失，无法下钻');
      return;
    }
    detailPagination.value.current = 1;
    await loadPatientDetail(1, detailPagination.value.pageSize);
  };

  const handleSearch = async () => {
    if (isGroupListMode.value) return;
    detailPagination.value.current = 1;
    await loadPatientDetail(1, detailPagination.value.pageSize);
  };

  const handleTableChange = async (pagination) => {
    if (isGroupListMode.value) {
      groupPagination.value.current = pagination.current;
      groupPagination.value.pageSize = pagination.pageSize;
      await loadGroupInstitutionList(pagination.current, pagination.pageSize);
      return;
    }

    detailPagination.value.current = pagination.current;
    detailPagination.value.pageSize = pagination.pageSize;
    await loadPatientDetail(pagination.current, pagination.pageSize);
  };

  const getSerialNumber = (index) => {
    if (isGroupListMode.value) {
      return (groupPagination.value.current - 1) * groupPagination.value.pageSize + index + 1;
    }
    return (detailPagination.value.current - 1) * detailPagination.value.pageSize + index + 1;
  };

  const getRowKey = (record, index) => {
    if (isGroupListMode.value) {
      return record?.name || `${index}`;
    }
    return record?.hospitalizationNo || record?.id || `${index}`;
  };

  const formatCellValue = (key, value) => {
    if (value === undefined || value === null || value === '') return '--';
    if (typeof value === 'number') {
      if (key === 'totalCost' || key === 'avgCost' || key === 'reimbursement' || key === 'selfPay' || key === 'avgReimbursement') {
        return value.toLocaleString('zh-CN');
      }
      return value.toLocaleString('zh-CN');
    }
    return value;
  };

  const handleClose = () => {
    modalOpen.value = false;
  };

  watch(
    [() => modalOpen.value, () => props.context],
    async ([open, context], [previousOpen, previousContext]) => {
      if (!open) {
        return;
      }

      const openedJustNow = open && !previousOpen;
      const contextChangedWhileOpen = !!previousOpen && context !== previousContext;

      if (openedJustNow || contextChangedWhileOpen) {
        await initializeAndLoad();
      }
    },
    { deep: true }
  );
</script>

<style scoped></style>
