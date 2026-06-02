/*
 * 配置
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const configApi = {

  queryList: (param) => {
    return postRequest('/support/config/query', param);
  },

  addConfig: (param) => {
    return postRequest('/support/config/add', param);
  },

  updateConfig: (param) => {
    return postRequest('/support/config/update', param);
  },

  queryByKey: (param) => {
    return getRequest(`/support/config/queryByKey?configKey=${param}`);
  },
};
