<!--
  * 数据源配置
  *
  * @Author:    Jayce
  * @Date:      2025-04-25 16:04:20
  * @Copyright  ZDS
-->
<template>
  <a-modal :title="form.id ? '编辑' : '添加'" :width="800" :open="visibleFlag" @cancel="onClose" :maskClosable="false" :destroyOnClose="true">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-form-item label="数据库类型" name="dsType">
        <SmartEnumSelect width="100%" v-model:value="form.dsType" enum-name="DATASOURCE_TYPE_ENUM" placeholder="数据库类型" />
      </a-form-item>
      <a-form-item label="数据库名称" name="dsName">
        <a-input style="width: 100%" v-model:value="form.dsName" placeholder="数据库名称" />
      </a-form-item>
      <a-form-item label="数据库Schema" name="schemaName">
        <a-input style="width: 100%" v-model:value="form.schemaName" placeholder="数据库Schema" />
      </a-form-item>
      <a-form-item label="数据库主机" name="dsHost">
        <a-input style="width: 100%" v-model:value="form.dsHost" placeholder="数据库主机" />
      </a-form-item>
      <a-form-item label="数据库端口" name="dsPort">
        <a-input-number style="width: 100%" v-model:value="form.dsPort" placeholder="数据库端口" />
      </a-form-item>
      <a-form-item label="数据库帐号" name="dsAccount">
        <a-input style="width: 100%" v-model:value="form.dsAccount" autocomplete="current-username" placeholder="数据库帐号" />
      </a-form-item>
      <a-form-item label="数据库密码" name="dsPwd">
        <a-input-password style="width: 100%" v-model:value="form.dsPwd" autocomplete="current-password" placeholder="数据库密码">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>
      <!-- <a-form-item label="连接类型" name="dbConnType">
        <SmartEnumSelect width="100%" v-model:value="form.dbConnType" enum-name="CONNECTION_TYPE_ENUM" placeholder="连接类型" />
      </a-form-item> -->
      <a-form-item label="数据库连接字符串" name="dsConnStr">
        <a-textarea style="width: 100%" :disabled="true" v-model:value="form.dsConnStr" placeholder="数据库连接字符串" />
      </a-form-item>
      <a-form-item label="排序" name="dsOrder">
        <a-input-number style="width: 100%" v-model:value="form.dsOrder" placeholder="排序" />
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-textarea style="width: 100%" v-model:value="form.remark" placeholder="备注" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="submitTest" v-if="form.id">测试连接</a-button>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>
<script setup>
  import { reactive, ref, nextTick, watch,h } from 'vue';
  import _ from 'lodash';
  import { message,Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { datasourceApi } from '/@/api/business/rating/datasource/datasource-api';
  import { ratingJobApi } from "/@/api/business/rating/job/rating-job-api";
  import { smartSentry } from '/@/lib/smart-sentry';
  import SmartEnumSelect from '/@/components/framework/smart-enum-select/index.vue';
  import datasource from '/@/constants/business/rating/datasource/datasource-const';

  // ------------------------ 事件 ------------------------

  const emits = defineEmits(['reloadList']);

  // ------------------------ 显示与隐藏 ------------------------
  // 是否显示
  const visibleFlag = ref(false);

  function show(rowData) {
    Object.assign(form, formDefault);
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
    }
    visibleFlag.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
      updateConnectionString();
    });
  }

  function onClose() {
    Object.assign(form, formDefault);
    visibleFlag.value = false;
  }

  // 测试连接
  async function submitTest() {
    try {
      const res = await ratingJobApi.testDbLink(form.id);
      if (res) {
        Modal.success({
          title: '测试连接结果',
          content: h('div', {}, [h('p', res.msg || '连接成功')]),
        });
      } else {
        message.error('测试连接失败：未获取到有效响应');
      }
    } catch (error) {
      smartSentry.captureError(error);
      message.error('连接失败: ' + error.message);
    }
  }

  // ------------------------ 表单 ------------------------

  // 组件ref
  const formRef = ref();

  const formDefault = {
    dsType: 1, //数据库类型
    dsName: undefined, //数据库名称
    schemaName: undefined, //数据库Schema
    dsHost: undefined, //数据库主机
    dsPort: undefined, //数据库端口
    dsAccount: undefined, //数据库帐号
    dsPwd: undefined, //数据库密码
    // dbConnType: 1, //连接类型（OLDEB，MSDAORA）
    dsConnStr: undefined, //数据库连接字符串
    dsOrder: undefined, //排序
    remark: undefined, //备注
  };

  let form = reactive({ ...formDefault });

  const rules = {
    dsType: [{ required: true, message: '数据库类型 必填' }],
    dsName: [{ required: true, message: '数据库名称 必填' }],
    dsHost: [{ required: true, message: '数据库主机 必填' }],
    dsPort: [{ required: true, message: '数据库端口 必填' }],
    dsAccount: [{ required: true, message: '数据库帐号 必填' }],
    dsPwd: [{ required: true, message: '数据库密码 必填' }],
    // dbConnType: [{ required: true, message: '连接类型 必填' }],
    dsConnStr: [{ required: true, message: '数据库连接字符串 必填' }],
    dsOrder: [{ required: false, message: '排序' }],
    remark: [{ required: false, message: '备注' }],
  };

  // 监听表单字段变化，自动更新连接字符串
  watch(
    () => [form.dsType, form.dbConnType, form.dsHost, form.dsPort, form.dsName, form.dsAccount, form.schemaName],
    (newValues, oldValues) => {
      updateConnectionString();
    },
    { deep: true } // 使用 deep watch 以防 form 内部嵌套属性变化未被捕获
  );

  // 更新连接字符串的函数
  const updateConnectionString = () => {
    const host = form.dsHost || '';
    const port = form.dsPort || '';
    const dbName = form.dsName || '';
    const account = form.dsAccount || '';
    const schemaName = form.schemaName || '';
    // 注意：出于安全考虑，通常不建议将密码直接包含在连接字符串中，
    // 特别是如果这个字符串会被显示或存储。这里遵循示例省略密码。
    // const password = form.dsPwd || '';

    if (form.dsType === datasource.DATASOURCE_TYPE_ENUM.ORACLE.value) {
      // Oracle 格式: Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.2.253)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=orcl)));Persist Security Info=True;User ID=dbauser01;
      form.dsConnStr = `Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SERVICE_NAME=${dbName})));Persist Security Info=True;User ID=${account};`;
    } else if (form.dsType === datasource.DATASOURCE_TYPE_ENUM.MYSQL.value) {
      // MYSQL 格式: Host=192.168.2.253;Port=5432;Database=rating;Username=root;
      form.dsConnStr = `Host=${host};Port=${port};Database=${dbName};Username=${account};`;
    } else if(form.dsType === datasource.DATASOURCE_TYPE_ENUM.POSTGRESQL.value) {
      // 其他数据库类型比如postgresql和sql server暂时都采用和mysql一样的连接格式
      if (schemaName) {
        form.dsConnStr = `Host=${host};Port=${port};Database=${dbName};Search Path=${schemaName};Username=${account};`;
      } else {
        form.dsConnStr = `Host=${host};Port=${port};Database=${dbName};Username=${account};`;
      }
    }
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

  //拼接增强数据库连接字符串
  const enhanceDbConnStr = (originalStr) => {
    if (originalStr) {
      console.log(form.dsPwd);
      form.dsConnStr = originalStr + 'Password=' + form.dsPwd;
    }
  };

  // 新建、编辑API
  async function save() {
    SmartLoading.show();
    try {
      enhanceDbConnStr(form.dsConnStr);
      if (form.id) {
        await datasourceApi.update(form);
      } else {
        await datasourceApi.add(form);
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
