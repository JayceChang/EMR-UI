<!--
  * 数据源配置
  *
  * @Author:    Jayce
  * @Date:      2025-04-25 16:04:20
  * @Copyright  ZDS
-->
<template>
  <div size="small">
    <a-spin :spinning="loading || optionsLoading">
      <a-form ref="configFormRefInner" :model="form" layout="vertical" class="config-form">
        <!-- 取数配置区域 -->
        <div class="config-section">
          <div class="section-header" @click="toggleSection('other')">
            <div class="header-left">
              <h4>取数属性配置</h4>
            </div>
            <div class="header-right">
              <a-button type="text" size="small">
                <template #icon>
                  <DownOutlined v-if="sectionCollapsed.other" />
                  <UpOutlined v-else />
                </template>
              </a-button>
            </div>
          </div>

          <div v-show="!sectionCollapsed.other" class="section-content">
            <!-- 指标数据类型 -->
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="指标数据类型">
                  <SmartEnumSelect
                    width="100%"
                    v-model:value="form.indicatorDataType"
                    enum-name="INDICATOR_DATA_TYPE_ENUM"
                    placeholder="请选择指标数据类型"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </div>

        <!-- 取数SQL配置区域 -->
        <div class="config-section" v-if="fetchSqlSection">
          <div class="section-header" @click="toggleSection('dataSource')">
            <div class="header-left">
              <h4>取数SQL配置</h4>
            </div>
            <div class="header-right">
              <a-button type="text" size="small">
                <template #icon>
                  <DownOutlined v-if="sectionCollapsed.dataSource" />
                  <UpOutlined v-else />
                </template>
              </a-button>
            </div>
          </div>

          <div v-show="!sectionCollapsed.dataSource" class="section-content">
            <a-row :gutter="16">
              <!-- 数据源 -->
              <a-col :span="24">
                <div class="config-card">
                  <div class="card-title">{{ dataSourceText }}</div>
                  <a-form-item label="数据源">
                    <a-select v-model:value="form.dataSourceId1" placeholder="请选择数据源" allowClear :options="configOptions.dataSources" />
                  </a-form-item>
                  <a-form-item label="SQL语句">
                    <a-textarea v-model:value="form.sql1" placeholder="请输入SQL" :rows="5" />
                  </a-form-item>
                  <a-form-item label="备注名称">
                    <a-input v-model:value="form.remarkName1" placeholder="SQL别名" />
                  </a-form-item>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>

        <!-- 公式配置区域 -->
        <div class="config-section" v-if="formulaSection">
          <div class="section-header" @click="toggleSection('formula')">
            <div class="header-left">
              <h4>公式配置</h4>
            </div>
            <div class="header-right">
              <a-button type="text" size="small">
                <template #icon>
                  <DownOutlined v-if="sectionCollapsed.formula" />
                  <UpOutlined v-else />
                </template>
              </a-button>
            </div>
          </div>

          <div v-show="!sectionCollapsed.formula" class="section-content">
            <div class="formula-builder">
              <!-- 公式预览区域 -->
              <div class="formula-preview-section">
                <div class="preview-title">
                  <span class="title-text">计算公式</span>
                  <a-tooltip title="配置下方指标预览生成的计算公式">
                    <QuestionCircleOutlined class="help-icon" />
                  </a-tooltip>
                </div>
                <div class="formula-display">
                  <div class="formula-expression">
                    <span class="result-var">结果</span>
                    <span class="equals">=</span>
                    <span class="result-var">(</span>
                    <!-- 分子部分 -->
                    <div class="formula-component numerator-section" :class="{ 'has-value': form.numeratorIndicator }">
                      <div class="component-label">分子</div>
                      <div class="component-content">
                        <span v-if="!form.numeratorIndicator" class="placeholder-text">选择分子指标</span>
                        <span v-else class="selected-text">{{ numeratorLabel }}</span>
                      </div>
                    </div>

                    <!-- 运算符部分 -->
                    <div class="formula-operator" :class="{ 'has-value': form.relationType }">
                      <span v-if="!form.relationType" class="placeholder-text">运算</span>
                      <span v-else class="operator-symbol">{{ getOperatorSymbol() }}</span>
                    </div>

                    <!-- 分母部分 -->
                    <div class="formula-component denominator-section" :class="{ 'has-value': form.denominatorIndicator }">
                      <div class="component-label">分母</div>
                      <div class="component-content">
                        <span v-if="!form.denominatorIndicator" class="placeholder-text">选择分母指标</span>
                        <span v-else class="selected-text">{{ denominatorLabel }}</span>
                      </div>
                    </div>
                    <span class="result-var">)</span>
                    <!-- 条件部分 -->
                    <div v-if="form.joinCondition" class="formula-condition">
                      <span class="condition-value">{{ getConditionLabel() }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 配置面板 -->
              <div class="formula-config-panel">
                <a-row :gutter="16">
                  <!-- 分子配置 -->
                  <a-col :span="12">
                    <div class="config-card numerator-card">
                      <div class="card-header">
                        <span class="card-title">分子指标</span>
                      </div>
                      <div class="card-content">
                        <GenericTreeSelect
                          v-model:value="form.numeratorIndicator"
                          :apiFunc="handleSelectTreeLevel"
                          :apiParams="true"
                          :fieldNames="{ label: 'indicatorName', value: 'id', key: 'id', children: 'children' }"
                          placeholder="请选择分子指标"
                          name="numeratorIndicator"
                          treeDefaultExpandAll
                          @change="onFormulaChange"
                          size="large"
                        />
                      </div>
                    </div>
                  </a-col>

                  <!-- 分母配置 -->
                  <a-col :span="12">
                    <div class="config-card denominator-card">
                      <div class="card-header">
                        <span class="card-title">分母指标</span>
                      </div>
                      <div class="card-content">
                        <GenericTreeSelect
                          v-model:value="form.denominatorIndicator"
                          :apiFunc="handleSelectTreeLevel"
                          :apiParams="true"
                          :fieldNames="{ label: 'indicatorName', value: 'id', key: 'id', children: 'children' }"
                          name="denominatorIndicator"
                          placeholder="请选择分母指标"
                          treeDefaultExpandAll
                          @change="onFormulaChange"
                          size="large"
                        />
                      </div>
                    </div>
                  </a-col>
                </a-row>

                <a-row :gutter="16" style="margin-top: 16px">
                  <!-- 运算类型配置 -->
                  <a-col :span="12">
                    <div class="config-card operator-card">
                      <div class="card-header">
                        <span class="card-title">运算类型</span>
                      </div>
                      <div class="card-content">
                        <a-select
                          v-model:value="form.relationType"
                          placeholder="请选择运算类型"
                          allowClear
                          :options="configOptions.relationTypes"
                          @change="onFormulaChange"
                          size="large"
                        />
                      </div>
                    </div>
                  </a-col>

                  <!-- 条件配置 -->
                  <a-col :span="12">
                    <div class="config-card condition-card">
                      <div class="card-header">
                        <span class="card-title">计算条件</span>
                      </div>
                      <div class="card-content">
                        <a-select
                          v-model:value="form.joinCondition"
                          placeholder="请选择计算条件"
                          allowClear
                          name="condition"
                          :options="configOptions.joinConditions"
                          size="large"
                        />
                      </div>
                    </div>
                  </a-col>
                </a-row>
              </div>
            </div>
          </div>
        </div>

        <!-- 钻取配置区域 -->
        <div class="config-section" v-if="!formulaSection">
          <div class="section-header" @click="toggleSection('drilldown')">
            <div class="header-left">
              <h4>钻取配置</h4>
            </div>
            <div class="header-right">
              <a-button type="text" size="small">
                <template #icon>
                  <DownOutlined v-if="sectionCollapsed.drilldown" />
                  <UpOutlined v-else />
                </template>
              </a-button>
            </div>
          </div>
          <!-- 分子 or 分母 钻取设置-->
          <div v-show="!sectionCollapsed.drilldown" class="section-content">
            <div class="config-card" v-if="showDrillDown">
              <div class="card-title">{{ drillText }}</div>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="钻取状态">
                    <div class="form-group">
                      <a-switch v-model:checked="secondaryDrilldownEnabled" checked-children="允许" un-checked-children="不允许" />
                    </div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="分组字段">
                    <div class="form-group">
                      <a-input
                        v-model:value="form.secondaryDrilldownGroupField"
                        placeholder="(可选,多个分组字段使用 , 进行分割)"
                        :disabled="!form.secondaryDrilldownEnabled"
                      />
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>

            <!-- 比值，数值，率值等详细钻取设置-->
            <div class="config-card" v-if="showDetailDrillDown">
              <div class="card-title">
                {{ $smartEnumPlugin.getDescByValue('INDICATOR_DATA_TYPE_ENUM', form.indicatorDataType) + '报表钻取' }}
              </div>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="钻取状态">
                    <a-switch v-model:checked="detailDrilldownEnabled" checked-children="允许" un-checked-children="不允许" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="报表名称">
                    <div class="report-input-group">
                      <a-input
                        v-model:value="form.detailDrilldownReportName"
                        placeholder="报表名称 (可选)"
                        :disabled="!form.detailDrilldownEnabled"
                      />
                      <a-input v-model:value="form.detailDrilldownReportId" hidden />
                      <a-button size="small" :disabled="!form.detailDrilldownEnabled" @click="showReportSelector(1)">
                        <template #icon><PlusOutlined /></template> 选择
                      </a-button>
                      <a-button size="small" danger :disabled="!form.detailDrilldownEnabled" @click="clearDetailDrilldownReportName">
                        <template #icon><DeleteOutlined /></template> 清除
                      </a-button>
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-item label="SQL钻取条件">
                    <a-input
                      v-model:value="form.detailDrilldownCondition"
                      placeholder="请输入详细SQL钻取条件 (可选)"
                      :disabled="!form.detailDrilldownEnabled"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
          </div>
        </div>

        <!-- 频率配置区域 -->
        <div class="config-section">
          <div class="section-header" @click="toggleSection('frequency')">
            <div class="header-left">
              <h4>频率配置</h4>
            </div>
            <div class="header-right">
              <a-button type="text" size="small">
                <template #icon>
                  <DownOutlined v-if="sectionCollapsed.frequency" />
                  <UpOutlined v-else />
                </template>
              </a-button>
            </div>
          </div>

          <div v-show="!sectionCollapsed.frequency" class="section-content">
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="自动取数">
                  <SmartEnumSelect width="100%" v-model:value="form.autoFetchEnabled" enum-name="FLAG_NUMBER_ENUM" placeholder="请选择是否自动取数" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="取数频率">
                  <div class="frequency-group">
                    <a-checkbox :checked="form.fetchFrequencyMonth === '1'" @change="onMonthlyChange">月度</a-checkbox>
                    <a-checkbox :checked="form.fetchFrequencyQuarter === '1'" @change="onQuarterlyChange">季度</a-checkbox>
                    <a-checkbox :checked="form.fetchFrequencyYear === '1'" @change="onYearlyChange">年度</a-checkbox>
                    <a-checkbox :checked="form.fetchFrequencyDay === '1'" @change="onDailyChange">天数</a-checkbox>
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </div>
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
  </div>
</template>

<script setup>
  import { reactive, ref, watch, nextTick, onMounted, computed } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
  import { indicatorExtraConfigApi } from '/@/api/business/rating/indicator/manage/indicator-extra-config-api';
  import { indicatorExtraConfigTestApi } from '/@/api/business/rating/indicator/manage/indicator-extra-config-test-api';
  import { indicatorDynamicOptionsApi } from '/@/api/business/rating/indicator/common/indicator-dynamic-options-api';
  import { ratingJobApi } from '/@/api/business/rating/job/rating-job-api';
  import ReportList from '../report/index.vue'; // 导入报表列表组件
  import GenericTreeSelect from '/@/components/business/common/tree-select/generic-tree-select.vue';
  import SmartEnumSelect from '/@/components/framework/smart-enum-select/index.vue';

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
    DownOutlined,
    UpOutlined,
    QuestionCircleOutlined,
  } from '@ant-design/icons-vue';
  import { isArray } from 'lodash';

  const props = defineProps({
    indicatorId: {
      type: [String, Number],
      default: null,
    },
  });

  const emits = defineEmits(['dataLoaded', 'dataChanged', 'validationChanged']);

  const configFormRefInner = ref();
  const loading = ref(false); // 表单加载状态
  const optionsLoading = ref(false); // Loading state for dropdown options
  const testing = ref(false);
  const saving = ref(false);
  const fetching = ref(false);

  // 处理分子、分母指标选择层级为当前层级
  const handleSelectTreeLevel = () => {
    return indicatorManageApi.querySpecificIndicatorTree(props.indicatorId);
  };

  // 区域折叠状态
  const sectionCollapsed = reactive({
    dataSource: false,
    formula: false,
    drilldown: false,
    frequency: false,
    other: false,
  });

  const formDefault = {
    id: undefined,
    indicatorId: undefined,
    dataSourceId1: undefined,
    sql1: '',
    relationType: 4, // 默认相除
    joinCondition: 2, // 默认百分比
    remarkName1: '',
    numeratorIndicator: undefined, // 分子指标
    denominatorIndicator: undefined, // 分母指标
    condition: undefined,
    preProcessingSql: '',
    secondaryDrilldownEnabled: 0,
    secondaryDrilldownGroupField: '',
    transformRelation: '',
    detailDrilldownEnabled: 0,
    detailDrilldownReportName: '',
    detailDrilldownCondition: '',
    detailDrilldownReportId: undefined,
    isqy: 1, // 默认启用
    // 频率相关字段）
    fetchFrequencyMonth: '1', //默认选中月
    fetchFrequencyQuarter: '1', //默认选中季
    fetchFrequencyYear: '1', //默认选中年
    fetchFrequencyDay: '0',
    autoFetchEnabled: 1,
    targetTable: '1',
    // 新增取数字段配置
    indicatorDataType: 2, // 指标数据类型 默认选中分子类型
    numeratorReportType: undefined, // 分子填报类型
    numeratorUnit: undefined, // 分子单位
    denominatorReportType: undefined, // 分母填报类型
    denominatorUnit: undefined, // 分母单位
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

  // 计算结果
  const calculationResult = ref('');

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

  // 监听 props.indicatorId 的变化
  watch(
    () => props.indicatorId,
    (newIndicatorId) => {
      if (newIndicatorId) {
        console.log('Config form received indicatorId:', newIndicatorId);
        loadConfig(newIndicatorId);
        emits('dataLoaded', { indicatorId: newIndicatorId });
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
    // form.fetchFrequencyMonth = '0';
    // form.fetchFrequencyQuarter = '0';
    // form.fetchFrequencyYear = '0';
    // form.fetchFrequencyDay = '0';

    nextTick(() => {
      configFormRefInner.value?.clearValidate();
    });
  }

  const numeratorLabel = ref('分子指标');
  const denominatorLabel = ref('分母指标');
  const operatorLabel = ref('运算符');
  const conditionLabel = ref('条件');

  // 根据指标id获取指标名称
  async function getIndicatorNameById(indicatorId) {
    if (!indicatorId) {
      return;
    }
    const res = await indicatorManageApi.queryIndicatorById(indicatorId);
    if (res.ok && res.data) {
      return res.data.indicatorName;
    } else {
      console.error('加载指标名称失败');
      return;
    }
  }

  // 计算公式变化处理
  function onFormulaChange(selectedValue, label, extra, name) {
    console.log(selectedValue);
    console.log(label);
    if (name == 'numeratorIndicator') {
      numeratorLabel.value = label[0];
    } else if (name == 'denominatorIndicator') {
      denominatorLabel.value = label[0];
    }
    // updateCalculationResult(numeratorLabel,denominatorLabel);
  }

  // 获取运算符号
  function getOperatorSymbol() {
    if (!form.relationType) return '';
    console.log(configOptions.relationTypes);
    console.log(form.relationType);
    const relationTypeOption = configOptions.relationTypes.find((opt) => opt.value === form.relationType);
    return relationTypeOption?.label || form.relationType;
  }

  // 获取条件标签
  function getConditionLabel() {
    if (!form.joinCondition) return '';
    const conditionOption = configOptions.joinConditions.find((opt) => opt.value === form.joinCondition);
    return conditionOption?.label || form.condition;
  }

  // 加载指定指标的配置 (需要实现 indicatorApi.getConfig)
  async function loadConfig(indicatorId) {
    if (!indicatorId) {
      resetForm();
      return;
    }
    loading.value = true;
    try {
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
      // After options are fetched, check if there's an initial indicatorId
      if (props.indicatorId) {
        loadConfig(props.indicatorId);
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

        // 设置分子和分母指标显示
        numeratorLabel.value = await getIndicatorNameById(form.numeratorIndicator);
        denominatorLabel.value = await getIndicatorNameById(form.denominatorIndicator);
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
    if (!props.indicatorId) return message.warn('请先选择一个指标');

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
      } else if (res.code == -1) {
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

  async function test() {
    if (!props.indicatorId) return message.warn('请先选择一个指标');
    try {
      await configFormRefInner.value?.validateFields(); // 可选：保存前校验

      // 确保 indicatorId 总是正确的 (从 props 获取)
      if (props.indicatorId) {
        form.indicatorId = props.indicatorId;
      } else {
        // 如果 props.indicatorId 不存在，则无法测试
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
    if (!props.indicatorId) return message.warn('请先选择一个指标');

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

      message.success('数据处理成功');
    } catch (error) {
      smartSentry.captureError(error);
      message.error('处理失败: ' + error.message);
      fetchForm.result = '处理失败: ' + error.message;
    } finally {
      fetching.value = false;
    }
  }

  const clearDetailDrilldownReportName = () => {
    form.detailDrilldownReportName = '';
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
    }

    // 关闭选择器
    reportSelectorVisible.value = false;
  }

  // 切换区域折叠状态
  function toggleSection(sectionName) {
    sectionCollapsed[sectionName] = !sectionCollapsed[sectionName];
  }

  // 统一的保存方法 - 重命名并优化 saveConfig
  const save = async () => {
    if (!props.indicatorId) {
      throw new Error('请先选择一个指标');
    }

    saving.value = true;
    try {
      await configFormRefInner.value?.validateFields(); // 保存前校验

      // 确保 indicatorId 总是正确的
      if (props.indicatorId) {
        form.indicatorId = props.indicatorId;
      } else {
        throw new Error('无法确定关联的指标ID，请重新选择指标');
      }

      let result;
      if (!form.id) {
        // 新增
        console.log('[IndicatorConfigInline] 执行新增操作');
        result = await indicatorExtraConfigApi.add(form);
        message.success('新增取数配置成功');
      } else {
        // 更新
        console.log('[IndicatorConfigInline] 执行更新操作');
        result = await indicatorExtraConfigApi.update(form);
        message.success('更新取数配置成功');
      }

      // 在成功后重新加载配置，以获取新生成的 form.id
      await loadConfig(props.indicatorId);
      console.log('[IndicatorConfigInline] 保存成功:', form);

      return result;
    } catch (error) {
      if (error.errorFields) {
        message.error('表单校验失败');
      } else {
        console.error('[IndicatorConfigInline] 保存失败:', error);
        message.error(error.message || '保存取数配置失败');
      }
      throw error;
    } finally {
      saving.value = false;
    }
  };

  // 数据源显示文本
  const dataSourceText = computed(() => {
    return form.indicatorDataType == '2' ? '分子取数SQL配置' : form.indicatorDataType == '3' ? '分母取数SQL配置' : '取数SQL配置';
  });
  // 钻取显示文本
  const drillText = computed(() => {
    return form.indicatorDataType == '2' ? '分子科室钻取' : form.indicatorDataType == '3' ? '分母科室钻取' : '科室钻取';
  });
  // 取数SQL区域是否显示
  const fetchSqlSection = computed(() => {
    return [2, 3].includes(form.indicatorDataType);
  });
  //监听如果取数区域不显示，则清空之前所选项
  watch(fetchSqlSection, (newValue) => {
    if (!newValue) {
      Object.assign(form, {
        dataSourceId1: '',
        sql1: '',
        remarkName1: '',
      });
    }
  });
  // 公式区域是否显示
  const formulaSection = computed(() => {
    return !fetchSqlSection.value;
  });
  //监听如果公式区域不显示，则清空之前所选项
  watch(formulaSection, (newValue) => {
    if (!newValue) {
      Object.assign(form, {
        numeratorIndicator: '',
        relationType: '',
        denominatorIndicator: '',
        joinCondition: '',
      });
    }
  });

  // 监听是否自动取数
  watch(
    () => form.autoFetchEnabled,
    (newValue) => {
      console.log('自动取数变更:' + newValue);
      if (!newValue && newValue == 0) {
        form.fetchFrequencyMonth = '0';
        form.fetchFrequencyQuarter = '0';
        form.fetchFrequencyYear = '0';
        form.fetchFrequencyDay = '0';
      } else if (newValue == 1) {
        console.log('asdfadsf');
        form.fetchFrequencyMonth = '1';
        form.fetchFrequencyQuarter = '1';
        form.fetchFrequencyYear = '1';
        form.fetchFrequencyDay = '0';
      }
    }
  );
  // 分子 or 分母钻取配置是否显示
  const showDrillDown = computed(() => {
    return fetchSqlSection.value;
  });
  // 比值 数值 率值配置是否显示
  const showDetailDrillDown = computed(() => {
    return fetchSqlSection.value;
  });

  // 计算属性实现类型转换
  const detailDrilldownEnabled = computed({
    get() {
      return form.detailDrilldownEnabled === 1;
    },
    set(val) {
      form.detailDrilldownEnabled = val ? 1 : 0;
    },
  });

  const secondaryDrilldownEnabled = computed({
    get() {
      return form.secondaryDrilldownEnabled === 1;
    },
    set(val) {
      form.secondaryDrilldownEnabled = val ? 1 : 0;
    },
  });

  // 暴露方法给父组件
  defineExpose({
    loadConfig,
    resetForm,
    form,
    getFormData: () => ({ ...form }),
    save, // 新增统一的保存方法
    testConnection, // 测试取数方法
    fetchDataPreview, // 取数方法
    validate: async () => {
      try {
        await configFormRefInner.value?.validateFields();
        return true;
      } catch (error) {
        return false;
      }
    },
  });
</script>

<style lang="less" scoped>
  .config-form {
    //height: calc(100vh - 175px); // 可能需要根据移除的查询表单调整高度
    position: relative;
  }

  .ant-form-item {
    margin: 2px 0;
  }

  // 配置区域样式
  .config-section {
    margin-bottom: 24px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background: #fafafa;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background: #e9ecef;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        h4 {
          margin: 0;
          color: #009688;
          font-weight: 600;
        }
      }

      .header-right {
        .ant-btn {
          border: none;
          box-shadow: none;
        }
      }
    }

    .section-content {
      padding: 16px;
      font-weight: 500;
    }

    .config-card {
      border: 1px solid gray;
      border-radius: 16px;
      padding: 16px;
      // background: #eaf5ee;
      position: relative;
      margin-bottom: 20px;

      &.secondary {
        border-color: gray;
        // background: #eaf5ee;

        .card-title {
          color: gray;
        }
      }

      .card-title {
        position: absolute;
        top: -8px;
        left: 12px;
        background: #fafcff;
        padding: 0 8px;
        font-size: 12px;
        font-weight: 600;
        color: gray;
      }

      .ant-form-item {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .relation-config {
      margin-top: 16px;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
      border: 1px dashed #d9d9d9;
    }
  }

  // 频率配置组样式
  .frequency-group {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    .ant-checkbox-wrapper {
      margin-right: 0;
    }
  }

  // 表单组样式
  .form-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 10px;
    span {
      white-space: nowrap;
    }

    .ant-input {
      flex: 1;
      min-width: 200px;
    }
  }

  // 报表输入组样式
  .report-input-group {
    display: flex;
    gap: 8px;
    align-items: center;

    .ant-input {
      flex: 1;
    }

    .ant-btn {
      flex-shrink: 0;
    }
  }

  // 公式构建器样式 - 业界最佳实践
  .formula-builder {
    background: #f8f9fa;
    border-radius: 12px;
    margin: 16px 0;

    // 公式预览区域
    .formula-preview-section {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .preview-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;

        .title-text {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .help-icon {
          color: #6b7280;
          cursor: help;
        }
      }

      .formula-display {
        background: #f9fafb;
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        padding: 20px;
        min-height: 80px;

        .formula-expression {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: start;

          .result-var {
            font-size: 16px;
            font-weight: bold;
            color: #059669;
            background: #d1fae5;
            padding: 8px 16px;
            border-radius: 6px;
          }

          .equals {
            font-size: 20px;
            font-weight: bold;
            color: #374151;
          }

          .formula-component {
            background: #ececec;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px 16px;
            min-width: 120px;
            min-height: 90px;
            text-align: center;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 120px;

            &.has-value {
              // border-color: #3b82f6;
              background: #eff6ff;
            }

            &.numerator-section.has-value {
              border-color: #10b981;
              background: #ecfdf5;
              max-width: 160px;
            }

            &.denominator-section.has-value {
              border-color: #10b981;
              background: #ecfdf5;
              max-width: 160px;
            }

            .component-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 6px;
              font-weight: 500;
              flex-shrink: 0;
            }

            .component-content {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 45px;

              .placeholder-text {
                color: #9ca3af;
                font-style: italic;
                font-size: 14px;
                line-height: 1.3;
                word-break: break-word;
                text-align: center;
                padding: 2px;
              }

              .selected-text {
                color: #1f2937;
                font-weight: 500;
                font-size: 13px;
                line-height: 1.3;
                word-break: break-word;
                text-align: center;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                overflow: hidden;
                padding: 2px;
                font-weight: bold;
              }
            }
          }

          .formula-operator {
            background: #ececec;
            border: 1px solid #e5e7eb;
            border-radius: 50%;
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;

            &.has-value {
              border-color: #10b981;
              background: #ecfdf5;
              max-width: 160px;
            }

            .placeholder-text {
              color: #9ca3af;
              font-size: 12px;
              font-weight: 400;
              text-align: center;
              line-height: 1.2;
            }

            .operator-symbol {
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
            }
          }

          .formula-condition {
            background: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 6px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            min-height: 50px;
            flex-shrink: 0;

            .condition-symbol {
              font-size: 18px;
              font-weight: bold;
              border-color: #10b981;
            }

            .condition-value {
              font-size: 14px;
              font-weight: 600;
              white-space: nowrap;
            }
          }
        }
      }
    }

    // 配置面板
    .formula-config-panel {
      .config-card {
        background: #fff;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        &.numerator-card {
          border-left: 2px solid #10b981;
        }

        &.denominator-card {
          border-left: 2px solid #10b981;
        }

        &.operator-card {
          border-left: 2px solid #10b981;
        }

        &.condition-card {
          border-left: 2px solid #10b981;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .card-title {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
          }

          .card-badge {
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 12px;
            background: #dc2626;
            color: #fff;

            &.optional {
              background: #6b7280;
            }
          }
        }

        .card-content {
          :deep(.ant-select),
          :deep(.generic-tree-select) {
            width: 100%;
          }
        }
      }
    }

    // 结果预览
    .formula-result-preview {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      padding: 20px;
      margin-top: 24px;
      color: #fff;

      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .result-title {
          font-size: 16px;
          font-weight: 600;
        }
      }

      .result-content {
        .result-formula {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 16px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.1);
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 8px;
          backdrop-filter: blur(10px);
        }

        .result-description {
          font-size: 14px;
          opacity: 0.9;
          line-height: 1.5;
        }
      }
    }
  }

  // 保留原有的关系配置样式（如果其他地方还在使用）
  .relation-config {
    margin-top: 16px;
    padding: 16px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px dashed #d9d9d9;

    .formula-config {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;

      .formula-label {
        font-weight: 500;
        color: #333;
        white-space: nowrap;
        font-size: 14px;
      }

      .ant-select {
        min-width: 80px;
      }
    }

    .calculation-result {
      margin-top: 16px;
      padding: 12px;
      background: #e6f7ff;
      border: 1px solid #91d5ff;
      border-radius: 6px;

      .result-label {
        font-weight: 500;
        color: #0050b3;
        margin-bottom: 8px;
        font-size: 13px;
      }

      .result-formula {
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: #003a8c;
        font-weight: 600;
        background: #fff;
        padding: 8px 12px;
        border-radius: 4px;
        border: 1px solid #b7eb8f;
      }
    }
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
