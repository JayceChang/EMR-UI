import { getRequest } from '/@/lib/axios';

/**
 * 行政区划 API
 * 公共模块，其他模块可以复用
 */
export const AdministrativeDistrictAPI = {
  /**
   * 获取行政区划列表
   * @param {string} levels - 级别列表（支持多个，用逗号分隔，如：'2,3'，默认'3'）
   * @returns {Promise} 行政区划列表
   */
  getDistrictList: (levels = '3') => {
    return getRequest('/system/administrative-district/list', { levels });
  },

  /**
   * 根据父级编码获取下级行政区划
   * @param {string} parentCode - 父级编码
   * @returns {Promise} 下级行政区划列表
   */
  getDistrictByParent: (parentCode) => {
    return getRequest('/system/administrative-district/children', { parentCode });
  },

  /**
   * 根据编码获取行政区划详情
   * @param {string} code - 编码
   * @returns {Promise} 行政区划详情
   */
  getDistrictByCode: (code) => {
    return getRequest(`/system/administrative-district/detail/${code}`);
  }
};
