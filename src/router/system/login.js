/*
 * 登录页面
 *





 */

export const loginRouters = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('/@/views/system/login2/login.vue'),
    meta: {
      title: '登录',
      hideInMenu: true,
    },
  },
  {
    path: '/channel-auth-error',
    name: 'ChannelAuthError',
    component: () => import('/@/views/system/channel-auth-error/index.vue'),
    meta: {
      title: '渠道登录失效',
      hideInMenu: true,
    },
  },
];
