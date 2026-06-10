<!--
  * 部门 员工 弹窗
  *





-->
<template>
  <a-modal v-model:open="visible" title="调整部门" :footer="null" destroyOnClose>
    <a-alert class="smart-margin-bottom10" message="提交后将覆盖所选员工当前的全部所属部门" type="warning" show-icon />
    <DepartmentTree ref="departmentTree" :height="320" :showMenu="false" checkable checkStrictly />
    <div class="primary-department">
      <span>主部门：</span>
      <DepartmentTreeSelect v-model:value="primaryDepartmentId" style="flex: 1" />
    </div>
    <div class="footer">
      <a-button style="margin-right: 8px" @click="closeModal">取消</a-button>
      <a-button type="primary" @click="handleOk">提交</a-button>
    </div>
  </a-modal>
</template>
<script setup>
  import { message } from 'ant-design-vue';
  import _ from 'lodash';
  import { ref } from 'vue';
  import DepartmentTree from '../department-tree/index.vue';
  import DepartmentTreeSelect from '/@/components/system/department-tree-select/index.vue';
  import { employeeApi } from '/@/api/system/employee-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { SmartLoading } from '/@/components/framework/smart-loading';

  // ----------------------- 以下是字段定义 emits props ---------------------

  const emit = defineEmits(['refresh']);

  // ----------------------- 显示/隐藏 ------------------------

  const departmentTree = ref();
  const visible = ref(false);
  const employeeIdList = ref([]);
  const primaryDepartmentId = ref();

  //显示
  async function showModal(selectEmployeeId) {
    employeeIdList.value = selectEmployeeId;
    primaryDepartmentId.value = undefined;
    visible.value = true;
  }

  //隐藏
  function closeModal() {
    visible.value = false;
  }

  // ----------------------- form操作 ---------------------------------
  async function handleOk() {
    SmartLoading.show();
    try {
      if (_.isEmpty(employeeIdList.value)) {
        message.warning('请选择要调整的员工');
        return;
      }
      const checkedKeys = Array.isArray(departmentTree.value.checkedKeys)
        ? departmentTree.value.checkedKeys
        : departmentTree.value.checkedKeys?.checked || [];
      if (_.isEmpty(checkedKeys)) {
        message.warning('请选择要调整的部门');
        return;
      }
      if (!primaryDepartmentId.value) {
        message.warning('请选择主部门');
        return;
      }
      if (!checkedKeys.includes(primaryDepartmentId.value)) {
        message.warning('主部门必须包含在所属部门中');
        return;
      }
      let params = {
        employeeIdList: employeeIdList.value,
        departmentId: primaryDepartmentId.value,
        departmentIdList: checkedKeys,
      };
      await employeeApi.batchUpdateDepartmentEmployee(params);
      message.success('操作成功');
      emit('refresh');
      closeModal();
    } catch (error) {
      smartSentry.captureError(error);
    } finally {
      SmartLoading.hide();
    }
  }

  // ----------------------- 以下是暴露的方法内容 ----------------------------
  defineExpose({
    showModal,
  });
</script>
<style scoped lang="less">
  .footer {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #e9e9e9;
    padding: 10px 16px;
    background: #fff;
    text-align: right;
    z-index: 1;
  }
  .primary-department {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    margin-bottom: 52px;
  }
</style>
