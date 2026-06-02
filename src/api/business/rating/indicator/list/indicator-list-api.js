/**
 * 指标列表 api 封装
 *
 */
import { postRequest, getRequest, postDownload } from '/@/lib/axios';

export const indicatorListApi = {

  /**
   * 指标列表查询  @author  Jayce
   */
  query : (param) => {
    return postRequest('/indicatorList/query', param);
  },

  /**
   * 导出指标列表数据为Excel  @author  Jayce
   */
  exportExcel : (param) => {
    return postDownload('/indicatorList/exportExcel', param);
  },

};
