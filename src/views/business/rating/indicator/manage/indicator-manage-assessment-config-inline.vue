<!--
  * 指标自评配置表单 - 内联版本（用于步骤页面）
  *
  * @Author:    Jayce
  * @Date:      2025-07-11
  * @Copyright  ZDS
-->
<template>
  <div>
    <a-spin :spinning="loading">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="indicator-form">
        <!-- 自评配置区域 -->
        <div class="config-section">
          <div class="section-header" @click="toggleSection('assessment')">
            <div class="header-left">
              <h4>自评配置面板</h4>
            </div>
            <div class="header-right">
              <a-space>
                <a-button type="text" size="small">
                  <template #icon>
                    <DownOutlined v-if="sectionCollapsed.assessment" />
                    <UpOutlined v-else />
                  </template>
                </a-button>
              </a-space>
            </div>
          </div>

          <div v-show="!sectionCollapsed.assessment" class="section-content">
            <!-- 基本配置组 -->
            <div class="definition-group">
              <div class="group-title">基本配置</div>

              <!-- 第一行：自评类型、判定规则 -->
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="自评类型" name="assessmentType">
                    <SmartEnumSelect width="100%" v-model:value="form.assessmentType" enum-name="ASSESSMENT_TYPE_ENUM" placeholder="请选择自评类型" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="判定规则" name="judgeRule">
                    <SmartEnumSelect width="100%" v-model:value="form.judgeRule" enum-name="JUDGMENT_RULE_ENUM" placeholder="请选择判定规则" />
                  </a-form-item>
                </a-col>
              </a-row>

              <!-- 第二行：满分值、权重 -->
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="满分值" name="fullScoreValue">
                    <a-input-number
                      style="width: 100%"
                      v-model:value="form.fullScoreValue"
                      placeholder="请输入满分值"
                      :min="0"
                      :max="1000"
                      :precision="2"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="权重" name="assessmentWeight">
                    <a-input-number
                      style="width: 100%"
                      v-model:value="form.assessmentWeight"
                      placeholder="请输入权重"
                      :min="0"
                      :max="100"
                      :precision="2"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </div>

            <!-- 判定公式组 -->
            <div class="definition-group">
              <div class="group-title">
                判定公式
                <a-button type="primary" size="small" @click="addFormula" style="margin-left: 16px">
                  <template #icon><PlusOutlined /></template>
                  添加
                </a-button>
              </div>

              <!-- 判定公式表格 -->
              <a-table :columns="formulaColumns" :data-source="form.formulas" :pagination="false" size="small" bordered class="formula-table">
                <template #bodyCell="{ column, record, index }">
                  <template v-if="column.key === 'sequence'">
                    {{ index + 1 }}
                  </template>
                  <template v-else-if="column.key === 'assessmentFormula'">
                    <a-form-item
                      :name="['formulas', index, 'assessmentFormula']"
                      :rules="[{ required: true, message: '请输入公式', trigger: ['blur', 'change'] }]"
                    >
                      <FormulaEditor
                        v-model="record.assessmentFormula"
                        :variables="formulaVariables"
                        placeholder="请配置判定公式，如：ACTUAL_VALUE >= 80"
                      />
                    </a-form-item>
                  </template>
                  <template v-else-if="column.key === 'resultValue' && form.assessmentType == 1">
                    <a-form-item :name="['formulas', index, 'resultValue']" :rules="[{ required: true, message: '请输入结果值', trigger: 'blur' }]">
                      <a-input-number v-model:value="record.resultValue" placeholder="请输入结果值" :min="0" :precision="2" style="width: 100%" />
                    </a-form-item>
                  </template>
                  <template v-else-if="column.key === 'resultValue' && form.assessmentType == 2">
                    <a-form-item
                      :name="['formulas', index, 'resultValue']"
                      :rules="[{ required: true, message: '请选择是否符合', trigger: 'change' }]"
                    >
                      <SmartEnumSelect
                        width="100%"
                        v-model:value="record.resultValue"
                        enum-name="FORMULA_RESULT_SELECT_ENUM"
                        placeholder="请选择是否符合"
                      />
                    </a-form-item>
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-button type="text" danger size="small" @click="removeFormula(index)" :disabled="form.formulas.length <= 1">
                      <template #icon><DeleteOutlined /></template>
                      删除
                    </a-button>
                  </template>
                </template>
              </a-table>
            </div>

            <!-- 规则说明组 -->
            <div class="definition-group">
              <div class="group-title">规则说明</div>
              <a-form-item name="assessmentDesc">
                <a-textarea v-model:value="form.assessmentDesc" placeholder="请输入规则说明内容..." :rows="4" :maxlength="1000" show-count />
              </a-form-item>
            </div>
          </div>
        </div>
      </a-form>
    </a-spin>
  </div>
</template>

<script setup>
  import { reactive, ref, nextTick, watch, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { DownOutlined, UpOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { indicatorAssessmentConfigApi } from '/@/api/business/rating/indicator/manage/indicator-manage-assessment-config-api';
  import SmartEnumSelect from '/@/components/framework/smart-enum-select/index.vue';
  import FormulaEditor from '/@/components/business/formula-editor/FormulaEditor.vue';
  import { smartSentry } from '/@/lib/smart-sentry';

  const props = defineProps({
    indicatorId: {
      type: [String, Number],
      default: null,
    },
  });

  const emits = defineEmits(['dataLoaded', 'dataChanged', 'validationChanged']);

  const loading = ref(false);
  const saving = ref(false);

  // 区域折叠状态
  const sectionCollapsed = reactive({
    assessment: false,
  });

  // 表单引用
  const formRef = ref();

  // 表单默认数据
  const formDefault = {
    id: undefined,
    indicatorId: undefined,
    assessmentType: undefined, // 自评类型
    fullScoreValue: undefined, // 满分值
    assessmentWeight: undefined, // 权重
    judgeRule: undefined, // 判定规则
    formulas: undefined, // 判定公式数组，默认一行
    assessmentDesc: undefined, // 规则说明
  };

  // 表单数据
  const form = reactive({ ...formDefault });

  // 表单验证规则
  const rules = {
    assessmentType: [{ required: true, message: '请选择自评类型', trigger: 'change' }],
    judgeRule: [{ required: true, message: '请选择判定规则', trigger: 'change' }],
  };

  // 判定公式表格列定义
  const formulaColumns = [
    {
      title: '序号',
      key: 'sequence',
      width: 80,
      align: 'center',
    },
    {
      title: '判定公式',
      key: 'assessmentFormula',
      width: 450,
    },
    {
      title: '结果',
      key: 'resultValue',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
    },
  ];

  // 公式编辑器可用变量
  const formulaVariables = [
    // { label: '判定值', value: 'JUDGE_SCORE', desc: '判定值' },
    // { label: '满分值', value: 'FULL_SCORE', desc: '指标设定的满分值' },
    // { label: '权重', value: 'assessmentWeight', desc: '指标的权重系数' },
    { label: '实际值', value: 'ACTUAL_VALUE', desc: '指标的实际测量值' },
    // { label: '目标值', value: 'TARGET_VALUE', desc: '指标的目标值' },
    // { label: '基准值', value: 'BASELINE_VALUE', desc: '指标的基准值' },
  ];

  // 切换区域折叠状态
  const toggleSection = (section) => {
    sectionCollapsed[section] = !sectionCollapsed[section];
  };

  // 添加判定公式
  const addFormula = () => {
    form.formulas.push({ assessmentFormula: '', resultValue: undefined });
  };

  // 删除判定公式
  const removeFormula = (index) => {
    if (form.formulas.length > 1) {
      form.formulas.splice(index, 1);
    }
  };

  // 重置表单
  const resetForm = () => {
    Object.assign(form, { ...formDefault });
    form.formulas = [{ assessmentFormula: '', resultValue: undefined }];
    nextTick(() => {
      formRef.value?.clearValidate();
    });
  };

  // 加载配置数据
  const loadConfig = async (indicatorId) => {
    if (!indicatorId) {
      resetForm();
      return;
    }

    loading.value = true;
    try {
      resetForm();
      form.indicatorId = indicatorId;

      const res = await indicatorAssessmentConfigApi.queryIndicatorAssessmentConfigById(indicatorId);
      if (res.ok && res.data) {
        Object.assign(form, res.data);
        // 确保formulas至少有一行
        if (!form.formulas || form.formulas.length === 0) {
          form.formulas = [{ assessmentFormula: '', resultValue: undefined }];
        } else {
          form.formulas = form.formulas.map(({ assessmentFormula, resultValue }) => {
            console.log(resultValue);
            return {
              assessmentFormula: assessmentFormula,
              resultValue: +(resultValue || 0),
            };
          });
        }
        emits('dataLoaded', form);
      }

      nextTick(() => {
        formRef.value?.clearValidate();
      });
    } catch (error) {
      smartSentry.captureError(error);
      message.error('加载自评配置失败');
      resetForm();
    } finally {
      loading.value = false;
    }
  };

  // 监听indicatorId变化
  watch(
    () => props.indicatorId,
    (newId) => {
      if (newId) {
        loadConfig(newId);
      } else {
        resetForm();
      }
    },
    { immediate: true }
  );

  // 保存配置
  const save = async () => {
    if (!props.indicatorId) {
      message.warn('请先选择一个指标');
      return;
    }

    saving.value = true;
    try {
      const isValid = await formRef.value?.validateFields();

      if (!isValid) {
        throw new Error('表单验证失败，请检查填写内容');
      }

      // 确保indicatorId正确
      form.indicatorId = props.indicatorId;

      // 过滤空的公式行
      const validFormulas = form.formulas.filter((f) => f.assessmentFormula && f.assessmentFormula.trim());
      if (validFormulas.length === 0) {
        message.error('请至少添加一个有效的判定公式');
        return;
      }

      const saveData = { ...form, formulas: validFormulas };

      let result;
      if (form.id) {
        result = await indicatorAssessmentConfigApi.update(saveData);
      } else {
        result = await indicatorAssessmentConfigApi.add(saveData);
      }

      if (result.ok) {
        // 更新form的id
        if (result.data && result.data.id) {
          form.id = result.data.id;
        }
        emits('dataChanged', form);
      } else {
        message.error(result.msg || '保存失败');
      }
    } catch (error) {
      if (error.errorFields) {
        message.error('表单校验失败');
      } else {
        smartSentry.captureError(error);
        message.error('保存失败');
      }
    } finally {
      saving.value = false;
    }
  };

  // 验证表单
  const validateForm = async () => {
    if (!formRef.value) {
      return false;
    }

    try {
      await formRef.value.validateFields();
      return true;
    } catch (error) {
      return false;
    }
  };

  watch(
    () => form.assessmentType,
    (newValue, oldValue) => {
      if (oldValue && newValue) {
        form.formulas = [{ assessmentFormula: '', resultValue: undefined }];
      }
    }
  );

  // 暴露方法给父组件
  defineExpose({
    save,
    resetForm,
    validateForm,
    loadConfig,
  });
</script>

<style lang="less" scoped>
  // 复用基本表单样式
  .indicator-form {
    .config-section {
      margin-bottom: 24px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      overflow: hidden;

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
          color: #007069;
        }
      }

      .section-content {
        padding: 20px;
        font-weight: 500;
      }
    }

    .definition-group {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }
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

  .formula-table {
    margin-top: 8px;

    :deep(.ant-table-tbody > tr > td) {
      padding: 8px;
      vertical-align: center;
    }

    :deep(.ant-table-thead > tr > th) {
      background: #f8fafc;
      font-weight: 600;
      color: #374151;
    }

    // 简化公式编辑器在表格中的样式优化
    :deep(.formula-editor-simple) {
      border: 1px solid #e8e8e8;
      border-radius: 4px;

      .compact-toolbar {
        padding: 4px 6px;
        background: #f9f9f9;
      }

      .input-area {
        .ant-input {
          min-height: 50px;
          font-size: 12px;
          line-height: 1.4;
        }

        .validation-tip {
          font-size: 9px;
        }
      }
    }
  }
</style>
