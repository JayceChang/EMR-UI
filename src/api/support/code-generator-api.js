/*
 * 代码生成器
 */
import { getRequest, postRequest, getDownload } from '/@/lib/axios';

export const codeGeneratorApi = {

  queryTableList: (param) => {
    return postRequest('/support/codeGenerator/table/queryTableList', param);
  },


  getTableColumns: (table) => {
    return getRequest(`/support/codeGenerator/table/getTableColumns/${table}`);
  },

  // ------------------- 配置 -------------------


  getConfig: (table) => {
    return getRequest(`/support/codeGenerator/table/getConfig/${table}`);
  },


  updateConfig: (param) => {
    return postRequest('/support/codeGenerator/table/updateConfig', param);
  },

  // ------------------- 生成 -------------------


  preview: (param) => {
    return postRequest('/support/codeGenerator/code/preview', param);
  },


  downloadCode: (tableName) => {
    return getDownload(`/support/codeGenerator/code/download/${tableName}`);
  },
};
