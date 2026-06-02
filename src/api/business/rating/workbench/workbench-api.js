import { getRequest } from '/@/lib/axios';

/**
 * 工作台相关API
 */
export const workbenchApi = {
  /**
   * 获取工作台统计数据
   * @returns {Promise} API响应
   */
  getStatisticsData: () => {
    return getRequest('/business/rating/workbench/statistics');
  },

  /**
   * 获取待办事项统计
   * @returns {Promise} API响应
   */
  getTodoStatistics: () => {
    return getRequest('/business/rating/workbench/todo-statistics');
  },

  /**
   * 获取审批统计数据
   * @returns {Promise} API响应
   */
  getApprovalStatistics: () => {
    return getRequest('/business/rating/workbench/approval-statistics');
  },

  /**
   * 获取用户信息
   * @param {string|number} userId - 用户ID（path参数）
   * @returns {Promise} API响应
   */
  userInfo: (userId) => {
    return getRequest(`/workbench/user/${userId}`);
  },

  /**
   * 获取用户未读消息
   * @param {string|number} userId - 用户ID（path参数）
   * @returns {Promise} API响应
   */
  unReadMsgAndNotice: (userId) => {
    return getRequest(`/workbench/user/${userId}/msg`);
  },
  
  /**
   * 获取关注指标
   * @returns 关注指标列表
   */
  getFocusIndicators: (userId) => {
    return getRequest(`/workbench/user/${userId}/focus-indicators`);
  },

  /**
   * 获取填报进度
   * @returns 填报进度统计列表
   */
  getReportingProgress: (userId) => {
    return getRequest(`/workbench/user/${userId}/report-progress`);
  }
};
