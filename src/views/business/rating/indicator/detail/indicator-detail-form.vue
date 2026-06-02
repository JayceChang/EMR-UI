<!--
  * 指标明细
  *
  * @Author:    Jayce
  * @Date:      2025-05-07 11:13:00
  * @Copyright  ZDS
-->
<template>
  <a-modal
    :title="form.id ? '编辑指标数据' : '添加/编辑指标数据'"
    :width="800"
    :open="visibleFlag"
    @cancel="onClose"
    :maskClosable="false"
    :destroyOnClose="true"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="horizontal" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="编码" name="indicatorCode" required>
            <a-input v-model:value="form.indicatorCode" disabled placeholder="请输入编码" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="名称" name="indicatorName" required>
            <a-input v-model:value="form.indicatorName" disabled placeholder="请输入名称" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16" v-if="isYearPeriodMode">
        <a-col :span="12">
          <a-form-item label="年份" name="year">
            <a-select v-model:value="form.year" placeholder="请选择年份" allow-clear>
              <a-select-option v-for="option in yearOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="期间" name="serialNum">
            <a-select v-model:value="form.serialNum" placeholder="请选择期间" allow-clear>
              <a-select-option v-for="option in periodOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16" v-else-if="isDateMode">
        <a-col :span="12">
          <a-form-item label="日期" name="day">
            <a-date-picker
              v-model:value="dateValue"
              valueFormat="YYYY-MM-DD"
              style="width: 100%"
              placeholder="请选择日期"
              @change="handleDateChange"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="数值1" name="value1">
            <a-input-number v-model:value="form.value1" style="width: 100%" placeholder="请输入数值1" :min="0" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="数值2" name="value2">
            <a-input-number v-model:value="form.value2" style="width: 100%" placeholder="请输入数值2" :min="0" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="数值3" name="value3">
            <div style="display: flex; align-items: center">
              <a-input-number v-model:value="form.value3" style="width: 100%" placeholder="系统自动计算" :min="0" disabled />
            </div>
            <div style="color: #999; font-size: 12px; margin-top: 4px">系统根据数值1、数值2和计算关系自动计算</div>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否覆盖" name="whetherCover">
            <a-select v-model:value="form.whetherCover" placeholder="请选择">
              <a-select-option :value="1">是</a-select-option>
              <a-select-option :value="0">否</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="计算关系" name="relationType">
            <div class="calculation-wrapper">
              <a-select v-model:value="form.relationType" style="width: 100px" placeholder="请选择关系">
                <a-select-option :value="0">请选择</a-select-option>
                <a-select-option :value="1">相加</a-select-option>
                <a-select-option :value="2">相减</a-select-option>
                <a-select-option :value="3">相乘</a-select-option>
                <a-select-option :value="4">相除</a-select-option>
              </a-select>
              <a-select v-model:value="form.joinCondition" style="width: 100px; margin-left: 10px" placeholder="默认值">
                <a-select-option :value="0">请选择</a-select-option>
                <a-select-option :value="1">默认</a-select-option>
                <a-select-option :value="2">*100.00</a-select-option>
                <a-select-option :value="3">*1000.00</a-select-option>
                <a-select-option :value="4">*10000.00</a-select-option>
              </a-select>
            </div>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <!-- 占位，保持布局一致 -->
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="备注" name="remark" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
            <a-textarea v-model:value="form.remark" :rows="4" placeholder="请输入备注信息" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="onClose">关闭</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>
<script setup>
  import { reactive, ref, nextTick, computed, watch, onMounted } from 'vue';
  import _, { min } from 'lodash';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { indicatorDetailApi } from '/@/api/business/rating/indicator/detail/indicator-detail-api';
  import { indicatorDetailDApi } from '/@/api/business/rating/indicator/detail/indicator-detail-d-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import dayjs from 'dayjs';

  // ------------------------ 事件 ------------------------

  const emits = defineEmits(['reloadList']);

  // ------------------------ 显示与隐藏 ------------------------
  // 是否显示
  const visibleFlag = ref(false);
  const originalValues = ref({
    value1: undefined,
    value2: undefined,
  });

  // 1. 使用与列表页面相同的期间选项
  const periodOptions = ref([
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

  // 3. 根据频率类型的计算属性
  const isYearPeriodMode = computed(() => form.frequencyType === '1'); // 是否为年季月模式
  const isDateMode = computed(() => form.frequencyType === '2'); // 是否为天数模式

  // 4. 使用与列表页面相同的年份选项生成函数
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

  function show(rowData, indicatorInfo, searchFormState) {
    // 先重置表单
    Object.assign(form, formDefault);

    if (rowData && !_.isEmpty(rowData)) {
      // 复制数据
      Object.assign(form, rowData);

      console.log('加载数据:', rowData);

      // 处理日期模式下的日期显示
      if (isDateMode.value) {
        console.log('日期模式，处理日期:', form.day);

        // 检查day是否已经是完整日期格式
        if (!(typeof form.day === 'string' && form.day.includes('-'))) {
          // 如果不是完整日期格式，但有年份和月份，则构建完整日期
          if (form.year && form.serialNum) {
            const month = form.serialNum <= 12 ? form.serialNum : 1;
            const dayValue = form.day.toString().padStart(2, '0');
            form.day = `${form.year}-${month.toString().padStart(2, '0')}-${dayValue}`;
            console.log('构建完整日期:', form.day);
          }
        } else {
          // 如果已经是完整日期格式，解析出年份和月份
          const dateObj = dayjs(form.day);
          form.year = dateObj.year();
          form.serialNum = dateObj.month() + 1;
          console.log('从完整日期解析:', { year: form.year, serialNum: form.serialNum });
        }
      } else {
        if (form.serialNum) {
          form.serialNum = Number(form.serialNum);
        }
      }
    } else {
      // 如果没有行数据，确保日期字段被正确重置
      form.year = undefined;
      form.serialNum = undefined;
      form.day = undefined;
    }

    // 如果传入了指标信息，优先填充指标名称和编码
    if (indicatorInfo) {
      form.indicatorId = indicatorInfo.id;
      form.indicatorCode = indicatorInfo.indicatorCode;
      form.indicatorName = indicatorInfo.indicatorName;
    }

    // 保存查询表单中的频率选择
    if (searchFormState) {
      form.frequencyType = searchFormState.frequency; // 保存频率类型：'1'年季月 或 '2'天数
    }

    originalValues.value = {
      value1: form.id ? form.value1 : undefined,
      value2: form.id ? form.value2 : undefined,
    };

    visibleFlag.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, formDefault);
    originalValues.value = {
      value1: undefined,
      value2: undefined,
    };
    visibleFlag.value = false;
  }

  // ------------------------ 表单 ------------------------

  // 组件ref
  const formRef = ref();

  const formDefault = {
    id: undefined, // 指标明细ID
    indicatorId: undefined, // 指标ID
    indicatorCode: undefined, // 指标编码
    indicatorName: undefined, // 指标名称
    year: undefined, // 年份
    serialNum: undefined, // 期间
    day: undefined, //日期
    value1: undefined, // 数值1
    value2: undefined, // 数值2
    value3: undefined, // 数值3
    relationType: null, // 计算关系
    joinCondition: null, // 默认值
    whetherCover: 0, // 是否覆盖
    remark: undefined, // 备注
  };

  let form = reactive({ ...formDefault });

  const rules = {
    indicatorCode: [{ required: true, message: '编码必填' }],
    indicatorName: [{ required: true, message: '名称必填' }],
    indicatorId: [{ required: true, message: '指标ID必填' }],
    year: [{ required: true, message: '年份必填' }],
    serialNum: [{ required: true, message: '期间必填' }],
    day: [{ required: true, message: '日期必填' }],
    value1: [{ required: false, message: '数值1必填' }],
    value2: [{ required: false, message: '数值2必填' }],
    whetherCover: [{ required: true, message: '是否覆盖必填' }],
    relationType: [{ required: false, message: '计算关系必填' }],
    joinCondition: [{ required: false, message: '默认值必填' }],
  };

  function getDateValue() {
    if (isDateMode.value && form.year && form.serialNum && form.day) {
      // 如果有年份和期间（月份）和天数，则构建完整日期
      const month = form.serialNum <= 12 ? form.serialNum : 1; // 确保月份在1-12之间
      const dayValue =
        typeof form.day === 'string' && form.day.includes('-')
          ? form.day.split('-')[2] // 如果已经是日期格式，提取日部分
          : form.day.toString().padStart(2, '0'); // 否则格式化天数

      const dateStr = `${form.year}-${month.toString().padStart(2, '0')}-${dayValue}`;
      console.log('构建的日期字符串:', dateStr);
      return dayjs(dateStr);
    } else if (isDateMode.value && form.day && typeof form.day === 'string' && form.day.includes('-')) {
      // 如果day已经是完整的日期格式 YYYY-MM-DD
      console.log('使用现有日期:', form.day);
      return dayjs(form.day);
    }
    console.log('没有足够的日期信息');
    return null;
  }

  // 添加监听器，当表单显示状态变化时重新计算日期值
  watch(
    () => visibleFlag.value,
    (newVal) => {
      if (newVal) {
        // 表单显示时，确保日期值正确初始化
        nextTick(() => {
          if (isDateMode.value) {
            console.log('表单显示，当前日期数据:', {
              year: form.year,
              serialNum: form.serialNum,
              day: form.day,
              frequencyType: form.frequencyType,
            });
            getDateValue();
          }
        });
      }
    }
  );

  // 日期值计算属性
  const dateValue = computed({
    get() {
      if (isDateMode.value) {
        // 如果day已经是完整的日期格式 YYYY-MM-DD
        if (form.day && typeof form.day === 'string' && form.day.includes('-')) {
          console.log('使用现有完整日期:', form.day);
          return dayjs(form.day);
        }
        // 如果有年份、月份和天数，则构建完整日期
        else if (form.year && form.serialNum && form.day) {
          const month = form.serialNum <= 12 ? form.serialNum : 1; // 确保月份在1-12之间
          const dayValue = form.day.toString().padStart(2, '0');
          const dateStr = `${form.year}-${month.toString().padStart(2, '0')}-${dayValue}`;
          console.log('构建完整日期:', dateStr);
          return dayjs(dateStr);
        }
      }
      return null;
    },
    set(value) {
      if (value) {
        const dateObj = dayjs(value);
        // 拆分日期到各个字段
        form.year = dateObj.year();
        form.serialNum = dateObj.month() + 1; // dayjs月份从0开始
        form.day = dateObj.format('YYYY-MM-DD'); // 保存完整日期
        console.log('设置日期值:', form.day);
      } else {
        form.year = null;
        form.serialNum = null;
        form.day = null;
      }
    },
  });

  // 日期变更处理函数
  function handleDateChange(date, dateString) {
    if (date) {
      const dateObj = dayjs(date);
      form.year = dateObj.year();
      form.serialNum = dateObj.month() + 1;
      form.day = dateString;
    } else {
      form.year = null;
      form.serialNum = null;
      form.day = null;
    }
  }

  function isEmptyValue(value) {
    return value === undefined || value === null || value === '';
  }

  function getEmptiedValueNames() {
    const emptiedValueNames = [];

    if (!isEmptyValue(originalValues.value.value1) && isEmptyValue(form.value1)) {
      emptiedValueNames.push('数值1');
    }

    if (!isEmptyValue(originalValues.value.value2) && isEmptyValue(form.value2)) {
      emptiedValueNames.push('数值2');
    }

    return emptiedValueNames;
  }

  // 监听 value1、value2 和 relationType 的变化，自动计算 value3
  const calculateValue3 = () => {
    // 如果 value1 或 value2 为空，则不计算
    if (isEmptyValue(form.value1) || isEmptyValue(form.value2)) {
      form.value3 = null;
      return;
    }

    // 根据计算关系计算 value3
    switch (form.relationType) {
      case 1: // 相加
        form.value3 = Number(form.value1) + Number(form.value2);
        break;
      case 2: // 相减
        form.value3 = form.value1 - form.value2;
        break;
      case 3: // 相乘
        form.value3 = form.value1 * form.value2;
        break;
      case 4: // 相除
        // 防止除以零
        if (form.value2 !== 0) {
          form.value3 = form.value1 / form.value2;
        } else {
          form.value3 = undefined; // 除数为零时不计算
        }
        break;
      default:
        break;
    }

    // 应用 joinCondition 乘数
    if (form.joinCondition === 1) {
      // *100.00
      form.value3 = form.value3 * 100;
    } else if (form.joinCondition === 2) {
      // *1000.00
      form.value3 = form.value3 * 1000;
    }

    // 如果计算结果有效，四舍五入到两位小数
    if (form.value3 !== undefined && form.value3 !== null) {
      form.value3 = Math.round(form.value3 * 100) / 100;
    }
  };

  // 监听依赖项变化
  watch([() => form.value1, () => form.value2, () => form.relationType, () => form.joinCondition], () => {
    calculateValue3();
  });

  // 点击确定，验证表单
  async function onSubmit() {
    try {
      // 确保在验证前计算 value3
      calculateValue3();

      await formRef.value.validateFields();
      const emptiedValueNames = form.id ? getEmptiedValueNames() : [];
      if (emptiedValueNames.length > 0) {
        Modal.confirm({
          title: '确认置空数值',
          content: `检测到${emptiedValueNames.join('、')}被置空，确认继续保存吗？`,
          okText: '确认保存',
          cancelText: '取消',
          onOk: () => save(),
        });
        return;
      }

      save();
    } catch (err) {
      message.error('参数验证错误，请仔细填写表单数据!');
    }
  }

  // 新建、编辑API
  async function save() {
    SmartLoading.show();
    try {
      // if (form.serialNum < 10) {
      //   form.serialNum = '0' + form.serialNum;
      // }
      //处理期间值1->01
      form.serialNum = form.serialNum.toString().padStart(2, '0')
      if (form.id) {
        if (isYearPeriodMode.value) {
          await indicatorDetailApi.update(form);
        } else if (isDateMode.value) {
          await indicatorDetailDApi.update(form);
        }
      } else {
        if (isYearPeriodMode.value) {
          await indicatorDetailApi.add(form);
        } else if (isDateMode.value) {
          await indicatorDetailDApi.add(form);
        }
      }
      message.success('操作成功');
      emits('reloadList');
      onClose();
    } catch (err) {
      smartSentry.captureError(err);
    } finally {
      SmartLoading.hide();
    }
  }

  defineExpose({
    show,
  });
</script>

<style lang="less" scoped>
  .config-form {
    //height: calc(100vh - 175px);
    position: relative;
    overflow-y: auto; /* 添加纵向滚动 */
    padding: 0 4px; /* 增加内边距 */
  }

  /* 优化表单布局 */
  :deep(.ant-form-item) {
    margin-bottom: 12px;
  }

  :deep(.ant-form-item-label) {
    padding-bottom: 2px;
  }

  /* 表单中的行间距优化 */
  :deep(.ant-row) {
    margin-bottom: 4px;
  }

  /* 处理小屏幕时表单项的响应式布局 */
  @media (max-width: 1280px) {
    :deep(.ant-col-12) {
      flex: 0 0 100%;
      max-width: 100%;
    }

    :deep(.ant-row) {
      flex-direction: column;
    }

    :deep(.form-group) {
      flex-wrap: wrap;
    }
  }

  /* 对按钮组的优化 */
  .form-group {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;

    @media (max-width: 1440px) {
      flex-wrap: wrap;

      button,
      span,
      input {
        margin-top: 4px;
      }
    }
  }

  /* 为每个字段添加合适的换行和空间 */
  :deep(.ant-input),
  :deep(.ant-select),
  :deep(.ant-checkbox-wrapper),
  :deep(.ant-textarea) {
    width: 100%;
    max-width: 100%;
    word-break: break-word;
  }

  /* 测试和获取数据模态框样式 */
  .test-modal-content {
    padding: 12px 0;

    .test-time-row,
    .test-data-row {
      display: flex;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .test-time-item,
    .test-data-item {
      flex: 1;
      display: flex;
      align-items: center;
      margin-right: 12px;
      min-width: 200px;
      margin-bottom: 8px;

      span {
        white-space: nowrap;
        margin-right: 6px;
      }
    }

    .test-btn-row {
      display: flex;
      justify-content: center;
      margin-top: 16px;

      button {
        margin: 0 6px;
      }
    }
  }

  .fetch-modal-content {
    padding: 12px 0;

    .fetch-time-row {
      display: flex;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .fetch-time-item {
      flex: 1;
      display: flex;
      align-items: center;
      margin-right: 12px;
      min-width: 200px;
      margin-bottom: 8px;

      span {
        white-space: nowrap;
        margin-right: 6px;
      }
    }

    .fetch-btn-row {
      display: flex;
      justify-content: center;
      margin-top: 16px;

      button {
        margin: 0 6px;
      }
    }
  }
</style>
