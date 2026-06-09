/*
 * 路由
 *





 */
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { nextTick } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { routerArray } from './routers';
import { PAGE_PATH_404, PAGE_PATH_LOGIN, HOME_PAGE_PATH } from '/@/constants/common-const';
import { HOME_PAGE_NAME } from '/@/constants/system/home-const';
import SmartLayout from '../layout/index.vue';
import { useUserStore } from '/@/store/modules/system/user';
import { localClear, localRead } from '/@/utils/local-util';
import _ from 'lodash';
import LocalStorageKeyConst from '/@/constants/local-storage-key-const.js';

const PAGE_PATH_CHANNEL_AUTH_ERROR = '/channel-auth-error';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: routerArray,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// ----------------------- 路由加载前 -----------------------
router.beforeEach(async (to, from, next) => {
  // 进度条开启
  nProgress.start();

  // 公共页面，任何时候都可以跳转
  if (to.path === PAGE_PATH_404 || to.path === PAGE_PATH_CHANNEL_AUTH_ERROR) {
    next();
    return;
  }

  // 验证登录
  const token = localRead(LocalStorageKeyConst.USER_TOKEN);
  if (!token) {
    useUserStore().logout();
    if (to.path === PAGE_PATH_LOGIN) {
      next();
    } else {
      next({ path: PAGE_PATH_LOGIN });
    }
    return;
  }

  // 登录页，则跳转到首页
  if (to.path === PAGE_PATH_LOGIN) {
    next({ path: HOME_PAGE_PATH });
    return;
  }

  // 首页权限验证（包括默认首页和 /index 路径）
  if (to.path === HOME_PAGE_PATH || to.name === HOME_PAGE_NAME || to.path === '/index' || to.name === 'index') {
    // 检查用户是否有首页访问权限
    const userStore = useUserStore();
    const menuRouterList = userStore.getMenuRouterList || [];

    // 检查是否有默认首页权限
    const hasBackEndPermission = menuRouterList.some((menu) => menu.path === HOME_PAGE_PATH);

    // 检查是否有等评前端权限
    const hasFrontEndPermission = menuRouterList.some((menu) => menu.path === '/index');

    // 超级管理员直接放行
    if (userStore.administratorFlag) {
      next();
      return;
    }

    // 如果访问的是前端页面 /index
    if (to.path === '/index' || to.name === 'index') {
      if (hasFrontEndPermission) {
        console.log('访问前端页面，有前端权限，允许访问');
        next();
      } else {
        console.log('访问前端页面，无前端权限，跳转403');
        next({ path: '/403' });
      }
    }
    // 如果访问的是默认首页
    else if (to.path === HOME_PAGE_PATH || to.name === HOME_PAGE_NAME) {
      // if (hasBackEndPermission) {
      //   console.log('访问后端页面，有后端权限，允许访问');
      //   next();
      // } else {
      //   console.log('访问后端页面，无后端权限，跳转403');
      //   next({ path: '/403' });
      // }
      console.log('访问后端页面，暂时不校验后端页面权限，允许访问');
      next();
    } else {
      // 其他情况，跳转到403页面
      next({ path: '/403' });
    }
    return;
  }

  // 下载路由对应的 页面组件，并修改组件的Name，如果修改过，则不需要修改
  let toRouterInfo = routerMap.get(to.name);
  if (toRouterInfo && _.isFunction(toRouterInfo.component) && toRouterInfo.meta.renameComponentFlag === false) {
    // 因为组件component 为 lazy load是个方法，所以可以直接执行 component()方法
    toRouterInfo.component().then((val) => {
      // 修改组件的name
      val.default.name = to.meta.componentName;
      // 记录已经修改过 组件的name
      toRouterInfo.meta.renameComponentFlag = true;
    });
  }

  // 设置tagNav
  useUserStore().setTagNav(to, from);

  // 设置keepAlive
  if (to.meta.keepAlive) {
    nextTick(() => {
      useUserStore().pushKeepAliveIncludes(to.meta.componentName);
    });
  }

  next();
});

// ----------------------- 路由加载后 -----------------------
router.afterEach(() => {
  nProgress.done();
});

// ----------------------- 构建router对象 -----------------------
const routerMap = new Map();

export function buildRoutes(menuRouterList) {
  let menuList = menuRouterList ? menuRouterList : useUserStore().getMenuRouterList || [];
  /**
   * 1、构建整个路由信息
   * 2、添加到路由里
   */
  const routerList = [];
  // 获取所有vue组件引用地址 用于构建路由
  const modules = import.meta.glob('../views/**/**.vue');
  // 获取所有vue组件 用于注入name属性 name属性用于keep-alive

  //1、构建整个路由信息
  for (const e of menuList) {
    if (!e.menuId) {
      continue;
    }
    if (!e.path) {
      continue;
    }
    if (e.deletedFlag && e.deletedFlag === true) {
      continue;
    }
    let route = {
      path: e.path.startsWith('/') ? e.path : `/${e.path}`,
      // 使用【menuId】作为name唯一标识
      name: e.menuId.toString(),
      meta: {
        // 数据库菜单(页面)id
        id: e.menuId.toString(),
        // 组件名称
        componentName: e.menuId.toString(),
        // 菜单展示
        title: e.menuName,
        // 菜单图标展示
        icon: e.icon,
        // 是否在菜单隐藏
        hideInMenu: !e.visibleFlag,
        // 页面是否keep-alive缓存
        keepAlive: e.cacheFlag,
        // 是否为外链
        frameFlag: e.frameFlag,
        // 外链地址
        frameUrl: e.frameUrl,
        // 是否 rename了组件的名字
        renameComponentFlag: false,
      },
    };

    if (e.frameFlag) {
      route.component = () => import('../components/framework/iframe/iframe-index.vue');
    } else {
      let componentPath = e.component && e.component.startsWith('/') ? e.component : '/' + e.component;
      let relativePath = `../views${componentPath}`;
      // // eslint-disable-next-line no-prototype-builtins
      route.component = modules[relativePath];
    }
    routerList.push(route);
    routerMap.set(e.menuId.toString(), route);
  }

  if (!routerList.some((route) => route.path === HOME_PAGE_PATH)) {
    routerList.push({
      path: HOME_PAGE_PATH,
      name: HOME_PAGE_NAME,
      meta: {
        title: HOME_PAGE_NAME,
        icon: 'HomeOutlined',
        hideInMenu: true,
        keepAlive: false,
        componentName: 'PatientRecordHome',
        renameComponentFlag: true,
      },
      component: () => import('../views/business/patient-record/index.vue'),
    });
  }

  //2、添加到路由里
  router.addRoute({
    path: '/',
    meta: {},
    component: SmartLayout,
    children: routerList,
  });
}
