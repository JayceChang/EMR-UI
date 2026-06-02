/**
 * 科室 api 封装
 *
 */


import { postRequest, getRequest } from '/@/lib/axios';
export const indicatorDepartmentApi = {
    /**
   * 获取科室 
   */
  queryDepartment: () => {
    //support/dict/dictData/queryDictData/2
    return getRequest('/support/dict/dictData/queryDictData/2');
  },

  /**
   * 搜索科室
   */
  searchDepartment: (params) => {
    return postRequest('/support/dict/dictData/searchDictData/2', params);
  },
}