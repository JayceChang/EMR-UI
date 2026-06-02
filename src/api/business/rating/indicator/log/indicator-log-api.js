/**
 * 指标日志 api 封装
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorLogApi = {
  /**
   * 分页查询
   */
  queryPage: (param) => {
    return postRequest('/indicatorDetailOperateLog/queryPage', param);
  },

  /**
   * 获取详情
   */
  getDetail: (id) => {
    return getRequest(`/indicatorDetailOperateLog/detail/${id}`);
  },

  /**
   * 导出日志
   */
  exportLog: (param) => {
    return postRequest('/indicatorDetailOperateLog/export', param, { responseType: 'blob' });
  }
};