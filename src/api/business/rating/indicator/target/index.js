/**
 * 指标配置 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const  indicatorTargetApi = {
  /**
   * 分页查询  @author  Jayce
   */
  queryPage: (param) => {
    return postRequest('/indicatorTarget/queryPage', param);
  },

  /**
   * 增加  @author  Jayce
   */
  add: (param) => {
    return postRequest('/indicatorTarget/add', param);
  },

  /**
   * 修改  @author  Jayce
   */
  update: (param) => {
    return postRequest('/indicatorTarget/update', param);
  },

  /**
   * 删除  @author  Jayce
   */
  delete: (id) => {
    return getRequest(`/indicatorTarget/delete/${id}`);
  },

  /**
   * 批量删除  @author  Jayce
   */
  batchDelete: (idList) => {
    return postRequest('/indicatorTarget/batchDelete', idList);
  },

  /**
   * 获取指标树  @author  Jayce
   */
  queryIndicatorTarget: () => {
    return getRequest('/indicatorTarget/tree');
  },
};
