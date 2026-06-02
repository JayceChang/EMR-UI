import { getRequest, postRequest } from '/@/lib/axios';

/**
 * 医保费用趋势分析 API
 */
export const ExpenseTrendAPI = {
  /**
   * 获取区县列表
   * @returns {Promise}
   */
  getDistrictList: () => {
    return getRequest('/expense-trend/district/list');
  },

  /**
   * 获取统计数据
   * @param {Object} params - 查询参数
   * @param {string} params.viewMode - 视图模式: month/year
   * @param {string} params.startMonth - 开始月份 (YYYY-MM)
   * @param {string} params.endMonth - 结束月份 (YYYY-MM)
   * @param {string} params.startYear - 开始年份 (YYYY)
   * @param {string} params.endYear - 结束年份 (YYYY)
   * @param {string} params.districtCode - 区县编码
   * @param {string} params.category - 费用分类
   * @returns {Promise}
   */
  getStatsData: (params) => {
    return getRequest('/expense-trend/stats', params);
  },

  /**
   * 获取趋势数据
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getTrendData: (params) => {
    return getRequest('/expense-trend/trend', params);
  },

  /**
   * 获取分类数据
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getCategoryData: (params) => {
    return getRequest('/expense-trend/category', params);
  },

  /**
   * 获取分类表格数据
   * @param {Object} params - 查询参数
   * @param {number} params.pageNum - 页码
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise}
   */
  getCategoryTableData: (params) => {
    return getRequest('/expense-trend/category/table', params);
  },

  /**
   * 导出统计数据
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  exportStats: (params) => {
    return postRequest('/expense-trend/export', params, {
      responseType: 'blob'
    });
  }
};