/*
 * reload (内存热加载、钩子等)
 *





 */
import { postRequest, getRequest } from '/@/lib/axios';

export const reloadApi = {

  queryList: () => {
    return getRequest('/support/reload/query');
  },

  queryReloadResult: (tag) => {
    return getRequest(`/support/reload/result/${tag}`);
  },

  reload: (reloadForm) => {
    return postRequest('/support/reload/update', reloadForm);
  },
};
