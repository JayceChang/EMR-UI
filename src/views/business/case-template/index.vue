<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row">
      <a-form-item label="关键字" class="smart-query-form-item">
        <a-input style="width: 220px" v-model:value="queryForm.keywords" placeholder="模板名称" />
      </a-form-item>
      <a-form-item label="模板类型" class="smart-query-form-item">
        <a-select style="width: 180px" v-model:value="queryForm.templateType" placeholder="请选择模板类型" allowClear :options="TEMPLATE_TYPE_OPTIONS" />
      </a-form-item>
      <a-form-item label="业务节点" class="smart-query-form-item">
        <a-select style="width: 180px" v-model:value="queryForm.businessNode" placeholder="请选择业务节点" allowClear :options="BUSINESS_NODE_OPTIONS" />
      </a-form-item>
      <a-form-item label="病历类型" class="smart-query-form-item">
        <a-select style="width: 180px" v-model:value="queryForm.recordType" placeholder="请选择病历类型" allowClear :options="recordTypeQueryOptions" />
      </a-form-item>
      <a-form-item label="模板范围" class="smart-query-form-item">
        <a-select
          style="width: 140px"
          v-model:value="queryForm.templateScope"
          placeholder="模板范围"
          :allowClear="!fixedScope"
          :disabled="!!fixedScope"
          :options="TEMPLATE_SCOPE_OPTIONS"
        />
      </a-form-item>
      <a-form-item label="状态" class="smart-query-form-item">
        <a-select style="width: 120px" v-model:value="queryForm.status" placeholder="状态" allowClear :options="TEMPLATE_STATUS_OPTIONS" />
      </a-form-item>
      <a-form-item class="smart-query-form-item">
        <a-button type="primary" @click="queryData">
          <template #icon>
            <SearchOutlined />
          </template>
          查询
        </a-button>
        <a-button @click="resetQuery" class="smart-margin-left10">
          <template #icon>
            <ReloadOutlined />
          </template>
          重置
        </a-button>
      </a-form-item>
    </a-row>
  </a-form>

  <a-card size="small" :bordered="false" :hoverable="true">
    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button v-if="fixedScope !== CASE_TEMPLATE_SCOPE_SYSTEM" @click="showForm" type="primary">
          <template #icon>
            <PlusOutlined />
          </template>
          新建
        </a-button>
      </div>
    </a-row>

    <a-table size="small" :dataSource="tableData" :columns="columns" rowKey="caseTemplateId" bordered :loading="tableLoading" :pagination="false">
      <template #bodyCell="{ record, column }">
        <template v-if="column.dataIndex === 'templateType'">
          <a-tag color="blue">{{ getOptionLabel(TEMPLATE_TYPE_OPTIONS, record.templateType) }}</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'businessNode'">
          <a-tag color="purple">{{ getOptionLabel(BUSINESS_NODE_OPTIONS, record.businessNode) }}</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'recordType'">
          {{ getOptionLabel(RECORD_TYPE_OPTIONS, record.recordType) }}
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">{{ getOptionLabel(TEMPLATE_STATUS_OPTIONS, record.status) }}</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="previewTemplate(record)" type="link">预览</a-button>
            <a-button v-if="record.templateScope === 'SYSTEM'" @click="quoteTemplate(record)" type="link">引用</a-button>
            <a-button v-if="record.editable === 1" @click="showForm(record)" type="link">编辑</a-button>
            <a-button v-if="record.editable === 1" @click="deleteTemplate(record)" danger type="link">删除</a-button>
          </div>
        </template>
      </template>
    </a-table>

    <div class="smart-query-table-page">
      <a-pagination
        showSizeChanger
        showQuickJumper
        show-less-items
        :pageSizeOptions="PAGE_SIZE_OPTIONS"
        :defaultPageSize="queryForm.pageSize"
        v-model:current="queryForm.pageNum"
        v-model:pageSize="queryForm.pageSize"
        :total="total"
        @change="queryData"
        @showSizeChange="queryData"
        :show-total="(total) => `共${total}条`"
      />
    </div>

    <a-modal
      v-model:open="previewVisible"
      :title="previewTitle"
      width="980px"
      :footer="null"
      :destroyOnClose="true"
    >
      <a-descriptions size="small" bordered :column="2" class="template-preview-info">
        <a-descriptions-item label="模板名称">{{ previewRecord.templateName }}</a-descriptions-item>
        <a-descriptions-item label="模板类型">{{ getOptionLabel(TEMPLATE_TYPE_OPTIONS, previewRecord.templateType) }}</a-descriptions-item>
        <a-descriptions-item label="业务节点">{{ getOptionLabel(BUSINESS_NODE_OPTIONS, previewRecord.businessNode) }}</a-descriptions-item>
        <a-descriptions-item label="病历类型">{{ getOptionLabel(RECORD_TYPE_OPTIONS, previewRecord.recordType) }}</a-descriptions-item>
      </a-descriptions>

      <template v-if="previewRecord.templateType === 'STYLESHEET'">
        <div class="template-preview-toolbar">
          <a-radio-group v-model:value="previewMode" button-style="solid" size="small">
            <a-radio-button value="render">渲染预览</a-radio-button>
            <a-radio-button value="source">HTML源码</a-radio-button>
          </a-radio-group>
        </div>
        <div v-if="previewMode === 'render'" class="html-template-preview" v-html="previewHtml"></div>
        <pre v-else class="prompt-template-preview">{{ previewRecord.templateContent }}</pre>
      </template>

      <pre v-else class="prompt-template-preview">{{ previewRecord.templateContent }}</pre>
    </a-modal>

    <CaseTemplateFormModal ref="formRef" @reloadList="queryData" />
  </a-card>
</template>

<script setup>
  import { computed, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import {
    BUSINESS_NODE_OPTIONS,
    caseTemplateApi,
    getOptionLabel,
    RECORD_TYPE_OPTIONS,
    TEMPLATE_SCOPE_OPTIONS,
    TEMPLATE_STATUS_OPTIONS,
    TEMPLATE_TYPE_OPTIONS,
  } from '/@/api/business/case-template/case-template-api';
  import CaseTemplateFormModal from './components/case-template-form-modal.vue';
  import { CASE_TEMPLATE_SCOPE_SYSTEM, resolveCaseTemplateScope } from './case-template-scope';

  const props = defineProps({
    fixedTemplateScope: {
      type: String,
      default: undefined,
    },
  });

  const route = useRoute();
  const fixedScope = computed(() => resolveCaseTemplateScope({ fixedTemplateScope: props.fixedTemplateScope, routePath: route.path }));

  const columns = ref([
    {
      title: '模板名称',
      dataIndex: 'templateName',
      ellipsis: true,
    },
    {
      title: '模板类型',
      dataIndex: 'templateType',
      width: 160,
    },
    {
      title: '业务节点',
      dataIndex: 'businessNode',
      width: 150,
    },
    {
      title: '病历类型',
      dataIndex: 'recordType',
      width: 170,
    },
    {
      title: '继承模板',
      dataIndex: 'inheritTemplateName',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 90,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      width: 160,
    },
    {
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      width: 160,
    },
  ]);

  const queryFormDefault = {
    keywords: undefined,
    templateType: undefined,
    businessNode: undefined,
    recordType: undefined,
    templateScope: undefined,
    status: undefined,
    pageNum: 1,
    pageSize: 10,
  };

  const queryForm = reactive({ ...queryFormDefault });
  const tableLoading = ref(false);
  const tableData = ref([]);
  const total = ref(0);
  const formRef = ref();
  const previewVisible = ref(false);
  const previewMode = ref('render');
  const previewRecord = ref({});

  const previewTitle = computed(() => {
    const templateName = previewRecord.value.templateName || '';
    return templateName ? `模板预览：${templateName}` : '模板预览';
  });

  const previewHtml = computed(() => fillTemplatePlaceholders(previewRecord.value.templateContent || ''));

  function applyFixedScope() {
    if (fixedScope.value) {
      queryForm.templateScope = fixedScope.value;
    }
  }

  const recordTypeQueryOptions = computed(() => {
    if (!queryForm.businessNode) {
      return RECORD_TYPE_OPTIONS;
    }
    return RECORD_TYPE_OPTIONS.filter((item) => item.businessNode === queryForm.businessNode);
  });

  watch(
    () => queryForm.businessNode,
    () => {
      if (queryForm.recordType && !recordTypeQueryOptions.value.some((item) => item.value === queryForm.recordType)) {
        queryForm.recordType = undefined;
      }
    }
  );

  function resetQuery() {
    const pageSize = queryForm.pageSize;
    Object.assign(queryForm, queryFormDefault);
    queryForm.pageSize = pageSize;
    applyFixedScope();
    queryData();
  }

  async function queryData() {
    applyFixedScope();
    tableLoading.value = true;
    try {
      const queryResult = await caseTemplateApi.queryPage(queryForm);
      tableData.value = queryResult.data.list || [];
      total.value = queryResult.data.total || 0;
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      tableLoading.value = false;
    }
  }

  function showForm(data) {
    formRef.value.show(data);
  }

  function previewTemplate(data) {
    previewRecord.value = data || {};
    previewMode.value = data?.templateType === 'STYLESHEET' ? 'render' : 'source';
    previewVisible.value = true;
  }

  function fillTemplatePlaceholders(content) {
    const placeholderMap = {
      patientName: '张三',
      recordTime: '2026-06-08 10:30',
      doctorName: '李医生',
      chiefComplaint: '咳嗽、咳痰3天。',
      presentIllness: '患者3天前无明显诱因出现咳嗽、少量白痰，无明显胸痛、咯血。',
      pastHistory: '既往史未提供，过敏史未提供。',
      physicalExam: '神志清楚，精神可，双肺呼吸音稍粗，未闻及明显干湿啰音。',
      examSummary: '血常规、胸部影像等辅助检查结果待补充。',
      diagnosis: '上呼吸道感染可能，需结合检查结果进一步判断。',
      treatmentPlan: '完善相关检查，给予对症治疗，嘱患者注意休息、复诊随访。',
      conditionChange: '今日一般情况平稳，咳嗽较前稍缓解。',
      attention: '关注体温、咳嗽咳痰变化及检查结果。',
      patientSummary: '患者住院期间生命体征平稳，目前主要问题为感染相关症状。',
      currentCondition: '当前病情平稳，仍需继续观察。',
      orders: '继续当前治疗医嘱，关注检验检查回报。',
      handoverFocus: '重点交接病情变化、检查结果和夜间处理事项。',
      nextActions: '接班后继续观察生命体征，必要时复查相关指标。',
      riskWarning: '注意病情加重、发热及呼吸困难风险。',
      operationName: '腹腔镜手术',
      postoperativeTime: '术后第1日',
      vitalSigns: '生命体征平稳。',
      incisionDrainage: '切口敷料干燥，引流情况待补充。',
      postoperativeAssessment: '术后恢复情况尚可，继续观察。',
    };
    return content.replace(/\{\{\s*([\w]+)\s*\}\}/g, (match, key) => placeholderMap[key] || match);
  }

  function quoteTemplate(data) {
    Modal.confirm({
      title: '引用系统模板',
      content: `确定要引用系统模板「${data.templateName}」为个人模板吗?`,
      okText: '引用',
      async onOk() {
        SmartLoading.show();
        try {
          await caseTemplateApi.quoteSystem(data.caseTemplateId);
          message.success('引用成功，可在个人模板中编辑');
          queryData();
        } catch (e) {
          smartSentry.captureError(e);
        } finally {
          SmartLoading.hide();
        }
      },
      cancelText: '取消',
    });
  }

  function deleteTemplate(data) {
    Modal.confirm({
      title: '提示',
      content: `确定要删除病历模板「${data.templateName}」吗?`,
      okText: '删除',
      okType: 'danger',
      async onOk() {
        SmartLoading.show();
        try {
          await caseTemplateApi.delete(data.caseTemplateId);
          message.success('删除成功');
          queryData();
        } catch (e) {
          smartSentry.captureError(e);
        } finally {
          SmartLoading.hide();
        }
      },
      cancelText: '取消',
    });
  }

  watch(
    fixedScope,
    () => {
      resetQuery();
    },
    { flush: 'post' }
  );

  onMounted(() => {
    applyFixedScope();
    queryData();
  });
</script>

<style scoped>
  .template-preview-info {
    margin-bottom: 16px;
  }

  .template-preview-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
  }

  .prompt-template-preview {
    min-height: 360px;
    max-height: 620px;
    padding: 16px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    color: #1f2937;
    font-size: 13px;
    line-height: 1.7;
  }

  .html-template-preview {
    min-height: 420px;
    max-height: 680px;
    padding: 24px;
    overflow: auto;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
  }

  .html-template-preview :deep(.emr-document) {
    max-width: 760px;
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
    padding: 7px 0;
    border-bottom: 1px dashed #e5e7eb;
  }

  .html-template-preview :deep(footer) {
    margin-top: 18px;
    text-align: right;
  }
</style>
