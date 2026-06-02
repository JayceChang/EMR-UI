<template>
  <a-card size="small" :bordered="false" :hoverable="true" title="指标前端列表">
    <!---------- 树状表格 begin ----------->
    <a-spin :spinning="treeLoading">
      <div class="tree-table-container">
        <a-table
          :dataSource="filteredTreeData"
          :columns="columns"
          rowKey="id"
          size="small"
          bordered
          :pagination="false"
          :rowClassName="setRowClassName"
          :customRow="handleTableRow"
          :childrenColumnName="'children'"
          :indentSize="12"
          class="compact-table"
          @change="handleTableChange"
        >
          <!-- 自定义列渲染 -->
          <template #bodyCell="{ text, record, column }">
            <!-- 高亮显示匹配的文本 -->
            <template v-if="column.dataIndex === 'indicatorName'">
              <span v-html="highlightText(text, state.searchText)"></span>
            </template>
            <!-- 其他列的渲染 -->
            <template v-else-if="column.dataIndex === 'indicatorType'">
              <span>{{ $smartEnumPlugin.getDescByValue('INDICATOR_TYPE_ENUM', text) }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'disabledFlag'">
              <span :style="{ color: !text ? 'green' : 'red' }">
                {{ $smartEnumPlugin.getDescByValue('DISABLED_FLAG_ENUM', text) }}
              </span>
            </template>
            <template v-else-if="column.dataIndex === 'action'">
              <div class="smart-table-operate">
                <a-button @click.stop="showForm({ parentId: record.id })" type="link" size="small" title="新建子项">
                  <template #icon><PlusOutlined /></template>
                </a-button>
                <a-button @click.stop="showForm(record)" type="link" size="small" title="编辑">
                  <template #icon><FormOutlined /></template>
                </a-button>
                <a-button @click.stop="onDelete(record)" danger type="link" size="small" title="删除">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <!---------- 树状表格 end ----------->
  </a-card>

  <!-- 基础信息表单 (Modal) -->
  <template>
    <!-- 注意：这里的表单只包含基础信息字段 -->
    <a-modal
      :title="form.id ? '编辑指标' : '新建指标'"
      :width="600"
      :open="visibleFlag"
      @cancel="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
    >
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
        <!-- 隐藏的 ID 字段，用于编辑 -->
        <a-form-item label="ID" name="id" v-show="false">
          <a-input v-model:value="form.id" />
        </a-form-item>

        <a-form-item label="指标名称" name="indicatorName">
          <a-input style="width: 100%" v-model:value="form.indicatorName" placeholder="请输入指标名称" />
        </a-form-item>
        <a-form-item label="指标编码" name="indicatorCode">
          <a-input style="width: 100%" v-model:value="form.indicatorCode" placeholder="请输入指标编码" />
        </a-form-item>
        <a-form-item label="页面地址" name="pageUrl" v-show="isIndicator">
          <a-input style="width: 100%" v-model:value="form.pageUrl" placeholder="请输入页面地址" />
        </a-form-item>
        <a-form-item label="目录层级" name="isRoot">
          <a-switch
            v-model:checked="isRoot"
            :checkedValue="true"
            :unCheckedValue="false"
            checked-children="根目录"
            un-checked-children="子目录"
            @change="handleSwitchIsRoot"
          />
        </a-form-item>
        <a-form-item label="上级指标目录" name="parentId" v-show="!isRoot">
          <GenericTreeSelect
            v-model:value="form.parentId"
            :apiFunc="indicatorFrontEndApi.queryIndicatorTree"
            :apiParams="true"
            :fieldNames="{ label: 'indicatorName', value: 'id', key: 'id', children: 'children' }"
            placeholder="请选择上级指标目录"
            treeDefaultExpandAll
          />
        </a-form-item>
        <a-form-item label="指标类型" name="indicatorType">
          <SmartEnumSelect width="100%" v-model:value="form.indicatorType" enum-name="INDICATOR_TYPE_ENUM" placeholder="请选择指标类型" @change="handleIndicatorTypeChange" />
        </a-form-item>
        <a-form-item label="禁用状态" name="disabledFlag">
          <a-switch v-model:checked="form.disabledFlag" :checkedValue="1" :unCheckedValue="2" checked-children="启用" un-checked-children="禁用" />
        </a-form-item>
        <a-form-item label="序号" name="sort">
          <a-input-number style="width: 100%" v-model:value="form.sort" placeholder="请输入序号" />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-space>
          <a-button @click="onClose">取消</a-button>
          <a-button type="primary" :loading="loading" @click="onSubmit">保存</a-button>
        </a-space>
      </template>
    </a-modal>
  </template>
</template>

<script setup>
  import { reactive, ref, onMounted, computed, watch, nextTick } from 'vue';
  import _ from 'lodash';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { indicatorFrontEndApi } from '/@/api/business/rating/indicator/frontend/index';
  import { smartSentry } from '/@/lib/smart-sentry';
  import SmartEnumSelect from '/@/components/framework/smart-enum-select/index.vue'; // 导入枚举选择组件
  import GenericTreeSelect from '/@/components/business/common/tree-select/generic-tree-select.vue';
  import IndicatorForm from '../indicator-manage-form.vue';
  import { SearchOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined, FormOutlined } from '@ant-design/icons-vue';

  // ---------------------------- State ----------------------------
  const selectedIndicator = ref(null);
  const treeLoading = ref(false);
  const originalTreeData = ref([]);
  const filteredTreeData = ref([]);
  const selectedRowKeyList = ref([]);
  const searchInput = ref(); // 用于聚焦搜索输入框

  // 表格筛选状态
  const state = reactive({
    searchText: '',
    searchedColumn: '',
  });

  // ---------------------------- Columns Definition ----------------------------
  const columns = ref([
    {
      title: '名称',
      dataIndex: 'indicatorName',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    { title: '编码', dataIndex: 'indicatorCode', key: 'code', width: 80, ellipsis: true },
    { title: '类型', dataIndex: 'indicatorType', key: 'type', width: 80 },
    { title: '排序号', dataIndex: 'sort', key: 'order', width: 60, align: 'center' },
    { title: '操作', dataIndex: 'action', key: 'action', width: 100, align: 'center', fixed: 'right' },
  ]);

  // ---------------------------- Tree Filtering Functions ----------------------------
  // 递归过滤树结构
  function filterTree(nodes, predicate) {
    if (!nodes || nodes.length === 0) return [];

    return nodes
      .map((node) => {
        // 递归处理子节点
        const filteredChildren = node.children ? filterTree(node.children, predicate) : [];

        // 如果当前节点匹配条件，或者它有匹配的子节点，则保留
        if (predicate(node) || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : undefined,
          };
        }

        // 否则过滤掉
        return null;
      })
      .filter(Boolean); // 移除空值
  }

  function applyTreeFilter() {
    const nameFilter = state.searchText?.toLowerCase();
    if (!nameFilter) {
      // 如果没有筛选条件，直接使用原始数据映射
      filteredTreeData.value = mapTreeForTable(originalTreeData.value);
      return;
    }
    // 定义筛选谓词：节点名称包含筛选文本，或者其任何子节点包含筛选文本（这样可以显示匹配项的父级）
    const predicate = (node) => node.indicatorName?.toLowerCase().includes(nameFilter);
    // 使用 filterTree 函数进行递归筛选
    const filtered = filterTree(originalTreeData.value, predicate);
    // 映射筛选后的树结构以适应表格
    filteredTreeData.value = mapTreeForTable(filtered);
  }

  const mapTreeForTable = (nodes) => {
    if (!nodes || nodes.length === 0) return [];
    return nodes.map((node) => ({
      ...node,
      children: node.children && node.children.length > 0 ? mapTreeForTable(node.children) : undefined,
    }));
  };

  // 监听搜索文本变化，自动应用筛选
  watch(
    () => state.searchText,
    (newVal) => {
      applyTreeFilter();
    }
  );


  // 表格变化处理器，主要用于处理筛选变化
  const handleTableChange = (pagination, filters, sorter) => {
    // 如果名称列有筛选值，更新 state.searchText
    if (filters.indicatorName && filters.indicatorName.length > 0) {
      if (state.searchText !== filters.indicatorName[0]) {
        state.searchText = filters.indicatorName[0];
        state.searchedColumn = 'indicatorName';
      }
    } else {
      // 如果清除了筛选，也同步更新 state
      if (state.searchedColumn === 'indicatorName') {
        state.searchText = '';
        state.searchedColumn = '';
      }
    }
  };

  // ---------------------------- Row Styling and Interaction ----------------------------
  function setRowClassName(record) {
    return selectedIndicator.value?.id === record.id ? 'table-row-selected' : '';
  }

  function handleTableRow(record) {
    return {
      onDblclick: () => {
        showForm(record);
      },
    };
  }

  // ---------------------------- Text Highlighting ----------------------------
  function highlightText(text, keyword) {
    if (!keyword || !text) return text;
    const regex = new RegExp(keyword, 'gi');
    return text.toString().replace(regex, (match) => `<span style="background-color: yellow">${match}</span>`);
  }

  // ---------------------------- Data Loading ----------------------------
  async function queryData() {
    treeLoading.value = true;
    selectedIndicator.value = null;
    selectedRowKeyList.value = [];
    try {
      // 查询时不再传递 indicatorName，因为筛选在前端完成
      let queryResult = await indicatorFrontEndApi.queryIndicatorTree({});
      originalTreeData.value = queryResult.data || [];
      applyTreeFilter(); // 加载后应用当前的筛选条件（如果有）
    } catch (e) {
      smartSentry.captureError(e);
      originalTreeData.value = [];
      filteredTreeData.value = [];
    } finally {
      treeLoading.value = false;
    }
  }

  onMounted(queryData);

  // ------------------------ 表单 ------------------------
  const visibleFlag = ref(false);
  const loading = ref(false); // 保存按钮 loading 状态
  const isRoot = ref(false); //是否创建根目录
  const isIndicator = ref(false); //是否指标类型

  // 组件ref
  const formRef = ref();

  const formDefault = {
    id: undefined, // 主键
    indicatorName: undefined, // 指标名称
    indicatorCode: undefined, // 指标编码
    indicatorType: 2, // 指标类型 (根据枚举设置默认值，例如：1)
    disabledFlag: 1, // 是否启用 (默认为 是)
    sort: undefined, // 序号
    remark: undefined, // 备注 (如果添加了备注字段)
    parentId: undefined, //父级ID
    pageUrl: undefined, //页面地址
  };

  let form = reactive({ ...formDefault });

  // 表单校验规则
  const rules = {
    indicatorName: [{ required: true, message: '指标名称 必填' }],
    indicatorCode: [{ required: true, message: '指标编码 必填' }],
    indicatorType: [{ required: true, message: '指标类型 必选' }],
    disabledFlag: [{ required: true, message: '是否启用 必选' }],
    sort: [{ required: false, type: 'number', message: '序号必须是数字' }], // 序号非必填，但需是数字
    parentId: [{ required: true, message: '上级目录 必选' }],
    pageUrl: [{ required: true, validator: (rule, value) => {
      if (isIndicator.value && !value) {
        return Promise.reject('页面地址 必选');
      }
      return Promise.resolve();
    }}],
  };

  // 点击确定，验证表单
  async function onSubmit() {
    try {
      await formRef.value.validateFields();
      save();
    } catch (err) {
      message.error('参数验证错误，请仔细填写表单数据!');
    }
  }

  function onClose() {
    visibleFlag.value = false;
    loading.value = false;
  }

  // 新建、编辑API
  async function save() {
    loading.value = true; // 开始 loading
    SmartLoading.show(); // 可选：全局 loading
    try {
      let result;
      if (form.id) {
        result = await indicatorFrontEndApi.update(form); // 使用新的 API
      } else {
        result = await indicatorFrontEndApi.add(form); // 使用新的 API
      }
      // 可选：处理后端返回的 result

      message.success('操作成功');
      onClose(); // 关闭弹窗
    } catch (err) {
      smartSentry.captureError(err);
    } finally {
      loading.value = false; // 结束 loading
      SmartLoading.hide(); // 可选：全局 loading
      queryData(); //重新刷新父页面表格数据
    }
  }

  // ---------------------------- Form and Delete Operations ----------------------------
  function showForm(rowData) {
    Object.assign(form, formDefault); // 重置表单
    if (rowData && !_.isEmpty(rowData)) {
      // 编辑时，合并数据
      Object.assign(form, rowData);
    }
    visibleFlag.value = true;
    nextTick(() => {
      if (formRef.value) {
        formRef.value.clearValidate(); // 清除上次的校验状态
        handleDefaultParentIdValue();
      }
    });
  }

  /**
   * 处理默认根目录
   */
  const handleDefaultParentIdValue = () => {
    if (form.parentId == 0) {
      isRoot.value = true;
    } else {
      isRoot.value = false;
    }
    if (form.indicatorType == 1) {
      isIndicator.value = false;
    } else {
      isIndicator.value = true;
    }
  };

  function onDelete(data) {
    if (data.children?.length) {
      message.error(`指标 [${data.indicatorName}] 下存在子指标，不能直接删除！`);
      return;
    }
    Modal.confirm({
      title: '提示',
      content: `确定要删除指标 [${data.indicatorName}] 吗?`,
      okText: '删除',
      okType: 'danger',
      async onOk() {
        await requestDelete(data);
      },
      cancelText: '取消',
    });
  }

  async function requestDelete(data) {
    SmartLoading.show();
    try {
      await indicatorFrontEndApi.delete(data.id);
      message.success('删除成功');
      if (selectedIndicator.value?.id === data.id) selectedIndicator.value = null;
      selectedRowKeyList.value = selectedRowKeyList.value.filter((key) => key !== data.id);
      await queryData(); // 删除后重新查询
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  // 处理指标类型变更
  function handleIndicatorTypeChange(value) {
    // 如果是文件夹类型(1)，则隐藏页面地址
    if (value === 1) {
      isIndicator.value = false;
    } else {
      // 如果是指标类型(2)，则显示页面地址
      isIndicator.value = true;
    }
  }

  /**
   * 处理切换是否根目录
   */
  const handleSwitchIsRoot = ()=>{
    if(isRoot.value){
      form.parentId = 0;
    }else{
      form.parentId = undefined;
    }
  }
</script>

<style lang="less" scoped>
  // 表格容器样式
  .tree-table-container {
    //height: calc(100vh - 175px);
    overflow: auto;
    position: relative;
  }

  // 选中行样式
  :deep(.table-row-selected) > td {
    background-color: #e6f7ff !important;
  }

  // 列宽调整
  .indicator-tree {
    width: 50%;
  }
  .indicator-config {
    width: 50%;
  }
</style>


