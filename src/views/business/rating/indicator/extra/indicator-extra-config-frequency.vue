<!--
  * 指标取数频率配置
  *
  * @Author:    Jayce
  * @Date:      2025-05-01 14:30:00
  * @Copyright  ZDS
-->
<template>
  <a-modal title="频率配置" :visible="visible" @cancel="onClose" :width="550" :footer="null" :maskClosable="false" :destroyOnClose="true">
    <div class="frequency-config">
      <!-- 频率区域 -->
      <div class="section-header">频率:</div>

      <table class="config-table">
        <tr>
          <td class="label-cell">执行:</td>
          <td class="content-cell">
            <a-select v-model:value="frequencyForm.executionType" style="width: 120px" @change="handleExecutionTypeChange">
              <a-select-option value="day">天</a-select-option>
              <a-select-option value="week">周</a-select-option>
              <a-select-option value="month">月</a-select-option>
              <a-select-option value="year">年</a-select-option>
            </a-select>
          </td>
        </tr>

        <!-- 天执行配置 -->
        <tr v-if="frequencyForm.executionType === 'day'">
          <td class="label-cell">执行间隔:</td>
          <td class="content-cell">
            <a-input-number v-model:value="frequencyForm.interval" :min="1" :precision="0" style="width: 80px" />
            <span class="unit-label">天</span>
          </td>
        </tr>

        <!-- 周执行配置 -->
        <tr v-if="frequencyForm.executionType === 'week'">
          <td class="label-cell">执行间隔:</td>
          <td class="content-cell">
            <div class="week-config">
              <div>每 <a-input-number v-model:value="frequencyForm.interval" :min="1" :precision="0" style="width: 80px" /> 周，在</div>
            </div>
          </td>
        </tr>
        <tr v-if="frequencyForm.executionType === 'week'">
          <td class="label-cell"></td>
          <td class="content-cell">
            <div class="weekday-checkboxes">
              <a-checkbox v-model:checked="frequencyForm.monday">星期一</a-checkbox>
              <a-checkbox v-model:checked="frequencyForm.tuesday">星期二</a-checkbox>
              <a-checkbox v-model:checked="frequencyForm.wednesday">星期三</a-checkbox>
              <a-checkbox v-model:checked="frequencyForm.thursday">星期四</a-checkbox>
              <a-checkbox v-model:checked="frequencyForm.friday">星期五</a-checkbox>
              <a-checkbox v-model:checked="frequencyForm.saturday">星期六</a-checkbox>
              <a-checkbox v-model:checked="frequencyForm.sunday">星期日</a-checkbox>
            </div>
          </td>
        </tr>

        <!-- 月执行配置 -->
        <tr v-if="frequencyForm.executionType === 'month'">
          <td class="label-cell">执行间隔:</td>
          <td class="content-cell">
            <div class="month-config">
              <a-radio-group v-model:value="frequencyForm.monthlyType">
                <div class="month-radio-row">
                  <a-radio :value="1">每</a-radio>
                  <a-input-number
                    v-model:value="frequencyForm.monthInterval"
                    :min="1"
                    :precision="0"
                    style="width: 80px"
                    :disabled="frequencyForm.monthlyType !== 1"
                  />
                  <a-space>月，第</a-space>
                  <a-input-number
                    v-model:value="frequencyForm.dayOfMonth"
                    :min="1"
                    :max="31"
                    :precision="0"
                    style="width: 80px"
                    :disabled="frequencyForm.monthlyType !== 1"
                  />
                  <a-space>天</a-space>
                </div>
                <div class="month-radio-row" style="margin-top: 8px">
                  <a-radio :value="2">每</a-radio>
                  <a-input-number
                    v-model:value="frequencyForm.monthIntervalForDay"
                    :min="1"
                    :precision="0"
                    style="width: 80px"
                    :disabled="frequencyForm.monthlyType !== 2"
                  />
                  <a-space>月</a-space>
                  <a-select v-model:value="frequencyForm.occurrence" style="width: 100px" :disabled="frequencyForm.monthlyType !== 2">
                    <a-select-option value="first">第一个</a-select-option>
                    <a-select-option value="second">第二个</a-select-option>
                    <a-select-option value="third">第三个</a-select-option>
                    <a-select-option value="fourth">第四个</a-select-option>
                    <a-select-option value="last">最后一个</a-select-option>
                  </a-select>
                  <a-select v-model:value="frequencyForm.dayOfWeek" style="width: 100px" :disabled="frequencyForm.monthlyType !== 2">
                    <a-select-option value="1">星期一</a-select-option>
                    <a-select-option value="2">星期二</a-select-option>
                    <a-select-option value="3">星期三</a-select-option>
                    <a-select-option value="4">星期四</a-select-option>
                    <a-select-option value="5">星期五</a-select-option>
                    <a-select-option value="6">星期六</a-select-option>
                    <a-select-option value="7">星期日</a-select-option>
                  </a-select>
                </div>
              </a-radio-group>
            </div>
          </td>
        </tr>

        <!-- 年执行配置 -->
        <tr v-if="frequencyForm.executionType === 'year'">
          <td class="label-cell">执行间隔:</td>
          <td class="content-cell">
            <div class="year-config">
              <div class="month-radio-row">
                <a-space>每</a-space>
                <a-input-number
                  v-model:value="frequencyForm.yearInterval"
                  :min="1"
                  :precision="0"
                  style="width: 80px"
                  :disabled="frequencyForm.yearlyType !== 1"
                />
                <a-space>年，第</a-space>
                <a-date-picker
                  v-model:value="frequencyForm.dayOfYear"
                  :disabled="frequencyForm.yearlyType !== 1"
                  style="width: 120px"
                  format="MM-DD"
                  :value-format="'MM-DD'"
                  :show-time="false"
                  :picker="'date'"
                  :mode="'date'"
                />
                <a-space>日</a-space>
              </div>
            </div>
          </td>
        </tr>
      </table>

      <!-- 每天频率区域 -->
      <div class="section-header">每天频率:</div>

      <table class="config-table">
        <tr>
          <td class="content-cell">
            <a-radio-group v-model:value="frequencyForm.dailyFrequencyType">
              <div class="daily-frequency-row">
                <a-radio :value="1">执行一次时间为:</a-radio>
                <a-time-picker
                  v-model:value="frequencyForm.executeOnceTime"
                  format="HH:mm"
                  style="width: 120px; margin-left: 8px"
                  :disabled="frequencyForm.dailyFrequencyType !== 1"
                />
              </div>
            </a-radio-group>
          </td>
        </tr>
        <tr>
          <td class="content-cell">
            <a-radio-group v-model:value="frequencyForm.dailyFrequencyType">
              <div class="daily-frequency-row" style="margin-top: 12px">
                <a-radio :value="2">执行间隔:</a-radio>
                <div class="flex-row">
                  <div class="flex-item">
                    <a-input-number
                      v-model:value="frequencyForm.dailyFrequencyInterval"
                      :min="1"
                      :disabled="frequencyForm.dailyFrequencyType !== 2"
                      style="width: 80px; margin-right: 8px"
                    />
                    <a-select v-model:value="frequencyForm.intervalUnit" style="width: 80px" :disabled="frequencyForm.dailyFrequencyType !== 2">
                      <a-select-option value="hour">小时</a-select-option>
                      <a-select-option value="minute">分钟</a-select-option>
                    </a-select>
                  </div>
                </div>
              </div>
            </a-radio-group>
          </td>
          <td>
            <div class="flex-item time-range" style="margin-left: 20px">
              <span>开始时间:</span>
              <a-time-picker
                v-model:value="frequencyForm.startTime"
                format="HH:mm:ss"
                style="width: 120px; margin-left: 8px"
                :disabled="frequencyForm.dailyFrequencyType !== 2"
              />
            </div>

            <div class="flex-item time-range" style="margin-left: 20px">
              <span>结束时间:</span>
              <a-time-picker
                v-model:value="frequencyForm.endTime"
                format="HH:mm:ss"
                style="width: 120px; margin-left: 8px"
                :disabled="frequencyForm.dailyFrequencyType !== 2"
              />
            </div>
          </td>
        </tr>
      </table>

      <!-- 持续时间区域 -->
      <div class="section-header">持续时间:</div>

      <table class="config-table">
        <tr>
          <td class="label-cell">开始日期:</td>
          <td class="content-cell">
            <a-date-picker v-model:value="frequencyForm.startDate" style="width: 180px" valueFormat="YYYY-MM-DD" />
          </td>
          <td class="label-cell" style="padding-left: 10px">结束日期:</td>
          <td class="content-cell">
            <a-date-picker v-model:value="frequencyForm.endDate" style="width: 180px" valueFormat="YYYY-MM-DD" />
          </td>
        </tr>
      </table>

      <!-- 底部按钮 -->
      <div class="button-row">
        <a-button type="primary" @click="saveFrequency" style="margin-right: 8px">
          <template #icon><SaveOutlined /></template>
          保存
        </a-button>
        <a-button @click="onClose">
          <template #icon><CloseOutlined /></template>
          取消
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, reactive, defineEmits, defineExpose } from 'vue';
  import { message } from 'ant-design-vue';
  import { SaveOutlined, CloseOutlined } from '@ant-design/icons-vue';
  import dayjs from 'dayjs';

  // 定义事件
  const emits = defineEmits(['save', 'close']);

  // 模态框显示状态
  const visible = ref(false);

  // 频率配置表单
  const frequencyForm = reactive({
    executionType: 'day',
    interval: 1,
    // 周配置
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
    // 月配置
    monthlyType: 1,
    dayOfMonth: 1,
    monthInterval: 1,
    occurrence: 'first',
    dayOfWeek: '1',
    monthIntervalForDay: 1,
    // 年配置
    yearlyType: 1,
    dayOfYear: '01-01',
    yearInterval: 1,
    // 每天频率
    dailyFrequencyType: 1,
    executeOnceTime: null,
    dailyFrequencyInterval: 6,
    startTime: null,
    endTime: null,
    // 持续时间
    startDate: null,
    endDate: null,
    intervalUnit: 'hour',
  });

  // 默认表单值
  const defaultForm = {
    executionType: 'day',
    interval: 1,
    // 周配置
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
    // 月配置
    monthlyType: 1,
    dayOfMonth: 1,
    monthInterval: 1,
    occurrence: 'first',
    dayOfWeek: '1',
    monthIntervalForDay: 1,
    // 年配置
    yearlyType: 1,
    dayOfYear: '01-01',
    yearInterval: 1,
    // 每天频率
    dailyFrequencyType: 1,
    executeOnceTime: null,
    dailyFrequencyInterval: 6,
    startTime: null,
    endTime: null,
    // 持续时间
    startDate: null,
    endDate: null,
    intervalUnit: 'hour',
  };

  // 执行类型变更处理
  function handleExecutionTypeChange() {
    // 可以在这里添加额外的逻辑，例如重置某些字段
  }

  // 显示模态框
  function show(data) {
    // 重置表单
    Object.assign(frequencyForm, defaultForm);

    // 如果有数据，则加载数据
    if (data) {
      // 处理日期和时间字段
      if (data.executeOnceTime && typeof data.executeOnceTime === 'string') {
        frequencyForm.executeOnceTime = dayjs(data.executeOnceTime, 'HH:mm');
      }
      if (data.startTime && typeof data.startTime === 'string') {
        frequencyForm.startTime = dayjs(data.startTime, 'HH:mm:ss');
      }
      if (data.endTime && typeof data.endTime === 'string') {
        frequencyForm.endTime = dayjs(data.endTime, 'HH:mm:ss');
      }
      if (data.startDate && typeof data.startDate === 'string') {
        frequencyForm.startDate = dayjs(data.startDate, 'YYYY-MM-DD');
      }
      if (data.endDate && typeof data.endDate === 'string') {
        frequencyForm.endDate = dayjs(data.endDate, 'YYYY-MM-DD');
      }

      // 加载其他数据
      frequencyForm.executionType = data.executionType || defaultForm.executionType;
      frequencyForm.interval = data.interval !== undefined ? data.interval : defaultForm.interval;

      // 加载周数据 - START OF MODIFIED BLOCK
      // The `data` object (from indicator-extra-config-form.vue's frequencyData)
      // will have data.monday, data.tuesday, etc. properties if executionType was 'week'
      // and the JSON was parsed. These are already booleans.
      // If these properties are not in `data` (e.g., executionType is not 'week', or they weren't in JSON),
      // they will remain as their defaults (false) from `Object.assign(frequencyForm, defaultForm)`.
      if (data.monday !== undefined) {
        frequencyForm.monday = data.monday;
      }
      if (data.tuesday !== undefined) {
        frequencyForm.tuesday = data.tuesday;
      }
      if (data.wednesday !== undefined) {
        frequencyForm.wednesday = data.wednesday;
      }
      if (data.thursday !== undefined) {
        frequencyForm.thursday = data.thursday;
      }
      if (data.friday !== undefined) {
        frequencyForm.friday = data.friday;
      }
      if (data.saturday !== undefined) {
        frequencyForm.saturday = data.saturday;
      }
      if (data.sunday !== undefined) {
        frequencyForm.sunday = data.sunday;
      }
      // END OF MODIFIED BLOCK

      // 加载月数据
      if (data.monthlyType) {
        frequencyForm.monthlyType = data.monthlyType;
        frequencyForm.dayOfMonth = data.dayOfMonth || 1;
        frequencyForm.monthInterval = data.monthInterval || 1;
        frequencyForm.occurrence = data.occurrence || 'first';
        frequencyForm.dayOfWeek = data.dayOfWeek || '1';
        if (frequencyForm.dayOfWeek === '0' && data.dayOfWeek === undefined) {
          frequencyForm.dayOfWeek = '7';
        }
        frequencyForm.monthIntervalForDay = data.monthIntervalForDay || 1;
      }

      // 加载年数据
      if (data.yearlyType) {
        frequencyForm.yearlyType = data.yearlyType;
        frequencyForm.dayOfYear = data.dayOfYear || '01-01';
        frequencyForm.yearInterval = data.yearInterval || 1;
      }

      // 加载每天频率数据
      frequencyForm.dailyFrequencyType = data.dailyFrequencyType || 1;
      frequencyForm.dailyFrequencyInterval = data.dailyFrequencyInterval || 6;
      // Ensure intervalUnit is also loaded
      if (data.intervalUnit !== undefined) {
        frequencyForm.intervalUnit = data.intervalUnit;
      }
    }

    visible.value = true;
  }

  // 保存频率配置
  function saveFrequency() {
    // 数据验证
    if (frequencyForm.dailyFrequencyType === 1 && !frequencyForm.executeOnceTime) {
      return message.error('请设置执行一次的时间');
    }

    if (frequencyForm.dailyFrequencyType === 2) {
      if (!frequencyForm.dailyFrequencyInterval) {
        return message.error('请设置执行间隔');
      }
      if (!frequencyForm.startTime || !frequencyForm.endTime) {
        return message.error('请设置开始和结束时间');
      }
    }

    if (!frequencyForm.startDate) {
      return message.error('请设置开始日期');
    }

    if (!frequencyForm.endDate) {
      return message.error('请设置结束日期');
    }

    // 对周执行类型进行校验
    if (frequencyForm.executionType === 'week') {
      const hasSelectedDay =
        frequencyForm.monday ||
        frequencyForm.tuesday ||
        frequencyForm.wednesday ||
        frequencyForm.thursday ||
        frequencyForm.friday ||
        frequencyForm.saturday ||
        frequencyForm.sunday;
      if (!hasSelectedDay) {
        return message.error('请至少选择一个星期几');
      }
    }

    // 格式化数据
    const formattedData = {
      executionType: frequencyForm.executionType,
      interval: frequencyForm.interval,
      // 周数据
      weekdays: getSelectedWeekdays(),
      // 月数据
      monthlyType: frequencyForm.monthlyType,
      dayOfMonth: frequencyForm.dayOfMonth,
      monthInterval: frequencyForm.monthInterval,
      occurrence: frequencyForm.occurrence,
      dayOfWeek: frequencyForm.dayOfWeek,
      monthIntervalForDay: frequencyForm.monthIntervalForDay,
      // 年数据
      yearlyType: frequencyForm.yearlyType,
      dayOfYear: frequencyForm.dayOfYear,
      yearInterval: frequencyForm.yearInterval,
      // 每天频率
      dailyFrequencyType: frequencyForm.dailyFrequencyType,
      dailyFrequencyInterval: frequencyForm.dailyFrequencyInterval,
      intervalUnit: frequencyForm.intervalUnit,
      // 时间和日期
      executeOnceTime: frequencyForm.executeOnceTime ? dayjs(frequencyForm.executeOnceTime).format('HH:mm') : null,
      startTime: frequencyForm.startTime ? dayjs(frequencyForm.startTime).format('HH:mm:ss') : null,
      endTime: frequencyForm.endTime ? dayjs(frequencyForm.endTime).format('HH:mm:ss') : null,
      startDate: frequencyForm.startDate ? dayjs(frequencyForm.startDate).format('YYYY-MM-DD') : null,
      endDate: frequencyForm.endDate ? dayjs(frequencyForm.endDate).format('YYYY-MM-DD') : null,
      frequency: null,
    };

    // 生成更新说明文本
    const description = generateFrequencyDescription(formattedData);
    formattedData.updateDescription = description;

    //生成frequency的JSON
    const frequencyJson = generateFrequencyJson(formattedData);
    formattedData.frequency = frequencyJson;

    // 触发保存事件
    emits('save', formattedData);
    visible.value = false;
    message.success('频率配置已保存');
  }

  // 获取选中的星期几
  function getSelectedWeekdays() {
    const weekdays = [];
    if (frequencyForm.monday) weekdays.push('1');
    if (frequencyForm.tuesday) weekdays.push('2');
    if (frequencyForm.wednesday) weekdays.push('3');
    if (frequencyForm.thursday) weekdays.push('4');
    if (frequencyForm.friday) weekdays.push('5');
    if (frequencyForm.saturday) weekdays.push('6');
    if (frequencyForm.sunday) weekdays.push('7');
    return weekdays;
  }

  // 生成频率描述文本
  function generateFrequencyDescription(data) {
    let desc = '当前记录：';

    // 执行类型和间隔
    if (data.executionType === 'day') {
      const intervalText = data.interval > 1 ? `每 ${data.interval} 天` : '每天';
      desc += intervalText;
    } else if (data.executionType === 'week') {
      const intervalText = data.interval > 1 ? `每 ${data.interval} 周` : '每周';

      // 添加星期几
      let weekdaysText = '';
      if (data.weekdays.includes('1')) weekdaysText += '星期一、';
      if (data.weekdays.includes('2')) weekdaysText += '星期二、';
      if (data.weekdays.includes('3')) weekdaysText += '星期三、';
      if (data.weekdays.includes('4')) weekdaysText += '星期四、';
      if (data.weekdays.includes('5')) weekdaysText += '星期五、';
      if (data.weekdays.includes('6')) weekdaysText += '星期六、';
      if (data.weekdays.includes('7')) weekdaysText += '星期日、';

      weekdaysText = weekdaysText.slice(0, -1); // 去掉最后的逗号

      desc += `${intervalText}的${weekdaysText}`;
    } else if (data.executionType === 'month') {
      if (data.monthlyType === 1) {
        const intervalText = data.monthInterval > 1 ? `每 ${data.monthInterval} 个月` : '每月';
        desc += `${intervalText}的第 ${data.dayOfMonth} 天`;
      } else {
        const intervalText = data.monthIntervalForDay > 1 ? `每 ${data.monthIntervalForDay} 个月` : '每月';

        // 转换occurrence
        let occurrenceText = '';
        if (data.occurrence === 'first') occurrenceText = '第一个';
        else if (data.occurrence === 'second') occurrenceText = '第二个';
        else if (data.occurrence === 'third') occurrenceText = '第三个';
        else if (data.occurrence === 'fourth') occurrenceText = '第四个';
        else if (data.occurrence === 'last') occurrenceText = '最后一个';

        // 转换dayOfWeek
        let dayOfWeekText = '';
        if (data.dayOfWeek === '1') dayOfWeekText = '星期一';
        else if (data.dayOfWeek === '2') dayOfWeekText = '星期二';
        else if (data.dayOfWeek === '3') dayOfWeekText = '星期三';
        else if (data.dayOfWeek === '4') dayOfWeekText = '星期四';
        else if (data.dayOfWeek === '5') dayOfWeekText = '星期五';
        else if (data.dayOfWeek === '6') dayOfWeekText = '星期六';
        else if (data.dayOfWeek === '7') dayOfWeekText = '星期日';

        desc += `${intervalText}的${occurrenceText}${dayOfWeekText}`;
      }
    } else if (data.executionType === 'year') {
      const intervalText = data.yearInterval > 1 ? `每 ${data.yearInterval} 年` : '每年';
      desc += `${intervalText}的第 ${data.dayOfYear} 日`;
    }

    // 每天执行频率
    if (data.dailyFrequencyType === 1 && data.executeOnceTime) {
      desc += `的 ${data.executeOnceTime} 执行一次`;
    } else if (data.dailyFrequencyType === 2) {
      desc += `在 ${data.startTime || '00:00:00'} 到 ${data.endTime || '23:59:59'} 之间,每 ${data.dailyFrequencyInterval} ${
        data.intervalUnit == 'hour' ? '小时' : '分钟'
      } 执行一次`;
    }

    // 开始日期
    if (data.startDate) {
      desc += `，将从 ${data.startDate} 开始`;
    }

    // 结束日期
    if (data.endDate) {
      desc += `，到 ${data.endDate} 结束`;
    }

    return desc;
  }

  //生成frequency 的 JSON
  const generateFrequencyJson = (data) => {
    // 定义结果对象
    const result = {
      type: "0", // 默认为天
      frequency: {},
      dayType: "1", // 默认为执行一次
      dayFrequency: {},
      startTime: "",
      endTime: ""
    };

    // 设置执行类型
    switch (data.executionType) {
      case "day":
        result.type = "0";
        result.frequency.interval = String(data.interval);
        break;
      case "week":
        result.type = "1";
        result.frequency.interval = String(data.interval);
        result.frequency.week = data.weekdays.join(',');
        break;
      case "month":
        result.type = "2";
        result.frequency.interval = String(data.monthlyType === 1 ? data.monthInterval : data.monthIntervalForDay);
        
        // 设置月执行类型 (注意: monthlyType=1对应monthType=0, monthlyType=2对应monthType=1)
        result.frequency.monthType = data.monthlyType === 1 ? "0" : "1";
        
        if (data.monthlyType === 1) {
          // 按天执行
          result.frequency.frequencyDay = {
            interval: String(data.dayOfMonth)
          };
        } else {
          // 按周执行
          // 将occurrence映射为weekNum
          let weekNum;
          switch (data.occurrence) {
            case "first": weekNum = "1"; break;
            case "second": weekNum = "2"; break;
            case "third": weekNum = "3"; break;
            case "fourth": weekNum = "4"; break;
            case "last": weekNum = "5"; break;
            default: weekNum = "1";
          }
          
          result.frequency.frequencyWeek = {
            weekNum: weekNum,
            week: data.dayOfWeek
          };
        }
        break;
      case "year":
        result.type = "3";
        result.frequency.interval = String(data.yearInterval);
        result.frequency.date = data.dayOfYear; // 格式已经是MM-DD
        break;
    }

    // 设置每天频率
    result.dayType = String(data.dailyFrequencyType);
    if (data.dailyFrequencyType === 1) {
      // 执行一次
      result.dayFrequency.time = data.executeOnceTime;
    } else {
      // 执行间隔
      result.dayFrequency.timeNum = String(data.dailyFrequencyInterval);
      result.dayFrequency.timeType = data.intervalUnit === "hour" ? "2" : "1";
      result.dayFrequency.s_StartTime = data.startTime;
      result.dayFrequency.s_EndTime = data.endTime;
    }

    // 设置开始和结束时间
    const startDate = data.startDate ? data.startDate : "2025-01-01";
    const endDate = data.endDate ? data.endDate : "2025-12-31";
    result.startTime = `${startDate} 00:00:00`;
    result.endTime = `${endDate} 23:59:59`;

    return JSON.stringify(result);
  };

  // 关闭模态框
  function onClose() {
    visible.value = false;
    emits('close');
  }

  // 暴露方法
  defineExpose({
    show,
  });
</script>

<style lang="less" scoped>
  .frequency-config {
    padding: 0 8px;

    .section-header {
      background-color: #f0f2f5;
      padding: 8px 12px;
      margin: 16px 0 12px 0;
      font-weight: 500;
    }

    .config-table {
      width: 100%;
      border-collapse: collapse;
      .label-cell {
        width: 100px;
        text-align: left;
        padding: 8px 8px 8px 0;
        vertical-align: top;
        line-height: 32px;
      }
      // tr {
      //   border: 1px solid black;
      // }

      // tr td {
      //   border: 1px solid black;
      // }

      .content-cell {
        padding: 8px 0;

        .unit-label {
          margin-left: 8px;
          line-height: 32px;
        }

        .week-config {
          display: flex;
          align-items: center;
        }

        .weekday-checkboxes {
          display: flex;
          flex-wrap: wrap;

          .ant-checkbox-wrapper {
            margin-right: 16px;
            margin-bottom: 8px;
          }
        }

        .month-config {
          .month-radio-row {
            display: flex;
            align-items: center;

            > * {
              margin-right: 8px;
            }
          }
        }

        .daily-frequency-row {
          display: flex;
          align-items: center;
        }

        .flex-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }

        .flex-item {
          display: flex;
          align-items: center;
        }

        .time-range {
          display: flex;
          align-items: center;
          margin-right: 16px;
          margin-bottom: 8px;
        }
      }
    }

    .button-row {
      display: flex;
      justify-content: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
  }
</style>
