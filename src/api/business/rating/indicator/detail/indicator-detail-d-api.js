/**
 * 指标日明细 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorDetailDApi = {

  /**
   * 分页查询  @author  Jayce
   */
  queryPage : (param) => {
    return postRequest('/indicatorDetailD/queryPage', param);
  },

  /**
   * 增加  @author  Jayce
   */
  add: (param) => {
      return postRequest('/indicatorDetailD/add', param);
  },

  /**
   * 修改  @author  Jayce
   */
  update: (param) => {
      return postRequest('/indicatorDetailD/update', param);
  },


  /**
   * 删除  @author  Jayce
   */
  delete: (id) => {
      return getRequest(`/indicatorDetailD/delete/${id}`);
  },

  /**
   * 批量删除  @author  Jayce
   */
  batchDelete: (idList) => {
      return postRequest('/indicatorDetailD/batchDelete', idList);
  },

};
