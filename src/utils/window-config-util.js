import { ref, onMounted, onUnmounted } from 'vue';

const DEFAULT_MAIN_TITLE = '医保数据分析系统';

const getWindowConfig = () => {
  return window.config && typeof window.config === 'object' ? window.config : {};
};

export const useWindowConfigTitle = () => {
  const mainTitle = ref(getWindowConfig().mainTitle || DEFAULT_MAIN_TITLE);
  const xmtitle = ref(getWindowConfig().xmtitle || '');

  const update = () => {
    const latestConfig = getWindowConfig();
    mainTitle.value = latestConfig.mainTitle || DEFAULT_MAIN_TITLE;
    xmtitle.value = latestConfig.xmtitle || '';
  };

  onMounted(() => {
    window.addEventListener('window-config-updated', update);
  });

  onUnmounted(() => {
    window.removeEventListener('window-config-updated', update);
  });

  return {
    mainTitle,
    xmtitle,
    refreshWindowConfig: update,
  };
};
