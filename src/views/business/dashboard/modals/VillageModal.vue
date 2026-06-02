<template>
  <a-modal v-model:open="modalVisible" :title="modalTitle" width="80%" :footer="null" destroyOnClose @cancel="handleClose">
    <div class="modal-content">
      <a-spin :spinning="loading">
        <!-- 详细数据表格 -->
        <div class="table-container">
          <h4>各村医保详细数据</h4>
          <a-table
            :columns="columns"
            :data-source="tableData"
            :pagination="pagination"
            :loading="loading"
            row-key="villageName"
            size="small"
            @change="handleTableChange"
            @resizeColumn="handleResizeColumn"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'participantsIncreaseNum'">
                <span class="inline-flex items-center" :class="trendClass(record.participantsIncreaseNum)">
                  <i
                    v-if="hasTrendArrow(record.participantsIncreaseNum)"
                    class="fas mr-1"
                    :class="trendArrowIcon(record.participantsIncreaseNum)"
                  ></i>
                  {{ formatNumber(record.participantsIncreaseNum) }}
                </span>
              </template>
              <template v-if="column.key === 'fundIncreaseRate'">
                <span class="inline-flex items-center" :class="trendClass(record.fundIncreaseRate)">
                  <i v-if="hasTrendArrow(record.fundIncreaseRate)" class="fas mr-1" :class="trendArrowIcon(record.fundIncreaseRate)"></i>
                  {{ (record.fundIncreaseRate * 100).toFixed(2) }}%
                </span>
              </template>
            </template>
          </a-table>
        </div>
      </a-spin>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, watch, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { getVillageData } from '/@/api/business/dashboard/dashboard-api';

  const props = defineProps({
    visible: Boolean,
    districtName: {
      type: String,
      default: '',
    },
    townshipName: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits(['update:visible']);

  // 响应式数据
  const modalVisible = ref(props.visible);
  const loading = ref(false);

  // 计算弹窗标题
  const modalTitle = computed(() => `${props.townshipName}各村医保详细数据`);

  // 表格数据
  const tableData = ref([]);
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
  });

  // 表格列定义
  const columns = ref([
    {
      title: '村',
      dataIndex: 'villageName',
      key: 'villageName',
      width: 180,
      resizable: true,
    },
    {
      title: '参保人数',
      dataIndex: 'participantCount',
      key: 'participantCount',
      sorter: true,
      customRender: ({ text }) => formatNumber(text),
      width: 140,
      resizable: true,
    },
    {
      title: '新增人数',
      dataIndex: 'participantsIncreaseNum',
      key: 'participantsIncreaseNum',
      sorter: true,
      width: 140,
      resizable: true,
    },
    {
      title: '医保资金 (亿元)',
      dataIndex: 'fundAmount',
      key: 'fundAmount',
      sorter: true,
      customRender: ({ text }) => Number(text).toFixed(2),
      width: 160,
      resizable: true,
    },
    {
      title: '资金增幅',
      dataIndex: 'fundIncreaseRate',
      key: 'fundIncreaseRate',
      sorter: true,
      width: 140,
      resizable: true,
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

  // 监听visible变化
  watch(
    () => props.visible,
    (newVal) => {
      modalVisible.value = newVal;
      if (newVal && props.townshipName) {
        loadData();
      }
    }
  );

  // 监听modalVisible变化
  watch(modalVisible, (newVal) => {
    emit('update:visible', newVal);
  });

  // 加载数据
  const loadData = async () => {
    if (!props.districtName || !props.townshipName) {
      message.error('区县名称和乡镇名称不能为空');
      return;
    }

    loading.value = true;
    try {
      const response = await getVillageData(props.districtName, props.townshipName);
      // 模拟数据处理
      if (response.data) {
        tableData.value = response.data.map((item) => ({
          ...item,
          participantsIncreaseNum: Math.floor(Math.random() * 100) - 50,
          fundIncreaseRate: Math.random() * 0.05 - 0.025,
        }));
        pagination.value.total = tableData.value.length;
      } else {
        tableData.value = [];
        pagination.value.total = 0;
      }
    } catch (error) {
      console.error('加载村级数据失败:', error);
      message.error('加载村级数据失败');
      tableData.value = [];
      pagination.value.total = 0;
    } finally {
      loading.value = false;
    }
  };

  // 处理表格变化
  const handleTableChange = (pag) => {
    pagination.value.current = pag.current;
    pagination.value.pageSize = pag.pageSize;
    loadData();
  };

  // 关闭弹窗
  const handleClose = () => {
    modalVisible.value = false;
  };

  // 格式化数字
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    return Number(num).toLocaleString();
  };

  const trendClass = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num) || num === 0) {
      return '';
    }
    return num > 0 ? 'text-red-600' : 'text-green-600';
  };

  const hasTrendArrow = (value) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) && Math.abs(num) >= 0.005;
  };

  const trendArrowIcon = (value) => {
    const num = Number(value ?? 0);
    return num > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  };
</script>

<style scoped>
  .modal-content {
    max-height: 70vh;
    overflow-y: auto;
    padding: 20px 0;
  }

  .table-container {
    background: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .table-container h4 {
    margin-bottom: 16px;
    font-weight: 600;
    color: #374151;
    font-size: 18px;
  }

  .text-green-600 {
    color: #16a34a;
  }

  .text-red-600 {
    color: #dc2626;
  }
</style>
