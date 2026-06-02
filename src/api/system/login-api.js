/*
 *  登录
 *





 */
import { getRequest, postRequest } from '/@/lib/axios';

export const loginApi = {
  /**

   */
  login: (param) => {
    return postRequest('/login', param);
  },

  channelLogin: (channelToken) => {
    return getRequest('/login/channelLogin', { channelToken });
  },

  channelMeta: (channelToken) => {
    return getRequest('/login/channelMeta', { channelToken });
  },

  /**

   */
  logout: () => {
    return getRequest('/login/logout');
  },

  /**

   */
  getCaptcha: () => {
    return getRequest('/login/getCaptcha');
  },

  /**

   */
  getLoginInfo: () => {
    return getRequest('/login/getLoginInfo');
  },

  /**

   */
  sendLoginEmailCode: (loginName) => {
    return getRequest(`/login/sendEmailCode/${loginName}`);
  },

  /**

   */
  getTwoFactorLoginFlag: () => {
    return getRequest('/login/getTwoFactorLoginFlag');
  },
};
