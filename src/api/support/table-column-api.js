/*
 * @Description:表格自定义列
 * @version:


 * @LastEditors: zhuoda
 * @LastEditTime: 2022-08-21
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const tableColumnApi = {

  updateTableColumn: (param) => {
    return postRequest('/support/tableColumn/update', param);
  },


  getColumns: (tableId) => {
    return getRequest(`/support/tableColumn/getColumns/${tableId}`);
  },


  deleteColumns: (tableId) => {
    return getRequest(`/support/tableColumn/delete/${tableId}`);
  },
};
