/**
 * 角色指标权限 API
 */
import { getRequest, postRequest } from '/@/lib/axios';

export const roleIndicatorApi = {
  /**
   * 根据角色ID查询指标权限
   */
  queryByRoleId: (roleId) => {
    return getRequest(`roleIndicator/queryByRoleId/${roleId}`);
  },
  
  /**
   * 批量保存角色指标权限
   */
  saveRoleIndicator: (data) => {
    return postRequest('/roleIndicator/batchSetRoleIndicator', data);
  },
  
  /**
   * 删除角色指标权限
   */
  delete: (id) => {
    return getRequest(`roleIndicator/delete/${id}`);
  }
};