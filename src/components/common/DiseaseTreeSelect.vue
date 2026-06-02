<template>
  <a-tree-select
    v-model:value="selectedValue"
    :tree-data="treeData"
    :placeholder="placeholder"
    :loading="loading"
    :disabled="disabled"
    :allow-clear="allowClear"
    :show-search="showSearch"
    :tree-default-expand-all="treeDefaultExpandAll"
    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
    tree-node-filter-prop="title"
    class="w-full"
    @change="handleChange"
  >
    <template #title="{ title, type }">
      <span>
        <i 
          :class="getIconClass(type)" 
          class="mr-1"
        ></i>
        {{ title }}
      </span>
    </template>
  </a-tree-select>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { DiseaseAPI } from '/@/api/system/disease-api';
import { message } from 'ant-design-vue';

const props = defineProps({
  // v-model绑定的值
  modelValue: {
    type: String,
    default: ''
  },
  // 占位符
  placeholder: {
    type: String,
    default: '请选择病种'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否允许清除
  allowClear: {
    type: Boolean,
    default: true
  },
  // 是否支持搜索
  showSearch: {
    type: Boolean,
    default: true
  },
  // 是否默认展开所有节点
  treeDefaultExpandAll: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// 选中的值
const selectedValue = ref(props.modelValue);
// 加载状态
const loading = ref(false);
// 原始树形数据
const rawTreeData = ref([]);

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  selectedValue.value = newVal;
});

// 监听内部值变化
watch(selectedValue, (newVal) => {
  emit('update:modelValue', newVal);
});

// 转换树形数据为Ant Design Tree Select所需格式
const convertToTreeSelectData = (nodes) => {
  if (!nodes || nodes.length === 0) return [];
  
  return nodes.map(node => ({
    value: node.code,
    title: node.name,
    key: node.code,
    type: node.type,
    children: node.children ? convertToTreeSelectData(node.children) : undefined
  }));
};

// 树形数据（转换后）
const treeData = computed(() => {
  return convertToTreeSelectData(rawTreeData.value);
});

// 根据类型获取图标
const getIconClass = (type) => {
  switch (type) {
    case 'category':
      return 'fas fa-folder text-blue-500';
    case 'item':
      return 'fas fa-file-medical text-green-500';
    case 'subitem':
      return 'fas fa-file-alt text-gray-500';
    default:
      return 'fas fa-circle text-gray-400';
  }
};

// 获取ICD病种树形数据
const fetchDiseaseTree = async () => {
  try {
    loading.value = true;
    const response = await DiseaseAPI.getDiseaseTree();
    if (response.data) {
      rawTreeData.value = response.data;
    }
  } catch (error) {
    console.error('获取ICD病种树形数据失败:', error);
    message.error('获取病种数据失败');
  } finally {
    loading.value = false;
  }
};

// 递归查找节点类型
const findNodeType = (nodes, targetValue) => {
  if (!nodes || nodes.length === 0) return null;

  for (const node of nodes) {
    if (node.value === targetValue) {
      return {
        code: node.value,
        name: node.title,
        type: node.type
      };
    }

    if (node.children) {
      const result = findNodeType(node.children, targetValue);
      if (result) return result;
    }
  }

  return null;
};

// 处理选择变化
const handleChange = (value, label) => {
  // 查找选中节点的完整信息（包括类型）
  const nodeInfo = findNodeType(treeData.value, value);

  // 传递完整的节点信息
  emit('change', {
    value: value,
    label: label,
    type: nodeInfo?.type || null,
    code: nodeInfo?.code || value,
    name: nodeInfo?.name || label
  });
};

// 组件挂载时获取数据
onMounted(() => {
  fetchDiseaseTree();
});
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>
