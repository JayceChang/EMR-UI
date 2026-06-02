<!--
  * 角色 设置
  * 
-->
<template>
  <a-card class="role-container">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="角色-功能权限">
        <RoleTree />
      </a-tab-pane>
      <!-- <a-tab-pane key="2" tab="角色-指标后端权限">
        <RoleIndicatorPermission :permissionType="1" />
      </a-tab-pane> -->
      <a-tab-pane key="3" tab="角色-指标前端权限">
        <RoleIndicatorFrontEndPermission :permissionType="2" />
      </a-tab-pane>
      <a-tab-pane key="4" tab="角色-文件管理权限">
        <RoleFileList />
      </a-tab-pane>
      <a-tab-pane key="5" tab="角色-员工列表">
        <RoleEmployeeList />
      </a-tab-pane>
      <a-tab-pane key="6" tab="角色-数据权限">
        <RoleDataScope />
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>
<script setup>
  import { ref } from 'vue';
  import RoleDataScope from '../role-data-scope/index.vue';
  import RoleEmployeeList from '../role-employee-list/index.vue';
  import RoleTree from '../role-tree/index.vue';
  import RoleIndicatorPermission from '../role-indicator-permission/index.vue';
  import RoleIndicatorFrontEndPermission from '../role-indicator-front-end-permission/index.vue';
  import RoleFileList from '../role-file-list/index.vue';

  defineProps({
    value: Number,
  });

  defineEmits(['update:value']);

  let activeKey = ref();
</script>
<style scoped lang="less">
  .role-container {
    //height: 100%;
    :deep(.ant-card-body) {
      height: 100%;
    }
  }
</style>
