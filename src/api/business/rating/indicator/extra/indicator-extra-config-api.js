/**
 * 指标Win服务取数基本配置 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorExtraConfigApi = {

  /**
   * 分页查询  @author  Jayce
   */
  queryPage : (param) => {
    return postRequest('/indicatorConfig/queryPage', param);
  },

  /**
   * 增加  @author  Jayce
   */
  add: (param) => {
      return postRequest('/indicatorConfig/add', param);
  },

  /**
   * 修改  @author  Jayce
   */
  update: (param) => {
      return postRequest('/indicatorConfig/update', param);
  },


  /**
   * 删除  @author  Jayce
   */
  delete: (id) => {
      return getRequest(`/indicatorConfig/delete/${id}`);
  },

  /**
   * 批量删除  @author  Jayce
   */
  batchDelete: (idList) => {
      return postRequest('/indicatorConfig/batchDelete', idList);
  },

};
