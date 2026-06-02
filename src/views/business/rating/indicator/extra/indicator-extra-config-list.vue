<template>
  <div class="indicator-task-container">
    <!-- 顶部搜索区域 -->
    <div class="search-bar">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="编码">
          <a-input v-model:value="searchForm.code" placeholder="请输入编码" size="small1" style="width: 150px" />
        </a-form-item>
        <a-form-item label="起始时间">
          <a-date-picker
            v-model:value="searchForm.startTime"
            size="small1"
            style="width: 150px"
            :show-time="{ format: 'HH:mm:ss' }"
            format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>
        <a-form-item label="截止时间">
          <a-date-picker
            v-model:value="searchForm.endTime"
            size="small1"
            style="width: 150px"
            :show-time="{ format: 'HH:mm:ss' }"
            format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" size="small1" @click="handleSearch">
            <template #icon><SearchOutlined /></template>
            查询
          </a-button>
          <a-button type="primary" size="small1" style="margin-left: 8px" @click="handleAdd">
            <template #icon><PlusOutlined /></template>
            添加
          </a-button>
        </a-form-item>
        <a-form-item>
          <a-alert message="提示：双击表格行可查看数据处理日志" type="info" size="small" show-icon style="margin-left: 16px" />
        </a-form-item>
      </a-form>
    </div>

    <!-- 表格区域 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      rowKey="id"
      size="small"
      bordered
      @change="handleTableChange"
      :customRow="customRow"
    >
      <!-- 序号列 -->
      <template #bodyCell="{ column, index, record }">
        <!-- 序号列 -->
        <template v-if="column.dataIndex === 'index'">
          {{ index + 1 }}
        </template>

        <!-- 操作列 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space size="small">
            <a class="action-link edit-link" @click="handleEdit(record)"> <EditOutlined /> 编辑 </a>
            <a class="action-link fetch-link" @click="handleManualFetch(record)"> <DownloadOutlined /> 手动抓取 </a>
            <!-- <a class="action-link stop-link" @click="handleManualStop(record)"> <PauseCircleOutlined /> 手动停止 </a> -->
            <a-popconfirm title="确定要删除该任务吗?" ok-text="确定" cancel-text="取消" @confirm="handleDelete(record)">
              <a class="action-link delete-link"> <DeleteOutlined /> 删除 </a>
            </a-popconfirm>
          </a-space>
        </template>

        <!-- 状态列 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag v-if="record.status === 0" :color="'gray'">
            {{ $smartEnumPlugin.getDescByValue('INDICATOR_HANDLE_STATUS_ENUM', record.status) }}
          </a-tag>
          <a-tag v-else-if="record.status === 1" :color="'orange'">
            {{ $smartEnumPlugin.getDescByValue('INDICATOR_HANDLE_STATUS_ENUM', record.status) }}
          </a-tag>
          <a-tag v-else-if="record.status === 2" :color="'red'">
            {{ $smartEnumPlugin.getDescByValue('INDICATOR_HANDLE_STATUS_ENUM', record.status) }}
          </a-tag>
          <a-tag v-else-if="record.status === 3" :color="'green'">
            {{ $smartEnumPlugin.getDescByValue('INDICATOR_HANDLE_STATUS_ENUM', record.status) }}
          </a-tag>
        </template>

        <!-- 更新说明列 - 优化显示 -->
        <template v-if="column.dataIndex === 'frequencyDesc'">
          <div class="frequency-desc-cell">
            <!-- 当内容较短时直接显示 -->
            <div v-if="!record.frequencyDesc || record.frequencyDesc.length <= 15" class="desc-short">
              {{ record.frequencyDesc || '-' }}
            </div>

            <!-- 当内容较长时提供展开/收起功能 -->
            <div v-else class="desc-long">
              <a-tooltip
                :title="record.frequencyDesc"
                placement="topLeft"
                :overlayStyle="{ maxWidth: '600px', whiteSpace: 'pre-wrap' }"
              >
                <div
                  class="frequency-desc-content"
                  :class="{ 'expanded': expandedRows.includes(record.id) }"
                >
                  <div class="desc-text">
                    {{ expandedRows.includes(record.id) ? record.frequencyDesc : record.frequencyDesc.substring(0, 15) + '...' }}
                  </div>
                  <a-button
                    type="link"
                    size="small"
                    class="expand-btn"
                    @click.stop="toggleRowExpand(record.id)"
                  >
                    <template #icon>
                      <DownOutlined v-if="!expandedRows.includes(record.id)" />
                      <UpOutlined v-else />
                    </template>
                    {{ expandedRows.includes(record.id) ? '收起' : '展开' }}
                  </a-button>
                </div>
              </a-tooltip>
            </div>
          </div>
        </template>
      </template>
    </a-table>

    <!-- 引入表单弹窗组件 -->
    <indicator-extra-config-form ref="formRef" @reloadList="fetchTableData" />

    <!-- 引入手动抓取模态框 -->
    <manual-fetch-modal ref="manualFetchModalRef" @success="fetchTableData" />

    <!-- 引入数据处理日志模态框 -->
    <data-process-log-modal ref="dataProcessLogModalRef" />
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, PauseCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue';
  import IndicatorExtraConfigForm from './indicator-extra-config-form.vue';
  import ManualFetchModal from './manual-fetch-modal.vue'; // 导入模态框组件
  import DataProcessLogModal from './data-process-log-modal.vue'; // 导入数据处理日志模态框组件
  import { indicatorExtraConfigApi } from '/@/api/business/rating/indicator/extra/indicator-extra-config-api';

  // 表单组件引用
  const formRef = ref();
  const manualFetchModalRef = ref(); // 添加模态框引用
  const dataProcessLogModalRef = ref(); // 添加数据处理日志模态框引用

  // 搜索表单
  const searchForm = reactive({
    code: '',
    startTime: null,
    endTime: null,
  });

  // 表格相关
  const loading = ref(false);
  const tableData = ref([]);
  const expandedRows = ref([]); // 展开的行ID数组
  const pagination = reactive({
    current: 1,
    pageSize: 15,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `显示第 ${total} 条，共 ${total} 条`,
  });

  // 列定义
  const columns = [
    { title: '序号', dataIndex: 'index', width: 60, align: 'center' },
    { title: '操作', dataIndex: 'action', width: 220, align: 'center' },
    { title: '指标描述', dataIndex: 'remark', width: 180 },
    { title: '主编码', dataIndex: 'indicatorCode', width: 100, align: 'center' },
    { title: '状态', dataIndex: 'status', width: 100, align: 'center' },
    { title: '取数天数', dataIndex: 'redundancy', width: 100, align: 'center' },
    { title: '数据更新时间', dataIndex: 'lastDate', width: 160, align: 'center' },
    { title: '下次抓取时间', dataIndex: 'nextDate', width: 160, align: 'center' },
    { title: '首次更新基准', dataIndex: 'firstUpdateStandard', width: 160, align: 'center' },
    { title: '更新说明', dataIndex: 'frequencyDesc', width: 400 },
  ];

  // 获取表格数据
  async function fetchTableData() {
    loading.value = true;
    try {
      // 构建查询参数，包含查询表单和分页信息
      const params = {
        // 查询表单字段
        indicatorCode: searchForm.code,
        startTime: searchForm.startTime ? searchForm.startTime.format('YYYY-MM-DD HH:mm:ss') : undefined,
        endTime: searchForm.endTime ? searchForm.endTime.format('YYYY-MM-DD HH:mm:ss') : undefined,
        // 分页参数
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      };

      // 调用真实的后台API
      const response = await indicatorExtraConfigApi.queryPage(params);

      // 处理返回的数据
      if (response && response.data) {
        tableData.value = response.data.list || [];
        pagination.total = response.data.total || 0;
      }
      loading.value = false;
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败');
      loading.value = false;
    }
  }

  // 表格分页、排序、筛选变化
  function handleTableChange(pag, filters, sorter) {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    fetchTableData();
  }

  // 搜索
  function handleSearch() {
    pagination.current = 1;
    fetchTableData();
  }

  // 添加
  function handleAdd() {
    formRef.value.show();
  }

  // 编辑
  function handleEdit(record) {
    formRef.value.show(record);
  }

  // 手动抓取
  function handleManualFetch(record) {
    manualFetchModalRef.value.show(record);
  }

  // 手动停止
  function handleManualStop(record) {
    message.success(`已停止 ${record.remark} 的任务`);
  }

  // 删除
  async function handleDelete(record) {
    const id = record.id;
    const response = await indicatorExtraConfigApi.delete(id);
    if (response.ok) {
      message.success(`成功删除 ${record.remark}`);
    }
    fetchTableData(); // 重新加载数据
  }

  // 双击行显示数据处理日志
  function handleRowDoubleClick(record) {
    dataProcessLogModalRef.value.show(record);
  }

  // 自定义行属性，添加双击事件
  function customRow(record) {
    return {
      onDblclick: () => handleRowDoubleClick(record),
      style: { cursor: 'pointer' },
    };
  }

  // 切换行展开/收起状态
  function toggleRowExpand(rowId) {
    const index = expandedRows.value.indexOf(rowId);
    if (index > -1) {
      expandedRows.value.splice(index, 1); // 收起
    } else {
      expandedRows.value.push(rowId); // 展开
    }
  }

  // 组件挂载时获取数据
  onMounted(() => {
    fetchTableData();
  });
</script>

<style lang="less" scoped>
  .indicator-task-container {
    padding: 16px;
    background-color: #fff;

    .search-bar {
      margin-bottom: 16px;
      padding: 16px;
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    // 操作按钮样式
    .action-link {
      color: #1890ff;
      margin-right: 8px;
      font-size: 12px;

      &.edit-link {
        color: #1890ff;
      }

      &.fetch-link {
        color: #52c41a;
      }

      &.stop-link {
        color: #faad14;
      }

      &.delete-link {
        color: #f5222d;
      }
    }

    // 表格内小图标对齐
    :deep(.anticon) {
      vertical-align: 0;
    }

    // 分页器样式
    :deep(.ant-pagination) {
      margin-top: 16px;
      text-align: right;
    }

    // 表格内容超出显示省略号（排除更新说明列）
    :deep(.ant-table-cell) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    // 更新说明列特殊样式
    .frequency-desc-cell {
      width: 100%;

      .desc-short {
        line-height: 1.5;
        word-break: break-word;
        white-space: normal;
        color: #666;
      }

      .desc-long {
        .frequency-desc-content {
          position: relative;
          line-height: 1.5;
          word-break: break-word;
          white-space: normal;

          .desc-text {
            display: block;
            margin-bottom: 8px;
            color: #333;
            transition: all 0.3s ease;
          }

          .expand-btn {
            display: inline-flex;
            align-items: center;
            font-size: 12px;
            padding: 2px 8px;
            height: 24px;
            border-radius: 4px;
            background-color: #f0f0f0;
            border: 1px solid #d9d9d9;
            color: #666;
            transition: all 0.2s ease;

            &:hover {
              background-color: #e6f7ff;
              border-color: #91d5ff;
              color: #1890ff;
            }

            .anticon {
              margin-right: 4px;
              font-size: 10px;
            }
          }

          &.expanded {
            .desc-text {
              color: #333;
            }
          }
        }
      }
    }

    // 更新说明列的单元格样式覆盖
    &.frequency-desc-table {
      :deep(.ant-table-tbody > tr > td) {
        // 更新说明列（最后一列）的特殊样式
        &:last-child {
          white-space: normal;
          overflow: visible;
          text-overflow: initial;
          vertical-align: top;
          padding: 12px 16px;
          min-height: 60px;
        }

        // 其他列保持原有样式
        &:not(:last-child) {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      // 表头样式
      :deep(.ant-table-thead > tr > th:last-child) {
        background-color: #fafafa;
        font-weight: 600;
      }
    }

    // 表格行悬停效果
    :deep(.ant-table-tbody > tr:hover > td) {
      background-color: #e6f7ff !important;
    }

    // 表格行双击提示
    :deep(.ant-table-tbody > tr) {
      transition: background-color 0.2s;

      &:hover {
        background-color: #f0f9ff;
      }
    }
  }
</style>
