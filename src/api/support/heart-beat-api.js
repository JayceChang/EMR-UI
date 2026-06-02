/*
 * 心跳
 *
 */
import { postRequest } from '/@/lib/axios';

export const heartBeatApi = {

  queryList: (param) => {
    return postRequest('/support/heartBeat/query', param);
  },
};
