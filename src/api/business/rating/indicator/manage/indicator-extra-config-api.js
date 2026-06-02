/**
 * 指标取数配置 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorExtraConfigApi = {

  /**
   * 分页查询  @author  Jayce
   */
  queryPage : (param) => {
    return postRequest('/indicator/extra/config/queryPage', param);
  },

  /**
   * 查询 by indicator id  @author  Jayce
   */
  queryIndicatorById : (indicatorId) => {
    return getRequest(`/indicator/extra/config/${indicatorId}`);
  },

  /**
   * 增加  @author  Jayce
   */
  add: (param) => {
      return postRequest('/indicator/extra/config/add', param);
  },

  /**
   * 修改  @author  Jayce
   */
  update: (param) => {
      return postRequest('/indicator/extra/config/update', param);
  },


  /**
   * 删除  @author  Jayce
   */
  delete: (id) => {
      return getRequest(`/indicator/extra/config/delete/${id}`);
  },

  /**
   * 批量删除  @author  Jayce
   */
  batchDelete: (idList) => {
      return postRequest('/indicator/extra/config/batchDelete', idList);
  },

};
