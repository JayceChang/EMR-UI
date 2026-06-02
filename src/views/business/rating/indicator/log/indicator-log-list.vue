<template>
  <div class="indicator-log-container">
    <!-- 搜索区域 -->
    <template v-if="searchFormVisible">
      <div class="search-container">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="操作类型:">
            <a-select v-model:value="searchForm.operateType" style="width: 150px">
              <a-select-option :value="undefined">全部操作</a-select-option>
              <a-select-option :value="1">新增</a-select-option>
              <a-select-option :value="2">修改</a-select-option>
              <a-select-option :value="3">删除</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="指标名称:">
            <a-input v-model:value="searchForm.indicatorName" placeholder="请输入指标名称" />
          </a-form-item>
          <a-form-item label="指标编码:">
            <a-input v-model:value="searchForm.indicatorCode" placeholder="请输入指标编码" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">
              <template #icon><SearchOutlined /></template>
              查询
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </template>

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
    >
      <!-- 序号列 -->
      <template #bodyCell="{ column, index, record }">
        <template v-if="column.dataIndex === 'index'">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>

        <!-- 操作类型列 -->
        <template v-if="column.dataIndex === 'operateType'">
          <a-tag :color="getOperateTypeColor(record.operateType)">
            {{ getOperateTypeText(record.operateType) }}
          </a-tag>
        </template>

        <!-- 操作内容列 -->
        <template v-if="column.dataIndex === 'operateContent'">
          <div>{{ getOperateContent(record) }}</div>
        </template>

        <!-- 操作列 -->
        <template v-if="column.dataIndex === 'action'">
          <a @click="showDetail(record)">查看详情</a>
        </template>
      </template>
    </a-table>

    <!-- 详情弹窗 -->
    <a-modal v-model:visible="detailVisible" title="变更详情" width="800px" :footer="null">
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="指标名称" :span="2">{{ currentRecord?.indicatorName }}</a-descriptions-item>
        <a-descriptions-item label="操作类型">
          <a-tag :color="getOperateTypeColor(currentRecord?.operateType)">
            {{ getOperateTypeText(currentRecord?.operateType) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="操作时间">{{ currentRecord?.operateDate }}</a-descriptions-item>
        <a-descriptions-item label="操作人">{{ currentRecord?.operatorName }}</a-descriptions-item>
        <a-descriptions-item label="操作IP">{{ currentRecord?.operateIp }}</a-descriptions-item>

        <a-descriptions-item label="变更前" :span="1">
          <a-descriptions bordered size="small" :column="1">
            <a-descriptions-item label="年份">
              <span :class="{ 'changed-field': isFieldChanged('year') }">{{ currentRecord?.indicatorOldYear }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="期间">
              <span :class="{ 'changed-field': isFieldChanged('serialNum') }">{{ getLabelByPeriodValue(currentRecord?.indicatorOldSerialNum) }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="数值1">
              <span :class="{ 'changed-field': isFieldChanged('value1') }">{{ currentRecord?.indicatorOldValue1 }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="数值2">
              <span :class="{ 'changed-field': isFieldChanged('value2') }">{{ currentRecord?.indicatorOldValue2 }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="数值3">
              <span :class="{ 'changed-field': isFieldChanged('value3') }">{{ currentRecord?.indicatorOldValue3 }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="是否覆盖">
              <span :class="{ 'changed-field': isFieldChanged('whetherCover') }">
                {{ currentRecord?.indicatorOldWhetherCover === 1 ? '是' : currentRecord?.indicatorOldWhetherCover === 0 ? '否' : '' }}
              </span>
            </a-descriptions-item>
          </a-descriptions>
        </a-descriptions-item>

        <a-descriptions-item label="变更后" :span="1">
          <a-descriptions bordered size="small" :column="1">
            <a-descriptions-item label="年份">
              <span :class="{ 'changed-field': isFieldChanged('year') }">{{ currentRecord?.indicatorNewYear }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="期间">
              <span :class="{ 'changed-field': isFieldChanged('serialNum') }">{{ getLabelByPeriodValue(currentRecord?.indicatorNewSerialNum) }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="数值1">
              <span :class="{ 'changed-field': isFieldChanged('value1') }">{{ currentRecord?.indicatorNewValue1 }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="数值2">
              <span :class="{ 'changed-field': isFieldChanged('value2') }">{{ currentRecord?.indicatorNewValue2 }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="数值3">
              <span :class="{ 'changed-field': isFieldChanged('value3') }">{{ currentRecord?.indicatorNewValue3 }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="是否覆盖">
              <span :class="{ 'changed-field': isFieldChanged('whetherCover') }">
                {{ currentRecord?.indicatorNewWhetherCover === 1 ? '是' : currentRecord?.indicatorNewWhetherCover === 0 ? '否' : '' }}
              </span>
            </a-descriptions-item>
          </a-descriptions>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, nextTick } from 'vue';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  import { indicatorLogApi } from '/@/api/business/rating/indicator/log/indicator-log-api';

  //表格搜索区域
  const searchFormVisible = ref(true);

  // 表格列定义
  const columns = [
    { title: '序号', dataIndex: 'index', width: 60, align: 'center' },
    { title: '操作类型', dataIndex: 'operateType', width: 100, align: 'center' },
    { title: '指标名称', dataIndex: 'indicatorName', width: 200 },
    { title: '指标编码', dataIndex: 'indicatorCode', width: 200 },
    { title: '操作内容', dataIndex: 'operateContent', ellipsis: true },
    { title: '操作人', dataIndex: 'operatorName', width: 100, align: 'center' },
    { title: '操作时间', dataIndex: 'operateDate', width: 150, align: 'center' },
    { title: '操作IP', dataIndex: 'operateIp', width: 120, align: 'center' },
    { title: '操作', dataIndex: 'action', width: 80, align: 'center' },
  ];

  // 搜索表单
  const searchForm = reactive({
    indicatorDetailId: undefined,
    operateType: undefined,
    indicatorName: '',
    indicatorCode: '',
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

  // 详情弹窗
  const detailVisible = ref(false);
  const currentRecord = ref(null);

  // 是否已通过show方法初始化
  const isInitializedByShow = ref(false);
  // 是否已经执行过查询
  const hasExecutedQuery = ref(false);

  // 初始化加载数据
  onMounted(() => {
    // 延迟执行，给父组件调用show方法的机会
    nextTick(() => {
      // 只有当没有执行过查询，且不是通过show方法初始化时，才在onMounted中调用fetchData
      if (!hasExecutedQuery.value && !isInitializedByShow.value && !searchForm.indicatorDetailId) {
        fetchData();
      }
    });
  });

  //年季月
  const defaultPeriodOptions = ref([
    // 月份选项
    { label: '1月份', value: '01' },
    { label: '2月份', value: '02' },
    { label: '3月份', value: '03' },
    { label: '4月份', value: '04' },
    { label: '5月份', value: '05' },
    { label: '6月份', value: '06' },
    { label: '7月份', value: '07' },
    { label: '8月份', value: '08' },
    { label: '9月份', value: '09' },
    { label: '10月份', value: '10' },
    { label: '11月份', value: '11' },
    { label: '12月份', value: '12' },
    // 季度选项
    { label: '第一季度', value: '13' },
    { label: '第二季度', value: '14' },
    { label: '第三季度', value: '15' },
    { label: '第四季度', value: '16' },
    // 半年和全年选项
    { label: '上半年', value: '17' },
    { label: '下半年', value: '18' },
    { label: '全年', value: '19' },
  ]);

  function getLabelByPeriodValue(value) {
    if (!value && value !== 0) return '';

    // 查找对应的选项
    const option = defaultPeriodOptions.value.find((opt) => opt.value === value);

    // 如果找到了对应选项，返回其标签，否则返回原值
    return option ? option.label : value;
  }

  // 获取数据
  async function fetchData() {
    // 标记已执行过查询
    hasExecutedQuery.value = true;
    
    loading.value = true;
    try {
      const params = {
        ...searchForm,
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      };

      const res = await indicatorLogApi.queryPage(params);
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

  // 显示详情
  function showDetail(record) {
    currentRecord.value = record;
    detailVisible.value = true;
  }

  // 获取操作类型文本
  function getOperateTypeText(type) {
    const typeMap = {
      1: '新增',
      2: '修改',
      3: '删除',
    };
    return typeMap[type] || '未知';
  }

  // 获取操作类型颜色
  function getOperateTypeColor(type) {
    const colorMap = {
      1: 'green',
      2: 'blue',
      3: 'red',
    };
    return colorMap[type] || 'default';
  }

  // 获取操作内容描述
  function getOperateContent(record) {
    if (record.operateType === 1) {
      return `新增指标数据`;
    } else if (record.operateType === 2) {
      return `修改指标数据`;
    } else if (record.operateType === 3) {
      return `删除指标数据`;
    }
    return '未知操作';
  }

  // 检查字段是否发生变更
  function isFieldChanged(fieldName) {
    if (!currentRecord.value) return false;

    switch (fieldName) {
      case 'year':
        return currentRecord.value.indicatorOldYear !== currentRecord.value.indicatorNewYear;
      case 'serialNum':
        return currentRecord.value.indicatorOldSerialNum !== currentRecord.value.indicatorNewSerialNum;
      case 'value1':
        return currentRecord.value.indicatorOldValue1 !== currentRecord.value.indicatorNewValue1;
      case 'value2':
        return currentRecord.value.indicatorOldValue2 !== currentRecord.value.indicatorNewValue2;
      case 'value3':
        return currentRecord.value.indicatorOldValue3 !== currentRecord.value.indicatorNewValue3;
      case 'whetherCover':
        return currentRecord.value.indicatorOldWhetherCover !== currentRecord.value.indicatorNewWhetherCover;
      default:
        return false;
    }
  }
  
  //根据指标明细ID查询
  function show(value) {
    // 标记为通过show方法初始化
    isInitializedByShow.value = true;
    
    if (searchFormVisible.value) {
      searchFormVisible.value = false;
    }
    
    // 设置查询参数
    searchForm.indicatorDetailId = value;
    
    // 重置分页
    pagination.current = 1;
    
    // 执行查询
    handleSearch();
  }
  
  //暴露show方法
  defineExpose({
    show,
  });
</script>

<style scoped>
  .indicator-log-container {
    padding: 16px;
    background-color: #fff;
  }

  .search-container {
    margin-bottom: 16px;
    padding: 16px;
    background-color: #fafafa;
    border-radius: 4px;
  }

  .changed-field {
    color: #f5222d;
    font-weight: bold;
    background-color: #fff1f0;
    padding: 0 4px;
    border-radius: 2px;
  }
</style>


