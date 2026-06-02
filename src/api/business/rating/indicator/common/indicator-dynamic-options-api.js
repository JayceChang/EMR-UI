/**
 * 指标动态下拉选项 api 封装
 *
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorDynamicOptionsApi = {
  /**
   * 获取下拉项  @author  Jayce
   */
  querySelectOptions: () => {
    return getRequest('/indicator/select/options');
  },
};
