/*
 * 银行卡
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const bankApi = {

  create: (param) => {
    return postRequest('/oa/bank/create', param);
  },


  delete: (bankId) => {
    return getRequest(`/oa/bank/delete/${bankId}`);
  },


  detail: (bankId) => {
    return getRequest(`/oa/bank/get/${bankId}`);
  },


  pageQuery: (param) => {
    return postRequest('/oa/bank/page/query', param);
  },


  update: (param) => {
    return postRequest('/oa/bank/update', param);
  },


  queryList: (enterpriseId) => {
    return getRequest(`/oa/bank/query/list/${enterpriseId}`);
  },
};
