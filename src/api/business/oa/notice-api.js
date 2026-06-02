/*
 * @Description: 公告信息、企业动态
 * @version:


 */
import { postRequest, getRequest } from '/@/lib/axios';

export const noticeApi = {
  // ---------------- 通知公告类型 -----------------------


  getAllNoticeTypeList() {
    return getRequest('/oa/noticeType/getAll');
  },


  addNoticeType(name) {
    return getRequest(`/oa/noticeType/add/${name}`);
  },


  updateNoticeType(noticeTypeId, name) {
    return getRequest(`/oa/noticeType/update/${noticeTypeId}/${name}`);
  },

  deleteNoticeType(noticeTypeId) {
    return getRequest(`/oa/noticeType/delete/${noticeTypeId}`);
  },

  // ---------------- 通知公告管理 -----------------------


  queryNotice(param) {
    return postRequest('/oa/notice/query', param);
  },


  addNotice(param) {
    return postRequest('/oa/notice/add', param);
  },


  updateNotice(param) {
    return postRequest('/oa/notice/update', param);
  },


  deleteNotice(noticeId) {
    return getRequest(`/oa/notice/delete/${noticeId}`);
  },


  getUpdateNoticeInfo(noticeId) {
    return getRequest(`/oa/notice/getUpdateVO/${noticeId}`);
  },

  // --------------------- 【员工】查看 通知公告 -------------------------


  view(noticeId) {
    return getRequest(`/oa/notice/employee/view/${noticeId}`);
  },


  queryEmployeeNotice(param) {
    return postRequest('/oa/notice/employee/query', param);
  },


  queryViewRecord(param) {
    return postRequest('/oa/notice/employee/queryViewRecord', param);
  },
};
