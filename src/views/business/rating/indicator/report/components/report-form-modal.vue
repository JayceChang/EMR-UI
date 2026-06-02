<template>
  <a-modal :title="modalTitle" :visible="visible" :confirm-loading="submitLoading" @ok="handleSubmit" @cancel="handleCancel" :width="600">
    <a-form :model="formData" :rules="rules" ref="formRef" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
      <a-form-item label="报表code" name="reportCode">
        <a-input v-model:value="formData.reportCode" placeholder="请输入报表Code" />
      </a-form-item>
      <a-form-item label="报表名称" name="reportName">
        <a-input v-model:value="formData.reportName" placeholder="请输入报表名称" />
      </a-form-item>
      <a-form-item label="报表地址" name="reportUrl">
        <a-input v-model:value="formData.reportUrl" placeholder="请输入报表地址" />
      </a-form-item>
      <a-form-item label="报表分组" name="reportGroupName">
        <DictSelect :dict-code="'REPORT_GROUP'" placeholder="请输入报表分组" v-model:value="formData.reportGroupName" />
      </a-form-item>
      <a-form-item label="禁用状态" name="disabledFlag">
        <a-switch v-model:checked="formData.disabledFlag" :checkedValue="1" :unCheckedValue="2" checked-children="启用" un-checked-children="禁用" />
      </a-form-item>
      <a-form-item label="序号" name="sort">
        <a-input-number style="width: 100%" v-model:value="formData.sort" placeholder="请输入序号" />
      </a-form-item>
      <a-form-item label="描述" name="reportDesc">
        <a-textarea style="width: 100%" v-model:value="formData.reportDesc" placeholder="请输入描述" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
  import { reactive, ref, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { reportConfigApi } from '/@/api/business/rating/indicator/report/report-config-api';
  import DictSelect from '/@/components/support/dict-select/index.vue';

  const emit = defineEmits(['reloadList']);
  const visible = ref(false);
  const submitLoading = ref(false);
  const formRef = ref();
  const editingRecord = ref(null);

  const modalTitle = computed(() => {
    return editingRecord.value ? '编辑报表' : '新增报表';
  });

  const formData = reactive({
    id: null,
    reportCode: '',
    reportName: '',
    reportUrl: '',
    reportGroupName: '',
    reportDesc: '',
    disabledFlag: 1,
    sort: undefined,
  });

  const rules = {
    reportName: [{ required: true, message: '请输入报表名称', trigger: 'blur' }],
    reportUrl: [{ required: true, message: '请输入报表地址', trigger: 'blur' }],
    reportGroupName: [{ required: true, message: '请输入报表分组', trigger: 'blur' }],
    reportCode: [{ required: true, message: '请输入报表编码', trigger: 'blur' }],
  };

  // 显示模态窗口
  function showModal(record) {
    visible.value = true;
    editingRecord.value = record.id;
    if (record.id) {
      // 编辑模式，填充表单数据
      Object.assign(formData, {
        id: record.id,
        reportName: record.reportName,
        reportUrl: record.reportUrl,
        reportGroupName: record.reportGroupName,
        disabledFlag: record.disabledFlag,
        sort: record.sort,
        reportCode: record.reportCode,
        reportDesc: record.reportDesc,
      });
    } else {
      // 新增模式，重置表单
      Object.assign(formData, {
        id: null,
        reportCode: '',
        reportName: '',
        reportUrl: '',
        reportGroupName: '',
        reportDesc: '',
        disabledFlag: 1,
        sort: undefined,
      });
    }
  }

  // 提交表单
  async function handleSubmit() {
    try {
      await formRef.value.validate();
      submitLoading.value = true;
      SmartLoading.show();

      if (editingRecord.value) {
        // 更新报表
        await reportConfigApi.updateReport(formData);
        message.success('更新报表成功');
      } else {
        // 新增报表
        await reportConfigApi.addReport(formData);
        message.success('新增报表成功');
      }

      handleCancel();
      emit('reloadList');
    } catch (error) {
      console.error('表单验证失败或提交出错:', error);
    } finally {
      submitLoading.value = false;
      SmartLoading.hide();
    }
  }

  // 取消操作
  function handleCancel() {
    visible.value = false;
    formRef.value?.resetFields();
  }

  defineExpose({
    showModal,
  });
</script>
