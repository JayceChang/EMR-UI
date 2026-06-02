/**
 * 章节 api 封装
 */

import { postRequest, getRequest } from '/@/lib/axios';

export const indicatorChapterApi = {
  /**
   * 获取所有章节数据
   */
  queryChapter: () => {
    return getRequest('/business/rating/chapter/queryAll');
  },

  /**
   * 搜索章节
   */
  searchChapter: (params) => {
    return postRequest('/indicator/report/template/query/chapter', params);
  },

  /**
   * 获取所有节数据
   */
  querySection: () => {
    return getRequest('/business/rating/section/queryAll');
  },

  /**
   * 搜索节
   */
  searchSection: (params) => {
    return postRequest('/indicator/report/template/query/section', params);
  },

  /**
   * 根据章获取对应的节
   */
  getSectionsByChapter: (chapterIds) => {
    return postRequest('/business/rating/section/queryByChapter', { chapterIds });
  },
};