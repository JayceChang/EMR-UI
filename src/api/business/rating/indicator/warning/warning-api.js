import { getRequest, postRequest } from '/@/lib/axios';

/**
 * 预警信息相关API
 */
export const warningApi = {
  /**
   * 获取预警信息列表
   * @param {Object} params - 查询参数
   * @param {string} params.indicator - 预警指标名称
   * @param {string} params.status - 预警状态
   * @param {Array} params.dateRange - 日期范围
   * @param {number} params.current - 当前页码
   * @param {number} params.pageSize - 每页条数
   * @returns {Promise} API响应
   */
  getWarningList: (params) => {
    return postRequest('/warning/message', params);
  },

  /**
   * 获取预警信息详情
   * @param {string|number} id - 预警ID
   * @returns {Promise} API响应
   */
  getWarningDetail: (id) => {
    return getRequest(`/business/rating/indicator/warning/${id}`);
  },

  /**
   * 处理预警信息
   * @param {Object} data - 处理数据
   * @param {string|number} data.id - 预警ID
   * @param {string} data.processType - 处理方式 (ignore|resolve|follow)
   * @param {string} data.remark - 处理说明
   * @returns {Promise} API响应
   */
  processWarning: (data) => {
    return postRequest('/warning/process', data);
  },

  /**
   * 批量处理预警信息
   * @param {Object} data - 批量处理数据
   * @param {Array} data.ids - 预警ID数组
   * @param {string} data.processType - 处理方式
   * @param {string} data.remark - 处理说明
   * @returns {Promise} API响应
   */
  batchProcessWarning: (data) => {
    return postRequest('/business/rating/indicator/warning/batch-process', data);
  },

  /**
   * 导出预警信息
   * @param {Object} params - 导出参数
   * @returns {Promise} API响应
   */
  exportWarningList: (params) => {
    return getRequest('/business/rating/indicator/warning/export', params, {
      responseType: 'blob'
    });
  },

  /**
   * 获取预警统计信息
   * @param {Object} params - 查询参数
   * @returns {Promise} API响应
   */
  getWarningStatistics: (params) => {
    return getRequest('/business/rating/indicator/warning/statistics', params);
  },

  /**
   * 获取预警配置
   * @returns {Promise} API响应
   */
  getWarningConfig: () => {
    return getRequest('/business/rating/indicator/warning/config');
  },

  /**
   * 更新预警配置
   * @param {Object} data - 配置数据
   * @returns {Promise} API响应
   */
  updateWarningConfig: (data) => {
    return postRequest('/business/rating/indicator/warning/config', data);
  },

  /**
   * 获取工作台预警信息（用于首页展示）
   * @param {Object} params - 查询参数
   * @param {number} params.limit - 限制条数，默认5条
   * @returns {Promise} API响应
   */
  getWorkbenchWarnings: (params = { limit: 5 }) => {
    return getRequest('/business/rating/indicator/warning/workbench', params);
  }
};