/*
 * HIS 组织同步
 */
import { postRequest } from '/@/lib/axios';

export const hisOrganizationSyncApi = {
  sync: () => {
    return postRequest('/his/organization/sync');
  },
};
