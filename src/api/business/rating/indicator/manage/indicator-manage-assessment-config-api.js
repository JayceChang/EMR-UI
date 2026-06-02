/**
 * 指标自评配置 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorAssessmentConfigApi = {

  /**
   * 查询 by indicator id  @author  Jayce
   */
  queryIndicatorAssessmentConfigById : (id) => {
    return getRequest(`/indicatorManageAssessmentConfig/${id}`);
  },

  /**
   * 增加  @author  Jayce
   */
  add: (param) => {
    return postRequest('/indicatorManageAssessmentConfig/add', param);
  },

  /**
   * 修改  @author  Jayce
   */
  update: (param) => {
    return postRequest('/indicatorManageAssessmentConfig/update', param);
  },

  /**
   * 删除  @author  Jayce
   */
  delete: (id) => {
    return getRequest(`/indicatorManageAssessmentConfig/delete/${id}`);
  },
};
