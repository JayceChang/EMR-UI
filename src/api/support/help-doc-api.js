/*
 * 帮助文档
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const helpDocApi = {

  query: (param) => {
    return postRequest('/support/helpDoc/query', param);
  },


  update: (param) => {
    return postRequest('/support/helpDoc/update', param);
  },


  add: (param) => {
    return postRequest('/support/helpDoc/add', param);
  },


  delete: (helpDocId) => {
    return getRequest(`/support/helpDoc/delete/${helpDocId}`);
  },


  getDetail: (helpDocId) => {
    return getRequest(`/support/helpDoc/getDetail/${helpDocId}`);
  },


  queryHelpDocByRelationId: (relationId) => {
    return getRequest(`/support/helpDoc/queryHelpDocByRelationId/${relationId}`);
  },

  //----------------------- 用户相关 --------------------------------


  getAllHelpDocList() {
    return getRequest('/support/helpDoc/user/queryAllHelpDocList');
  },


  view(helpDocId) {
    return getRequest(`/support/helpDoc/user/view/${helpDocId}`);
  },


  queryViewRecord(param) {
    return postRequest('/support/helpDoc/user/queryViewRecord', param);
  },
};
