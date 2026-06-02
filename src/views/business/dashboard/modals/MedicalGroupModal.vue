<template>
  <a-modal v-model:open="modalVisible" :title="modalTitle" width="90%" :footer="null" destroyOnClose @cancel="handleClose">
    <div class="modal-content">
      <a-spin :spinning="loading">
        <!-- 图表区域 -->
        <div class="chart-row">
          <div class="chart-container">
            <h4>所管辖区城乡居民参保人数与医保资金</h4>
            <div ref="barLineChartRef" class="chart"></div>
          </div>
          <div class="chart-container">
            <h4>所管辖区城乡居民参保人数与医保资金历年对比</h4>
            <div ref="historicalChartRef" class="chart"></div>
          </div>
        </div>

        <div class="chart-row">
          <div class="chart-container">
            <h4>所管辖区城乡居民住院率</h4>
            <div ref="hospitalizationBarRef" class="chart"></div>
          </div>
          <div class="chart-container">
            <h4>所管辖区城乡居民住院率趋势</h4>
            <div ref="hospitalizationLineRef" class="chart"></div>
          </div>
        </div>

        <div class="chart-row">
          <div class="chart-container">
            <h4>所管辖区城乡居民外转率</h4>
            <div ref="outwardBarRef" class="chart"></div>
          </div>
          <div class="chart-container">
            <h4>所管辖区城乡居民外转率趋势</h4>
            <div ref="outwardLineRef" class="chart"></div>
          </div>
        </div>

        <!-- 详细数据表格 -->
        <div class="table-container">
          <h4>所管辖区城乡居民医保详细数据</h4>
          <a-table
            :columns="columns"
            :data-source="tableData"
            :pagination="pagination"
            :loading="loading"
            row-key="districtName"
            size="small"
            @change="handleTableChange"
            @resizeColumn="handleResizeColumn"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a @click="handleDrillDown(record)">下钻</a>
              </template>
            </template>
          </a-table>
        </div>
      </a-spin>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, watch, nextTick, computed } from 'vue';
  import * as echarts from 'echarts';
  import { DrillDownAPI } from '/@/api/business/dashboard/dashboard-api';

  const props = defineProps({
    visible: Boolean,
    groupType: {
      type: String,
      required: true,
      validator: (value) => ['rmyy', 'zyyy', 'tumor'].includes(value),
    },
    districtData: Array,
  });

  const emit = defineEmits(['update:visible', 'drill-down']);

  // 响应式数据
  const modalVisible = ref(props.visible);
  const loading = ref(false);

  // 计算弹窗标题
  const modalTitle = computed(() => {
    const titles = {
      rmyy: '安阳市人民医院医疗集团医保数据下钻明细',
      zyyy: '安阳市中医院医疗集团医保数据下钻明细',
      tumor: '安阳市肿瘤联盟医保数据下钻明细',
    };
    return titles[props.groupType] || '医疗集团数据下钻明细';
  });

  // 图表引用
  const barLineChartRef = ref(null);
  const historicalChartRef = ref(null);
  const hospitalizationBarRef = ref(null);
  const hospitalizationLineRef = ref(null);
  const outwardBarRef = ref(null);
  const outwardLineRef = ref(null);

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
      title: '区县',
      dataIndex: 'districtName',
      key: 'districtName',
      width: 160,
      resizable: true,
    },
    {
      title: '参保人数',
      dataIndex: 'participantCount',
      key: 'participantCount',
      sorter: true,
      width: 140,
      resizable: true,
    },
    {
      title: '医保资金 (亿元)',
      dataIndex: 'fundAmount',
      key: 'fundAmount',
      sorter: true,
      width: 160,
      resizable: true,
    },
    {
      title: '住院率',
      dataIndex: 'hospitalizationRate',
      key: 'hospitalizationRate',
      sorter: true,
      width: 120,
      resizable: true,
    },
    {
      title: '外转率',
      dataIndex: 'outwardTransferRate',
      key: 'outwardTransferRate',
      sorter: true,
      width: 120,
      resizable: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 80,
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
      if (newVal) {
        loadData();
        renderCharts();
      }
    }
  );

  // 监听modalVisible变化
  watch(modalVisible, (newVal) => {
    emit('update:visible', newVal);
  });

  // 加载数据
  const loadData = async () => {
    loading.value = true;
    try {
      let response;
      if (props.groupType === 'rmyy') {
        response = await DrillDownAPI.getRmyyDetail({
          page: pagination.value.current,
          size: pagination.value.pageSize,
        });
      } else if (props.groupType === 'zyyy') {
        response = await DrillDownAPI.getZyyyDetail({
          page: pagination.value.current,
          size: pagination.value.pageSize,
        });
      } else if (props.groupType === 'tumor') {
        response = await DrillDownAPI.getTumorAllianceDetail({
          page: pagination.value.current,
          size: pagination.value.pageSize,
        });
      }

      tableData.value = response?.data?.records || [];
      pagination.value.total = response?.data?.total || 0;
    } catch (error) {
      console.error(`加载${modalTitle.value}失败:`, error);
    } finally {
      loading.value = false;
    }
  };

  // 渲染图表
  const renderCharts = async () => {
    await nextTick();

    if (barLineChartRef.value) {
      const chart = echarts.init(barLineChartRef.value);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          data: ['参保人数', '医保资金'],
        },
        xAxis: {
          type: 'category',
          data: (props.districtData || []).map((d) => d.name),
        },
        yAxis: [
          {
            type: 'value',
            name: '参保人数',
          },
          {
            type: 'value',
            name: '医保资金 (亿元)',
          },
        ],
        series: [
          {
            name: '参保人数',
            type: 'bar',
            data: (props.districtData || []).map((d) => d.residentCount),
          },
          {
            name: '医保资金',
            type: 'line',
            yAxisIndex: 1,
            data: (props.districtData || []).map((d) => d.residentFund),
          },
        ],
      });
    }
  };

  // 处理表格变化
  const handleTableChange = (pag) => {
    pagination.value.current = pag.current;
    pagination.value.pageSize = pag.pageSize;
    loadData();
  };

  // 处理下钻
  const handleDrillDown = (record) => {
    emit('drill-down', record);
  };

  // 关闭弹窗
  const handleClose = () => {
    modalVisible.value = false;
  };
</script>

<style scoped>
  .modal-content {
    max-height: 70vh;
    overflow-y: auto;
    padding: 20px 0;
  }

  .chart-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }

  .chart-container {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
  }

  .chart-container h4 {
    margin-bottom: 10px;
    font-weight: 600;
    color: #333;
  }

  .chart {
    width: 100%;
    height: 300px;
  }

  .table-container {
    margin-top: 20px;
    background: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
  }

  .table-container h4 {
    margin-bottom: 10px;
    font-weight: 600;
    color: #333;
  }

  @media (max-width: 768px) {
    .chart-row {
      grid-template-columns: 1fr;
    }
  }
</style>
