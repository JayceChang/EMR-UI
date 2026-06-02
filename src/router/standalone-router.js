/*
 * 独立HTML页面专用路由配置
 * 用于 quality-result.html, quality-details.html, report.html, report-query.html 等独立页面
 * 这些页面不需要登录验证
 */
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { createRouter, createWebHashHistory } from 'vue-router';
import NotFound from '/@/views/system/40X/404.vue';

// 独立页面的简单路由配置
export const standaloneRoutes = [
  { 
    path: '/', 
    redirect: '/standalone' 
  },
  {
    path: '/standalone',
    name: 'standalone',
    component: () => import('/@/views/business/demo/quality-result/index.vue'),
  },
  { 
    path: '/:pathMatch(.*)*', 
    name: '404', 
    component: NotFound 
  },
];

export const standaloneRouter = createRouter({
  history: createWebHashHistory(),
  routes: standaloneRoutes,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 独立页面的路由守卫 - 不包含登录验证
standaloneRouter.beforeEach(async (to, from, next) => {
  // 开启进度条
  nProgress.start();
  
  // 直接放行，不做任何验证
  next();
});

// 路由加载后
standaloneRouter.afterEach(() => {
  nProgress.done();
});