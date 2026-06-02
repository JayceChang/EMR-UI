<!--
  * 指标明细分组数据
  *
  * @Author:    
  * @Date:      2025-05-18 15:30:00
  * @Copyright  ZDS
-->
<template>
    <a-modal
      :title="title"
      :visible="visible"
      :width="900"
      @cancel="handleClose"
      :footer="null"
      :destroyOnClose="true"
      :maskClosable="false"
    >
      <a-spin :spinning="loading">
        <div class="group-table-container">
          <a-table
            :columns="columns"
            :data-source="dataSource"
            size="small"
            :pagination="false"
            :scroll="{ x: false }"
            bordered
          >
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'value'">
                <a-button type="link" @click="handleDrillDown(record)">{{ text }}</a-button>
              </template>
            </template>
          </a-table>
        </div>
        
        <!-- 分页组件 - 使用与list页面相同的样式 -->
        <div class="pagination-container">
          <a-pagination
            v-model:current="pagination.current"
            :pageSize="pagination.pageSize"
            :total="pagination.total"
            :showSizeChanger="true"
            :pageSizeOptions="pagination.pageSizeOptions"
            :showTotal="showTotal"
            @change="handlePageChange"
            @showSizeChange="handleSizeChange"
            size="small"
          />
        </div>
      </a-spin>
      <div class="modal-footer">
        <a-button @click="handleClose">关闭</a-button>
      </div>
    </a-modal>
  </template>
  
  <script setup>
    import { ref, reactive } from 'vue';
    import { message } from 'ant-design-vue';
    import { SmartLoading } from '/@/components/framework/smart-loading';
    import { indicatorDetailGroupDApi } from '/@/api/business/rating/indicator/detail/indicator-detail-group-d-api';
    
    // 弹窗显示状态
    const visible = ref(false);
    // 加载状态
    const loading = ref(false);
    // 标题
    const title = ref('');
    // 表格数据
    const dataSource = ref([]);
    
    // 当前选中的记录
    const currentRecord = ref(null);
    // 分组字段
    const groupField = ref('');
    
    // 分页配置 - 与list页面保持一致
    const pagination = reactive({
      current: 1,
      pageSize: 15,
      total: 0,
      showSizeChanger: true,
      pageSizeOptions: ['15', '30', '50', '100']
    });
    
    // 显示总数函数 - 与list页面保持一致
    const showTotal = (total, range) => `显示 ${range[0]} 到 ${range[1]}, 共 ${total} 条记录`;
    
    // 表格列定义
    const columns = ref([
      { title: '序号', dataIndex: 'rowIndex', width: 60, align: 'center' },
      { title: '分组字段', dataIndex: 'groupField1', width: 120 },
      { title: '分组字段2', dataIndex: 'groupField2', width: 120 },
      { title: '指标', dataIndex: 'indicatorName', width: 200 },
      { title: '年份', dataIndex: 'year', width: 80, align: 'center' },
      { title: '年季月', dataIndex: 'serialNum', width: 80, align: 'center' },
      { title: '日', dataIndex: 'day', width: 80, align: 'center' },
      { title: '数值', dataIndex: 'value1', width: 100, align: 'right' }
    ]);
  
    /**
     * 显示模态框
     */
    function show(record, gField, modalTitle = '分组数据') {
      visible.value = true;
      currentRecord.value = record;
      groupField.value = gField;
      title.value = modalTitle || '分组数据';
      
      // 重置分页
      pagination.current = 1;
      
      // 加载分组数据
      fetchGroupData();
    }
    
    /**
     * 关闭模态框
     */
    function handleClose() {
      visible.value = false;
      dataSource.value = [];
      currentRecord.value = null;
      pagination.total = 0;
    }
    
    /**
     * 处理页码变化
     */
    function handlePageChange(page, pageSize) {
      pagination.current = page;
      fetchGroupData();
    }
    
    /**
     * 处理每页条数变化
     */
    function handleSizeChange(current, size) {
      pagination.pageSize = size;
      pagination.current = 1; // 切换每页条数后，重置为第一页
      fetchGroupData();
    }
    
    /**
     * 获取分组数据
     */
    async function fetchGroupData() {
      if (!currentRecord.value || !groupField.value) {
        message.error('缺少必要的分组信息');
        return;
      }
      console.log(currentRecord.value)
      loading.value = true;
      try {
        // 构建查询参数
        const params = {
          indicatorId: currentRecord.value.indicatorId,
          year: currentRecord.value.year,
          serialNum: currentRecord.value.serialNum,
          groupField: groupField.value,
          pageNum: pagination.current,
          pageSize: pagination.pageSize
        };
        
        // 调用API获取分组数据
        const res = await indicatorDetailGroupDApi.queryPage(params);
        
        if (res.ok && res.data) {
          // 更新总记录数
          pagination.total = res.data.total || res.data.length;
          
          // 处理返回的数据，添加行索引
          dataSource.value = (res.data.list || res.data).map((item, index) => ({
            ...item,
            rowIndex: (pagination.current - 1) * pagination.pageSize + index + 1,
            key: index
          }));
        } else {
          message.error(res.msg || '获取分组数据失败');
          dataSource.value = [];
          pagination.total = 0;
        }
      } catch (error) {
        console.error('获取分组数据时发生错误:', error);
        message.error('获取分组数据时发生错误');
        dataSource.value = [];
        pagination.total = 0;
      } finally {
        loading.value = false;
      }
    }
    
    /**
     * 处理下钻操作
     */
    function handleDrillDown(record) {
      // 如果需要进一步下钻，可以在这里实现
      message.info(`点击了数值: ${record.value}`);
    }
    
    // 暴露方法给父组件
    defineExpose({
      show
    });
  </script>
  
  <style lang="less" scoped>
    .group-table-container {
      margin-top: 8px;
      margin-bottom: 12px;
      overflow: hidden; /* 隐藏溢出内容 */
    }
    
    .pagination-container {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
    
    .modal-footer {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: flex-end;
    }
    
    :deep(.ant-table-thead > tr > th) {
      background-color: #f0f5ff;
      font-weight: bold;
    }
    
    :deep(.ant-table-tbody > tr > td) {
      padding: 8px;
    }
    
    :deep(.ant-table-cell a) {
      color: #1890ff;
    }
    
    /* 移除表格滚动条 */
    :deep(.ant-table-body) {
      overflow: hidden !important;
    }
    
    :deep(.ant-table-header) {
      overflow: hidden !important;
    }
    
    :deep(.ant-table) {
      overflow: hidden !important;
    }
    
    :deep(.ant-table-container) {
      overflow: hidden !important;
    }
    
    /* 分页样式 - 与list页面保持一致 */
    :deep(.ant-pagination) {
      margin: 8px 0;
    }
    
    :deep(.ant-pagination-item) {
      margin-bottom: 0;
    }
    
    :deep(.ant-pagination-options) {
      margin-left: 8px;
    }
  </style>