/*
 * 帮助文档 目录
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const helpDocCatalogApi = {

  getAll: () => {
    return getRequest('/support/helpDoc/helpDocCatalog/getAll');
  },


  add: (param) => {
    return postRequest('/support/helpDoc/helpDocCatalog/add', param);
  },


  update: (param) => {
    return postRequest('/support/helpDoc/helpDocCatalog/update', param);
  },


  delete: (helpDocCatalogId) => {
    return getRequest(`/support/helpDoc/helpDocCatalog/delete/${helpDocCatalogId}`);
  },
};
