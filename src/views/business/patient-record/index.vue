<template>
  <div class="patient-record-page">
    <section class="patient-record-query-panel">
      <a-form class="smart-query-form patient-record-query-form">
        <a-row class="smart-query-form-row patient-record-query-row">
          <a-form-item label="姓名" class="smart-query-form-item">
            <a-input
              v-model:value="queryForm.patientName"
              class="patient-record-query-input patient-record-name-input"
              allowClear
              placeholder="请输入患者姓名"
              @pressEnter="queryPatients"
            />
          </a-form-item>
          <a-form-item label="身份证号" class="smart-query-form-item">
            <a-input
              v-model:value="queryForm.idCardNo"
              class="patient-record-query-input patient-record-idcard-input"
              allowClear
              placeholder="请输入身份证号"
              @pressEnter="queryPatients"
            />
          </a-form-item>
          <a-form-item class="smart-query-form-item patient-record-query-actions">
            <a-button type="primary" @click="queryPatients">
              <template #icon>
                <SearchOutlined />
              </template>
              查询
            </a-button>
            <a-button @click="resetQuery">
              <template #icon>
                <ReloadOutlined />
              </template>
              重置
            </a-button>
          </a-form-item>
        </a-row>
      </a-form>
    </section>

    <div class="patient-record-layout">
      <section class="patient-list-panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">患者列表</div>
            <div class="panel-subtitle">共 {{ total }} 条</div>
          </div>
        </div>
        <a-table
          class="patient-table"
          size="small"
          :bordered="false"
          rowKey="patientId"
          :dataSource="patientList"
          :columns="patientColumns"
          :loading="tableLoading"
          :pagination="false"
          :rowSelection="rowSelection"
          :customRow="customPatientRow"
          :scroll="{ y: 'calc(100vh - 356px)' }"
        >
          <template #bodyCell="{ record, column }">
            <template v-if="column.dataIndex === 'patientName'">
              <a-button type="link" class="patient-link" @click.stop="selectPatient(record)">
                {{ record.patientName || '-' }}
              </a-button>
            </template>
            <template v-else-if="column.dataIndex === 'idCardNo'">
              {{ maskIdCard(record.idCardNo) }}
            </template>
          </template>
        </a-table>

        <div class="smart-query-table-page">
          <a-pagination
            size="small"
            showSizeChanger
            showQuickJumper
            show-less-items
            :pageSizeOptions="PAGE_SIZE_OPTIONS"
            v-model:current="queryForm.pageNum"
            v-model:pageSize="queryForm.pageSize"
            :total="total"
            @change="queryPatients"
            @showSizeChange="queryPatients"
            :show-total="(value) => `共${value}条`"
          />
        </div>
      </section>

      <section class="patient-detail-panel">
        <a-spin class="detail-spin" :spinning="detailLoading">
          <template v-if="selectedPatientId">
            <div class="detail-header">
              <div class="detail-heading">
                <div class="detail-title">{{ selectedPatientName }}</div>
                <div class="detail-subtitle">
                  <span>患者ID：{{ selectedPatientId }}</span>
                  <span v-if="selectedPatient?.idCardNo">身份证：{{ maskIdCard(selectedPatient.idCardNo) }}</span>
                  <span v-if="selectedPatient?.phone">电话：{{ selectedPatient.phone }}</span>
                </div>
              </div>
              <div class="detail-actions">
                <div class="summary-metric">
                  <span>门诊</span>
                  <strong>{{ detail.outpatientVisits?.length || 0 }}</strong>
                </div>
                <div class="summary-metric">
                  <span>住院</span>
                  <strong>{{ detail.inpatientVisits?.length || 0 }}</strong>
                </div>
                <a-button size="small" @click="reloadDetail">
                  <template #icon>
                    <ReloadOutlined />
                  </template>
                  刷新
                </a-button>
              </div>
            </div>

            <div class="detail-body">
              <aside class="record-tree-panel">
                <div class="tree-title">记录目录</div>
                <a-tree
                  v-model:selectedKeys="selectedTreeKeys"
                  :treeData="treeData"
                  :defaultExpandAll="true"
                  blockNode
                  @select="handleTreeSelect"
                />
              </aside>

              <main class="record-content-panel">
                <div class="record-content-title">
                  <span>{{ activeNode?.title || '患者基本信息' }}</span>
                  <a-tag v-if="activeNode" color="blue">{{ activeNode.count }}条</a-tag>
                </div>

                <template v-if="activeNode?.groups?.length">
                  <div v-for="group in activeNode.groups" :key="group.key" class="record-group">
                    <div class="record-group-title">
                      <span>{{ group.title }}</span>
                      <a-tag>{{ group.rows.length }}条</a-tag>
                    </div>
                    <RecordRows :rows="group.rows" @show-json="showJson" />
                  </div>
                </template>
                <RecordRows v-else :rows="activeRows" @show-json="showJson" />
              </main>
            </div>
          </template>

          <a-empty v-else class="detail-empty" description="请选择患者" />
        </a-spin>
      </section>
    </div>
  </div>

  <a-modal v-model:open="jsonVisible" title="原始JSON" width="820px" :footer="null" :destroyOnClose="true">
    <pre class="json-preview">{{ jsonPreview }}</pre>
  </a-modal>
</template>

<script setup>
  import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue';
  import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue';
  import { Button, Descriptions, DescriptionsItem, Empty, Tag } from 'ant-design-vue';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { patientRecordApi } from '/@/api/business/patient-record/patient-record-api';

  const FIELD_LABEL_MAP = {
    patientid: '患者ID',
    xm: '姓名',
    xb: '性别',
    xbdm: '性别代码',
    nl: '年龄',
    csrq: '出生日期',
    sfzh: '身份证号',
    dhhm: '联系电话',
    lxdh: '联系电话',
    sjhm: '手机号',
    outpat_id: '门诊号',
    zyh: '住院号',
    ksmc: '科室',
    ryksmc: '入院科室',
    cyksmc: '出院科室',
    diag_name: '诊断名称',
    zd: '诊断',
    yzmc: '医嘱名称',
    prescribe_no: '处方号',
    ypmc: '药品名称',
    detailitemname: '明细名称',
    chiefcomplaint: '主诉',
    zs: '主诉',
    bclbmc: '病程类型',
    cyzd: '出院诊断',
    reportformno: '报告单号',
    reportname: '报告名称',
    item_name: '项目名称',
    drug_name: '药品名称',
    exam_name: '检查项目',
    ssmc: '手术名称',
    tw: '体温',
  };

  const EXCLUDED_DETAIL_KEYS = new Set(['details', 'drugSensitivities']);

  const RecordRows = defineComponent({
    name: 'RecordRows',
    props: {
      rows: {
        type: Array,
        default: () => [],
      },
    },
    emits: ['show-json'],
    setup(props, { emit }) {
      function renderDescriptions(row) {
        const entries = visibleEntries(row);
        if (!entries.length) {
          return h(Empty, { image: Empty.PRESENTED_IMAGE_SIMPLE, description: '暂无数据' });
        }
        return h(
          Descriptions,
          { size: 'small', bordered: true, column: 2, class: 'record-descriptions' },
          () =>
            entries.map((entry) =>
              h(
                DescriptionsItem,
                { key: entry.key, label: entry.label },
                () => formatValue(entry.value)
              )
            )
        );
      }

      function renderChildRows(title, rows) {
        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }
        return h('div', { class: 'record-child-block' }, [
          h('div', { class: 'record-child-title' }, [title, h(Tag, { class: 'record-child-tag' }, () => `${rows.length}条`)]),
          ...rows.map((row, index) => h('div', { class: 'record-child-row', key: `${title}-${index}` }, [renderDescriptions(row)])),
        ]);
      }

      return () => {
        if (!props.rows.length) {
          return h(Empty, { class: 'record-empty', description: '暂无记录' });
        }
        return h(
          'div',
          { class: 'record-row-list' },
          props.rows.map((row, index) =>
            h('div', { class: 'record-row-card', key: index }, [
              h('div', { class: 'record-row-toolbar' }, [
                h('span', { class: 'record-row-index' }, `#${index + 1}`),
                h(Button, { size: 'small', type: 'link', onClick: () => emit('show-json', row) }, () => '查看JSON'),
              ]),
              renderDescriptions(row),
              renderChildRows('化验明细', row.details),
              renderChildRows('药敏结果', row.drugSensitivities),
            ])
          )
        );
      };
    },
  });

  const queryFormDefault = {
    patientName: undefined,
    idCardNo: undefined,
    pageNum: 1,
    pageSize: 10,
  };

  const queryForm = reactive({ ...queryFormDefault });
  const patientList = ref([]);
  const total = ref(0);
  const tableLoading = ref(false);
  const detailLoading = ref(false);
  const selectedPatientId = ref();
  const selectedPatient = ref({});
  const selectedTreeKeys = ref([]);
  const activeNode = ref();
  const detail = ref({
    patientInfo: {},
    outpatientVisits: [],
    inpatientVisits: [],
  });
  const jsonVisible = ref(false);
  const jsonPreview = ref('');

  const patientColumns = [
    { title: '姓名', dataIndex: 'patientName', width: 118, ellipsis: true },
    { title: '身份证号', dataIndex: 'idCardNo', ellipsis: true },
  ];

  const selectedPatientName = computed(() => {
    return selectedPatient.value?.patientName || detail.value?.patientInfo?.xm || '-';
  });

  const selectedPatientIds = computed(() => (selectedPatientId.value ? [selectedPatientId.value] : []));

  const rowSelection = computed(() => ({
    type: 'radio',
    selectedRowKeys: selectedPatientIds.value,
    onChange: (_, selectedRows) => {
      if (selectedRows.length) {
        selectPatient(selectedRows[0]);
      }
    },
  }));

  const treeData = computed(() => {
    const data = detail.value || {};
    const outpatientVisits = data.outpatientVisits || [];
    const inpatientVisits = data.inpatientVisits || [];

    return [
      {
        title: '患者基本信息',
        key: 'patientInfo',
      },
      {
        title: '患者门诊就诊记录',
        key: 'outpatientRoot',
        children: outpatientVisits.map((visit, index) => {
          const outpatId = visit.visitInfo?.outpat_id || `门诊记录${index + 1}`;
          const visitKey = `outpatient-${outpatId}-${index}`;
          return {
            title: outpatId,
            key: visitKey,
            children: [
              { title: '诊断记录', key: `${visitKey}-diagnoses` },
              { title: '处方记录', key: `${visitKey}-prescriptions` },
              { title: '检查报告', key: `${visitKey}-examReports` },
              { title: '化验报告', key: `${visitKey}-labReports` },
            ],
          };
        }),
      },
      {
        title: '患者住院就诊记录',
        key: 'inpatientRoot',
        children: inpatientVisits.map((visit, index) => {
          const admissionNo = visit.visitInfo?.zyh || `住院记录${index + 1}`;
          const visitKey = `inpatient-${admissionNo}-${index}`;
          return {
            title: admissionNo,
            key: visitKey,
            children: [
              { title: '诊断记录', key: `${visitKey}-diagnoses` },
              { title: '医嘱记录', key: `${visitKey}-orders` },
              { title: '病历记录', key: `${visitKey}-medicalRecords` },
              { title: '检查报告', key: `${visitKey}-examReports` },
              { title: '化验报告', key: `${visitKey}-labReports` },
              { title: '手术记录', key: `${visitKey}-operations` },
              { title: '输血记录', key: `${visitKey}-transfusions` },
              { title: '体征记录', key: `${visitKey}-vitalSigns` },
              { title: '护理记录', key: `${visitKey}-nursingRecords` },
            ],
          };
        }),
      },
    ];
  });

  const nodeContentMap = computed(() => {
    const map = new Map();
    const data = detail.value || {};
    addNode(map, 'patientInfo', '患者基本信息', rowsFromMaybeObject(data.patientInfo));
    addNode(map, 'outpatientRoot', '患者门诊就诊记录', (data.outpatientVisits || []).map((item) => item.visitInfo || {}));
    addNode(map, 'inpatientRoot', '患者住院就诊记录', (data.inpatientVisits || []).map((item) => item.visitInfo || {}));

    (data.outpatientVisits || []).forEach((visit, index) => {
      const outpatId = visit.visitInfo?.outpat_id || `门诊记录${index + 1}`;
      const visitKey = `outpatient-${outpatId}-${index}`;
      addNode(map, visitKey, `门诊就诊记录：${outpatId}`, rowsFromMaybeObject(visit.visitInfo));
      addNode(map, `${visitKey}-diagnoses`, '门诊诊断记录', visit.diagnoses);
      addNode(map, `${visitKey}-prescriptions`, '门诊处方记录', [], [
        { key: 'prescriptions', title: '处方主记录', rows: visit.prescriptions || [] },
        { key: 'prescriptionDetails', title: '处方明细记录', rows: visit.prescriptionDetails || [] },
      ]);
      addNode(map, `${visitKey}-examReports`, '门诊检查报告', visit.examReports);
      addNode(map, `${visitKey}-labReports`, '门诊化验报告', visit.labReports);
    });

    (data.inpatientVisits || []).forEach((visit, index) => {
      const admissionNo = visit.visitInfo?.zyh || `住院记录${index + 1}`;
      const visitKey = `inpatient-${admissionNo}-${index}`;
      addNode(map, visitKey, `住院就诊记录：${admissionNo}`, rowsFromMaybeObject(visit.visitInfo));
      addNode(map, `${visitKey}-diagnoses`, '住院诊断记录', visit.diagnoses);
      addNode(map, `${visitKey}-orders`, '住院医嘱记录', visit.orders);
      addNode(map, `${visitKey}-medicalRecords`, '住院病历记录', [], [
        { key: 'firstPages', title: '病案首页', rows: visit.firstPages || [] },
        { key: 'admissionRecords', title: '入院记录', rows: visit.admissionRecords || [] },
        { key: 'courseNotes', title: '病程记录', rows: visit.courseNotes || [] },
      ]);
      addNode(map, `${visitKey}-examReports`, '住院检查报告', visit.examReports);
      addNode(map, `${visitKey}-labReports`, '住院化验报告', visit.labReports);
      addNode(map, `${visitKey}-operations`, '手术记录', visit.operations);
      addNode(map, `${visitKey}-transfusions`, '输血记录', visit.transfusions);
      addNode(map, `${visitKey}-vitalSigns`, '体征记录', visit.vitalSigns);
      addNode(map, `${visitKey}-nursingRecords`, '护理记录', visit.nursingRecords);
    });

    return map;
  });

  const activeRows = computed(() => {
    if (!activeNode.value) {
      return [];
    }
    return activeNode.value.rows || [];
  });

  function addNode(map, key, title, rows, groups) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const safeGroups = Array.isArray(groups)
      ? groups.map((group) => ({
          ...group,
          rows: Array.isArray(group.rows) ? group.rows : [],
        }))
      : [];
    const count = safeGroups.length ? safeGroups.reduce((sum, group) => sum + group.rows.length, 0) : safeRows.length;
    map.set(key, {
      key,
      title,
      rows: safeRows,
      groups: safeGroups,
      count,
    });
  }

  function rowsFromMaybeObject(value) {
    if (!value || Object.keys(value).length === 0) {
      return [];
    }
    return [value];
  }

  function customPatientRow(record) {
    return {
      onClick: () => selectPatient(record),
      class: record.patientId === selectedPatientId.value ? 'patient-row-selected' : '',
    };
  }

  async function queryPatients() {
    tableLoading.value = true;
    try {
      const result = await patientRecordApi.queryPatientPage(queryForm);
      patientList.value = result.data.list || [];
      total.value = result.data.total || 0;
      if (patientList.value.length) {
        await selectPatient(patientList.value[0]);
      } else {
        clearDetail();
      }
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      tableLoading.value = false;
    }
  }

  function resetQuery() {
    const pageSize = queryForm.pageSize;
    Object.assign(queryForm, queryFormDefault);
    queryForm.pageSize = pageSize;
    queryPatients();
  }

  async function selectPatient(record) {
    if (!record?.patientId) {
      clearDetail();
      return;
    }
    selectedPatient.value = record;
    selectedPatientId.value = record.patientId;
    await loadDetail(record.patientId);
  }

  async function loadDetail(patientId) {
    detailLoading.value = true;
    try {
      const result = await patientRecordApi.getPatientDetail(patientId);
      detail.value = {
        patientInfo: result.data?.patientInfo || {},
        outpatientVisits: result.data?.outpatientVisits || [],
        inpatientVisits: result.data?.inpatientVisits || [],
      };
      selectedTreeKeys.value = ['patientInfo'];
      activeNode.value = nodeContentMap.value.get('patientInfo');
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      detailLoading.value = false;
    }
  }

  function reloadDetail() {
    if (selectedPatientId.value) {
      loadDetail(selectedPatientId.value);
    }
  }

  function clearDetail() {
    selectedPatientId.value = undefined;
    selectedPatient.value = {};
    detail.value = {
      patientInfo: {},
      outpatientVisits: [],
      inpatientVisits: [],
    };
    selectedTreeKeys.value = [];
    activeNode.value = undefined;
  }

  function handleTreeSelect(keys) {
    const key = keys?.[0];
    if (!key) {
      return;
    }
    activeNode.value = nodeContentMap.value.get(key);
  }

  function showJson(row) {
    jsonPreview.value = JSON.stringify(row || {}, null, 2);
    jsonVisible.value = true;
  }

  function maskIdCard(value) {
    if (!value || value.length < 8) {
      return value || '-';
    }
    return `${value.slice(0, 4)}********${value.slice(-4)}`;
  }

  function visibleEntries(row) {
    if (!row || typeof row !== 'object') {
      return [];
    }
    return Object.entries(row)
      .filter(([key, value]) => !EXCLUDED_DETAIL_KEYS.has(key) && value !== null && value !== undefined && value !== '')
      .slice(0, 18)
      .map(([key, value]) => ({
        key,
        label: FIELD_LABEL_MAP[key] || key,
        value,
      }));
  }

  function formatValue(value) {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  onMounted(() => {
    queryPatients();
  });
</script>

<style scoped>
  .patient-record-page {
    display: flex;
    min-height: calc(100vh - 116px);
    flex-direction: column;
    gap: 12px;
    color: #1f2937;
  }

  .patient-record-query-panel {
    padding: 12px 16px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
  }

  :deep(.patient-record-query-form.smart-query-form) {
    padding: 0;
    margin-bottom: 0;
  }

  .patient-record-query-row {
    align-items: center;
    row-gap: 8px;
  }

  .patient-record-query-input {
    max-width: 100%;
  }

  .patient-record-name-input {
    width: 180px;
  }

  .patient-record-idcard-input {
    width: 260px;
  }

  .patient-record-query-actions {
    margin-left: 8px;
  }

  .patient-record-query-actions :deep(.ant-form-item-control-input-content) {
    display: flex;
    gap: 8px;
  }

  .patient-record-layout {
    display: grid;
    flex: 1;
    grid-template-columns: 360px minmax(0, 1fr);
    gap: 12px;
    min-height: 0;
  }

  .patient-list-panel,
  .patient-detail-panel {
    min-width: 0;
    overflow: hidden;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
  }

  .patient-list-panel {
    display: flex;
    min-height: calc(100vh - 190px);
    flex-direction: column;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 14px 11px;
    border-bottom: 1px solid #edf0f5;
  }

  .panel-title {
    color: #1f2937;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
  }

  .panel-subtitle {
    margin-top: 3px;
    color: #8a94a6;
    font-size: 12px;
  }

  .patient-table {
    flex: 1;
    min-height: 0;
  }

  :deep(.patient-table .ant-table) {
    color: #374151;
  }

  :deep(.patient-table .ant-table-thead > tr > th) {
    padding: 8px;
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
    color: #4b5563;
    font-weight: 600;
  }

  :deep(.patient-table .ant-table-tbody > tr > td) {
    padding: 7px 8px;
    border-bottom: 1px solid #f1f5f9;
  }

  :deep(.patient-table .ant-table-selection-column) {
    width: 32px;
    min-width: 32px;
  }

  :deep(.patient-table .ant-table-tbody > tr:hover > td) {
    background: #f5f9ff;
  }

  .patient-link {
    max-width: 104px;
    height: auto;
    padding: 0;
    overflow: hidden;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.patient-row-selected td) {
    background: #eaf4ff !important;
  }

  .smart-query-table-page {
    display: flex;
    justify-content: flex-end;
    padding: 10px 12px;
    background: #fff;
    border-top: 1px solid #edf0f5;
  }

  .patient-detail-panel {
    min-height: calc(100vh - 190px);
  }

  .detail-spin,
  :deep(.detail-spin .ant-spin-container) {
    height: 100%;
  }

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 14px 16px;
    border-bottom: 1px solid #edf0f5;
  }

  .detail-heading {
    min-width: 0;
  }

  .detail-title {
    color: #111827;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.4;
  }

  .detail-subtitle {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    margin-top: 6px;
    color: #6b7280;
    font-size: 12px;
  }

  .detail-actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 10px;
  }

  .summary-metric {
    display: flex;
    align-items: baseline;
    gap: 5px;
    padding: 4px 9px;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
  }

  .summary-metric span {
    color: #6b7280;
    font-size: 12px;
  }

  .summary-metric strong {
    color: #1f2937;
    font-size: 16px;
    line-height: 1;
  }

  .detail-body {
    display: grid;
    height: calc(100vh - 260px);
    min-height: 420px;
    grid-template-columns: 236px minmax(0, 1fr);
    min-width: 0;
  }

  .record-tree-panel {
    overflow: auto;
    padding: 12px 10px;
    background: #f8fafc;
    border-right: 1px solid #edf0f5;
  }

  .tree-title {
    margin: 0 6px 10px;
    color: #6b7280;
    font-size: 12px;
    font-weight: 600;
  }

  :deep(.record-tree-panel .ant-tree) {
    background: transparent;
  }

  :deep(.record-tree-panel .ant-tree-switcher),
  :deep(.record-tree-panel .ant-tree-node-content-wrapper) {
    min-height: 28px;
    line-height: 28px;
  }

  :deep(.record-tree-panel .ant-tree-node-content-wrapper) {
    border-radius: 4px;
  }

  :deep(.record-tree-panel .ant-tree-node-content-wrapper.ant-tree-node-selected) {
    background: #e6f4ff;
    color: #1677ff;
  }

  .record-content-panel {
    min-width: 0;
    overflow: auto;
    padding: 14px 16px 18px;
    background: #fff;
  }

  .record-content-title,
  .record-group-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
    color: #1f2937;
    font-size: 14px;
    font-weight: 600;
  }

  .record-content-title {
    position: sticky;
    z-index: 1;
    top: -14px;
    padding: 0 0 10px;
    background: #fff;
  }

  .record-group {
    margin-bottom: 18px;
  }

  .record-row-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .record-row-card {
    padding: 12px;
    background: #fbfdff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
  }

  .record-row-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .record-row-index {
    color: #6b7280;
    font-size: 12px;
  }

  .record-descriptions {
    background: #fff;
  }

  :deep(.record-descriptions .ant-descriptions-item-label) {
    width: 118px;
    padding: 6px 8px;
    background: #f8fafc;
    color: #4b5563;
    font-weight: 500;
  }

  :deep(.record-descriptions .ant-descriptions-item-content) {
    padding: 6px 8px;
    color: #1f2937;
    word-break: break-all;
  }

  .record-child-block {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #d9dee8;
  }

  .record-child-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: #374151;
    font-size: 13px;
    font-weight: 600;
  }

  .record-child-tag {
    margin-left: 0;
  }

  .record-child-row {
    margin-bottom: 8px;
  }

  .record-empty {
    padding: 72px 0;
  }

  .detail-empty {
    display: flex;
    min-height: calc(100vh - 190px);
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .json-preview {
    max-height: 620px;
    padding: 14px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    background: #0f172a;
    border-radius: 6px;
    color: #dbeafe;
    font-size: 12px;
    line-height: 1.6;
  }

  @media (max-width: 1360px) {
    .patient-record-layout {
      grid-template-columns: 340px minmax(0, 1fr);
    }

    .detail-body {
      grid-template-columns: 220px minmax(0, 1fr);
    }
  }

  @media (max-width: 1200px) {
    .patient-record-layout {
      grid-template-columns: 1fr;
    }

    .detail-body {
      grid-template-columns: 1fr;
    }

    .patient-list-panel,
    .patient-detail-panel {
      min-height: auto;
    }

    .patient-table {
      flex: none;
    }

    .detail-body {
      height: auto;
      min-height: 0;
    }

    .detail-empty {
      min-height: 300px;
    }

    .record-tree-panel {
      max-height: 260px;
      border-right: none;
      border-bottom: 1px solid #edf0f5;
    }

    .record-content-panel {
      max-height: none;
    }
  }

  @media (max-width: 768px) {
    .patient-record-page {
      min-height: auto;
    }

    .patient-record-query-panel,
    .panel-header,
    .detail-header,
    .record-content-panel {
      padding-right: 12px;
      padding-left: 12px;
    }

    .patient-record-query-actions {
      margin-left: 0;
    }

    .detail-header,
    .detail-actions {
      align-items: flex-start;
      flex-wrap: wrap;
    }
  }
</style>
