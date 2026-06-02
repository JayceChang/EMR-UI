/*
 * 单据序列号
 *





 */
import { postRequest, getRequest } from '/@/lib/axios';

export const serialNumberApi = {

  generate: (generateForm) => {
    return postRequest('/support/serialNumber/generate', generateForm);
  },

  getAll: () => {
    return getRequest('/support/serialNumber/all');
  },

  queryRecord: (form) => {
    return postRequest('/support/serialNumber/queryRecord', form);
  },
};
