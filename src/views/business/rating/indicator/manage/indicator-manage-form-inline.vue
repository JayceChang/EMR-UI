<!--
  * 指标定义表单 - 内联版本（用于步骤页面）
  *
  * @Author:    Jayce
  * @Date:      2025-06-25
  * @Copyright  ZDS
-->
<template>
  <div>
    <a-spin :spinning="loading">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="indicator-form">
        <!-- 定义信息区域 -->
        <div class="config-section">
          <div class="section-header" @click="toggleSection('caliber')">
            <div class="header-left">
              <h4>基本信息配置面板</h4>
            </div>
            <div class="header-right">
              <a-space>
                <a-button type="text" size="small">
                  <template #icon>
                    <DownOutlined v-if="sectionCollapsed.caliber" />
                    <UpOutlined v-else />
                  </template>
                </a-button>
              </a-space>
            </div>
          </div>

          <div v-show="!sectionCollapsed.caliber" class="section-content">
            <!-- 基本属性组 -->
            <div class="definition-group">
              <div class="group-title">基本属性</div>

              <!-- 第一行：指标名称、指标编码 -->
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="指标名称" name="indicatorName">
                    <a-input v-model:value="form.indicatorName" placeholder="请输入指标名称" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="指标编码" name="indicatorCode" :validate-status="codeValidateStatus" :help="codeValidateMessage">
                    <a-input v-model:value="form.indicatorCode" placeholder="请输入指标编码" @blur="handleCodeBlur" @input="handleCodeInput">
                      <template #suffix>
                        <LoadingOutlined v-if="codeChecking" style="color: #1890ff" />
                        <CheckCircleOutlined v-else-if="codeValidateStatus === 'success'" style="color: #52c41a" />
                        <CloseCircleOutlined v-else-if="codeValidateStatus === 'error'" style="color: #f5222d" />
                      </template>
                    </a-input>
                  </a-form-item>
                </a-col>
              </a-row>

              <!-- 第二行：指标类型、目录层级 -->
              <a-row :gutter="16">
                <!-- <a-col :span="12">
                  <a-form-item label="目录层级" name="isRoot">
                    <a-switch
                      v-model:checked="isRoot"
                      :checkedValue="true"
                      :unCheckedValue="false"
                      checked-children="根目录"
                      un-checked-children="子目录"
                      @change="handleSwitchIsRoot"
                    />
                  </a-form-item>
                </a-col> -->
                <a-col :span="12" v-show="!isRoot">
                  <a-form-item label="上级指标目录" name="parentId">
                    <GenericTreeSelect
                      v-model:value="form.parentId"
                      :apiFunc="indicatorManageApi.queryIndicatorTree"
                      :apiParams="true"
                      :fieldNames="{ label: 'indicatorName', value: 'id', key: 'id', children: 'children' }"
                      placeholder="请选择上级指标目录"
                      treeDefaultExpandAll
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="指标类型" name="indicatorType">
                    <SmartEnumSelect width="100%" v-model:value="form.indicatorType" enum-name="INDICATOR_TYPE_ENUM" placeholder="请选择指标类型" />
                  </a-form-item>
                </a-col>
              </a-row>

              <!-- 第三行：上级指标目录（条件显示）、序号 -->
              <!-- <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="序号" name="sort">
                    <a-input-number style="width: 100%" v-model:value="form.sort" placeholder="请输入序号" :min="0" />
                  </a-form-item>
                </a-col>
              </a-row> -->

              <!-- 第四行：指标导向、计量单位 -->
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="指标导向" name="indicatorOrientation">
                    <SmartEnumSelect
                      width="100%"
                      v-model:value="form.indicatorOrientation"
                      enum-name="INDICATOR_ORIENTATION_ENUM"
                      placeholder="请选择指标导向"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="计量单位" name="measurementUnit">
                    <SmartEnumSelect width="100%" v-model:value="form.measurementUnit" enum-name="INDICATOR_UNIT_ENUM" placeholder="请选择计量单位" />
                  </a-form-item>
                </a-col>
              </a-row>

              <!-- 第四行：定量/定性指标、指标采信属性 -->
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="定量/定性指标" name="indicatorProperty">
                    <SmartEnumSelect
                      width="100%"
                      v-model:value="form.indicatorProperty"
                      enum-name="INDICATOR_PROPERTY_ENUM"
                      placeholder="请选择定量/定性指标类型"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="指标采信属性" name="indicatorAccept">
                    <SmartEnumSelect
                      width="100%"
                      v-model:value="form.indicatorAccept"
                      enum-name="INDICATOR_CAIXIN_ENUM"
                      placeholder="请选择指标采信属性"
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <!-- 第四行：指标采集方式、指标分类 -->
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="指标采集方式" name="indicatorFetchType">
                    <SmartEnumSelect
                      width="100%"
                      v-model:value="form.indicatorFetchType"
                      enum-name="INDICATOR_FETCH_TYPE_ENUM"
                      placeholder="请选择指标采集方式"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="指标分类" name="indicatorCategory">
                    <SmartEnumSelect
                      width="100%"
                      v-model:value="form.indicatorCategory"
                      enum-name="INDICATOR_CATEGORY_ENUM"
                      placeholder="请选择指标分类"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
               <!-- 第四行：国家监测指标、指标分类 -->
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="国家监测指标" name="countryMonitorFlag">
                    <SmartEnumSelect
                      width="100%"
                      v-model:value="form.countryMonitorFlag"
                      enum-name="FLAG_NUMBER_ENUM"
                      placeholder="请选择指标是否国家监测指标"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="判定指标" name="judgeFlag">
                    <SmartEnumSelect
                      width="100%"
                      v-model:value="form.judgeFlag"
                      enum-name="FLAG_NUMBER_ENUM"
                      placeholder="请选择指标是否判定指标"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              <!--空行占位符-->
            <div style="height: 20px;"></div>
              <div class="group-title">指标状态</div>
               <!-- 第五行：启用状态、开展状态 -->
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="启用状态" name="disabledFlag">
                    <a-switch
                      v-model:checked="form.disabledFlag"
                      :checkedValue="1"
                      :unCheckedValue="2"
                      checked-children="启用"
                      un-checked-children="禁用"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="开展状态" name="developmentStatus">
                    <a-switch
                      v-model:checked="form.developmentStatus"
                      :checkedValue="1"
                      :unCheckedValue="2"
                      checked-children="已开展"
                      un-checked-children="未开展"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
          </div>
        </div>
      </a-form>
    </a-spin>
  </div>
</template>

<script setup>
  import { reactive, ref, nextTick, watch, toRef } from 'vue';
  import _ from 'lodash';
  import { message } from 'ant-design-vue';
  import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue';
  import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
  import SmartEnumSelect from '/@/components/framework/smart-enum-select/index.vue';
  import GenericTreeSelect from '/@/components/business/common/tree-select/generic-tree-select.vue';
  import { useIndicatorData } from '/@/composables/useIndicatorData';
  import { useIndicatorForm, formRules } from '/@/composables/useIndicatorForm';

  const props = defineProps({
    indicatorId: {
      type: [String, Number],
      default: null,
    },
  });

  const emits = defineEmits(['dataLoaded', 'dataChanged', 'validationChanged']);

  const loading = ref(false);
  const isRoot = ref(false);

  // 区域折叠状态
  const sectionCollapsed = reactive({
    caliber: false,
  });

  // 指标编码验证相关
  const codeChecking = ref(false);
  const codeValidateStatus = ref('');
  const codeValidateMessage = ref('');
  const codeCheckTimer = ref(null);

  const formDefault = {
    id: undefined,
    indicatorName: undefined,
    indicatorCode: undefined,
    indicatorType: undefined,
    disabledFlag: 1,
    sort: undefined,
    remark: undefined,
    parentId: undefined,
    developmentStatus: 1, //开展状态 1:已开展 2：未开展
    countryMonitorFlag: 0, //是否国家监测指标
    // 定义信息字段
    indicatorOrientation: undefined, // 指标导向
    measurementUnit: undefined, // 计量单位
    indicatorProperty: undefined,//指标属性：定量 or 定性指标
    indicatorAccept: undefined, // 指标采信属性
    indicatorFetchType: undefined, // 指标采集类型
    indicatorCategory: undefined, // 指标分类
    judgeFlag: 0, // 是否判定指标
  };

  // 使用新的数据管理 composable
  const indicatorIdRef = toRef(props, 'indicatorId');
  const { data: indicatorData, loading: dataLoading, isAddMode } = useIndicatorData(indicatorIdRef);

  // 使用新的表单管理 composable
  const {
    formRef,
    form,
    isValid,
    resetForm: resetFormData,
    setFormData,
    getFormData
  } = useIndicatorForm(formDefault, {}, (formData) => {
    // 表单数据变化时的回调
    emits('dataChanged', formData);
  });

  // 处理默认根目录
  const handleDefaultParentIdValue = () => {
    if (form.parentId == 0) {
      isRoot.value = true;
    } else {
      isRoot.value = false;
    }
  };

  // 处理切换是否根目录
  const handleSwitchIsRoot = () => {
    if (isRoot.value) {
      form.parentId = 0;
    } else {
      form.parentId = undefined;
    }
    handleDefaultParentIdValue();
  };

  // 表单校验规则
  const rules = {
    indicatorName: [{ required: true, message: '指标名称必填' }],
    indicatorCode: [
      { required: true, message: '指标编码必填' },
      {
        validator: async (rule, value) => {
          if (!value || value.trim() === '') {
            return Promise.resolve();
          }
          if (codeValidateStatus.value === 'error') {
            return Promise.reject(new Error(codeValidateMessage.value));
          }
          return Promise.resolve();
        },
        trigger: 'blur',
      },
    ],
    indicatorType: [{ required: true, message: '指标类型必选' }],
    disabledFlag: [{ required: true, message: '启用状态必选' }],
    sort: [{ required: false, type: 'number', message: '序号必须是数字' }],
    parentId: [{ required: true, message: '上级目录必选' }],
    developmentStatus: [
      { required: true, message: '开展状态必选' },
      {
        validator: async (rule, value) => {
          console.log('[验证调试] developmentStatus 当前值:', value, '类型:', typeof value);
          if (value === undefined || value === null || value === '') {
            return Promise.reject(new Error('开展状态必选'));
          }
          // 确保值是有效的开展状态值（1 或 2）
          if (value !== 1 && value !== 2) {
            return Promise.reject(new Error('开展状态值无效'));
          }
          return Promise.resolve();
        },
        trigger: 'change',
      },
    ],
    countryMonitorFlag: [{ required: false,message: '是否国家监测指标必选' }],
    // 定义信息字段验证规则
    indicatorOrientation: [{ required: true }],
    measurementUnit: [{ required: true }],
    indicatorProperty: [{ required: false }],
    indicatorAccept: [{ required: false }],
    indicatorFetchType: [{ required: true }],
    indicatorCategory: [{ required: true }],
    judgeFlag: [{ required: true }],
  };



  // 编码验证相关方法
  function resetCodeValidation() {
    codeChecking.value = false;
    codeValidateStatus.value = '';
    codeValidateMessage.value = '';
    if (codeCheckTimer.value) {
      clearTimeout(codeCheckTimer.value);
      codeCheckTimer.value = null;
    }
  }

  function handleCodeInput() {
    if (codeCheckTimer.value) {
      clearTimeout(codeCheckTimer.value);
    }

    codeValidateStatus.value = '';
    codeValidateMessage.value = '';

    if (!form.indicatorCode || form.indicatorCode.trim() === '') {
      return;
    }

    codeCheckTimer.value = setTimeout(() => {
      checkIndicatorCode();
    }, 500);
  }

  function handleCodeBlur() {
    if (codeCheckTimer.value) {
      clearTimeout(codeCheckTimer.value);
      codeCheckTimer.value = null;
    }

    if (form.indicatorCode && form.indicatorCode.trim() !== '') {
      checkIndicatorCode();
    }
  }

  async function checkIndicatorCode() {
    const code = form.indicatorCode?.trim();
    if (!code) {
      resetCodeValidation();
      return;
    }

    codeChecking.value = true;
    codeValidateStatus.value = '';
    codeValidateMessage.value = '';

    try {
      const response = await indicatorManageApi.checkIndicatorCodeExists(code, form.id);

      if (response && response.data) {
        const exists = response.data.exists;

        if (exists) {
          codeValidateStatus.value = 'error';
          codeValidateMessage.value = '该指标编码已存在，请使用其他编码';
        } else {
          codeValidateStatus.value = 'success';
          codeValidateMessage.value = '指标编码可用';
        }
      }
    } catch (error) {
      console.error('检查指标编码失败:', error);
      codeValidateStatus.value = 'warning';
      codeValidateMessage.value = '检查编码时发生错误，请稍后重试';
    } finally {
      codeChecking.value = false;
    }
  }

  // 监听指标数据变化，自动填充表单
  watch(
    () => indicatorData.value,
    (newData) => {
      if (newData && Object.keys(newData).length > 0) {
        console.log('[IndicatorFormInline] 接收到指标数据:', newData);
        console.log('[IndicatorFormInline] 数据中的 developmentStatus:', newData.developmentStatus);
        setFormData(newData);
        console.log('[IndicatorFormInline] 设置数据后 form.developmentStatus:', form.developmentStatus);
        handleDefaultParentIdValue();
        emits('dataLoaded', newData);
      } else if (isAddMode.value) {
        console.log('[IndicatorFormInline] 新增模式，重置表单');
        resetFormData();
        console.log('[IndicatorFormInline] 重置后 form.developmentStatus:', form.developmentStatus);
        resetCodeValidation();
      }
    },
    { deep: true, immediate: true }
  );

  // 监听表单验证状态变化
  watch(
    () => isValid.value,
    (valid) => {
      emits('validationChanged', valid, getFormData());
    }
  );

  // 重置表单的包装函数
  const resetForm = () => {
    resetFormData();
    resetCodeValidation();
    nextTick(() => {
      if (formRef.value) {
        formRef.value.clearValidate();
      }
    });
  };

  // 验证当前tab的字段
  const validateBasicFields = async () => {
    if (!formRef.value) {
      console.warn('[IndicatorFormInline] formRef 未初始化');
      return false;
    }

    console.log('[IndicatorFormInline] 验证前 form.developmentStatus:', form.developmentStatus);
    console.log('[IndicatorFormInline] 验证前完整表单数据:', { ...form });

    // 定义基础信息页面需要验证的字段
    const basicFields = [
      'indicatorName',
      'indicatorCode',
      'indicatorType',
      'disabledFlag',
      'sort',
      'parentId',
      'developmentStatus',
      'countryMonitorFlag',
      'indicatorOrientation',
      'measurementUnit',
      'indicatorProperty',
      'indicatorAccept',
      'indicatorFetchType',
      'indicatorCategory',
      'judgeFlag'
    ];

    try {
      await formRef.value.validateFields(basicFields);
      console.log('[IndicatorFormInline] 基础信息字段验证通过');
      return true;
    } catch (error) {
      console.log('[IndicatorFormInline] 基础信息字段验证失败:', error);
      return false;
    }
  };

  // 保存方法 - 根据 indicatorId 决定新增还是更新
  const save = async () => {
    try {
      // 先验证当前tab的表单字段
      const isValid = await validateBasicFields();
      if (!isValid) {
        throw new Error('表单验证失败，请检查填写内容');
      }

      const formData = getFormData();
      console.log('[IndicatorFormInline] 开始保存:', formData);

      let result;
      if (props.indicatorId && formData.id) {
        // 编辑模式
        console.log('[IndicatorFormInline] 执行更新操作');
        result = await indicatorManageApi.update(formData);
        message.success('更新指标基本信息成功');
      } else {
        // 新增模式
        console.log('[IndicatorFormInline] 执行新增操作');
        result = await indicatorManageApi.add(formData);
        message.success('新增指标基本信息成功');

        // 新增成功后，更新表单中的 ID
        if (result && result.data) {
          form.id = result.data;
          emits('dataChanged', getFormData());
        }
      }

      console.log('[IndicatorFormInline] 保存成功:', result);
      return result;
    } catch (error) {
      console.error('[IndicatorFormInline] 保存失败:', error);
      message.error(error.message || '保存指标基本信息失败');
      throw error;
    }
  };

  // 切换区域折叠状态
  const toggleSection = (sectionName) => {
    sectionCollapsed[sectionName] = !sectionCollapsed[sectionName];
  };

  defineExpose({
    validate: validateBasicFields, // 使用专门的基础信息字段验证方法
    validateBasicFields, // 暴露专门的验证方法
    resetForm,
    getFormData,
    save,
    form,
  });
</script>

<style lang="less" scoped>
  .indicator-form {
    position: relative;
  }

  .ant-form-item {
    margin: 2px 0;

    // 表单标签样式优化
    :deep(.ant-form-item-label) {
      > label {
        font-weight: 500;
        color: #262626;

        &::after {
          content: '';
        }
      }
    }

    // 输入框样式优化
    :deep(.ant-input),
    :deep(.ant-select-selector),
    :deep(.ant-input-number) {
      border-radius: 6px;
      transition: all 0.3s ease;

      &:hover {
        border-color: #009688;
      }

      &:focus,
      &:focus-within {
        border-color: #009688;
        box-shadow: 0 0 0 2px rgba(0, 150, 136, 0.1);
      }
    }
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
      padding: 20px;
      background: #fff;
      display: flex;
      flex-direction: column;
    }
  }

  // 定义信息分组样式
  .definition-group {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .group-title {
      font-size: 14px;
      font-weight: 600;
      color: #007069;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e6f7ff;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        bottom: -2px;
        width: 40px;
        height: 2px;
        background: #009688;
      }
    }

    .ant-form-item {
      margin-bottom: 16px;
      padding-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  // 空白区域样式
  .empty-section {
    padding: 40px 0;
    text-align: center;
  }

  // 指标编码验证样式 - 只针对指标编码字段
  :deep(.ant-form-item[name='indicatorCode']) {
    &.ant-form-item-has-success .ant-input {
      border-color: #52c41a;
      box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
    }

    &.ant-form-item-has-error .ant-input {
      border-color: #ff4d4f;
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
    }

    &.ant-form-item-has-warning .ant-input {
      border-color: #faad14;
      box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.2);
    }

    // 验证消息样式
    .ant-form-item-explain {
      font-size: 12px;
      margin-top: 4px;
    }

    // 成功状态的help文本样式
    &.ant-form-item-has-success .ant-form-item-explain {
      color: #52c41a;
    }

    // 错误状态的help文本样式
    &.ant-form-item-has-error .ant-form-item-explain {
      color: #ff4d4f;
    }

    // 警告状态的help文本样式
    &.ant-form-item-has-warning .ant-form-item-explain {
      color: #faad14;
    }
  }

  // 输入框后缀图标动画
  .ant-input-suffix {
    .anticon {
      transition: all 0.3s ease;
    }

    .anticon-loading {
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

</style>
