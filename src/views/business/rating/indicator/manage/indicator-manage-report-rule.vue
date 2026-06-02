<!--
  * 指标填报规则配置
  *
  * @Author:    Jayce
  * @Date:      2025-01-11
  * @Copyright  ZDS
-->
<template>
  <div>
    <a-spin :spinning="loading">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="report-rule-form">
        <!-- 填报规则配置区域 -->
        <div class="config-section">
          <div class="section-header" @click="toggleSection('reportRule')">
            <div class="header-left">
              <h4>填报规则配置面板</h4>
            </div>
            <div class="header-right">
              <a-space>
                <a-button type="text" size="small">
                  <template #icon>
                    <DownOutlined v-if="sectionCollapsed.reportRule" />
                    <UpOutlined v-else />
                  </template>
                </a-button>
              </a-space>
            </div>
          </div>

          <div v-show="!sectionCollapsed.reportRule" class="section-content">
            <!-- 填报规则配置组 -->
            <div class="rule-group">
              <div class="group-title">填报规则</div>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="填报维度" name="reportDimension">
                    <SmartEnumSelect 
                      v-model:value="form.reportDimension" 
                      enum-name="REPORT_DIMENSION_ENUM"
                      placeholder="请选择"
                      width="100%"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="汇总方式" name="aggregatedType">
                    <SmartEnumSelect 
                      v-model:value="form.aggregatedType" 
                      enum-name="AGGREGATION_METHOD_ENUM"
                      placeholder="请选择"
                      width="100%"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row>
                <a-col :span="24">
                  <a-form-item label="说明" name="reportDesc">
                    <a-textarea 
                      v-model:value="form.reportDesc" 
                      placeholder="请输入详细的填报规则说明..."
                      :rows="4"
                      :maxlength="500"
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
  import { reactive, ref, nextTick, watch, toRef } from 'vue';
  import { message } from 'ant-design-vue';
  import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
  import { indicatorReportRuleManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-report-rule.js';
  import SmartEnumSelect from '/@/components/framework/smart-enum-select/index.vue';
  import { useIndicatorData } from '/@/composables/useIndicatorData';
  import { useIndicatorForm } from '/@/composables/useIndicatorForm';

  const props = defineProps({
    indicatorId: {
      type: [String, Number],
      default: null,
    },
  });

  const emits = defineEmits(['dataLoaded', 'dataChanged', 'validationChanged']);

  // 表单默认值
  const formDefault = {
    id: null,
    indicatorId: null,
    reportDimension: undefined,
    aggregatedType: undefined,
    reportDesc: '',
  };

  // 表单验证规则
  const rules = {
    reportDimension: [
      { required: true, message: '请选择填报维度', trigger: 'change' }
    ],
    aggregatedType: [
      { required: true, message: '请选择汇总方式', trigger: 'change' }
    ],
  };

  // 状态管理
  const loading = ref(false);
  const saving = ref(false);

  // 折叠状态
  const sectionCollapsed = reactive({
    reportRule: false,
  });

  // 切换折叠状态
  const toggleSection = (section) => {
    sectionCollapsed[section] = !sectionCollapsed[section];
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
  } = useIndicatorForm(formDefault, rules, (formData) => {
    // 表单数据变化时的回调
    emits('dataChanged', formData);
  });

  // 加载填报规则配置
  const loadReportRule = async (indicatorId) => {
    if (!indicatorId) {
      resetFormData();
      return;
    }
    
    loading.value = true;
    try {
      console.log('[IndicatorReportRule] 开始加载填报规则配置:', indicatorId);
      const result = await indicatorReportRuleManageApi.queryIndicatorReportRuleById(indicatorId);
      
      if (result.ok && result.data) {
        console.log('[IndicatorReportRule] 加载到填报规则配置:', result.data);
        setFormData(result.data);
        emits('dataLoaded', result.data);
      } else {
        console.log('[IndicatorReportRule] 未找到填报规则配置，使用默认值');
        resetFormData();
        form.indicatorId = indicatorId;
      }
    } catch (error) {
      console.error('[IndicatorReportRule] 加载填报规则配置失败:', error);
      message.error('加载填报规则配置失败');
      resetFormData();
    } finally {
      loading.value = false;
    }
  };

  // 监听指标ID变化
  watch(
    () => props.indicatorId,
    (newIndicatorId) => {
      if (newIndicatorId) {
        loadReportRule(newIndicatorId);
      } else {
        resetFormData();
      }
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

  // 验证表单
  const validate = async () => {
    try {
      await formRef.value?.validateFields();
      return true;
    } catch (error) {
      console.error('[IndicatorReportRule] 表单验证失败:', error);
      return false;
    }
  };

  // 保存方法 - 根据 indicatorId 决定新增还是更新
  const save = async () => {
    try {
      // 先验证表单
      const isValid = await validate();
      if (!isValid) {
        throw new Error('表单验证失败，请检查填写内容');
      }

      const formData = getFormData();
      console.log('[IndicatorReportRule] 开始保存:', formData);

      // 确保 indicatorId 正确
      if (props.indicatorId) {
        formData.indicatorId = props.indicatorId;
      }

      let result;
      if (formData.id) {
        // 编辑模式
        console.log('[IndicatorReportRule] 执行更新操作');
        result = await indicatorReportRuleManageApi.update(formData);
        message.success('更新填报规则成功');
      } else {
        // 新增模式
        console.log('[IndicatorReportRule] 执行新增操作');
        result = await indicatorReportRuleManageApi.add(formData);
        message.success('新增填报规则成功');

        // 新增成功后，更新表单中的 ID
        if (result && result.data && result.data.id) {
          form.id = result.data.id;
          emits('dataChanged', getFormData());
        }
      }

      return result;
    } catch (error) {
      console.error('[IndicatorReportRule] 保存失败:', error);
      message.error(error.message || '保存指标填报规则信息失败');
      throw error;
    }
  };

  // 暴露方法给父组件
  defineExpose({
    loadReportRule,
    resetForm,
    form,
    getFormData: () => ({ ...form }),
    save,
    validate,
  });
</script>

<style lang="less" scoped>

  .report-rule-form {
    padding: 0;
  }

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
    }

    .section-content {
      padding: 16px;
      font-weight:500;
    }
  }

  .rule-group {
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
  }
</style>
