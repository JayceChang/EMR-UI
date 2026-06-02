/**
 * 角色前端指标权限 API
 */
import { getRequest, postRequest } from '/@/lib/axios';

export const roleIndicatorFrontEndApi = {
  /**
   * 根据角色ID查询指标权限
   */
  queryByRoleId: (roleId) => {
    return getRequest(`roleIndicatorFrontEnd/queryByRoleId/${roleId}`);
  },
  
  /**
   * 批量保存角色指标权限
   */
  saveRoleIndicator: (data) => {
    return postRequest('/roleIndicatorFrontEnd/batchSetRoleIndicator', data);
  },
  
  /**
   * 删除角色指标权限
   */
  delete: (id) => {
    return getRequest(`roleIndicatorFrontEnd/delete/${id}`);
  }
};