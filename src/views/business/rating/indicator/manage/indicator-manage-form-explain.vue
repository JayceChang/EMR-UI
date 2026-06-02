<!--
  * 指标解读
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
              <h4>指标解读配置面板</h4>
            </div>
            <div class="header-right">
              <a-button type="text" size="small">
                <template #icon>
                  <DownOutlined v-if="sectionCollapsed.caliber" />
                  <UpOutlined v-else />
                </template>
              </a-button>
            </div>
          </div>

          <div v-show="!sectionCollapsed.caliber" class="section-content">

            <!-- 详细描述组 -->
            <div class="definition-group">
              <div class="group-title">详细描述</div>
              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-item label="指标定义" name="indicatorDefinition">
                    <a-textarea
                      v-model:value="form.indicatorDefinition"
                      placeholder="请详细描述指标的具体含义和计算方式"
                      :rows="3"
                      :maxlength="3000"
                      show-count
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-item label="指标说明" name="indicatorDescription">
                    <a-textarea
                      v-model:value="form.indicatorDescription"
                      placeholder="请输入指标的使用说明、注意事项等补充信息"
                      :rows="3"
                      :maxlength="3000"
                      show-count
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-item label="计算方法" name="indicatorCalculationMethod">
                    <a-textarea
                      v-model:value="form.indicatorCalculationMethod"
                      placeholder="请输入指标的计算方法"
                      :rows="3"
                      :maxlength="3000"
                      show-count
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-item label="指标注释" name="indicatorComment">
                    <a-textarea
                      v-model:value="form.indicatorComment"
                      placeholder="请输入指标的注释信息"
                      :rows="3"
                      :maxlength="3000"
                      show-count
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-item label="指标意义" name="indicatorMeaning">
                    <a-textarea
                      v-model:value="form.indicatorMeaning"
                      placeholder="请输入指标的意义"
                      :rows="3"
                      :maxlength="3000"
                      show-count
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </div>

            <!-- 法规依据组 -->
            <div class="definition-group">
              <div class="group-title">法规依据</div>
              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-item label="指标依据" name="indicatorBasis">
                    <a-textarea
                      v-model:value="form.indicatorBasis"
                      placeholder="请输入相关法规、标准、政策文件等依据"
                      :rows="4"
                      :maxlength="3000"
                      show-count
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-item label="佐证材料" name="indicatorSupportingDocuments">
                    <a-textarea
                      v-model:value="form.indicatorSupportingDocuments"
                      placeholder="请输入佐证材料"
                      :rows="4"
                      :maxlength="3000"
                      show-count
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
  import { reactive, ref, nextTick, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
  import { indicatorExplainManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-explain-api';
  import { useIndicatorForm } from '/@/composables/useIndicatorForm';

  const props = defineProps({
    indicatorId: {
      type: [String, Number],
      default: null,
    },
  });

  const emits = defineEmits(['dataLoaded', 'dataChanged', 'validationChanged']);

  const loading = ref(false);

  // 区域折叠状态
  const sectionCollapsed = reactive({
    caliber: false,
  });

  const formDefault = {
    id: undefined, // 指标解读配置ID
    indicatorId: undefined, // 指标ID
    indicatorDefinition: undefined, // 指标定义
    indicatorDescription: undefined, // 指标说明
    indicatorCalculationMethod: undefined, // 计算方法
    indicatorComment: undefined, // 指标注释
    indicatorMeaning: undefined, // 指标意义
    indicatorBasis: undefined, // 指标依据
    indicatorSupportingDocuments: undefined, // 佐证材料
  };

  // 指标解读数据
  const explainData = ref({});
  const dataLoading = ref(false);

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



  // 表单校验规则
  const rules = {
    indicatorDefinition: [{ max: 3000, message: '指标定义不能超过500个字符' }],
    indicatorDescription: [{ max: 3000, message: '指标说明不能超过500个字符' }],
    indicatorCalculationMethod: [{ max: 3000, message: '计算方法不能超过500个字符' }],
    indicatorComment: [{ max: 3000, message: '指标注释不能超过500个字符' }],
    indicatorMeaning: [{ max: 3000, message: '指标意义不能超过500个字符' }],
    indicatorBasis: [{ max: 3000, message: '指标依据不能超过1000个字符' }],
    indicatorSupportingDocuments: [{ max: 3000, message: '佐证材料不能超过1000个字符' }],
  };

  // 监听表单变化，向父组件发送数据
  watch(
    form,
    (newForm) => {
      emits('update:modelValue', { ...newForm });
      emits('change', { ...newForm });
    },
    { deep: true }
  );

  // 监听props变化
  watch(
    () => props.modelValue,
    (newValue) => {
      console.log('=== 表单组件接收到props变化 ===');
      console.log('newValue:', newValue);
      console.log('当前form:', { ...form });

      if (newValue) {
        // 清空form后再赋值，确保数据同步
        Object.keys(form).forEach((key) => {
          form[key] = undefined;
        });
        Object.assign(form, newValue);

        console.log('更新后的form:', { ...form });
      }
    },
    { deep: true, immediate: true }
  );



  // 获取指标解读数据
  const loadExplainData = async (indicatorId) => {
    if (!indicatorId) {
      console.log('[IndicatorFormExplain] 无指标ID，重置表单');
      resetFormData();
      return;
    }

    try {
      dataLoading.value = true;
      console.log('[IndicatorFormExplain] 开始获取指标解读数据:', indicatorId);

      const response = await indicatorExplainManageApi.queryIndicatorExplainById(indicatorId);

      if (response && response.data) {
        console.log('[IndicatorFormExplain] 获取到指标解读数据:', response.data);
        explainData.value = response.data;
        setFormData(response.data);
        emits('dataLoaded', response.data);
      } else {
        console.log('[IndicatorFormExplain] 未找到指标解读数据，显示空表单');
        explainData.value = {};
        resetFormData();
        // 设置指标ID
        form.indicatorId = indicatorId;
      }
    } catch (error) {
      console.error('[IndicatorFormExplain] 获取指标解读数据失败:', error);
      explainData.value = {};
      resetFormData();
      // 设置指标ID
      form.indicatorId = indicatorId;
    } finally {
      dataLoading.value = false;
    }
  };

  // 监听指标ID变化，获取解读数据
  watch(
    () => props.indicatorId,
    (newIndicatorId) => {
      console.log('[IndicatorFormExplain] 指标ID变化:', newIndicatorId);
      loadExplainData(newIndicatorId);
    },
    { immediate: true }
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
    nextTick(() => {
      if (formRef.value) {
        formRef.value.clearValidate();
      }
    });
  };

  // 验证当前tab的字段
  const validateExplainFields = async () => {
    if (!formRef.value) {
      console.warn('[IndicatorFormExplain] formRef 未初始化');
      return false;
    }

    // 定义explain页面需要验证的字段
    const explainFields = [
      'indicatorDefinition',
      'indicatorDescription',
      'indicatorCalculationMethod',
      'indicatorComment',
      'indicatorMeaning',
      'indicatorBasis',
      'indicatorSupportingDocuments'
    ];

    try {
      await formRef.value.validateFields(explainFields);
      console.log('[IndicatorFormExplain] explain字段验证通过');
      return true;
    } catch (error) {
      console.log('[IndicatorFormExplain] explain字段验证失败:', error);
      return false;
    }
  };

  // 保存方法 - 根据 indicatorId 决定新增还是更新
  const save = async () => {
    try {
      // 先验证当前tab的表单字段
      const isValid = await validateExplainFields();
      if (!isValid) {
        throw new Error('表单验证失败，请检查填写内容');
      }

      const formData = getFormData();

      // 确保指标ID存在
      if (!formData.indicatorId && props.indicatorId) {
        formData.indicatorId = props.indicatorId;
      }

      console.log('[IndicatorFormExplain] 开始保存:', formData);

      let result;
      if (formData.id) {
        // 编辑模式 - 有解读配置ID
        console.log('[IndicatorFormExplain] 执行更新操作');
        result = await indicatorExplainManageApi.update(formData);
        message.success('更新指标解读信息成功');
      } else {
        // 新增模式 - 无解读配置ID
        console.log('[IndicatorFormExplain] 执行新增操作');
        result = await indicatorExplainManageApi.add(formData);
        message.success('新增指标解读信息成功');

        // 新增成功后，更新表单中的 ID
        if (result && result.data && result.data.id) {
          form.id = result.data.id;
          explainData.value = { ...formData, id: result.data.id };
          emits('dataChanged', getFormData());
        }
      }

      console.log('[IndicatorFormExplain] 保存成功:', result);
      return result;
    } catch (error) {
      console.error('[IndicatorFormExplain] 保存失败:', error);
      message.error(error.message || '保存指标解读信息失败');
      throw error;
    }
  };

  // 切换区域折叠状态
  const toggleSection = (sectionName) => {
    sectionCollapsed[sectionName] = !sectionCollapsed[sectionName];
  };

  defineExpose({
    validate: validateExplainFields, // 使用专门的explain字段验证方法
    validateExplainFields, // 暴露专门的验证方法
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
