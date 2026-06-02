/* 
  * OA发票信息
  * 
  */
import { postRequest, getRequest } from '/@/lib/axios';

export const invoiceApi = {


  create: (param) => {
    return postRequest('/oa/invoice/create', param);
  },


  delete: (bankId) => {
    return getRequest(`/oa/invoice/delete/${bankId}`);
  },


  detail: (bankId) => {
    return getRequest(`//oa/invoice/get/${bankId}`);
  },


  pageQuery: (param) => {
    return postRequest('/oa/invoice/page/query', param);
  },


  update: (param) => {
    return postRequest('/oa/invoice/update', param);
  },


  queryList: (enterpriseId) => {
    return getRequest(`/oa/invoice/query/list/${enterpriseId}`);
  },

};
