<template>
  <a-row :gutter="16">
    <a-col class="indicator-tree-column">
      <IndicatorTree @handleTreeSelect="handleTreeSelect" />
    </a-col>

    <!-- Right Column: Indicator Data (Existing Content) -->
    <a-col class="indicator-data-column">
      <a-card
        size="small"
        :bordered="false"
        :hoverable="true"
        class="fixed-height-card"
        :title="`指标参考/指标值数据 ${selectedIndicatorFromTree ? `- [${selectedIndicatorFromTree.indicatorName}]` : ''}`"
      >
        <!-- Search Form (from original component) -->
        <a-form layout="inline" :model="searchFormState" @finish="handleSearch" class="search-form">
          <a-form-item label="科室" name="department">
            <a-select
              v-model:value="searchFormState.department"
              placeholder="科室"
              size="small"
              style="width: 100px"
              :options="departmentOptions"
              :disabled="!selectedIndicatorFromTree"
              @change="onFrequencyChange"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="年份" name="year">
            <a-date-picker
              v-model:value="searchFormState.year"
              valueFormat="YYYY"
              picker="year"
              size="small"
              style="width: 90px"
              :disabled="!selectedIndicatorFromTree"
              @change="onFrequencyChange"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="月度/季度" name="serialNum">
            <a-select
              v-model:value="searchFormState.serialNum"
              placeholder="月度/季度"
              size="small"
              style="width: 100px"
              :options="serial_numOptions"
              :disabled="!selectedIndicatorFromTree"
              @change="onFrequencyChange"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="类型" name="typeLx">
            <a-select
              v-model:value="searchFormState.typeLx"
              placeholder="类型"
              size="small"
              style="width: 100px"
              :options="type_lxOptions"
              :disabled="!selectedIndicatorFromTree"
              @change="onFrequencyChange"
              allow-clear
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button size="small" type="primary" html-type="submit" :loading="tableLoading" :disabled="!selectedIndicatorFromTree">
                <template #icon><SearchOutlined /></template> 查询
              </a-button>
              <a-button size="small" type="primary" @click="open = !open" :disabled="!selectedIndicatorFromTree">
                <template #icon><PlusOutlined /></template> 添加
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>

        <!-- Data Table -->
        <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="tableLoading"
          :pagination="paginationState"
          @change="handleTableChange"
          size="small"
          bordered
          row-key="id"
          class="fixed-height-table"
          :scroll="{ x: true }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'isqy'">
              <span>{{ record.isqy === 1 ? '启用' : '停用' }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-popconfirm title="确定删除此条数据吗？" @confirm="handleDelete(record.id)">
                  <a-button type="link" danger size="small">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
            <template v-if="column.dataIndex === 'serialNum'">
              <span>
                {{ getLabelByPeriodValue(record.serialNum) }}
              </span>
            </template>
          </template>
        </a-table>
      </a-card>
      <!-- Modal (from original component) -->
      <a-modal v-model:open="open" title="指标参考/指标值数据操作">
        <template #footer>
          <a-button key="back" @click="open = !open">取消</a-button>
          <a-button key="submit" type="primary" @click="save_from" :loading="loading">保存</a-button>
        </template>
        <a-form layout="horizontal" style="margin-top: 20px" :model="formData" :label-col="{ style: { width: '80px' } }">
          <a-row>
            <a-col :span="24">
              <a-form-item label="指标名称" name="indicatorName">
                <a-input v-model:value="indicator_name" :disabled="true" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="科室" name="department">
                <a-select v-model:value="formData.department" placeholder="科室" :options="departmentOptions" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="年份" name="year">
                <a-date-picker v-model:value="formData.year" picker="year" valueFormat="YYYY" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="月度/季度" name="serialNum">
                <a-select v-model:value="formData.serialNum" placeholder="月度/季度" :options="serial_numOptions" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="类型" name="typeLx">
                <a-select v-model:value="formData.typeLx" placeholder="类型" :options="type_lxOptions" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="值" name="value1">
                <a-input v-model:value="formData.value1" placeholder="填写值" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="参数类型" name="typeLxCs">
                <a-select v-model:value="formData.typeLxCs" placeholder="参数类型" :options="type_lx_csOptions" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="趋势/备注" name="trend">
                <a-input v-model:value="formData.trend" placeholder="填写趋势或备注说明" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="是否启用" name="isqy">
                <a-select
                  v-model:value="formData.isqy"
                  placeholder="是否启用"
                  :options="[
                    { label: '启用', value: 1 },
                    { label: '停用', value: 0 },
                  ]"
                  allow-clear
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-modal>
    </a-col>
  </a-row>
</template>

<script setup>
  import { ref, reactive, onMounted, computed, watch } from 'vue';
  import { message, Modal as AntdModal, Popconfirm as APopconfirm } from 'ant-design-vue';
  import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import IndicatorTree from '/@/components/business/indicator/index.vue';
  import { indicatorTargetApi } from '/@/api/business/rating/indicator/target/index';
  import { indicatorDepartmentApi } from "/@/api/business/rating/indicator/department/index";
  import dayjs from 'dayjs';

  // 表格列定义
  const columns = [
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'left',
    },
    {
      title: '科室',
      dataIndex: 'department',
      width: 100,
    },
    {
      title: '年份',
      dataIndex: 'year',
      width: 80,
    },
    {
      title: '月度/季度',
      dataIndex: 'serialNum',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'typeLx',
      width: 100,
      customRender: ({ text }) => {
        const typeMap = { 1: '参考值', 2: '标杆值', 3: '中位值' };
        return typeMap[text] || text;
      },
    },
    {
      title: '值',
      dataIndex: 'value1',
      width: 100,
    },
    {
      title: '值类型',
      dataIndex: 'typeLxCs',
      width: 100,
      customRender: ({ text }) => {
        const typeMap = { 1: '大于', 2: '大于等于', 3: '小于', 4: '小于等于', 5: '等于' };
        return typeMap[text] || text;
      },
    },
    {
      title: '趋势/备注',
      dataIndex: 'trend',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'isqy',
      key: 'isqy',
      width: 80,
    },
    {
      title: '添加者',
      dataIndex: 'createUserName',
      width: 100,
    },
    {
      title: '添加日期',
      dataIndex: 'createTime',
      width: 150,
    },
    {
      title: '更新者',
      dataIndex: 'updateUserName',
      width: 100,
    },
    {
      title: '更新日期',
      dataIndex: 'updateTime',
      width: 150,
    },
  ];

  // 表格数据
  const tableData = ref([]);
  const tableLoading = ref(false);
  const paginationState = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
  });

  // 选项数据
  const departmentOptions = ref([]);
  const serial_numOptions = [
    { label: '1月', value: '01' },
    { label: '2月', value: '02' },
    { label: '3月', value: '03' },
    { label: '4月', value: '04' },
    { label: '5月', value: '05' },
    { label: '6月', value: '06' },
    { label: '7月', value: '07' },
    { label: '8月', value: '08' },
    { label: '9月', value: '09' },
    { label: '10月', value: '10' },
    { label: '11月', value: '11' },
    { label: '12月', value: '12' },
    { label: '第一季度', value: '13' },
    { label: '第二季度', value: '14' },
    { label: '第三季度', value: '15' },
    { label: '第四季度', value: '16' },
    { label: '上半年', value: '17' },
    { label: '下半年', value: '18' },
    { label: '全年', value: '19' },
  ];
  const type_lxOptions = [
    { label: '参考值', value: 1 },
    { label: '标杆值', value: 2 },
    { label: '中位值', value: 3 },
  ];
  const type_lx_csOptions = [
    { label: '大于', value: 1 },
    { label: '大于等于', value: 2 },
    { label: '小于', value: 3 },
    { label: '小于等于', value: 4 },
    { label: '等于', value: 5 },
  ];

  // 根据期间值获取对应的标签文本
  const getLabelByPeriodValue = (value) => {
    if (!value && value !== 0) return '';
    // 将value转为字符串类型处理
    const periodValue = String(value);
    // 查找对应的选项
    const option = serial_numOptions.find((opt) => opt.value === periodValue);

    // 如果找到了对应选项，返回其标签，否则返回空字符串
    return option ? option.label : '';
  };

  // 选中的指标
  const selectedIndicatorFromTree = ref(null);

  // 表单数据
  const indicator_name = ref('');
  const year = dayjs().year().toString(); // 初始化年份为当前年份
  const formData = reactive({
    id: undefined,
    indicatorId: undefined,
    department: undefined,
    year: year,
    serialNum: '19',
    value1: undefined,
    trend: undefined,
    isqy: 1, // 默认启用
    typeLx: 1,
    typeLxCs: 1,
  });
  const loading = ref(false);
  const open = ref(false);

  // 搜索表单数据
  const searchFormState = reactive({
    indicatorId: undefined,
    department: undefined,
    year: year,
    serialNum: '19',
    typeLx: undefined,
  });

  // 初始化加载
  onMounted(async () => {
    await loadDepartments();
  });

  // 加载科室选项
  async function loadDepartments() {
    try {
      const res = await indicatorDepartmentApi.queryDepartment();
      if (res.ok && res.data) {
        departmentOptions.value = res.data.map((item) => ({
          label: item.dataValue,
          value: item.dataLabel,
        }));
      }
    } catch (error) {
      console.error('加载科室选项失败:', error);
      message.error('加载科室选项失败');
    }
  }

  // 处理树选择
  const handleTreeSelect = (obj) => {
    console.log(obj);
    selectedIndicatorFromTree.value = obj;
    searchFormState.indicatorId = obj.id;
    formData.indicatorId = obj.id;
    indicator_name.value = obj.indicatorName + '[' + obj.indicatorCode + ']';
    handleSearch();
  };

  // 处理频率变更
  const onFrequencyChange = () => {
    // 可以在这里添加额外的逻辑，如果需要的话
  };

  // 处理搜索
  const handleSearch = () => {
    paginationState.current = 1;
    fetchData();
  };

  // 获取数据
  const fetchData = async () => {
    if (!selectedIndicatorFromTree.value) {
      message.warning('请先选择一个指标');
      return;
    }

    tableLoading.value = true;
    try {
      const params = {
        pageNum: paginationState.current,
        pageSize: paginationState.pageSize,
        indicatorId: searchFormState.indicatorId,
        department: searchFormState.department,
        year: searchFormState.year,
        serialNum: searchFormState.serialNum,
        typeLx: searchFormState.typeLx,
      };

      const res = await indicatorTargetApi.queryPage(params);
      if (res.ok) {
        tableData.value = res.data.list || [];
        paginationState.total = res.data.total || 0;
      } else {
        message.error(res.msg || '获取数据失败');
        tableData.value = [];
        paginationState.total = 0;
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败');
      tableData.value = [];
      paginationState.total = 0;
    } finally {
      tableLoading.value = false;
    }
  };

  // 处理表格分页、排序、筛选变化
  function handleTableChange(pagination, filters, sorter) {
    paginationState.current = pagination.current;
    paginationState.pageSize = pagination.pageSize;
    fetchData();
  }

  // 处理编辑
  function handleEdit(record) {
    formData.id = record.id;
    formData.indicatorId = record.indicatorId;
    formData.department = record.department;
    formData.year = record.year;
    formData.serialNum = record.serialNum;
    formData.value1 = record.value1;
    formData.trend = record.trend;
    formData.isqy = record.isqy;
    formData.typeLx = record.typeLx;
    formData.typeLxCs = record.typeLxCs;

    open.value = true;
  }

  // 处理删除
  async function handleDelete(id) {
    try {
      const res = await indicatorTargetApi.delete(id);
      if (res.ok) {
        message.success('删除成功');
        fetchData();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (error) {
      console.error('删除数据失败:', error);
      message.error('删除数据失败');
    }
  }

  // 保存表单
  const save_from = () => {
    console.log(formData);
    formData.id ? update() : add();
  };

  // 添加数据
  async function add() {
    try {
      loading.value = true;
      const res = await indicatorTargetApi.add(formData);
      if (res.ok) {
        message.success('添加成功');
        open.value = false;
        fetchData();
      } else {
        message.error(res.msg || '添加失败');
      }
    } catch (error) {
      console.error('添加数据失败:', error);
      message.error('添加数据时发生错误');
    } finally {
      loading.value = false;
    }
  }

  // 更新数据
  async function update() {
    try {
      loading.value = true;
      const res = await indicatorTargetApi.update(formData);
      if (res.ok) {
        message.success('更新成功');
        open.value = false;
        fetchData();
      } else {
        message.error(res.msg || '更新失败');
      }
    } catch (error) {
      console.error('更新数据失败:', error);
      message.error('更新数据时发生错误');
    } finally {
      loading.value = false;
    }
  }
</script>

<style lang="less" scoped>
  .indicator-tree-column {
    width: 30%;
  }

  .indicator-data-column {
    flex: 1;
    width: 70%;
  }

  .fixed-height-card {
    //height: calc(100vh - 130px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .search-form {
    margin-bottom: 16px;
  }

  .fixed-height-table {
    height: calc(100% - 120px); // 减去表单和按钮高度
    display: flex;
    flex-direction: column;

    :deep(.ant-table) {
      flex: 1;
    }

    :deep(.ant-table-container) {
      height: auto !important;
    }

    :deep(.ant-table-body) {
      overflow-y: visible !important; // 不显示垂直滚动条
      overflow-x: auto !important; // 允许水平滚动
    }

    :deep(.ant-table-pagination) {
      margin: 8px 0;
      position: static !important;
      visibility: visible !important;
    }
  }

  .tree-container {
    height: 100%;
    overflow: auto !important; // 强制禁止溢出滚动
  }

  .tree-node-code {
    margin-left: 8px;
    font-size: 12px;
    color: #999;
  }

  :deep(.highlight-text) {
    background-color: yellow;
    font-weight: bold;
  }

  // 选中树节点样式
  :deep(.ant-tree-node-selected) {
    background-color: #e6f7ff;
  }

  // 基本表单样式
  .search-form {
    :deep(.ant-form-item) {
      margin-bottom: 8px;
      margin-right: 8px !important;
    }
  }
</style>
