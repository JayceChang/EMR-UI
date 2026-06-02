<!--
  * 医疗机构表单 弹窗
-->
<template>
  <a-modal
    v-model:open="visible"
    :title="formState.originalYyid ? '编辑医疗机构' : '添加医疗机构'"
    @ok="handleOk"
    destroyOnClose
    width="700px"
  >
    <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="医院ID" name="yyid">
            <a-input v-model:value.trim="formState.yyid" placeholder="请输入医院ID" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="医院名称" name="yymc">
            <a-input v-model:value.trim="formState.yymc" placeholder="请输入医院名称" />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="医院编码" name="yybm">
            <a-input v-model:value.trim="formState.yybm" placeholder="请输入医院编码" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="医院级别" name="yyjb">
            <a-select v-model:value="formState.yyjb" placeholder="请选择医院级别" allowClear>
              <a-select-option v-for="item in hospitalLevelOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row> -->

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="医疗级别" name="yljb">
            <a-select v-model:value="formState.yljb" placeholder="请选择医疗级别" allowClear>
              <a-select-option v-for="item in medicalLevelOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="行政区划" name="xzjgid">
            <DepartmentTreeSelect
              ref="departmentTreeSelect"
              v-model:value="formState.xzjgid"
              :defaultValueFlag="false"
              width="100%"
              placeholder="请选择行政区划"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="父医院编码" name="fyyid">
            <a-input v-model:value.trim="formState.fyyid" placeholder="请输入父医院编码" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态" name="zt">
            <a-select v-model:value="formState.zt" placeholder="请选择状态">
              <a-select-option v-for="item in statusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="贯标编码" name="gbbm">
            <a-input v-model:value.trim="formState.gbbm" placeholder="请输入医保贯标编码" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="贯标名称" name="gbmc">
            <a-input v-model:value.trim="formState.gbmc" placeholder="请输入医保贯标名称" />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="序号" name="xh">
            <a-input-number style="width: 100%" v-model:value="formState.xh" :min="0" placeholder="请输入序号" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="启用标志" name="qy">
            <a-input v-model:value.trim="formState.qy" placeholder="请输入启用标志" />
          </a-form-item>
        </a-col>
      </a-row> -->
    </a-form>
  </a-modal>
</template>

<script setup>
  import message from 'ant-design-vue/lib/message';
  import { nextTick, reactive, ref } from 'vue';
  import { medicalInstitutionApi, hospitalLevelOptions, medicalLevelOptions, statusOptions } from '/@/api/system/medical-institution-api';
  import DepartmentTreeSelect from '/@/components/system/department-tree-select/index.vue';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { SmartLoading } from '/@/components/framework/smart-loading';

  // ----------------------- 对外暴露 ---------------------
  defineExpose({
    showModal,
  });

  // ----------------------- modal 的显示与隐藏 ---------------------
  const emits = defineEmits(['refresh']);

  const visible = ref(false);

  function showModal(data) {
    visible.value = true;
    updateFormData(data);
    nextTick(() => {
      // 解决弹窗错误信息显示
      const domArr = document.getElementsByClassName('ant-modal');
      if (domArr && domArr.length > 0) {
        Array.from(domArr).forEach((item) => {
          if (item.childNodes && item.childNodes.length > 0) {
            Array.from(item.childNodes).forEach((child) => {
              if (child.setAttribute) {
                child.setAttribute('aria-hidden', 'false');
              }
            });
          }
        });
      }
    });
  }

  function closeModal() {
    visible.value = false;
    resetFormData();
  }

  // ----------------------- form 表单操作 ---------------------
  const formRef = ref();
  const departmentTreeSelect = ref();

  const defaultForm = {
    originalYyid: undefined,
    yyid: undefined,
    yymc: undefined,
    fyyid: undefined,
    xzjgid: undefined,
    yyjb: undefined,
    zt: 1,
    qy: undefined,
    gbbm: undefined,
    gbmc: undefined,
    xh: 0,
    yybm: undefined,
    yljb: undefined,
  };

  let formState = reactive({ ...defaultForm });

  // 表单校验规则
  const rules = {
    yyid: [
      { required: true, message: '医院ID不能为空' },
      { max: 50, message: '医院ID不能超过50个字符', trigger: 'blur' },
    ],
    yymc: [
      { required: true, message: '医院名称不能为空' },
      { max: 200, message: '医院名称不能超过200个字符', trigger: 'blur' },
    ],
  };

  // 更新表单数据
  function updateFormData(data) {
    Object.assign(formState, defaultForm);
    if (data && data.yyid) {
      Object.assign(formState, data);
      formState.originalYyid = data.yyid;
    }
    visible.value = true;
  }

  // 重置表单数据
  function resetFormData() {
    Object.assign(formState, defaultForm);
  }

  async function handleOk() {
    try {
      await formRef.value.validate();
      if (formState.originalYyid) {
        updateMedicalInstitution();
      } else {
        addMedicalInstitution();
      }
    } catch (error) {
      message.error('参数验证错误，请仔细填写表单数据!');
    }
  }

  // ----------------------- form 表单 ajax 操作 ---------------------
  // 添加医疗机构
  async function addMedicalInstitution() {
    SmartLoading.show();
    try {
      await medicalInstitutionApi.add(formState);
      message.success('添加成功');
      emits('refresh');
      closeModal();
    } catch (error) {
      smartSentry.captureError(error);
    } finally {
      SmartLoading.hide();
    }
  }

  // 更新医疗机构
  async function updateMedicalInstitution() {
    SmartLoading.show();
    try {
      await medicalInstitutionApi.update(formState);
      message.success('更新成功');
      emits('refresh');
      closeModal();
    } catch (error) {
      smartSentry.captureError(error);
    } finally {
      SmartLoading.hide();
    }
  }
</script>
