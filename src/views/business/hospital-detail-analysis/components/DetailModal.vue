<template>
  <a-modal
    v-model:open="visibleLocal"
    :title="modalTitle"
    width="90%"
    :max-width="'1400px'"
    :footer="null"
    :centered="true"
    @cancel="handleClose"
  >
    <div class="overflow-y-auto flex-grow" style="max-height: 80vh">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div class="flex flex-wrap gap-2 mt-3 sm:mt-0">
          <a-input
            v-model:value="searchKeyword"
            class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64"
            placeholder="搜索姓名或身份证号..."
            allow-clear
            @input="handleSearch"
          >
            <template #prefix>
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </template>
          </a-input>
        </div>
      </div>

      <!-- 表格容器 -->
      <div class="overflow-x-auto scrollbar-hide">
        <a-table
          :columns="columns"
          :data-source="filteredData"
          :loading="loading"
          :pagination="false"
          :row-key="(record) => record.hospitalizationNo || record.id"
          size="middle"
          class="min-w-full table-shadow"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'insuranceUnit'">
              {{ record.districtName }}
            </template>

            <template v-else-if="column.key === 'name'">
              {{ record.patientName }}
            </template>

            <template v-else-if="column.key === 'idCard'">
              {{ record.idCard }}
            </template>

            <template v-else-if="column.key === 'hospital'">
              {{ record.hospitalName }}
            </template>

            <template v-else-if="column.key === 'admissionDate'">
              {{ record.admissionDate }}
            </template>

            <template v-else-if="column.key === 'dischargeDate'">
              {{ record.dischargeDate }}
            </template>

            <template v-else-if="column.key === 'totalCost'">
              ¥{{ record.totalCost?.toLocaleString() || '--' }}
            </template>

            <template v-else-if="column.key === 'reimbursement'">
              ¥{{ record.reimbursement?.toLocaleString() || '--' }}
            </template>

            <template v-else-if="column.key === 'hospitalDays'">
              {{ record.hospitalDays }}
            </template>

            <template v-else-if="column.key === 'diagnosisCode'">
              {{ record.diseaseCode }}
            </template>

            <template v-else-if="column.key === 'diagnosisName'">
              {{ record.diseaseName }}
            </template>
          </template>
        </a-table>
      </div>

      <!-- 分页 -->
      <div class="mt-6 flex flex-col sm:flex-row justify-between items-center">
        <div class="text-sm text-gray-500 mb-4 sm:mb-0">
          显示 {{ paginationInfo.start }} 至 {{ paginationInfo.end }} 条，共 {{ paginationInfo.total }} 条记录
        </div>
        <a-pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="paginationInfo.total"
          :show-size-changer="true"
          :show-quick-jumper="true"
          :page-size-options="['10', '20', '50', '100']"
          @change="handlePageChange"
        />
      </div>
    </div>

    <template #footer>
      <a-button type="primary" @click="handleClose">
        关闭
      </a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { DetailAPI } from '/@/api/business/hospital-detail-analysis/hospital-detail-analysis-api';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  detailType: {
    type: String,
    default: ''
  },
  detailName: {
    type: String,
    default: ''
  },
  detailCode: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:visible', 'close']);

// Local visible state
const visibleLocal = ref(props.visible);
const loading = ref(false);

// Watch for external visible changes
watch(() => props.visible, (newValue) => {
  visibleLocal.value = newValue;
  if (newValue) {
    fetchDetailData();
  }
});

// Watch for local visible changes
watch(visibleLocal, (newValue) => {
  emit('update:visible', newValue);
});

// Table columns
const columns = [
  {
    title: '参保单位',
    dataIndex: 'districtName',
    key: 'insuranceUnit',
    width: 120
  },
  {
    title: '姓名',
    dataIndex: 'patientName',
    key: 'name',
    width: 80
  },
  {
    title: '身份证号',
    dataIndex: 'idCard',
    key: 'idCard',
    width: 140
  },
  {
    title: '医疗机构',
    dataIndex: 'hospitalName',
    key: 'hospital',
    width: 180
  },
  {
    title: '入院日期',
    dataIndex: 'admissionDate',
    key: 'admissionDate',
    width: 100
  },
  {
    title: '出院日期',
    dataIndex: 'dischargeDate',
    key: 'dischargeDate',
    width: 100
  },
  {
    title: '住院天数',
    dataIndex: 'hospitalDays',
    key: 'hospitalDays',
    width: 80
  },
  {
    title: '总费用',
    dataIndex: 'totalCost',
    key: 'totalCost',
    width: 100
  },
  {
    title: '报销金额',
    dataIndex: 'reimbursement',
    key: 'reimbursement',
    width: 100
  },
  {
    title: '诊断编码',
    dataIndex: 'diseaseCode',
    key: 'diagnosisCode',
    width: 100
  },
  {
    title: '诊断名称',
    dataIndex: 'diseaseName',
    key: 'diagnosisName',
    width: 150
  }
];

// Detail data from API
const detailData = ref([]);

// Fetch detail data from API
const fetchDetailData = async () => {
  try {
    loading.value = true;
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    };

    // Add filter based on detail type
    if (props.detailType === 'hospital' && props.detailCode) {
      params.hospitalId = props.detailCode;
    } else if (props.detailType === 'disease' && props.detailCode) {
      params.diseaseCode = props.detailCode;
    } else if (props.detailType === 'area' && props.detailCode) {
      params.districtId = props.detailCode;
    }

    // Add search keyword
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value;
    }

    const response = await DetailAPI.getHospitalizationDetail(params);
    if (response && response.data) {
      detailData.value = response.data.list || response.data || [];
      totalRecords.value = response.data.total || detailData.value.length;
    }
  } catch (error) {
    console.error('获取住院明细数据失败:', error);
    // Keep empty data on error
    detailData.value = [];
  } finally {
    loading.value = false;
  }
};

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);
const searchKeyword = ref('');
const totalRecords = ref(0);

// Filtered data - use detailData directly since filtering is done on backend
const filteredData = computed(() => detailData.value);

// Modal title
const modalTitle = computed(() => {
  if (props.detailType === 'area') {
    return `${props.detailName} 住院明细数据`;
  } else if (props.detailType === 'hospital') {
    return `${props.detailName} 住院明细数据`;
  } else if (props.detailType === 'disease') {
    return `${props.detailName} (${props.detailCode}) 住院明细数据`;
  }
  return '住院明细数据';
});

// Pagination info
const paginationInfo = computed(() => {
  const total = totalRecords.value;
  const start = total > 0 ? (currentPage.value - 1) * pageSize.value + 1 : 0;
  const end = Math.min(currentPage.value * pageSize.value, total);
  return { start, end, total };
});

// Event handlers
const handleSearch = () => {
  currentPage.value = 1;
  fetchDetailData();
};

const handlePageChange = (page, size) => {
  currentPage.value = page;
  pageSize.value = size;
  fetchDetailData();
};

const handleClose = () => {
  visibleLocal.value = false;
  emit('close');
};

// Watch for detail type/name changes
watch([() => props.detailType, () => props.detailName, () => props.detailCode], () => {
  if (visibleLocal.value) {
    currentPage.value = 1;
    fetchDetailData();
  }
}, { deep: true });

// Watch for search keyword changes (debounced)
let searchTimeout = null;
watch(searchKeyword, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchDetailData();
  }, 300);
});
</script>

<style scoped>
.table-shadow {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
