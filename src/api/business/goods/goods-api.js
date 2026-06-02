/*
 * @Description:


 * @LastEditTime: 2022-06-23
 * @LastEditors: zhuoda
 */
import {postRequest, getRequest, getDownload} from '/@/lib/axios';

export const goodsApi = {

  addGoods: (param) => {
    return postRequest('/goods/add', param);
  },

  deleteGoods: (goodsId) => {
    return getRequest(`/goods/delete/${goodsId}`);
  },

  batchDelete: (goodsIdList) => {
    return postRequest('/goods/batchDelete', goodsIdList);
  },

  queryGoodsList: (param) => {
    return postRequest('/goods/query', param);
  },

  updateGoods: (param) => {
    return postRequest('/goods/update', param);
  },


  importGoods : (file) =>{
    return postRequest('/goods/importGoods',file);
  },


  exportGoods : () =>{
    return getDownload('/goods/exportGoods');
  }
};
