/*
 * 类目api
 *
 */
import { getRequest, postRequest } from '/@/lib/axios';

export const categoryApi = {

  addCategory: (param) => {
    return postRequest('/category/add', param);
  },
  // GET

  deleteCategoryById: (categoryId) => {
    return getRequest(`/category/delete/${categoryId}`);
  },

  queryCategoryTree: (param) => {
    return postRequest('/category/tree', param);
  },

  updateCategory: (param) => {
    return postRequest('/category/update', param);
  },
};
