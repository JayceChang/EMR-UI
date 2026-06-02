<template>
  <div class="indicator-target-tab-container">
    <!-- Search Form -->
    <a-form layout="inline" :model="searchFormState" @finish="handleSearch" class="search-form">
      <a-form-item label="科室" name="department">
        <GenericTreeSelect
          v-model:value="formData.department"
          :apiFunc="departmentApi.queryDepartmentTree"
          :apiParams="true"
          :fieldNames="{ label: 'name', value: 'departmentId', key: 'departmentId', children: 'children' }"
          placeholder="科室"
          size="small"
          style="width: 150px"
          treeDefaultExpandAll
        />
      </a-form-item>
      <a-form-item label="年份" name="year">
        <a-date-picker
          v-model:value="searchFormState.year"
          valueFormat="YYYY"
          picker="year"
          size="small"
          style="width: 90px"
          @change="onFrequencyChange"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="月度/季度" name="serialNum">
        <a-select
          v-model:value="searchFormState.serialNum"
          placeholder="月度/季度"
          size="small"
          style="width: 100px"
          :options="serial_numOptions"
          @change="onFrequencyChange"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="分类" name="targetCategory">
        <a-select v-model:value="formData.targetCategory" style="width: 90px" allow-clear placeholder="分类" size="small" @change="handleCategoryChange">
          <a-select-option value="trend">趋势导向</a-select-option>
          <a-select-option value="threshold">阈值</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button size="small" type="primary" html-type="submit" :loading="tableLoading">
            <template #icon><SearchOutlined /></template> 查询
          </a-button>
          <a-button size="small" type="primary" @click="handleAdd">
            <template #icon><PlusOutlined /></template> 添加
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>

    <!-- Data Table -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="tableLoading"
      :pagination="{
        ...paginationState,
        hideOnSinglePage: false
      }"
      @change="handleTableChange"
      size="small"
      bordered
      row-key="id"
      class="tab-table"
      :scroll="{ x: true }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'isqy'">
          <span>{{ record.isqy === 1 ? '启用' : '停用' }}</span>
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-popconfirm title="确定删除此条数据吗？" @confirm="handleDelete(record.id)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'serialNum'">
          <span>
            {{ getLabelByPeriodValue(record.serialNum) }}
          </span>
        </template>
      </template>
    </a-table>

    <!-- Modal -->
    <a-modal v-model:open="open" title="指标值" width="800px">
      <template #footer>
        <a-button key="back" @click="open = !open">取消</a-button>
        <a-button key="submit" type="primary" @click="save_from" :loading="loading">保存</a-button>
      </template>
      <a-divider orientation="left">指标值配置</a-divider>
      <a-form
        ref="formRef"
        layout="horizontal"
        style="margin-top: 20px"
        :model="formData"
        :rules="formRules"
        :label-col="{ style: { width: '80px' } }"
      >
        <a-row>
          <a-col :span="24">
            <a-form-item label="指标名称" name="indicatorName">
              <a-input v-model:value="indicator_name" :disabled="true" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="科室" name="department">
              <GenericTreeSelect
                v-model:value="formData.department"
                :apiFunc="departmentApi.queryDepartmentTree"
                :apiParams="true"
                :fieldNames="{ label: 'name', value: 'departmentId', key: 'departmentId', children: 'children' }"
                placeholder="请选择科室"
                treeDefaultExpandAll
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="年份" name="year">
              <a-date-picker v-model:value="formData.year" valueFormat="YYYY" picker="year" style="width: 100%" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="月度/季度" name="serialNum">
              <a-select v-model:value="formData.serialNum" placeholder="月度/季度" :options="serial_numOptions" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="分类" name="targetCategory">
              <a-select v-model:value="formData.targetCategory" placeholder="请选择分类" @change="handleCategoryChange">
                <a-select-option value="trend">趋势导向</a-select-option>
                <a-select-option value="threshold">阈值</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <!-- 趋势导向字段 -->
          <a-col :span="12" v-if="formData.targetCategory === 'trend'">
            <a-form-item label="趋势" name="trendValue">
              <SmartEnumSelect v-model:value="formData.trendValue" enum-name="INDICATOR_TARGET_VALUE_ENUM" placeholder="请选择趋势" />
            </a-form-item>
          </a-col>
          <!-- 阈值字段组 -->
          <template v-if="formData.targetCategory === 'threshold'">
            <a-col :span="12">
              <a-form-item label="值类型" name="typeLx">
                <a-select v-model:value="formData.typeLx" placeholder="值类型" :options="type_lxOptions" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="条件" name="typeLxCs">
                <a-select v-model:value="formData.typeLxCs" placeholder="条件" :options="type_lx_csOptions" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="值" name="value1">
                <a-input v-model:value="formData.value1" placeholder="值" />
              </a-form-item>
            </a-col>
          </template>
          <a-col :span="24">
            <a-form-item label="状态" name="isqy">
              <a-select
                v-model:value="formData.isqy"
                placeholder="状态"
                :options="[
                  { label: '启用', value: 1 },
                  { label: '停用', value: 0 },
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="趋势/备注" name="trend">
              <a-textarea v-model:value="formData.trend" placeholder="趋势/备注" :rows="3" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <!-- 预警规则配置区域 -->
      <a-divider orientation="left">预警规则配置</a-divider>

      <div class="warning-rules-section">
        <div class="warning-rules-header">
          <a-button type="primary" size="small" @click="handleAddWarningRule">
            <template #icon><AlertOutlined /></template>
            新增预警规则
          </a-button>
        </div>

        <!-- 预警规则列表 -->
        <div v-if="warningRulesList && warningRulesList.length > 0" class="warning-rules-list">
          <a-table :columns="warningRulesColumns" :data-source="warningRulesList" :pagination="false" size="small" bordered row-key="id">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'warningLevel'">
                <a-tag :color="getWarningLevelColor(record.warningLevel)">
                  {{ getWarningLevelText(record.warningLevel) }}
                </a-tag>
              </template>
              <template v-if="column.key === 'thresholdType'">
                <span>{{ getThresholdTypeText(record.thresholdType) }}</span>
              </template>
              <template v-if="column.key === 'warningStatus'">
                <span>{{ getWarningStatusText(record.warningStatus) }}</span>
              </template>
              <template v-if="column.key === 'comparisonType'">
                <span>{{ getComparisonTypeText(record.comparisonType) }}</span>
              </template>
              <template v-if="column.key === 'effectiveStartTime'">
                <span>{{ record.effectiveStartTime || '未设置' }}</span>
              </template>
              <template v-if="column.key === 'effectiveEndTime'">
                <span>{{ record.effectiveEndTime || '未设置' }}</span>
              </template>
              <template v-if="column.key === 'status'">
                <a-switch v-model:checked="record.status" :checked-value="1" :un-checked-value="0" size="small" />
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="handleEditWarningRule(record)"> 编辑 </a-button>
                  <a-popconfirm title="确定要删除这条预警规则吗？" @confirm="handleDeleteWarningRule(record)">
                    <a-button type="link" size="small" danger> 删除 </a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>

        <div v-else class="warning-rules-empty">
          <a-empty description="暂无预警规则" />
        </div>
      </div>
    </a-modal>

    <!-- 预警配置弹窗 -->
    <a-modal
      v-model:open="warningConfigVisible"
      title="预警规则配置"
      width="800px"
      :confirm-loading="warningConfirmLoading"
      @ok="handleWarningSubmit"
      @cancel="handleWarningCancel"
    >
      <a-form ref="warningFormRef" :model="warningFormData" :rules="warningFormRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <!-- 基本信息 -->
        <a-divider orientation="left">基本信息</a-divider>

        <a-form-item label="指标名称" name="indicatorId">
          <a-input v-model:value="indicator_name" disabled />
        </a-form-item>

        <a-form-item label="规则名称" name="ruleName">
          <a-input v-model:value="warningFormData.ruleName" placeholder="请输入规则名称" />
        </a-form-item>

        <a-form-item label="规则描述" name="description">
          <a-textarea v-model:value="warningFormData.description" placeholder="请输入规则描述" :rows="3" />
        </a-form-item>

        <!-- 阈值配置 -->
        <a-divider orientation="left">阈值配置</a-divider>

        <!-- 阈值模式时显示参考值相关字段 -->
        <template v-if="formData.targetCategory === 'threshold'">
          <a-form-item label="参考值类型" name="referenceType">
            <a-select v-model:value="warningFormData.referenceType" placeholder="当前表单类型" @change="handleReferenceTypeChange" disabled>
              <a-select-option v-for="option in type_lxOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </a-select-option>
            </a-select>
            <!-- <div class="form-help-text">参考值类型来源于当前指标值表单中的设置</div> -->
          </a-form-item>

          <a-form-item label="参考数据" name="referenceDataId">
            <a-select v-model:value="warningFormData.referenceDataId" placeholder="当前表单数据" @change="handleReferenceDataChange" disabled>
              <a-select-option v-for="data in referenceDataList" :key="data.id" :value="data.id">
                {{ data.value1 || '未设置' }}
              </a-select-option>
            </a-select>
            <!-- <div class="form-help-text">参考数据来源于当前指标值表单中的设置</div> -->
          </a-form-item>
        </template>

        <!-- 当前表单为阈值模式时显示阈值配置 -->
        <template v-if="formData.targetCategory === 'threshold'">
          <a-form-item label="阈值条件" name="thresholdType">
            <a-select v-model:value="warningFormData.thresholdType" placeholder="自动带出阈值条件" disabled="">
              <a-select-option v-for="option in type_lx_csOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </a-select-option>
            </a-select>
            <div class="form-help-text">阈值条件将根据参考数据自动带出</div>
          </a-form-item>

          <a-form-item v-if="warningFormData.referenceType === 'custom'" label="阈值" name="thresholdValue">
            <a-input-number v-model:value="warningFormData.thresholdValue" placeholder="请输入阈值" style="width: 100%" />
          </a-form-item>

          <a-form-item v-else label="阈值偏差" name="thresholdOffset">
            <a-input-group compact>
              <!-- <a-select v-model:value="warningFormData.offsetType" style="width: 30%">
                <a-select-option value="percent">百分比</a-select-option>
                <a-select-option value="absolute">绝对值</a-select-option>
              </a-select> -->
              <a-input-number v-model:value="warningFormData.thresholdOffset" placeholder="偏差值" style="width: 100%" />
            </a-input-group>
            <div class="form-help-text">例如：参考值100，偏差-10，则阈值为90</div>
          </a-form-item>
        </template>

        <!-- 当前表单为趋势导向时显示说明 -->
        <template v-else-if="formData.targetCategory === 'trend'">
          <a-form-item label="阈值说明">
            <a-alert
              message="当前指标为趋势导向模式"
              description="趋势导向模式不需要设置具体的阈值条件，预警将基于趋势变化进行判断。"
              type="info"
              show-icon
            />
          </a-form-item>
        </template>

        <!-- 预警配置 -->
        <a-divider orientation="left">预警配置</a-divider>

        <a-form-item label="取数方法" name="fetchDataMethod">
          <a-select v-model:value="warningFormData.fetchDataMethod" placeholder="请选择取数方法">
            <a-select-option value="preMonth">上个月</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="对比类型" name="comparisonType">
          <a-select v-model:value="warningFormData.comparisonType" placeholder="请选择对比类型">
            <a-select-option value="yoy">同比</a-select-option>
            <a-select-option value="mom">环比</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="预警级别" name="warningLevel">
          <a-select v-model:value="warningFormData.warningLevel" placeholder="请选择预警级别">
            <a-select-option value="low">低级</a-select-option>
            <a-select-option value="medium">中级</a-select-option>
            <a-select-option value="high">高级</a-select-option>
            <a-select-option value="critical">严重</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="预警状态" name="warningStatus">
          <a-select v-model:value="warningFormData.warningStatus" placeholder="请选择预警状态">
            <a-select-option value="trend_exception">数据趋势异常</a-select-option>
            <a-select-option value="threshold_exception">阈值超限</a-select-option>
            <a-select-option value="quality_exception">质量异常</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 通知策略 -->
        <a-divider orientation="left">通知策略</a-divider>

        <a-form-item label="通知策略" name="notificationStrategy">
          <a-select v-model:value="warningFormData.notificationStrategy" placeholder="请选择通知策略">
            <a-select-option value="once">仅通知一次</a-select-option>
            <a-select-option value="repeat">重复通知</a-select-option>
            <!-- <a-select-option value="escalate">升级通知</a-select-option> -->
          </a-select>
        </a-form-item>

        <a-form-item v-if="warningFormData.notificationStrategy === 'repeat'" label="重复间隔" name="repeatInterval">
          <a-input-group compact>
            <a-input-number v-model:value="warningFormData.repeatInterval" placeholder="间隔时间" style="width: 70%" />
            <a-select v-model:value="warningFormData.repeatUnit" style="width: 30%">
              <a-select-option value="minutes">分钟</a-select-option>
              <a-select-option value="hours">小时</a-select-option>
              <a-select-option value="days">天</a-select-option>
            </a-select>
          </a-input-group>
        </a-form-item>

        <a-form-item label="生效时间" name="effectiveTime">
          <a-range-picker v-model:value="warningFormData.effectiveTime" show-time format="YYYY-MM-DD HH:mm:ss" />
        </a-form-item>

        <a-form-item label="通知方式" name="notificationMethods">
          <a-checkbox-group v-model:value="warningFormData.notificationMethods">
            <a-checkbox value="system">系统消息</a-checkbox>
            <a-checkbox value="email">邮件通知</a-checkbox>
            <a-checkbox value="sms">短信通知</a-checkbox>
            <a-checkbox value="webhook">Webhook</a-checkbox>
          </a-checkbox-group>
        </a-form-item>

        <a-form-item label="启用状态" name="status">
          <a-switch v-model:checked="warningFormData.status" :checked-value="1" :un-checked-value="0" />
          <span style="margin-left: 8px">
            {{ warningFormData.status ? '启用' : '禁用' }}
          </span>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, computed, watch } from 'vue';
  import { message, Modal as AntdModal, Popconfirm as APopconfirm } from 'ant-design-vue';
  import { SearchOutlined, PlusOutlined, AlertOutlined } from '@ant-design/icons-vue';
  import { indicatorTargetApi } from '/@/api/business/rating/indicator/target/index';
  import { indicatorDepartmentApi } from '/@/api/business/rating/indicator/department/index';
  import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
  import GenericTreeSelect from '/@/components/business/common/tree-select/generic-tree-select.vue';
  import dayjs from 'dayjs';
  import { departmentApi } from '/@/api/system/department-api.js';
  import SmartEnumSelect from '/@/components/framework/smart-enum-select/index.vue';

  // Props
  const props = defineProps({
    indicatorId: {
      type: [String, Number],
      default: null,
    },
  });

  // 表格列定义
  const columns = [
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
    },
    {
      title: '科室',
      dataIndex: 'department',
      width: 100,
      align: 'center',
    },
    {
      title: '年份',
      dataIndex: 'year',
      width: 80,
      align: 'center',
    },
    {
      title: '月度/季度',
      dataIndex: 'serialNum',
      width: 120,
      align: 'center',
    },
    {
      title: '分类',
      dataIndex: 'targetCategory',
      width: 120,
      align: 'center',
      customRender: ({ text }) => {
        const typeMap = { trend: '趋势导向', threshold: '阈值' };
        return typeMap[text] || text;
      },
    },
    {
      title: '趋势',
      dataIndex: 'trendValue',
      width: 120,
      align: 'center',
      customRender: ({ text }) => {
        const typeMap = { 1: '逐步升高', 2: '逐步降低' };
        return typeMap[text] || text;
      },
    },
    {
      title: '类型',
      dataIndex: 'typeLx',
      width: 100,
      align: 'center',
      customRender: ({ text }) => {
        const typeMap = { 1: '参考值', 2: '标杆值', 3: '中位值' };
        return typeMap[text] || text;
      },
    },
    {
      title: '值类型',
      dataIndex: 'typeLxCs',
      width: 100,
      align: 'center',
      customRender: ({ text }) => {
        const typeMap = { 1: '大于', 2: '大于等于', 3: '小于', 4: '小于等于', 5: '等于' };
        return typeMap[text] || text;
      },
    },
    {
      title: '值',
      dataIndex: 'value1',
      width: 100,
      align: 'center',
    },
    {
      title: '趋势/备注',
      dataIndex: 'trend',
      width: 150,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'isqy',
      key: 'isqy',
      width: 80,
      align: 'center',
    },
  ];

  // 响应式数据
  const tableData = ref([]);
  const tableLoading = ref(false);
  const departmentOptions = ref([]);
  const indicator_name = ref('');
  const year = dayjs().year().toString();

  // 分页状态
  const paginationState = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100'],
    size: 'default',
  });

  // 表单数据
  const formData = reactive({
    id: undefined,
    indicatorId: undefined,
    department: undefined,
    year: year,
    serialNum: '19',
    value1: undefined,
    trend: undefined,
    isqy: 1,
    typeLx: 1,
    typeLxCs: 1,
    targetCategory: 'trend', // 默认为趋势导向
    trendValue: 1, // 默认逐步升高
    warningRulesList: [],
  });

  const loading = ref(false);
  const open = ref(false);

  // 搜索表单数据
  const searchFormState = reactive({
    indicatorId: undefined,
    department: undefined,
    year: year,
    serialNum: '19',
    typeLx: undefined
  });

  // 选项数据
  const serial_numOptions = ref([]);
  const type_lxOptions = ref([]);
  const type_lx_csOptions = ref([]);

  // 预警配置相关数据
  const warningConfigVisible = ref(false);
  const warningConfirmLoading = ref(false);
  const formRef = ref();
  const warningFormRef = ref();
  const referenceDataList = ref([]);
  const warningRulesList = ref([]);

  // 动态预警规则表格列定义
  const warningRulesColumns = computed(() => {
    const baseColumns = [
      {
        title: '规则名称',
        dataIndex: 'ruleName',
        key: 'ruleName',
        width: 120,
        align: 'center',
      },
    ];

    // 根据主表单分类动态添加列
    if (formData.targetCategory === 'threshold') {
      // 阈值模式显示阈值相关列
      baseColumns.push(
        {
          title: '阈值条件',
          dataIndex: 'thresholdType',
          key: 'thresholdType',
          width: 100,
          align: 'center',
        },
        {
          title: '阈值',
          dataIndex: 'threshold',
          key: 'threshold',
          width: 100,
          align: 'center',
        }
      );
    } else if (formData.targetCategory === 'trend') {
      // 趋势导向模式显示趋势相关列
      baseColumns.push(
        {
          title: '预警状态',
          dataIndex: 'warningStatus',
          key: 'warningStatus',
          width: 140,
          align: 'center',
          customRender: ({ text }) => {
            const statusMap = {
              trend_exception: '数据趋势异常',
              threshold_exception: '阈值超限',
              quality_exception: '质量异常',
            };
            return statusMap[text] || text;
          },
        },
        {
          title: '对比类型',
          dataIndex: 'comparisonType',
          key: 'comparisonType',
          width: 100,
          align: 'center',
          customRender: ({ text }) => {
            const typeMap = {
              yoy: '同比',
              mom: '环比',
            };
            return typeMap[text] || text;
          },
        }
      );
    }

    // 添加通用列
    baseColumns.push(
      {
        title: '预警级别',
        dataIndex: 'warningLevel',
        key: 'warningLevel',
        width: 80,
        align: 'center',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        align: 'center',
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        align: 'center',
      }
    );

    return baseColumns;
  });

  // 预警表单数据
  const warningFormData = reactive({
    id: undefined,
    indicatorId: undefined,
    ruleName: '',
    description: '',
    referenceType: 1,
    referenceDataId: undefined,
    thresholdType: undefined,
    thresholdValue: undefined,
    thresholdOffset: undefined,
    offsetType: 'percent',
    comparisonType: 'yoy',
    fetchDataMethod: 'preMonth',
    warningLevel: 'medium',
    warningStatus: 'trend_exception',
    notificationStrategy: 'once',
    effectiveTime: undefined,
    effectiveStartTime: undefined,
    effectiveEndTime: undefined,
    repeatInterval: undefined,
    repeatUnit: undefined,
    notificationMethods: ['system'],
    status: 1,
  });

  // 动态表单验证规则
  const formRules = computed(() => {
    const baseRules = {
      department: [{ required: true, message: '请选择科室' }],
      year: [{ required: true, message: '请选择年份' }],
      serialNum: [{ required: true, message: '请选择月度/季度' }],
      isqy: [{ required: true, message: '请选择状态' }],
      targetCategory: [{ required: true, message: '请选择分类' }],
    };

    // 根据分类动态添加验证规则
    if (formData.targetCategory === 'trend') {
      baseRules.trendValue = [{ required: true, message: '请选择趋势' }];
    } else if (formData.targetCategory === 'threshold') {
      baseRules.typeLx = [{ required: true, message: '请选择值类型' }];
      baseRules.typeLxCs = [{ required: true, message: '请选择条件' }];
      baseRules.value1 = [{ required: true, message: '请输入值' }];
    }

    return baseRules;
  });

  // 预警表单验证规则
  const warningFormRules = computed(() => {
    const baseRules = {
      ruleName: [{ required: true, message: '请输入规则名称' }],
      comparisonType: [{ required: true, message: '请选择对比类型' }],
      warningStatus: [{ required: true, message: '请选择预警状态' }],
      warningLevel: [{ required: true, message: '请选择预警级别' }],
      fetchDataMethod: [{ required: true, message: '请选择取数方法' }],
      notificationStrategy: [{ required: true, message: '请选择通知策略' }],
      notificationMethods: [{ required: true, message: '请选择通知方式' }],
      effectiveTime: [{ required: true, message: '请选择生效时间' }],
      status: [{ required: true, message: '请设置启用状态' }],
    };

    // 根据主表单的分类动态添加验证规则
    if (formData.targetCategory === 'threshold') {
      // 阈值模式需要参考值和阈值相关字段
      baseRules.referenceType = [{ required: true, message: '请选择参考值类类型' }];
      baseRules.referenceDataId = [{ required: true, message: '请选择参考数据' }];
      baseRules.thresholdType = [{ required: true, message: '请选择阈值条件' }];
    }
    // 趋势导向模式不需要参考值和阈值相关字段的验证

    return baseRules;
  });

  // 加载指标信息
  const loadIndicatorInfo = async () => {
    if (!props.indicatorId) return;

    try {
      const res = await indicatorManageApi.queryIndicatorById(props.indicatorId);
      if (res.ok && res.data) {
        indicator_name.value = res.data.indicatorName || '';
        searchFormState.indicatorId = props.indicatorId;
        formData.indicatorId = props.indicatorId;
      }
    } catch (error) {
      console.error('加载指标信息失败:', error);
    }
  };

  // 初始化加载
  onMounted(async () => {
    // await loadDepartments();
    await loadOptions();
    if (props.indicatorId) {
      console.log('指标值页面,indicatorId:' + props.indicatorId);
      await loadIndicatorInfo();
      await queryData(); // 添加初始数据查询
    }
  });

  // 监听 indicatorId 变化
  watch(
    () => props.indicatorId,
    async (newId) => {
      if (newId) {
        await loadIndicatorInfo();
        await queryData();
      } else {
        tableData.value = [];
        indicator_name.value = '';
      }
    },
    { immediate: true }
  );

  // 加载科室数据
  const loadDepartments = async () => {
    try {
      const res = await departmentApi.queryDepartmentTree();
      if (res.ok && res.data) {
        departmentOptions.value = res.data.map((item) => ({
          value: item.departmentId,
          label: item.name,
        }));
      }
    } catch (error) {
      console.error('加载科室数据失败:', error);
    }
  };

  // 加载选项数据
  const loadOptions = async () => {
    // 月度/季度选项
    serial_numOptions.value = [
      { label: '1月', value: '1' },
      { label: '2月', value: '2' },
      { label: '3月', value: '3' },
      { label: '4月', value: '4' },
      { label: '5月', value: '5' },
      { label: '6月', value: '6' },
      { label: '7月', value: '7' },
      { label: '8月', value: '8' },
      { label: '9月', value: '9' },
      { label: '10月', value: '10' },
      { label: '11月', value: '11' },
      { label: '12月', value: '12' },
      { label: '第一季度', value: '13' },
      { label: '第二季度', value: '14' },
      { label: '第三季度', value: '15' },
      { label: '第四季度', value: '16' },
      { label: '上半年', value: '17' },
      { label: '下半年', value: '18' },
      { label: '全年', value: '19' },
    ];

    // 类型选项
    type_lxOptions.value = [
      { label: '参考值', value: 1 },
      { label: '标杆值', value: 2 },
      { label: '中位值', value: 3 },
    ];

    // 值类型选项
    type_lx_csOptions.value = [
      { label: '大于', value: 1 },
      { label: '大于等于', value: 2 },
      { label: '小于', value: 3 },
      { label: '小于等于', value: 4 },
      { label: '等于', value: 5 },
    ];
  };

  // 获取周期标签
  const getLabelByPeriodValue = (value) => {
    const option = serial_numOptions.value.find((item) => item.value === value);
    return option ? option.label : value;
  };

  // 分类变化处理函数
  const handleCategoryChange = (value) => {
    console.log('分类发生变化:', value);

    // 当分类改变时，清空相关字段
    if (value === 'trend') {
      // 切换到趋势导向，清空阈值相关字段
      formData.typeLx = undefined;
      formData.typeLxCs = undefined;
      formData.value1 = undefined;
    } else if (value === 'threshold') {
      // 切换到阈值，清空趋势字段
      formData.trendValue = formData.trendValue | 1;
      // 设置阈值字段的默认值
      formData.typeLx = formData.typeLx || 1;
      formData.typeLxCs = formData.typeLxCs || 1;
    }

    console.log('分类变化后的表单数据:', {
      targetCategory: formData.targetCategory,
      trendValue: formData.trendValue,
      typeLx: formData.typeLx,
      typeLxCs: formData.typeLxCs,
      value1: formData.value1,
    });
  };

  // 频率变化处理
  const onFrequencyChange = () => {
    queryData();
  };

  // 查询数据
  const queryData = async () => {
    if (!props.indicatorId) {
      tableData.value = [];
      paginationState.total = 0;
      return;
    }

    tableLoading.value = true;
    try {
      const params = {
        pageNum: paginationState.current,
        pageSize: paginationState.pageSize,
        indicatorId: props.indicatorId,
        year: searchFormState.year,
        serialNum: searchFormState.serialNum,
        typeLx: searchFormState.typeLx,
        targetCategory: formData.targetCategory,
        department: formData.department,
      };

      console.log("query params:",params);

      const res = await indicatorTargetApi.queryPage(params);
      if (res.ok) {
        tableData.value = res.data.list || [];
        paginationState.total = res.data.total || 0;
        console.log('查询结果:', {
          数据条数: tableData.value.length,
          总数: paginationState.total,
          当前页: paginationState.current,
          页大小: paginationState.pageSize
        });
      } else {
        message.error(res.msg || '获取数据失败');
        tableData.value = [];
        paginationState.total = 0;
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败');
      tableData.value = [];
      paginationState.total = 0;
    } finally {
      tableLoading.value = false;
    }
  };

  // 搜索处理
  const handleSearch = () => {
    paginationState.current = 1;
    queryData();
  };

  // 新增处理
  const handleAdd = () => {
    console.log('新增按钮被点击，开始初始化表单数据');

    // 重置表单数据
    Object.assign(formData, {
      id: undefined,
      indicatorId: props.indicatorId,
      department: undefined,
      year: year,
      serialNum: '19',
      value1: undefined,
      trend: undefined,
      isqy: 1,
      typeLx: 1,
      typeLxCs: 1,
      targetCategory: 'trend', // 默认为趋势导向
      trendValue: 1,
      warningRulesList: [],
    });

    // 初始化预警规则列表为空数组
    warningRulesList.value = [];

    console.log('表单数据初始化完成，warningRulesList初始化为空数组:', {
      formData: formData,
      warningRulesListLength: warningRulesList.value.length,
    });

    // 打开模态框
    open.value = true;
  };

  // 表格变化处理
  const handleTableChange = (pagination) => {
    paginationState.current = pagination.current;
    paginationState.pageSize = pagination.pageSize;
    queryData();
  };

  // 编辑处理
  const handleEdit = (record) => {
    console.log('编辑按钮被点击，record:', record);

    Object.assign(formData, {
      id: record.id,
      indicatorId: record.indicatorId,
      department: record.department,
      year: record.year,
      serialNum: record.serialNum,
      value1: record.value1,
      trend: record.trend,
      isqy: record.isqy,
      typeLx: record.typeLx,
      typeLxCs: record.typeLxCs,
      targetCategory: record.targetCategory || 'trend',
      trendValue: record.trendValue,
      warningRulesList: record.warningRulesList,
    });

    // 确保warningRulesList始终是数组
    warningRulesList.value = formData.warningRulesList || [];

    console.log('编辑模式表单数据设置完成:', {
      formData: formData,
      warningRulesListLength: warningRulesList.value.length,
    });

    open.value = true;
  };

  // 删除处理
  const handleDelete = async (id) => {
    try {
      const res = await indicatorTargetApi.delete(id);
      if (res.ok) {
        message.success('删除成功');
        await queryData();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 保存处理
  const save_from = async () => {
    if (!props.indicatorId) {
      message.error('请先选择指标');
      return;
    }

    // 表单验证
    try {
      await formRef.value.validate();
    } catch (error) {
      message.error('请检查表单填写');
      return;
    }

    loading.value = true;
    try {
      formData.indicatorId = props.indicatorId;

      // 如果是趋势导向分类，则无需传递阈值相关参数，否则无需传递趋势相关参数
      if (formData.targetCategory == 'trend') {
        formData.typeLx = undefined;
        formData.typeLxCs = undefined;
      } else {
        formData.trendValue = undefined;
      }

      // 将预警规则列表添加到表单数据中
      const submitData = {
        ...formData,
        warningRulesList: warningRulesList.value || [],
      };

      console.log('保存数据，包含预警规则:', {
        基础数据: formData,
        预警规则数量: warningRulesList.value.length,
        预警规则列表: warningRulesList.value,
        完整提交数据: submitData,
      });

      const res = formData.id ? await indicatorTargetApi.update(submitData) : await indicatorTargetApi.add(submitData);

      if (res.ok) {
        message.success(
          `${formData.id ? '更新' : '添加'}成功${warningRulesList.value.length > 0 ? `，包含${warningRulesList.value.length}条预警规则` : ''}`
        );
        open.value = false;
        await queryData();

        // 重置表单和预警规则列表
        Object.assign(formData, {
          id: undefined,
          indicatorId: props.indicatorId,
          department: undefined,
          year: year,
          serialNum: '19',
          value1: undefined,
          trend: undefined,
          isqy: 1,
          typeLx: 1,
          typeLxCs: 1,
        });

        // 清空预警规则列表
        warningRulesList.value = [];
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    } finally {
      loading.value = false;
    }
  };

  // 预警配置相关方法
  const handleReferenceTypeChange = () => {
    warningFormData.referenceDataId = undefined;
    warningFormData.thresholdValue = undefined;
    warningFormData.thresholdOffset = undefined;
    loadReferenceDataFromCurrentForm();
  };

  // 从当前表单数据中加载参考数据，而不是从接口获取
  const loadReferenceDataFromCurrentForm = () => {
    if (!props.indicatorId) {
      referenceDataList.value = [];
      return;
    }

    // 直接使用当前modal面板中的表单数据作为参考数据
    const currentFormData = {
      id: 'current_form_data', // 使用特殊ID标识当前表单数据
      indicatorId: props.indicatorId,
      department: formData.department,
      year: formData.year,
      serialNum: formData.serialNum,
      typeLx: formData.typeLx,
      typeLxCs: formData.typeLxCs,
      value1: formData.value1,
      unit: '', // 可以根据需要添加单位
    };

    // 构建参考数据列表，只包含当前表单数据
    referenceDataList.value = [currentFormData];

    // 自动设置参考值类型（直接使用当前表单的类型）
    warningFormData.referenceType = formData.typeLx;

    // 自动选择当前表单数据作为参考数据
    warningFormData.referenceDataId = currentFormData.id;

    // 如果是阈值分类情况下，自动设置阈值条件（直接使用当前表单的值类型）
    if (formData.targetCategory === 'threshold') {
      warningFormData.thresholdType = formData.typeLxCs;
    }

    console.log('使用当前表单数据作为参考数据:', {
      referenceType: formData.typeLx,
      referenceDataId: currentFormData.id,
      thresholdType: formData.typeLxCs,
      currentFormData: currentFormData,
    });
  };

  // 处理参考数据变更（现在只有一个选项，即当前表单数据）
  const handleReferenceDataChange = (referenceDataId) => {
    if (!referenceDataId) {
      warningFormData.thresholdType = undefined;
      return;
    }

    // 由于只有当前表单数据作为参考，直接使用表单中的值类型
    if (referenceDataId === 'current_form_data') {
      warningFormData.thresholdType = formData.typeLxCs;

      console.log('使用当前表单数据，自动更新阈值条件:', {
        referenceDataId: referenceDataId,
        thresholdType: formData.typeLxCs,
        formData: formData,
      });
    }
  };

  const handleWarningSubmit = async () => {
    if (!props.indicatorId) {
      message.error('请先选择指标');
      return;
    }

    try {
      await warningFormRef.value.validate();
      warningConfirmLoading.value = true;

      const submitData = {
        ...warningFormData,
        indicatorId: props.indicatorId,
      };

      // 处理生效时间拆分
      if (submitData.effectiveTime && Array.isArray(submitData.effectiveTime) && submitData.effectiveTime.length === 2) {
        // 将生效时间拆分为开始时间和结束时间
        submitData.effectiveStartTime = submitData.effectiveTime[0] ? dayjs(submitData.effectiveTime[0]).format('YYYY-MM-DD HH:mm:ss') : null;
        submitData.effectiveEndTime = submitData.effectiveTime[1] ? dayjs(submitData.effectiveTime[1]).format('YYYY-MM-DD HH:mm:ss') : null;

        console.log('生效时间拆分结果:', {
          原始时间: submitData.effectiveTime,
          开始时间: submitData.effectiveStartTime,
          结束时间: submitData.effectiveEndTime,
        });
      } else {
        submitData.effectiveStartTime = null;
        submitData.effectiveEndTime = null;
      }

      // 计算阈值显示文本
      let thresholdText = formData.value1;
      if (submitData.referenceType === 'custom') {
        thresholdText = submitData.thresholdValue?.toString() || '';
      } else {
        const offsetText = submitData.offsetType === 'percent' ? '%' : '';
        thresholdText = `${submitData.thresholdOffset || 0}${offsetText}`;
      }

      // 确保 ID 正确设置
      const ruleId = submitData.id;

      // 创建一个不包含 undefined id 的数据副本
      const { id: _, effectiveTime, ...submitDataWithoutId } = submitData;

      // 添加到预警规则列表
      const newRule = {
        ...submitDataWithoutId,
        id: ruleId, // 使用确定的 ID 值
        threshold: calculateFinalValue(),
        createTime: new Date().toLocaleString(),
      };

      if (submitData.id) {
        // 编辑模式：更新现有规则
        const index = warningRulesList.value.findIndex((item) => item.id === submitData.id);
        if (index > -1) {
          warningRulesList.value[index] = newRule;
        }
      } else {
        // 新增模式：添加到列表
        warningRulesList.value.push(newRule);
      }

      // 这里应该调用实际的预警配置API
      // const res = await warningConfigApi.save(submitData);

      // 模拟API调用
      console.log('保存预警配置:', newRule);

      message.success('预警配置保存成功');
      warningConfigVisible.value = false;
      resetWarningFormData();
    } catch (error) {
      if (error.errorFields) {
        message.error('请检查表单填写');
      } else {
        message.error('保存失败：' + error.message);
      }
    } finally {
      warningConfirmLoading.value = false;
    }
  };

  /**
   * 计算最终阈值
   */
  const calculateFinalValue = () => {
    // 处理原始值（formData.value1）
    const originalValue = formData.value1?.toString().trim() || '';
    // 处理偏差值（输入框输入的内容）
    const deviationNum = parseFloat(warningFormData.thresholdOffset);

    // 校验输入有效性
    if (isNaN(deviationNum)) {
      console.error('偏差值必须是有效数字');
      return formData.value1;
    }
    if (!originalValue) {
      console.error('原始值不能为空');
      return null;
    }

    // 判断原始值是百分比还是绝对值
    const isPercentage = originalValue.includes('%');
    let baseValue;

    // 解析原始值为数字
    if (isPercentage) {
      // 百分比：去掉%并转换为小数（如 "50%" → 0.5）
      baseValue = parseFloat(originalValue.replace('%', '')) / 100;
    } else {
      // 绝对值：直接转换为数字（如 "100" → 100）
      baseValue = parseFloat(originalValue);
    }

    if (isNaN(baseValue)) {
      console.error('原始值格式无效');
      return null;
    }

    // 计算偏差后的值（这里以「原始值 + 偏差值」为例，可根据需求改为减法）
    let finalValue;
    if (isPercentage) {
      // 百分比计算：偏差值按百分比处理（如偏差输入10 → 10% → 0.1）
      finalValue = (baseValue + deviationNum / 100) * 100; // 转回百分比数值
      return `${finalValue.toFixed(2)}%`; // 保留2位小数，加%
    } else {
      // 绝对值计算：偏差值直接加减
      finalValue = baseValue + deviationNum;
      return finalValue.toFixed(2); // 保留2位小数（根据需求调整）
    }
  };

  const handleWarningCancel = () => {
    warningConfigVisible.value = false;
    resetWarningFormData();
  };

  const resetWarningFormData = () => {
    Object.assign(warningFormData, {
      id: undefined,
      indicatorId: props.indicatorId,
      ruleName: '',
      description: '',
      referenceType: 1,
      referenceDataId: undefined,
      thresholdType: undefined,
      thresholdValue: undefined,
      thresholdOffset: undefined,
      offsetType: 'percent',
      warningLevel: 'medium',
      fetchDataMethod: 'preMonth',
      notificationStrategy: 'once',
      repeatInterval: undefined,
      repeatUnit: undefined,
      notificationMethods: ['system'],
      status: 1,
    });
    referenceDataList.value = [];
  };

  // 预警规则相关方法
  const handleAddWarningRule = () => {
    resetWarningFormData();
    warningConfigVisible.value = true;
  };

  const handleEditWarningRule = (record) => {
    // 复制记录数据
    Object.assign(warningFormData, record);

    // 处理生效时间回显：将字符串时间转换为dayjs对象
    if (record.effectiveStartTime && record.effectiveEndTime) {
      warningFormData.effectiveTime = [dayjs(record.effectiveStartTime), dayjs(record.effectiveEndTime)];
    } else {
      warningFormData.effectiveTime = undefined;
    }

    warningConfigVisible.value = true;
  };

  const handleDeleteWarningRule = (record) => {
    const index = warningRulesList.value.findIndex((item) => item.id === record.id);
    if (index > -1) {
      warningRulesList.value.splice(index, 1);
      message.success('删除预警规则成功');
    }
  };

  // 工具函数
  const getWarningLevelColor = (level) => {
    const colors = {
      low: 'blue',
      medium: 'orange',
      high: 'red',
      critical: 'purple',
    };
    return colors[level] || 'default';
  };

  const getWarningLevelText = (level) => {
    const texts = {
      low: '低级',
      medium: '中级',
      high: '高级',
      critical: '严重',
    };
    return texts[level] || level;
  };

  const getThresholdTypeText = (type) => {
    const texts = {
      gt: '大于',
      gte: '大于等于',
      lt: '小于',
      lte: '小于等于',
      eq: '等于',
      ne: '不等于',
      1: '大于',
      2: '大于等于',
      3: '小于',
      4: '小于等于',
      5: '等于',
    };
    return texts[type] || type;
  };

  // 获取预警状态文本
  const getWarningStatusText = (status) => {
    const texts = {
      trend_exception: '数据趋势异常',
      threshold_exception: '阈值超限',
      quality_exception: '质量异常',
    };
    return texts[status] || status;
  };

  // 获取对比类型文本
  const getComparisonTypeText = (type) => {
    const texts = {
      yoy: '同比',
      mom: '环比',
    };
    return texts[type] || type;
  };

  // 获取科室标签
  const getDepartmentLabel = (value) => {
    console.log('value:', value);
    console.log('dept:', departmentOptions.value);

    const option = departmentOptions.value.find((item) => item.value === value);
    return option ? option.label : value || '未设置';
  };

  // 获取类型标签
  const getTypeLxLabel = (value) => {
    const option = type_lxOptions.value.find((item) => item.value === value);
    return option ? option.label : value || '未设置';
  };

  // 监听预警配置弹窗打开
  watch(warningConfigVisible, (visible) => {
    if (visible && props.indicatorId) {
      warningFormData.indicatorId = props.indicatorId;
      loadReferenceDataFromCurrentForm();
    }
  });

  // 暴露给父组件的方法
  const save = async () => {
    // 指标值 tab 不需要特殊的保存逻辑，数据通过表格内的操作进行保存
    // 这里只是为了与其他 tab 保持一致的接口
    message.success('指标值数据已同步');
    return Promise.resolve();
  };

  // 暴露方法给父组件
  defineExpose({
    save,
    queryData,
  });
</script>

<style lang="less" scoped>
  .indicator-target-tab-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px;
    background: #fff;
  }

  .search-form {
    flex-shrink: 0;
    margin-bottom: 16px;
    padding: 16px;
    background-color: #fff;
    border-radius: 6px;

    :deep(.ant-form-item) {
      margin-bottom: 8px;
      margin-right: 8px !important;
    }
  }

  .tab-table {
    display: flex;

    :deep(.ant-table) {
      height: 100%;

      .ant-table-container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .ant-table-header {
        flex-shrink: 0;
      }

      .ant-table-body {
        flex: 1;
        overflow-y: auto;
        overflow-x: auto;
      }

      .ant-table-pagination {
        flex-shrink: 0;
        margin: 16px 0 0 0;
      }
    }
  }

  // 表格样式优化
  :deep(.ant-table) {
    .ant-table-thead > tr > th {
      background: #fafafa;
      font-weight: 600;
      padding: 12px 8px;
      border-bottom: 1px solid #e8e8e8;
    }

    .ant-table-tbody > tr > td {
      padding: 8px;
      border-bottom: 1px solid #f0f0f0;
    }

    .ant-table-tbody > tr:hover > td {
      background-color: #f5f5f5;
    }
  }

  // Modal 样式
  :deep(.ant-modal) {
    .ant-modal-header {
      border-bottom: 1px solid #e8e8e8;
    }

    .ant-modal-body {
      padding: 24px;
    }

    .ant-form-item {
      margin-bottom: 16px;
    }
  }

  // 预警配置表单样式
  .form-help-text {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }

  // 预警规则配置区域样式
  .warning-rules-section {
    margin-top: 16px;

    .warning-rules-header {
      margin-bottom: 12px;
    }

    .warning-rules-list {
      margin-top: 12px;

      :deep(.ant-table) {
        .ant-table-thead > tr > th {
          background: #f8f9fa;
          font-size: 12px;
          padding: 8px;
        }

        .ant-table-tbody > tr > td {
          padding: 8px;
          font-size: 12px;
        }
      }
    }

    .warning-rules-empty {
      padding: 20px;
      text-align: center;
      background: #fafafa;
      border-radius: 4px;
      margin-top: 12px;
    }
  }
</style>
