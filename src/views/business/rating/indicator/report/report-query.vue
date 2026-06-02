<template>
  <a-config-provider
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
  <div class="indicator-query-container">
    <!-- 查询区域 -->
    <div class="search-section">
      <a-row :gutter="12">
        <a-col :span="4" class="search-item">
          <a-form-item label="指标名称">
            <a-input v-model:value="searchForm.indicatorName" allow-clear placeholder="" size="middle" />
          </a-form-item>
        </a-col>
        <a-col :span="4" class="search-item">
          <a-form-item label="指标编码">
            <a-input v-model:value="searchForm.indicatorCode" allow-clear placeholder="" size="middle" />
          </a-form-item>
        </a-col>
        <a-col :span="4" class="search-item">
          <a-form-item label="按章查询" name="chapter" class="search-form_item">
            <a-select
              v-model:value="searchForm.chapter"
              :options="options_one"
              show-search
              option-filter-prop="label"
              @change="handleChange"
              allowClear
              placeholder="请选择"
            />
          </a-form-item>
        </a-col>
        <a-col :span="4" class="search-item">
          <a-form-item label="按节查询" name="section" class="search-form_item">
            <a-select
              v-model:value="searchForm.section"
              :options="options_two"
              show-search
              option-filter-prop="label"
              allowClear
              placeholder="请选择"
            />
          </a-form-item>
        </a-col>
        <a-col :span="4" class="search-item">
          <a-form-item label="责任科室">
            <GenericTreeSelect
              v-model:value="searchForm.dept"
              :apiFunc="departmentApi.queryDepartmentTree"
              :apiParams="true"
              :fieldNames="{ label: 'name', value: 'departmentId', key: 'departmentId', children: 'children' }"
              placeholder="请选择科室"
              treeDefaultExpandAll
            />
          </a-form-item>
        </a-col>
        <a-col :span="4" class="search-item">
          <a-form-item label="填报状态">
            <a-select v-model:value="searchForm.isFillFlag" placeholder="" allow-clear size="middle" style="width: 100%">
              <a-select-option value="1">已完成</a-select-option>
              <a-select-option value="0">待填报</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="12">
        <a-col :span="4" class="search-item">
          <a-form-item label="采集方式">
            <SmartEnumSelect
              width="100%"
              size="middle"
              v-model:value="searchForm.indicatorFetchType"
              enum-name="INDICATOR_FETCH_TYPE_ENUM"
              placeholder=""
            />
          </a-form-item>
        </a-col>
        <a-col :span="4" class="search-item">
          <a-form-item label="开展情况">
            <a-select v-model:value="searchForm.developmentStatus" placeholder="开展状态" allow-clear size="middle" style="width: 100%">
              <a-select-option value="1">已开展</a-select-option>
              <a-select-option value="2">未开展</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="4" class="search-item">
          <a-form-item label="判定指标">
            <a-select v-model:value="searchForm.judgeFlag" placeholder="" allow-clear size="middle" style="width: 100%">
              <a-select-option value="1">是</a-select-option>
              <a-select-option value="0">否</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="4" class="search-item">
          <a-form-item label="统计类型">
            <a-select v-model:value="searchForm.statisticType" placeholder="" allow-clear size="middle" style="width: 100%">
              <a-select-option value="1">近4年</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-button type="primary" @click="handleSearch" :loading="loading">
            <template #icon>
              <SearchOutlined />
            </template>
            查询数据
          </a-button>
          <a-button @click="handleExport" :loading="exportLoading" style="margin-left: 8px">
            <template #icon>
              <DownloadOutlined />
            </template>
            导出数据到Excel
          </a-button>
        </a-col>
      </a-row>
      <!-- <a-row :gutter="16">
        <a-col :span="24" class="search-buttons">
          <a-button type="primary" @click="handleSearch" :loading="loading">
            <template #icon>
              <SearchOutlined />
            </template>
            查询数据
          </a-button>
          <a-button @click="handleExport" :loading="exportLoading" style="margin-left: 8px">
            <template #icon>
              <DownloadOutlined />
            </template>
            导出数据到Excel
          </a-button>
        </a-col>
      </a-row> -->
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <!-- 表格容器 -->
      <div class="table-container">
        <a-table :columns="tableColumns" :data-source="tableDataSource" :pagination="false" :loading="loading" size="big" :scroll="{ x: '1500px' }">
          <!-- 表格内容 -->
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'indicatorCard'">
              <template v-if="(rowSpanMap.get(index) || 0) > 0">
                <div class="indicator-card-cell">
                  <!-- 顶部区域：指标类型 + 指标导向 -->
                  <div class="top-bar">
                    <span class="indicator-type">{{ $smartEnumPlugin.getDescByValue('INDICATOR_PROPERTY_ENUM', record.indicatorProperty) }}</span>
                    <div class="trend-wrap">
                      <span>指标导向：{{ $smartEnumPlugin.getDescByValue('INDICATOR_ORIENTATION_ENUM', record.indicatorOrientation) }}</span>
                      <span :style="{ color: record.indicatorOrientation == '2' ? 'red' : 'green' }" class="trend-icon">
                        {{ record.indicatorOrientation == '2' ? '↑' : record.indicatorOrientation == '3' ? '↓' : '' }}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 class="indicator-name">{{ record.indicatorCode }}</h3>
                    <a-tooltip placement="topLeft">
                      <template #title>{{ record.indicatorName }}</template>
                      <h3 class="indicator-name">{{ record.indicatorName }}</h3>
                    </a-tooltip>
                  </div>

                  <!-- 主体区域：指标名称 + 计算方式 + 图表 -->
                  <div class="content-wrapper">
                    <div class="info-column">
                      <!-- <h3 class="indicator-name">{{ record.indicatorCode }}</h3>
                      <h3 class="indicator-name">{{ record.indicatorName }}</h3> -->
                      <div class="formula">
                        <h4>计算公式:</h4>
                        <p>{{ record.indicatorCalculationMethod }}</p>
                      </div>
                    </div>
                    <div class="chart-column">
                      <div class="chart-container">
                        <div :ref="(el) => setChartRef(el, record.indicatorCode)" class="mini-chart" :id="`chart-${record.indicatorCode}`"></div>
                      </div>
                    </div>
                  </div>

                  <!-- 底部数值 -->
                  <div class="bottom-value">
                    {{ $smartEnumPlugin.getDescByValue('INDICATOR_DATA_TYPE_ENUM', record.indicatorDataType) }}
                  </div>
                </div>
              </template>
            </template>
            <template v-else-if="column.key === 'developmentStatus'">
              <a-tag v-if="record.developmentStatus" :color="record.developmentStatus == '1' ? '#009688' : '#ffa17a'">
                {{ $smartEnumPlugin.getDescByValue('DEPLOYMENT_STATUS_TYPE_ENUM', record.developmentStatus) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'isFillFlag'">
              <a-tag v-if="record.isFillFlag" :color="record.isFillFlag == '1' ? '#009688' : '#ffa17a'">
                {{ $smartEnumPlugin.getDescByValue('FILL_STATUS_TYPE_ENUM', record.isFillFlag) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'collectionType'">
              <a-tag v-if="record.collectionType" :color="record.collectionType == '1' ? '#009688' : '#3286a0'">
                {{ $smartEnumPlugin.getDescByValue('INDICATOR_FETCH_TYPE_ENUM', record.collectionType) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'indicatorDefinition'">
              <a-tooltip placement="topLeft" :overlayStyle="{ maxWidth: '600px', whiteSpace: 'pre-wrap' }">
                <template #title>
                  <span :title="text">{{ record.indicatorDefinition }}</span>
                </template>
                <span>{{ record.indicatorDefinition }}</span>
              </a-tooltip>
            </template>
            <template v-else-if="column.key === 'indicatorDescription'">
              <a-tooltip placement="topLeft" :overlayStyle="{ maxWidth: '600px', whiteSpace: 'pre-wrap' }">
                <template #title>
                  <span :title="text">{{ record.indicatorDescription }}</span>
                </template>
                <span>{{ record.indicatorDescription }}</span>
              </a-tooltip>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleView(record)">
                  <LinkOutlined />
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <!-- 自定义分页组件 - 固定在底部 -->
      <div class="custom-pagination">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-size-changer="true"
          :show-quick-jumper="true"
          :page-size-options="['3', '6', '9']"
          :show-total="
            (total) => {
              const actualIndicators = groupedIndicatorData ? groupedIndicatorData.length : 0;
              const startIndicator = (pagination.current - 1) * pagination.pageSize + 1;
              const endIndicator = Math.min(pagination.current * pagination.pageSize, total);
              return `第 ${startIndicator}-${endIndicator} 个指标/共 ${total} 个指标 (当前页 ${actualIndicators} 个指标)`;
            }
          "
          @change="handlePaginationChange"
          @show-size-change="handlePageSizeChange"
        >
          <template #buildOptionText="props"> {{ props.value }}个指标/页 </template>
        </a-pagination>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, nextTick, computed, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { useRoute } from 'vue-router';
  import { themeColors } from '/@/theme/color.js';
  import { IndicatorApi } from '/@/api/Indicator/Indicator-api';
  import { DownloadOutlined, EditOutlined, LinkOutlined, SearchOutlined } from '@ant-design/icons-vue';
  import { reportTemplateQueryApi } from '/@/api/business/rating/indicator/report/report-template-query-api';
  import { indicatorDepartmentApi } from '/@/api/business/rating/indicator/department/index';
  import { indicatorChapterApi } from '/@/api/business/rating/indicator/chapter/index';
  import SmartEnumSelect from '/@/components/framework/smart-enum-select/index.vue';
  import { departmentApi } from '/@/api/system/department-api';
  import GenericTreeSelect from '/@/components/business/common/tree-select/generic-tree-select.vue';
  import { reportTemplateApi } from '/@/api/business/rating/indicator/report/report-template-api';
  import * as echarts from 'echarts';

  // 颜色theme - 与 report-template.vue 保持一致
  const colorIndex = 8;

  // 获取路由对象
  const route = useRoute();

  // 响应式数据
  const loading = ref(false);
  const exportLoading = ref(false);

  // ECharts 实例存储
  const chartInstances = ref(new Map());

  // 搜索表单
  const searchForm = reactive({
    indicatorName: '',
    indicatorCode: '',
    chapter: '', // 单选模式
    section: '', // 单选模式
    dept: '', // 恢复为字符串，单选模式
    isFillFlag: '',
    developmentStatus: '',
    judgeFlag: '',
    indicatorFetchType: '',
    statisticType: '',
  });

  const options_one = ref([]);
  //查询数据库
  async function queryData_options_one() {
    try {
      options_one.value = [];
      const queryResult = await IndicatorApi.queryIndicatorOne();
      if (queryResult.ok && queryResult.data) {
        let list = queryResult.data;
        list.forEach((element) => {
          options_one.value.push({
            value: element.id,
            label: element.indicator_name,
          });
        });
      }
    } catch (e) {
      console.log(e);
      options_one.value = [];
    }
  }

  const options_two = ref([]);
  //查询数据库
  async function queryData_options_two() {
    try {
      let parent_id = Array.isArray(searchForm.parent_id_one) ? searchForm.parent_id_one[0] || -1 : searchForm.parent_id_one || -1;
      options_two.value = [];
      let queryResult = await IndicatorApi.queryIndicatorTwo(parent_id);
      if (queryResult.ok && queryResult.data) {
        let list = queryResult.data;
        list.forEach((element) => {
          options_two.value.push({
            value: element.id,
            label: element.indicator_name,
          });
        });
      }
    } catch (e) {
      console.log(e);
      options_two.value = [];
    }
  }

  const handleChange = (value) => {
    // 若为多选，取第一个作为父ID；若为单选，直接使用
    searchForm.parent_id_one = Array.isArray(value) ? value[0] ?? undefined : value;
    queryData_options_two();
  };

  // 基础分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 3, // 每页指标数量
    total: 0, // 指标总数
  });

  // 表格列定义
  const tableColumns = [
    {
      title: '指标概览',
      key: 'indicatorCard',
      width: 400,
      align: 'left',
      customCell: (record, index) => {
        // 使用预计算的 rowSpan 信息，避免在渲染过程中动态计算
        const rowspan = rowSpanMap.value.get(index) || 0;
        console.log(`customCell: index ${index}, rowspan ${rowspan}`);
        return { rowSpan: rowspan };
      },
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
      width: 80,
      align: 'center',
    },
    {
      title: '开展情况',
      dataIndex: 'developmentStatus',
      key: 'developmentStatus',
      width: 100,
      align: 'center',
    },
    {
      title: '填报状态',
      dataIndex: 'isFillFlag',
      key: 'isFillFlag',
      width: 100,
      align: 'center',
    },
    {
      title: '结果值',
      dataIndex: 'result',
      key: 'result',
      width: 80,
      align: 'center',
    },
    {
      title: '分子值',
      dataIndex: 'numerator',
      key: 'numerator',
      width: 80,
      align: 'center',
    },
    {
      title: '分母值',
      dataIndex: 'denominator',
      key: 'denominator',
      width: 80,
      align: 'center',
    },
    {
      title: '参考值',
      dataIndex: 'referenceValue',
      key: 'referenceValue',
      width: 80,
      align: 'center',
    },
    {
      title: '标杆值',
      dataIndex: 'benchmarkValue',
      key: 'benchmarkValue',
      width: 80,
      align: 'center',
    },
    {
      title: '中位值',
      dataIndex: 'median',
      key: 'median',
      width: 80,
      align: 'center',
    },
    {
      title: '责任科室',
      dataIndex: 'dept',
      key: 'dept',
      width: 100,
      align: 'center',
    },
    {
      title: '采集方式',
      dataIndex: 'collectionType',
      key: 'collectionType',
      width: 100,
      align: 'center',
    },
    {
      title: '指标定义',
      dataIndex: 'indicatorDefinition',
      key: 'indicatorDefinition',
      width: 200,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '指标说明',
      dataIndex: 'indicatorDescription',
      key: 'indicatorDescription',
      width: 200,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '溯源',
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
    },
  ];

  // 重构后的分组数据结构 - 后端返回的数据格式
  const groupedIndicatorData = ref([
    // {
    //   key: 'AB013',
    //   indicatorCode: 'AB013',
    //   indicatorName: '门诊患者满意度',
    //   indicatorProperty: '定性指标',
    //   indicatorOrientation: '上升',
    //   indicatorCalculationMethod: '满意患者数/门诊患者总数* 100%',
    //   dept: '门诊部',
    //   collectionType: '自动采集',
    //   indicatorDefinition: '指标定义',
    //   indicatorDescription: '指标说明',
    //   indicatorDataType:'',
    //   yearlyData: [
    //     {
    //       year: '2022',
    //       developmentStatus: '已开展',
    //       numerator: '98',
    //       denominator: '100',
    //       result: '98.0',
    //       referenceValue: '90.0',
    //       benchmarkValue: '95.0',
    //       median: '92.0',
    //     },
    //     {
    //       year: '2023',
    //       developmentStatus: '已开展',
    //       numerator: '99',
    //       denominator: '100',
    //       result: '99.0',
    //       referenceValue: '90.0',
    //       benchmarkValue: '95.0',
    //       median: '92.0',
    //     },
    //     {
    //       year: '2024',
    //       developmentStatus: '已开展',
    //       numerator: '99.5',
    //       denominator: '100',
    //       result: '99.5',
    //       referenceValue: '90.0',
    //       benchmarkValue: '95.0',
    //       median: '92.0',
    //     },
    //     {
    //       year: '2025',
    //       developmentStatus: '已开展',
    //       numerator: '99.8',
    //       denominator: '100',
    //       result: '99.8',
    //       referenceValue: '90.0',
    //       benchmarkValue: '95.0',
    //       median: '92.0',
    //     },
    //   ],
    // },
    // {
    //   key: 'CD025',
    //   indicatorCode: 'CD025',
    //   indicatorName: '平均住院日',
    //   indicatorProperty: '定量指标',
    //   indicatorOrientation: '下降',
    //   indicatorCalculationMethod: '住院总天数/出院患者人数',
    //   dept: '医务科',
    //   collectionType: '手动采集',
    //   indicatorDefinition: '指标定义',
    //   indicatorDescription: '指标说明',
    //   yearlyData: [
    //     {
    //       year: '2022',
    //       developmentStatus: '已开展',
    //       numerator: '6.5',
    //       denominator: '1',
    //       result: '6.5',
    //       referenceValue: '8.0',
    //       benchmarkValue: '7.0',
    //       median: '7.5',
    //     },
    //     {
    //       year: '2023',
    //       developmentStatus: '已开展',
    //       numerator: '6.2',
    //       denominator: '1',
    //       result: '6.2',
    //       referenceValue: '7.5',
    //       benchmarkValue: '6.8',
    //       median: '7.0',
    //     },
    //     {
    //       year: '2024',
    //       developmentStatus: '已开展',
    //       numerator: '6.0',
    //       denominator: '1',
    //       result: '6.0',
    //       referenceValue: '7.2',
    //       benchmarkValue: '6.5',
    //       median: '6.8',
    //     },
    //     {
    //       year: '2025',
    //       developmentStatus: '已开展',
    //       numerator: '5.8',
    //       denominator: '1',
    //       result: '5.8',
    //       referenceValue: '7.0',
    //       benchmarkValue: '6.2',
    //       median: '6.5',
    //     },
    //   ],
    // },
  ]);

  // 验证指标数据完整性的函数
  const validateIndicatorData = (indicator, indicatorIndex) => {
    const errors = [];

    if (!indicator) {
      errors.push(`指标 ${indicatorIndex} 为空`);
      return { isValid: false, errors };
    }

    // 检查必要的基础字段
    const requiredFields = ['indicatorCode', 'indicatorName'];
    requiredFields.forEach((field) => {
      if (!indicator[field] || indicator[field].toString().trim() === '') {
        errors.push(`指标 ${indicatorIndex} 缺少必要字段: ${field}`);
      }
    });

    // 检查 yearlyData
    if (!Array.isArray(indicator.yearlyData)) {
      errors.push(`指标 ${indicator.indicatorCode || indicatorIndex} 的 yearlyData 不是数组`);
    } else if (indicator.yearlyData.length === 0) {
      errors.push(`指标 ${indicator.indicatorCode || indicatorIndex} 的 yearlyData 为空`);
    } else {
      // 检查年度数据的完整性
      indicator.yearlyData.forEach((yearData, yearIndex) => {
        if (!yearData) {
          errors.push(`指标 ${indicator.indicatorCode} 的年度数据 ${yearIndex} 为空`);
        } else if (!yearData.year) {
          errors.push(`指标 ${indicator.indicatorCode} 的年度数据 ${yearIndex} 缺少年份`);
        }
      });
    }

    return { isValid: errors.length === 0, errors };
  };

  // 将分组数据展开为表格行数据的函数
  const expandGroupedData = (groupedData) => {
    const timestamp = Date.now();
    console.log(`=== expandGroupedData 开始处理 [${timestamp}] ===`);
    console.log('输入数据详情:', JSON.stringify(groupedData, null, 2));

    const expandedData = [];
    const skippedIndicators = [];
    const processedYears = new Set(); // 用于检测重复年份
    let keyCounter = 1;

    // 添加安全检查
    if (!Array.isArray(groupedData)) {
      console.error('expandGroupedData: groupedData 不是数组:', groupedData);
      return [];
    }

    if (groupedData.length === 0) {
      console.warn('expandGroupedData: groupedData 为空数组');
      return [];
    }

    groupedData.forEach((indicator, indicatorIndex) => {
      console.log(`处理指标 ${indicatorIndex}: ${indicator?.indicatorCode}`);

      // 验证指标数据完整性
      const validation = validateIndicatorData(indicator, indicatorIndex);

      if (!validation.isValid) {
        console.error(`expandGroupedData: 跳过无效指标 ${indicatorIndex}:`, validation.errors);
        skippedIndicators.push({ index: indicatorIndex, errors: validation.errors, data: indicator });
        return; // 跳过无效指标
      }

      console.log(
        `指标 ${indicator.indicatorCode} 有 ${indicator.yearlyData.length} 年数据:`,
        indicator.yearlyData.map((y) => y.year)
      );

      // 处理有效指标的年度数据
      indicator.yearlyData.forEach((yearData, yearIndex) => {
        // 再次验证年度数据
        if (!yearData || !yearData.year) {
          console.error(`expandGroupedData: 跳过指标 ${indicator.indicatorCode} 的无效年度数据 ${yearIndex}`);
          return;
        }

        // 检测重复年份数据
        const yearKey = `${indicator.indicatorCode}-${yearData.year}`;
        if (processedYears.has(yearKey)) {
          console.error(`发现重复年份数据，跳过: ${yearKey}`);
          return;
        }
        processedYears.add(yearKey);

        const expandedRecord = {
          key: `${indicator.indicatorCode}-${yearData.year}-${keyCounter}`, // 生成唯一key
          indicatorCode: indicator.indicatorCode,
          indicatorName: indicator.indicatorName || '',
          indicatorProperty: indicator.indicatorProperty || '',
          indicatorOrientation: indicator.indicatorOrientation || '',
          indicatorCalculationMethod: indicator.indicatorCalculationMethod || '',
          dept: indicator.dept || '',
          collectionType: indicator.collectionType || '',
          indicatorDefinition: indicator.indicatorDefinition || '',
          indicatorDescription: indicator.indicatorDescription || '',
          indicatorDataType: indicator.indicatorDataType || '',
          year: yearData.year || '',
          developmentStatus: yearData.developmentStatus || '',
          isFillFlag: yearData.isFillFlag || '',
          numerator: yearData.numerator || '',
          denominator: yearData.denominator || '',
          result: yearData.result || '',
          referenceValue: yearData.referenceValue || '',
          benchmarkValue: yearData.benchmarkValue || '',
          median: yearData.median || '',
          // 添加当前分数用于卡片显示（使用最新年份的结果）
          currentScore:
            indicator.yearlyData && indicator.yearlyData.length > 0 ? indicator.yearlyData[indicator.yearlyData.length - 1].result : yearData.result,
        };

        console.log(`添加记录: ${expandedRecord.indicatorCode} - ${expandedRecord.year}`);

        // 最终验证展开记录的完整性
        if (expandedRecord.indicatorCode && expandedRecord.indicatorName && expandedRecord.year) {
          expandedData.push(expandedRecord);
          keyCounter++;
        } else {
          console.error('expandGroupedData: 展开记录缺少关键字段，跳过:', expandedRecord);
        }
      });
    });

    // 输出处理结果统计
    console.log(`=== expandGroupedData 完成统计 [${timestamp}] ===`);
    console.log(`- 输入指标数: ${groupedData.length}`);
    console.log(`- 跳过指标数: ${skippedIndicators.length}`);
    console.log(`- 输出数据行数: ${expandedData.length}`);
    console.log(`- 处理的年份数: ${processedYears.size}`);
    console.log(
      '输出数据预览:',
      expandedData.map((item) => `${item.indicatorCode}-${item.year}`)
    );

    if (skippedIndicators.length > 0) {
      console.warn('expandGroupedData: 跳过的指标详情:', skippedIndicators);
    }

    // 最终数据去重检查（双重保险）
    const uniqueData = [];
    const seenKeys = new Set();
    expandedData.forEach((item) => {
      const uniqueKey = `${item.indicatorCode}-${item.year}`;
      if (!seenKeys.has(uniqueKey)) {
        seenKeys.add(uniqueKey);
        uniqueData.push(item);
      } else {
        console.warn(`发现并移除重复数据: ${uniqueKey}`);
      }
    });

    if (uniqueData.length !== expandedData.length) {
      console.warn(`去重前: ${expandedData.length} 行，去重后: ${uniqueData.length} 行`);
    }

    console.log(`=== expandGroupedData 处理完成 [${timestamp}] ===`);
    return uniqueData;
  };

  // 表格数据源 - 从分组数据展开而来
  const tableDataSource = ref(expandGroupedData(groupedIndicatorData.value));

  // 计算属性：预计算每行的 rowSpan 信息
  const rowSpanMap = computed(() => {
    const map = new Map();

    if (!tableDataSource.value || !Array.isArray(tableDataSource.value) || tableDataSource.value.length === 0) {
      return map;
    }

    // 遍历所有行，计算每个指标的 rowSpan
    const indicatorGroups = new Map();

    // 第一遍：按 indicatorCode 分组
    tableDataSource.value.forEach((record, index) => {
      if (!record || !record.indicatorCode) return;

      const code = record.indicatorCode;
      if (!indicatorGroups.has(code)) {
        indicatorGroups.set(code, []);
      }
      indicatorGroups.get(code).push(index);
    });

    // 第二遍：为每个分组的第一行设置 rowSpan，其他行设置为 0
    indicatorGroups.forEach((indexes, code) => {
      if (indexes.length > 0) {
        const firstIndex = indexes[0];
        map.set(firstIndex, indexes.length); // 第一行设置为组内行数

        // 其他行设置为 0
        for (let i = 1; i < indexes.length; i++) {
          map.set(indexes[i], 0);
        }
      }
    });

    console.log('rowSpanMap 计算完成:', map);
    return map;
  });

  // 监听筛选条件变化，重置页码
  // 当 searchForm 中的任何字段变化时，触发重置
  watch(
    () => ({ ...searchForm }), // 监听筛选条件的拷贝（避免引用类型问题）
    (newVal, oldVal) => {
      // 只有当新旧值不同时，才重置页码（避免初始加载时重复触发）
      if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        pagination.current = 1; // 重置为第1页
      }
    },
    { deep: true } // 深度监听对象内部变化
  );

  // 搜索处理 - 匹配后端指标维度分页
  const handleSearch = async () => {
    loading.value = true;
    try {
      const params = {
        ...searchForm,
        pageNum: pagination.current,
        pageSize: pagination.pageSize, // 这里是指标数量，不是行数
      };

      console.log('发送分页参数:', {
        pageNum: params.pageNum,
        pageSize: params.pageSize,
        note: '后端按指标维度分页',
      });

      // 调用后端分组接口
      const response = await reportTemplateQueryApi.getIndicatorReportTemplateData(params);

      console.log('API响应数据:', response);

      // 检查响应结构并正确解析数据
      if (response && response.data && response.data.list) {
        console.log('=== handleSearch 接收到后端数据 ===');
        console.log('后端返回指标数量:', response.data.list.length);
        console.log('后端数据详情:', JSON.stringify(response.data.list, null, 2));

        // 清空之前的数据，确保不会有残留
        groupedIndicatorData.value = [];
        tableDataSource.value = [];

        // 使用 nextTick 确保数据清空完成
        await nextTick();

        // 设置新数据
        groupedIndicatorData.value = response.data.list;
        console.log('groupedIndicatorData 更新完成');

        // 使用 nextTick 确保数据更新完成后再展开表格数据
        await nextTick();

        // 展开当前页的指标数据为表格行
        console.log('开始调用 expandGroupedData...');
        const expandedData = expandGroupedData(groupedIndicatorData.value);
        console.log('expandGroupedData 返回结果:', expandedData);

        // 验证展开数据的完整性
        if (expandedData && expandedData.length > 0) {
          tableDataSource.value = expandedData;
          console.log('表格数据更新成功，行数:', tableDataSource.value.length);
          console.log(
            '表格数据内容预览:',
            tableDataSource.value.map((item) => `${item.indicatorCode}-${item.year}`)
          );

          // 使用 nextTick 确保计算属性重新计算
          await nextTick();
          console.log('rowSpanMap 重新计算完成，条目数:', rowSpanMap.value.size);

          // 验证数据完整性
          validateTableData();
        } else {
          console.warn('展开数据为空，保持原有数据');
          tableDataSource.value = [];
        }

        // 更新分页信息 - 使用指标总数
        pagination.current = response.data.pageNum || 1;
        pagination.total = response.data.total || 0; // 指标总数

        // message.success(`查询成功，第${pagination.current}页，当前页${groupedIndicatorData.value.length}个指标，展开为${tableDataSource.value.length}行数据`);
      } else {
        message.error('数据格式错误');
        console.error('API响应格式异常:', response);
      }
    } catch (error) {
      message.error('查询失败');
      console.error('查询失败详情:', error);
    } finally {
      loading.value = false;
    }
  };

  // 导出指标报告查询api
  const handleExport = async () => {
    exportLoading.value = true;
    try {
      const params = {
        ...searchForm,
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      };
      await reportTemplateApi.exportReportQuery(params);
      message.success('导出成功');
    } catch (err) {
      console.error('数据导出失败:', err);
      message.error('导出失败');
    } finally {
      exportLoading.value = false;
    }
  };

  // 防止重复调用的标志
  const isPageSizeChanging = ref(false);

  // 分页页码变化处理
  const handlePaginationChange = (page) => {
    // 如果正在处理页面大小变化，跳过此次调用
    if (isPageSizeChanging.value) {
      console.log('正在处理页面大小变化，跳过分页变化');
      return;
    }

    console.log(`切换到第${page}页，当前数据行数: ${tableDataSource.value?.length || 0}`);
    pagination.current = page;
    handleSearch();
  };

  // 分页大小变化处理
  const handlePageSizeChange = (_current, size) => {
    isPageSizeChanging.value = true; // 设置标志
    pagination.pageSize = size;
    pagination.current = 1; // 重置到第一页
    console.log(`每页显示${size}个指标，重置到第1页`);

    // 调用搜索后重置标志
    handleSearch().finally(() => {
      // 使用 nextTick 确保在下一个事件循环中重置标志
      nextTick(() => {
        isPageSizeChanging.value = false;
      });
    });
  };

  // 查看操作
  const handleView = (record) => {
    message.info(`查看指标: ${record.indicatorCode}-${record.year}`);
    const targetUrl = `${window.location.origin}/report.html?indicatorCode=${record.indicatorCode}&year=${record.year}`;
    window.open(targetUrl, '_blank');
  };

  // 调试函数：验证表格数据的完整性
  const validateTableData = () => {
    if (!tableDataSource.value || !Array.isArray(tableDataSource.value)) {
      console.error('validateTableData: tableDataSource 无效');
      return false;
    }

    let isValid = true;
    tableDataSource.value.forEach((record, index) => {
      if (!record) {
        console.error(`validateTableData: 第 ${index} 行记录为空`);
        isValid = false;
      } else if (!record.indicatorCode) {
        console.error(`validateTableData: 第 ${index} 行缺少 indicatorCode`, record);
        isValid = false;
      }
    });

    console.log(`validateTableData: 数据${isValid ? '有效' : '无效'}，共 ${tableDataSource.value.length} 行`);
    return isValid;
  };

  // 获取指标的分组数据
  const getIndicatorGroupData = (indicatorCode) => {
    return groupedIndicatorData.value.find((item) => item.indicatorCode === indicatorCode);
  };

  // 设置图表引用
  const setChartRef = (el, indicatorCode) => {
    if (el) {
      nextTick(() => {
        initChart(el, indicatorCode);
      });
    }
  };

  // 初始化图表
  const initChart = (container, indicatorCode) => {
    if (!container) return;

    // 如果已存在实例，先销毁
    if (chartInstances.value.has(indicatorCode)) {
      chartInstances.value.get(indicatorCode).dispose();
    }

    const chart = echarts.init(container);
    chartInstances.value.set(indicatorCode, chart);

    // 获取该指标的数据
    const indicatorData = getIndicatorChartData(indicatorCode);

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        formatter: function (params) {
          const param = params[0];
          return `
            <div style="padding: 4px 8px;">
              <div style="color: #52c41a; font-weight: bold;">● 结果值</div>
              <div style="margin-top: 4px;">${param.value}</div>
            </div>
          `;
        },
      },
      grid: {
        left: 25,
        right: 10,
        top: 15,
        bottom: 25,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        data: indicatorData.years,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          fontSize: 10,
          color: '#999',
          margin: 5,
        },
      },
      yAxis: {
        type: 'value',
        show: true,
        position: 'left',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed',
          },
        },
        axisLabel: {
          fontSize: 10,
          color: '#999',
          margin: 5,
          formatter: function (value) {
            return value.toFixed(0);
          },
        },
        min: function (value) {
          return Math.max(0, value.min - (value.max - value.min) * 0.1);
        },
        max: function (value) {
          return value.max + (value.max - value.min) * 0.1;
        },
      },
      series: [
        {
          type: 'line',
          data: indicatorData.values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          lineStyle: {
            color: '#009688',
            width: 2,
          },
          itemStyle: {
            color: '#009688',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(82, 196, 26, 0.3)',
                },
                {
                  offset: 1,
                  color: 'rgba(82, 196, 26, 0.05)',
                },
              ],
            },
          },
        },
      ],
    };

    chart.setOption(option);

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      chart.resize();
    });
  };

  // 获取指标图表数据 - 直接从分组数据获取
  const getIndicatorChartData = (indicatorCode) => {
    const groupData = getIndicatorGroupData(indicatorCode);
    if (!groupData || !Array.isArray(groupData.yearlyData) || groupData.yearlyData.length === 0) {
      return { years: [], values: [] };
    }

    const sortedData = groupData.yearlyData.sort((a, b) => parseInt(a.year) - parseInt(b.year));

    return {
      years: sortedData.map((item) => item.year),
      values: sortedData.map((item) => {
        // 安全处理result值，确保是有效数字
        const result = item.result;
        if (result === null || result === undefined || result === '') {
          return 0;
        }
        const parsed = parseFloat(result);
        return isNaN(parsed) ? 0 : parsed;
      }),
    };
  };

  // 章节选项相关状态
  const chapterOptions = ref([]);
  const chapterLoading = ref(false);
  const chapterSearchKeyword = ref('');
  const chapterSearchTimer = ref(null); // 防抖定时器

  // 节选项相关状态
  const sectionOptions = ref([]);
  const sectionLoading = ref(false);
  const sectionSearchKeyword = ref('');
  const sectionSearchTimer = ref(null); // 防抖定时器

  // 章节搜索处理函数 - 带防抖功能，避免频繁请求
  const handleChapterSearch = (searchValue) => {
    chapterSearchKeyword.value = searchValue;

    // 清除之前的定时器
    if (chapterSearchTimer.value) {
      clearTimeout(chapterSearchTimer.value);
    }

    // 如果搜索为空，清空选项
    if (!searchValue || searchValue.trim() === '') {
      chapterOptions.value = [];
      chapterLoading.value = false;
      return;
    }

    // 设置loading状态
    chapterLoading.value = true;

    // 设置防抖定时器，500ms后执行搜索
    chapterSearchTimer.value = setTimeout(async () => {
      try {
        console.log('发起章节搜索请求:', searchValue.trim());

        // 调用后端模糊搜索接口
        const res = await indicatorChapterApi.searchChapter({
          keyword: searchValue.trim(),
        });

        if (res.ok && res.data) {
          chapterOptions.value = res.data.map((item) => ({
            label: item.chapterName || item.name,
            value: item.chapterId || item.id,
          }));
          console.log('章节搜索成功，返回结果数量:', res.data.length);
        } else {
          // 如果搜索接口不存在，清空选项提示用户输入更多字符
          chapterOptions.value = [];
          console.warn('章节搜索接口未实现，请确保后端提供搜索接口');
        }
      } catch (error) {
        console.error('搜索章节数据失败:', error);
        chapterOptions.value = [];
      } finally {
        chapterLoading.value = false;
      }
    }, 500); // 500ms防抖延迟
  };

  // 章节下拉框获得焦点时的处理 - 不预加载数据
  const handleChapterFocus = async () => {
    // 不做任何操作，等待用户输入
  };

  // 章节选择变化处理 - 移除联动，章节和节互不依赖
  const handleChapterChange = async (selectedChapters) => {
    // 不再清空节的选择，章节和节互不依赖
    console.log('章节选择变化:', selectedChapters);
  };

  // 节搜索处理函数 - 带防抖功能，避免频繁请求
  const handleSectionSearch = (searchValue) => {
    sectionSearchKeyword.value = searchValue;

    // 清除之前的定时器
    if (sectionSearchTimer.value) {
      clearTimeout(sectionSearchTimer.value);
    }

    // 如果搜索为空，清空选项
    if (!searchValue || searchValue.trim() === '') {
      sectionOptions.value = [];
      sectionLoading.value = false;
      return;
    }

    // 设置loading状态
    sectionLoading.value = true;

    // 设置防抖定时器，500ms后执行搜索
    sectionSearchTimer.value = setTimeout(async () => {
      try {
        console.log('发起节搜索请求:', searchValue.trim());

        // 调用后端模糊搜索接口，不依赖章节选择
        const searchParams = {
          keyword: searchValue.trim(),
        };

        const res = await indicatorChapterApi.searchSection(searchParams);

        if (res.ok && res.data) {
          sectionOptions.value = res.data.map((item) => ({
            label: item.sectionName || item.name,
            value: item.sectionId || item.id,
          }));
          console.log('节搜索成功，返回结果数量:', res.data.length);
        } else {
          // 如果搜索接口不存在，清空选项提示用户输入更多字符
          sectionOptions.value = [];
          console.warn('节搜索接口未实现，请确保后端提供搜索接口');
        }
      } catch (error) {
        console.error('搜索节数据失败:', error);
        sectionOptions.value = [];
      } finally {
        sectionLoading.value = false;
      }
    }, 500); // 500ms防抖延迟
  };

  // 节下拉框获得焦点时的处理 - 不预加载数据
  const handleSectionFocus = async () => {
    // 不做任何操作，等待用户输入
  };

  onMounted(async () => {
    console.log('onMounted - 开始处理路由参数');

    // 处理路由参数
    const routeQuery = route.query;
    console.log('路由参数详情:', routeQuery);

    if (routeQuery.isFillFlag !== undefined) {
      searchForm.isFillFlag = routeQuery.isFillFlag;
      console.log('设置填报状态:', routeQuery.isFillFlag);
    }

    if (routeQuery.developmentStatus !== undefined) {
      searchForm.developmentStatus = routeQuery.developmentStatus;
      console.log('设置开展状态:', routeQuery.developmentStatus);
    }

    if (routeQuery.chapter !== undefined) {
      // 转换为数字类型
      searchForm.chapter = +routeQuery.chapter;

      console.log('设置章状态:', routeQuery.chapter);
    }

    console.log('更新后的搜索表单:', searchForm);

    // 加载查询章和节
    await queryData_options_one();
    await queryData_options_two();

    // 页面加载时执行查询，获取第一页数据
    await handleSearch();
    calculateScrollY();
    // 监听窗口大小变化，重新计算
    window.addEventListener('resize', calculateScrollY);
  });

  const tableScrollY = ref(400);

  const calculateScrollY = () => {
    const container = document.querySelector('.ant-table-container');
    const header = document.querySelector('.ant-table-header');
    if (container && header) {
      console.log('表格容器高度：' + container.clientHeight);
      console.log('表格头高度：' + header.clientHeight);
      tableScrollY.value = container.clientHeight - header.clientHeight;
    }
  };
</script>

<style lang="less" scoped>
  .indicator-query-container {
    padding: 8px;
    background-color: #f5f5f5;
    overflow: hidden;
    height: calc(100vh - 105px);
  }

  .search-section {
    background-color: #fff;
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 8px;
    height: 15%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    .search-item {
      margin-bottom: 16px;

      ::v-deep .ant-form-item {
        margin-bottom: 0;

        .ant-form-item-label {
          width: 70px;
          text-align: right;
          padding-right: 8px;

          label {
            width: 100%;
            white-space: nowrap;
            font-size: 12px;
            height: 24px;
            line-height: 24px;
          }
        }

        .ant-form-item-control {
          flex: 1;
          min-width: 0;

          .ant-form-item-control-input {
            min-height: 24px;
          }
        }
      }
    }

    .search-buttons {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .ant-btn {
        height: 28px;
        font-size: 12px;
        margin-bottom: 16px;
      }

      .ant-btn-primary {
        background-color: #009688;
        border-color: #009688;

        &:hover {
          background-color: #00796b;
          border-color: #00796b;
        }
      }
    }
  }

  .indicator-card-cell {
    position: relative;
    padding: 16px;
    min-width: 300px;
    height: 320px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* 顶部区域：指标类型 + 指标导向 */
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #666;
    margin-bottom: 12px;
  }

  .indicator-type {
    opacity: 0.8;
  }

  .trend-wrap {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  .trend-icon {
    margin-left: 4px;
    font-size: 14px;
  }

  /* 主体区域：指标名称 + 计算方式 + 图表 */
  .content-wrapper {
    margin-top: 50px;
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: flex-start;
    white-space: nowrap;
  }

  .info-column {
    width: 40%;
  }

  .indicator-name {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #009688;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .formula {
    font-size: 12px;
    color: #666;
    line-height: 1.6;
    white-space: wrap;
  }

  .chart-column {
    width: 60%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .chart-container {
    width: 100%;
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    position: relative;
  }

  .chart-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
    align-self: flex-start;
  }

  .mini-chart {
    width: 100%;
    height: 100px;
    flex: 1;
  }

  /* 底部数值 */
  .bottom-value {
    font-size: 20px;
    font-weight: bold;
    color: #009688;
    text-align: right;
    align-self: flex-end;
  }

  .table-section {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    height: 85%;
  }

  .table-container {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    flex-grow: 9;
    overflow-y: scroll;
    margin-bottom: 10px;
  }

  .custom-pagination {
    display: flex;
    justify-content: flex-end;
    padding: 12px 0;
    border-top: 1px solid #f0f0f0;
    background-color: #fff;
    flex-shrink: 0; /* 防止分页区域被压缩 */
  }

  // 表格样式优化
  :deep(.ant-table) {
    .ant-table-thead > tr > th {
      background: #fff;
      font-weight: 600;
      // border-top: 2px solid gray;
      // border-bottom: 2px solid gray;
      // border-radius: 0% !important;
    }
  }

  // 选中行样式
  :deep(.table-row-selected) > td {
    background-color: #e6f7ff !important;
  }

  // 表格行悬停效果
  :deep(.ant-table-tbody > tr:hover > td) {
    background-color: #e4f4eeb3 !important;
  }

  // 响应式设计
  @media (max-width: 1200px) {
    .search-section {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
</style>
