<template>
   <a-card size="small" :bordered="false" :hoverable="true" title="指标列表" class="fixed-height-card">
        <a-spin :spinning="treeLoading">
          <!-- <div class="tree-search-bar" style="margin-bottom: 8px">
            <a-input v-model:value="treeSearchState.searchText" placeholder="搜索指标名称" size="small" allow-clear>
              <template #prefix><SearchOutlined /></template>
            </a-input>
          </div> -->
          <div class="tree-container">
            <a-tree
              :treeData="filteredTreeData"
              :fieldNames="{ title: 'indicatorName', key: 'id' }"
              :selectedKeys="selectedKeys"
              :expandedKeys="expandedKeys"
              :showLine="{ showLeafIcon: false }"
              :blockNode="true"
              @select="handleTreeSelect"
              @expand="handleTreeExpand"
            >
              <template #title="{ indicatorName, indicatorCode }">
                <span v-html="highlightTreeText(indicatorName, treeSearchState.searchText)"></span>
                <span class="tree-node-code" v-if="indicatorCode">【{{ indicatorCode }}】</span>
              </template>
            </a-tree>
          </div>
        </a-spin>
      </a-card>
</template>

<script setup>
  import { ref, reactive, onMounted, computed, watch,defineEmits } from 'vue';
  import { message, Modal as AntdModal, Popconfirm as APopconfirm } from 'ant-design-vue';
  import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
  
  const treeLoading = ref(false);
  const originalTreeData = ref([]);
  const filteredTreeData = ref([]);
  const emit =defineEmits(['handleTreeSelect']);
  const selectedIndicatorFromTree = ref({}); // Stores the selected node object
  const treeSearchState = reactive({ searchText: '' });
  const selectedKeys = ref([]); // 当前选中节点的keys
  const expandedKeys = ref([]); // 当前展开节点的keys
  const allKeys = ref([]); // 所有节点keys (用于展开全部)

  // 用于 a-tree 的处理函数
  function handleTreeSelect(index,{ node, selected }) {
    if (!selected) return; // 不处理取消选择的情况
    
    const record = node.dataRef; // a-tree 中节点的数据对象
    if(expandedKeys.value.findIndex(x=>x==record.id)<0){
        expandedKeys.value.push(record.id);
    }
    //只有指标才可以选中
    if(record.indicatorType=="2"){
        selectedIndicatorFromTree.value = record;
        selectedKeys.value = [record.id];//设置选中的值
        emit('handleTreeSelect',selectedIndicatorFromTree.value);
    }
  }

  // 处理树节点展开/收起
  function handleTreeExpand(keys) {
    expandedKeys.value = keys;
  }

  // 修改过滤逻辑，保留原有功能
  function applyTreeFilter() {
    if (!treeSearchState.searchText) {
      filteredTreeData.value = mapTreeForDisplay(originalTreeData.value);
      // 搜索框清空时，可以选择展开所有节点或保持当前展开状态
      // expandedKeys.value = allKeys.value; // 展开所有
    } else {
      const filtered = filterTreeNodes(originalTreeData.value, treeSearchState.searchText);
      filteredTreeData.value = mapTreeForDisplay(filtered);
      
      // 搜索时自动展开包含匹配项的节点
      const matchedKeys = [];
      const collectKeys = (nodes) => {
        if (!nodes) return;
        nodes.forEach(node => {
          if (node.children && node.children.length) {
            matchedKeys.push(node.id);
            collectKeys(node.children);
          }
        });
      };
      collectKeys(filtered);
      expandedKeys.value = matchedKeys;
    }
  }

  // 提取所有节点key (用于展开全部功能)
  function collectAllKeys(nodes, keys = []) {
    if (!nodes) return keys;
    nodes.forEach(node => {
      if (node.children && node.children.length) {
        keys.push(node.id);
        collectAllKeys(node.children, keys);
      }
    });
    return keys;
  }

  // 修改映射函数，保持数据结构与 a-tree 兼容
  const mapTreeForDisplay = (nodes) => {
    if (!nodes || nodes.length === 0) return [];
    return nodes.map((node) => ({
      ...node,
      children: node.children && node.children.length > 0 ? mapTreeForDisplay(node.children) : undefined,
      // a-tree 使用 title 作为显示文本，但我们使用自定义模板
      // title: node.indicatorName, // 由于使用自定义模板，这里不需要设置
    }));
  };

  // 其他树节点过滤函数保持不变
  const filterTreeNodes = (nodes, keyword) => {
    if (!nodes || nodes.length === 0) return [];
    const newChildren = [];
    const keywordLower = keyword.toLowerCase();
    for (const node of nodes) {
      const children = filterTreeNodes(node.children, keyword);
      if (node.indicatorName?.toLowerCase().includes(keywordLower) || children.length > 0) {
        newChildren.push({ ...node, children: children.length > 0 ? children : undefined });
      }
    }
    return newChildren;
  };

  // 高亮函数保持不变
  function highlightTreeText(text, keyword) {
    if (!keyword || !text) return text;
    const keywordLower = keyword.toLowerCase();
    const textString = String(text);
    const index = textString.toLowerCase().indexOf(keywordLower);
    if (index === -1) return textString;
    const before = textString.substring(0, index);
    const match = textString.substring(index, index + keyword.length);
    const after = textString.substring(index + keyword.length);
    return `${before}<span class="highlight-text">${match}</span>${after}`;
  }

  // 监听搜索文字变化
  watch(() => treeSearchState.searchText, () => {
    applyTreeFilter();
  });
   // 修改指标树加载函数
   async function fetchIndicatorTreeData() {
    treeLoading.value = true;
    try {
      const res = await indicatorManageApi.queryIndicatorTree({}); // Use your actual API
      if (res.ok && res.data) {
        originalTreeData.value = res.data;
        allKeys.value = collectAllKeys(res.data); // 收集所有可展开节点的key
        applyTreeFilter(); // 应用过滤
      } else {
        message.error('获取指标树失败');
        originalTreeData.value = [];
        filteredTreeData.value = [];
        allKeys.value = [];
      }
    } catch (error) {
      message.error('加载指标树时发生错误');
      originalTreeData.value = [];
      filteredTreeData.value = [];
      allKeys.value = [];
      // smartSentry.captureError(error);
    } finally {
      treeLoading.value = false;
    }
  }
  onMounted(() => {
    fetchIndicatorTreeData(); // Load left tree   
  });
</script>

<style lang="less" scoped>
.fixed-height-card {
    //height: calc(100vh - 125px);
   
    :deep(.ant-card-body) {
      //height: calc(100% - 45px);
      padding: 8px;
      display: flex;
      flex-direction: column;
      overflow: visible; // 允许分页控件显示

    }
    :deep(.tree-container) {
    height: 100%;
    overflow: auto !important; // 强制禁止溢出滚动
  }
    
  }
  
  .fixed-height-table {
    height: calc(100% - 120px); // 减去表单和按钮高度
    display: flex;
    flex-direction: column;
    
    :deep(.ant-table) {
      flex: 1;
    }
    
    :deep(.ant-table-container) {
      height: auto !important;
    }
    
    :deep(.ant-table-body) {
      overflow-y: visible !important; // 不显示垂直滚动条
      overflow-x: auto !important; // 允许水平滚动
    }
    
    :deep(.ant-table-pagination) {
      margin: 8px 0;
      position: static !important;
      visibility: visible !important;
    }
  }
  
  .tree-container {
    height: 100%;
    overflow: auto !important; // 强制禁止溢出滚动
  }
  
  .tree-node-code {
    margin-left: 8px;
    font-size: 12px;
    color: #999;
  }
  
  :deep(.highlight-text) {
    background-color: yellow;
    font-weight: bold;
  }
  
  // 选中树节点样式
  :deep(.ant-tree-node-selected) {
    background-color: #e6f7ff;
  }
  
</style>