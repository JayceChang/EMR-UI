// src/report-entry.js
import { createApp } from 'vue';
import Antd, { message } from 'ant-design-vue';
import * as antIcons from '@ant-design/icons-vue';
import lodash from 'lodash';
import JsonViewer from 'vue3-json-viewer';
import 'vue3-json-viewer/dist/index.css';
import { smartSentry } from '/@/lib/smart-sentry';
import { loginApi } from '/@/api/system/login-api';
import constantsInfo from '/@/constants/index';
import { privilegeDirective } from '/@/directives/privilege';
import i18n from '/@/i18n/index';
import privilegePlugin from '/@/plugins/privilege-plugin';
import dictPlugin from '/@/plugins/dict-plugin';
import smartEnumPlugin from '/@/plugins/smart-enums-plugin';
import { buildRoutes, router } from '/@/router';
import { store } from '/@/store';
import { useUserStore } from '/@/store/modules/system/user';
import 'ant-design-vue/dist/reset.css';
import '/@/theme/index.less';
import { localRead } from '/@/utils/local-util.js';
import LocalStorageKeyConst from '/@/constants/local-storage-key-const.js';
import { Table } from 'ant-design-vue';
import { useAppConfigStore } from '/@/store/modules/system/app-config';
import '/@/utils/ployfill';
import { useDictStore } from '/@/store/modules/system/dict.js';
import { dictApi } from '/@/api/support/dict-api.js';
import { themeColors } from '/@/theme/color.js';
// report-template Vue 页面组件
import ReportPage from './views/business/rating/indicator/report/report-template.vue';

// 获取url参数
const getUrlParams = () => {
  const params = {};
  const search = window.location.search.slice(1); // 去除 "?"
  if (search) {
    search.split('&').forEach(item => {
      const [key, value] = item.split('=');
      params[key] = decodeURIComponent(value); // 解码特殊字符
    });
  }
  return params;
};

// 拿到indicatorCode
let indicatorCode = getUrlParams().indicatorCode;




// 挂载到 report.html 中的 #report-app
const app = createApp(ReportPage,{indicatorCode:indicatorCode});
app.use(router)
    .use(store)
    .use(i18n)
    .use(Antd)
    .use(smartEnumPlugin, constantsInfo)
    .use(privilegePlugin)
    .use(dictPlugin)
    .use(JsonViewer);
  //注入权限
  app.directive('privilege', {
    mounted(el, binding) {
      privilegeDirective(el, binding);
    },
  });
  // 注册图标组件
  Object.keys(antIcons).forEach((key) => {
    app.component(key, antIcons[key]);
  });
  //全局
  app.config.globalProperties.$antIcons = antIcons;
  app.config.globalProperties.$lodash = lodash;
  //挂载
  app.mount('#report-app');