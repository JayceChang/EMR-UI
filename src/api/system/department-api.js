/*
 * 部门
 *





 */
import { getRequest, postRequest } from '/@/lib/axios';

export const departmentApi = {
  /**

   */
  queryAllDepartment: () => {
    return getRequest('/department/listAll');
  },

  /**

   */
  queryDepartmentTree: () => {
    return getRequest('/department/treeList');
  },

  /**

   */
  addDepartment: (param) => {
    return postRequest('/department/add', param);
  },
  /**

   */
  updateDepartment: (param) => {
    return postRequest('/department/update', param);
  },
  /**
   * 删除
   */
  deleteDepartment: (departmentId) => {
    return getRequest(`/department/delete/${departmentId}`);
  },
};
