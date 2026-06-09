/**
 * 病例模板管理 api 封装
 */
import { getRequest, postRequest } from '/@/lib/axios';

export const caseTemplateApi = {
  queryPage: (param) => {
    return postRequest('/caseTemplate/queryPage', param);
  },

  queryList: (param) => {
    return getRequest('/caseTemplate/queryList', param);
  },

  getById: (caseTemplateId) => {
    return getRequest(`/caseTemplate/get/${caseTemplateId}`);
  },

  getEffective: (param) => {
    return getRequest('/caseTemplate/effective', param);
  },

  add: (param) => {
    return postRequest('/caseTemplate/add', param);
  },

  update: (param) => {
    return postRequest('/caseTemplate/update', param);
  },

  quoteSystem: (caseTemplateId) => {
    return postRequest(`/caseTemplate/quoteSystem/${caseTemplateId}`);
  },

  delete: (caseTemplateId) => {
    return getRequest(`/caseTemplate/delete/${caseTemplateId}`);
  },
};

export const TEMPLATE_TYPE_OPTIONS = [
  { label: '病历Prompt模板', value: 'PROMPT' },
  { label: '病历HTML样式模板', value: 'STYLESHEET' },
];

export const BUSINESS_NODE_OPTIONS = [
  { label: '门诊病历', value: 'OUTPATIENT' },
  { label: '住院病程记录', value: 'INPATIENT_COURSE' },
  { label: '术后病程记录', value: 'POSTOPERATIVE_COURSE' },
];

export const RECORD_TYPE_OPTIONS = [
  { label: '门诊病历', value: 'OUTPATIENT_MEDICAL_RECORD', businessNode: 'OUTPATIENT' },
  { label: '查房记录', value: 'WARD_ROUND_RECORD', businessNode: 'INPATIENT_COURSE' },
  { label: '交接班记录', value: 'HANDOVER_RECORD', businessNode: 'INPATIENT_COURSE' },
  { label: '术后首程记录', value: 'POSTOPERATIVE_FIRST_COURSE', businessNode: 'POSTOPERATIVE_COURSE' },
];

export const TEMPLATE_SCOPE_OPTIONS = [
  { label: '系统模板', value: 'SYSTEM' },
  { label: '个人模板', value: 'USER' },
];

export const TEMPLATE_STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

export function getOptionLabel(options, value) {
  return options.find((item) => item.value === value)?.label || value;
}
