/*
 * 数据变动
 *
 */
import { postRequest } from '/@/lib/axios';

export const dataTracerApi = {

  queryList: (param) => {
    return postRequest('/support/dataTracer/query', param);
  },
  
};
