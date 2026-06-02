/*
 * 首页api
 *





 */
import { getRequest } from '/@/lib/axios';

export const homeApi = {
  /**

   */
  homeAmountStatistics: () => {
    return getRequest('/home/amount/statistics');
  },
  /**

   */
  homeWaitHandle: () => {
    return getRequest('home/wait/handle');
  },
};
