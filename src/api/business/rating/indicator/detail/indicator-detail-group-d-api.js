/**
 * 指标日分组数据 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorDetailGroupDApi = {

  /**
   * 分页查询  @author  Jayce
   */
  queryPage : (param) => {
    return postRequest('/indicatorDetailGroupD/queryPage', param);
  },

  /**
   * 增加  @author  Jayce
   */
  add: (param) => {
      return postRequest('/indicatorDetailGroupD/add', param);
  },

  /**
   * 修改  @author  Jayce
   */
  update: (param) => {
      return postRequest('/indicatorDetailGroupD/update', param);
  },


  /**
   * 删除  @author  Jayce
   */
  delete: (id) => {
      return getRequest(`/indicatorDetailGroupD/delete/${id}`);
  },

  /**
   * 批量删除  @author  Jayce
   */
  batchDelete: (idList) => {
      return postRequest('/indicatorDetailGroupD/batchDelete', idList);
  },

};
