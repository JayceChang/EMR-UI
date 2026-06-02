/**
 * 数据源配置 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const datasourceApi = {

  /**
   * 分页查询  @author  Jayce
   */
  queryPage : (param) => {
    return postRequest('/datasource/queryPage', param);
  },

  /**
   * 增加  @author  Jayce
   */
  add: (param) => {
      return postRequest('/datasource/add', param);
  },

  /**
   * 修改  @author  Jayce
   */
  update: (param) => {
      return postRequest('/datasource/update', param);
  },


  /**
   * 删除  @author  Jayce
   */
  delete: (id) => {
      return getRequest(`/datasource/delete/${id}`);
  },

  /**
   * 批量删除  @author  Jayce
   */
  batchDelete: (idList) => {
      return postRequest('/datasource/batchDelete', idList);
  },

};
