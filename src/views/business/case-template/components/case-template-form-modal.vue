<template>
  <a-modal :title="form.caseTemplateId ? '编辑病历模板' : '新建病历模板'" width="1180px" :open="visibleFlag" @cancel="onClose" :maskClosable="false" :destroyOnClose="true" forceRender>
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 4 }">
      <a-alert v-if="form.templateScope === 'SYSTEM'" class="template-tip" type="warning" show-icon message="系统模板不允许直接修改，请先在列表中点击引用生成个人模板后再编辑。" />
      <a-form-item label="模板名称" name="templateName">
        <a-input v-model:value="form.templateName" placeholder="请输入模板名称" />
      </a-form-item>
      <a-form-item label="模板类型" name="templateType">
        <a-select v-model:value="form.templateType" placeholder="请选择模板类型" :options="TEMPLATE_TYPE_OPTIONS" @change="onTemplateTypeChange" />
      </a-form-item>
      <a-form-item label="业务节点" name="businessNode">
        <a-select v-model:value="form.businessNode" placeholder="请选择业务节点" :options="BUSINESS_NODE_OPTIONS" @change="onBusinessNodeChange" />
      </a-form-item>
      <a-form-item label="病历类型" name="recordType">
        <a-select v-model:value="form.recordType" placeholder="请选择病历类型" :options="recordTypeOptions" />
      </a-form-item>
      <a-form-item label="继承模板" name="inheritTemplateId">
        <a-select v-model:value="form.inheritTemplateId" placeholder="请选择继承模板" allowClear :options="inheritTemplateOptions" />
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="form.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">停用</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="排序" name="sort">
        <a-input-number v-model:value="form.sort" :min="0" :precision="0" style="width: 100%" placeholder="请输入排序" />
      </a-form-item>
      <a-form-item :label="templateContentLabel" name="templateContent">
        <a-alert v-if="form.templateType === 'STYLESHEET'" class="template-tip" type="info" show-icon message="样式模板请维护完整 HTML 片段，可使用 {{patientName}}、{{recordTime}}、{{chiefComplaint}}、{{presentIllness}}、{{diagnosis}}、{{doctorName}} 等占位符。" />
        <a-row :gutter="12">
          <a-col :span="form.templateType === 'STYLESHEET' ? 12 : 24">
            <a-textarea v-model:value="form.templateContent" :rows="16" :placeholder="templateContentPlaceholder" />
          </a-col>
          <a-col v-if="form.templateType === 'STYLESHEET'" :span="12">
            <div class="html-preview-title">HTML预览</div>
            <div class="html-template-preview" v-html="form.templateContent"></div>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-textarea v-model:value="form.remark" :rows="3" placeholder="请输入备注" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" :disabled="form.templateScope === 'SYSTEM'" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup>
  import { computed, nextTick, reactive, ref } from 'vue';
  import _ from 'lodash';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { BUSINESS_NODE_OPTIONS, caseTemplateApi, getOptionLabel, RECORD_TYPE_OPTIONS, TEMPLATE_TYPE_OPTIONS } from '/@/api/business/case-template/case-template-api';

  const emits = defineEmits(['reloadList']);

  const visibleFlag = ref(false);
  const formRef = ref();
  const templateList = ref([]);

  const formDefault = {
    caseTemplateId: undefined,
    templateName: undefined,
    templateType: 'PROMPT',
    businessNode: 'OUTPATIENT',
    recordType: 'OUTPATIENT_MEDICAL_RECORD',
    inheritTemplateId: undefined,
    templateContent: undefined,
    status: 1,
    sort: 0,
    remark: undefined,
  };

  const form = reactive({ ...formDefault });

  const rules = {
    templateName: [{ required: true, message: '请输入模板名称' }],
    templateType: [{ required: true, message: '请选择模板类型' }],
    businessNode: [{ required: true, message: '请选择业务节点' }],
    recordType: [{ required: true, message: '请选择病历类型' }],
    templateContent: [{ required: true, message: '请输入模板内容' }],
    status: [{ required: true, message: '请选择状态' }],
  };

  const recordTypeOptions = computed(() => RECORD_TYPE_OPTIONS.filter((item) => item.businessNode === form.businessNode));

  const templateContentLabel = computed(() => (form.templateType === 'STYLESHEET' ? 'HTML模板' : 'Prompt模板'));

  const templateContentPlaceholder = computed(() =>
    form.templateType === 'STYLESHEET'
      ? '请输入HTML模板，例如：<div class="emr-document"><h1>门诊病历</h1><p>{{chiefComplaint}}</p></div>'
      : '请输入Prompt模板，例如：请根据患者信息和转写内容生成{{recordTypeName}}。'
  );

  const inheritTemplateOptions = computed(() => {
    return templateList.value
      .filter((item) => item.caseTemplateId !== form.caseTemplateId && item.templateType === form.templateType && item.businessNode === form.businessNode)
      .map((item) => ({
        label: `${item.templateName}（${getOptionLabel(BUSINESS_NODE_OPTIONS, item.businessNode)} / ${getOptionLabel(RECORD_TYPE_OPTIONS, item.recordType)}）`,
        value: item.caseTemplateId,
      }));
  });

  const defaultHtmlTemplates = {
    OUTPATIENT: `<div class="emr-document outpatient-record">
  <h1>门诊病历</h1>
  <section><strong>就诊时间：</strong>{{recordTime}}</section>
  <section><strong>患者姓名：</strong>{{patientName}}</section>
  <section><strong>主诉：</strong>{{chiefComplaint}}</section>
  <section><strong>现病史：</strong>{{presentIllness}}</section>
  <section><strong>诊断：</strong>{{diagnosis}}</section>
  <section><strong>处理意见：</strong>{{treatmentPlan}}</section>
  <footer>医师：{{doctorName}}</footer>
</div>`,
    INPATIENT_COURSE: `<div class="emr-document inpatient-course-record">
  <h1>{{recordTypeName}}</h1>
  <section><strong>记录时间：</strong>{{recordTime}}</section>
  <section><strong>患者姓名：</strong>{{patientName}}</section>
  <section><strong>病情变化：</strong>{{conditionChange}}</section>
  <section><strong>查体：</strong>{{physicalExam}}</section>
  <section><strong>辅助检查：</strong>{{examSummary}}</section>
  <section><strong>诊疗计划：</strong>{{treatmentPlan}}</section>
  <footer>记录医师：{{doctorName}}</footer>
</div>`,
    POSTOPERATIVE_COURSE: `<div class="emr-document postoperative-course-record">
  <h1>{{recordTypeName}}</h1>
  <section><strong>术后时间：</strong>{{postoperativeTime}}</section>
  <section><strong>患者姓名：</strong>{{patientName}}</section>
  <section><strong>手术名称：</strong>{{operationName}}</section>
  <section><strong>术后情况：</strong>{{postoperativeCondition}}</section>
  <section><strong>切口/引流：</strong>{{incisionDrainage}}</section>
  <section><strong>后续处理：</strong>{{treatmentPlan}}</section>
  <footer>记录医师：{{doctorName}}</footer>
</div>`,
  };

  function fillDefaultTemplateContent() {
    if (form.templateContent) {
      return;
    }
    form.templateContent =
      form.templateType === 'STYLESHEET'
        ? defaultHtmlTemplates[form.businessNode]
        : `请根据患者基本信息、业务节点「${getOptionLabel(BUSINESS_NODE_OPTIONS, form.businessNode)}」、病历类型「${getOptionLabel(RECORD_TYPE_OPTIONS, form.recordType)}」和语音转写内容，生成结构化病历草稿。`;
  }

  function onTemplateTypeChange() {
    form.inheritTemplateId = undefined;
    form.templateContent = undefined;
    fillDefaultTemplateContent();
  }

  function onBusinessNodeChange() {
    form.recordType = recordTypeOptions.value[0]?.value;
    form.inheritTemplateId = undefined;
    form.templateContent = undefined;
    fillDefaultTemplateContent();
  }

  async function show(rowData) {
    Object.assign(form, formDefault);
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
    }
    if (!form.businessNode) {
      const matchedRecordType = RECORD_TYPE_OPTIONS.find((item) => item.value === form.recordType);
      form.businessNode = matchedRecordType?.businessNode || 'OUTPATIENT';
    }
    if (!recordTypeOptions.value.some((item) => item.value === form.recordType)) {
      form.recordType = recordTypeOptions.value[0]?.value;
    }
    fillDefaultTemplateContent();
    visibleFlag.value = true;
    await queryTemplateList();
    nextTick(() => {
      formRef.value?.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, formDefault);
    visibleFlag.value = false;
  }

  async function queryTemplateList() {
    try {
      const result = await caseTemplateApi.queryList({ status: 1 });
      templateList.value = result.data || [];
    } catch (e) {
      smartSentry.captureError(e);
    }
  }

  async function onSubmit() {
    try {
      await formRef.value.validateFields();
      await save();
    } catch (err) {
      message.error('参数验证错误，请仔细填写表单数据!');
    }
  }

  async function save() {
    SmartLoading.show();
    try {
      if (form.caseTemplateId) {
        await caseTemplateApi.update(form);
      } else {
        await caseTemplateApi.add(form);
      }
      message.success('操作成功');
      emits('reloadList');
      onClose();
    } catch (err) {
      smartSentry.captureError(err);
    } finally {
      SmartLoading.hide();
    }
  }

  defineExpose({ show });
</script>

<style scoped>
  .template-tip {
    margin-bottom: 12px;
  }

  .html-preview-title {
    margin-bottom: 8px;
    font-weight: 600;
    color: #1f2937;
  }

  .html-template-preview {
    min-height: 360px;
    max-height: 520px;
    padding: 20px;
    overflow: auto;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
  }

  .html-template-preview :deep(.emr-document) {
    max-width: 720px;
    margin: 0 auto;
    color: #111827;
    font-size: 14px;
    line-height: 1.8;
  }

  .html-template-preview :deep(h1) {
    margin-bottom: 18px;
    font-size: 22px;
    font-weight: 700;
    text-align: center;
  }

  .html-template-preview :deep(section) {
    padding: 6px 0;
    border-bottom: 1px dashed #e5e7eb;
  }

  .html-template-preview :deep(footer) {
    margin-top: 18px;
    text-align: right;
  }
</style>
