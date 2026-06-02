/**
 * 指标配置日志 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorConfigLogApi = {
  /**
   * 分页查询数据处理日志
   * @param {Object} param 查询参数
   * @returns {Promise} 返回分页数据
   */
  queryPage: (param) => {
    return postRequest('/indicator/config/log/queryPage', param);
  },

  /**
   * 根据ID获取日志详情
   * @param {Number} id 日志ID
   * @returns {Promise} 返回日志详情
   */
  getDetail: (id) => {
    return getRequest(`/indicator/config/log/detail/${id}`);
  },

  /**
   * 导出日志数据
   * @param {Object} param 导出参数
   * @returns {Promise} 返回文件流
   */
  exportLog: (param) => {
    return postRequest('/indicator/config/log/export', param, { responseType: 'blob' });
  }
};
