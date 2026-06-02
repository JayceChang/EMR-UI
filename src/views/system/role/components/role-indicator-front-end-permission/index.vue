<!--
  * 角色前端指标权限
  *
  * 用于管理角色的前端指标权限
  *
-->
<template>
  <div>
    <div class="tree-header">
      <p>设置角色对应的指标{{ permissionTypeText }}权限</p>
      <a-button v-if="selectRoleId" type="primary" @click="showAddPermissionModal">
        <template #icon><PlusOutlined /></template>配置权限
      </a-button>
    </div>

    <!-- 指标权限树形表格 -->
    <a-spin :spinning="tableLoading">
      <a-table
        :dataSource="treeTableData"
        :columns="columns"
        :pagination="false"
        rowKey="id"
        size="small"
        bordered
        :expandable="{
          defaultExpandAllRows: true,
          childrenColumnName: 'children',
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'indicatorName'">
            <span>
              {{ record.indicatorName }}
              <span v-if="record.indicatorCode" class="indicator-code">({{ record.indicatorCode }})</span>
            </span>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a-popconfirm
              v-if="record.id && !record.id.toString().endsWith('_folder')"
              title="确定要删除此权限吗?"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record.id)"
            >
              <a>删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-spin>

    <!-- 配置权限弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      title="配置指标权限"
      width="600px"
      :destroyOnClose="true"
      @ok="handleSavePermissions"
      @cancel="modalVisible = false"
    >
      <a-spin :spinning="treeLoading">
        <div class="tree-container">
          <a-tree
            v-model:checkedKeys="checkedKeys"
            :treeData="treeData"
            :fieldNames="{ title: 'indicatorName', key: 'id' }"
            checkable
            :defaultExpandAll="true"
            :showLine="{ showLeafIcon: false }"
            :blockNode="true"
            
            :checkStrictly="false"
          >
            <template #title="{ indicatorName, indicatorCode }">
              <span
                >{{ indicatorName }} <span class="indicator-code">({{ indicatorCode }})</span></span
              >
            </template>
          </a-tree>
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup>
  import { ref, reactive, inject, watch, computed, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { indicatorFrontEndApi } from '/@/api/business/rating/indicator/frontend/index';
  import { roleIndicatorFrontEndApi } from '/@/api/system/role-indicator-front-end-api';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { smartSentry } from '/@/lib/smart-sentry';

  // 接收权限类型参数
  const props = defineProps({
    permissionType: {
      type: Number,
      required: true,
      validator: (value) => [1, 2].includes(value),
    },
  });

  // 计算权限类型文本
  const permissionTypeText = computed(() => (props.permissionType === 1 ? '后端' : '前端'));

  // 从父组件注入选中的角色ID
  const selectRoleId = inject('selectRoleId');

  // 表格数据
  const tableData = ref([]);
  const treeTableData = ref([]);
  const tableLoading = ref(false);

  // 树形数据
  const treeData = ref([]);
  const treeLoading = ref(false);
  const checkedKeys = ref([]);

  // 弹窗控制
  const modalVisible = ref(false);

  // 表格列定义
  const columns = [
    {
      title: '指标名称',
      dataIndex: 'indicatorName',
      ellipsis: true,
    },
    {
      title: '创建人',
      dataIndex: 'createUserName',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 80,
      align: 'center',
    },
  ];

  // 监听角色ID变化，加载数据
  watch(
    selectRoleId,
    () => {
      if (selectRoleId.value) {
        loadRoleIndicatorPermissions();
      } else {
        tableData.value = [];
        treeTableData.value = [];
      }
    },
    { immediate: true }
  );

  // 加载角色指标权限
  async function loadRoleIndicatorPermissions() {
    if (!selectRoleId.value) return;

    tableLoading.value = true;
    try {
      // 调用API获取角色指标权限
      const res = await roleIndicatorFrontEndApi.queryByRoleId(selectRoleId.value);

      if (res.ok && res.data) {
        tableData.value = res.data;

        // 加载完整的指标树，用于构建树形表格数据
        await loadFullIndicatorTree();
      } else {
        message.error(res.msg || '获取角色指标权限失败');
        tableData.value = [];
        treeTableData.value = [];
      }
    } catch (error) {
      smartSentry.captureError(error);
      message.error('获取角色指标权限出错');
      tableData.value = [];
      treeTableData.value = [];
    } finally {
      tableLoading.value = false;
    }
  }

  // 加载完整的指标树，用于构建树形表格数据
  async function loadFullIndicatorTree() {
    try {
      const res = await indicatorFrontEndApi.queryIndicatorTree({});
      if (res.ok && res.data) {
        // 构建树形表格数据
        buildTreeTableData(res.data);
      } else {
        message.error('获取指标树失败');
        treeTableData.value = [];
      }
    } catch (error) {
      smartSentry.captureError(error);
      message.error('加载指标树出错');
      treeTableData.value = [];
    }
  }

  // 构建树形表格数据
  function buildTreeTableData(fullTree) {
    // 深拷贝数据，避免引用问题
    const treeCopy = JSON.parse(JSON.stringify(fullTree));

    // 获取已配置权限的指标ID集合
    const configuredIndicatorIds = new Set(tableData.value.map((item) => item.indicatorId));

    // 递归处理树节点
    function processNode(node, parentPath = [], depth = 0) {
      // 添加深度限制，防止无限递归
      if (depth > 100) {
        console.warn('树深度超过100层，可能存在循环引用');
        return null;
      }

      const currentPath = [...parentPath, node.indicatorName];

      // 检查当前节点是否已配置权限
      const isConfigured = configuredIndicatorIds.has(node.id);

      // 如果当前节点已配置权限，或者有子节点已配置权限，则保留该节点
      if (isConfigured) {
        // 找到对应的权限配置数据
        const permissionData = tableData.value.find((item) => item.indicatorId === node.id);

        // 创建节点数据，合并指标信息和权限信息
        const nodeData = {
          id: node.id,
          indicatorName: node.indicatorName,
          indicatorCode: node.indicatorCode,
          pageUrl: node.pageUrl,
          path: currentPath.join(' / '),
          children: [],
        };

        // 添加权限信息
        if (permissionData) {
          Object.assign(nodeData, permissionData);
        }

        // 处理子节点
        if (node.children && node.children.length > 0) {
          const childrenNodes = node.children.map((child) => processNode(child, currentPath, depth + 1)).filter(Boolean);

          if (childrenNodes.length > 0) {
            nodeData.children = childrenNodes;
          }
        }

        return nodeData;
      } else if (node.children && node.children.length > 0) {
        // 处理子节点
        const childrenNodes = node.children.map((child) => processNode(child, currentPath, depth + 1)).filter(Boolean);

        if (childrenNodes.length > 0) {
          // 如果有子节点被保留，则创建一个父节点（不带权限信息）
          return {
            id: node.id + '_folder',
            indicatorName: node.indicatorName,
            indicatorCode: node.indicatorCode,
            pageUrl: node.pageUrl,
            path: currentPath.join(' / '),
            children: childrenNodes,
          };
        }
      }

      // 如果当前节点和子节点都没有配置权限，则不保留
      return null;
    }

    // 处理根节点
    treeTableData.value = treeCopy.map((node) => processNode(node)).filter(Boolean);
  }

  // 显示添加权限弹窗
  async function showAddPermissionModal() {
    modalVisible.value = true;
    await loadIndicatorTree();
  }

  // 加载指标树
  async function loadIndicatorTree() {
    treeLoading.value = true;
    try {
      const res = await indicatorFrontEndApi.queryIndicatorTree({});
      if (res.ok && res.data) {
        // 深拷贝数据，避免引用问题
        treeData.value = JSON.parse(JSON.stringify(res.data));

        // 设置已配置权限的指标为已勾选
        const configuredIndicatorIds = tableData.value.map((item) => item.indicatorId);
        checkedKeys.value = configuredIndicatorIds;
      } else {
        message.error('获取指标树失败');
        treeData.value = [];
        checkedKeys.value = [];
      }
    } catch (error) {
      smartSentry.captureError(error);
      message.error('加载指标树出错');
      treeData.value = [];
      checkedKeys.value = [];
    } finally {
      treeLoading.value = false;
    }
  }

  // 保存权限设置
  async function handleSavePermissions() {
    if (!selectRoleId.value) {
      message.error('请先选择角色');
      return;
    }

    if (checkedKeys.value.length === 0) {
      message.warning('请至少选择一个指标');
      return;
    }

    SmartLoading.show();
    try {
      // 构建保存数据
      const saveData = {
        roleId: selectRoleId.value,
        permissionType: props.permissionType,
        indicatorIds: checkedKeys.value, // 这里传递所有当前勾选的指标ID
      };
      console.log('indicatorIds--' + saveData.indicatorIds);
      // // 调用保存API
      const res = await roleIndicatorFrontEndApi.saveRoleIndicator(saveData);

      if (res.ok) {
        message.success('保存成功');
        modalVisible.value = false;
        loadRoleIndicatorPermissions(); // 重新加载数据
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error) {
      smartSentry.captureError(error);
      message.error('保存权限出错');
    } finally {
      SmartLoading.hide();
    }
  }

  // 删除权限
  async function handleDelete(id) {
    SmartLoading.show();
    try {
      // 调用删除API
      const res = await roleIndicatorFrontEndApi.delete(id);

      if (res.ok) {
        message.success('删除成功');
        loadRoleIndicatorPermissions(); // 重新加载数据
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (error) {
      smartSentry.captureError(error);
      message.error('删除权限出错');
    } finally {
      SmartLoading.hide();
    }
  }

  // 检查指标是否已配置权限
  function isIndicatorConfigured(indicatorId) {
    return tableData.value.some((item) => item.indicatorId === indicatorId);
  }
</script>

<style scoped lang="less">
  .tree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    p {
      margin-bottom: 0;
    }
  }

  .tree-container {
    height: 400px;
    overflow-y: auto;
    padding: 8px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
  }

  .indicator-code {
    color: #999;
    font-size: 12px;
  }
</style>
