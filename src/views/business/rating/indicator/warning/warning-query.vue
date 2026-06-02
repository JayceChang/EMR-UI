<template>
  <div class="warning-query-container">
    <!-- 查询条件区域 -->
    <div class="search-panel">
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="预警指标" name="indicator">
          <a-input v-model:value="searchForm.warningIndicator" placeholder="请输入预警指标名称" style="width: 200px" allow-clear />
        </a-form-item>

        <a-form-item label="预警状态" name="status">
          <a-select v-model:value="searchForm.warningStatus" placeholder="请选择预警状态" style="width: 150px" allow-clear>
            <a-select-option value="trend_exception">数据趋势异常</a-select-option>
            <a-select-option value="missing_data">数据缺失</a-select-option>
            <a-select-option value="threshold_exception">阈值超限</a-select-option>
            <a-select-option value="quality_exception">质量异常</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="预警时间" name="dateRange">
          <a-range-picker v-model:value="searchForm.dateRange" style="width: 240px" format="YYYY-MM" picker="month" />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch" :loading="loading">
              <SearchOutlined />
              查询
            </a-button>
            <a-button @click="handleReset">
              <ReloadOutlined />
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-panel">
      <div class="table-header">
        <div class="table-title">
          <span>预警信息列表</span>
          <!-- <a-badge :count="pagination.total" :number-style="{ backgroundColor: '#ff4d4f' }" /> -->
        </div>
        <!-- <div class="table-actions">
          <a-space>
            <a-button @click="handleExport" :loading="exportLoading">
              <ExportOutlined />
              导出
            </a-button>
            <a-button @click="handleRefresh" :loading="loading">
              <ReloadOutlined />
              刷新
            </a-button>
          </a-space>
        </div> -->
      </div>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 800 }"
        row-key="id"
        @change="handleTableChange"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <!-- 序号列 -->
          <template v-if="column.key === 'index'">
            {{ record.id }}
          </template>

          <!-- 预警指标列 -->
          <template v-if="column.key === 'indicator'">
            <div class="indicator-cell">
              <a-tooltip :title="record.indicator">
                <span class="indicator-text">{{ record.indicator }}</span>
              </a-tooltip>
            </div>
          </template>

          <!-- 状态列 -->
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)" class="status-tag">
              {{ record.status }}
            </a-tag>
          </template>

          <!-- 异常日期列 -->
          <template v-if="column.key === 'date'">
            <span class="date-text">{{ record.date }}</span>
          </template>

          <!-- 预警级别列 -->
          <template v-if="column.key === 'level'">
            <a-tag :color="getLevelColor(record.level)">
              {{ record.level }}
            </a-tag>
          </template>

          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">
                <EyeOutlined />
                查看详情
              </a-button>
              <a-button type="link" size="small" @click="handleProcess(record)">
                <EditOutlined />
                处理
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 预警详情弹窗 -->
    <a-modal v-model:open="detailModalVisible" title="预警详情" width="800px" :footer="null">
      <div class="warning-detail" v-if="currentRecord">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="预警指标">
            {{ currentRecord.indicator }}
          </a-descriptions-item>
          <a-descriptions-item label="预警状态">
            <a-tag :color="getStatusColor(currentRecord.status)">
              {{ currentRecord.status }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="预警级别">
            <a-tag :color="getLevelColor(currentRecord.level)">
              {{ currentRecord.level }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="异常日期">
            {{ currentRecord.date }}
          </a-descriptions-item>
          <a-descriptions-item label="指标值">
            {{ currentRecord.value || '--' }}
          </a-descriptions-item>
          <a-descriptions-item label="阈值范围">
            {{ currentRecord.threshold || '--' }}
          </a-descriptions-item>
          <a-descriptions-item label="预警时间" :span="2">
            {{ currentRecord.warningTime || '--' }}
          </a-descriptions-item>
          <a-descriptions-item label="预警描述" :span="2">
            {{ currentRecord.description || '暂无描述' }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>

    <!-- 处理预警弹窗 -->
    <a-modal v-model:open="processModalVisible" title="处理预警" width="600px" @ok="handleProcessSubmit" :confirm-loading="processLoading">
      <a-form :model="processForm" layout="vertical">
        <a-form-item label="处理方式" name="processType" :rules="[{ required: true, message: '请选择处理方式' }]">
          <a-radio-group v-model:value="processForm.processType">
            <a-radio value="ignored">忽略</a-radio>
            <a-radio value="handled">已解决</a-radio>
            <a-radio value="handling">跟进处理</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="处理说明" name="remark" :rules="[{ required: true, message: '请输入处理说明' }]">
          <a-textarea v-model:value="processForm.remark" placeholder="请输入处理说明" :rows="4" :maxlength="500" show-count />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { SearchOutlined, ReloadOutlined, ExportOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons-vue';
  import dayjs from 'dayjs';
  import { warningApi } from '/@/api/business/rating/indicator/warning/warning-api';

  // 响应式数据
  const loading = ref(false);
  const exportLoading = ref(false);
  const processLoading = ref(false);
  const detailModalVisible = ref(false);
  const processModalVisible = ref(false);
  const currentRecord = ref(null);

  // 搜索表单
  const searchForm = reactive({
    warningIndicator: undefined,
    warningStatus: undefined,
    dateRange: undefined,
  });

  // 处理表单
  const processForm = reactive({
    processType: '',
    remark: '',
  });

  // 表格列定义
  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      align: 'center',
    },
    {
      title: '预警指标',
      key: 'indicator',
      dataIndex: 'indicator',
      width: 300,
      ellipsis: true,
    },
    {
      title: '预警状态',
      key: 'status',
      dataIndex: 'status',
      width: 120,
      align: 'center',
    },
    {
      title: '预警级别',
      key: 'level',
      dataIndex: 'level',
      width: 100,
      align: 'center',
    },
    {
      title: '异常日期',
      key: 'date',
      dataIndex: 'date',
      width: 120,
      align: 'center',
    },
    // {
    //   title: '指标值',
    //   key: 'value',
    //   dataIndex: 'value',
    //   width: 100,
    //   align: 'center',
    // },
    {
      title: '预警时间',
      key: 'warningTime',
      dataIndex: 'warningTime',
      width: 160,
      align: 'center',
    },
    {
      title: '处理状态',
      key: 'eventStatus',
      dataIndex: 'eventStatus',
      width: 160,
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      align: 'center',
      fixed: 'right',
    },
  ];

  // 表格数据
  const tableData = ref([]);

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `共 ${total} 条记录，当前显示 ${range[0]}-${range[1]} 条`,
  });

  // 模拟数据
  // const mockData = [
  //   {
  //     id: 1,
  //     indicator: '20.2 国家基本药物配备使用金额占药品总收入比例',
  //     status: '数据趋势异常',
  //     level: '高',
  //     date: '2025年一月',
  //     value: '15.2%',
  //     threshold: '≥20%',
  //     warningTime: '2025-01-15 14:30:25',
  //     description: '该指标连续3个月低于阈值，需要关注药品采购政策执行情况',
  //   },
  //   {
  //     id: 2,
  //     indicator: '20.2 国家基本药物配备使用金额占药品总收入比例',
  //     status: '数据趋势异常',
  //     level: '中',
  //     date: '2025年一月',
  //     value: '18.5%',
  //     threshold: '≥20%',
  //     warningTime: '2025-01-15 10:15:42',
  //     description: '指标值接近阈值下限，建议加强基本药物使用管理',
  //   },
  //   {
  //     id: 3,
  //     indicator: '19.2 住院患者基本药物使用占比',
  //     status: '数据趋势异常',
  //     level: '高',
  //     date: '2025年一月',
  //     value: '45.8%',
  //     threshold: '≥50%',
  //     warningTime: '2025-01-14 16:45:18',
  //     description: '住院患者基本药物使用比例偏低，影响合理用药指标',
  //   },
  //   {
  //     id: 4,
  //     indicator: '18.1 门诊患者基本药物处方占比',
  //     status: '阈值超限',
  //     level: '中',
  //     date: '2024年十二月',
  //     value: '35.2%',
  //     threshold: '≥40%',
  //     warningTime: '2025-01-10 09:20:33',
  //     description: '门诊基本药物处方比例需要提升',
  //   },
  //   {
  //     id: 5,
  //     indicator: '17.3 抗菌药物使用强度',
  //     status: '质量异常',
  //     level: '高',
  //     date: '2025年一月',
  //     value: '45.2 DDDs',
  //     threshold: '≤40 DDDs',
  //     warningTime: '2025-01-12 11:30:15',
  //     description: '抗菌药物使用强度超标，需要加强抗菌药物管理',
  //   },
  // ];

  // 获取状态颜色
  const getStatusColor = (status) => {
    const colorMap = {
      数据趋势异常: 'orange',
      数据缺失: 'red',
      阈值超限: 'volcano',
      质量异常: 'magenta',
    };
    return colorMap[status] || 'default';
  };

  // 获取级别颜色
  const getLevelColor = (level) => {
    const colorMap = {
      高: 'red',
      中: 'orange',
      低: 'blue',
    };
    return colorMap[level] || 'default';
  };

  // 查询数据
  const loadData = async () => {
    loading.value = true;
    if (searchForm.dateRange) {
      searchForm.startTime = dayjs(searchForm.dateRange[0]).format('YYYY-MM-DD HH:mm:ss');
      searchForm.endTime = dayjs(searchForm.dateRange[1]).format('YYYY-MM-DD HH:mm:ss');
    }

    try {
      // 获取预警列表
      const response = await warningApi.getWarningList({
        ...searchForm,
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      });

      if (response.data) {
        tableData.value = response.data.list;
        pagination.total = response.data.total;
      }
    } catch (error) {
      console.error('获取预警数据失败:', error);
      message.error('获取预警数据失败');
    } finally {
      loading.value = false;
    }
  };

  // 搜索
  const handleSearch = () => {
    pagination.current = 1;
    loadData();
  };

  // 重置
  const handleReset = () => {
    Object.assign(searchForm, {
      warningIndicator: undefined,
      warningStatus: undefined,
      dateRange: undefined,
    });
    pagination.current = 1;
    loadData();
  };

  // 刷新
  const handleRefresh = () => {
    loadData();
  };

  // 导出
  const handleExport = async () => {
    exportLoading.value = true;
    try {
      // 模拟导出延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 这里应该调用实际的导出API
      // await warningApi.exportWarningList(searchForm);

      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    } finally {
      exportLoading.value = false;
    }
  };

  // 表格变化处理
  const handleTableChange = (pag) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    loadData();
  };

  // 查看详情
  const handleView = (record) => {
    currentRecord.value = record;
    detailModalVisible.value = true;
  };

  // 处理预警
  const handleProcess = (record) => {
    currentRecord.value = record;
    processForm.processType = '';
    processForm.remark = '';
    processModalVisible.value = true;
  };

  // 提交处理
  const handleProcessSubmit = async () => {
    if (!processForm.processType || !processForm.remark) {
      message.warning('请填写完整的处理信息');
      return;
    }

    processLoading.value = true;
    try {

      await warningApi.processWarning({
        id: currentRecord.value.id,
        ...processForm
      });

      message.success('处理成功');
      processModalVisible.value = false;
      loadData(); // 刷新数据
    } catch (error) {
      console.error('处理失败:', error);
      message.error('处理失败');
    } finally {
      processLoading.value = false;
    }
  };

  // 组件挂载时加载数据
  onMounted(() => {
    loadData();
  });
</script>
<style lang="less" scoped>
  .warning-query-container {
    padding: 16px;
    background: #f5f5f5;
    min-height: calc(100vh - 64px);

    .search-panel {
      background: #ffffff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .search-form {
        .ant-form-item {
          margin-bottom: 16px;
          margin-right: 24px;

          &:last-child {
            margin-right: 0;
          }
        }

        .ant-form-item-label {
          font-weight: 500;
          color: #262626;
        }
      }
    }

    .table-panel {
      background: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f0f0f0;

        .table-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #262626;

          .ant-badge {
            :deep(.ant-badge-count) {
              font-size: 12px;
              height: 18px;
              line-height: 18px;
              min-width: 18px;
              padding: 0 4px;
            }
          }
        }

        .table-actions {
          .ant-btn {
            margin-left: 8px;
          }
        }
      }

      :deep(.ant-table) {
        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
          color: #262626;
          border-bottom: 2px solid #f0f0f0;
        }

        .ant-table-tbody > tr > td {
          padding: 12px 16px;
          border-bottom: 1px solid #f5f5f5;
        }

        .ant-table-tbody > tr:hover > td {
          background: #f8f9ff;
        }
      }

      .indicator-cell {
        .indicator-text {
          display: block;
          max-width: 280px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #262626;
          font-weight: 500;
        }
      }

      .status-tag {
        font-weight: 500;
        border-radius: 4px;
        margin: 0;
      }

      .date-text {
        color: #595959;
        font-weight: 500;
      }

      :deep(.ant-btn-link) {
        padding: 0;
        height: auto;
        font-size: 14px;

        &:hover {
          color: #40a9ff;
        }
      }
    }

    .warning-detail {
      :deep(.ant-descriptions) {
        .ant-descriptions-item-label {
          font-weight: 600;
          color: #262626;
          background: #fafafa;
        }

        .ant-descriptions-item-content {
          color: #595959;
        }
      }
    }

    :deep(.ant-modal) {
      .ant-modal-header {
        border-bottom: 1px solid #f0f0f0;
        padding: 16px 24px;

        .ant-modal-title {
          font-size: 16px;
          font-weight: 600;
          color: #262626;
        }
      }

      .ant-modal-body {
        padding: 24px;
      }

      .ant-modal-footer {
        border-top: 1px solid #f0f0f0;
        padding: 12px 24px;
      }
    }

    :deep(.ant-form) {
      .ant-form-item-label > label {
        font-weight: 500;
        color: #262626;
      }

      .ant-radio-group {
        .ant-radio-wrapper {
          margin-right: 16px;
        }
      }
    }

    :deep(.ant-pagination) {
      margin-top: 16px;
      text-align: right;

      .ant-pagination-total-text {
        color: #595959;
      }
    }

    // 响应式设计
    @media (max-width: 768px) {
      padding: 8px;

      .search-panel {
        padding: 16px;

        .search-form {
          .ant-form-item {
            margin-right: 0;
            margin-bottom: 12px;
          }
        }
      }

      .table-panel {
        padding: 16px;

        .table-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;

          .table-actions {
            width: 100%;
            text-align: right;
          }
        }
      }
    }
  }

  // 状态标签样式优化
  :deep(.ant-tag) {
    &.status-tag {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
      border: none;
      font-weight: 500;
    }
  }

  // 加载状态优化
  :deep(.ant-spin-nested-loading) {
    .ant-spin-container {
      transition: opacity 0.3s;
    }

    .ant-spin-blur {
      opacity: 0.5;
    }
  }
</style>
