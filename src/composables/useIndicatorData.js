/**
 * 指标数据管理 Composable
 * 统一管理指标数据的加载、缓存和状态
 * @author Jayce
 */
import { ref, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
import { smartSentry } from '/@/lib/smart-sentry';

/**
 * 指标基础数据管理
 * @param {Ref<string|number>} indicatorId - 指标ID
 * @returns {Object} 数据管理对象
 */
export function useIndicatorData(indicatorId) {
  const data = ref({});
  const loading = ref(false);
  const error = ref(null);

  // 计算属性：是否为新增模式
  const isAddMode = computed(() => !indicatorId.value);

  /**
   * 加载指标基础数据
   * @param {string|number} id - 指标ID
   */
  const loadData = async (id) => {
    if (!id) {
      // 新增模式，重置数据
      data.value = {};
      error.value = null;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      console.log(`[useIndicatorData] 加载指标数据: ${id}`);
      const response = await indicatorManageApi.queryIndicatorById(id);
      
      if (response && response.data) {
        data.value = { ...response.data };
        console.log(`[useIndicatorData] 数据加载成功:`, data.value);
      } else {
        throw new Error('获取指标数据失败');
      }
    } catch (err) {
      console.error(`[useIndicatorData] 加载失败:`, err);
      error.value = err.message || '加载指标数据失败';
      data.value = {};
      message.error('加载指标数据失败，请重试');
      smartSentry.captureError(err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 重置数据
   */
  const reset = () => {
    data.value = {};
    error.value = null;
    loading.value = false;
  };

  /**
   * 更新数据
   * @param {Object} newData - 新数据
   */
  const updateData = (newData) => {
    data.value = { ...data.value, ...newData };
  };

  // 监听 indicatorId 变化，自动加载数据
  watch(
    () => indicatorId.value,
    (newId) => {
      console.log(`[useIndicatorData] indicatorId 变化: ${newId}`);
      loadData(newId);
    },
    { immediate: true }
  );

  return {
    data,
    loading,
    error,
    isAddMode,
    loadData,
    reset,
    updateData
  };
}

/**
 * 指标配置数据管理
 * @param {Ref<string|number>} indicatorId - 指标ID
 * @returns {Object} 配置数据管理对象
 */
export function useIndicatorConfig(indicatorId) {
  const configData = ref({});
  const loading = ref(false);
  const error = ref(null);

  /**
   * 加载指标配置数据
   * @param {string|number} id - 指标ID
   */
  const loadConfig = async (id) => {
    if (!id) {
      configData.value = {};
      error.value = null;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      console.log(`[useIndicatorConfig] 加载配置数据: ${id}`);
      // 这里需要根据实际的配置API进行调用
      // const response = await indicatorConfigApi.queryById(id);
      // 暂时使用现有的API
      configData.value = { indicatorId: id };
      console.log(`[useIndicatorConfig] 配置加载成功`);
    } catch (err) {
      console.error(`[useIndicatorConfig] 加载失败:`, err);
      error.value = err.message || '加载配置数据失败';
      configData.value = {};
      smartSentry.captureError(err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 重置配置数据
   */
  const resetConfig = () => {
    configData.value = {};
    error.value = null;
    loading.value = false;
  };

  // 监听 indicatorId 变化，自动加载配置
  watch(
    () => indicatorId.value,
    (newId) => {
      console.log(`[useIndicatorConfig] indicatorId 变化: ${newId}`);
      loadConfig(newId);
    },
    { immediate: true }
  );

  return {
    configData,
    loading,
    error,
    loadConfig,
    resetConfig
  };
}
