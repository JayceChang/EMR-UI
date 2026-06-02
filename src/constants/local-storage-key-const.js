/*
 *  key  常量
 *





 */

/**
 * key前缀
 */
const KEY_PREFIX = 'smart_admin_';
/**
 * localStorageKey集合
 */
export default {
  // 用户token
  USER_TOKEN: `${KEY_PREFIX}user_token`,
  // 渠道token
  CHANNEL_TOKEN: `${KEY_PREFIX}channel_token`,
  // 渠道登录标识
  CHANNEL_LOGIN_FLAG: `${KEY_PREFIX}channel_login_flag`,
  // 渠道回跳地址
  CHANNEL_RETURN_URL: `${KEY_PREFIX}channel_return_url`,
  // 用户权限点
  USER_POINTS: `${KEY_PREFIX}user_points`,
  // 用户的tag列表
  USER_TAG_NAV: `${KEY_PREFIX}user_tag_nav`,
  // app config 配置信息
  APP_CONFIG: `${KEY_PREFIX}app_config`,
  // 首页快捷入口
  HOME_QUICK_ENTRY: `${KEY_PREFIX}home_quick_entry`,
  // 通知信息已读
  NOTICE_READ: `${KEY_PREFIX}notice_read`,
  // 待办
  TO_BE_DONE: `${KEY_PREFIX}to_be_done`,
};
