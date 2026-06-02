import { getRequest } from '/@/lib/axios';

/**
 * ICD病种 API
 * 公共模块，其他模块可以复用
 */
export const DiseaseAPI = {
  /**
   * 获取ICD病种树形结构
   * 包含：病种类别 -> 病种类目 -> 病种亚目
   * @returns {Promise} ICD病种树形结构
   */
  getDiseaseTree: () => {
    return getRequest('/system/disease/tree');
  }
};
