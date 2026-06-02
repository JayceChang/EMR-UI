import { getRequest } from '/@/lib/axios';

/**
 * 医疗机构级别 API
 * 公共模块，其他模块可以复用
 */
export const MedicalInstitutionLevelAPI = {
  /**
   * 获取医疗机构级别列表
   * @returns {Promise} 医疗机构级别列表
   */
  getLevelList: () => {
    return getRequest('/system/medical-institution-level/list');
  }
};
