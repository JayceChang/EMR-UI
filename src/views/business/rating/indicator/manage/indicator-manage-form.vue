<!--
  * 数据源配置
  *
  * @Author:    Jayce
  * @Date:      2025-04-25 16:04:20
  * @Copyright  ZDS
-->
<template>
  <!-- 注意：这里的表单只包含基础信息字段 -->
  <a-modal
    v-if="useModal"
    :title="form.id ? '编辑指标' : '新建指标'"
    :width="600"
    :open="visibleFlag"
    @cancel="onClose"
    :maskClosable="false"
    :destroyOnClose="true"
  >
    <!-- Modal 模式的表单内容 -->
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <!-- 隐藏的 ID 字段，用于编辑 -->
      <a-form-item label="ID" name="id" v-show="false">
        <a-input v-model:value="form.id" />
      </a-form-item>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="指标名称" name="indicatorName">
            <a-input style="width: 100%" v-model:value="form.indicatorName" placeholder="请输入指标名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="指标编码" name="indicatorCode" :validate-status="codeValidateStatus" :help="codeValidateMessage">
            <a-input
              style="width: 100%"
              v-model:value="form.indicatorCode"
              placeholder="请输入指标编码"
              @blur="handleCodeBlur"
              @input="handleCodeInput"
            >
              <template #suffix>
                <LoadingOutlined v-if="codeChecking" style="color: #1890ff" />
                <CheckCircleOutlined v-else-if="codeValidateStatus === 'success'" style="color: #52c41a" />
                <CloseCircleOutlined v-else-if="codeValidateStatus === 'error'" style="color: #f5222d" />
              </template>
            </a-input>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="目录层级" name="isRoot">
            <a-switch v-model:checked="isRoot" :checkedValue="true" :unCheckedValue="false" checked-children="根目录" un-checked-children="子目录" @change="handleSwitchIsRoot"/>
          </a-form-item>
        </a-col>
        <a-col :span="12" v-show="!isRoot">
          <a-form-item label="上级指标目录" name="parentId">
            <GenericTreeSelect
              v-model:value="form.parentId"
              :apiFunc="indicatorManageApi.queryIndicatorTree"
              :apiParams="true"
              :fieldNames="{ label: 'indicatorName', value: 'id', key: 'id', children: 'children' }"
              placeholder="请选择上级指标目录"
              treeDefaultExpandAll
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="指标类型" name="indicatorType">
            <SmartEnumSelect width="100%" v-model:value="form.indicatorType" enum-name="INDICATOR_TYPE_ENUM" placeholder="请选择指标类型" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="序号" name="sort">
            <a-input-number style="width: 100%" v-model:value="form.sort" placeholder="请输入序号" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="禁用状态" name="disabledFlag">
            <a-switch v-model:checked="form.disabledFlag" :checkedValue="1" :unCheckedValue="2" checked-children="启用" un-checked-children="禁用" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否填报" name="isFillFlag">
            <a-switch v-model:checked="form.isFillFlag" :checkedValue="1" :unCheckedValue="0" checked-children="是" un-checked-children="否" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" :loading="loading" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-modal>

  <!-- 内嵌模式：直接显示表单内容 -->
  <div v-else class="indicator-form-container">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <!-- 隐藏的 ID 字段，用于编辑 -->
      <a-form-item label="ID" name="id" v-show="false">
        <a-input v-model:value="form.id" />
      </a-form-item>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="指标名称" name="indicatorName">
            <a-input style="width: 100%" v-model:value="form.indicatorName" placeholder="请输入指标名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="指标编码" name="indicatorCode" :validate-status="codeValidateStatus" :help="codeValidateMessage">
            <a-input
              style="width: 100%"
              v-model:value="form.indicatorCode"
              placeholder="请输入指标编码"
              @blur="handleCodeBlur"
              @input="handleCodeInput"
            >
              <template #suffix>
                <LoadingOutlined v-if="codeChecking" style="color: #1890ff" />
                <CheckCircleOutlined v-else-if="codeValidateStatus === 'success'" style="color: #52c41a" />
                <CloseCircleOutlined v-else-if="codeValidateStatus === 'error'" style="color: #f5222d" />
              </template>
            </a-input>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="目录层级" name="isRoot">
            <a-switch v-model:checked="isRoot" :checkedValue="true" :unCheckedValue="false" checked-children="根目录" un-checked-children="子目录" @change="handleSwitchIsRoot"/>
          </a-form-item>
        </a-col>
        <a-col :span="12" v-show="!isRoot">
          <a-form-item label="上级指标目录" name="parentId">
            <GenericTreeSelect
              v-model:value="form.parentId"
              :apiFunc="indicatorManageApi.queryIndicatorTree"
              :apiParams="true"
              :fieldNames="{ label: 'indicatorName', value: 'id', key: 'id', children: 'children' }"
              placeholder="请选择上级指标目录"
              treeDefaultExpandAll
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="指标类型" name="indicatorType">
            <SmartEnumSelect width="100%" v-model:value="form.indicatorType" enum-name="INDICATOR_TYPE_ENUM" placeholder="请选择指标类型" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="序号" name="sort">
            <a-input-number style="width: 100%" v-model:value="form.sort" placeholder="请输入序号" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="禁用状态" name="disabledFlag">
            <a-switch v-model:checked="form.disabledFlag" :checkedValue="1" :unCheckedValue="2" checked-children="启用" un-checked-children="禁用" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否填报" name="isFillFlag">
            <a-switch v-model:checked="form.isFillFlag" :checkedValue="1" :unCheckedValue="0" checked-children="是" un-checked-children="否" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <!-- 内嵌模式的操作按钮 -->
    <div class="form-actions">
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" :loading="loading" @click="onSubmit">保存</a-button>
      </a-space>
    </div>
  </div>
</template>
<script setup>
  import { reactive, ref, nextTick } from 'vue';
  import _ from 'lodash';
  import { message } from 'ant-design-vue';
  import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import SmartEnumSelect from '/@/components/framework/smart-enum-select/index.vue'; // 导入枚举选择组件
  import GenericTreeSelect from '/@/components/business/common/tree-select/generic-tree-select.vue';

  // ------------------------ Props ------------------------
  const props = defineProps({
    useModal: {
      type: Boolean,
      default: true // 默认使用 Modal 模式
    }
  });

  // ------------------------ 事件 ------------------------

  const emits = defineEmits(['reloadList']);

  // ------------------------ 显示与隐藏 ------------------------
  const visibleFlag = ref(false);
  const loading = ref(false); // 保存按钮 loading 状态
  const isRoot = ref(false); //是否创建根目录

  // ------------------------ 指标编码验证 ------------------------
  const codeChecking = ref(false); // 编码检查中状态
  const codeValidateStatus = ref(''); // 验证状态：'success', 'error', 'warning', ''
  const codeValidateMessage = ref(''); // 验证消息
  const codeCheckTimer = ref(null); // 防抖定时器

  function show(rowData) {
    Object.assign(form, formDefault); // 重置表单
    // 重置编码验证状态
    resetCodeValidation();
    if (rowData && !_.isEmpty(rowData)) {
      // 编辑时，合并数据
      Object.assign(form, rowData);
    }
    if (props.useModal) {
      visibleFlag.value = true;
    }
    nextTick(() => {
      if (formRef.value) {
        formRef.value.clearValidate(); // 清除上次的校验状态
        handleDefaultParentIdValue();
      }
    });
  }

  // 重置表单（用于内嵌模式）
  function resetForm() {
    Object.assign(form, formDefault);
    resetCodeValidation();
    nextTick(() => {
      if (formRef.value) {
        formRef.value.clearValidate();
        handleDefaultParentIdValue();
      }
    });
  }

  // 设置表单数据（用于内嵌模式）
  function setFormData(rowData) {
    Object.assign(form, formDefault);
    resetCodeValidation();
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
    }
    nextTick(() => {
      if (formRef.value) {
        formRef.value.clearValidate();
        handleDefaultParentIdValue();
      }
    });
  }

  /**
   * 处理切换是否根目录
   */
  const handleSwitchIsRoot = ()=>{
    if(isRoot.value){
      form.parentId = 0;
    }else{
      form.parentId = undefined;
    }
  }

  // ------------------------ 指标编码验证方法 ------------------------

  /**
   * 重置编码验证状态
   */
  function resetCodeValidation() {
    codeChecking.value = false;
    codeValidateStatus.value = '';
    codeValidateMessage.value = '';
    if (codeCheckTimer.value) {
      clearTimeout(codeCheckTimer.value);
      codeCheckTimer.value = null;
    }
  }

  /**
   * 处理编码输入事件（防抖）
   */
  function handleCodeInput() {
    // 清除之前的定时器
    if (codeCheckTimer.value) {
      clearTimeout(codeCheckTimer.value);
    }

    // 重置验证状态
    codeValidateStatus.value = '';
    codeValidateMessage.value = '';

    // 如果编码为空，不进行验证
    if (!form.indicatorCode || form.indicatorCode.trim() === '') {
      return;
    }

    // 设置防抖定时器，500ms后执行验证
    codeCheckTimer.value = setTimeout(() => {
      checkIndicatorCode();
    }, 500);
  }

  /**
   * 处理编码失焦事件
   */
  function handleCodeBlur() {
    // 如果有定时器在运行，立即执行验证
    if (codeCheckTimer.value) {
      clearTimeout(codeCheckTimer.value);
      codeCheckTimer.value = null;
    }

    if (form.indicatorCode && form.indicatorCode.trim() !== '') {
      checkIndicatorCode();
    }
  }

  /**
   * 检查指标编码是否存在
   */
  async function checkIndicatorCode() {
    const code = form.indicatorCode?.trim();
    if (!code) {
      resetCodeValidation();
      return;
    }

    codeChecking.value = true;
    codeValidateStatus.value = '';
    codeValidateMessage.value = '';

    try {
      const response = await indicatorManageApi.checkIndicatorCodeExists(code, form.id);

      if (response && response.data) {
        const exists = response.data.exists;

        if (exists) {
          codeValidateStatus.value = 'error';
          codeValidateMessage.value = '该指标编码已存在，请使用其他编码';
        } else {
          codeValidateStatus.value = 'success';
          codeValidateMessage.value = '指标编码可用';
        }
      }
    } catch (error) {
      console.error('检查指标编码失败:', error);
      codeValidateStatus.value = 'warning';
      codeValidateMessage.value = '检查编码时发生错误，请稍后重试';
    } finally {
      codeChecking.value = false;
    }
  }

  function onClose() {
    if (props.useModal) {
      visibleFlag.value = false;
    }
    loading.value = false;
    // 重置编码验证状态
    resetCodeValidation();

    // 在内嵌模式下，通过事件通知父组件关闭
    if (!props.useModal) {
      emits('reloadList', null);
    }
  }

  // ------------------------ 表单 ------------------------

  // 组件ref
  const formRef = ref();

  const formDefault = {
    id: undefined, // 主键
    indicatorName: undefined, // 指标名称
    indicatorCode: undefined, // 指标编码
    indicatorType: undefined, // 指标类型 (根据枚举设置默认值，例如：1)
    disabledFlag: 1, // 是否启用 (默认为 是)
    sort: undefined, // 序号
    remark: undefined, // 备注 (如果添加了备注字段)
    parentId: undefined, //父级ID
    isFillFlag: 0, //是否填报 是否启用 (默认为 否)
  };

  let form = reactive({ ...formDefault });

  // 表单校验规则
  const rules = {
    indicatorName: [{ required: true, message: '指标名称 必填' }],
    indicatorCode: [
      { required: true, message: '指标编码 必填' },
      {
        validator: async (rule, value) => {
          if (!value || value.trim() === '') {
            return Promise.resolve();
          }

          // 如果正在检查中，等待检查完成
          if (codeChecking.value) {
            return new Promise((resolve, reject) => {
              const checkInterval = setInterval(() => {
                if (!codeChecking.value) {
                  clearInterval(checkInterval);
                  if (codeValidateStatus.value === 'error') {
                    reject(new Error(codeValidateMessage.value));
                  } else {
                    resolve();
                  }
                }
              }, 100);
            });
          }

          // 如果验证状态为错误，返回错误
          if (codeValidateStatus.value === 'error') {
            return Promise.reject(new Error(codeValidateMessage.value));
          }

          return Promise.resolve();
        },
        trigger: 'blur'
      }
    ],
    indicatorType: [{ required: true, message: '指标类型 必选' }],
    disabledFlag: [{ required: true, message: '是否启用 必选' }],
    sort: [{ required: false, type: 'number', message: '序号必须是数字' }], // 序号非必填，但需是数字
    parentId: [{ required: true,message: '上级目录 必选' }],
    isFillFlag: [{ required: false}]
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

  // 新建、编辑API
  async function save() {
    loading.value = true; // 开始 loading
    SmartLoading.show(); // 可选：全局 loading
    try {
      let result;
      if (form.id) {
        result = await indicatorManageApi.update(form); // 使用新的 API
      } else {
        result = await indicatorManageApi.add(form); // 使用新的 API
      }
      // 可选：处理后端返回的 result

      message.success('操作成功');
      emits('reloadList'); // 通知列表刷新
      onClose(); // 关闭弹窗
    } catch (err) {
      smartSentry.captureError(err);
    } finally {
      loading.value = false; // 结束 loading
      SmartLoading.hide(); // 可选：全局 loading
    }
  }

  defineExpose({
    show,
    resetForm,
    setFormData,
  });

  /**
   * 处理默认根目录
   */
  const handleDefaultParentIdValue = ()=>{
    if(form.parentId == 0){
      isRoot.value = true;
    }else{
      isRoot.value = false;
    }
  }

</script>

<style lang="less" scoped>
// 指标编码验证样式 - 只针对指标编码字段
:deep(.ant-form-item[name="indicatorCode"]) {
  &.ant-form-item-has-success .ant-input {
    border-color: #52c41a;
    box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
  }

  &.ant-form-item-has-error .ant-input {
    border-color: #ff4d4f;
    box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
  }

  &.ant-form-item-has-warning .ant-input {
    border-color: #faad14;
    box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.2);
  }

  // 验证消息样式
  .ant-form-item-explain {
    font-size: 12px;
    margin-top: 4px;
  }

  // 成功状态的help文本样式
  &.ant-form-item-has-success .ant-form-item-explain {
    color: #52c41a;
  }

  // 错误状态的help文本样式
  &.ant-form-item-has-error .ant-form-item-explain {
    color: #ff4d4f;
  }

  // 警告状态的help文本样式
  &.ant-form-item-has-warning .ant-form-item-explain {
    color: #faad14;
  }
}

// 输入框后缀图标动画
.ant-input-suffix {
  .anticon {
    transition: all 0.3s ease;
  }

  .anticon-loading {
    animation: spin 1s linear infinite;
  }
}

// 内嵌模式样式
.indicator-form-container {
  padding: 0;

  .ant-form {
    margin-bottom: 24px;

    .ant-row {
      margin-bottom: 8px;
    }

    .ant-form-item {
      margin-bottom: 16px;

      .ant-form-item-label {
        text-align: left;

        label {
          font-weight: 500;
          color: #333;
        }
      }
    }

    // 开关组件样式优化
    .ant-switch {
      margin-top: 4px;
    }

    // 数字输入框样式
    .ant-input-number {
      width: 100%;
    }
  }

  .form-actions {
    padding: 16px 0;
    border-top: 1px solid #f0f0f0;
    text-align: right;
    background: #fafafa;
    margin: 0 -24px -24px -24px;
    padding: 16px 24px;

    .ant-btn {
      margin-left: 8px;

      &:first-child {
        margin-left: 0;
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
