/*
 * 首页路由
 *





 */
import { HOME_PAGE_NAME } from '/@/constants/system/home-const';
import { MENU_TYPE_ENUM } from '/@/constants/system/menu-const';
import SmartLayout from '/@/layout/index.vue';
import HtmlEmbed from '/@//HtmlEmbed.vue';

export const homeRouters = [
  {
    path: '/',
    name: '_home',
    redirect: { name: HOME_PAGE_NAME },
    component: SmartLayout,
    meta: {
      title: '数据总汇',
      menuType: MENU_TYPE_ENUM.CATALOG.value,
      icon: 'HomeOutlined',
    },
    children: [
      {
        path: '/ayyb/dashboard',
        name: HOME_PAGE_NAME,
        meta: {
          title: '数据总汇',
          menuType: MENU_TYPE_ENUM.MENU.value,
          icon: 'HomeOutlined',
          keepAlive: true,
          componentName: 'HomeDashboard',
          parentMenuList: [{ name: '_home', title: '数据总汇' }],
        },
        component: () => import('/@/views/business/dashboard/index.vue'),
        // 使用嵌入组件，并通过 props 传递 HTML 路径
        // component: HtmlEmbed,
        // props: {
        //   // HTML 文件的实际路径（根据你的文件位置调整）
        //   // 示例：若 databoard.html 在 public 目录下，路径为 '/databoard.html'
        //   // 若在 views/website 目录下，且已配置 rollup 多入口，路径为 '/views/website/databoard.html'
        //   htmlPath: '/data-dashboard.html'
        // }
      },
      {
        path: '/indicator/workbench/quick-menu-config',
        name: 'QuickMenuConfig',
        component: () => import('/@/views/business/rating/workbench/quick-menu-config.vue'),
        meta: {
          title: '快捷菜单配置',
          hideInMenu: true,
          parentMenuList: [{ name: '_home', title: '工作台' }],
        },
      },
      {
        path: '/account',
        name: 'Account',
        component: () => import('/@/views/system/account/index.vue'),
        meta: {
          title: '个人中心',
          hideInMenu: false,
        },
      },
    ],
  },
];
