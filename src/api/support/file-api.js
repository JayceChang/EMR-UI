/*
 * 文件上传
 *
 */
import { postRequest, getRequest, getDownload } from '/@/lib/axios';

export const fileApi = {

  uploadUrl: '/support/file/upload',
  uploadFile: (param, folder) => {
    return postRequest(`/support/file/upload?folder=${folder}`, param);
  },

  /**

   */
  queryPage: (param) => {
    return postRequest('/support/file/queryPage', param);
  },
  /**

   */
  getUrl: (fileKey) => {
    return getRequest(`/support/file/getFileUrl?fileKey=${fileKey}`);
  },

  /**

   */
  downLoadFile: (fileKey) => {
    return getDownload('/support/file/downLoad', { fileKey });
  },
  
  downLoadByFileName: (fileKey,fileName) => {
    return getDownload('/support/file/downLoad/fileName', { fileKey,fileName });
  },
  

  getUrlRequest:(url,obj)=>{
    return getRequest(url, obj);
  }
};
