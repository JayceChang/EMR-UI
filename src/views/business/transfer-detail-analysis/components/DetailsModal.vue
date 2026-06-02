<template>
  <a-modal v-model:open="modalVisible" title="住院明细数据" width="90%" :footer="null" :centered="true" @cancel="handleClose">
    <div class="overflow-y-auto flex-grow max-h-[70vh]">
      <div class="flex flex-wrap gap-2 mt-3 sm:mt-0 mb-4">
        <a-input-search v-model:value="searchKeyword" placeholder="搜索姓名或身份证号..." style="width: 300px" @search="handleSearch" />
      </div>
      <div class="overflow-x-auto scrollbar-hide">
        <a-table
          :columns="columns"
          :data-source="filteredData"
          :pagination="pagination"
          :loading="loading"
          size="small"
          class="min-w-full"
          :row-key="(record) => record.idCard + record.admissionDate"
          @resizeColumn="handleResizeColumn"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'insuranceUnit'">
              <span class="text-sm">{{ record.insuranceUnit }}</span>
            </template>
            <template v-else-if="column.key === 'name'">
              <span class="text-sm font-medium">{{ record.name }}</span>
            </template>
            <template v-else-if="column.key === 'idCard'">
              <span class="text-sm font-mono">{{ record.idCard }}</span>
            </template>
            <template v-else-if="column.key === 'hospital'">
              <span class="text-sm">{{ record.hospital }}</span>
            </template>
            <template v-else-if="column.key === 'admissionDate'">
              <span class="text-sm">{{ record.admissionDate }}</span>
            </template>
            <template v-else-if="column.key === 'dischargeDate'">
              <span class="text-sm">{{ record.dischargeDate }}</span>
            </template>
            <template v-else-if="column.key === 'totalCost'">
              <span class="text-sm font-semibold text-red-600">¥{{ record.totalCost.toLocaleString() }}</span>
            </template>
            <template v-else-if="column.key === 'reimbursement'">
              <span class="text-sm font-semibold text-green-600">¥{{ record.reimbursement.toLocaleString() }}</span>
            </template>
            <template v-else-if="column.key === 'hospitalDays'">
              <span class="text-sm">{{ record.hospitalDays }}</span>
            </template>
            <template v-else-if="column.key === 'diagnosisCode'">
              <span class="text-sm">{{ record.diagnosisCode }}</span>
            </template>
            <template v-else-if="column.key === 'diagnosisName'">
              <span class="text-sm">{{ record.diagnosisName }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { message } from 'ant-design-vue';

  // 使用 defineModel 处理 v-model (Vue 3.4+)
  const modalVisible = defineModel('visible', { type: Boolean, default: false });

  const props = defineProps({
    drillDownParams: {
      type: Object,
      default: () => ({}),
    },
  });

  // State
  const loading = ref(false);
  const searchKeyword = ref('');
  const currentPage = ref(1);
  const pageSize = ref(10);

  // Mock data - 住院明细数据
  const detailsData = ref([
    {
      insuranceUnit: '文峰区社区',
      name: '张**',
      idCard: '4105********1234',
      hospital: '安阳市第一人民医院',
      admissionDate: '2023-12-01',
      dischargeDate: '2023-12-08',
      totalCost: 8560,
      reimbursement: 5620,
      hospitalDays: 7,
      diagnosisCode: 'I10',
      diagnosisName: '高血压',
    },
    {
      insuranceUnit: '北关区社区',
      name: '李**',
      idCard: '4105********5678',
      hospital: '安阳市第一人民医院',
      admissionDate: '2023-12-02',
      dischargeDate: '2023-12-09',
      totalCost: 7240,
      reimbursement: 4820,
      hospitalDays: 7,
      diagnosisCode: 'E11',
      diagnosisName: '2型糖尿病',
    },
    {
      insuranceUnit: '殷都区社区',
      name: '王**',
      idCard: '4105********9012',
      hospital: '安阳市第二人民医院',
      admissionDate: '2023-12-03',
      dischargeDate: '2023-12-10',
      totalCost: 9120,
      reimbursement: 6050,
      hospitalDays: 8,
      diagnosisCode: 'I21',
      diagnosisName: '急性心肌梗死',
    },
    {
      insuranceUnit: '龙安区社区',
      name: '赵*',
      idCard: '4105********3456',
      hospital: '安阳市中医院',
      admissionDate: '2023-12-04',
      dischargeDate: '2023-12-11',
      totalCost: 6850,
      reimbursement: 4520,
      hospitalDays: 7,
      diagnosisCode: 'J44',
      diagnosisName: '慢性阻塞性肺病',
    },
    {
      insuranceUnit: '高新区社区',
      name: '刘**',
      idCard: '4105********7890',
      hospital: '安阳市第一人民医院',
      admissionDate: '2023-12-05',
      dischargeDate: '2023-12-12',
      totalCost: 8230,
      reimbursement: 5420,
      hospitalDays: 7,
      diagnosisCode: 'N18',
      diagnosisName: '慢性肾衰竭',
    },
    {
      insuranceUnit: '文峰区社区',
      name: '陈**',
      idCard: '4105********2345',
      hospital: '安阳市第二人民医院',
      admissionDate: '2023-12-06',
      dischargeDate: '2023-12-18',
      totalCost: 7560,
      reimbursement: 4980,
      hospitalDays: 12,
      diagnosisCode: 'K80',
      diagnosisName: '胆石症',
    },
    {
      insuranceUnit: '北关区社区',
      name: '杨**',
      idCard: '4105********6789',
      hospital: '安阳市中医院',
      admissionDate: '2023-12-07',
      dischargeDate: '2023-12-14',
      totalCost: 6940,
      reimbursement: 4580,
      hospitalDays: 7,
      diagnosisCode: 'M17',
      diagnosisName: '膝关节病',
    },
    {
      insuranceUnit: '殷都区社区',
      name: '黄**',
      idCard: '4105********0123',
      hospital: '安阳市第一人民医院',
      admissionDate: '2023-12-08',
      dischargeDate: '2023-12-15',
      totalCost: 9580,
      reimbursement: 6320,
      hospitalDays: 7,
      diagnosisCode: 'C34',
      diagnosisName: '支气管和肺恶性肿瘤',
    },
    {
      insuranceUnit: '龙安区社区',
      name: '吴**',
      idCard: '4105********4567',
      hospital: '安阳市第二人民医院',
      admissionDate: '2023-12-09',
      dischargeDate: '2023-12-16',
      totalCost: 8120,
      reimbursement: 5360,
      hospitalDays: 7,
      diagnosisCode: 'G40',
      diagnosisName: '癫痫',
    },
    {
      insuranceUnit: '高新区社区',
      name: '郑**',
      idCard: '4105********8901',
      hospital: '安阳市中医院',
      admissionDate: '2023-12-10',
      dischargeDate: '2023-12-17',
      totalCost: 7350,
      reimbursement: 4850,
      hospitalDays: 7,
      diagnosisCode: 'H35',
      diagnosisName: '黄斑变性',
    },
    {
      insuranceUnit: '文峰区社区',
      name: '孙**',
      idCard: '4105********3456',
      hospital: '安阳市第一人民医院',
      admissionDate: '2023-12-11',
      dischargeDate: '2023-12-18',
      totalCost: 7850,
      reimbursement: 5120,
      hospitalDays: 7,
      diagnosisCode: 'I63',
      diagnosisName: '脑梗死',
    },
    {
      insuranceUnit: '北关区社区',
      name: '朱**',
      idCard: '4105********7890',
      hospital: '安阳市第一人民医院',
      admissionDate: '2023-12-12',
      dischargeDate: '2023-12-19',
      totalCost: 6540,
      reimbursement: 4280,
      hospitalDays: 7,
      diagnosisCode: 'J18',
      diagnosisName: '肺炎',
    },
    {
      insuranceUnit: '殷都区社区',
      name: '马**',
      idCard: '4105********2345',
      hospital: '安阳市第二人民医院',
      admissionDate: '2023-12-13',
      dischargeDate: '2023-12-20',
      totalCost: 8920,
      reimbursement: 5840,
      hospitalDays: 7,
      diagnosisCode: 'K29',
      diagnosisName: '胃炎',
    },
    {
      insuranceUnit: '龙安区社区',
      name: '郭**',
      idCard: '4105********6789',
      hospital: '安阳市中医院',
      admissionDate: '2023-12-14',
      dischargeDate: '2023-12-21',
      totalCost: 7210,
      reimbursement: 4720,
      hospitalDays: 7,
      diagnosisCode: 'M54',
      diagnosisName: '腰痛',
    },
    {
      insuranceUnit: '高新区社区',
      name: '胡**',
      idCard: '4105********0123',
      hospital: '安阳市第一人民医院',
      admissionDate: '2023-12-15',
      dischargeDate: '2023-12-22',
      totalCost: 9360,
      reimbursement: 6120,
      hospitalDays: 7,
      diagnosisCode: 'Z00',
      diagnosisName: '健康体检',
    },
  ]);

  // Filtered data
  const filteredData = computed(() => {
    let result = [...detailsData.value];

    // Apply search filter
    if (searchKeyword.value) {
      const searchTerm = searchKeyword.value.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(searchTerm) || item.idCard.includes(searchTerm));
    }

    // Apply drill-down filter
    if (props.drillDownParams.type === 'hospital') {
      result = result.filter((item) => item.hospital === props.drillDownParams.name);
    }

    return result;
  });

  // Pagination
  const pagination = computed(() => ({
    current: currentPage.value,
    pageSize: pageSize.value,
    total: filteredData.value.length,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `显示 ${range[0]} 至 ${range[1]}条，共 ${total}条记录`,
    onChange: (page, size) => {
      currentPage.value = page;
      pageSize.value = size;
    },
  }));

  // Table columns
  const columns = ref([
    {
      title: '参保单位社区',
      dataIndex: 'insuranceUnit',
      key: 'insuranceUnit',
      width: 160,
      resizable: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      resizable: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      key: 'idCard',
      width: 180,
      resizable: true,
      sorter: (a, b) => a.idCard.localeCompare(b.idCard),
    },
    {
      title: '医疗机构',
      dataIndex: 'hospital',
      key: 'hospital',
      width: 180,
      resizable: true,
      sorter: (a, b) => a.hospital.localeCompare(b.hospital),
    },
    {
      title: '入院日期',
      dataIndex: 'admissionDate',
      key: 'admissionDate',
      width: 140,
      resizable: true,
      sorter: (a, b) => new Date(a.admissionDate) - new Date(b.admissionDate),
    },
    {
      title: '出院日期',
      dataIndex: 'dischargeDate',
      key: 'dischargeDate',
      width: 140,
      resizable: true,
      sorter: (a, b) => new Date(a.dischargeDate) - new Date(b.dischargeDate),
    },
    {
      title: '总费用',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 140,
      resizable: true,
      sorter: (a, b) => a.totalCost - b.totalCost,
    },
    {
      title: '统筹报销',
      dataIndex: 'reimbursement',
      key: 'reimbursement',
      width: 140,
      resizable: true,
      sorter: (a, b) => a.reimbursement - b.reimbursement,
    },
    {
      title: '住院日',
      dataIndex: 'hospitalDays',
      key: 'hospitalDays',
      width: 120,
      resizable: true,
      sorter: (a, b) => a.hospitalDays - b.hospitalDays,
    },
    {
      title: '诊断编码',
      dataIndex: 'diagnosisCode',
      key: 'diagnosisCode',
      width: 140,
      resizable: true,
      sorter: (a, b) => a.diagnosisCode.localeCompare(b.diagnosisCode),
    },
    {
      title: '诊断名称',
      dataIndex: 'diagnosisName',
      key: 'diagnosisName',
      width: 200,
      resizable: true,
      sorter: (a, b) => a.diagnosisName.localeCompare(b.diagnosisName),
    },
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

  // Event handlers
  const handleClose = () => {
    modalVisible.value = false;
  };

  const handleSearch = (value) => {
    console.log('搜索:', value);
  };
</script>

<style scoped>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
