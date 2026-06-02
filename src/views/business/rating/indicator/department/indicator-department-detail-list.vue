<template>
  <a-row :gutter="16">
    <a-col class="indicator-tree-column">
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
    </a-col>

    <!-- Right Column: Indicator Data (Existing Content) -->
    <a-col class="indicator-data-column">
      <a-card
        size="small"
        :bordered="false"
        :hoverable="true"
        class="fixed-height-card"
        :title="`指标数据 ${selectedIndicatorFromTree ? `- [${selectedIndicatorFromTree.indicatorName}]` : ''}`"
      >
        <!-- Search Form (from original component) -->
        <a-form layout="inline" :model="searchFormState" @finish="handleSearch" class="search-form">
          <a-form-item label="名称" name="indicatorName">
            <a-input
              v-model:value="searchFormState.indicatorName"
              :placeholder="selectedIndicatorFromTree ? selectedIndicatorFromTree.indicatorName : '请输入指标名称'"
              :disabled="!!selectedIndicatorFromTree"
              size="small"
              style="width: 160px"
            />
          </a-form-item>
          <a-form-item label="编码" name="indicatorCode">
            <a-input
              v-model:value="searchFormState.indicatorCode"
              :placeholder="selectedIndicatorFromTree ? selectedIndicatorFromTree.indicatorCode : '请输入指标编码'"
              :disabled="!!selectedIndicatorFromTree"
              size="small"
              style="width: 130px"
            />
          </a-form-item>
          <a-form-item label="频率" name="frequency">
            <a-select
              v-model:value="searchFormState.frequency"
              placeholder="频率"
              size="small"
              style="width: 100px"
              :options="frequencyOptions"
              @change="onFrequencyChange"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="年份" name="year">
            <a-select v-model:value="searchFormState.year" placeholder="年份" size="small" style="width: 90px" :options="yearOptions" allow-clear />
          </a-form-item>
          <a-form-item label="期间" name="period">
            <a-select
              v-model:value="searchFormState.period"
              placeholder="期间"
              size="small"
              style="width: 100px"
              :options="periodOptions"
              allow-clear
            />
          </a-form-item>
        </a-form>

        <!-- Action Buttons -->
        <a-row type="flex" justify="end" style="margin-bottom: 8px; margin-top: 8px; margin-right: 100px">
          <a-space>
            <a-button
              size="small"
              type="primary"
              html-type="submit"
              :loading="tableLoading"
              :disabled="
                !selectedIndicatorFromTree ||
                (selectedIndicatorFromTree && selectedIndicatorFromTree.indicatorType && selectedIndicatorFromTree.indicatorType === 1)
              "
              @click="handleSearch"
            >
              <template #icon><SearchOutlined /></template> 查询
            </a-button>
            <a-button
              size="small"
              @click="handleResetSearch"
              :disabled="
                !selectedIndicatorFromTree ||
                (selectedIndicatorFromTree && selectedIndicatorFromTree.indicatorType && selectedIndicatorFromTree.indicatorType === 1)
              "
            >
              <template #icon><ReloadOutlined /></template> 重置
            </a-button>
          </a-space>
          <a-space>
            <a-button
              size="small"
              @click="handleManualSummary"
              :disabled="
                !selectedIndicatorFromTree ||
                (selectedIndicatorFromTree && selectedIndicatorFromTree.indicatorType && selectedIndicatorFromTree.indicatorType === 1)
              "
            >
              <template #icon><CalculatorOutlined /></template> 手动汇总
            </a-button>
            <a-button
              size="small"
              @click="handleDeptManualSummary"
              :disabled="
                !selectedIndicatorFromTree ||
                (selectedIndicatorFromTree && selectedIndicatorFromTree.indicatorType && selectedIndicatorFromTree.indicatorType === 1)
              "
            >
              <template #icon><ApartmentOutlined /></template> 科级数据手动汇总
            </a-button>
            <a-button
              size="small"
              type="primary"
              @click="handleAdd"
              :disabled="
                !selectedIndicatorFromTree ||
                (selectedIndicatorFromTree && selectedIndicatorFromTree.indicatorType && selectedIndicatorFromTree.indicatorType === 1)
              "
            >
              <template #icon><PlusOutlined /></template> 增加
            </a-button>
            <a-button
              size="small"
              @click="handleBatchAdd"
              :disabled="
                !selectedIndicatorFromTree ||
                (selectedIndicatorFromTree && selectedIndicatorFromTree.indicatorType && selectedIndicatorFromTree.indicatorType === 1)
              "
            >
              <template #icon><PlusSquareOutlined /></template> 批量增加
            </a-button>
          </a-space>
        </a-row>

        <!-- Data Table -->
        <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="tableLoading"
          :pagination="paginationState"
          @change="handleTableChange"
          size="small"
          bordered
          row-key="id"
          class="fixed-height-table"
          :scroll="{ x: true }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'whetherCover'">
              <span>{{ record.whetherCover ? '是' : '否' }}</span>
            </template>
            <template v-if="column.key === 'year' && searchFormState.frequency == 1">
              <span>
                {{ record.year }}-
                {{ getLabelByPeriodValue(record.serialNum) }}
              </span>
            </template>
            <template v-if="column.key === 'year' && searchFormState.frequency == 2">
              <span>
                {{ record.year }}-
                {{ getLabelByPeriodValue(record.serialNum) }}
                {{ record.day ? '-' + record.day + '日' : '' }}
              </span>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleEdit(record)"><EditOutlined />编辑</a-button>
                <a-popconfirm title="确定删除此条数据吗？" @confirm="handleDelete(record.id)">
                  <a-button type="link" danger size="small"><DeleteOutlined />删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
            <template v-if="column.key === 'value1' && selectedIndicatorExtraConfig.secondaryDrilldownGroupField !== null">
              <a-button type="link" size="small" @click="showGroupData(record)">{{ record.value1 }}</a-button>
            </template>
          </template>
        </a-table>
      </a-card>
      <!-- Modal (from original component) -->
      <indicator-detail-form ref="indicatorFormRef" @reloadList="handleSearch" />
      <indicator-detail-group ref="indicatorGroupRef" />
      <indicator-detail-d-group ref="indicatorDGroupRef" />
    </a-col>
  </a-row>
</template>

<script setup>
  import { ref, reactive, onMounted, computed, watch } from 'vue';
  import { message, Modal as AntdModal, Popconfirm as APopconfirm } from 'ant-design-vue';
  import {
    SearchOutlined,
    CalculatorOutlined,
    ApartmentOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    PlusSquareOutlined,
    ReloadOutlined,
  } from '@ant-design/icons-vue';
  // Assuming indicatorManageApi is available for fetching tree data
  import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
  import { indicatorExtraConfigApi } from '/@/api/business/rating/indicator/manage/indicator-extra-config-api';
  import { indicatorDetailApi } from '/@/api/business/rating/indicator/detail/indicator-detail-api';
  import { indicatorDetailDApi } from '/@/api/business/rating/indicator/detail/indicator-detail-d-api';
  // import IndicatorDetailForm from './indicator-detail-form.vue';
  // import IndicatorDetailGroup from './indicator-detail-group.vue';
  // import IndicatorDetailDGroup from './indicator-detail-group-d.vue';
  import { optionOptions } from 'ant-design-vue/lib/vc-mentions/src/Option';

  // --- Left Tree State & Logic (修改部分) ---
  const treeLoading = ref(false);
  const originalTreeData = ref([]);
  const filteredTreeData = ref([]);
  const selectedIndicatorFromTree = ref(null); // Stores the selected node object
  const selectedIndicatorExtraConfig = ref(null);
  const treeSearchState = reactive({ searchText: '' });
  const selectedKeys = ref([]); // 当前选中节点的keys
  const expandedKeys = ref([]); // 当前展开节点的keys
  const allKeys = ref([]); // 所有节点keys (用于展开全部)

  // 用于 a-tree 的处理函数
  function handleTreeSelect(selectedKeys, { node, selected }) {
    if (!selected) return; // 不处理取消选择的情况

    const record = node.dataRef; // a-tree 中节点的数据对象
    selectedIndicatorFromTree.value = record;
    console.log(record.indicatorType === 2);
    // 根据indicatorType判断是否显示右侧数据(2:指标 1:文件夹)
    if (record.indicatorType === 2) {
      // 指标类型，加载数据
      searchFormState.frequency = '1';
      fetchIndicatorExtraConfig();
    } else {
      // 文件夹类型，清空右侧表格
      tableData.value = [];
      paginationState.total = 0;
      paginationState.pageNum = 1;
    }
  }

  /**
   * 抓取指标取数配置
   */
  async function fetchIndicatorExtraConfig() {
    const indicatoryId = selectedIndicatorFromTree.value.id;
    const res = await indicatorExtraConfigApi.queryIndicatorById(indicatoryId);
    if (res.data && res.ok) {
      selectedIndicatorExtraConfig.value = res.data;
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
        nodes.forEach((node) => {
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
    nodes.forEach((node) => {
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

  // 监听搜索文字变化
  watch(
    () => treeSearchState.searchText,
    () => {
      applyTreeFilter();
    }
  );

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

  // 监听选中节点变化，更新selectedKeys数组
  watch(
    () => selectedIndicatorFromTree.value,
    (newValue) => {
      if (newValue) {
        selectedKeys.value = [newValue.id];
      } else {
        selectedKeys.value = [];
      }
    }
  );

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

  // --- Right Table State & Logic (adapted from original) ---
  const searchFormState = reactive({
    indicatorName: '', // Will be primarily driven by tree selection now
    indicatorCode: '', // Will be primarily driven by tree selection now
    selectedIndicatorId: undefined, // To store ID from tree
    frequency: '1',
    year: undefined,
    period: undefined,
  });

  const frequencyOptions = ref([
    { label: '年季月', value: '1' },
    { label: '天数', value: '2' },
  ]);

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      const year = currentYear - i;
      years.push({ label: `${year}`, value: year });
    }
    return years;
  };

  const yearOptions = ref(generateYearOptions());

  const defaultPeriodOptions = ref([
    // 月份选项
    { label: '1月份', value: 1 },
    { label: '2月份', value: 2 },
    { label: '3月份', value: 3 },
    { label: '4月份', value: 4 },
    { label: '5月份', value: 5 },
    { label: '6月份', value: 6 },
    { label: '7月份', value: 7 },
    { label: '8月份', value: 8 },
    { label: '9月份', value: 9 },
    { label: '10月份', value: 10 },
    { label: '11月份', value: 11 },
    { label: '12月份', value: 12 },
    // 季度选项
    { label: '第一季度', value: 13 },
    { label: '第二季度', value: 14 },
    { label: '第三季度', value: 15 },
    { label: '第四季度', value: 16 },
    // 半年和全年选项
    { label: '上半年', value: 17 },
    { label: '下半年', value: 18 },
    { label: '全年', value: 19 },
  ]);
  const periodOptions = ref([]);
  const periodOptionsMonth = ref([
    // 月份选项
    { label: '1月份', value: 1 },
    { label: '2月份', value: 2 },
    { label: '3月份', value: 3 },
    { label: '4月份', value: 4 },
    { label: '5月份', value: 5 },
    { label: '6月份', value: 6 },
    { label: '7月份', value: 7 },
    { label: '8月份', value: 8 },
    { label: '9月份', value: 9 },
    { label: '10月份', value: 10 },
    { label: '11月份', value: 11 },
    { label: '12月份', value: 12 },
  ]);

  // 根据期间值获取对应的标签文本
  const getLabelByPeriodValue = (value) => {
    if (!value && value !== 0) return '';
    // 将value转为数字类型处理
    const periodValue = Number(value);

    // 查找对应的选项
    const option = defaultPeriodOptions.value.find((opt) => opt.value === periodValue);

    // 如果找到了对应选项，返回其标签，否则返回空字符串
    return option ? option.label : '';
  };

  const tableLoading = ref(false);
  const tableData = ref([]);
  const paginationState = reactive({
    pageNum: 1,
    pageSize: 15,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['15', '30', '50', '100'],
    showTotal: (total, range) => `显示 ${range[0]} 到 ${range[1]}, 共 ${total} 条记录`,
  });

  const columns = ref([
    // Columns for the right-side data table
    { title: '操作', key: 'action', width: 120, fixed: 'left', align: 'center' },
    { title: '日期', dataIndex: 'year', key: 'year', width: 180, align: 'center' },
    { title: '数值1', dataIndex: 'value1', key: 'value1', width: 100, align: 'right' },
    { title: '数值2', dataIndex: 'value2', key: 'value2', width: 100, align: 'right' },
    { title: '数值3', dataIndex: 'value3', key: 'value3', width: 100, align: 'right' },
    { title: '是否覆盖', dataIndex: 'whetherCover', key: 'whetherCover', width: 100, align: 'center' },
    { title: '更新者', dataIndex: 'updateUserName', key: 'updateUserName', width: 120, align: 'center' },
    { title: '更新日期', dataIndex: 'updateTime', key: 'updateTime', width: 200, align: 'center' },
    { title: '备注', dataIndex: 'remark', key: 'remark', width: 200 },
  ]);

  const indicatorFormRef = ref(null);
  const indicatorGroupRef = ref(null);
  const indicatorDGroupRef = ref(null);

  // Watch for selected indicator from tree to update search criteria
  watch(
    selectedIndicatorFromTree,
    (newNode) => {
      if (newNode && (!newNode.indicatorType || newNode.indicatorType === 2)) {
        // Only for leaf nodes
        searchFormState.selectedIndicatorId = newNode.id;
        // searchFormState.indicatorName = newNode.indicatorName; // Reflect in form (optional)
        // searchFormState.indicatorCode = newNode.indicatorCode; // Reflect in form (optional)
        // Reset other filters when a new indicator is selected from tree for clarity
        searchFormState.frequency = '1';
        // searchFormState.year = undefined;
        // searchFormState.period = undefined;
        // periodOptions.value = [];
        handleSearch(); // Automatically fetch data for the newly selected leaf indicator
      } else {
        searchFormState.selectedIndicatorId = undefined;
        // searchFormState.indicatorName = '';
        // searchFormState.indicatorCode = '';
        tableData.value = []; // Clear data if no leaf node or no node selected
        paginationState.total = 0;
      }
    },
    { deep: true }
  );

  async function fetchData() {
    // // For right-side table
    // if (!selectedIndicatorFromTree.value || (selectedIndicatorFromTree.value.indicatorType && selectedIndicatorFromTree.value.children.length > 0)) {
    //   tableData.value = [];
    //   paginationState.total = 0;
    //   paginationState.pageNum = 1;
    //   if (selectedIndicatorFromTree.value) {
    //     message.info('请选择一个末级指标以查看或录入数据。');
    //   }
    //   return;
    // }

    tableLoading.value = true;
    try {
      const params = {
        indicatorId: selectedIndicatorFromTree.value?.id, // Key parameter
        frequency: searchFormState.frequency,
        year: searchFormState.year,
        period: searchFormState.period,
        pageNum: paginationState.pageNum,
        pageSize: paginationState.pageSize,
      };
      let res = null;
      if (params.period < 10) {
        params.period = '0' + params.period;
      }
      if (params.frequency && params.frequency == '1') {
        res = await indicatorDetailApi.queryPage(params);
      } else if (params.frequency && params.frequency == '2') {
        res = await indicatorDetailDApi.queryPage(params);
      }
      if (res.ok && res.data) {
        tableData.value = res.data.list;
        paginationState.total = res.data.total;
      } else {
        message.error(res.msg || '获取数据失败');
        tableData.value = [];
        paginationState.total = 0;
      }
    } catch (error) {
      message.error('获取数据时发生错误');
      tableData.value = [];
      paginationState.total = 0;
      // smartSentry.captureError(error);
    } finally {
      tableLoading.value = false;
    }
  }

  function handleSearch() {
    // For right-side table
    paginationState.pageNum = 1;
    fetchData();
  }

  function handleResetSearch() {
    // For right-side table form
    // Keep selectedIndicatorFromTree, only reset form fields for current indicator
    searchFormState.frequency = undefined;
    searchFormState.year = undefined;
    searchFormState.period = undefined;
    if (selectedIndicatorFromTree.value && (!selectedIndicatorFromTree.value.children || selectedIndicatorFromTree.value.children.length === 0)) {
      handleSearch();
    } else {
      tableData.value = [];
      paginationState.total = 0;
    }
  }

  function handleTableChange(pagination, filters, sorter) {
    // For right-side table
    paginationState.pageNum = pagination.pageNum;
    paginationState.pageSize = pagination.pageSize;
    fetchData();
  }

  // --- Action button handlers (original, ensure they use selectedIndicatorFromTree.value.id) ---
  function handleAdd() {
    // if (!selectedIndicatorFromTree.value || (selectedIndicatorFromTree.value.children && selectedIndicatorFromTree.value.children.length > 0)) {
    //   message.warn('请先从左侧选择一个末级指标。');
    //   return;
    // }

    // 创建一个新的数据对象，包含从树节点获取的指标ID、编码和名称
    const newRecord = {
      indicatorId: selectedIndicatorFromTree.value.id,
      indicatorCode: selectedIndicatorFromTree.value.indicatorCode,
      indicatorName: selectedIndicatorFromTree.value.indicatorName,
      // 其他字段保持为空
    };

    // 传递预填充的对象和当前的查询条件
    indicatorFormRef.value.show(newRecord, null, searchFormState);
  }

  function handleEdit(record) {
    // 确保编辑数据包含指标编码和名称
    if (!record.indicatorCode && selectedIndicatorFromTree.value) {
      record.indicatorCode = selectedIndicatorFromTree.value.indicatorCode;
    }

    if (!record.indicatorName && selectedIndicatorFromTree.value) {
      record.indicatorName = selectedIndicatorFromTree.value.indicatorName;
    }

    // 传递记录、指标信息和当前的查询条件
    indicatorFormRef.value.show(record, null, searchFormState);
  }

  async function handleDelete(id) {
    try {
      let res = null;
      if (searchFormState.frequency === '1') {
        res = await indicatorDetailApi.delete(id);
      } else if (searchFormState.frequency === '2') {
        res = await indicatorDetailDApi.delete(id);
      }
      if (res.ok) {
        message.success('删除成功');
        fetchData();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除数据时发生错误');
    }
  }

  function handleManualSummary() {
    if (!selectedIndicatorFromTree.value) return message.warn('请先选择一个指标');
    message.info(`手动汇总功能待实现 (指标ID: ${selectedIndicatorFromTree.value.id})`);
  }
  function handleDeptManualSummary() {
    if (!selectedIndicatorFromTree.value) return message.warn('请先选择一个指标');
    message.info(`科级数据手动汇总待实现 (指标ID: ${selectedIndicatorFromTree.value.id})`);
  }
  function handleBatchAdd() {
    if (!selectedIndicatorFromTree.value) return message.warn('请先选择一个指标');
    message.info(`批量增加功能待实现 (指标ID: ${selectedIndicatorFromTree.value.id})`);
  }

  async function fetchInitialOptionsForForm() {
    yearOptions.value = generateYearOptions();
    // 频率和期间选项已经静态定义，不需要从API加载
  }

  function showGroupData(record) {
    if (!selectedIndicatorExtraConfig.value || !selectedIndicatorExtraConfig.value.secondaryDrilldownGroupField) {
      message.warn('未配置分组字段');
      return;
    }
    console.log(searchFormState.frequency);
    const groupField = selectedIndicatorExtraConfig.value.secondaryDrilldownGroupField;
    const modalTitle = `${record.indicatorName || selectedIndicatorFromTree.value.indicatorName}`;

    if (searchFormState.frequency && searchFormState.frequency == 1) {
      //年季月
      indicatorGroupRef.value.show(record, groupField, modalTitle);
    } else if (searchFormState.frequency && searchFormState.frequency == 2) {
      //日
      indicatorDGroupRef.value.show(record, groupField, modalTitle);
    }
  }

  // 添加频率变更处理函数
  function onFrequencyChange(value) {
    // 清空已选期间值
    searchFormState.period = undefined;

    // 根据频率类型加载不同的期间选项
    if (value === '1') {
      // 年季月频率 - 加载全部期间选项（包括月份、季度、半年和全年）
      periodOptions.value = [
        // 月份选项
        { label: '1月份', value: 1 },
        { label: '2月份', value: 2 },
        { label: '3月份', value: 3 },
        { label: '4月份', value: 4 },
        { label: '5月份', value: 5 },
        { label: '6月份', value: 6 },
        { label: '7月份', value: 7 },
        { label: '8月份', value: 8 },
        { label: '9月份', value: 9 },
        { label: '10月份', value: 10 },
        { label: '11月份', value: 11 },
        { label: '12月份', value: 12 },
        // 季度选项
        { label: '第一季度', value: 13 },
        { label: '第二季度', value: 14 },
        { label: '第三季度', value: 15 },
        { label: '第四季度', value: 16 },
        // 半年和全年选项
        { label: '上半年', value: 17 },
        { label: '下半年', value: 18 },
        { label: '全年', value: 19 },
      ];
    } else if (value === '2') {
      // 天数频率 - 只加载月份选项
      periodOptions.value = periodOptionsMonth.value;
    } else {
      // 未选择频率或频率无效 - 清空期间选项
      periodOptions.value = [];
    }
    if (selectedIndicatorFromTree.value) {
      handleSearch();
    }
  }

  onMounted(() => {
    fetchIndicatorTreeData(); // 加载左侧树
    fetchInitialOptionsForForm(); // 应该调用此函数以确保年份选项是最新的
    onFrequencyChange(searchFormState.frequency); // 初始化期间选项
  });
</script>

<style lang="less" scoped>
  .indicator-tree-column {
    width: 30%;
  }
  .indicator-data-column {
    width: 70%;
  }

  .fixed-height-card {
    //height: calc(100vh - 125px);

    :deep(.ant-card-body) {
      //height: calc(100% - 45px);
      padding: 8px;
      display: flex;
      flex-direction: column;
      overflow: visible; // 允许分页控件显示
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

  // 基本表单样式
  .search-form {
    :deep(.ant-form-item) {
      margin-bottom: 8px;
      margin-right: 8px !important;
    }
  }
</style>
