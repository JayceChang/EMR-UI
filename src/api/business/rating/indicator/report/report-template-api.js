import { getRequest, postRequest,postDownload } from '/@/lib/axios';

/**
 * 报告模板相关API
 */
export const reportTemplateApi = {
  /**
   * 获取指标概览数据
   * @param {Object} params - 查询参数
   * @param {string} params.periodType - 区间类型 (1-年度, 2-季度, 3-月度)
   * @param {string} params.startTime - 开始时间
   * @param {string} params.endTime - 结束时间
   * @param {string} params.indicatorCode - 指标编码 (可选)
   * @returns {Promise} API响应
   */
  getIndicatorOverview: (params) => {
    return getRequest('/indicator/report/overview', params);
  },

  /**
   * 获取公式组件数据
   * @param {Object} params - 查询参数
   * @param {string} params.periodType - 区间类型 (1-年度, 2-季度, 3-月度)
   * @param {string} params.startTime - 开始时间
   * @param {string} params.endTime - 结束时间
   * @param {string} params.indicatorCode - 指标编码 (可选)
   * @returns {Promise} API响应
   */
  getFormulaData: (params) => {
    return getRequest('/indicator/report/formula', params);
  },

  /**
   * 获取趋势图表数据
   * @param {Object} params - 查询参数
   * @param {string} params.periodType - 区间类型 (1-年度, 2-季度, 3-月度)
   * @param {string} params.startTime - 开始时间
   * @param {string} params.endTime - 结束时间
   * @param {string} params.indicatorCode - 指标编码 (可选)
   * @returns {Promise} API响应
   */
  getChartData: (params) => {
    return getRequest('/indicator/report/chart', params);
  },

  /**
   * 获取表格数据
   * @param {Object} params - 查询参数
   * @param {string} params.periodType - 区间类型 (1-年度, 2-季度, 3-月度)
   * @param {string} params.startTime - 开始时间
   * @param {string} params.endTime - 结束时间
   * @param {string} params.dataType - 数据类型 (time-时间维度, department-科室维度)
   * @param {number} params.pageNum - 当前页码
   * @param {number} params.pageSize - 每页条数
   * @param {string} params.indicatorCode - 指标编码 (可选)
   * @returns {Promise} API响应
   */
  getTableData: (params) => {
    return postRequest('/indicator/report/table', params);
  },

  /**
   * 获取指标详细信息
   * @param {Object} params - 查询参数
   * @param {string} params.indicatorCode - 指标编码
   * @returns {Promise} API响应
   */
  getIndicatorDetail: (params) => {
    return getRequest('/indicator/report/detail', params);
  },

  /**
   * 获取指标计算公式和说明
   * @param {Object} params - 查询参数
   * @param {string} params.indicatorCode - 指标编码
   * @returns {Promise} API响应
   */
  getIndicatorFormula: (params) => {
    return getRequest('/indicator/report/formula-info', params);
  },

  /**
   * 导出报告数据
   * @returns {Promise} API响应
   */
  exportReport: (params) => {
    return postDownload('/indicator/report/export', params);
  },

  /**
   * 导出指标报告查询数据
   * @returns {Promise} API响应
   */
  exportReportQuery: (params) => {
    return postDownload('/indicator/report/query/export', params);
  }
};
