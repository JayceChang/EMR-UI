/**
 * 指标解读配置 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorExplainManageApi = {

  /**
   * 查询 by indicator id  @author  Jayce
   */
  queryIndicatorExplainById : (id) => {
    return getRequest(`/indicatorManageExplain/${id}`);
  },

  /**
   * 增加  @author  Jayce
   */
  add: (param) => {
    return postRequest('/indicatorManageExplain/add', param);
  },

  /**
   * 修改  @author  Jayce
   */
  update: (param) => {
    return postRequest('/indicatorManageExplain/update', param);
  },

  /**
   * 删除  @author  Jayce
   */
  delete: (id) => {
    return getRequest(`/indicatorManageExplain/delete/${id}`);
  },
};
