<template>
  <a-row :gutter="16">
    <!-- 左侧：指标树 -->
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

    <!-- 右侧：指标数据 -->
    <a-col class="indicator-data-column">
      <a-card
        size="small"
        :bordered="false"
        :hoverable="true"
        class="fixed-height-card"
        :title="`指标数据 ${selectedIndicatorFromTree ? `- [${selectedIndicatorFromTree.indicatorName}]` : ''}`"
      >
        <!-- 年份选择器 -->
        <div class="filter-bar">
          <span class="filter-label">年份:</span>
          <a-select v-model:value="searchFormState.year" placeholder="年份" size="small" style="width: 90px" :options="yearOptions" allow-clear />

          <a-button type="primary" size="small" class="query-btn" @click="handleQuery">
            <template #icon><SearchOutlined /></template>
            查询
          </a-button>
          <a-space>
            <a-button size="small" class="reset-btn" @click="handleReset">
              <template #icon><ReloadOutlined /></template>
              重置
            </a-button>

            <a-button size="small" class="export-btn" @click="handleExport" :disabled="!selectedIndicatorFromTree">
              <template #icon><FileExcelOutlined /></template>
              导出当前年度指标Excel
            </a-button>
            <!-- <a-button size="small" class="export-btn" @click="handleYearlyExport" :disabled="!selectedIndicatorFromTree">
              <template #icon><FileExcelOutlined /></template>
              导出近4年指标Excel
            </a-button> -->
          </a-space>
        </div>

        <!-- 月度数据表格 -->
        <a-table
          :columns="monthlyColumns"
          :scroll="{ y: 100 }"
          :dataSource="indicatorMonthlyData"
          :pagination="false"
          size="small"
          bordered
          class="monthly-data-table"
        >
          <!-- 自定义单元格渲染 -->
          <template #bodyCell="{ record, column, text }">
            <template v-if="column.dataIndex.includes('0') || column.dataIndex.includes('1')">
              <span>{{ text !== null ? text : '-' }}</span>
            </template>
            <template v-if="column.dataIndex == 'indicatorName'">
              <a-button type="link" @click="processSingleIndicators(record)">{{ text }}</a-button>
            </template>
          </template>
        </a-table>

        <!-- 图表展示区域 -->
        <div class="chart-container">
          <!-- <div class="chart-title-bar">
            <span class="chart-title">图表展示</span>
            <div class="chart-options">
              <span class="filter-label">统计类别:</span>
              <a-select v-model:value="chartOptions.statType" style="width: 100px" size="small">
                <a-select-option value="month">月度</a-select-option>
                <a-select-option value="quarter">季度</a-select-option>
                <a-select-option value="year">年度</a-select-option>
              </a-select>

              <span class="filter-label" style="margin-left: 16px">数值:</span>
              <a-select v-model:value="chartOptions.valueType" style="width: 100px" size="small">
                <a-select-option value="value1">数值1</a-select-option>
                <a-select-option value="value1">数值2</a-select-option>
                <a-select-option value="value1">数值3</a-select-option>
              </a-select>
            </div>
          </div> -->

          <!-- 图表组件 -->
          <div class="chart-content">
            <div class="chart-header">
              <h4></h4>
              <div class="chart-options">
                <a-space>
                  <span class="filter-label">统计类别:</span>
                  <a-select v-model:value="chartOptions.statType" style="width: 100px" size="small" @change="processSingleIndicators(null)">
                    <a-select-option value="month">月度</a-select-option>
                    <a-select-option value="quarter">季度</a-select-option>
                    <a-select-option value="year">年度</a-select-option>
                  </a-select>

                  <span class="filter-label" style="margin-left: 16px">数值:</span>
                  <a-select v-model:value="chartOptions.valueType" style="width: 100px" size="small" @change="processSingleIndicators(null)">
                    <a-select-option value="value1">数值1</a-select-option>
                    <a-select-option value="value2">数值2</a-select-option>
                    <a-select-option value="value3">数值3</a-select-option>
                  </a-select>

                  <span class="filter-label" style="margin-left: 16px">图表类型:</span>
                  <a-select v-model:value="chartOptions.chartType" style="width: 100px" size="small" @change="processSingleIndicators(null)">
                    <a-select-option value="bar">柱状图</a-select-option>
                    <a-select-option value="line">折线图</a-select-option>
                  </a-select>
                </a-space>
              </div>
            </div>
            <div id="indicator-chart" style="height: 300px; width: 100%"></div>
          </div>
        </div>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup>
  import { ref, reactive, onMounted, computed, watch, onUnmounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { SearchOutlined, ReloadOutlined, FileExcelOutlined } from '@ant-design/icons-vue';
  import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
  import { indicatorListApi } from '/@/api/business/rating/indicator/list/indicator-list-api';
  import * as echarts from 'echarts';
  import { nextTick } from 'vue';

  // --- 左侧树状态与逻辑 ---
  const treeLoading = ref(false);
  const originalTreeData = ref([]);
  const filteredTreeData = ref([]);
  const selectedIndicatorFromTree = ref(null);
  const treeSearchState = reactive({ searchText: '' });
  const selectedKeys = ref([]);
  const expandedKeys = ref([]);
  const allKeys = ref([]);
  const chatTitle = ref('');
  const chatSubTitle = ref();

  // 更新图表标题
  const changeChatTitle = () => {
    let year = searchFormState.year;
    let previousYear = parseInt(year) - 1;
    let title = `${year}年全年与${previousYear}年同期比`;

    if (chartOptions.statType === 'month') {
      title = `${year}年月度与${previousYear}年同期比`;
    } else if (chartOptions.statType === 'quarter') {
      title = `${year}年季度与${previousYear}年同期比`;
    } else if (chartOptions.statType === 'year') {
      title = `${year}年全年与${previousYear}年同期比`;
    } else if (chartOptions.statType === '3year') {
      title = '近三年同期比';
    } else if (chartOptions.statType === '5year') {
      title = '近五年同期比';
    }
    console.log(chatSubTitle.value);
    console.log(chatTitle.value);
    chatTitle.value = currentClickIndicatorName.value;
    chatSubTitle.value = title;
  };

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

  // --- 右侧表格和图表状态 ---
  const searchFormState = reactive({
    year: yearOptions.value[0].value,
  });

  const chartOptions = reactive({
    statType: 'month',
    valueType: 'value1',
    chartType: 'bar', // 默认为柱状图
  });

  // 图表实例
  let chartInstance = null;

  // 模拟图表数据 - 初始化为0
  const chartData = reactive({
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    data1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    data2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  const defaultChatData = reactive({
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    data1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    data2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  // 表格列定义
  const monthlyColumns = [
    { title: '指标', dataIndex: 'indicatorName', width: 200, fixed: 'left' },
    { title: '1月', dataIndex: '01', align: 'right' },
    { title: '2月', dataIndex: '02', align: 'right' },
    { title: '3月', dataIndex: '03', align: 'right' },
    { title: '4月', dataIndex: '04', align: 'right' },
    { title: '5月', dataIndex: '05', align: 'right' },
    { title: '6月', dataIndex: '06', align: 'right' },
    { title: '7月', dataIndex: '07', align: 'right' },
    { title: '8月', dataIndex: '08', align: 'right' },
    { title: '9月', dataIndex: '09', align: 'right' },
    { title: '10月', dataIndex: '10', align: 'right' },
    { title: '11月', dataIndex: '11', align: 'right' },
    { title: '12月', dataIndex: '12', align: 'right' },
    { title: '第一季度', dataIndex: '13', align: 'right' },
    { title: '第二季度', dataIndex: '14', align: 'right' },
    { title: '第三季度', dataIndex: '15', align: 'right' },
    { title: '第四季度', dataIndex: '16', align: 'right' },
    { title: '全年', dataIndex: '19', align: 'right' },
  ];

  // 模拟数据
  const indicatorMonthlyData = ref([]);

  // --- 树形组件方法 ---
  function handleTreeSelect(selectedKeys, { node, selected }) {
    if (!selected) return;
    const record = node.dataRef;
    selectedIndicatorFromTree.value = record;

    // 加载选中指标数据
    fetchIndicatorData(record.id);

    //初始化图标
    initChart();
  }

  function handleTreeExpand(keys) {
    expandedKeys.value = keys;
  }

  // 树形组件过滤方法
  function applyTreeFilter() {
    if (!treeSearchState.searchText) {
      filteredTreeData.value = mapTreeForDisplay(originalTreeData.value);
    } else {
      const filtered = filterTreeNodes(originalTreeData.value, treeSearchState.searchText);
      filteredTreeData.value = mapTreeForDisplay(filtered);

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

  // 辅助方法
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

  const mapTreeForDisplay = (nodes) => {
    if (!nodes || nodes.length === 0) return [];
    return nodes.map((node) => ({
      ...node,
      children: node.children && node.children.length > 0 ? mapTreeForDisplay(node.children) : undefined,
    }));
  };

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

  // 监听选中节点变化
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

  // 监听搜索文字变化
  watch(
    () => treeSearchState.searchText,
    () => {
      applyTreeFilter();
    }
  );

  // 监听年份变化，重新加载数据
  watch(
    () => searchFormState.year,
    (newYear) => {
      if (selectedIndicatorFromTree.value) {
        fetchIndicatorData(selectedIndicatorFromTree.value.id);
      }
      changeChatTitle();
    }
  );

  // 查询按钮点击事件
  function handleQuery() {
    if (selectedIndicatorFromTree.value) {
      fetchIndicatorData(selectedIndicatorFromTree.value.id);
    } else {
      message.warning('请先选择一个指标');
    }
  }

  // 重置按钮点击事件
  function handleReset() {
    searchFormState.year = new Date().getFullYear().toString();
    if (selectedIndicatorFromTree.value) {
      fetchIndicatorData(selectedIndicatorFromTree.value.id);
    }
  }

  // 导出Excel按钮点击事件
  async function handleExport() {
    if (!selectedIndicatorFromTree.value) {
      message.warning('请先选择一个指标');
      return;
    }

    try {
      // 构建导出参数
      const exportParams = {
        indicatorId: selectedIndicatorFromTree.value.id,
        year: searchFormState.year,
        statType: chartOptions.statType,
        valueType: chartOptions.valueType,
        indicatorName: selectedIndicatorFromTree.value.indicatorName,
        indicatorCode: selectedIndicatorFromTree.value.indicatorCode,
      };

      // 调用导出API
      indicatorListApi.exportExcel(exportParams);
      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请稍后重试');
    }
  }

  // 导出年度Excel按钮点击事件
  async function handleYearlyExport() {
    if (!selectedIndicatorFromTree.value) {
      message.warning('请先选择一个指标');
      return;
    }

    try {
      // // 构建导出参数
      // const exportParams = {
      //   indicatorId: selectedIndicatorFromTree.value.id,
      //   year: searchFormState.year,
      //   statType: chartOptions.statType,
      //   valueType: chartOptions.valueType,
      //   indicatorName: selectedIndicatorFromTree.value.indicatorName,
      //   indicatorCode: selectedIndicatorFromTree.value.indicatorCode
      // };

      // // 调用导出API
      // indicatorListApi.exportExcel(exportParams);
      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请稍后重试');
    }
  }

  // 加载指标树数据
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

  const indicatorListData = ref([]);

  // 加载指标数据
  async function fetchIndicatorData(indicatorId) {
    try {
      // 获取指标列表详细数据
      const res = await indicatorListApi.query({
        indicatorId,
        year: searchFormState.year,
        statType: chartOptions.statType,
        valueType: chartOptions.valueType,
      });

      if (res.data && res.ok) {
        console.log('后端返回数据:', res);
        // 检查返回的数据是否为数组
        if (Array.isArray(res.data)) {
          indicatorListData.value = res.data;
          // 处理多个指标的情况
          processMultipleIndicators(res.data);
        }

        // 更新图表标题
        //changeChatTitle();
      }
    } catch (error) {
      console.error('加载指标数据失败:', error);
      message.error('加载指标数据失败');

      // 清空数据
      indicatorMonthlyData.value = [];
      chartData.data1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      chartData.data2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      // 更新图表
      updateChart();
    }
  }

  // 处理多个指标的数据
  function processMultipleIndicators(indicators) {
    // 清空现有数据
    indicatorMonthlyData.value = [];

    // 重置图表数据
    chartData.data1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 上一年数据
    chartData.data2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 当前年数据

    // 初始化季度数据数组
    const quarterData1 = [0, 0, 0, 0]; // 上一年季度数据
    const quarterData2 = [0, 0, 0, 0]; // 当前年季度数据

    // 初始化年度数据
    let yearData1 = 0; // 上一年年度数据
    let yearData2 = 0; // 当前年年度数据

    // 当前选中的年份
    const currentYear = searchFormState.year.toString();
    // 上一年
    const previousYear = (parseInt(currentYear) - 1).toString();

    // 处理每个指标
    indicators.forEach((indicator) => {
      // 创建一个新的数据对象
      const tableRow = {
        indicatorName: indicator.indicatorName,
        indicatorCode: indicator.indicatorCode,
        // 初始化所有月份和季度数据为null
        '01': null,
        '02': null,
        '03': null,
        '04': null,
        '05': null,
        '06': null,
        '07': null,
        '08': null,
        '09': null,
        10: null,
        11: null,
        12: null,
        13: null,
        14: null,
        15: null,
        16: null,
        17: null,
        18: null,
        19: null,
      };
      // 将当前的图表标题设置为父指标下面的第一个指标的名字
      if (indicator.indicatorCode == indicators[0].indicatorCode) {
        currentClickIndicatorCode.value = indicator.indicatorCode;
        currentClickIndicatorName.value = indicator.indicatorName;
      }

      // 填充数据
      if (indicator.dataInfoList && indicator.dataInfoList.length > 0) {
        indicator.dataInfoList.forEach((item) => {
          // 确保serialNum是两位数格式
          const serialNum = item.serialNum.padStart(2, '0');

          // 填充表格数据
          if (item.year === currentYear) {
            //表格数据的值显示逻辑：如果汇总的值不为空，则显示汇总的值，否则显示value1
            //汇总的值的逻辑为：判断指标上是否配置了计算关系。如果配置了计算关系，则取value3,否则取value1
            tableRow[serialNum] = item.totalValue ? item.totalValue : item.value1;
          }

          // 只处理第一个指标的图表数据
          if (indicator.indicatorCode == indicators[0].indicatorCode) {
            // 根据统计类别和数值类型更新图表数据
            const valueField = chartOptions.valueType; // 'value1', 'value2', 'value3'
            const value = parseFloat(item[valueField]) || 0;

            // 处理月度数据
            if (parseInt(serialNum) <= 12) {
              const monthIndex = parseInt(serialNum) - 1;

              if (item.year === previousYear) {
                // 上一年数据
                chartData.data1[monthIndex] = value;
              } else if (item.year === currentYear) {
                // 当前年数据
                chartData.data2[monthIndex] = value;
              }
            }

            // 处理季度数据 - 直接使用季度值
            else if (serialNum === '13' || serialNum === '14' || serialNum === '15' || serialNum === '16') {
              const quarterIndex = parseInt(serialNum) - 13;

              if (item.year === previousYear) {
                // 上一年数据
                quarterData1[quarterIndex] = value;
              } else if (item.year === currentYear) {
                // 当前年数据
                quarterData2[quarterIndex] = value;
              }
            }

            // 处理年度数据
            else if (serialNum === '19') {
              if (item.year === previousYear) {
                // 上一年数据
                yearData1 = value;
              } else if (item.year === currentYear) {
                // 当前年数据
                yearData2 = value;
              }
            }
          }
        });
      }

      // 添加到表格数据
      indicatorMonthlyData.value.push(tableRow);
    });

    // 更新图表
    updateChart(quarterData1, quarterData2, yearData1, yearData2);
  }

  //当前点击的指标Code
  const currentClickIndicatorCode = ref();
  const currentClickIndicatorName = ref();
  function processSingleIndicators(record) {
    console.log(record);

    if (record) {
      currentClickIndicatorCode.value = record.indicatorCode;
      currentClickIndicatorName.value = record.indicatorName;
    }
    console.log(currentClickIndicatorCode.value);

    // 重置图表数据
    chartData.data1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 上一年数据
    chartData.data2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 当前年数据

    // 初始化季度数据数组
    const quarterData1 = [0, 0, 0, 0]; // 上一年季度数据
    const quarterData2 = [0, 0, 0, 0]; // 当前年季度数据

    // 初始化年度数据
    let yearData1 = 0; // 上一年年度数据
    let yearData2 = 0; // 当前年年度数据

    // 当前选中的年份
    const currentYear = searchFormState.year.toString();
    // 上一年
    const previousYear = (parseInt(currentYear) - 1).toString();

    //匹配到指标图表数据
    const indicator = indicatorListData.value.find((item) => item.indicatorCode === currentClickIndicatorCode.value);
    console.log(indicator);

    // 填充数据
    if (indicator.dataInfoList && indicator.dataInfoList.length > 0) {
      indicator.dataInfoList.forEach((item) => {
        // 确保serialNum是两位数格式
        const serialNum = item.serialNum.padStart(2, '0');

        // 根据统计类别和数值类型更新图表数据
        const valueField = chartOptions.valueType; // 'value1', 'value2', 'value3'
        const value = parseFloat(item[valueField]) || 0;

        // 处理月度数据
        if (parseInt(serialNum) <= 12) {
          const monthIndex = parseInt(serialNum) - 1;

          if (item.year === previousYear) {
            // 上一年数据
            chartData.data1[monthIndex] = value;
          } else if (item.year === currentYear) {
            // 当前年数据
            chartData.data2[monthIndex] = value;
          }
        }

        // 处理季度数据 - 直接使用季度值
        else if (serialNum === '13' || serialNum === '14' || serialNum === '15' || serialNum === '16') {
          const quarterIndex = parseInt(serialNum) - 13;

          if (item.year === previousYear) {
            // 上一年数据
            quarterData1[quarterIndex] = value;
          } else if (item.year === currentYear) {
            // 当前年数据
            quarterData2[quarterIndex] = value;
          }
        }

        // 处理年度数据
        else if (serialNum === '19') {
          if (item.year === previousYear) {
            // 上一年数据
            yearData1 = value;
          } else if (item.year === currentYear) {
            // 当前年数据
            yearData2 = value;
          }
        }
      });
    }
    changeChatTitle();
    // 更新图表
    updateChart(quarterData1, quarterData2, yearData1, yearData2);
  }
  // 初始化图表
  function initChart() {
    const chartDom = document.getElementById('indicator-chart');
    if (!chartDom) return;
    if (!chartInstance) {
      chartInstance = echarts.init(chartDom);
    }

    updateChart();

    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', () => {
      chartInstance && chartInstance.resize();
    });
  }

  // 更新图表
  function updateChart(quarterData1 = [0, 0, 0, 0], quarterData2 = [0, 0, 0, 0], yearData1 = 0, yearData2 = 0) {
    if (!chartInstance) return;
    changeChatTitle();
    // 当前选中的年份
    const currentYear = searchFormState.year.toString();
    // 上一年
    const previousYear = (parseInt(currentYear) - 1).toString();

    // 根据统计类别设置X轴数据
    let xAxisData = [];
    let seriesData1 = [];
    let seriesData2 = [];

    if (chartOptions.statType === 'month') {
      xAxisData = chartData.months;
      seriesData1 = chartData.data1;
      seriesData2 = chartData.data2;
    } else if (chartOptions.statType === 'quarter') {
      xAxisData = ['第一季度', '第二季度', '第三季度', '第四季度'];
      // 使用季度数据
      seriesData1 = quarterData1;
      seriesData2 = quarterData2;
    } else if (chartOptions.statType === 'year') {
      xAxisData = ['全年'];
      // 使用年度数据
      seriesData1 = [yearData1];
      seriesData2 = [yearData2];
    }

    // // 检查是否有数据
    // const hasData = (seriesData1.some(val => val > 0) || seriesData2.some(val => val > 0));

    // if (!hasData) {
    //   // 如果没有数据，显示无数据提示
    //   chartInstance.setOption({
    //     title: {
    //       text: '暂无数据',
    //       left: 'center',
    //       top: 'center',
    //       textStyle: {
    //         color: '#999',
    //         fontSize: 16,
    //         fontWeight: 'normal'
    //       }
    //     },
    //     series: []
    //   });
    //   return;
    // }

    const option = {
      title: {
        text: chatTitle.value,
        subtext: chatSubTitle.value,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: [previousYear, currentYear],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          interval: 0,
          rotate: 0,
        },
      },
      yAxis: {
        type: 'value',
        name: chartOptions.valueType === 'value1' ? '数值1' : chartOptions.valueType === 'value2' ? '数值2' : '数值3',
      },
      series: [
        {
          name: previousYear,
          type: chartOptions.chartType,
          data: seriesData1,
          itemStyle: {
            color: '#36a2eb',
          },
          lineStyle: {
            color: '#36a2eb',
          },
        },
        {
          name: currentYear,
          type: chartOptions.chartType,
          data: seriesData2,
          itemStyle: {
            color: '#ff9f40',
          },
          lineStyle: {
            color: '#ff9f40',
          },
        },
      ],
    };
    chartInstance.setOption(option);
  }

  // 监听图表选项变化
  watch(
    () => [chartOptions.statType, chartOptions.valueType],
    () => {
      // 变更图表title
      changeChatTitle();
    }
  );

  onMounted(() => {
    // 加载左侧树
    fetchIndicatorTreeData();
    // // 动态变更图标title
    // changeChatTitle();
    // 延迟初始化图表，确保DOM已经渲染
    nextTick(() => {
      initChart();
    });
    // setTimeout(() => {
    //   initChart();
    // }, 100);
  });

  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
    }
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
      overflow: visible;
    }
  }

  .tree-container {
    height: 100%;
    overflow: auto;
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

  :deep(.ant-tree-node-selected) {
    background-color: #e6f7ff;
  }

  .filter-bar {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .filter-label {
      margin-right: 8px;
    }

    .query-btn,
    .reset-btn {
      margin-left: 16px;
    }
  }

  .monthly-data-table {
    margin-bottom: 16px;
  }

  .chart-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 4px;

    .chart-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid #f0f0f0;
      background-color: #fafafa;

      .chart-title {
        font-weight: 500;
      }

      .chart-options {
        display: flex;
        align-items: center;
      }
    }

    .chart-content {
      flex: 1;
      padding: 16px;
      overflow: auto;

      h3 {
        text-align: center;
        margin-bottom: 16px;
      }
    }
  }

  .chart-content {
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    padding: 16px;
    background-color: #fff;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .chart-options {
      margin-bottom: 8px;
    }
  }

  .filter-label {
    margin-right: 8px;
  }

  @media (max-width: 768px) {
    .chart-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .chart-type-selector {
    display: flex;
    align-items: center;

    .filter-label {
      margin-right: 8px;
    }
  }

  .chart-legend {
    display: flex;
    justify-content: center;
    margin-top: 16px;

    .legend-item {
      display: flex;
      align-items: center;
      margin: 0 12px;

      .legend-color {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 6px;
        border-radius: 2px;
      }
    }
  }
</style>
