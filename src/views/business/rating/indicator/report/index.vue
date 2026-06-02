<template>
  <div class="report-container">
    <!-- 搜索区域 - 根据 isShowSearchForm 控制显示 -->
    <div class="search-container">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="报表编码:">
          <a-input v-model:value="searchForm.reportCode" style="width: 100px;" size="small" placeholder="请输入报表编码" />
        </a-form-item>
        <a-form-item label="报表名称:">
          <a-input v-model:value="searchForm.reportName" style="width: 100px;" size="small" placeholder="请输入报表名称" />
        </a-form-item>
        <a-form-item label="报表分组:">
          <a-input v-model:value="searchForm.reportGroupName" style="width: 100px;" size="small" placeholder="请输入报表分组" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch" size="small">
              <template #icon><SearchOutlined /></template>
              查询
            </a-button>
            <a-button style="margin-left: 8px" @click="handleReset" size="small">
              <template #icon><ReloadOutlined /></template>
              重置
            </a-button>
            <a-button type="primary" size="small" style="margin-left: 8px" @click="addOrUpdateReport" v-if="isShowSearchForm">
              <template #icon><PlusOutlined /></template>
              新建
            </a-button>
            <a-alert message="提示：双击表格行可选中报表" type="info" size="small" show-icon style="margin-left: 16px" v-if="!isShowSearchForm" />
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 表格区域 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      size="small"
      bordered
      row-key="id"
      :row-class-name="getRowClassName"
      :customRow="handleTableRow"
    >
      <!-- 序号列 -->
      <template #bodyCell="{ column, index, record }">
        <template v-if="column.dataIndex === 'index'">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>

        <!-- 状态列 -->
        <template v-if="column.dataIndex === 'disabledFlag'">
          <a-tag :color="record.disabledFlag === 1 ? 'green' : 'red'">
            {{ record.disabledFlag === 1 ? '启用' : '禁用' }}
          </a-tag>
        </template>

        <!-- 操作列 -->
        <template v-if="column.dataIndex === 'action'">
          <a @click="viewReport(record)">查看</a>
          <a-divider type="vertical" />
          <a @click="addOrUpdateReport(record)" v-if="isShowSearchForm">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确定要删除该报表吗?" ok-text="确定" cancel-text="取消" @confirm="handleDelete(record)" v-if="isShowSearchForm">
            <a style="color: #ff4d4f">删除</a>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <!-- 表单弹窗 -->
    <ReportFormModal ref="reportFormModalRef" @reloadList="fetchData" />
  </div>
</template>

<script setup>
  import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { onMounted, reactive, ref } from 'vue';
import ReportFormModal from './components/report-form-modal.vue';
import { reportConfigApi } from '/@/api/business/rating/indicator/report/report-config-api';
import { SmartLoading } from '/@/components/framework/smart-loading';
import { smartSentry } from '/@/lib/smart-sentry';

  // 定义 props 和 emits
  const props = defineProps({
    // 是否显示搜索表单
    isShowSearchForm: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits(['select-report']);

  // 选中的报表
  const selectedReport = ref(null);

  // 获取行样式
  function getRowClassName(record) {
    return selectedReport.value && record.id === selectedReport.value.id ? 'selected-row' : '';
  }

  function handleTableRow(record) {
    return {
      onDblclick: () => {
        onRowClick(record);
      },
    };
  }

  // 处理行点击
  function onRowClick(record) {
    if (!props.isShowSearchForm) {
      // 仅在选择器模式下启用选择功能
      selectedReport.value = record;

      // 双击行时自动选择并关闭
      if (selectedReport.value) {
        emit('select-report', selectedReport.value);
      }
    }
  }

  // 表格列定义
  const columns = [
    { title: '序号', dataIndex: 'index', width: 60, align: 'center' },
    { title: '报表code', dataIndex: 'reportCode', width: 100 },
    { title: '报表名称', dataIndex: 'reportName', width: 200 },
    { title: '报表地址', dataIndex: 'reportUrl', ellipsis: true },
    { title: '报表分组', dataIndex: 'reportGroupName', width: 150, ellipsis: true },
    { title: '报表描述', dataIndex: 'reportDesc', width: 150, ellipsis: true },
    { title: '状态', dataIndex: 'disabledFlag', width: 100, align: 'center' },
    { title: '操作', dataIndex: 'action', width: 120, align: 'center' },
  ];

  // 搜索表单
  const searchForm = reactive({
    reportCode: '',
    reportName: '',
    reportGroupName: '',
  });

  // 表格数据
  const tableData = ref([]);
  const loading = ref(false);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条记录`,
  });

  const reportFormModalRef = ref();

  // 获取数据
  async function fetchData() {
    loading.value = true;
    try {
      const params = {
        ...searchForm,
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      };

      const res = await reportConfigApi.queryReportList(params);
      if (res.ok && res.data) {
        tableData.value = res.data.list || [];
        pagination.total = res.data.total || 0;
      } else {
        message.error(res.msg || '获取数据失败');
      }
    } catch (error) {
      console.error('获取数据出错:', error);
      message.error('获取数据出错');
    } finally {
      loading.value = false;
    }
  }

  // 表格变化处理
  function handleTableChange(pag) {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    fetchData();
  }

  // 搜索处理
  function handleSearch() {
    pagination.current = 1;
    fetchData();
  }

  // 重置处理
  function handleReset() {
    searchForm.reportName = '';
    searchForm.reportGroupName = '';
    pagination.current = 1;
    fetchData();
  }

  // 新增或编辑报表
  function addOrUpdateReport(record) {
    reportFormModalRef.value.showModal(record);
  }

  // 查看报表
  function viewReport(record) {
    window.open(record.reportUrl, '_blank');
  }

  // 删除报表
  async function handleDelete(record) {
    SmartLoading.show();
    try {
      const res = await reportConfigApi.deleteReport(record.id);
      if (res.ok) {
        message.success('删除成功');
        fetchData(); // 重新加载数据
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (error) {
      smartSentry.captureError(error);
      message.error('删除报表出错');
    } finally {
      SmartLoading.hide();
    }
  }

  onMounted(() => {
    fetchData();
  });
</script>

<style scoped>
  .report-container {
    padding: 16px;
    background-color: #fff;
  }

  .search-container {
    margin-bottom: 16px;
    padding: 16px;
    background-color: #fafafa;
    border-radius: 4px;
  }

  /* 添加选中行样式 */
  :deep(.selected-row) {
    background-color: #e6f7ff;
  }
</style>
