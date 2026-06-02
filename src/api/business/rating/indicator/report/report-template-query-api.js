import { getRequest, postRequest } from '/@/lib/axios';

/**
 * 报告列表查询相关API
 */
export const reportTemplateQueryApi = {
  /**
   * 获取指标概览数据
   * @param {Object} params - 查询参数
   */
  getIndicatorReportTemplateData: (params) => {
    return postRequest('/indicator/report/template/query/table', params);
  },

  
};
