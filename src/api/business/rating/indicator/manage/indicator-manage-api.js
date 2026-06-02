/**
 * 指标配置 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorManageApi = {
  /**
   * 分页查询  @author  Jayce
   */
  queryPage: (param) => {
    return postRequest('/indicatorManage/queryPage', param);
  },

  /**
   * 查询 by indicator id  @author  Jayce
   */
  queryIndicatorById : (id) => {
    return getRequest(`/indicatorManage/${id}`);
  },

  /**
   * 增加  @author  Jayce
   */
  add: (param) => {
    return postRequest('/indicatorManage/add', param);
  },

  /**
   * 修改  @author  Jayce
   */
  update: (param) => {
    return postRequest('/indicatorManage/update', param);
  },

  /**
   * 删除  @author  Jayce
   */
  delete: (id) => {
    return getRequest(`/indicatorManage/delete/${id}`);
  },

  /**
   * 批量删除  @author  Jayce
   */
  batchDelete: (idList) => {
    return postRequest('/indicatorManage/batchDelete', idList);
  },

  /**
   * 获取指标树  @author  Jayce
   */
  queryIndicatorTree: () => {
    return getRequest('/indicatorManage/tree');
  },

  /**
   * 获取特定指标树  @author  Jayce
   */
  querySpecificIndicatorTree: (parentId) => {
    return getRequest(`/indicatorManage/trees/${parentId}`);
  },

  /**
   * 检查指标编码是否存在  @author  Jayce
   * @param {string} indicatorCode 指标编码
   * @param {number} excludeId 排除的ID（编辑时使用）
   */
  checkIndicatorCodeExists: (indicatorCode, excludeId) => {
    const params = { indicatorCode };
    if (excludeId) {
      params.excludeId = excludeId;
    }
    return getRequest('/indicatorManage/checkCode', params);
  },
};
