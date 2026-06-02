/*
 * 缓存
 *
 */
import {getRequest} from '/@/lib/axios';

export const cacheApi = {

  getKeys: (cacheName) => {
    return getRequest(`/support/cache/keys/${cacheName}`);
  },

  remove: (cacheName) => {
    return getRequest(`/support/cache/remove/${cacheName}`);
  },

  getAllCacheNames: () => {
    return getRequest('/support/cache/names');
  },
};
