<!--
  * 数据源配置
  *
  * @Author:    Jayce
  * @Date:      2025-04-25 16:04:20
  * @Copyright  ZDS
-->
<template>
  <a-card size="small" :bordered="false" :hoverable="true">
    <template #title> 取数配置 {{ indicator ? ` - [${indicator.indicatorName || ''}]` : '' }} </template>
    <template #extra>
      <a-space size="small">
        <a-button size="small" type="primary" @click="testConnection" :loading="testing" :disabled="!indicator">
          <template #icon><ExperimentOutlined /></template> 测试
        </a-button>
        <a-button size="small" type="primary" @click="saveConfig" :loading="saving" :disabled="!indicator">
          <template #icon><SaveOutlined /></template> 保存
        </a-button>
        <a-button size="small" @click="fetchDataPreview" :loading="fetching" :disabled="!indicator">
          <template #icon><CloudDownloadOutlined /></template> 取数
        </a-button>
        <a-button size="small" danger @click="clearConfig" :disabled="!indicator">
          <template #icon><ClearOutlined /></template> 清除
        </a-button>
      </a-space>
    </template>

    <a-spin :spinning="loading || optionsLoading">
      <a-form ref="configFormRefInner" :model="form" layout="vertical" class="config-form">
        <a-row :gutter="8">
          <a-col :span="12">
            <a-form-item label="数据源1">
              <a-select
                v-model:value="form.dataSourceId1"
                placeholder="请选择数据源1"
                allowClear
                :disabled="!indicator"
                :options="configOptions.dataSources"
              />
            </a-form-item>
            <a-form-item label="SQL1">
              <a-textarea v-model:value="form.sql1" placeholder="请输入SQL1" :rows="5" :disabled="!indicator" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数据源2">
              <a-select
                v-model:value="form.dataSourceId2"
                placeholder="请选择数据源2 (可选)"
                allowClear
                :disabled="!indicator"
                :options="configOptions.dataSources"
              />
            </a-form-item>
            <a-form-item label="SQL2">
              <a-textarea v-model:value="form.sql2" placeholder="请输入SQL2 (可选)" :rows="5" :disabled="!indicator" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="8">
          <a-col :span="12">
            <a-form-item label="关系">
              <a-select
                v-model:value="form.relationType"
                placeholder="请选择关系"
                allowClear
                style="width: 150px"
                :disabled="!indicator"
                :options="configOptions.relationTypes"
                @change="onRelationTypeChange"
              />
              <a-select
                v-model:value="form.joinCondition"
                placeholder="请选择连接条件"
                allowClear
                style="width: calc(100% - 155px); margin-left: 5px"
                :disabled="!indicator"
                :options="configOptions.joinConditions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="备注名称">
              <a-input
                v-model:value="form.remarkName1"
                placeholder="SQL1别名"
                style="width: calc(50% - 3px); margin-right: 6px"
                :disabled="!indicator"
              />
              <a-input v-model:value="form.remarkName2" placeholder="SQL2别名" style="width: calc(50% - 3px)" :disabled="!indicator" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="预处理">
          <a-textarea v-model:value="form.preProcessingSql" placeholder="请输入预处理SQL (可选)" :rows="2" :disabled="!indicator" />
        </a-form-item>

        <a-form-item label="次级钻取">
          <div class="form-group">
            <a-checkbox v-model:checked="form.secondaryDrilldownEnabled" :disabled="!indicator" @change="secondaryDrilldownChange">允许</a-checkbox>
            <span>分组字段:</span>
            <a-input
              v-model:value="form.secondaryDrilldownGroupField"
              placeholder="(可选,多个分组字段使用 , 进行分割)"
              :disabled="!indicator || !form.secondaryDrilldownEnabled"
            />
          </div>
        </a-form-item>

        <a-row :gutter="8">
          <a-col :span="12">
            <!-- <a-form-item label="转换关系1">
              <a-input
                v-model:value="form.transformRelation"
                placeholder="请输入转换关系 (可选)"
                style="width: calc(100% - 140px); margin-right: 5px"
                :disabled="!indicator || !form.secondaryDrilldownEnabled"
              />
              <a-button size="small" :disabled="!indicator || !form.secondaryDrilldownEnabled">
                <template #icon><PlusOutlined /></template> 选择
              </a-button>
              <a-button
                size="small"
                danger
                style="margin-left: 3px"
                :disabled="!indicator || !form.secondaryDrilldownEnabled"
                @click="clearTransformRelation"
              >
                <template #icon><DeleteOutlined /></template> 清除
              </a-button>
            </a-form-item> -->

            <a-form-item label="详细钻取1">
              <a-checkbox
                v-model:checked="form.detailDrilldownEnabled"
                :disabled="!indicator || !form.secondaryDrilldownEnabled"
                @change="detailDrilldownChange"
                >允许</a-checkbox
              >
              <a-input
                v-model:value="form.detailDrilldownReportName"
                placeholder="报表名称 (可选)"
                style="width: 110px; margin-left: 5px"
                :disabled="!indicator || !form.detailDrilldownEnabled || !form.secondaryDrilldownEnabled"
              />
              <a-input v-model:value="form.detailDrilldownReportId" hidden />
              <a-button
                size="small"
                style="margin-left: 5px"
                :disabled="!indicator || !form.detailDrilldownEnabled || !form.secondaryDrilldownEnabled"
                @click="showReportSelector(1)"
              >
                <template #icon><PlusOutlined /></template> 选择
              </a-button>
              <a-button
                size="small"
                danger
                style="margin-left: 3px"
                :disabled="!indicator || !form.detailDrilldownEnabled || !form.secondaryDrilldownEnabled"
                @click="clearDetailDrilldownReportName"
              >
                <template #icon><DeleteOutlined /></template> 清除
              </a-button>
            </a-form-item>

            <a-form-item label="详细SQL钻取条件1">
              <a-input
                v-model:value="form.detailDrilldownCondition"
                placeholder="请输入详细SQL钻取条件 (可选)"
                :disabled="!indicator || !form.detailDrilldownEnabled || !form.secondaryDrilldownEnabled"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <!-- <a-form-item label="次级钻取2">
              <div class="form-group">
                <a-checkbox v-model:checked="form.secondaryDrilldownEnabled2" :disabled="!indicator" @change="secondaryDrilldownChange2"
                  >允许</a-checkbox
                >
                <span>分组字段:</span>
                <a-input
                  v-model:value="form.secondaryDrilldownGroupField2"
                  placeholder="(可选)"
                  style="width: 150px"
                  :disabled="!indicator || !form.secondaryDrilldownEnabled2"
                />
              </div>
            </a-form-item> -->

            <!-- <a-form-item label="转换关系2">
              <a-input
                v-model:value="form.transformRelation2"
                placeholder="请输入转换关系 (可选)"
                style="width: calc(100% - 140px); margin-right: 5px"
                :disabled="!indicator || !form.secondaryDrilldownEnabled2"
              />
              <a-button size="small" :disabled="!indicator || !form.secondaryDrilldownEnabled2">
                <template #icon><PlusOutlined /></template> 选择
              </a-button>
              <a-button
                size="small"
                danger
                style="margin-left: 3px"
                :disabled="!indicator || !form.secondaryDrilldownEnabled2"
                @click="clearTransformRelation2"
              >
                <template #icon><DeleteOutlined /></template> 清除
              </a-button>
            </a-form-item> -->

            <a-form-item label="详细钻取2">
              <a-checkbox
                v-model:checked="form.detailDrilldownEnabled2"
                :disabled="!indicator || !form.secondaryDrilldownEnabled"
                @change="detailDrilldownChange2"
                >允许</a-checkbox
              >
              <a-input
                v-model:value="form.detailDrilldownReportName2"
                placeholder="报表名称 (可选)"
                style="width: 110px; margin-left: 5px"
                :disabled="!indicator || !form.detailDrilldownEnabled2 || !form.secondaryDrilldownEnabled"
              />
              <a-input v-model:value="form.detailDrilldownReportId2" hidden />
              <a-button
                size="small"
                style="margin-left: 5px"
                :disabled="!indicator || !form.detailDrilldownEnabled2 || !form.secondaryDrilldownEnabled"
                @click="showReportSelector(2)"
              >
                <template #icon><PlusOutlined /></template> 选择
              </a-button>
              <a-button
                size="small"
                danger
                style="margin-left: 3px"
                :disabled="!indicator || !form.detailDrilldownEnabled2 || !form.secondaryDrilldownEnabled"
                @click="clearDetailDrilldownReportName2"
              >
                <template #icon><DeleteOutlined /></template> 清除
              </a-button>
            </a-form-item>

            <a-form-item label="详细SQL钻取条件2">
              <a-input
                v-model:value="form.detailDrilldownCondition2"
                placeholder="请输入详细SQL钻取条件 (可选)"
                :disabled="!indicator || !form.detailDrilldownEnabled2 || !form.secondaryDrilldownEnabled"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="8">
          <a-col :span="12">
            <a-form-item label="取数频率">
              <div>
                <a-checkbox :checked="form.fetchFrequencyMonth === '1'" :disabled="!indicator" @change="onMonthlyChange">月度</a-checkbox>
                <a-checkbox :checked="form.fetchFrequencyQuarter === '1'" :disabled="!indicator" @change="onQuarterlyChange">季度</a-checkbox>
                <a-checkbox :checked="form.fetchFrequencyYear === '1'" :disabled="!indicator" @change="onYearlyChange">年度</a-checkbox>
                <a-checkbox :checked="form.fetchFrequencyDay === '1'" :disabled="!indicator" @change="onDailyChange">天数</a-checkbox>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="是否启用">
              <a-select
                v-model:value="form.isqy"
                placeholder="请选择"
                allowClear
                :disabled="!indicator"
                :options="[
                  { value: 1, label: '启用' },
                  { value: 0, label: '停用' },
                ]"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="8">
          <a-col :span="12">
            <a-form-item label="是否自动取数">
              <a-select
                v-model:value="form.autoFetchEnabled"
                placeholder="请选择"
                allowClear
                :disabled="!indicator"
                :options="
                  configOptions.autoFetchOptions?.map((opt) => ({ value: !!opt.value, label: opt.label })) || [
                    { value: true, label: '是' },
                    { value: false, label: '否' },
                  ]
                "
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数据存入表">
              <a-select
                v-model:value="form.targetTable"
                placeholder="请选择存入表"
                allowClear
                :disabled="!indicator"
                :options="configOptions.targetTables || [{ value: '1', label: '基础指标数据' }]"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>

    <!-- 添加测试模态框 -->
    <a-modal v-model:visible="testModalVisible" title="测试" :footer="null" :maskClosable="false" :width="550">
      <div class="test-modal-content">
        <div class="test-time-row">
          <div class="test-time-item">
            <span>测试起始时间:</span>
            <a-date-picker v-model:value="testForm.startDateObj" @change="onStartDateChange" style="width: 100%">
              <template #suffixIcon><CalendarOutlined /></template>
            </a-date-picker>
          </div>
          <div class="test-time-item">
            <span>测试结束时间:</span>
            <a-date-picker v-model:value="testForm.endDateObj" @change="onEndDateChange" style="width: 100%">
              <template #suffixIcon><CalendarOutlined /></template>
            </a-date-picker>
          </div>
        </div>

        <div class="test-data-row">
          <div class="test-data-item">
            <span>数据1（分子）：</span>
            <a-input v-model:value="testForm.data1" />
          </div>
          <div class="test-data-item">
            <span>数据2（分母）：</span>
            <a-input v-model:value="testForm.data2" />
          </div>
        </div>

        <div class="test-data-row">
          <div class="test-data-item" style="flex: 1">
            <span>数据3（合计）：</span>
            <a-input v-model:value="testForm.data3" />
          </div>
        </div>

        <div class="test-btn-row">
          <a-button type="primary" @click="submitTest" :loading="testing">
            <template #icon><ExperimentOutlined /></template> 测试
          </a-button>
          <a-button @click="testModalVisible = false">
            <template #icon><CloseOutlined /></template> 关闭
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- 添加手动更新模态框 -->
    <a-modal v-model:visible="fetchModalVisible" title="手动取数" :footer="null" :maskClosable="false" :width="550">
      <div class="fetch-modal-content">
        <div class="fetch-time-row">
          <div class="fetch-time-item">
            <span>起始时间:</span>
            <a-date-picker v-model:value="fetchForm.startDateObj" @change="onFetchStartDateChange" style="width: 100%">
              <template #suffixIcon><CalendarOutlined /></template>
            </a-date-picker>
          </div>
          <div class="fetch-time-item">
            <span>截止时间:</span>
            <a-date-picker v-model:value="fetchForm.endDateObj" @change="onFetchEndDateChange" style="width: 100%">
              <template #suffixIcon><CalendarOutlined /></template>
            </a-date-picker>
          </div>
        </div>

        <div class="fetch-result-row">
          <div class="fetch-result-item">
            <span>处理结果:</span>
            <a-textarea v-model:value="fetchForm.result" :rows="6" />
          </div>
        </div>

        <div class="fetch-btn-row">
          <a-button type="primary" @click="processFetchData" :loading="fetching">
            <template #icon><ToolOutlined /></template> 处理
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- 添加报表选择器模态框 -->
    <a-modal v-model:visible="reportSelectorVisible" title="选择报表" :width="1000" :footer="null">
      <report-list :isShowSearchForm="false" @select-report="handleReportSelected" />
    </a-modal>
  </a-card>
</template>

<script setup>
  import { reactive, ref, watch, nextTick, onMounted } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
  import { indicatorExtraConfigApi } from '/@/api/business/rating/indicator/manage/indicator-extra-config-api';
  import { indicatorExtraConfigTestApi } from '/@/api/business/rating/indicator/manage/indicator-extra-config-test-api';
  import { indicatorDynamicOptionsApi } from '/@/api/business/rating/indicator/common/indicator-dynamic-options-api';
  import { ratingJobApi } from '/@/api/business/rating/job/rating-job-api';
  import ReportList from '../report/index.vue'; // 导入报表列表组件

  import { smartSentry } from '/@/lib/smart-sentry';
  import {
    ExperimentOutlined,
    SaveOutlined,
    CloudDownloadOutlined,
    ClearOutlined,
    PlusOutlined,
    DeleteOutlined,
    CalendarOutlined,
    CloseOutlined,
    ToolOutlined,
  } from '@ant-design/icons-vue';

  const props = defineProps({
    indicator: {
      // 接收父组件传递过来的选中指标对象
      type: Object,
      default: null,
    },
  });

  const configFormRefInner = ref();
  const loading = ref(false); // 表单加载状态
  const optionsLoading = ref(false); // Loading state for dropdown options
  const testing = ref(false);
  const saving = ref(false);
  const fetching = ref(false);

  const formDefault = {
    id: undefined,
    indicatorId: undefined,
    dataSourceId1: undefined,
    sql1: '',
    dataSourceId2: undefined,
    sql2: '',
    relationType: null,
    joinCondition: null,
    remarkName1: '',
    remarkName2: '',
    preProcessingSql: '',
    secondaryDrilldownEnabled: false,
    secondaryDrilldownGroupField: '',
    transformRelation: '',
    detailDrilldownEnabled: false,
    detailDrilldownReportName: '',
    detailDrilldownCondition: '',
    secondaryDrilldownEnabled2: false,
    secondaryDrilldownGroupField2: '',
    transformRelation2: '',
    detailDrilldownEnabled2: false,
    detailDrilldownReportName2: '',
    detailDrilldownReportId: undefined,
    detailDrilldownReportId2: undefined,
    detailDrilldownCondition2: '',
    isqy: 1, // 默认启用
    // 频率相关字段初始值设为0（未勾选）
    fetchFrequencyMonth: '0',
    fetchFrequencyQuarter: '0',
    fetchFrequencyYear: '0',
    fetchFrequencyDay: '0',
    autoFetchEnabled: true,
    targetTable: '1',
  };

  const form = reactive({ ...formDefault });
  const testConfigForm = reactive({ ...formDefault });

  // State to hold dynamic options
  const configOptions = reactive({
    dataSources: [],
    relationTypes: [],
    joinConditions: [],
    autoFetchOptions: [], // Store the raw API response {value: 1/0, label: '是'/'否'}
    targetTables: [],
  });

  // 测试模态框相关
  const testModalVisible = ref(false);
  const testForm = reactive({
    id: form.id,
    startTime: '',
    endTime: '',
    startDateObj: null,
    endDateObj: null,
    data1: '',
    data2: '',
    data3: '',
  });

  // 手动更新模态框相关
  const fetchModalVisible = ref(false);
  const fetchForm = reactive({
    id: '',
    startTime: '',
    endTime: '',
    startDateObj: null,
    endDateObj: null,
    result: '',
  });

  // 添加报表选择器相关状态
  const reportSelectorVisible = ref(false);
  const currentReportTarget = ref(1); // 1表示detailDrilldownReportName, 2表示detailDrilldownReportName2

  // 监听 props.indicator 的变化
  watch(
    () => props.indicator,
    (newIndicator, oldIndicator) => {
      if (newIndicator) {
        console.log('Config form received indicator:', newIndicator);
        loadConfig(newIndicator.id);
      } else {
        // 如果没有选中项，清空表单
        resetForm();
      }
    },
    { immediate: true }
  ); // immediate: true 使得初始加载时也能触发

  // 重置表单为默认值
  function resetForm(currentIndicatorId = undefined) {
    Object.assign(form, formDefault);
    form.indicatorId = currentIndicatorId;
    // 确保所有频率字段为0（未勾选）
    form.fetchFrequencyMonth = '0';
    form.fetchFrequencyQuarter = '0';
    form.fetchFrequencyYear = '0';
    form.fetchFrequencyDay = '0';
    nextTick(() => {
      configFormRefInner.value?.clearValidate();
    });
  }

  // 加载指定指标的配置 (需要实现 indicatorApi.getConfig)
  async function loadConfig(indicatorId) {
    if (!indicatorId) {
      resetForm();
      return;
    }
    loading.value = true;
    try {
      // --- 假设 API ---
      // const res = await indicatorApi.getConfig(indicatorId);
      // Object.assign(form, formDefault, res.data); // 合并默认值和加载的数据
      // ----------------

      // --- 模拟加载 ---
      resetForm(); // 先重置
      form.indicatorId = indicatorId;
      // 从后端获取的数据
      await fetchIndicatorExtraConfig(indicatorId);
      // ----------------

      nextTick(() => {
        configFormRefInner.value?.clearValidate();
      });
    } catch (error) {
      smartSentry.captureError(error);
      resetForm(); // 加载失败则重置
    } finally {
      loading.value = false;
    }
  }

  // Fetch options when the component mounts
  onMounted(() => {
    fetchOptions().then(() => {
      // After options are fetched, check if there's an initial indicator
      if (props.indicator && props.indicator.id) {
        loadConfig(props.indicator.id);
      } else {
        resetForm(); // Ensure form is reset with option defaults applied
      }
    });
  });

  //Fetch indicator extra config by id
  async function fetchIndicatorExtraConfig(indicatoryId) {
    try {
      const res = await indicatorExtraConfigApi.queryIndicatorById(indicatoryId);
      if (res.ok && res.data) {
        // 将API返回的数据直接赋值给表单
        Object.assign(form, res.data);
        console.log('加载的频率数据:', {
          月度: form.fetchFrequencyMonth,
          季度: form.fetchFrequencyQuarter,
          年度: form.fetchFrequencyYear,
          天数: form.fetchFrequencyDay,
        });
      } else {
        console.warn('Failed to fetch indicator extra config:', res.msg);
      }
    } catch (error) {
      smartSentry.captureError(error);
      message.error('加载取数配置发生错误');
    }
  }

  // Fetch options from API
  async function fetchOptions() {
    optionsLoading.value = true;
    try {
      const res = await indicatorDynamicOptionsApi.querySelectOptions(); // Call the API
      if (res.ok && res.data) {
        // Assign fetched options, handle potential nulls from API
        Object.assign(configOptions, {
          dataSources: res.data.dataSources || [],
          relationTypes: res.data.relationTypes || [],
          joinConditions: res.data.joinConditions || [],
          autoFetchOptions: res.data.autoFetchOptions || [],
          targetTables: res.data.targetTables || [],
        });
        // Set default value for joinCondition if needed, based on fetched options
        if (!form.joinCondition && configOptions.joinConditions.length > 0 && configOptions.joinConditions.some((opt) => opt.label === '默认')) {
          form.joinCondition = configOptions.joinConditions.find((opt) => opt.label === '默认').value;
        }
        // Set default for targetTable if needed
        if (!form.targetTable && configOptions.targetTables.length > 0) {
          // Set to first option or a specific default like '1' if it exists
          const defaultTable = configOptions.targetTables.find((opt) => opt.value === '1') || configOptions.targetTables[0];
          form.targetTable = defaultTable?.value;
        }
        // Set default for autoFetchEnabled based on options if needed (e.g., default to '是' if exists)
        if (form.autoFetchEnabled === undefined && configOptions.autoFetchOptions.length > 0) {
          const defaultAutoFetch = configOptions.autoFetchOptions.find((opt) => opt.label === '是');
          if (defaultAutoFetch) {
            form.autoFetchEnabled = !!defaultAutoFetch.value; // Convert 1/0 to true/false
          }
        }
      } else {
        console.error('Failed to fetch config options:', res.msg);
        message.error('加载下拉选项失败: ' + res.msg);
      }
    } catch (error) {
      smartSentry.captureError(error);
      message.error('加载下拉选项时发生错误');
      // Optionally clear options on error
      // Object.keys(configOptions).forEach(key => configOptions[key] = []);
    } finally {
      optionsLoading.value = false;
    }
  }

  // 修改测试连接函数，显示模态框
  async function testConnection() {
    if (!props.indicator) return message.warn('请先在左侧选择一个指标');

    // 重置表单
    // testForm.startTime = '';
    // testForm.endTime = '';
    // testForm.startDateObj = null;
    // testForm.endDateObj = null;
    testForm.data1 = '';
    testForm.data2 = '';
    testForm.data3 = '';

    // 显示模态框
    testModalVisible.value = true;
  }

  // 日期选择处理函数
  function onStartDateChange(date, dateString) {
    testForm.startTime = dateString;
  }

  function onEndDateChange(date, dateString) {
    testForm.endTime = dateString;
  }

  // 提交测试
  async function submitTest() {
    testing.value = true;
    try {
      //test
      await test();

      // 在这里添加实际的测试提交逻辑
      const param = {
        bdate: testForm.startTime, //测试开始时间
        edate: testForm.endTime, //测试结束时间
        id: testConfigForm.id,
      };
      console.log(param);
      const res = await ratingJobApi.testExtraConfig(param);
      if (res.data) {
        testForm.data1 = res.data.value1;
        testForm.data2 = res.data.value2;
        testForm.data3 = res.data.value3;
        message.success('测试成功');
      }
      else if(res.code==-1){
        Modal.error({
          title: '测试执行错误',
          content: res.msg,
        });
      }
    } catch (error) {
      smartSentry.captureError(error);
      message.error('测试失败: ' + error.message);
    } finally {
      testing.value = false;
    }
  }

  // --- 操作按钮方法 (需要实现 API) ---

  async function saveConfig() {
    if (!props.indicator) return message.warn('请先在左侧选择一个指标');
    saving.value = true;
    try {
      await configFormRefInner.value?.validateFields(); // 可选：保存前校验

      // 确保 indicatorId 总是正确的 (从 props 获取)
      // 这一步应该在判断 add/update 之前完成，或者确保 loadConfig/resetForm 正确设置了它
      if (props.indicator && props.indicator.id) {
        form.indicatorId = props.indicator.id;
      } else {
        // 如果 props.indicator 或其 id 不存在，则无法保存
        message.error('无法确定关联的指标ID，请重新选择指标');
        saving.value = false;
        return;
      }

      // 判断是新增还是更新，应该基于 form.id (配置本身的ID)
      if (!form.id) {
        // <--- 修改判断条件
        // --- save API ---
        await indicatorExtraConfigApi.add(form);
        message.success('保存成功');
      } else {
        // --- update API ---
        await indicatorExtraConfigApi.update(form); // update 时应该传递包含 id 的 form 对象
        message.success('更新成功');
      }
      // 在成功后重新加载配置，以获取新生成的 form.id
      await loadConfig(props.indicator.id);
      console.log('Saving form:', form);
      saving.value = false; // <--- 移动到 try 的末尾或 finally 中确保执行
    } catch (error) {
      if (error.errorFields) {
        message.error('表单校验失败');
      } else {
        smartSentry.captureError(error);
      }
      saving.value = false;
    }
  }

  async function test() {
    if (!props.indicator) return message.warn('请先在左侧选择一个指标');
    try {
      await configFormRefInner.value?.validateFields(); // 可选：保存前校验

      // 确保 indicatorId 总是正确的 (从 props 获取)
      // 这一步应该在判断 add/update 之前完成，或者确保 loadConfig/resetForm 正确设置了它
      if (props.indicator && props.indicator.id) {
        form.indicatorId = props.indicator.id;
      } else {
        // 如果 props.indicator 或其 id 不存在，则无法保存
        message.error('无法确定关联的指标ID，请重新选择指标');
        saving.value = false;
        return;
      }
      //访问接口，进行对指标配置测试
      const res = await indicatorExtraConfigTestApi.test(form);
      if (res.ok && res.data) {
        // 将API返回的数据直接赋值给表单
        Object.assign(testConfigForm, res.data);
      } else {
        console.warn('Failed to fetch indicator extra config test:', res.msg);
      }
      console.log('Saving form:', form);
    } catch (error) {
      if (error.errorFields) {
        message.error('表单校验失败');
      } else {
        smartSentry.captureError(error);
      }
    }
  }

  // 修改取数预览函数，显示手动更新模态框
  async function fetchDataPreview() {
    if (!props.indicator) return message.warn('请先在左侧选择一个指标');

    // 重置表单
    // fetchForm.startTime = '';
    // fetchForm.endTime = '';
    // fetchForm.startDateObj = null;
    // fetchForm.endDateObj = null;
    fetchForm.result = '';

    // 显示模态框
    fetchModalVisible.value = true;
  }

  // 日期选择处理函数
  function onFetchStartDateChange(date, dateString) {
    fetchForm.startTime = dateString;
  }

  function onFetchEndDateChange(date, dateString) {
    fetchForm.endTime = dateString;
  }

  // 处理取数
  async function processFetchData() {
    fetching.value = true;
    try {
      const param = {
        bdate: fetchForm.startTime, //测试开始时间
        edate: fetchForm.endTime, //测试结束时间
        id: form.id,
      };
      // 在这里添加实际的取数处理逻辑
      const result = await ratingJobApi.fetchMethod(param);
      fetchForm.result = result.data || '处理成功';

      // 模拟处理
      //await new Promise((resolve) => setTimeout(resolve, 1500));
      //fetchForm.result = '取数处理成功：获取到20条记录，其中有效记录18条。\n详细信息：...\n处理完成时间：' + new Date().toLocaleString();

      message.success('数据处理成功');
    } catch (error) {
      smartSentry.captureError(error);
      message.error('处理失败: ' + error.message);
      fetchForm.result = '处理失败: ' + error.message;
    } finally {
      fetching.value = false;
    }
  }

  function clearConfig() {
    if (!props.indicator) return message.warn('请先在左侧选择一个指标');
    Modal.confirm({
      title: '确认清除',
      content: `确定要清除指标 [${props.indicator.indicatorName}] 的所有取数配置吗？此操作不可恢复。`,
      okText: '确认清除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        message.info('正在清除配置... (功能待实现)');
        // --- 假设 API ---
        // try { await indicatorApi.clearConfig(props.indicator.id); resetForm(); message.success('清除成功'); } catch (e) { smartSentry.captureError(e); }
        // --- 模拟 ---
        resetForm(props.indicator.id); // Reset form but keep indicatorId
        // ------------
      },
    });
  }

  //点击次级钻取是否允许
  const secondaryDrilldownChange = (e) => {
    if (!e.target.checked) {
      //重置对应的字段
      // form.secondaryDrilldownGroupField = '';
      // form.transformRelation = '';
      // form.detailDrilldownReportName = '';
      // form.detailDrilldownCondition = '';
      // form.detailDrilldownEnabled = false;
    }
  };

  //点击详细钻取是否允许
  const detailDrilldownChange = (e) => {
    if (!e.target.checked) {
      //重置对应的字段
      // form.detailDrilldownReportName = '';
      // form.detailDrilldownCondition = '';
    }
  };

  const clearTransformRelation = () => {
    form.transformRelation = '';
  };

  const clearDetailDrilldownReportName = () => {
    form.detailDrilldownReportName = '';
  };

  //点击次级钻取2是否允许
  const secondaryDrilldownChange2 = (e) => {
    if (!e.target.checked) {
      //重置对应的字段
      // form.secondaryDrilldownGroupField2 = '';
      // form.transformRelation2 = '';
      // form.detailDrilldownReportName2 = '';
      // form.detailDrilldownCondition2 = '';
      // form.detailDrilldownEnabled2 = false;
    }
  };

  //点击详细钻取2是否允许
  const detailDrilldownChange2 = (e) => {
    if (!e.target.checked) {
      //重置对应的字段
      // form.detailDrilldownReportName2 = '';
      // form.detailDrilldownCondition2 = '';
    }
  };

  const clearTransformRelation2 = () => {
    form.transformRelation2 = '';
  };

  const clearDetailDrilldownReportName2 = () => {
    form.detailDrilldownReportName2 = '';
  };

  // 取数频率变化处理函数 - 每个复选框单独处理
  const onMonthlyChange = (e) => {
    form.fetchFrequencyMonth = e.target.checked ? '1' : '0';
    console.log('月度取数频率更新:', form.fetchFrequencyMonth);
  };

  const onQuarterlyChange = (e) => {
    form.fetchFrequencyQuarter = e.target.checked ? '1' : '0';
    console.log('季度取数频率更新:', form.fetchFrequencyQuarter);
  };

  const onYearlyChange = (e) => {
    form.fetchFrequencyYear = e.target.checked ? '1' : '0';
    console.log('年度取数频率更新:', form.fetchFrequencyYear);
  };

  const onDailyChange = (e) => {
    form.fetchFrequencyDay = e.target.checked ? '1' : '0';
    console.log('天数取数频率更新:', form.fetchFrequencyDay);
  };

  // 显示报表选择器
  function showReportSelector(target) {
    currentReportTarget.value = target;
    reportSelectorVisible.value = true;
  }

  // 处理报表选择
  function handleReportSelected(report) {
    // 根据当前目标设置报表名称到不同的表单字段
    if (currentReportTarget.value === 1) {
      form.detailDrilldownReportName = report.reportName;
      form.detailDrilldownReportId = report.id;
    } else {
      form.detailDrilldownReportName2 = report.reportName;
      form.detailDrilldownReportId2 = report.id;
    }

    // 关闭选择器
    reportSelectorVisible.value = false;
  }

  // 暴露方法给父组件 (如果需要)
  defineExpose({
    loadConfig,
    resetForm,
  });
</script>

<style lang="less" scoped>
  .config-form {
    //height: calc(100vh - 175px); // 可能需要根据移除的查询表单调整高度
    position: relative;
  }

  .ant-form-item {
    margin: -1px 0;
  }
  /* 测试和获取数据模态框样式 */
  .test-modal-content {
    padding: 12px 0;

    .test-time-row,
    .test-data-row {
      display: flex;
      margin-bottom: 12px;
    }

    .test-time-item,
    .test-data-item {
      flex: 1;
      display: flex;
      align-items: center;
      margin-right: 12px;

      span {
        white-space: nowrap;
        margin-right: 6px;
      }
    }

    .test-btn-row {
      display: flex;
      justify-content: center;
      margin-top: 16px;

      button {
        margin: 0 6px;
      }
    }
  }

  .fetch-modal-content {
    padding: 12px 0;

    .fetch-time-row {
      display: flex;
      margin-bottom: 12px;
    }

    .fetch-time-item {
      flex: 1;
      display: flex;
      align-items: center;
      margin-right: 12px;

      span {
        white-space: nowrap;
        margin-right: 6px;
      }
    }

    .fetch-btn-row {
      display: flex;
      justify-content: center;
      margin-top: 16px;

      button {
        margin: 0 6px;
      }
    }
  }
</style>
