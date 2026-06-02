/*
 * 快捷菜单配置API
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const quickMenuApi = {
  // 保存快捷菜单配置
  saveConfig: (data) => {
    return postRequest('/workbench/quick-menu/save', data);
  },

  // 获取快捷菜单配置
  getConfig: () => {
    return getRequest('/workbench/quick-menu/config');
  },

  // 重置为默认配置
  resetConfig: () => {
    return postRequest('/workbench/quick-menu/reset');
  },

  // 获取可用菜单项列表
  getAvailableMenus: () => {
    return getRequest('/workbench/quick-menu/available');
  },
};