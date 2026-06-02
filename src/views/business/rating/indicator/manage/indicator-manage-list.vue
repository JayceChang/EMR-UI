<!--
  * 数据源配置
  *
  * @Author:    Jayce
  * @Date:      2025-04-25 16:04:20
  * @Copyright  ZDS
-->
<template>
  <div class="indicator-manage-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-form-item label="指标编码">
            <a-input v-model:value="searchForm.indicatorCode" placeholder="请输入指标编码" allow-clear @pressEnter="handleSearch" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="指标名称">
            <a-input v-model:value="searchForm.indicatorName" placeholder="请输入指标名称" allow-clear @pressEnter="handleSearch" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="数据类型">
            <SmartEnumSelect
              width="100%"
              v-model:value="searchForm.indicatorDataType"
              enum-name="INDICATOR_DATA_TYPE_ENUM"
              placeholder="请选择指标数据类型"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="采集方式" name="indicatorFetchType">
            <SmartEnumSelect
              width="100%"
              v-model:value="searchForm.indicatorFetchType"
              enum-name="INDICATOR_FETCH_TYPE_ENUM"
              placeholder="请选择指标采集方式"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="6">
          <a-form-item label="启用状态">
            <a-select v-model:value="searchForm.disabledFlag" placeholder="启用状态" allow-clear style="width: 100%">
              <a-select-option value="1">启用</a-select-option>
              <a-select-option value="2">禁用</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="开展状态">
            <a-select v-model:value="searchForm.developmentStatus" placeholder="开展状态" allow-clear style="width: 100%">
              <a-select-option value="1">已开展</a-select-option>
              <a-select-option value="2">未开展</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="判定指标">
            <a-select v-model:value="searchForm.judgeFlag" placeholder="是否判定指标" allow-clear style="width: 100%">
              <a-select-option value="1">是</a-select-option>
              <a-select-option value="0">否</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><SearchOutlined /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><ReloadOutlined /></template>
              重置
            </a-button>
            <a-button type="primary" @click="handleAddNew()">
              <template #icon><PlusOutlined /></template>
              添加
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <!---------- 数据表格 begin ----------->
    <div class="table-container">
      <a-spin :spinning="loading">
        <a-table
          :dataSource="tableData"
          :columns="columns"
          rowKey="id"
          size="big"
          :pagination="pagination"
          :rowClassName="setRowClassName"
          :customRow="handleTableRow"
          @change="handleTableChange"
          :scroll="{ y: 430 }"
        >
          <!-- 自定义列渲染 -->
          <template #bodyCell="{ text, record, column }">
            <!-- 指标编码 -->
            <template v-if="column.dataIndex === 'indicatorCode'">
              <span>{{ text }}</span>
            </template>
            <!-- 指标名称 -->
            <template v-else-if="column.dataIndex === 'indicatorName'">
              <span>{{ text }}</span>
            </template>
            <!-- 数据类型 -->
            <template v-else-if="column.dataIndex === 'indicatorDataType'">
              {{ $smartEnumPlugin.getDescByValue('INDICATOR_DATA_TYPE_ENUM', record.indicatorDataType) }}
            </template>
            <!-- 采集方式 -->
            <template v-else-if="column.dataIndex === 'indicatorFetchType'">
              {{ $smartEnumPlugin.getDescByValue('INDICATOR_FETCH_TYPE_ENUM', record.indicatorFetchType) }}
            </template>
            <!-- 单位 -->
            <template v-else-if="column.dataIndex === 'measurementUnit'">
              {{ $smartEnumPlugin.getDescByValue('INDICATOR_UNIT_ENUM', record.measurementUnit) }}
            </template>
            <!-- 定义说明 -->
            <template v-else-if="column.dataIndex === 'indicatorDefinition'">
              <a-tooltip placement="topLeft" :overlayStyle="{ maxWidth: '600px', whiteSpace: 'pre-wrap' }">
                <template #title>
                  <span :title="text">{{ text }}</span>
                </template>
                <span>{{ text }}</span>
              </a-tooltip>
            </template>
            <!-- 启用状态 -->
            <template v-else-if="column.dataIndex === 'disabledFlag'">
              {{ $smartEnumPlugin.getDescByValue('ENABLE_TYPE_ENUM', record.disabledFlag) }}
            </template>
            <!-- 评分指标 -->
            <template v-else-if="column.dataIndex === 'judgeFlag'">
              {{ $smartEnumPlugin.getDescByValue('FLAG_NUMBER_ENUM', record.judgeFlag) }}
            </template>
            <!-- 判定规则 -->
            <template v-else-if="column.dataIndex === 'judgeRule'">
              {{ $smartEnumPlugin.getDescByValue('JUDGMENT_RULE_ENUM', record.judgeRule) }}
            </template>
            <!-- 是否开展/填报 -->
            <template v-else-if="column.dataIndex === 'developmentStatus'">
              {{ $smartEnumPlugin.getDescByValue('DEPLOYMENT_STATUS_TYPE_ENUM', record.developmentStatus) }}
            </template>
            <!-- 操作列 -->
            <template v-else-if="column.dataIndex === 'action'">
              <div>
                <a-button @click.stop="handleEdit(record)" type="link" size="small">
                  <template #icon><FormOutlined /></template>
                  编辑
                </a-button>
                <a-button @click.stop="onDelete(record)" danger type="link" size="small">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </div>
            </template>
          </template>
        </a-table>
      </a-spin>
    </div>
  </div>

  <!---------- 数据表格 end ----------->

  <!-- 指标管理 Drawer -->
  <a-drawer
    v-model:open="drawerVisible"
    :title="drawerTitle"
    :width="900"
    placement="right"
    :closable="true"
    :maskClosable="false"
    @close="handleDrawerClose"
  >
    <a-tabs v-model:activeKey="activeTabKey" type="card" size="large" class="tabs" animated>
      <a-tab-pane key="basic">
        <template #tab>
          <span>
            <InfoCircleOutlined />
            基本信息
          </span>
        </template>
        <IndicatorFormInline
          :indicator-id="currentIndicatorId"
          @dataLoaded="handleDataLoaded"
          @dataChanged="handleDataChanged"
          @validationChanged="handleValidationChanged"
          ref="indicatorFormRef"
        />
      </a-tab-pane>

      <a-tab-pane key="interpretation">
        <template #tab>
          <span>
            <BookOutlined />
            指标解读
          </span>
        </template>
        <IndicatorFormExplain
          :indicator-id="currentIndicatorId"
          @dataLoaded="handleDataLoaded"
          @dataChanged="handleDataChanged"
          @validationChanged="handleValidationChanged"
          ref="interpretationFormRef"
        />
      </a-tab-pane>

      <a-tab-pane key="dataConfig">
        <template #tab>
          <span>
            <SettingOutlined />
            取数配置
          </span>
        </template>
        <IndicatorConfigInline
          :indicator-id="currentIndicatorId"
          @dataLoaded="handleDataLoaded"
          @dataChanged="handleDataChanged"
          @validationChanged="handleValidationChanged"
          ref="configFormRef"
        />
      </a-tab-pane>

      <a-tab-pane key="indicatorValue">
        <template #tab>
          <span>
            <AimOutlined />
            指标值
          </span>
        </template>
        <IndicatorTargetTableTab :indicator-id="currentIndicatorId" ref="indicatorTargetRef" />
      </a-tab-pane>

      <a-tab-pane key="dataReportConfig">
        <template #tab>
          <span>
            <CalendarOutlined />
            填报规则
          </span>
        </template>
        <IndicatorReportRule
          :indicator-id="currentIndicatorId"
          @dataLoaded="handleDataLoaded"
          @dataChanged="handleDataChanged"
          @validationChanged="handleValidationChanged"
          ref="reportRuleFormRef"
        />
      </a-tab-pane>

      <a-tab-pane key="complianceConfig">
        <template #tab>
          <span>
            <ToolOutlined />
            自评配置
          </span>
        </template>
        <IndicatorAssessmentConfig
          :indicator-id="currentIndicatorId"
          @dataLoaded="handleDataLoaded"
          @dataChanged="handleDataChanged"
          @validationChanged="handleValidationChanged"
          ref="assessmentConfigFormRef"
        />
      </a-tab-pane>
    </a-tabs>

    <!-- Drawer 底部操作区域 -->
    <template #footer>
      <div class="drawer-footer">
        <a-space>
          <a-button
            v-for="button in currentTabButtons"
            :key="button.key"
            :type="button.type"
            :loading="getButtonLoading(button)"
            @click="handleButtonClick(button.action)"
          >
            {{ button.text }}
            <template #icon>
              <component :is="button.icon" />
            </template>
          </a-button>
        </a-space>
      </div>
    </template>
  </a-drawer>
</template>

<script setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
  import { indicatorExtraConfigApi } from '/@/api/business/rating/indicator/manage/indicator-extra-config-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import SmartEnumSelect from '/@/components/framework/smart-enum-select/index.vue';
  import IndicatorFormInline from '../manage/indicator-manage-form-inline.vue';
  import IndicatorFormExplain from '../manage/indicator-manage-form-explain.vue';
  import IndicatorConfigInline from '../manage/indicator-manage-config-inline.vue';
  import IndicatorTargetTableTab from '../target/indicator-target-table-tab.vue';
  import IndicatorReportRule from '../manage/indicator-manage-report-rule.vue';
  import IndicatorAssessmentConfig from '../manage/indicator-manage-assessment-config-inline.vue';

  import {
    SearchOutlined,
    PlusOutlined,
    DeleteOutlined,
    FormOutlined,
    InfoCircleOutlined,
    BookOutlined,
    SettingOutlined,
    AimOutlined,
    CalendarOutlined,
    ToolOutlined,
    ReloadOutlined,
    SaveOutlined,
    CloseOutlined,
    ExperimentOutlined,
  } from '@ant-design/icons-vue';

  // ---------------------------- State ----------------------------
  const selectedIndicator = ref(null);
  const loading = ref(false);
  const tableData = ref([]);
  const selectedRowKeyList = ref([]);

  // Drawer 相关状态
  const drawerVisible = ref(false);
  const activeTabKey = ref('basic');
  const drawerMode = ref('add'); // 'add' 或 'edit'
  const drawerTitle = ref('指标管理');

  // 新的状态管理 - 只管理 indicatorId
  const currentIndicatorId = ref(null);

  // 指标表单相关状态
  const indicatorFormRef = ref();
  const interpretationFormRef = ref();
  const configFormRef = ref();
  const indicatorTargetRef = ref();
  const reportRuleFormRef = ref();
  const testReportRuleRef = ref();
  const assessmentConfigFormRef = ref();

  // 保留旧的状态以兼容其他功能
  const indicatorData = ref({});
  const configData = reactive({});
  const indicatorFormValid = ref(true);

  // 各种loading状态
  const testLoading = ref(false);
  const configLoading = ref(false);

  // 定义简单按钮
  const simpleBtns = [
    { key: 'cancel', text: '取消', type: 'default', action: 'cancel', icon: CloseOutlined },
    { key: 'save', text: '保存', type: 'primary', action: 'save', loading: 'loading', icon: SaveOutlined },
  ];

  // Tab按钮配置
  const tabButtonConfigs = {
    basic: simpleBtns,
    interpretation: simpleBtns,
    dataConfig: [
      { key: 'cancel', text: '取消', type: 'default', action: 'cancel', icon: CloseOutlined },
      { key: 'test', text: '测试取数', type: 'default', action: 'test', loading: 'testLoading', icon: ExperimentOutlined },
      { key: 'manual', text: '手动取数', type: 'default', action: 'manual', icon: ToolOutlined },
      { key: 'save', text: '保存', type: 'primary', action: 'save', loading: 'configLoading', icon: SaveOutlined },
    ],
    indicatorValue: [
      { key: 'cancel', text: '取消', type: 'default', action: 'cancel', icon: CloseOutlined },
      { key: 'refresh', text: '刷新数据', type: 'primary', action: 'refresh', loading: 'refreshLoading', icon: ReloadOutlined },
    ],
    dataReportConfig: simpleBtns,
    complianceConfig: simpleBtns,
    testReportRule: simpleBtns,
  };

  // 计算当前tab的按钮配置
  const currentTabButtons = computed(() => {
    return tabButtonConfigs[activeTabKey.value] || tabButtonConfigs.basic;
  });

  // 获取按钮的loading状态
  const getButtonLoading = (button) => {
    if (!button.loading) return false;

    switch (button.loading) {
      case 'loading':
        return loading.value;
      case 'testLoading':
        return testLoading.value;
      case 'configLoading':
        return configLoading.value;
      default:
        return false;
    }
  };

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 15,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: ['10', '15', '20', '25', '100'],
  });

  // 搜索表单
  const searchForm = reactive({
    indicatorCode: '',
    indicatorName: '',
    indicatorDataType: '',
    indicatorFetchType: '',
    disabledFlag: '',
    developmentStatus: '',
    judgeFlag: '',
  });

  // ---------------------------- Columns Definition ----------------------------
  const columns = ref([
    {
      title: '指标编码',
      dataIndex: 'indicatorCode',
      key: 'indicatorCode',
      width: 100,
      ellipsis: true,
    },
    {
      title: '指标名称',
      dataIndex: 'indicatorName',
      key: 'indicatorName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '数据类型',
      dataIndex: 'indicatorDataType',
      key: 'indicatorDataType',
      width: 100,
      align: 'center',
    },
    {
      title: '采集方式',
      dataIndex: 'indicatorFetchType',
      key: 'indicatorFetchType',
      width: 120,
      align: 'center',
    },
    {
      title: '单位',
      dataIndex: 'measurementUnit',
      key: 'measurementUnit',
      width: 80,
      align: 'center',
    },
    {
      title: '定义说明',
      dataIndex: 'indicatorDefinition',
      key: 'indicatorDefinition',
      width: 100,
      ellipsis: true,
    },
    {
      title: '启用状态',
      dataIndex: 'disabledFlag',
      key: 'disabledFlag',
      width: 100,
      align: 'center',
    },
    {
      title: '判定指标',
      dataIndex: 'judgeFlag',
      key: 'judgeFlag',
      width: 100,
      align: 'center',
    },
    {
      title: '判定规则',
      dataIndex: 'judgeRule',
      key: 'judgeRule',
      width: 100,
      ellipsis: true,
    },
    {
      title: '开展状态',
      dataIndex: 'developmentStatus',
      key: 'developmentStatus',
      width: 100,
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      align: 'center',
      fixed: 'center',
    },
  ]);

  // ---------------------------- Pagination & Search Logic ----------------------------

  // 分页变化处理
  const handleTableChange = (pag) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    queryData();
  };

  // 搜索处理
  const handleSearch = () => {
    pagination.current = 1; // 重置到第一页
    queryData();
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.indicatorCode = '';
    searchForm.indicatorName = '';
    searchForm.indicatorDataType = '';
    searchForm.indicatorFetchType = '';
    searchForm.disabledFlag = '';
    searchForm.developmentStatus = '';
    searchForm.judgeFlag = '';
    pagination.current = 1;
    queryData();
  };

  // ---------------------------- Methods ----------------------------

  function setRowClassName(record) {
    return record.id === selectedIndicator.value?.id ? 'table-row-selected' : '';
  }

  function handleTableRow(record) {
    return {
      onClick: () => {
        // 选中当前行
        if (selectedIndicator.value?.id !== record.id) {
          selectedIndicator.value = record;
        }
      },
      onDblclick: () => {
        // 双击编辑
        handleEdit(record);
      },
    };
  }

  async function queryData() {
    loading.value = true;
    try {
      const params = {
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        indicatorCode: searchForm.indicatorCode || undefined,
        indicatorName: searchForm.indicatorName || undefined,
        indicatorDataType: searchForm.indicatorDataType || undefined,
        indicatorFetchType: searchForm.indicatorFetchType || undefined,
        disabledFlag: searchForm.disabledFlag || undefined,
        developmentStatus: searchForm.developmentStatus || undefined,
        judgeFlag: searchForm.judgeFlag || undefined,
      };

      let queryResult = await indicatorManageApi.queryPage(params);
      if (queryResult.ok && queryResult.data) {
        tableData.value = queryResult.data.list || [];
        pagination.total = queryResult.data.total || 0;
      } else {
        tableData.value = [];
        pagination.total = 0;
      }
    } catch (e) {
      smartSentry.captureError(e);
      tableData.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  }

  onMounted(queryData);

  // 处理新增指标 - 重构后的简化版本
  function handleAddNew() {
    console.log('=== 开始新增指标 ===');

    // 设置新增模式
    drawerMode.value = 'add';
    activeTabKey.value = 'basic';
    currentIndicatorId.value = null; // 新增模式设置为 null
    drawerVisible.value = true;
    drawerTitle.value = '指标管理-新增';

    console.log('=== 新增模式已设置 ===');
    console.log('currentIndicatorId:', currentIndicatorId.value);
  }

  // 处理编辑指标 - 重构后的简化版本
  function handleEdit(record) {
    if (!record || !record.id) {
      message.error('无效的指标数据');
      return;
    }

    console.log('=== 开始编辑指标 ===');
    console.log('record:', record);

    // 设置编辑模式和指标ID
    drawerMode.value = 'edit';
    activeTabKey.value = 'basic';
    currentIndicatorId.value = record.id;
    drawerVisible.value = true;
    drawerTitle.value = '指标管理-编辑';

    console.log('=== 编辑模式已设置 ===');
    console.log('currentIndicatorId:', currentIndicatorId.value);
  }

  // 处理 Drawer 关闭 - 重构后的简化版本
  function handleDrawerClose() {
    console.log('=== 关闭 Drawer ===');

    drawerVisible.value = false;
    activeTabKey.value = 'basic';
    currentIndicatorId.value = null; // 清空当前指标ID

    // 保留旧的清理逻辑以兼容其他功能
    indicatorData.value = {};
    Object.keys(configData).forEach((key) => delete configData[key]);
    indicatorFormValid.value = false;

    console.log('=== Drawer 已关闭 ===');
  }

  // 新的事件处理函数
  function handleDataLoaded(data) {
    console.log('=== 子组件数据加载完成 ===');
    console.log('data:', data);
    // 可以在这里处理数据加载完成后的逻辑
  }

  function handleDataChanged(formData) {
    console.log('=== 子组件数据变化 ===');
    console.log('formData:', formData);
    // 可以在这里处理数据变化的逻辑
  }

  function handleValidationChanged(isValid, formData) {
    console.log('=== 子组件验证状态变化 ===');
    console.log('isValid:', isValid);
    console.log('formData:', formData);
    // 可以在这里处理验证状态变化的逻辑
  }

  // 保留旧的事件处理函数以兼容其他功能
  function handleIndicatorChange(formData) {
    console.log('=== 指标表单数据变化 ===');
    console.log('formData:', formData);
    indicatorData.value = { ...formData };
  }

  function handleIndicatorValidate(isValid, formData) {
    console.log('=== 指标表单验证 ===');
    console.log('isValid:', isValid);
    console.log('formData:', formData);
    indicatorFormValid.value = isValid;
  }

  // 统一的按钮点击处理函数
  const handleButtonClick = async (action) => {
    switch (action) {
      case 'cancel':
        handleDrawerClose();
        break;
      case 'save':
        await handleTabSave();
        break;
      case 'test':
        await handleTestDataConfig();
        break;
      case 'manual':
        await handleManualDataConfig();
        break;
      case 'refresh':
        await handleRefreshIndicatorValue();
        break;
      default:
        console.warn('未知的按钮操作:', action);
    }
  };

  // 根据当前tab执行对应的保存逻辑 - 重构后的简化版本
  const handleTabSave = async () => {
    try {
      console.log(`=== 开始保存 ${activeTabKey.value} tab ===`);

      switch (activeTabKey.value) {
        case 'basic':
          await indicatorFormRef.value?.save();
          // 新增成功后，更新 currentIndicatorId
          if (!currentIndicatorId.value && indicatorFormRef.value?.form?.id) {
            currentIndicatorId.value = indicatorFormRef.value.form.id;
            console.log('=== 新增成功，更新 currentIndicatorId ===', currentIndicatorId.value);
          }
          break;
        case 'interpretation':
          await interpretationFormRef.value?.save();
          break;
        case 'dataConfig':
          await configFormRef.value?.save();
          break;
        case 'dataReportConfig':
          await reportRuleFormRef.value?.save();
          break;
        case 'complianceConfig':
          await assessmentConfigFormRef.value?.save();
          break;
        case 'testReportRule':
          await testReportRuleRef.value?.save();
          break;
        default:
          message.warn('当前tab暂不支持保存操作');
          return;
      }

      console.log(`=== ${activeTabKey.value} tab 保存成功 ===`);

      // 保存成功后刷新列表数据
      await queryData();
    } catch (error) {
      console.error(`=== ${activeTabKey.value} tab 保存失败 ===`, error);
      // 错误信息已经在子组件中显示，这里不需要重复显示
    }
  };

  // 测试取数配置
  const handleTestDataConfig = async () => {
    try {
      testLoading.value = true;
      // 调用配置组件的测试方法
      await configFormRef.value?.testConnection();
    } catch (error) {
      console.error('测试取数配置失败:', error);
      message.error('测试取数配置失败，请重试');
      smartSentry.captureError(error);
    } finally {
      testLoading.value = false;
    }
  };

  // 手动取数取数配置
  const handleManualDataConfig = async () => {
    try {
      await configFormRef.value?.fetchDataPreview();
    } catch (error) {
      console.error('手动取数失败:', error);
      message.error('手动取数失败失败，请重试');
      smartSentry.captureError(error);
    }
  };

  // 刷新指标值
  const handleRefreshIndicatorValue = async () => {
    try {
      if (indicatorTargetRef.value && indicatorTargetRef.value.queryData) {
        await indicatorTargetRef.value.queryData();
        message.success('指标值数据已刷新');
      } else {
        message.warning('指标值组件未准备就绪');
      }
    } catch (error) {
      console.error('刷新指标值失败:', error);
      message.error('刷新指标值失败，请重试');
      smartSentry.captureError(error);
    }
  };

  // 保存自评配置
  const handleSaveComplianceConfig = async () => {
    try {
      loading.value = true;
      await assessmentConfigFormRef.value?.save();
      message.success('自评配置保存成功');
    } catch (error) {
      console.error('保存自评配置失败:', error);
      message.error('保存自评配置失败，请重试');
      smartSentry.captureError(error);
    } finally {
      loading.value = false;
    }
  };

  function onDelete(data) {
    if (data.children?.length) {
      message.error(`指标 [${data.indicatorName}] 下存在子指标，不能直接删除！`);
      return;
    }
    Modal.confirm({
      title: '提示',
      content: `确定要删除指标 [${data.indicatorName}] 吗?`,
      okText: '删除',
      okType: 'danger',
      async onOk() {
        await requestDelete(data);
      },
      cancelText: '取消',
    });
  }

  async function requestDelete(data) {
    SmartLoading.show();
    try {
      await indicatorManageApi.delete(data.id);
      message.success('删除成功');
      if (selectedIndicator.value?.id === data.id) selectedIndicator.value = null;
      selectedRowKeyList.value = selectedRowKeyList.value.filter((key) => key !== data.id);
      await queryData(); // 删除后重新查询
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  // 获取指标配置数据
  async function fetchIndicatorExtraConfig(indicatorId) {
    try {
      const res = await indicatorExtraConfigApi.queryIndicatorById(indicatorId);
      if (res.ok && res.data) {
        // 将API返回的数据直接赋值给configData
        Object.assign(configData, res.data);
        console.log('=== 加载配置数据成功 ===');
        console.log('configData:', configData);
      } else {
        console.warn('Failed to fetch indicator extra config:', res.msg);
        // 清空配置数据
        Object.keys(configData).forEach((key) => delete configData[key]);
      }
    } catch (error) {
      smartSentry.captureError(error);
      message.error('加载取数配置发生错误');
      // 清空配置数据
      Object.keys(configData).forEach((key) => delete configData[key]);
    }
  }

  // 保存指标取数配置信息
  async function saveIndicatorConfig() {
    try {
      if (!configData.indicatorId) {
        message.error('请先保存指标基础信息');
        return false;
      }

      if (configData.id) {
        // 编辑
        await indicatorExtraConfigApi.update(configData);
      } else {
        // 新增
        configData.indicatorId = indicatorData.value.id;
        await indicatorExtraConfigApi.add(configData);
      }

      return true;
    } catch (error) {
      console.error('保存指标取数配置失败:', error);
      message.error('保存指标取数配置失败');
      return false;
    }
  }
</script>

<style lang="less" scoped>
  //tab样式
  .tabs {
    :deep(.ant-tabs-nav-list) {
      gap: 5px;
    }
  }
  // 主容器样式
  .indicator-manage-container {
    background: #f5f5f5;
    height: calc(100vh - 105px);
  }

  // 搜索容器样式
  .search-container {
    padding: 10px;
    background: #fff;
    border-radius: 6px;
    margin-bottom: 8px;
    border: 1px solid #e8e8e8;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    height: 15%;
  }

  // 表格容器样式
  .table-container {
    background: #fff;
    overflow: hidden;
    border-radius: 8px;
    height: 85%;
  }

  // 表格样式优化
  :deep(.ant-table) {
    .ant-table-thead > tr > th {
      background: #fff;
      font-weight: 600;
      // border-top: 2px solid gray;
      // border-bottom: 2px solid gray;
      // border-radius: 10% !important;
    }
  }

  // 选中行样式
  :deep(.table-row-selected) > td {
    background-color: #e6f7ff !important;
  }

  // 表格行悬停效果
  :deep(.ant-table-tbody > tr:hover > td) {
    background-color: #e4f4eeb3 !important;
  }

  // 标签样式优化
  :deep(.ant-tag) {
    border-radius: 4px;
    font-size: 12px;
    padding: 2px 8px;
  }

  // 开关样式优化
  :deep(.ant-switch-disabled) {
    opacity: 0.8;
  }

  // Drawer 样式优化
  :deep(.ant-drawer) {
    .ant-drawer-header {
      border-bottom: 2px solid #f0f0f0;
      padding: 16px 24px;

      .ant-drawer-title {
        font-size: 18px;
        font-weight: 600;
        color: #1890ff;
      }
    }

    .ant-drawer-body {
      padding: 0;
    }
  }

  // Tab 样式优化
  :deep(.ant-tabs) {
    .ant-tabs-nav {
      margin-bottom: 0;
      padding: 0 24px;
      background: #fafafa;
      border-bottom: 1px solid #e8e8e8;
    }

    .ant-tabs-tab {
      padding: 16px 20px;
      font-size: 14px;

      .anticon {
        margin-right: 8px;
        font-size: 16px;
      }

      &.ant-tabs-tab-active {
        background: #fff;
        border-bottom: 2px solid #1890ff;

        .ant-tabs-tab-btn {
          color: #1890ff;
          font-weight: 600;
        }
      }
    }

    .ant-tabs-content-holder {
      padding: 24px;
    }
  }

  // Tab 内容样式
  .tab-content {
    padding: 20px;
    background: #fafafa;
    border-radius: 6px;
    min-height: 200px;

    p {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
  }

  // Drawer 底部操作区域样式
  .drawer-footer {
    display: flex;
    justify-content: center;
    padding: 16px 0;
  }
</style>
