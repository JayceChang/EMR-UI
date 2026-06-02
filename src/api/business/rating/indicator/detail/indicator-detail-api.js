/**
 * 指标明细 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorDetailApi = {

  /**
   * 分页查询  @author  Jayce
   */
  queryPage : (param) => {
    return postRequest('/indicatorDetail/queryPage', param);
  },

  /**
   * 增加  @author  Jayce
   */
  add: (param) => {
      return postRequest('/indicatorDetail/add', param);
  },

  /**
   * 修改  @author  Jayce
   */
  update: (param) => {
      return postRequest('/indicatorDetail/update', param);
  },


  /**
   * 删除  @author  Jayce
   */
  delete: (id) => {
      return getRequest(`/indicatorDetail/delete/${id}`);
  },

  /**
   * 批量删除  @author  Jayce
   */
  batchDelete: (idList) => {
      return postRequest('/indicatorDetail/batchDelete', idList);
  },

};
