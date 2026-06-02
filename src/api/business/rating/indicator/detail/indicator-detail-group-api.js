/**
 * 指标分组数据 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorDetailGroupApi = {

  /**
   * 分页查询  @author  Jayce
   */
  queryPage : (param) => {
    return postRequest('/indicatorDetailGroup/queryPage', param);
  },

  /**
   * 增加  @author  Jayce
   */
  add: (param) => {
      return postRequest('/indicatorDetailGroup/add', param);
  },

  /**
   * 修改  @author  Jayce
   */
  update: (param) => {
      return postRequest('/indicatorDetailGroup/update', param);
  },


  /**
   * 删除  @author  Jayce
   */
  delete: (id) => {
      return getRequest(`/indicatorDetailGroup/delete/${id}`);
  },

  /**
   * 批量删除  @author  Jayce
   */
  batchDelete: (idList) => {
      return postRequest('/indicatorDetailGroup/batchDelete', idList);
  },

};
