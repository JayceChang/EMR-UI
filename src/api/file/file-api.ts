/*
 * 类目api
 *
 */
import { FileApiInterface } from './file-api-interface';
import { file_class } from "./file-api-class";
import { getRequest, postRequest } from '/@/lib/axios';

export const FileApi:FileApiInterface= {
  uploadFile: function (obj: object): Promise<object> {
    return postRequest('/file/uploadFile', obj);
  },
  downloadFile: function (obj: object): Promise<object> {
    return getRequest('/file/downloadFile', obj);
  },
  queryKufang: function (): Promise<object> {
    return postRequest('/file/queryKufang');
  },
  addKufang: function (obj: file_class): Promise<object> {
    return postRequest('/file/addKufang', obj.file_kufang);
  },
  delKufang: function (id: string): Promise<object> {
    return postRequest('/file/delKufang/' + id);
  },
  queryKuWei: function (kufangid: string): Promise<object> {
    return postRequest('/file/querykuwei/' + kufangid);
  },
  addKuWei: function (obj: file_class): Promise<object> {
    return postRequest('/file/addkuwei', obj.file_kuwei);
  },
  delKuwei: function (id: string): Promise<object> {
    return postRequest('/file/delkuwei/' + id);
  },
  delListKuwei: function (ids: object): Promise<object> {
    return postRequest('/file/delListKuwei', { ids });
  },
  queryfile: function (k_parent_id: string): Promise<object> {
    return postRequest('/file/queryfile/' + k_parent_id);
  },
  deleteQueryfile: function (): Promise<object> {
    return postRequest('/file/deletequeryfile');
  },
  addFileInfo: function (obj: file_class): Promise<object> {
    return postRequest('/file/addfileinfo', obj.file_info);
  },
  delfile: function (id: string): Promise<object> {
    return postRequest('/file/delfile/' + id);
  },
  deepdelete: function (id: string): Promise<object> {
    return postRequest('/file/deepdelete/' + id);
  },
  backdelete: function (id: string): Promise<object> {
    return postRequest('/file/backdelete/' + id);
  },
  clearDeleteList: function (): Promise<object> {
    return postRequest('/file/clearDeleteList');
  },
  getFileListByIds: function (fileIds): Promise<object> {
    return postRequest('/file/getFileListByIds', { ids: fileIds });
  },
  addFileUpperInfo: function (obj: file_class): Promise<object> {
    return postRequest('/file/addFileUpperInfo', obj.file_info_upper);
  },
  delFileUpper: function (id: string): Promise<object> {
    return postRequest('/file/delFileUpper/' + id);
  },
  queryFileUpper: function (): Promise<object> {
    return postRequest('/file/queryFileUpper');
  },
  queryfileByIds: function (fileIds): Promise<object> {
    return postRequest('/file/queryfileByIds', { ids: fileIds });
  },
  //批量文件上架接口
  delFileUpper_PL: function (ids): Promise<object> {
    return postRequest('/file/delFileUpper_PL', { ids: ids });
  },
  queryRoleFile: function (id: string): Promise<object> {
    return postRequest('/file/queryRoleFile/'+id);
  },
  addFileRoleFile: function (obj: object): Promise<object> {
    return postRequest('/file/addFileRoleFile', obj);
  },
  queryShareFile: function (id: string): Promise<object> {
    return postRequest('/file/queryShareFile/'+id);
  },
  addFileShareFile: function (obj: object): Promise<object> {
    return postRequest('/file/addFileShareFile', obj);
  },
  delFileShareFile: function (id: string): Promise<object> {
    return postRequest('/file/delFileShareFile/'+id);
  },
};
