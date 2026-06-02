import { getRequest, postRequest } from '/@/lib/axios';

export const messageApi = {
  // 通知消息-分页查询
  queryMessage: (param) => {
    return postRequest('/support/message/queryMyMessage', param);
  },
  // 通知消息-查询未读消息数
  queryUnreadCount: () => {
    return getRequest('/support/message/getUnreadCount');
  },
  // 通知消息-标记已读
  updateReadFlag: (messageId) => {
    return getRequest(`/support/message/read/${messageId}`);
  },
  //通知公告-标记已读
  noticeView:(messageId)=>{
    return getRequest(`/oa/notice/employee/view/${messageId}`)
  },


  queryAdminMessage: (param) => {
    return postRequest('/message/query', param);
  },


  sendMessages: (param) => {
    return postRequest('/message/sendMessages', param);
  },


  deleteMessage: (messageId) => {
    return getRequest(`/message/delete/${messageId}`);
  },
};
