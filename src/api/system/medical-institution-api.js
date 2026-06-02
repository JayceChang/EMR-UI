/*
 * 医疗机构管理 API
 */
import { getRequest, postRequest } from '/@/lib/axios';

export const medicalInstitutionApi = {
  /**
   * 分页查询医疗机构
   */
  queryPage: (param) => {
    return postRequest('/medicalInstitution/queryPage', param);
  },

  /**
   * 获取全部医疗机构列表
   */
  listAll: () => {
    return getRequest('/medicalInstitution/listAll');
  },

  /**
   * 根据医院ID查询
   */
  getById: (yyid) => {
    return getRequest(`/medicalInstitution/get/${yyid}`);
  },

  /**
   * 添加医疗机构
   */
  add: (param) => {
    return postRequest('/medicalInstitution/add', param);
  },

  /**
   * 更新医疗机构
   */
  update: (param) => {
    return postRequest('/medicalInstitution/update', param);
  },

  /**
   * 删除医疗机构
   */
  delete: (yyid) => {
    return getRequest(`/medicalInstitution/delete/${yyid}`);
  },

  /**
   * 根据行政区划查询医疗机构
   */
  listByXzjgid: (xzjgid) => {
    return getRequest(`/medicalInstitution/listByXzjgid/${xzjgid}`);
  },

  /**
   * 根据行政区划查询住院医院列表
   */
  listHospitalByXzjgid: (xzjgid) => {
    return getRequest(`/medicalInstitution/listHospitalByXzjgid/${xzjgid}`);
  },
};

// 医院级别选项
export const hospitalLevelOptions = [
  { value: '1', label: '省级医院' },
  { value: '2', label: '市级医院' },
  { value: '3', label: '县级医院' },
  { value: '4', label: '卫生院' },
  { value: '5', label: '村卫生室' },
];

// 医疗级别选项
export const medicalLevelOptions = [
  { value: '三甲', label: '三甲' },
  { value: '三级', label: '三级' },
  { value: '二级', label: '二级' },
  { value: '一级', label: '一级' },
  { value: '未定级', label: '未定级' },
];

// 状态选项
export const statusOptions = [
  { value: 1, label: '正常' },
  { value: 0, label: '停用' },
];
