/**
 * 指标取数配置Test api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorExtraConfigTestApi = {

  /**
   * 增加  @author  Jayce
   */
  test: (param) => {
      return postRequest('/indicator/extra/config/test/test', param);
  },

};
