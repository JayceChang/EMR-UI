<template>
  <a-modal v-model:open="visible" title="数据处理日志" width="1200px" :footer="null" :destroyOnClose="true" @cancel="handleCancel">
    <!-- 搜索区域 -->
    <div class="search-section">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="时间段">
          <a-range-picker
            v-model:value="searchForm.timeRange"
            size="small1"
            style="width: 300px"
            :show-time="{ format: 'HH:mm:ss' }"
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="['开始时间', '结束时间']"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="searchForm.status" size="small1" style="width: 120px" placeholder="请选择状态" allowClear>
            <a-select-option :value="0">成功</a-select-option>
            <a-select-option :value="1">失败</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="编码">
          <a-input v-model:value="searchForm.code" size="small1" style="width: 150px" placeholder="请输入编码" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" size="small1" @click="handleSearch">
            <template #icon><SearchOutlined /></template>
            查询
          </a-button>
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
      :scroll="{ y: 400 }"
    >
      <!-- 自定义列渲染 -->
      <template #bodyCell="{ column, index, record }">
        <!-- 序号列 -->
        <template v-if="column.dataIndex === 'index'">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>

        <!-- 状态列 -->
        <template v-if="column.dataIndex === 'status'">
          <!-- <a-tag v-if="record.status === 0" color="default">待处理</a-tag>
          <a-tag v-else-if="record.status === 1" color="processing">处理中</a-tag>
          <a-tag v-else-if="record.status === 2" color="error">失败</a-tag>
          <a-tag v-else-if="record.status === 3" color="success">成功</a-tag>
          <a-tag v-else color="default">未知</a-tag> -->
          <a-tag v-if="record.status === 0" color="success">成功</a-tag>
          <a-tag v-else-if="record.status === 1" color="error">失败</a-tag>
          <a-tag v-else color="default">未知</a-tag>
        </template>

        <!-- 取数类型列 -->
        <template v-if="column.dataIndex === 'tType'">
          <span v-if="record.tType === 1">手动</span>
          <span v-else-if="record.tType === 2">自动</span>
          <span v-else>未知</span>
        </template>

        <!-- 处理人列 -->
        <template v-if="column.dataIndex === 'createUserId'">
          <span>{{ record.createUserId ? '服务' : '系统' }}</span>
        </template>

        <!-- 处理时间列 -->
        <template v-if="column.dataIndex === 'tDate'">
          <span>{{ formatDateTime(record.tDate) }}</span>
        </template>

        <!-- 描述列 -->
        <template v-if="column.dataIndex === 'tdesc'">
          <a-tooltip :title="record.tdesc" placement="topLeft">
            <span class="text-ellipsis">{{ record.tdesc }}</span>
          </a-tooltip>
        </template>
      </template>
    </a-table>
  </a-modal>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { indicatorConfigLogApi } from '/@/api/business/rating/indicator/config/indicator-config-log-api';
  import dayjs from 'dayjs';

  // 组件状态
  const visible = ref(false);
  const loading = ref(false);
  const tableData = ref([]);
  const currentRecord = ref(null);

  // 搜索表单
  const searchForm = reactive({
    timeRange: null,
    status: undefined,
    code: '',
  });

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 15,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `显示第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  });

  // 表格列定义
  const columns = [
    { title: '序号', dataIndex: 'index', width: 60, align: 'center' },
    { title: '编码', dataIndex: 'indicatorCode', width: 100, align: 'center' },
    { title: '年份', dataIndex: 'tYear', width: 100, align: 'center' },
    { title: '月份', dataIndex: 'tSerialNum', width: 100, align: 'center' },
    { title: '按天日期', dataIndex: 'tTime', width: 100, align: 'center' },
    { title: '状态', dataIndex: 'status', width: 80, align: 'center' },
    { title: '处理人', dataIndex: 'createUserName', width: 80, align: 'center' },
    { title: '处理时间', dataIndex: 'tdate', width: 160, align: 'center' },
    { title: '描述', dataIndex: 'tdesc', width: 300, ellipsis: true },
  ];

  // 格式化日期时间
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss');
  };
  // 获取表格数据
  const fetchTableData = async () => {
    loading.value = true;
    try {
      const params = {
        // 查询条件
        indicatorCode: searchForm.code ? searchForm.code : currentRecord.value?.indicatorCode,
        status: searchForm.status,
        // 时间范围
        startDate: searchForm.timeRange?.[0] ? dayjs(searchForm.timeRange[0]).format('YYYY-MM-DD HH:mm:ss') : undefined,
        endDate: searchForm.timeRange?.[1] ? dayjs(searchForm.timeRange[1]).format('YYYY-MM-DD HH:mm:ss') : undefined,
        // 分页参数
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      };

      const response = await indicatorConfigLogApi.queryPage(params);

      if (response && response.data) {
        tableData.value = response.data.list || [];
        pagination.total = response.data.total || 0;
      }
    } catch (error) {
      console.error('获取数据处理日志失败:', error);
      message.error('获取数据处理日志失败');
    } finally {
      loading.value = false;
    }
  };

  // 表格分页、排序、筛选变化
  const handleTableChange = (pag, filters, sorter) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    fetchTableData();
  };

  // 搜索
  const handleSearch = () => {
    pagination.current = 1;
    fetchTableData();
  };

  // 取消/关闭
  const handleCancel = () => {
    visible.value = false;
    // 重置搜索表单
    searchForm.timeRange = null;
    searchForm.status = undefined;
    searchForm.code = '';
    // 重置分页
    pagination.current = 1;
    pagination.total = 0;
    // 清空数据
    tableData.value = [];
    currentRecord.value = null;
  };

  // 显示modal
  const show = (record) => {
    currentRecord.value = record;
    visible.value = true;
    // 重置搜索条件
    searchForm.timeRange = null;
    searchForm.status = undefined;
    searchForm.code = '';
    pagination.current = 1;
    // 获取数据
    fetchTableData();
  };

  // 暴露方法给父组件
  defineExpose({
    show,
  });
</script>

<style lang="less" scoped>
  .search-section {
    margin-bottom: 16px;
    padding: 16px;
    background-color: #fafafa;
    border-radius: 6px;
  }

  .text-ellipsis {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.ant-table-tbody > tr > td) {
    padding: 8px 12px;
  }

  :deep(.ant-table-thead > tr > th) {
    padding: 8px 12px;
    background-color: #fafafa;
  }
</style>
