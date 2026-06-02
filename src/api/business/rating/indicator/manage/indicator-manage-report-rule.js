/**
 * 指标填报规则配置 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorReportRuleManageApi = {

  /**
   * 查询 by indicator id  @author  Jayce
   */
  queryIndicatorReportRuleById : (id) => {
    return getRequest(`/indicatorManageReportRule/${id}`);
  },

  /**
   * 增加  @author  Jayce
   */
  add: (param) => {
    return postRequest('/indicatorManageReportRule/add', param);
  },

  /**
   * 修改  @author  Jayce
   */
  update: (param) => {
    return postRequest('/indicatorManageReportRule/update', param);
  },

  /**
   * 删除  @author  Jayce
   */
  delete: (id) => {
    return getRequest(`/indicatorManageReportRule/delete/${id}`);
  },
};
