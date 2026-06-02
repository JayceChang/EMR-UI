/*
 * 登录日志
 *





 */
import { postRequest, getRequest } from '/@/lib/axios';

export const loginLogApi = {

  queryList: (param) => {
    return postRequest('/support/loginLog/page/query', param);
  },

  queryListLogin: (param) => {
    return postRequest('/support/loginLog/page/query/login', param);
  },
};
