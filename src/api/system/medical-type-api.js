import { getRequest } from '/@/lib/axios';

/**
 * 医疗类别 API
 */
export const MedicalTypeAPI = {
  /**
   * 获取医疗类别列表
   * @param {string} type - 类型：1门诊 2住院，为空则查询全部
   * @returns {Promise} 医疗类别列表
   */
  getMedicalTypeList: (type) => {
    return getRequest('/system/medical-type/list', { type });
  }
};
