<!--
  * 指标取数配置
  *
  * @Author:    Jayce
  * @Date:      2025-04-30 15:42:15
  * @Copyright  ZDS
-->
<template>
  <a-modal
    :title="form.id ? '编辑指标任务' : '添加指标任务'"
    :width="800"
    :open="visibleFlag"
    @cancel="onClose"
    :maskClosable="false"
    :destroyOnClose="true"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="horizontal" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="指标选择" name="indicatorId" required>
            <GenericTreeSelect
              v-model:value="form.indicatorId"
              :apiFunc="indicatorManageApi.queryIndicatorTree"
              :apiParams="true"
              :fieldNames="{ label: `indicatorName`, value: 'id', key: 'id', children: 'children' }"
              placeholder="请选择指标"
              treeDefaultExpandAll
              @change="handleIndicatorSelectedChange"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="指标编码" name="indicatorCode" required>
            <a-input v-model:value="form.indicatorCode" placeholder="请输入指标编码" :disabled="true" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="指标描述" name="remark" required>
            <a-input v-model:value="form.remark" placeholder="请输入指标描述" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="指标排序" name="order">
            <a-input-number v-model:value="form.order" placeholder="请输入排序值" style="width: 100%" :min="0" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="取数天数" name="redundancy">
            <a-input-number v-model:value="form.redundancy" placeholder="请输入取数天数" style="width: 100%" required :min="0" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="失败阈值" name="errorThreshold">
            <a-input-number v-model:value="form.errorThreshold" placeholder="请输入失败阈值" style="width: 100%" required :min="0" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="首次更新基准" name="firstUpdateStandard" required>
            <a-date-picker
              show-time
              valueFormat="YYYY-MM-DD HH:mm:ss"
              v-model:value="form.firstUpdateStandard"
              style="width: 100%"
              placeholder="首次更新基准"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否已经初始化" name="whetherInitStatus" required>
            <a-select v-model:value="form.whetherInitStatus" placeholder="请选择初始化状态">
              <a-select-option :value="0">否</a-select-option>
              <a-select-option :value="1">是</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="更新说明" name="frequencyDesc" required :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
            <a-textarea v-model:value="form.frequencyDesc" :disabled="true" placeholder="请输入更新说明" :auto-size="{ minRows: 3, maxRows: 5 }" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="showFrequencyModal">
          <template #icon><ClockCircleOutlined /></template>
          更新频率
        </a-button>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-modal>

  <!-- 引入频率配置组件 -->
  <indicator-extra-config-frequency ref="frequencyModalRef" @save="saveFrequency" @close="onFrequencyModalClose" />
</template>
<script setup>
  import { reactive, ref, nextTick } from 'vue';
  import _ from 'lodash';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { indicatorExtraConfigApi } from '/@/api/business/rating/indicator/extra/indicator-extra-config-api';
  import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { ClockCircleOutlined } from '@ant-design/icons-vue';
  import IndicatorExtraConfigFrequency from './indicator-extra-config-frequency.vue';
  import GenericTreeSelect from '/@/components/business/common/tree-select/generic-tree-select.vue';

  // ------------------------ 事件 ------------------------

  const emits = defineEmits(['reloadList']);

  // ------------------------ 显示与隐藏 ------------------------
  // 是否显示
  const visibleFlag = ref(false);

  //老数据
  let oldData={};
  function show(rowData) {
    oldData=rowData;
    Object.assign(form, formDefault);
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
    }
    visibleFlag.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, formDefault);
    visibleFlag.value = false;
  }

  // ------------------------ 表单 ------------------------

  // 组件ref
  const formRef = ref();

  const formDefault = {
    id: undefined,
    indicatorId: undefined,
    indicatorCode: undefined,
    remark: '',
    order: 1,
    redundancy: 30,
    errorThreshold: undefined,
    whetherInitStatus: 0,
    firstUpdateStandard: undefined,
    frequencyDesc: undefined,
    frequency: undefined,
  };

  let form = reactive({ ...formDefault });

  const rules = {
    indicatorId: [{ required: true, message: '指标必须选择' }],
    indicatorCode: [{ required: true, message: '主编码必填' }],
    remark: [{ required: true, message: '指标描述必填' }],
    redundancy: [{ required: true, message: '取数天数必填' }],
    errorThreshold: [{ required: true, message: '失败阈值必填' }],
    whetherInitStatus: [{ required: true, message: '是否已经初始化必选' }],
    firstUpdateStandard: [{ required: true, message: '首次更新基准必填' }],
    frequencyDesc: [{ required: true, message: '更新频率必须配置' }],
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
  function isPastTime(timeString) {
      const specifiedDate = new Date(timeString);
      const currentDate = new Date();
      return specifiedDate < currentDate;
  }
  // 新建、编辑API
  async function save() {
    if(!form.id){
      if(isPastTime(form.firstUpdateStandard)){
          message.error('首次更新基准不能小于当前时间');
          return ;
      }
      else{
        form.nextDate=form.firstUpdateStandard;
      }
    }
    else{
      //基准时间有改动需要从新执行
      if(oldData.firstUpdateStandard && oldData.firstUpdateStandard!=form.firstUpdateStandard){
         form.nextDate=form.firstUpdateStandard;
      }
    }
   
    //generateNextDate();
    SmartLoading.show();
    try {
      if (form.id) {
        await indicatorExtraConfigApi.update(form);
      } else {
        await indicatorExtraConfigApi.add(form);
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

  //处理下次更新时间
  const generateNextDate = () => {
    // 解析频率配置JSON
    if (form.frequency) {
      try {
        const frequencyJson = JSON.parse(form.frequency);

        // 使用频率JSON中的开始时间作为基准
        if (!frequencyJson.startTime) {
          console.warn('频率配置中未设置开始时间，无法计算下次更新时间');
          return;
        }

        const baseDate = new Date(frequencyJson.startTime);
        let nextDate = null;

        // 根据频率类型计算下次更新时间
        const type = frequencyJson.type; // 0:天 1:周 2:月 3:年
        const interval = parseInt(frequencyJson.frequency.interval || '1');

        switch (type) {
          case '0': // 天
            nextDate = new Date(baseDate);
            nextDate.setDate(nextDate.getDate() + interval);
            break;

          case '1': // 周
            // 获取周几配置
            var weekDays = frequencyJson.frequency.week ? frequencyJson.frequency.week.split(',').map(Number) : [];

            if (weekDays.length > 0) {
              // 找到开始日期之后的下一个符合条件的星期几
              nextDate = new Date(baseDate);

              // 首先增加周间隔
              nextDate.setDate(nextDate.getDate() + (interval - 1) * 7);

              // 然后找到下一个符合条件的星期几
              let found = false;
              for (let i = 0; i < 7; i++) {
                nextDate.setDate(nextDate.getDate() + 1);
                // JS中getDay()返回0-6，对应周日-周六，而我们的配置中1-7对应周一-周日
                const day = nextDate.getDay() === 0 ? 7 : nextDate.getDay();
                if (weekDays.includes(day)) {
                  found = true;
                  break;
                }
              }

              if (!found) {
                // 如果没找到匹配的星期几，使用间隔时间
                nextDate.setDate(baseDate.getDate() + interval * 7);
              }
            } else {
              // 如果没有指定星期几，简单地增加周数
              nextDate = new Date(baseDate);
              nextDate.setDate(nextDate.getDate() + interval * 7);
            }
            break;

          case '2': // 月
            nextDate = new Date(baseDate);
            var monthType = frequencyJson.frequency.monthType;

            if (monthType === '0') {
              // 按天执行
              const dayOfMonth = parseInt(frequencyJson.frequency.frequencyDay?.interval || '1');
              // 先增加月份
              nextDate.setMonth(nextDate.getMonth() + interval);
              // 然后设置为指定日期
              nextDate.setDate(Math.min(dayOfMonth, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()));
            } else {
              // 按周执行
              // 获取配置：第几个星期几
              const weekNum = frequencyJson.frequency.frequencyWeek?.weekNum || '1';
              const weekDay = parseInt(frequencyJson.frequency.frequencyWeek?.week || '1');

              // 增加月份
              nextDate.setMonth(nextDate.getMonth() + interval);

              // 计算指定月份中第n个星期几的日期
              const firstDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
              // 找到当月第一个对应的星期几
              let dayOfWeek = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay();
              let daysToAdd = (weekDay - dayOfWeek + 7) % 7;

              // 根据weekNum调整日期
              if (weekNum === '5') {
                // 最后一个
                // 找到下个月的第一天，然后往前找对应的星期几
                const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0);
                dayOfWeek = lastDayOfMonth.getDay() === 0 ? 7 : lastDayOfMonth.getDay();

                const daysToSubtract = (dayOfWeek - weekDay + 7) % 7;
                nextDate = new Date(lastDayOfMonth);
                nextDate.setDate(lastDayOfMonth.getDate() - daysToSubtract);
              } else {
                // 第n个星期几
                const nthWeek = parseInt(weekNum) - 1;
                nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1 + daysToAdd + nthWeek * 7);
              }
            }
            break;

          case '3': // 年
            nextDate = new Date(baseDate);
            // 解析MM-DD格式的日期
            var dateStr = frequencyJson.frequency.date || '01-01';
            var [month, day] = dateStr.split('-').map((num) => parseInt(num));

            // 设置下一个年份的同一天
            nextDate.setFullYear(nextDate.getFullYear() + interval);
            nextDate.setMonth(month - 1); // 月份是0-11
            nextDate.setDate(day);
            break;

          default:
            console.warn('未知的频率类型:', type);
            nextDate = new Date(baseDate);
            nextDate.setDate(nextDate.getDate() + 1); // 默认增加一天
        }

        // 根据每天频率类型调整时间
        if (nextDate) {
          const dayType = frequencyJson.dayType;
          const dayFrequency = frequencyJson.dayFrequency;

          if (dayType === '1' && dayFrequency.time) {
            // 执行一次
            const [hours, minutes] = dayFrequency.time.split(':').map(Number);
            nextDate.setHours(hours, minutes, 0, 0);
          } else if (dayType === '2' && dayFrequency.s_StartTime) {
            // 间隔执行，使用开始时间
            const [hours, minutes, seconds] = dayFrequency.s_StartTime.split(':').map(Number);
            nextDate.setHours(hours, minutes, seconds || 0, 0);
          }

          // 格式化为YYYY-MM-DD HH:mm:ss
          form.nextDate = formatDateToUTC8(nextDate);
          console.log('计算得出的下次更新时间:', form.nextDate);
        }
      } catch (e) {
        console.error('计算下次更新时间出错:', e);
      }
    }
  };

  // 将UTC时间转换为UTC+8 (北京时间)
  const formatDateToUTC8 = (date) => {
    // 创建一个新的Date对象，避免修改原始对象
    const dateInUTC8 = new Date(date);
    // 为UTC时间添加8小时
    dateInUTC8.setHours(dateInUTC8.getHours() + 0);

    // 格式化为YYYY-MM-DD HH:mm:ss
    const year = dateInUTC8.getFullYear();
    const month = String(dateInUTC8.getMonth() + 1).padStart(2, '0');
    const day = String(dateInUTC8.getDate()).padStart(2, '0');
    const hours = String(dateInUTC8.getHours()).padStart(2, '0');
    const minutes = String(dateInUTC8.getMinutes()).padStart(2, '0');
    const seconds = String(dateInUTC8.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 处理indicator 选择变更
  const handleIndicatorSelectedChange = async (data) => {
    const indicatorId = data; //data 为子组件传递的indicator id
    try {
      let response = await indicatorManageApi.queryIndicatorById(indicatorId);
      if (response.ok && response.data) {
        let data = response.data;
        form.indicatorCode = data.indicatorCode;
        form.remark = data.indicatorName;
        form.order = data.order;
      }
    } catch (e) {
      smartSentry.captureError(e);
    }
  };

  // 频率配置模态框引用
  const frequencyModalRef = ref(null);

  // 显示频率配置模态框
  function showFrequencyModal() {
    let frequencyData = {}; // 使用空对象或默认结构初始化

    if (form.frequency) {
      try {
        const frequencyJson = JSON.parse(form.frequency);
        console.log('用于频率弹窗的原始JSON:', frequencyJson);

        // 安全获取嵌套属性的辅助函数
        const getSafe = (obj, path, defaultValue = undefined) => {
          const keys = Array.isArray(path) ? path : path.split('.');
          let result = obj;
          for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
              result = result[key];
            } else {
              return defaultValue;
            }
          }
          return result;
        };

        // 基本类型和间隔
        frequencyData.executionType = getExecutionType(getSafe(frequencyJson, 'type', '0'));
        frequencyData.interval = parseInt(getSafe(frequencyJson, 'frequency.interval', '1'));

        // 日期 (提取 YYYY-MM-DD 部分)
        const fullStartDate = getSafe(frequencyJson, 'startTime');
        if (fullStartDate && typeof fullStartDate === 'string') {
          frequencyData.startDate = fullStartDate.substring(0, 10); // "YYYY-MM-DD"
        }
        const fullEndDate = getSafe(frequencyJson, 'endTime');
        if (fullEndDate && typeof fullEndDate === 'string') {
          frequencyData.endDate = fullEndDate.substring(0, 10); // "YYYY-MM-DD"
        }

        // 每日频率类型和详情
        frequencyData.dailyFrequencyType = parseInt(getSafe(frequencyJson, 'dayType', '1'));

        const dayFrequencyDetails = getSafe(frequencyJson, 'dayFrequency');
        if (dayFrequencyDetails) {
          if (frequencyData.dailyFrequencyType === 1) {
            // 执行一次
            frequencyData.executeOnceTime = getSafe(dayFrequencyDetails, 'time'); // "HH:mm" 字符串
          } else if (frequencyData.dailyFrequencyType === 2) {
            // 间隔执行
            frequencyData.dailyFrequencyInterval = parseInt(getSafe(dayFrequencyDetails, 'timeNum', '6'));
            frequencyData.intervalUnit = getSafe(dayFrequencyDetails, 'timeType') === '1' ? 'minute' : 'hour';
            frequencyData.startTime = getSafe(dayFrequencyDetails, 's_StartTime'); // "HH:mm:ss" 字符串
            frequencyData.endTime = getSafe(dayFrequencyDetails, 's_EndTime'); // "HH:mm:ss" 字符串
          }
        }

        // 针对每种 executionType 的特定设置
        const freqDetails = getSafe(frequencyJson, 'frequency');
        if (freqDetails) {
          switch (frequencyData.executionType) {
            case 'week':
              if (typeof getSafe(freqDetails, 'week') === 'string') {
                const weekdays = getSafe(freqDetails, 'week').split(',');
                frequencyData.monday = weekdays.includes('1');
                frequencyData.tuesday = weekdays.includes('2');
                frequencyData.wednesday = weekdays.includes('3');
                frequencyData.thursday = weekdays.includes('4');
                frequencyData.friday = weekdays.includes('5');
                frequencyData.saturday = weekdays.includes('6');
                frequencyData.sunday = weekdays.includes('7');
              }
              break;
            case 'month':
              frequencyData.monthlyType = getSafe(freqDetails, 'monthType') === '0' ? 1 : 2;
              if (frequencyData.monthlyType === 1) {
                // 按几号
                frequencyData.monthInterval = parseInt(getSafe(freqDetails, 'interval', '1'));
                frequencyData.dayOfMonth = parseInt(getSafe(freqDetails, 'frequencyDay.interval', '1'));
              } else {
                // 按第几个周几
                frequencyData.monthIntervalForDay = parseInt(getSafe(freqDetails, 'interval', '1'));
                const weekNum = getSafe(freqDetails, 'frequencyWeek.weekNum');
                switch (weekNum) {
                  case '1':
                    frequencyData.occurrence = 'first';
                    break;
                  case '2':
                    frequencyData.occurrence = 'second';
                    break;
                  case '3':
                    frequencyData.occurrence = 'third';
                    break;
                  case '4':
                    frequencyData.occurrence = 'fourth';
                    break;
                  case '5':
                    frequencyData.occurrence = 'last';
                    break;
                  default:
                    frequencyData.occurrence = 'first';
                }
                frequencyData.dayOfWeek = getSafe(freqDetails, 'frequencyWeek.week', '1');
                // 确保从JSON中读取的dayOfWeek如果是"0"，在这里也应该处理成"7"或保持为 "1"-"7"
                if (frequencyData.dayOfWeek === '0') {
                  frequencyData.dayOfWeek = '7'; // 如果JSON中还是旧的0，转为7
                }
              }
              break;
            case 'year':
              frequencyData.yearlyType = 1; // 假设如果 executionType 是 'year'，则 yearlyType 总是 1
              frequencyData.yearInterval = parseInt(getSafe(freqDetails, 'interval', '1'));
              frequencyData.dayOfYear = getSafe(freqDetails, 'date', '01-01'); // "MM-DD" 字符串
              break;
          }
        }
        // 使用 JSON.parse(JSON.stringify(...)) 来打印一个干净的、非响应式的对象副本，便于调试
        console.log('即将发送给 frequencyModalRef.show() 的数据:', JSON.parse(JSON.stringify(frequencyData)));
      } catch (e) {
        console.error('在 showFrequencyModal 中解析频率JSON时出错:', e);
        message.warning('解析频率配置失败，将使用默认或部分已解析的设置。');
        // 此处 frequencyData 可能仍然包含回退数据或部分解析的数据
      }
    } else {
      console.log('没有现有的频率JSON，将使用默认值打开弹窗。');
      // 如果需要，可以在此处使用默认值初始化 frequencyData，或者让弹窗自行处理。
      // 例如: frequencyData = { executionType: 'day', ... }
    }

    frequencyModalRef.value.show(frequencyData);
  }

  // 辅助函数：将JSON中的type值映射为executionType字符串
  function getExecutionType(typeValue) {
    switch (
      String(typeValue) // 显式转换为字符串以进行安全比较
    ) {
      case '0':
        return 'day';
      case '1':
        return 'week';
      case '2':
        return 'month';
      case '3':
        return 'year';
      default:
        return 'day'; // 如果未定义或无效，则默认为 'day'
    }
  }

  // 保存频率配置回调
  function saveFrequency(data) {
    // 更新表单中的频率相关字段
    formRef.value.clearValidate();
    form.frequency = data.frequency;
    form.frequencyDesc = data.updateDescription;
  }

  // 频率配置模态框关闭回调
  function onFrequencyModalClose() {
    // 可以添加需要的逻辑
  }

  defineExpose({
    show,
  });
</script>
