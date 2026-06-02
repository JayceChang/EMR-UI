<template>
  <a-tree-select
    :value="props.value"
    :treeData="treeData"
    :fieldNames="props.fieldNames"
    :show-search="props.showSearch"
    :style="{ width: '100%', ...(props.style || {}) }"
    :dropdown-style="{ maxHeight: '400px', overflow: 'auto', ...(props.dropdownStyle || {}) }"
    :placeholder="props.placeholder"
    :allow-clear="props.allowClear"
    :name="props.name"
    :tree-default-expand-all="props.treeDefaultExpandAll"
    :tree-line="true"
    :treeNodeFilterProp="props.treeNodeFilterProp || props.fieldNames.label"
    :loading="loading"
    :disabled="props.disabled"
    @change="treeSelectChange"
  />
</template>

<script setup>
  import { onMounted, ref, watch } from 'vue';
  import { smartSentry } from '/@/lib/smart-sentry'; // 引入错误捕获

  const props = defineProps({
    // --- v-model ---
    value: [String, Number, Array], // 支持单选或多选的值

    // --- Core Props for Generality ---
    /**
     * 获取树数据的异步函数 (例如: menuApi.queryMenuTree)
     * 要求：必须返回一个 Promise，resolve 的数据结构应为 { code: 0, data: [...] } 或直接是 [...]
     */
    apiFunc: {
      type: Function,
      required: true,
    },
    /**
     * 传递给 apiFunc 的参数 (可以是单个值、数组或对象)
     */
    apiParams: {
      type: [Object, Array, String, Number, Boolean],
      default: undefined,
    },
    /**
     * 字段名映射
     * @default { label: 'label', value: 'value', children: 'children', key: 'key' }
     */
    fieldNames: {
      type: Object,
      default: () => ({ label: 'label', value: 'value', children: 'children', key: 'key' }),
    },

    // --- Common a-tree-select Props ---
    placeholder: {
      type: String,
      default: '请选择',
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    showSearch: {
      type: Boolean,
      default: true, // 默认开启搜索
    },
    treeDefaultExpandAll: {
      type: Boolean,
      default: false, // 默认不展开所有
    },
    /**
     * 搜索时根据哪个属性过滤，默认为 fieldNames.label
     */
    treeNodeFilterProp: {
      type: String,
      default: '', // 默认为空，下面会处理成 fieldNames.label
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    style: {
      type: Object,
      default: () => ({}),
    },
    dropdownStyle: {
      type: Object,
      default: () => ({}),
    },
    /**
     * 是否在组件挂载后立即加载数据
     */
    loadDataOnMount: {
      type: Boolean,
      default: true,
    },
    /**
     * 组件name
     */
    name: {
      type: String,
      required: false,
      default: '',
    },
  });

  const emit = defineEmits(['update:value', 'change']);

  const treeData = ref([]);
  const loading = ref(false);

  async function fetchTreeData() {
    if (!props.apiFunc) {
      console.warn('GenericTreeSelect: apiFunc prop is required.');
      return;
    }
    loading.value = true;
    treeData.value = []; // 清空旧数据
    try {
      let res;
      // 根据 apiParams 类型调用 apiFunc
      if (props.apiParams === undefined) {
        res = await props.apiFunc();
      } else if (Array.isArray(props.apiParams)) {
        res = await props.apiFunc(...props.apiParams);
      } else {
        res = await props.apiFunc(props.apiParams);
      }

      // 兼容两种常见的返回格式: { code: 0, data: [...] } 或直接 [...]
      if (res && res.data && Array.isArray(res.data)) {
        treeData.value = res.data;
      } else if (Array.isArray(res)) {
        treeData.value = res;
      } else {
        console.warn('GenericTreeSelect: apiFunc did not return expected data format.', res);
        treeData.value = [];
      }
      // console.log('GenericTreeSelect fetched data:', treeData.value);
    } catch (error) {
      smartSentry.captureError(error);
      console.error('GenericTreeSelect: Error fetching tree data:', error);
      treeData.value = []; // 出错时清空
    } finally {
      loading.value = false;
    }
  }

  // 监听 apiParams 变化，如果变化则重新加载数据 (可选，根据需要启用)
  // watch(() => props.apiParams, () => {
  //   fetchTreeData();
  // }, { deep: true });

  // 监听外部触发加载
  watch(
    () => props.loadDataOnMount,
    (newVal) => {
      if (newVal && treeData.value.length === 0) {
        fetchTreeData();
      }
    }
  );

  onMounted(() => {
    if (props.loadDataOnMount) {
      fetchTreeData();
    }
  });

  function treeSelectChange(selectedValue, label, extra) {
    emit('update:value', selectedValue);
    // 也 emit 一个原始的 change 事件，包含更多信息
    emit('change', selectedValue, label, extra, props.name);
  }

  // 暴露给父组件调用的方法
  defineExpose({
    fetchTreeData, // 允许父组件手动刷新数据
  });
</script>

<style scoped>
  /* 可以添加一些通用的样式 */
</style>
