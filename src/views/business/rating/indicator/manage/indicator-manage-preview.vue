<!--
  * 指标预览组件
  *
  * @Author:    Jayce
  * @Date:      2025-06-25
  * @Copyright  ZDS
-->
<template>
  <div>
    <a-spin :spinning="loading">
      <div v-if="!indicatorData" class="empty-state">
        <a-empty description="请先完成指标定义和取数配置" />
      </div>

      <div v-else class="preview-container">
        <!-- 指标定义预览 -->
        <div class="config-section">
          <div class="section-header" @click="toggleSection('definition')">
            <div class="header-left">
              <h4>指标定义</h4>
            </div>
            <div class="header-right">
              <a-button type="text" size="small">
                <template #icon>
                  <DownOutlined v-if="sectionCollapsed.definition" />
                  <UpOutlined v-else />
                </template>
              </a-button>
            </div>
          </div>

          <div v-show="!sectionCollapsed.definition" class="section-content">
            <!-- 基础信息分组 -->
            <div class="config-group">
              <div class="group-title">基础信息</div>
              <div class="preview-grid">
                <div class="preview-item">
                  <div class="item-label">指标名称</div>
                  <div class="item-value">
                    <a-tag color="blue">{{ indicatorData.indicatorName || '-' }}</a-tag>
                  </div>
                </div>
                <div class="preview-item">
                  <div class="item-label">指标编码</div>
                  <div class="item-value">
                    <a-tag color="green">{{ indicatorData.indicatorCode || '-' }}</a-tag>
                  </div>
                </div>
                <div class="preview-item">
                  <div class="item-label">目录层级</div>
                  <div class="item-value">
                    <a-tag :color="indicatorData.parentId === 0 ? 'orange' : 'cyan'">
                      {{ indicatorData.parentId === 0 ? '根目录' : '子目录' }}
                    </a-tag>
                  </div>
                </div>
                <div v-if="indicatorData.parentId !== 0" class="preview-item">
                  <div class="item-label">上级目录</div>
                  <div class="item-value">
                    <span class="text-value">{{ indicatorParentName  || '-' }}</span>
                  </div>
                </div>
                <div class="preview-item">
                  <div class="item-label">指标类型</div>
                  <div class="item-value">
                    <a-tag color="purple">{{ getIndicatorTypeText(indicatorData.indicatorType) }}</a-tag>
                  </div>
                </div>
                <div class="preview-item">
                  <div class="item-label">序号</div>
                  <div class="item-value">
                    <span class="text-value">{{ indicatorData.sort || '-' }}</span>
                  </div>
                </div>
                <div class="preview-item">
                  <div class="item-label">启用状态</div>
                  <div class="item-value">
                    <a-tag :color="indicatorData.disabledFlag === 1 ? 'success' : 'error'">
                      {{ indicatorData.disabledFlag === 1 ? '启用' : '禁用' }}
                    </a-tag>
                  </div>
                </div>
                <div class="preview-item">
                  <div class="item-label">是否填报</div>
                  <div class="item-value">
                    <a-tag :color="indicatorData.isFillFlag === 1 ? 'success' : 'default'">
                      {{ indicatorData.isFillFlag === 1 ? '是' : '否' }}
                    </a-tag>
                  </div>
                </div>
              </div>
            </div>

            <!-- 口径信息分组 -->
            <div class="config-group">
              <div class="group-title">口径信息</div>
              <div class="empty-section">
                <a-empty description="口径信息配置功能待完善" />
              </div>
            </div>
          </div>
        </div>

        <!-- 取数配置预览 -->
        <div class="config-section">
          <div class="section-header" @click="toggleSection('config')">
            <div class="header-left">
              <h4>取数配置</h4>
            </div>
            <div class="header-right">
              <a-button type="text" size="small">
                <template #icon>
                  <DownOutlined v-if="sectionCollapsed.config" />
                  <UpOutlined v-else />
                </template>
              </a-button>
            </div>
          </div>

          <div v-show="!sectionCollapsed.config" class="section-content">
            <!-- 数据源配置 -->
            <div class="config-group">
              <div class="group-title">数据源配置</div>
              <div class="config-cards">
                <div class="config-card">
                  <div class="card-title">数据源1</div>
                  <div class="card-content">
                    <div class="config-item">
                      <span class="config-label">数据源:</span>
                      <span class="config-value">{{ getDataSourceName(configData.dataSourceId1) || '未配置' }}</span>
                    </div>
                    <div class="config-item">
                      <span class="config-label">备注名称:</span>
                      <span class="config-value">{{ configData.remarkName1 || '未配置' }}</span>
                    </div>
                    <div class="config-item">
                      <span class="config-label">SQL语句:</span>
                      <div class="sql-preview">
                        <pre v-if="configData.sql1">{{ configData.sql1 }}</pre>
                        <span v-else class="empty-text">未配置</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="configData.dataSourceId2 || configData.sql2" class="config-card">
                  <div class="card-title">数据源2</div>
                  <div class="card-content">
                    <div class="config-item">
                      <span class="config-label">数据源:</span>
                      <span class="config-value">{{ getDataSourceName(configData.dataSourceId2) || '未配置' }}</span>
                    </div>
                    <div class="config-item">
                      <span class="config-label">备注名称:</span>
                      <span class="config-value">{{ configData.remarkName2 || '未配置' }}</span>
                    </div>
                    <div class="config-item">
                      <span class="config-label">SQL语句:</span>
                      <div class="sql-preview">
                        <pre v-if="configData.sql2">{{ configData.sql2 }}</pre>
                        <span v-else class="empty-text">未配置</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 公式配置 -->
            <div v-if="configData.numeratorIndicator || configData.denominatorIndicator" class="config-group">
              <div class="group-title">公式配置</div>
              <div class="formula-preview">
                <div class="formula-expression">
                  <span class="result-var">结果</span>
                  <span class="equals">=</span>
                  <span class="result-var">(</span>
                  <div class="formula-component">
                    <span class="component-label">分子</span>
                    <span class="component-value">{{ numeratorIndicatorName || '未配置' }}</span>
                  </div>
                  <div class="formula-operator">
                    <span>{{ getRelationTypeText(configData.relationType) || '运算' }}</span>
                  </div>
                  <div class="formula-component">
                    <span class="component-label">分母</span>
                    <span class="component-value">{{ denominatorIndicatorName || '未配置' }}</span>
                  </div>
                  <span class="result-var">)</span>
                  <div v-if="configData.joinCondition" class="formula-condition">
                    <span class="condition-value">{{ getJoinConditionText(configData.joinCondition) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 钻取配置 -->
            <div v-if="configData.secondaryDrilldownEnabled" class="config-group">
              <div class="group-title">钻取配置</div>
              <div class="preview-grid">
                <div class="preview-item">
                  <div class="item-label">次级钻取</div>
                  <div class="item-value">
                    <a-tag :color="configData.secondaryDrilldownEnabled ? 'success' : 'default'">
                      {{ configData.secondaryDrilldownEnabled ? '允许' : '禁用' }}
                    </a-tag>
                  </div>
                </div>
                <div v-if="configData.secondaryDrilldownGroupField" class="preview-item">
                  <div class="item-label">分组字段</div>
                  <div class="item-value">
                    <span class="text-value">{{ configData.secondaryDrilldownGroupField }}</span>
                  </div>
                </div>
                <div v-if="configData.detailDrilldownEnabled" class="preview-item">
                  <div class="item-label">详细钻取1</div>
                  <div class="item-value">
                    <a-tag color="success">允许</a-tag>
                  </div>
                </div>
                <div v-if="configData.detailDrilldownReportName" class="preview-item">
                  <div class="item-label">报表名称1</div>
                  <div class="item-value">
                    <span class="text-value">{{ configData.detailDrilldownReportName }}</span>
                  </div>
                </div>
                <div v-if="configData.detailDrilldownEnabled2" class="preview-item">
                  <div class="item-label">详细钻取2</div>
                  <div class="item-value">
                    <a-tag color="success">允许</a-tag>
                  </div>
                </div>
                <div v-if="configData.detailDrilldownReportName2" class="preview-item">
                  <div class="item-label">报表名称2</div>
                  <div class="item-value">
                    <span class="text-value">{{ configData.detailDrilldownReportName2 }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 频率配置 -->
            <div class="config-group">
              <div class="group-title">频率配置</div>
              <div class="preview-grid">
                <div class="preview-item">
                  <div class="item-label">取数频率</div>
                  <div class="item-value">
                    <div class="frequency-tags">
                      <a-tag v-if="configData.fetchFrequencyMonth === '1'" color="blue">月度</a-tag>
                      <a-tag v-if="configData.fetchFrequencyQuarter === '1'" color="green">季度</a-tag>
                      <a-tag v-if="configData.fetchFrequencyYear === '1'" color="orange">年度</a-tag>
                      <a-tag v-if="configData.fetchFrequencyDay === '1'" color="purple">天数</a-tag>
                      <span v-if="!hasAnyFrequency()" class="text-value">未配置</span>
                    </div>
                  </div>
                </div>
                <div class="preview-item">
                  <div class="item-label">自动取数</div>
                  <div class="item-value">
                    <a-tag :color="configData.autoFetchEnabled ? 'success' : 'default'">
                      {{ configData.autoFetchEnabled ? '启用' : '禁用' }}
                    </a-tag>
                  </div>
                </div>
              </div>
            </div>

            <!-- 其他配置 -->
            <div class="config-group">
              <div class="group-title">其他配置</div>
              <div class="preview-grid">
                <div class="preview-item">
                  <div class="item-label">是否启用</div>
                  <div class="item-value">
                    <a-tag :color="configData.isqy === 1 ? 'success' : 'error'">
                      {{ configData.isqy === 1 ? '启用' : '停用' }}
                    </a-tag>
                  </div>
                </div>
                <div class="preview-item">
                  <div class="item-label">数据存入表</div>
                  <div class="item-value">
                    <span class="text-value">{{ getTargetTableText(configData.targetTable) || '未配置' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="preview-actions">
          <a-space size="large">
            <a-button type="primary" ghost  @click="handleTest" :loading="testing" size="large">
              <template #icon><ExperimentOutlined /></template>
              测试取数
            </a-button>
            <a-button type="primary" ghost @click="handleManualExtraData" :loading="extraData" size="large">
              <template #icon><ToolOutlined /></template>
              手动取数
            </a-button>
            <a-button type="primary" @click="handleEdit" ghost size="large">
              <template #icon><EditOutlined /></template>
              编辑配置
            </a-button>
            <a-button type="primary" @click="handleSave" :loading="saving" size="large">
              <template #icon><SaveOutlined /></template>
              保存指标
            </a-button>
          </a-space>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
  import { nextTick, watch } from 'vue';

  const props = defineProps({
    indicatorData: {
      type: Object,
      default: null,
    },
    configData: {
      type: Object,
      default: () => ({}),
    },
  });

  const emits = defineEmits(['test','extraData', 'edit', 'save']);

  const loading = ref(false);
  const testing = ref(false);
  const saving = ref(false);
  const extraData = ref(false);

  // 区域折叠状态
  const sectionCollapsed = reactive({
    definition: false,
    config: false,
  });

  // 获取指标类型文本
  const getIndicatorTypeText = (type) => {
    const typeMap = {
      1: '目录',
      2: '指标',
    };
    return typeMap[type] || '未知';
  };

  // 获取关联类型文本
  const getRelationTypeText = (type) => {
    const typeMap = {
      1: '+',
      2: '-',
      3: '*',
      4: '/',
    };
    return typeMap[type] || '未知';
  };

  //定义分子和分母指标
  const numeratorIndicatorName = ref();
  const denominatorIndicatorName = ref();

  // 获取分子指标名称
  const getNumeratorIndicatorName = async (indicatorId) => {
    let indicatorBaseInfo = await fetchIndicator(indicatorId);
    numeratorIndicatorName.value = indicatorBaseInfo?.indicatorName;
  };

  // 获取分母指标名称
  const getDenominatorIndicatorName = async (indicatorId) => {
    let indicatorBaseInfo = await fetchIndicator(indicatorId);
    denominatorIndicatorName.value = indicatorBaseInfo?.indicatorName;
  };

  watch(
    [() => props.configData?.denominatorIndicator, () => props.configData?.numeratorIndicator],
    ([newDenominator, newNumerator]) => {
      if (newDenominator) getDenominatorIndicatorName(newDenominator);
      if (newNumerator) getNumeratorIndicatorName(newNumerator);
    },
    { immediate: true }
  );

  // 获取数据源名称
  const getDataSourceName = (dataSourceId) => {
    // 这里应该从配置选项中获取数据源名称
    // 暂时返回ID，实际应该从API获取
    return dataSourceId ? `数据源${dataSourceId}` : '未配置';
  };

  const indicatorParentName = ref('')

  // 获取指标名称
  const getParentIndicatorName = async (indicatorId) => {
    let indicatorBaseInfo = await fetchIndicator(indicatorId);
    indicatorParentName.value =  indicatorBaseInfo?.indicatorName;
  };


  watch(()=>props.indicatorData.parentId,getParentIndicatorName)

  // 获取连接条件文本
  const getJoinConditionText = (condition) => {
    const conditionMap = {
      1: '* 1',
      2: '* 100',
      3: '* 1000',
      4: '* 10000',
      none: '无',
    };
    return conditionMap[condition] || condition || '未配置';
  };

  // 获取目标表文本
  const getTargetTableText = (targetTable) => {
    const tableMap = {
      1: '基础指标数据',
    };
    return tableMap[targetTable] || targetTable || '未配置';
  };

  // 检查是否有任何频率配置
  const hasAnyFrequency = () => {
    return (
      props.configData.fetchFrequencyMonth === '1' ||
      props.configData.fetchFrequencyQuarter === '1' ||
      props.configData.fetchFrequencyYear === '1' ||
      props.configData.fetchFrequencyDay === '1'
    );
  };

  // 处理测试
  const handleTest = () => {
    testing.value = true;
    emits('test');
    testing.value = false;
  };

  // 处理手动取数
  const handleManualExtraData = () => {
    extraData.value = true;
    emits('extraData');
    extraData.value = false;
  };

  // 处理编辑
  const handleEdit = () => {
    emits('edit');
  };

  // 处理保存
  const handleSave = () => {
    saving.value = true;
    emits('save');
    saving.value = false;
  };

  // 切换区域折叠状态
  const toggleSection = (sectionName) => {
    sectionCollapsed[sectionName] = !sectionCollapsed[sectionName];
  };

  // 查询指标基础信息
  async function fetchIndicator(indicatorId) {
    if (!indicatorId) {
      return;
    }
    try {
      //加载基础信息
      const response = await indicatorManageApi.queryIndicatorById(indicatorId);

      if (response && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('加载指标基本信息失败:', error);
    } finally {
      console.log('加载指标基本信息成功');
    }
  }
</script>

<style lang="less" scoped>
  .preview-container {
    // 配置区域样式 - 参考前两步页面
    .config-section {
      margin-bottom: 24px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      background: #fafafa;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
        border-radius: 8px 8px 0 0;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background: #e9ecef;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;

          h4 {
            margin: 0;
            color: #009688;
            font-weight: 600;
          }
        }

        .header-right {
          .ant-btn {
            border: none;
            box-shadow: none;
          }
        }
      }

      .section-content {
        padding: 16px;
      }
    }

    // 预览网格布局
    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 16px;

      .preview-item {
        display: flex;
        align-items: center;
        padding: 12px;
        background: #fff;
        border-radius: 6px;
        border: 1px solid #e8e8e8;

        .item-label {
          min-width: 80px;
          font-weight: 500;
          color: #666;
          margin-right: 12px;
        }

        .item-value {
          flex: 1;

          .text-value {
            color: #333;
            font-weight: 500;
          }
        }
      }
    }

    // 配置组样式
    .config-group {
      margin-bottom: 24px;

      .group-title {
        font-size: 14px;
        font-weight: 600;
        color: #009688;
        margin-bottom: 12px;
        padding-bottom: 6px;
        border-bottom: 1px solid #e8e8e8;
      }
    }

    // 配置卡片样式
    .config-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .config-card {
      border: 1px solid #d9d9d9;
      border-radius: 8px;
      padding: 16px;
      background: #fff;
      position: relative;

      &.secondary {
        border-color: #ffa940;
        background: #fff7e6;
      }

      .card-title {
        position: absolute;
        top: -8px;
        left: 12px;
        background: #fff;
        padding: 0 8px;
        font-size: 12px;
        font-weight: 600;
        color: #009688;
      }

      .card-content {
        .config-item {
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          .config-label {
            display: inline-block;
            min-width: 80px;
            font-weight: 500;
            color: #666;
            margin-right: 8px;
          }

          .config-value {
            background: #f6f8fa;
            padding: 2px 6px;
            border-radius: 3px;
            color: #333;
            font-weight: 500;
          }
        }
      }
    }

    // 公式预览样式
    .formula-preview {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;

      .formula-expression {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: start;

        .result-var {
          font-size: 16px;
          font-weight: 600;
          color: #059669;
          background: #d1fae5;
          padding: 6px 12px;
          border-radius: 4px;
        }

        .equals {
          font-size: 18px;
          font-weight: bold;
          color: #374151;
        }

        .formula-component {
          background: #d1fae5;
          border: 1px solid #10b981;
          border-radius: 6px;
          padding: 8px 12px;
          text-align: center;
          min-width: 100px;
          max-width: 200px;

          .component-label {
            font-size: 10px;
            color: #6b7280;
            display: block;
            margin-bottom: 4px;
          }

          .component-value {
            font-size: 12px;
            font-weight: 500;
            color: #1f2937;
          }
        }

        .formula-operator {
          background: #d1fae5;
          border: 1px solid #10b981;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .formula-condition {
          margin-top: 8px;
          padding: 6px 12px;
          background: #d1fae5;
          border: 1px solid #10b981;
          border-radius: 4px;
          font-size: 12px;

          .condition-label {
            font-weight: bold;
            margin-right: 4px;
          }

          .condition-value {
            font-weight: bold;
          }
        }
      }
    }

    // 频率标签样式
    .frequency-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    // 空白区域样式
    .empty-section {
      padding: 40px 0;
      text-align: center;
    }

    .sql-preview {
      max-height: 200px;
      overflow-y: auto;
      margin-top: 8px;

      pre {
        background: #f6f8fa;
        border: 1px solid #e1e4e8;
        border-radius: 6px;
        padding: 12px;
        margin: 0;
        font-size: 12px;
        line-height: 1.4;
        color: #24292e;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .empty-text {
        color: #999;
        font-style: italic;
        font-size: 12px;
      }
    }

    .preview-actions {
      margin-top: 32px;
      text-align: center;
      padding: 24px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e8e8e8;
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;

    :deep(.ant-empty-description) {
      color: #999;
      font-size: 14px;
    }
  }

  // 深色主题适配
  [data-theme='dark'] {
    .preview-container {
      .config-section {
        background: #1f1f1f;
        border-color: #434343;

        .section-header {
          background: #262626;
          border-bottom: 1px solid #434343;

          h4 {
            color: #1aa391;
          }
        }
      }

      .preview-grid .preview-item {
        background: #262626;
        border-color: #434343;

        .item-label {
          color: #ccc;
        }

        .text-value {
          color: #fff;
        }
      }

      .config-card {
        background: #262626;
        border-color: #434343;

        &.secondary {
          background: #2d2a1f;
          border-color: #ffa940;
        }

        .card-title {
          background: #262626;
          color: #1aa391;
        }

        .config-value {
          background: #1f1f1f;
          color: #fff;
        }
      }

      .formula-preview {
        background: #262626;

        .result-var {
          background: #1f4a3a;
          color: #10b981;
        }

        .formula-component {
          background: #1e3a5f;
          border-color: #3b82f6;
          color: #fff;
        }

        .formula-operator {
          background: #2d1b4e;
          border-color: #8b5cf6;
          color: #a78bfa;
        }
      }

      .sql-preview pre {
        background: #1f1f1f;
        border: 1px solid #434343;
        color: #fff;
      }

      .preview-actions {
        background: #1f1f1f;
        border: 1px solid #434343;
      }
    }
  }
</style>
