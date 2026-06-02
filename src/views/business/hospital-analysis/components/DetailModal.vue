<template>
  <a-modal v-model:open="visible" title="住院明细数据" :width="1200" :footer="null" @cancel="handleClose">
    <template #title>
      <div class="flex items-center">
        <i class="fas fa-list-alt text-blue-600 mr-2"></i>
        住院明细数据
      </div>
    </template>

    <div class="mb-4">
      <a-input-search v-model:value="searchText" placeholder="搜索姓名或身份证号..." style="width: 280px" @search="handleSearch" />
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredData"
      :pagination="pagination"
      :loading="loading"
      size="small"
      :row-key="(record, index) => index"
      :scroll="{ x: 1400, y: 400 }"
      @change="handleTableChange"
      @resizeColumn="handleResizeColumn"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'totalCost'">
          {{ formatCurrency(record.totalCost) }}
        </template>
        <template v-else-if="column.key === 'reimbursement'">
          {{ formatCurrency(record.reimbursement) }}
        </template>
      </template>
    </a-table>
  </a-modal>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';

  const props = defineProps({
    open: {
      type: Boolean,
      default: false,
    },
    drillDownType: {
      type: String,
      default: '',
    },
    drillDownParams: {
      type: Object,
      default: () => ({}),
    },
    data: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['update:open', 'close', 'search', 'page-change']);

  const visible = ref(false);
  const searchText = ref('');

  const columns = ref([
    { title: '参保单位社区', dataIndex: 'insuranceUnit', key: 'insuranceUnit', width: 140, resizable: true },
    { title: '姓名', dataIndex: 'name', key: 'name', width: 80, resizable: true },
    { title: '身份证号', dataIndex: 'idCard', key: 'idCard', width: 160, resizable: true },
    { title: '医疗机构', dataIndex: 'hospital', key: 'hospital', width: 160, resizable: true },
    { title: '入院日期', dataIndex: 'admissionDate', key: 'admissionDate', width: 100, resizable: true },
    { title: '出院日期', dataIndex: 'dischargeDate', key: 'dischargeDate', width: 100, resizable: true },
    { title: '总费用', dataIndex: 'totalCost', key: 'totalCost', width: 100, resizable: true },
    { title: '统筹报销', dataIndex: 'reimbursement', key: 'reimbursement', width: 100, resizable: true },
    { title: '住院日', dataIndex: 'hospitalDays', key: 'hospitalDays', width: 80, resizable: true },
    { title: '诊断编码', dataIndex: 'diagnosisCode', key: 'diagnosisCode', width: 100, resizable: true },
    { title: '诊断名称', dataIndex: 'diagnosisName', key: 'diagnosisName', width: 140, resizable: true },
  ]);

  const handleResizeColumn = (width, col) => {
    const targetKey = col?.key || col?.dataIndex;
    if (!targetKey) return;
    columns.value.forEach((item) => {
      if ((item.key || item.dataIndex) === targetKey) {
        item.width = Math.floor(width);
      }
    });
  };

  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条记录`,
  });

  const filteredData = computed(() => {
    let result = [...props.data];

    // 根据下钻类型筛选
    if (props.drillDownType === 'hospital' && props.drillDownParams.hospitalName) {
      result = result.filter((item) => item.hospital === props.drillDownParams.hospitalName);
    } else if (props.drillDownType === 'disease' && props.drillDownParams.diseaseCode) {
      result = result.filter((item) => item.diagnosisCode === props.drillDownParams.diseaseCode);
    }

    // 搜索筛选
    if (searchText.value) {
      const search = searchText.value.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(search) || item.idCard.includes(search));
    }

    return result;
  });

  const formatCurrency = (num) => {
    if (num === null || num === undefined) return '¥0';
    return '¥' + num.toLocaleString();
  };

  const handleSearch = () => {
    pagination.value.current = 1;
    emit('search', searchText.value);
  };

  const handleTableChange = (pag, filters, sorter) => {
    pagination.value.current = pag.current;
    pagination.value.pageSize = pag.pageSize;
    emit('page-change', { page: pag.current, pageSize: pag.pageSize });
  };

  const handleClose = () => {
    visible.value = false;
    searchText.value = '';
    emit('update:open', false);
    emit('close');
  };

  // 监听外部 open 属性
  watch(
    () => props.open,
    (val) => {
      visible.value = val;
      if (val) {
        searchText.value = '';
        pagination.value.current = 1;
      }
    }
  );

  // 监听内部 visible 变化
  watch(visible, (val) => {
    emit('update:open', val);
  });
</script>

<style scoped>
  :deep(.ant-modal-header) {
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 12px;
  }
</style>
