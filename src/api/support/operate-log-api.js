/*
 * 操作日志
 *





 */
import { postRequest, getRequest } from '/@/lib/axios';

export const operateLogApi = {

  queryList: (param) => {
    return postRequest('/support/operateLog/page/query', param);
  },

  detail: (id) => {
    return getRequest(`/support/operateLog/detail/${id}`);
  },

  queryListLogin: (param) => {
    return postRequest('/support/operateLog/page/query/login', param);
  },
};
