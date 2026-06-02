/*
 * 医疗集团区划管理 API
 */
import { getRequest, postRequest } from '/@/lib/axios';

export const medicalGroupDivisionApi = {
  /**
   * 分页查询医疗集团区划列表
   */
  queryPage: (param) => {
    return postRequest('/medicalGroupDivision/queryPage', param);
  },

  /**
   * 根据联合主键查询医疗集团区划信息
   */
  getByKey: (jtbh, qhbh) => {
    return getRequest('/medicalGroupDivision/get', { jtbh, qhbh });
  },

  /**
   * 新增医疗集团区划
   */
  add: (param) => {
    return postRequest('/medicalGroupDivision/add', param);
  },

  /**
   * 更新医疗集团区划
   */
  update: (param) => {
    return postRequest('/medicalGroupDivision/update', param);
  },

  /**
   * 删除医疗集团区划
   */
  delete: (jtbh, qhbh) => {
    return getRequest('/medicalGroupDivision/delete', { jtbh, qhbh });
  },

  /**
   * 批量删除医疗集团区划
   */
  batchDelete: (list) => {
    return postRequest('/medicalGroupDivision/batchDelete', list);
  },
};

// 状态选项
export const statusOptions = [
  { value: 1, label: '正常' },
  { value: 0, label: '停用' },
];
