/**
 * 前端指标配置 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorFrontEndApi = {
  /**
   * 分页查询  @author  Jayce
   */
  queryPage: (param) => {
    return postRequest('/indicatorFrontEnd/queryPage', param);
  },

  /**
   * 查询 by indicator id  @author  Jayce
   */
  queryIndicatorById: (id) => {
    return getRequest(`/indicatorFrontEnd/${id}`);
  },

  /**
   * 增加  @author  Jayce
   */
  add: (param) => {
    return postRequest('/indicatorFrontEnd/add', param);
  },

  /**
   * 修改  @author  Jayce
   */
  update: (param) => {
    return postRequest('/indicatorFrontEnd/update', param);
  },

  /**
   * 删除  @author  Jayce
   */
  delete: (id) => {
    return getRequest(`/indicatorFrontEnd/delete/${id}`);
  },

  /**
   * 批量删除  @author  Jayce
   */
  batchDelete: (idList) => {
    return postRequest('/indicatorFrontEnd/batchDelete', idList);
  },

  /**
   * 获取指标树  @author  Jayce
   */
  queryIndicatorTree: () => {
    return getRequest('/indicatorFrontEnd/tree');
  },

  /**
   * 查询登录用户指标树  @author  Jayce
   */
  queryIndicatorFrontEndTreeByLoginUser: () => {
    return getRequest('/indicatorFrontEnd/login-user/tree');
  },
};
