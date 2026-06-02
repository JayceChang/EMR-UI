<!--
  * 指标明细分组数据
  *
  * @Author:    
  * @Date:      2025-05-18 15:30:00
  * @Copyright  ZDS
-->
<template>
  <a-modal :title="title" :visible="visible" :width="900" @cancel="handleClose" :footer="null" :destroyOnClose="true" :maskClosable="false">
    <a-spin :spinning="loading">
      <div class="group-table-container">
        <a-table :columns="columns" :data-source="dataSource" size="small" :pagination="false" :scroll="{ x: false }" bordered>
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'value1' || column.dataIndex === 'value2'">
              <a-button type="link" @click="handleDrillDown(record, column)">{{ text }}</a-button>
            </template>
            <template v-if="column.dataIndex === 'serialNum'">
              <span>
                {{ getLabelByPeriodValue(record.serialNum) }}
              </span>
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
  import { ref, reactive, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { indicatorDetailGroupApi } from '/@/api/business/rating/indicator/detail/indicator-detail-group-api';

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
  // 值类型：1表示value1，2表示value2
  const valueType = ref(1);

  // 分页配置 - 与list页面保持一致
  const pagination = reactive({
    current: 1,
    pageSize: 15,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['15', '30', '50', '100'],
  });

  // 显示总数函数 - 与list页面保持一致
  const showTotal = (total, range) => `显示 ${range[0]} 到 ${range[1]}, 共 ${total} 条记录`;

  // 根据值类型动态计算表格列
  const columns = computed(() => {
    const baseColumns = [
      { title: '序号', dataIndex: 'rowIndex', width: 60, align: 'center' },
      { title: '指标', dataIndex: 'indicatorName', width: 200 },
      { title: '年份', dataIndex: 'year', width: 80, align: 'center' },
      { title: '年季月', dataIndex: 'serialNum', width: 80, align: 'center' },
    ];

    // 根据值类型添加不同的列
    if (valueType.value === 0) {
      // 显示所有数据
      return [
        ...baseColumns,
        { title: '分组字段', dataIndex: 'groupField1', width: 120 },
        { title: '参考值', dataIndex: 'refValue', width: 100, align: 'right' },
        { title: '标杆值', dataIndex: 'benchValue', width: 100, align: 'right' },
        { title: '中位值', dataIndex: 'midValue', width: 100, align: 'right' },
        { title: '数值1', dataIndex: 'value1', width: 100, align: 'right' },
        { title: '数值2', dataIndex: 'value2', width: 100, align: 'right' },
        { title: '数值3', dataIndex: 'value3', width: 100, align: 'right' },
      ];
    } else if (valueType.value === 1) {
      return [
        ...baseColumns,
        { title: '分组字段', dataIndex: 'groupField1', width: 120 },
        { title: '数值1', dataIndex: 'value1', width: 100, align: 'right' },
      ];
    } else {
      return [
        ...baseColumns,
        { title: '分组字段', dataIndex: 'groupField1', width: 120 },
        { title: '数值2', dataIndex: 'value2', width: 100, align: 'right' },
      ];
    }
  });

  const periodOptions = ref([
    // 月份选项
    { label: '1月份', value: 1 },
    { label: '2月份', value: 2 },
    { label: '3月份', value: 3 },
    { label: '4月份', value: 4 },
    { label: '5月份', value: 5 },
    { label: '6月份', value: 6 },
    { label: '7月份', value: 7 },
    { label: '8月份', value: 8 },
    { label: '9月份', value: 9 },
    { label: '10月份', value: 10 },
    { label: '11月份', value: 11 },
    { label: '12月份', value: 12 },
    // 季度选项
    { label: '第一季度', value: 13 },
    { label: '第二季度', value: 14 },
    { label: '第三季度', value: 15 },
    { label: '第四季度', value: 16 },
    // 半年和全年选项
    { label: '上半年', value: 17 },
    { label: '下半年', value: 18 },
    { label: '全年', value: 19 },
  ]);

  const getLabelByPeriodValue = (value) => {
    if (!value && value !== 0) return '';

    // 将value转为数字类型处理
    const periodValue = Number(value);

    // 查找对应的选项
    const option = periodOptions.value.find((opt) => opt.value === periodValue);

    // 如果找到了对应选项，返回其标签，否则返回空字符串
    return option ? option.label : '';
  };

  /**
   * 显示模态框
   */
  function show(record, gField, modalTitle = '分组数据', vType = 1) {
    visible.value = true;
    currentRecord.value = record;
    groupField.value = gField;
    title.value = modalTitle || '分组数据';
    valueType.value = vType; // 设置值类型

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
    console.log(currentRecord.value);
    loading.value = true;
    try {
      // 构建查询参数
      const params = {
        indicatorId: currentRecord.value.indicatorId,
        year: currentRecord.value.year,
        serialNum: currentRecord.value.serialNum,
        groupField: groupField.value,
        valueType: valueType.value, // 添加值类型参数
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      };

      // 调用API获取分组数据
      const res = await indicatorDetailGroupApi.queryPage(params);

      if (res.ok && res.data) {
        // 更新总记录数
        pagination.total = res.data.total || res.data.length;

        // 处理返回的数据，添加行索引
        dataSource.value = (res.data.list || res.data).map((item, index) => ({
          ...item,
          rowIndex: (pagination.current - 1) * pagination.pageSize + index + 1,
          key: index,
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
  function handleDrillDown(record, column) {
    let reportUrl;
    if (column.dataIndex == 'value1') {
      reportUrl = record.reportUrl1;
    } else if (column.dataIndex == 'value2') {
      reportUrl = record.reportUrl2;
    }
    const datartParam = record.datartParam;
    console.log("datart params:",JSON.stringify(datartParam))
    const params = {
      BDATE: datartParam.bdate, //开始时间
      EDATE: datartParam.edate, //结束时间
      SERIAL_NUM: datartParam.serialNum, //月季年期间值
      USER: datartParam.user, //当前用户
      GROUP_NAME: datartParam.groupName, //分组名称
      INDICATOR_CODE: datartParam.indicatorCode, //指标编码
      YEAR: datartParam.year, //年份
      SUBSQL: datartParam.subSql, //报表sql条件
    };
    reportUrl = reportUrl + '&params=' + encodeURIComponent(JSON.stringify(params));
    console.log(reportUrl);
    window.open(reportUrl);
  }

  // 暴露方法给父组件
  defineExpose({
    show,
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
