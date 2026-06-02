<template>
  <a-config-provider
    :locale="locale"
    :theme="{
      token: {
        colorPrimary: themeColors[colorIndex].primaryColor,
        colorLink: themeColors[colorIndex].primaryColor,
        colorLinkActive: themeColors[colorIndex].activeColor,
        colorLinkHover: themeColors[colorIndex].hoverColor,
        colorIcon: themeColors[colorIndex].primaryColor,
      },
      components: {
        Button: {
          colorLink: themeColors[colorIndex].primaryColor,
          colorLinkActive: themeColors[colorIndex].activeColor,
          colorLinkHover: themeColors[colorIndex].hoverColor,
        },
        Icon: {
          colorIcon: themeColors[colorIndex].primaryColor,
        },
      },
    }"
  />
  <div class="report-container">
    <!-- 顶部搜索区域 -->
    <div class="search-section">
      <a-radio-group v-model:value="periodType" button-style="solid">
        <a-radio-button class="search-radio" value="1">年度</a-radio-button>
        <a-radio-button class="search-radio" value="2">季度</a-radio-button>
        <a-radio-button class="search-radio" value="3">月度</a-radio-button>
      </a-radio-group>

      <a-range-picker v-if="periodType === '1'" v-model:value="searchYears" picker="year" />
      <a-range-picker v-else-if="periodType === '2'" v-model:value="searchQuarters" picker="quarter" :locale="locale" format="YYYY年第Q季度">
        <template #cellRender="{ current }">
          {{ getQuarterText(current) }}
        </template>
      </a-range-picker>
      <a-range-picker v-else-if="periodType === '3'" v-model:value="searchMonths" picker="month" />
    </div>

    <!-- 主要内容区域 -->
    <a-row :gutter="8" class="main-content">
      <!-- 左侧指标卡片区域 -->
      <a-col :span="7">
        <div class="left-panel">
          <a-skeleton :loading="loading" active>
            <a-card class="indicator-card" :bordered="false" :hoverable="true">
              <div class="card-header">
                <span class="card-title">{{ indicatorOverviewData.indicatorName }}</span>
              </div>
              <div class="card-content">
                <div class="main-value">{{ indicatorOverviewData.mainValue }}</div>
                <div class="sub-values">
                  <span class="sub-item">同比: {{ indicatorOverviewData.yearOnYear }}</span>
                  <span class="sub-item">|</span>
                  <span class="sub-item">环比: {{ indicatorOverviewData.monthOnMonth }}</span>
                </div>
                <div class="breakdown-values">
                  <div class="breakdown-item">
                    <span class="label">最大值</span>
                    <span class="value">{{ indicatorOverviewData.maxValue }}</span>
                  </div>
                  <div class="breakdown-item">
                    <span class="label">中位数</span>
                    <span class="value">{{ indicatorOverviewData.medianValue }}</span>
                  </div>
                  <div class="breakdown-item">
                    <span class="label">最小值</span>
                    <span class="value">{{ indicatorOverviewData.minValue }}</span>
                  </div>
                </div>
              </div>
              <!-- 计算方式说明 -->
              <a-divider />
              <div class="calculation-info">
                <a-row gutter="12">
                  <a-col :span="12">
                    <div class="calc-title">
                      <span>采集方式</span>
                      <a-tag color="#009688">{{
                        $smartEnumPlugin.getDescByValue('INDICATOR_FETCH_TYPE_ENUM', indicatorOverviewData.collectType)
                      }}</a-tag>
                    </div>
                  </a-col>
                  <a-col :span="12">
                    <div class="calc-title">
                      <span>指标频率</span>
                      <a-tag color="#009688">{{ $smartEnumPlugin.getDescByValue('SEARCH_PERIOD_TYPE_ENUM', indicatorOverviewData.frequency) }}</a-tag>
                    </div>
                  </a-col>
                </a-row>
                <div>
                  <span class="calc-title">计算方式</span>
                  <span class="calc-formula">{{ indicatorOverviewData.formula }}</span>
                </div>
                <!-- <div class="calc-title">【计算方式】</div>
                <div class="calc-formula">{{ indicatorOverviewData.formula }}</div> -->
              </div>
              <a-divider />
              <!-- 指标说明 -->
              <div class="indicator-info">
                <div class="info-title">指标解读</div>
                <div class="info-content">
                  <div class="info-item">
                    <span class="info-label">【指标属性】</span>
                    <span class="info-text">
                      {{ $smartEnumPlugin.getDescByValue('INDICATOR_PROPERTY_ENUM', indicatorOverviewData.property) }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">【计量单位】</span>
                    <span class="info-text">
                      {{ $smartEnumPlugin.getDescByValue('INDICATOR_UNIT_ENUM', indicatorOverviewData.unit) }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">【指标说明】</span>
                    <span class="info-text">
                      {{ indicatorOverviewData.desc }}
                    </span>
                  </div>
                </div>
              </div>
            </a-card>
          </a-skeleton>
        </div>
      </a-col>

      <!-- 右侧图表和表格区域 -->
      <a-col :span="17">
        <a-card class="right-panel">
          <!-- 公式展示区域 -->
          <a-skeleton :loading="loading" active>
            <a-row class="formula-section">
              <a-col :span="5">
                <div class="formula-result-card" style="cursor: default">
                  <div class="card-header">
                    <div class="card-title">{{ formulaComponentsData.result.name }}</div>
                  </div>
                  <div
                    :class="{
                      'diagonal-tag-auto': formulaComponentsData.result.collectType == '1',
                      'diagonal-tag-manual': formulaComponentsData.result.collectType == '2',
                    }"
                  >
                    {{ $smartEnumPlugin.getDescByValue('INDICATOR_FETCH_TYPE_ENUM', formulaComponentsData.result.collectType) }}
                  </div>
                  <div class="main-value">{{ formulaComponentsData.result.value }}</div>
                  <div class="comparison-details">
                    <div class="detail-item">
                      <span class="label">同期:</span>
                      <span class="value">{{ formulaComponentsData.result.prePeriod }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">同比:</span>
                      <span class="value">{{ formulaComponentsData.result.yearOnYear }}</span>
                      <ArrowUpOutlined style="color: red" />
                    </div>
                  </div>
                </div>
              </a-col>
              <a-col :span="2" class="formula-operator" v-if="formulaComponentsData.numerator">
                <div>=(</div>
              </a-col>

              <a-col :span="5" v-if="formulaComponentsData.numerator">
                <div class="formula-result-card" @click="route(formulaComponentsData.numerator)">
                  <div class="card-header">
                    <div class="card-title">{{ formulaComponentsData.numerator.name }}</div>
                  </div>
                  <div
                    :class="{
                      'diagonal-tag-auto': formulaComponentsData.numerator.collectType == '1',
                      'diagonal-tag-manual': formulaComponentsData.numerator.collectType == '2',
                    }"
                  >
                    {{ $smartEnumPlugin.getDescByValue('INDICATOR_FETCH_TYPE_ENUM', formulaComponentsData.numerator.collectType) }}
                  </div>
                  <div class="main-value">{{ formulaComponentsData.numerator.value }}</div>
                  <div class="comparison-details">
                    <div class="detail-item">
                      <span class="label">同期:</span>
                      <span class="value">{{ formulaComponentsData.numerator.prePeriod }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">同比:</span>
                      <span class="value">{{ formulaComponentsData.numerator.yearOnYear }}</span>
                      <ArrowUpOutlined style="color: red" />
                    </div>
                  </div>
                </div>
              </a-col>
              <a-col :span="2" class="formula-operator" v-if="formulaComponentsData.relationType">
                <div>
                  {{ $smartEnumPlugin.getDescByValue('RELATION_TYPE_ENUM', formulaComponentsData.relationType) }}
                </div>
              </a-col>

              <a-col :span="5" v-if="formulaComponentsData.denominator">
                <div class="formula-result-card" @click="route(formulaComponentsData.denominator)">
                  <div class="card-header">
                    <div class="card-title">{{ formulaComponentsData.denominator.name }}</div>
                  </div>
                  <div
                    :class="{
                      'diagonal-tag-auto': formulaComponentsData.denominator.collectType == '1',
                      'diagonal-tag-manual': formulaComponentsData.denominator.collectType == '2',
                    }"
                  >
                    {{ $smartEnumPlugin.getDescByValue('INDICATOR_FETCH_TYPE_ENUM', formulaComponentsData.denominator.collectType) }}
                  </div>
                  <div class="main-value">{{ formulaComponentsData.denominator.value }}</div>
                  <div class="comparison-details">
                    <div class="detail-item">
                      <span class="label">同期:</span>
                      <span class="value">{{ formulaComponentsData.denominator.prePeriod }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">同比:</span>
                      <span class="value">{{ formulaComponentsData.denominator.yearOnYear }}</span>
                      <ArrowUpOutlined style="color: red" />
                    </div>
                  </div>
                </div>
              </a-col>
              <a-col :span="4" class="formula-operator" v-if="formulaComponentsData.joinCondition">
                <div>)</div>
                <div>
                  {{ $smartEnumPlugin.getDescByValue('JOIN_CONDITION_ENUM', formulaComponentsData.joinCondition) }}
                </div>
              </a-col>
            </a-row>
          </a-skeleton>

          <!-- 描述文字区域 -->
          <div class="current-area">
            <a-tag class="current-period">当前周期概述</a-tag>
            <div class="description-text">
              {{ indicatorOverviewData.currentPeriodDesc }}
              <!-- 本期指标平均床位使用率77.36%，同比：72.74%，环比：6.36%，其中2017年最高为上升，占比：24.64%；第5个月最高为上升，占比：75.36%。 -->
            </div>
          </div>

          <!-- 图表区域 -->
          <div class="chart-section">
            <!-- <div class="chart-header">
              <div class="chart-controls">
                <a-button type="primary" size="small" :icon="h(DownloadOutlined)" @click="downloadChart" :disabled="loading"> 下载图表 </a-button>
              </div>
            </div> -->
            <!-- 图表容器始终存在于DOM中，通过loading状态显示骨架屏或图表 -->
            <div class="chart-container-wrapper">
              <a-skeleton-image v-if="loading" class="chart-skeleton" />
              <div v-else ref="chartContainer" class="chart-container"></div>
            </div>
          </div>

          <!-- 数据表格 -->
          <div class="data-table">
            <a-radio-group v-model:value="groupType" button-style="solid" class="search-radio-group">
              <a-radio-button class="search-radio" value="1">时间</a-radio-button>
              <a-radio-button class="search-radio" value="2">科室</a-radio-button>
            </a-radio-group>
            <a-button class="export" type="primary" size="small" :icon="h(DownloadOutlined)" @click="reportExport()"> 数据导出 </a-button>
            <a-table
              :columns="tableColumns"
              :data-source="tableDataSource"
              :pagination="pagination"
              size="small"
              bordered
              :loading="loading"
              :scroll="{ x: 'max-content' }"
              @change="handleTableChange"
            >
              <!-- 自定义单元格渲染 -->
              <template #bodyCell="{ record, column, text }">
                <template v-if="column.dataIndex == 'currentValue' && groupType === '2' && record.needDrillDown">
                  <a-button type="link" @click="handleDrillDown(record)">{{ text }}</a-button>
                </template>
              </template>
            </a-table>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script setup>
  import { ref, reactive, onMounted, nextTick, onUnmounted, watch, computed, getCurrentInstance, h } from 'vue';
  import * as echarts from 'echarts';
  import Dayjs from 'dayjs';
  import { themeColors } from '/@/theme/color.js';
  import { ArrowUpOutlined, DownloadOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  import { reportTemplateApi } from '/@/api/business/rating/indicator/report/report-template-api';
  import { debounce } from 'lodash-es';
  import 'dayjs/locale/zh-cn';
  import zhCN from 'ant-design-vue/es/date-picker/locale/zh_CN';

  Dayjs.locale('zh-cn');

  // 自定义中文 locale，将季度面板的 Q1/Q2/Q3/Q4 改为第一季度/第二季度/第三季度/第四季度
  const customZhCN = {
    ...zhCN,
    lang: {
      ...zhCN.lang,
      shortQuarter: '第Q季度',
      // 覆盖季度的简短格式
      fieldQuarterFormat: '第Q季度',
    },
  };

  const locale = ref(customZhCN);

  const colorIndex = 8;
  // 响应式数据
  const periodType = ref('1'); //默认年度

  // 获取季度的中文文本
  const getQuarterText = (date) => {
    if (!date) return '';
    const quarter = date.quarter();
    const quarterMap = {
      1: '一季度',
      2: '二季度',
      3: '三季度',
      4: '四季度',
    };
    return quarterMap[quarter] || `Q${quarter}`;
  };
  const searchYears = ref();
  const searchQuarters = ref(); //查询的季度
  const searchMonths = ref(); //查询的月度
  const groupType = ref('1'); //分组类型
  const smartEnumPlugin = ref();

  // 数据状态管理
  const loading = ref(true);
  const error = ref('');

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100'],
  });

  // 定义接受的 props
  const props = defineProps({
    indicatorCode: {
      type: String,
      required: true, // 强制要求传递 code 参数
      default: '',
    },
  });
  console.log('从页面上接收到的indicatorCode:' + props.indicatorCode);

  //点击分子或者分母指标跳转
  const route = (record) => {
    console.log('跳转指标:' + JSON.stringify(record));
    const targetUrl = `${window.location.origin}/report.html?indicatorCode=${record.indicatorCode}`;
    window.open(targetUrl, '_blank');
  };

  /**
   * 处理下钻操作
   */
  const handleDrillDown = (record) => {
    console.log('下钻数据:', record);
    let reportUrl = record.reportUrl;
    const dataRtParam = record.dataRtParam;
    console.log('datart params:', JSON.stringify(dataRtParam));
    const params = {
      BDATE: dataRtParam.bdate, //开始时间
      EDATE: dataRtParam.edate, //结束时间
      SERIAL_NUM: dataRtParam.serialNum, //月季年期间值
      USER: dataRtParam.user, //当前用户
      GROUP_NAME: dataRtParam.groupName, //分组名称
      INDICATOR_CODE: dataRtParam.indicatorCode, //指标编码
      YEAR: dataRtParam.year, //年份
      SUBSQL: dataRtParam.subSql, //报表sql条件
    };
    reportUrl = reportUrl + '&params=' + encodeURIComponent(JSON.stringify(params));
    console.log(reportUrl);
    window.open(reportUrl);
  };

  // 指标概览数据
  const indicatorOverviewData = reactive({
    mainValue: '',
    yearOnYear: '',
    monthOnMonth: '',
    maxValue: '',
    medianValue: '',
    minValue: '',
    indicatorName: '',
    collectType: '',
    frequency: '',
    formula: '',
    property: '',
    unit: '',
    desc: '',
    currentPeriodDesc: '',
  });

  // 计算属性：获取格式化的单位显示文本
  const unitDisplayText = computed(() => {
    if (!indicatorOverviewData.unit) return '';
    const unit = smartEnumPlugin.value.getDescByValue('INDICATOR_UNIT_VIEW_ENUM', indicatorOverviewData.unit) || '';
    return `(${unit})`;
  });

  // 公式组件数据
  const formulaComponentsData = reactive({
    result: {
      name: '',
      value: '',
      prePeriod: '',
      yearOnYear: '',
      collectType: 1, //自动
      indicatorCode: '',
    },
    numerator: {
      name: '',
      value: '',
      prePeriod: '',
      yearOnYear: '',
      collectType: 2, //手动
      indicatorCode: '',
    },
    denominator: {
      name: '',
      value: '',
      prePeriod: '',
      yearOnYear: '',
      collectType: 2, //手动
      indicatorCode: '',
    },
    relationType: '', //加，减，乘，除关系
    joinCondition: '', // 计算条件 *100% *1000% 等
  });

  // 图表数据
  const chartSeriesData = reactive({
    xAxisData: [],
    currentPeriodData: [],
    samePeriodData: [],
    trendData: [], // 同比增幅数据（本期值减去同期值）
  });

  // 表格数据源
  const tableDataSource = reactive([
    {
      time: '',
      currentValue: '',
      sameValue: '',
      diffValue: '',
      yearOnYear: '',
    },
  ]);

  // 默认查询年度 最近四年
  const initSearchYears = () => {
    searchYears.value = [
      Dayjs().subtract(3, 'year').startOf('year'), // 往前推三年
      Dayjs().endOf('year'), // 今年
    ];
    periodType.value = '1';
  };

  // 初始化季度查询时间范围
  const initSearchQuarters = () => {
    searchQuarters.value = [
      Dayjs().subtract(3, 'year').startOf('year'), // 往前推3年的第一季度
      Dayjs().endOf('year'), // 当前年份的第四季度
    ];
  };

  // 初始化月度查询时间范围
  const initSearchMonths = () => {
    searchMonths.value = [
      Dayjs().subtract(3, 'year').startOf('year'), // 往前推3年的1月
      Dayjs().endOf('year'), // 当前年份的12月
    ];
  };

  // 计算属性 - 格式化时间参数
  const timeParams = computed(() => {
    let startTime = '';
    let endTime = '';

    switch (periodType.value) {
      case '1': // 年度
        if (searchYears.value && searchYears.value.length === 2) {
          startTime = searchYears.value[0].format('YYYY');
          endTime = searchYears.value[1].format('YYYY');
        }
        break;
      case '2': // 季度
        if (searchQuarters.value && searchQuarters.value.length === 2) {
          startTime = searchQuarters.value[0].format('YYYY-[Q]Q');
          endTime = searchQuarters.value[1].format('YYYY-[Q]Q');
        }
        break;
      case '3': // 月度
        if (searchMonths.value && searchMonths.value.length === 2) {
          startTime = searchMonths.value[0].format('YYYY-MM');
          endTime = searchMonths.value[1].format('YYYY-MM');
        }
        break;
    }

    return {
      periodType: periodType.value,
      startTime,
      endTime,
      indicatorCode: props.indicatorCode, // 指标编码
    };
  });

  // 图表实例
  let chartInstance = null;
  const chartContainer = ref(null);

  // 数据获取函数
  const fetchAllData = debounce(async () => {
    if (!timeParams.value.startTime || !timeParams.value.endTime) {
      return;
    }

    loading.value = true;
    error.value = '';

    try {
      await Promise.all([fetchIndicatorOverview(), fetchFormulaData(), fetchChartData(), fetchTableData()]);
    } catch (err) {
      console.error('获取数据失败:', err);
      error.value = '数据加载失败，请稍后重试';
      message.error('数据加载失败');
    } finally {
      loading.value = false;
    }
  }, 300);

  // 获取指标概览数据
  const fetchIndicatorOverview = async () => {
    try {
      const res = await reportTemplateApi.getIndicatorOverview(timeParams.value);
      if (res.ok && res.data) {
        const oldUnit = indicatorOverviewData.unit;
        Object.assign(indicatorOverviewData, res.data);

        // 如果单位发生变化，需要更新图表
        if (oldUnit !== indicatorOverviewData.unit && chartInstance) {
          nextTick(() => {
            updateChart();
          });
        }
      }
    } catch (err) {
      console.error('获取指标概览数据失败:', err);
    }
  };

  // 获取公式组件数据
  const fetchFormulaData = async () => {
    try {
      const res = await reportTemplateApi.getFormulaData(timeParams.value);
      if (res.ok && res.data) {
        Object.assign(formulaComponentsData, res.data);
      }
    } catch (err) {
      console.error('获取公式数据失败:', err);
    }
  };

  // 获取图表数据
  const fetchChartData = async () => {
    try {
      const res = await reportTemplateApi.getChartData(timeParams.value);
      if (res.ok && res.data) {
        Object.assign(chartSeriesData, res.data);

        // 计算同比增幅数据（本期值减去同期值）
        if (chartSeriesData.currentPeriodData && chartSeriesData.samePeriodData) {
          chartSeriesData.trendData = chartSeriesData.currentPeriodData.map((currentValue, index) => {
            const sameValue = chartSeriesData.samePeriodData[index];
            if (
              currentValue !== null &&
              currentValue !== undefined &&
              currentValue !== '-' &&
              sameValue !== null &&
              sameValue !== undefined &&
              sameValue !== '-'
            ) {
              return parseFloat((parseFloat(currentValue) - parseFloat(sameValue)).toFixed(2));
            }
            return null;
          });
        }

        // 只有在图表实例存在时才更新图表
        if (chartInstance) {
          updateChart();
        }
      }
    } catch (err) {
      console.error('获取图表数据失败:', err);
    }
  };

  // 数据转换函数：将后端数据转换为表格需要的格式
  const transformTableData = (rawData) => {
    console.log('原始数据:', rawData);
    console.log('当前查询维度:', periodType.value);
    console.log('当前分组类型:', groupType.value);

    if (periodType.value === '1') {
      // 年度查询：直接返回原始数据
      return rawData;
    }

    // 季度或月度查询：需要转置数据
    const dataMap = new Map();

    // 按年度和科室分组数据
    rawData.forEach((item) => {
      console.log('处理数据项:', item);

      const year = item.time ? item.time.split('-')[0] : ''; // 提取年份
      const key = groupType.value === '2' ? `${year}_${item.dept || ''}` : year;

      if (!dataMap.has(key)) {
        const baseData = {
          year: year,
          key: key, // 添加唯一标识
        };
        if (groupType.value === '2') {
          baseData.dept = item.dept || '';
        }
        // 初始化所有时间段的数据为空
        if (periodType.value === '2') {
          // 初始化第一季度-第四季度
          for (let i = 1; i <= 4; i++) {
            baseData[`quarter_${i}_current`] = '-';
            baseData[`quarter_${i}_same`] = '-';
            baseData[`quarter_${i}_ratio`] = '-';
          }
        } else if (periodType.value === '3') {
          // 初始化1-12月
          for (let i = 1; i <= 12; i++) {
            baseData[`month_${i}_current`] = '-';
            baseData[`month_${i}_same`] = '-';
            baseData[`month_${i}_ratio`] = '-';
          }
        }
        dataMap.set(key, baseData);
      }

      const record = dataMap.get(key);

      if (periodType.value === '2') {
        // 季度数据转换
        const quarter = extractQuarter(item.time);
        console.log('提取的季度:', quarter, '从时间:', item.time);
        if (quarter && quarter >= 1 && quarter <= 4) {
          record[`quarter_${quarter}_current`] = item.currentValue || '-';
          record[`quarter_${quarter}_same`] = item.sameValue || '-';
          record[`quarter_${quarter}_ratio`] = item.yearOnYear || '-';
        }
      } else if (periodType.value === '3') {
        // 月度数据转换
        const month = extractMonth(item.time);
        console.log('提取的月份:', month, '从时间:', item.time);
        if (month && month >= 1 && month <= 12) {
          record[`month_${month}_current`] = item.currentValue || '-';
          record[`month_${month}_same`] = item.sameValue || '-';
          record[`month_${month}_ratio`] = item.yearOnYear || '-';
        }
      }
    });

    const result = Array.from(dataMap.values());
    console.log('转换后的数据:', result);
    return result;
  };

  // 提取季度信息
  const extractQuarter = (timeStr) => {
    if (!timeStr) return null;
    console.log('解析季度时间字符串:', timeStr);

    // 匹配中文季度格式：2024-第一季度, 2024-第二季度等
    const chineseQuarterMap = {
      第一季度: 1,
      第二季度: 2,
      第三季度: 3,
      第四季度: 4,
      一季度: 1,
      二季度: 2,
      三季度: 3,
      四季度: 4,
    };

    for (const [chineseQuarter, quarterNum] of Object.entries(chineseQuarterMap)) {
      if (timeStr.includes(chineseQuarter)) {
        console.log('匹配到中文季度格式:', chineseQuarter, '季度:', quarterNum);
        return quarterNum;
      }
    }

    // 匹配英文季度格式：Q1, Q2, Q3, Q4
    let match = timeStr.match(/Q(\d)/i);
    if (match) {
      console.log('匹配到季度格式 Q:', match[1]);
      return parseInt(match[1]);
    }

    // 匹配数字季度格式：第1季度, 第2季度等
    match = timeStr.match(/第(\d)季度/);
    if (match) {
      console.log('匹配到季度格式 第X季度:', match[1]);
      return parseInt(match[1]);
    }

    // 从月份推算季度：2024-03
    match = timeStr.match(/(\d{4})-(\d{1,2})/);
    if (match) {
      const month = parseInt(match[2]);
      const quarter = Math.ceil(month / 3);
      console.log('从月份推算季度:', month, '季度:', quarter);
      return quarter;
    }

    console.log('无法解析季度:', timeStr);
    return null;
  };

  // 提取月份信息
  const extractMonth = (timeStr) => {
    if (!timeStr) return null;
    console.log('解析月份时间字符串:', timeStr);

    // 匹配中文月份格式
    const chineseMonthMap = {
      一月: 1,
      二月: 2,
      三月: 3,
      四月: 4,
      五月: 5,
      六月: 6,
      七月: 7,
      八月: 8,
      九月: 9,
      十月: 10,
      十一月: 11,
      十二月: 12,
      '1月': 1,
      '2月': 2,
      '3月': 3,
      '4月': 4,
      '5月': 5,
      '6月': 6,
      '7月': 7,
      '8月': 8,
      '9月': 9,
      '10月': 10,
      '11月': 11,
      '12月': 12,
    };

    for (const [chineseMonth, monthNum] of Object.entries(chineseMonthMap)) {
      if (timeStr.includes(chineseMonth)) {
        console.log('匹配到中文月份格式:', chineseMonth, '月份:', monthNum);
        return monthNum;
      }
    }

    // 匹配数字格式：2024-01, 2024-12等
    const match = timeStr.match(/(\d{4})-(\d{1,2})/);
    if (match) {
      const month = parseInt(match[2]);
      console.log('匹配到数字月份:', month);
      return month;
    }

    console.log('无法解析月份:', timeStr);
    return null;
  };

  // 获取表格数据
  const fetchTableData = async () => {
    try {
      const params = {
        ...timeParams.value,
        dataType: groupType.value, // 表格查询维度
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      };
      const res = await reportTemplateApi.getTableData(params);
      if (res.ok && res.data) {
        const rawData = res.data.records || res.data.list || res.data;
        const transformedData = transformTableData(rawData);

        tableDataSource.length = 0;
        tableDataSource.push(...transformedData);

        // 更新分页信息
        pagination.total = res.data.total || rawData.length || 0;
      }
    } catch (err) {
      console.error('获取表格数据失败:', err);
    }
  };

  // 导出表格数据
  const reportExport = async () => {
    try {
      const params = {
        ...timeParams.value,
        dataType: groupType.value, // 表格查询维度
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        fileName: dynamicExportReportName(),
      };
      await reportTemplateApi.exportReport(params);
    } catch (err) {
      console.error('数据导出失败:', err);
    }
  };

  // 处理表格分页、排序、筛选变化
  const handleTableChange = (pag, filters, sorter) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    fetchTableData();
  };

  // 监听periodType变化，自动设置对应的时间范围
  watch(periodType, (newPeriodType, oldPeriodType) => {
    // 只有在用户主动切换标签时才自动设置时间范围
    if (oldPeriodType) {
      switch (newPeriodType) {
        case '1': // 切换到年度
          initSearchYears();
          break;
        case '2': // 切换到季度
          initSearchQuarters();
          break;
        case '3': // 切换到月度
          initSearchMonths();
          break;
      }
    }
  });

  // 监听器
  watch(
    [periodType, searchYears, searchQuarters, searchMonths],
    () => {
      // 时间参数变化时重置分页
      pagination.current = 1;
      fetchAllData();
    },
    { deep: true }
  );

  // 监听单位变化，动态更新图表
  watch(
    () => indicatorOverviewData.unit,
    (newUnit, oldUnit) => {
      if (newUnit !== oldUnit && chartInstance) {
        nextTick(() => {
          updateChart();
        });
      }
    },
    { deep: true }
  );

  // 生成动态时间列
  const generateDynamicTimeColumns = () => {
    const columns = [];

    if (periodType.value === '3') {
      // 月度：生成1-12月的列
      for (let i = 1; i <= 12; i++) {
        columns.push({
          title: `${i}月`,
          children: [
            {
              title: `本期值${unitDisplayText.value}`,
              dataIndex: `month_${i}_current`,
              key: `month_${i}_current`,
              align: 'center',
              width: 100,
            },
            {
              title: `同期值${unitDisplayText.value}`,
              dataIndex: `month_${i}_same`,
              key: `month_${i}_same`,
              align: 'center',
              width: 100,
            },
            {
              title: '同比',
              dataIndex: `month_${i}_ratio`,
              key: `month_${i}_ratio`,
              align: 'center',
              width: 80,
            },
          ],
        });
      }
    } else if (periodType.value === '2') {
      // 季度：生成第一季度-第四季度的列
      const quarterNames = ['第一季度', '第二季度', '第三季度', '第四季度'];
      for (let i = 1; i <= 4; i++) {
        columns.push({
          title: quarterNames[i - 1],
          children: [
            {
              title: `本期值${unitDisplayText.value}`,
              dataIndex: `quarter_${i}_current`,
              key: `quarter_${i}_current`,
              align: 'center',
              width: 100,
            },
            {
              title: `同期值${unitDisplayText.value}`,
              dataIndex: `quarter_${i}_same`,
              key: `quarter_${i}_same`,
              align: 'center',
              width: 100,
            },
            {
              title: '同比',
              dataIndex: `quarter_${i}_ratio`,
              key: `quarter_${i}_ratio`,
              align: 'center',
              width: 80,
            },
          ],
        });
      }
    }

    return columns;
  };

  // 表格列计算属性 - 根据查询维度和分组类型动态切换
  const tableColumns = computed(() => {
    if (periodType.value === '1') {
      // 年度查询：使用传统的行列格式
      if (groupType.value === '1') {
        // 时间维度
        return [
          {
            title: '年度',
            dataIndex: 'time',
            key: 'time',
            align: 'center',
            customRender: ({ text }) => {
              // 年度查询时只显示年份，去掉"-全年"后缀
              if (text && text.includes('-全年')) {
                return text.replace('-全年', '');
              }
              // 如果是纯年份格式（如"2024"），直接返回
              if (text && /^\d{4}$/.test(text)) {
                return text;
              }
              // 其他格式尝试提取年份
              const yearMatch = text && text.match(/(\d{4})/);
              return yearMatch ? yearMatch[1] : text;
            },
          },
          {
            title: `本期值${unitDisplayText.value}`,
            dataIndex: 'currentValue',
            key: 'currentValue',
            align: 'center',
          },
          {
            title: `同期值${unitDisplayText.value}`,
            dataIndex: 'sameValue',
            key: 'sameValue',
            align: 'center',
          },
          {
            title: `差值${unitDisplayText.value}`,
            dataIndex: 'diffValue',
            key: 'diffValue',
            align: 'center',
          },
          {
            title: '同比',
            dataIndex: 'yearOnYear',
            key: 'yearOnYear',
            align: 'center',
          },
        ];
      } else {
        // 科室维度
        return [
          {
            title: '年度',
            dataIndex: 'time',
            key: 'time',
            align: 'center',
            customRender: ({ text }) => {
              // 年度查询时只显示年份，去掉"-全年"后缀
              if (text && text.includes('-全年')) {
                return text.replace('-全年', '');
              }
              // 如果是纯年份格式（如"2024"），直接返回
              if (text && /^\d{4}$/.test(text)) {
                return text;
              }
              // 其他格式尝试提取年份
              const yearMatch = text && text.match(/(\d{4})/);
              return yearMatch ? yearMatch[1] : text;
            },
          },
          {
            title: '科室',
            dataIndex: 'dept',
            key: 'dept',
            align: 'center',
          },
          {
            title: `本期值${unitDisplayText.value}`,
            dataIndex: 'currentValue',
            key: 'currentValue',
            align: 'center',
          },
          {
            title: `同期值${unitDisplayText.value}`,
            dataIndex: 'sameValue',
            key: 'sameValue',
            align: 'center',
          },
          {
            title: `差值${unitDisplayText.value}`,
            dataIndex: 'diffValue',
            key: 'diffValue',
            align: 'center',
          },
          {
            title: '同比',
            dataIndex: 'yearOnYear',
            key: 'yearOnYear',
            align: 'center',
          },
        ];
      }
    } else {
      // 季度或月度查询：使用转置格式
      const baseColumns = [
        {
          title: '年度',
          dataIndex: 'year',
          key: 'year',
          align: 'center',
          fixed: 'left',
          width: 80,
        },
      ];

      if (groupType.value === '2') {
        // 科室维度：添加科室列
        baseColumns.push({
          title: '科室',
          dataIndex: 'dept',
          key: 'dept',
          align: 'center',
          fixed: 'left',
          width: 120,
        });
      }

      // 添加动态时间列
      return [...baseColumns, ...generateDynamicTimeColumns()];
    }
  });

  watch(
    groupType,
    (newVal) => {
      // 切换分组类型时重置分页并重新获取数据
      pagination.current = 1;
      fetchTableData();
    },
    { deep: true }
  );

  // 表格数据（使用之前定义的 tableDataSource）

  // 初始化图表
  function initChart() {
    // 确保在非loading状态下且图表容器存在时才初始化
    if (loading.value) return;

    const chartDom = chartContainer.value;
    if (!chartDom) {
      console.warn('图表容器不存在，无法初始化图表');
      return;
    }

    // 销毁旧实例
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
    }

    // 创建新的图表实例
    chartInstance = echarts.init(chartDom);

    // 更新图表配置
    updateChart();

    // 监听窗口大小变化（避免重复绑定）
    const resizeHandler = () => {
      chartInstance && chartInstance.resize();
    };

    // 移除之前的监听器（如果存在）
    window.removeEventListener('resize', resizeHandler);
    window.addEventListener('resize', resizeHandler);
  }

  // 更新图表
  function updateChart() {
    if (!chartInstance) return;

    const option = {
      toolbox: {
        show: true,
        // 工具栏位置
        left: 'right',
        top: 'top',
        // 功能配置
        feature: {
          // 保存为图片功能
          saveAsImage: {
            show: true,
            // 按钮提示文字
            title: '下载图表',
            // 图片格式（支持png, jpeg, webp）
            type: 'png',
            // 图片质量（0-1）
            quality: 1,
            // 下载的图片名称
            name: dynamicSaveImageName(),
          },
          // 可选：添加其他工具按钮
          zoom: { show: true }, // 缩放
          dataView: { show: true }, // 数据视图
          // restore: { show: true }, // 重置
        },
      },
      title: {
        text: '趋势分析',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
      },
      legend: {
        data: ['同期值', '本期值', '同比增幅'],
        top: 5,
        right: 80,
        itemGap: 20,
        textStyle: {
          fontSize: 12,
          color: '#666',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartSeriesData.xAxisData,
        axisLabel: {
          color: '#666',
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0',
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#666',
          fontSize: 12,
          // 动态格式化y轴标签，根据后台返回的单位显示
          formatter: function (value) {
            // 使用
            const unit = smartEnumPlugin.value.getDescByValue('INDICATOR_UNIT_VIEW_ENUM', indicatorOverviewData.unit) || '';
            // 处理不同的单位格式
            if (unit) {
              return `${value}(${unit})`;
            }
            return value.toString();
          },
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed',
          },
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0',
          },
        },
      },
      series: [
        {
          name: '同期值',
          type: 'bar',
          data: chartSeriesData.samePeriodData,
          barWidth: '20%',
          itemStyle: {
            // color: '#ff9800',
            color: '#3286a0',
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: false,
          },
        },
        {
          name: '本期值',
          type: 'bar',
          data: chartSeriesData.currentPeriodData,
          barWidth: '20%',
          itemStyle: {
            color: '#009688',
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: false,
          },
        },
        {
          name: '同比增幅',
          type: 'line',
          data: chartSeriesData.trendData,
          lineStyle: {
            color: '#ff9800',
            width: 3,
          },
          itemStyle: {
            color: '#ff9800',
            borderWidth: 2,
            borderColor: '#fff',
          },
          symbol: 'circle',
          symbolSize: 8,
          smooth: true,
          label: {
            show: false,
          },
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          xAxisIndex: [0],
        },
      ],
    };

    chartInstance.setOption(option);
  }

  const dynamicSaveImageName = () => {
    // 生成文件名（包含指标名称和时间范围）
    const indicatorName = indicatorOverviewData.indicatorName || '趋势分析';
    const timeRange = getTimeRangeText();
    const fileName = `${indicatorName}_${timeRange}_趋势图`;
    return fileName;
  };

  const dynamicExportReportName = () => {
    // 生成文件名（包含指标名称和时间范围）
    const indicatorName = indicatorOverviewData.indicatorName || '导出';
    const groupName = groupType.value == '1' ? '时间维度' : '科室维度';
    const timeRange = getTimeRangeText();
    const fileName = `${indicatorName}_${timeRange}_${groupName}.xlsx`;
    return fileName;
  };

  // 下载图表功能
  const downloadChart = () => {
    if (!chartInstance) {
      message.warning('图表未加载完成，请稍后再试');
      return;
    }

    try {
      // 获取图表的base64图片数据
      const base64 = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2, // 提高图片清晰度
        backgroundColor: '#fff', // 设置背景色为白色
      });

      // 创建下载链接
      const link = document.createElement('a');
      link.href = base64;

      // 生成文件名（包含指标名称和时间范围）
      const indicatorName = indicatorOverviewData.indicatorName || '趋势分析';
      const timeRange = getTimeRangeText();
      const fileName = `${indicatorName}_${timeRange}_趋势图.png`;

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success('图表下载成功');
    } catch (error) {
      console.error('下载图表失败:', error);
      message.error('下载图表失败，请稍后重试');
    }
  };

  // 获取时间范围文本用于文件名
  const getTimeRangeText = () => {
    const params = timeParams.value;
    if (params.startTime && params.endTime) {
      return `${params.startTime}-${params.endTime}`;
    }
    return Dayjs().format('YYYY-MM-DD');
  };

  // 监听 loading 变化，在数据加载完成后初始化图表
  watch(loading, (newVal) => {
    if (!newVal) {
      // 使用 nextTick 确保 DOM 完全更新后再初始化图表
      nextTick(() => {
        initChart();
      });
    }
  });

  onMounted(() => {
    // 全局挂载smartEnumPlugin插件，用于获取单位描述文本
    const internalInstance = getCurrentInstance(); // 有效  全局
    smartEnumPlugin.value = internalInstance.appContext.config.globalProperties.$smartEnumPlugin;
    nextTick(() => {
      initSearchYears(); //初始化年度查询月份
      fetchAllData(); //初始化时加载数据
    });
  });

  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
    }
  });
</script>

<style lang="less" scoped>
  .report-container {
    padding: 0%;
    overflow: hidden !important;
  }

  .search-section {
    width: 100%;
    min-height: 48px;
    margin-bottom: 8px;
    background-color: #fff;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;

    .search-radio {
      padding: 0px 16px;
    }
  }

  .main-content {
    /* 预留用于未来样式扩展 */
  }

  .left-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .indicator-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(64, 169, 255, 0.15);
    margin-left: 5px;
    height: 100% !important;
    .card-header {
      text-align: center;
      padding: 12px;
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #009688;
      }
    }

    .card-content {
      text-align: center;

      .main-value {
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .sub-values {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-bottom: 16px;

        .sub-item {
          font-size: 12px;
          color: #595959;
        }
      }

      .breakdown-values {
        display: flex;
        justify-content: space-between;
        padding: 8px 16px;
        background-color: #fafade;
        border-radius: 8px;

        .breakdown-item {
          text-align: center;

          .label {
            display: block;
            font-size: 12px;
            color: #8c8c8c;
            margin-bottom: 4px;
          }

          .value {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #262626;
          }
        }
      }
    }
  }

  .calculation-info {
    border-radius: 8px;

    .calc-title {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-weight: 500;
      font-size: 12px;
      text-wrap: nowrap;
      .ant-tag {
        min-width: 64px;
        text-align: center;
      }
    }

    .calc-desc {
      font-size: 12px;
      color: #595959;
      margin-bottom: 4px;
    }

    .calc-formula {
      font-size: 12px;
      color: #8c8c8c;
      line-height: 1.4;
      font-weight: 600;
      display: inline-block;
      margin-left: 8px;
    }
  }

  .indicator-info {
    background: #d7ece9;
    padding: 16px;
    border-radius: 8px;
    flex: 1;

    .info-title {
      font-size: 14px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 12px;
      text-align: center;
    }

    .info-content {
      .info-item {
        margin-bottom: 8px;
        font-size: 12px;
        line-height: 1.4;

        .info-label {
          color: #595959;
          font-weight: 500;
        }

        .info-text {
          color: #8c8c8c;
          margin-left: 4px;
        }
      }
    }
  }

  .right-panel {
    display: flex;
    flex-direction: column;
    gap: 5px;
    .formula-operator {
      font-size: 36px;
      font-weight: bold;
      color: #009688;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .formula-section {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      overflow: hidden !important;
      .formula-result-card {
        background: #fff;
        margin-bottom: 16px;
        border: 2px solid #cbcbcb;
        min-width: 180px;
        max-width: 240px;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        .card-header {
          background: #d7ece9;
          color: #009688;
          font-weight: 600;
          padding: 4px;

          .card-title {
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .card-subtitle {
            font-size: 12px;
            color: #595959;
          }
        }

        .main-value {
          font-size: 24px;
          font-weight: 500;
          padding: 5px;
        }

        .comparison-details {
          display: flex;
          gap: 16px;
          padding: 6px;

          .detail-item {
            font-size: 12px;
            white-space: nowrap;

            .label {
              color: #595959;
            }

            .value {
              color: #262626;
              font-weight: 500;
            }
          }
        }

        .diagonal-tag-auto {
          position: absolute;
          top: 10%;
          right: -15%;
          color: #fff;
          background-color: #009688;
          // background-color: #239be0;
          padding: 4px 32px;
          font-size: 12px;
          transform: rotate(45deg);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }
        .diagonal-tag-manual {
          position: absolute;
          top: 10%;
          right: -15%;
          color: #fff;
          // background-color: #0099a7;
          background-color: #3286a0;
          padding: 4px 32px;
          font-size: 12px;
          transform: rotate(45deg);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }
      }
    }
  }

  .current-area {
    border-left: 4px solid #009688;
    padding-left: 16px;
    .current-period {
      background: #d7ece9;
      color: #009688;
      padding: 6px 12px;
      font-size: 14px;
      font-weight: 600;
    }

    .description-text {
      padding: 12px 0px;
      font-size: 16px;
      line-height: 1.6;
      color: #d75959;
      font-weight: 600;
    }
  }

  .chart-section {
    background: white;
    padding: 16px;
    border-radius: 8px;
    flex: 1;

    .chart-header {
      margin-bottom: 16px;

      .chart-controls {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        gap: 8px;

        .control-label {
          font-size: 14px;
          color: #262626;
          font-weight: 600;
        }

        .legend-info {
          display: flex;
          align-items: center;
          gap: 20px;

          .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #666;

            .legend-icon {
              width: 12px;
              height: 12px;
              display: inline-block;
            }

            .bar-icon {
              background-color: #009688;
              border-radius: 2px;
            }

            .line-icon {
              background-color: #ff9800;
              border-radius: 50%;
              position: relative;

              &::before {
                content: '';
                position: absolute;
                top: 50%;
                left: -8px;
                right: -8px;
                height: 2px;
                background-color: #ff9800;
                transform: translateY(-50%);
              }
            }

            .legend-text {
              font-weight: 500;
            }
          }
        }
      }
    }

    .chart-container-wrapper {
      height: 300px;
      width: 100%;
      position: relative;

      .chart-skeleton {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chart-container {
        height: 100%;
        width: 100%;
      }
    }
  }

  .data-table {
    .search-radio-group {
      margin-bottom: 8px;
    }
    .search-radio {
      padding: 0px 16px;
    }
    .export {
      position: relative;
      float: inline-end;
    }
  }

  // .ant-card{
  //       padding:6px 0px 6px 0px;
  //       overflow: auto !important;
  //       height: calc(100vh - 65px) !important;
  //   }
  //   .ant-row .ant-card-body{
  //       overflow: auto;
  //       height: calc(100vh - 150px);
  //   }
</style>
