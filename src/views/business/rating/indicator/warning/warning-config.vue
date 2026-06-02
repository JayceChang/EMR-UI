<template>
  <div class="warning-config-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item>指标预警</a-breadcrumb-item>
        <a-breadcrumb-item>预警配置</a-breadcrumb-item>
      </a-breadcrumb>
      <h2>预警规则配置</h2>
    </div>

    <!-- 查询条件 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="指标名称">
          <a-select
            v-model:value="searchForm.indicatorId"
            placeholder="请选择指标"
            style="width: 200px"
            show-search
            :filter-option="filterOption"
            @change="handleIndicatorChange"
          >
            <a-select-option v-for="indicator in indicatorList" :key="indicator.id" :value="indicator.id">
              {{ indicator.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="年份">
          <a-date-picker v-model:value="searchForm.year" picker="year" placeholder="请选择年份" />
        </a-form-item>
        <a-form-item label="预警状态">
          <a-select v-model:value="searchForm.status" placeholder="请选择状态" style="width: 120px">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="1">启用</a-select-option>
            <a-select-option value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <SearchOutlined />
            查询
          </a-button>
          <a-button @click="handleReset" style="margin-left: 8px"> 重置 </a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <a-button type="primary" @click="handleAdd">
        <PlusOutlined />
        新增预警规则
      </a-button>
      <a-button @click="handleBatchDelete" :disabled="!selectedRowKeys.length">
        <DeleteOutlined />
        批量删除
      </a-button>
    </div>

    <!-- 预警规则列表 -->
    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'indicatorName'">
            <a-tag color="blue">{{ record.indicatorName }}</a-tag>
          </template>
          <template v-if="column.key === 'warningLevel'">
            <a-tag :color="getWarningLevelColor(record.warningLevel)">
              {{ getWarningLevelText(record.warningLevel) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'thresholdType'">
            <span>{{ getThresholdTypeText(record.thresholdType) }}</span>
          </template>
          <template v-if="column.key === 'notificationStrategy'">
            <span>{{ getNotificationStrategyText(record.notificationStrategy) }}</span>
          </template>
          <template v-if="column.key === 'status'">
            <a-switch v-model:checked="record.status" :checked-value="1" :un-checked-value="0" @change="handleStatusChange(record)" />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)"> 编辑 </a-button>
              <a-button type="link" size="small" @click="handleTest(record)"> 测试 </a-button>
              <a-popconfirm title="确定要删除这条预警规则吗？" @confirm="handleDelete(record)">
                <a-button type="link" size="small" danger> 删除 </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 预警规则配置弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="800px"
      :confirm-loading="confirmLoading"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form ref="formRef" :model="formData" :rules="formRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <!-- 基本信息 -->
        <a-divider orientation="left">基本信息</a-divider>

        <a-form-item label="指标名称" name="indicatorId">
          <a-select
            v-model:value="formData.indicatorId"
            placeholder="请选择指标"
            show-search
            :filter-option="filterOption"
            @change="handleFormIndicatorChange"
          >
            <a-select-option v-for="indicator in indicatorList" :key="indicator.id" :value="indicator.id">
              {{ indicator.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="规则名称" name="ruleName">
          <a-input v-model:value="formData.ruleName" placeholder="请输入规则名称" />
        </a-form-item>

        <a-form-item label="规则描述" name="description">
          <a-textarea v-model:value="formData.description" placeholder="请输入规则描述" :rows="3" />
        </a-form-item>

        <!-- 阈值配置 -->
        <a-divider orientation="left">阈值配置</a-divider>

        <a-form-item label="参考值类型" name="referenceType">
          <a-select v-model:value="formData.referenceType" placeholder="请选择参考值类型" @change="handleReferenceTypeChange">
            <a-select-option value="target">目标值</a-select-option>
            <a-select-option value="reference">参考值</a-select-option>
            <a-select-option value="custom">自定义值</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="formData.referenceType !== 'custom'" label="参考数据" name="referenceDataId">
          <a-select v-model:value="formData.referenceDataId" placeholder="请选择参考数据" :disabled="!formData.indicatorId">
            <a-select-option v-for="data in referenceDataList" :key="data.id" :value="data.id">
              {{ data.year }}年 {{ data.period }} - {{ data.value }}{{ data.unit }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="阈值条件" name="thresholdType">
          <a-select v-model:value="formData.thresholdType" placeholder="请选择阈值条件">
            <a-select-option value="gt">大于</a-select-option>
            <a-select-option value="gte">大于等于</a-select-option>
            <a-select-option value="lt">小于</a-select-option>
            <a-select-option value="lte">小于等于</a-select-option>
            <a-select-option value="eq">等于</a-select-option>
            <a-select-option value="ne">不等于</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="formData.referenceType === 'custom'" label="阈值" name="thresholdValue">
          <a-input-number v-model:value="formData.thresholdValue" placeholder="请输入阈值" style="width: 100%" />
        </a-form-item>

        <a-form-item v-else label="阈值偏差" name="thresholdOffset">
          <a-input-group compact>
            <a-select v-model:value="formData.offsetType" style="width: 30%">
              <a-select-option value="percent">百分比</a-select-option>
              <a-select-option value="absolute">绝对值</a-select-option>
            </a-select>
            <a-input-number v-model:value="formData.thresholdOffset" placeholder="偏差值" style="width: 70%" />
          </a-input-group>
          <div class="form-help-text">例如：参考值100，偏差-10%，则阈值为90</div>
        </a-form-item>

        <!-- 预警配置 -->
        <a-divider orientation="left">预警配置</a-divider>

        <a-form-item label="预警级别" name="warningLevel">
          <a-select v-model:value="formData.warningLevel" placeholder="请选择预警级别">
            <a-select-option value="low">低级预警</a-select-option>
            <a-select-option value="medium">中级预警</a-select-option>
            <a-select-option value="high">高级预警</a-select-option>
            <a-select-option value="critical">严重预警</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 通知策略 -->
        <a-divider orientation="left">通知策略</a-divider>

        <a-form-item label="通知策略" name="notificationStrategy">
          <a-select v-model:value="formData.notificationStrategy" placeholder="请选择通知策略">
            <a-select-option value="once">仅通知一次</a-select-option>
            <a-select-option value="repeat">重复通知</a-select-option>
            <a-select-option value="escalate">升级通知</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="formData.notificationStrategy === 'repeat'" label="重复间隔" name="repeatInterval">
          <a-input-group compact>
            <a-input-number v-model:value="formData.repeatInterval" placeholder="间隔时间" style="width: 70%" />
            <a-select v-model:value="formData.repeatUnit" style="width: 30%">
              <a-select-option value="minutes">分钟</a-select-option>
              <a-select-option value="hours">小时</a-select-option>
              <a-select-option value="days">天</a-select-option>
            </a-select>
          </a-input-group>
        </a-form-item>

        <a-form-item label="通知方式" name="notificationMethods">
          <a-checkbox-group v-model:value="formData.notificationMethods">
            <a-checkbox value="system">系统消息</a-checkbox>
            <a-checkbox value="email">邮件通知</a-checkbox>
            <a-checkbox value="sms">短信通知</a-checkbox>
            <a-checkbox value="webhook">Webhook</a-checkbox>
          </a-checkbox-group>
        </a-form-item>

        <a-form-item label="通知人员" name="notificationUsers">
          <a-select v-model:value="formData.notificationUsers" mode="multiple" placeholder="请选择通知人员" show-search :filter-option="filterOption">
            <a-select-option v-for="user in userList" :key="user.id" :value="user.id"> {{ user.name }} ({{ user.email }}) </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="生效时间" name="effectiveTime">
          <a-range-picker v-model:value="formData.effectiveTime" show-time format="YYYY-MM-DD HH:mm:ss" />
        </a-form-item>

        <a-form-item label="启用状态" name="status">
          <a-switch v-model:checked="formData.status" :checked-value="1" :un-checked-value="0" />
          <span style="margin-left: 8px">
            {{ formData.status ? '启用' : '禁用' }}
          </span>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 预警测试弹窗 -->
    <a-modal v-model:open="testModalVisible" title="预警规则测试" width="600px" :footer="null">
      <div class="test-container">
        <a-form layout="vertical">
          <a-form-item label="测试数据">
            <a-input-number v-model:value="testData.value" placeholder="请输入测试值" style="width: 100%" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleRunTest" :loading="testLoading"> 运行测试 </a-button>
          </a-form-item>
        </a-form>

        <div v-if="testResult" class="test-result">
          <a-divider>测试结果</a-divider>
          <a-descriptions bordered size="small">
            <a-descriptions-item label="测试值">{{ testResult.testValue }}</a-descriptions-item>
            <a-descriptions-item label="阈值">{{ testResult.threshold }}</a-descriptions-item>
            <a-descriptions-item label="条件">{{ testResult.condition }}</a-descriptions-item>
            <a-descriptions-item label="是否触发">
              <a-tag :color="testResult.triggered ? 'red' : 'green'">
                {{ testResult.triggered ? '是' : '否' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="预警级别" v-if="testResult.triggered">
              <a-tag :color="getWarningLevelColor(testResult.warningLevel)">
                {{ getWarningLevelText(testResult.warningLevel) }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import dayjs from 'dayjs';

  // 响应式数据
  const loading = ref(false);
  const confirmLoading = ref(false);
  const modalVisible = ref(false);
  const testModalVisible = ref(false);
  const testLoading = ref(false);
  const selectedRowKeys = ref([]);
  const formRef = ref();

  // 搜索表单
  const searchForm = reactive({
    indicatorId: undefined,
    year: undefined,
    status: '',
  });

  // 表格数据
  const tableData = ref([]);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条记录`,
  });

  // 基础数据
  const indicatorList = ref([]);
  const referenceDataList = ref([]);
  const userList = ref([]);

  // 表单数据
  const formData = reactive({
    id: undefined,
    indicatorId: undefined,
    ruleName: '',
    description: '',
    referenceType: 'target',
    referenceDataId: undefined,
    thresholdType: 'lt',
    thresholdValue: undefined,
    thresholdOffset: undefined,
    offsetType: 'percent',
    warningLevel: 'medium',
    notificationStrategy: 'once',
    repeatInterval: 30,
    repeatUnit: 'minutes',
    notificationMethods: ['system'],
    notificationUsers: [],
    effectiveTime: [],
    status: 1,
  });

  // 测试数据
  const testData = reactive({
    value: undefined,
  });
  const testResult = ref(null);

  // 计算属性
  const modalTitle = computed(() => {
    return formData.id ? '编辑预警规则' : '新增预警规则';
  });

  // 表格列配置
  const columns = [
    {
      title: '指标名称',
      dataIndex: 'indicatorName',
      key: 'indicatorName',
      width: 150,
    },
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
      width: 150,
    },
    {
      title: '阈值条件',
      dataIndex: 'thresholdType',
      key: 'thresholdType',
      width: 100,
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      width: 100,
    },
    {
      title: '预警级别',
      dataIndex: 'warningLevel',
      key: 'warningLevel',
      width: 100,
    },
    {
      title: '通知策略',
      dataIndex: 'notificationStrategy',
      key: 'notificationStrategy',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
    },
  ];

  // 表单验证规则
  const formRules = {
    indicatorId: [{ required: true, message: '请选择指标' }],
    ruleName: [{ required: true, message: '请输入规则名称' }],
    thresholdType: [{ required: true, message: '请选择阈值条件' }],
    warningLevel: [{ required: true, message: '请选择预警级别' }],
    notificationStrategy: [{ required: true, message: '请选择通知策略' }],
    notificationMethods: [{ required: true, message: '请选择通知方式' }],
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => {
      selectedRowKeys.value = keys;
    },
  }; // 工具函数
  const filterOption = (input, option) => {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

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
      low: '低级预警',
      medium: '中级预警',
      high: '高级预警',
      critical: '严重预警',
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
    };
    return texts[type] || type;
  };

  const getNotificationStrategyText = (strategy) => {
    const texts = {
      once: '仅通知一次',
      repeat: '重复通知',
      escalate: '升级通知',
    };
    return texts[strategy] || strategy;
  };

  // 事件处理函数
  const handleSearch = () => {
    pagination.current = 1;
    loadTableData();
  };

  const handleReset = () => {
    Object.assign(searchForm, {
      indicatorId: undefined,
      year: undefined,
      status: '',
    });
    handleSearch();
  };

  const handleAdd = () => {
    resetFormData();
    modalVisible.value = true;
  };

  const handleEdit = (record) => {
    Object.assign(formData, {
      ...record,
      effectiveTime: record.effectiveStartTime && record.effectiveEndTime ? [dayjs(record.effectiveStartTime), dayjs(record.effectiveEndTime)] : [],
    });
    loadReferenceData();
    modalVisible.value = true;
  };

  const handleDelete = async (record) => {
    try {
      // 调用删除API
      await deleteWarningRule(record.id);
      message.success('删除成功');
      loadTableData();
    } catch (error) {
      message.error('删除失败：' + error.message);
    }
  };

  const handleBatchDelete = () => {
    if (!selectedRowKeys.value.length) {
      message.warning('请选择要删除的记录');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.value.length} 条记录吗？`,
      onOk: async () => {
        try {
          await batchDeleteWarningRules(selectedRowKeys.value);
          message.success('批量删除成功');
          selectedRowKeys.value = [];
          loadTableData();
        } catch (error) {
          message.error('批量删除失败：' + error.message);
        }
      },
    });
  };

  const handleStatusChange = async (record) => {
    try {
      await updateWarningRuleStatus(record.id, record.status);
      message.success('状态更新成功');
    } catch (error) {
      message.error('状态更新失败：' + error.message);
      // 恢复原状态
      record.status = record.status === 1 ? 0 : 1;
    }
  };

  const handleTest = (record) => {
    testData.value = undefined;
    testResult.value = null;
    testModalVisible.value = true;
    // 保存当前测试的规则
    window.currentTestRule = record;
  };

  const handleTableChange = (pag) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    loadTableData();
  };

  const handleIndicatorChange = () => {
    loadTableData();
  };

  const handleFormIndicatorChange = () => {
    formData.referenceDataId = undefined;
    loadReferenceData();
  };

  const handleReferenceTypeChange = () => {
    formData.referenceDataId = undefined;
    formData.thresholdValue = undefined;
    formData.thresholdOffset = undefined;
    loadReferenceData();
  };

  const handleSubmit = async () => {
    try {
      await formRef.value.validate();
      confirmLoading.value = true;

      const submitData = {
        ...formData,
        effectiveStartTime: formData.effectiveTime[0]?.format('YYYY-MM-DD HH:mm:ss'),
        effectiveEndTime: formData.effectiveTime[1]?.format('YYYY-MM-DD HH:mm:ss'),
      };
      delete submitData.effectiveTime;

      if (formData.id) {
        await updateWarningRule(submitData);
        message.success('更新成功');
      } else {
        await createWarningRule(submitData);
        message.success('创建成功');
      }

      modalVisible.value = false;
      loadTableData();
    } catch (error) {
      if (error.errorFields) {
        message.error('请检查表单填写');
      } else {
        message.error('操作失败：' + error.message);
      }
    } finally {
      confirmLoading.value = false;
    }
  };

  const handleCancel = () => {
    modalVisible.value = false;
    resetFormData();
  };

  const handleRunTest = async () => {
    if (!testData.value) {
      message.warning('请输入测试值');
      return;
    }

    try {
      testLoading.value = true;
      const rule = window.currentTestRule;

      // 模拟测试逻辑
      const result = await testWarningRule({
        ruleId: rule.id,
        testValue: testData.value,
      });

      testResult.value = result;
    } catch (error) {
      message.error('测试失败：' + error.message);
    } finally {
      testLoading.value = false;
    }
  };

  // 数据加载函数
  const loadTableData = async () => {
    try {
      loading.value = true;
      const params = {
        ...searchForm,
        year: searchForm.year?.format('YYYY'),
        current: pagination.current,
        pageSize: pagination.pageSize,
      };

      const response = await getWarningRuleList(params);
      tableData.value = response.data.records;
      pagination.total = response.data.total;
    } catch (error) {
      message.error('加载数据失败：' + error.message);
    } finally {
      loading.value = false;
    }
  };

  const loadIndicatorList = async () => {
    try {
      const response = await getIndicatorList();
      indicatorList.value = response.data;
    } catch (error) {
      message.error('加载指标列表失败：' + error.message);
    }
  };

  const loadReferenceData = async () => {
    if (!formData.indicatorId || formData.referenceType === 'custom') {
      referenceDataList.value = [];
      return;
    }

    try {
      const response = await getReferenceDataList({
        indicatorId: formData.indicatorId,
        type: formData.referenceType,
      });
      referenceDataList.value = response.data;
    } catch (error) {
      message.error('加载参考数据失败：' + error.message);
    }
  };

  const loadUserList = async () => {
    try {
      const response = await getUserList();
      userList.value = response.data;
    } catch (error) {
      message.error('加载用户列表失败：' + error.message);
    }
  };

  const resetFormData = () => {
    Object.assign(formData, {
      id: undefined,
      indicatorId: undefined,
      ruleName: '',
      description: '',
      referenceType: 'target',
      referenceDataId: undefined,
      thresholdType: 'lt',
      thresholdValue: undefined,
      thresholdOffset: undefined,
      offsetType: 'percent',
      warningLevel: 'medium',
      notificationStrategy: 'once',
      repeatInterval: 30,
      repeatUnit: 'minutes',
      notificationMethods: ['system'],
      notificationUsers: [],
      effectiveTime: [],
      status: 1,
    });
    referenceDataList.value = [];
  };

  // API 函数 (需要根据实际后端接口调整)
  const getWarningRuleList = async (params) => {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            records: [
              {
                id: 1,
                indicatorName: '营业收入',
                ruleName: '营收预警规则',
                thresholdType: 'lt',
                threshold: '90%目标值',
                warningLevel: 'medium',
                notificationStrategy: 'repeat',
                status: 1,
                createTime: '2025-01-15 10:30:00',
              },
            ],
            total: 1,
          },
        });
      }, 500);
    });
  };

  const createWarningRule = async (data) => {
    // 实际API调用
    console.log('创建预警规则:', data);
    return Promise.resolve();
  };

  const updateWarningRule = async (data) => {
    // 实际API调用
    console.log('更新预警规则:', data);
    return Promise.resolve();
  };

  const deleteWarningRule = async (id) => {
    // 实际API调用
    console.log('删除预警规则:', id);
    return Promise.resolve();
  };

  const batchDeleteWarningRules = async (ids) => {
    // 实际API调用
    console.log('批量删除预警规则:', ids);
    return Promise.resolve();
  };

  const updateWarningRuleStatus = async (id, status) => {
    // 实际API调用
    console.log('更新预警规则状态:', id, status);
    return Promise.resolve();
  };

  const testWarningRule = async (params) => {
    // 模拟测试API
    return new Promise((resolve) => {
      setTimeout(() => {
        const triggered = params.testValue < 90;
        resolve({
          testValue: params.testValue,
          threshold: 90,
          condition: '小于',
          triggered,
          warningLevel: triggered ? 'medium' : null,
        });
      }, 1000);
    });
  };

  const getIndicatorList = async () => {
    // 模拟API调用
    return Promise.resolve({
      data: [
        { id: 1, name: '营业收入' },
        { id: 2, name: '净利润' },
        { id: 3, name: '资产总额' },
      ],
    });
  };

  const getReferenceDataList = async (params) => {
    // 模拟API调用 - 基于截图中的数据结构
    return Promise.resolve({
      data: [
        {
          id: 1,
          year: 2025,
          period: '全年',
          value: 10,
          unit: '千',
          type: 'target',
        },
        {
          id: 2,
          year: 2025,
          period: '全年',
          value: 100,
          unit: '%',
          type: 'reference',
        },
      ],
    });
  };

  const getUserList = async () => {
    // 模拟API调用
    return Promise.resolve({
      data: [
        { id: 1, name: '张三', email: 'zhangsan@example.com' },
        { id: 2, name: '李四', email: 'lisi@example.com' },
      ],
    });
  };

  // 生命周期
  onMounted(() => {
    loadTableData();
    loadIndicatorList();
    loadUserList();
  });
</script>

<style scoped>
  .warning-config-container {
    padding: 16px;
    background: #fff;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-header h2 {
    margin: 8px 0;
    font-size: 20px;
    font-weight: 500;
  }

  .search-form {
    background: #fafafa;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }

  .action-bar .ant-btn {
    margin-right: 8px;
  }

  .table-container {
    background: #fff;
  }

  .form-help-text {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }

  .test-container {
    padding: 16px 0;
  }

  .test-result {
    margin-top: 16px;
  }

  .ant-descriptions-item-label {
    font-weight: 500;
  }
</style>
