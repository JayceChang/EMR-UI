<template>
  <a-modal
    v-model:open="modalVisible"
    :title="modalTitle"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    width="600px"
  >
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      class="smart-margin-top20"
    >
      <a-form-item label="集团编号" name="jtbh">
        <a-input v-model:value="form.jtbh" placeholder="请输入集团编号" :maxlength="20" :disabled="isEdit" />
      </a-form-item>

      <a-form-item label="集团名称" name="jtmc">
        <a-input v-model:value="form.jtmc" placeholder="集团名称（只读）" disabled />
      </a-form-item>

      <a-form-item label="区划编号" name="qhbh">
        <a-input v-model:value="form.qhbh" placeholder="请输入区划编号" :maxlength="30" :disabled="isEdit" />
      </a-form-item>

      <a-form-item label="区划名称" name="qhmc">
        <a-input v-model:value="form.qhmc" placeholder="区划名称（只读）" disabled />
      </a-form-item>

      <a-form-item label="显示排序" name="xh">
        <a-input-number v-model:value="form.xh" placeholder="请输入显示排序" :min="0" style="width: 100%" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { medicalGroupDivisionApi } from '/@/api/system/medical-group-division-api';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { smartSentry } from '/@/lib/smart-sentry';

  const emit = defineEmits(['refresh']);

  // 模态框状态
  const modalVisible = ref(false);
  const modalTitle = ref('新建医疗集团区划');
  const confirmLoading = ref(false);

  // 表单引用
  const formRef = ref();

  // 表单数据
  const defaultForm = {
    jtbh: '',
    jtmc: '',
    qhbh: '',
    qhmc: '',
    xh: 1,
    originalJtbh: '',
    originalQhbh: '',
  };

  const form = reactive({ ...defaultForm });

  // 是否编辑模式
  const isEdit = computed(() => {
    return form.originalJtbh && form.originalQhbh;
  });

  // 表单验证规则
  const rules = {
    jtbh: [
      { required: true, message: '请输入集团编号', trigger: 'blur' },
      { max: 20, message: '集团编号最多20个字符', trigger: 'blur' },
    ],
    qhbh: [
      { required: true, message: '请输入区划编号', trigger: 'blur' },
      { max: 30, message: '区划编号最多30个字符', trigger: 'blur' },
    ],
  };

  // 显示模态框
  function showModal(record) {
    modalVisible.value = true;

    if (record && record.jtbh && record.qhbh) {
      modalTitle.value = '编辑医疗集团区划';
      Object.assign(form, {
        jtbh: record.jtbh,
        jtmc: record.jtmc || '',
        qhbh: record.qhbh,
        qhmc: record.qhmc || '',
        xh: record.xh || 1,
        originalJtbh: record.jtbh,
        originalQhbh: record.qhbh,
      });
    } else {
      modalTitle.value = '新建医疗集团区划';
      resetForm();
    }
  }

  // 重置表单
  function resetForm() {
    Object.assign(form, defaultForm);
    if (formRef.value) {
      formRef.value.clearValidate();
    }
  }

  // 确认提交
  async function handleOk() {
    try {
      // 表单验证
      await formRef.value.validate();

      confirmLoading.value = true;
      SmartLoading.show();

      if (isEdit.value) {
        // 更新操作
        await medicalGroupDivisionApi.update(form);
        message.success('更新成功');
      } else {
        // 新增操作
        await medicalGroupDivisionApi.add(form);
        message.success('新增成功');
      }

      modalVisible.value = false;
      emit('refresh');
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误，不需要处理
      } else {
        smartSentry.captureError(error);
      }
    } finally {
      confirmLoading.value = false;
      SmartLoading.hide();
    }
  }

  // 取消
  function handleCancel() {
    modalVisible.value = false;
    resetForm();
  }

  // 暴露方法给父组件
  defineExpose({
    showModal,
  });
</script>

<style scoped lang="less"></style>
