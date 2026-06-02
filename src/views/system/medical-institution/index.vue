<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row">
      <a-form-item label="医院名称" class="smart-query-form-item">
        <a-input style="width: 200px" v-model:value="queryForm.yymc" placeholder="请输入医院名称" allowClear />
      </a-form-item>

      <a-form-item label="医院级别" class="smart-query-form-item">
        <a-select style="width: 150px" v-model:value="queryForm.yyjb" placeholder="请选择医院级别" allowClear>
          <a-select-option v-for="item in hospitalLevelOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="医疗级别" class="smart-query-form-item">
        <a-select style="width: 120px" v-model:value="queryForm.yljb" placeholder="请选择" allowClear>
          <a-select-option v-for="item in medicalLevelOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="状态" class="smart-query-form-item">
        <a-select style="width: 100px" v-model:value="queryForm.zt" placeholder="请选择" allowClear>
          <a-select-option v-for="item in statusOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item class="smart-query-form-item smart-margin-left10">
        <a-button-group>
          <a-button type="primary" @click="onSearch">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
          <a-button @click="resetQuery">
            <template #icon>
              <ReloadOutlined />
            </template>
            重置
          </a-button>
        </a-button-group>
        <a-button v-privilege="'system:medicalInstitution:add'" type="primary" @click="addMedicalInstitution" class="smart-margin-left20">
          <template #icon>
            <PlusOutlined />
          </template>
          新建
        </a-button>
      </a-form-item>
    </a-row>
  </a-form>

  <a-card size="small" :bordered="true">
    <a-table
      size="small"
      bordered
      :loading="tableLoading"
      rowKey="yyid"
      :columns="columns"
      :data-source="tableData"
      :pagination="pagination"
      @change="handleTableChange"
      :scroll="{ x: 1500, y: 'calc(100vh - 300px)' }"
    >
      <template #bodyCell="{ record, column }">
        <template v-if="column.dataIndex === 'zt'">
          <a-tag :color="record.zt == 1 ? 'green' : 'red'">
            {{ record.zt == 1 ? '正常' : '停用' }}
          </a-tag>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="editMedicalInstitution(record)" v-privilege="'system:medicalInstitution:update'" type="link">编辑</a-button>
            <a-button
              danger
              v-privilege="'system:medicalInstitution:delete'"
              @click="deleteMedicalInstitution(record.yyid)"
              type="link"
            >删除</a-button>
          </div>
        </template>
      </template>
    </a-table>
    <!-- 添加编辑医疗机构弹窗 -->
    <MedicalInstitutionFormModal ref="formModal" @refresh="queryList" />
  </a-card>
</template>

<script setup>
  import { onMounted, reactive, ref, createVNode } from 'vue';
  import { medicalInstitutionApi, hospitalLevelOptions, medicalLevelOptions, statusOptions } from '/@/api/system/medical-institution-api';
  import { Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import MedicalInstitutionFormModal from './components/medical-institution-form-modal.vue';
  import { smartSentry } from '/@/lib/smart-sentry';

  // -----------------------  查询条件 ---------------------
  const defaultQueryForm = {
    yymc: '',
    xzjgid: '',
    yyjb: undefined,
    zt: undefined,
    gbbm: '',
    yljb: undefined,
    pageNum: 1,
    pageSize: 20,
  };

  const queryForm = reactive({ ...defaultQueryForm });

  // ----------------------- 表格数据 ---------------------
  const tableLoading = ref(false);
  const tableData = ref([]);
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100'],
  });

  const columns = ref([
    {
      title: '医院ID',
      dataIndex: 'yyid',
      key: 'yyid',
      width: 150,
      ellipsis: true,
    },
    {
      title: '医院名称',
      dataIndex: 'yymc',
      key: 'yymc',
      width: 200,
      ellipsis: true,
    },
    // {
    //   title: '医院编码',
    //   dataIndex: 'yybm',
    //   key: 'yybm',
    //   width: 120,
    //   ellipsis: true,
    // },
    // {
    //   title: '医院级别',
    //   dataIndex: 'yyjbmc',
    //   key: 'yyjbmc',
    //   width: 100,
    // },
    {
      title: '医疗级别',
      dataIndex: 'yljb',
      key: 'yljb',
      width: 80,
    },
    {
      title: '行政区划',
      dataIndex: 'xzjgmc',
      key: 'xzjgmc',
      width: 120,
      ellipsis: true,
    },
    {
      title: '医保贯标编码',
      dataIndex: 'gbbm',
      key: 'gbbm',
      width: 150,
      ellipsis: true,
    },
    {
      title: '医保贯标名称',
      dataIndex: 'gbmc',
      key: 'gbmc',
      width: 200,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'zt',
      key: 'zt',
      width: 80,
    },
    // {
    //   title: '创建时间',
    //   dataIndex: 'cjsj',
    //   key: 'cjsj',
    //   width: 120,
    // },
    {
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      width: 150,
    },
  ]);

  onMounted(() => {
    queryList();
  });

  // 查询列表
  async function queryList() {
    try {
      tableLoading.value = true;
      const params = {
        ...queryForm,
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      };
      let res = await medicalInstitutionApi.queryPage(params);
      tableData.value = res.data.list || [];
      pagination.total = res.data.total || 0;
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      tableLoading.value = false;
    }
  }

  // 表格变化处理
  function handleTableChange(pag) {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    queryList();
  }

  // 重置
  function resetQuery() {
    Object.assign(queryForm, defaultQueryForm);
    pagination.current = 1;
    queryList();
  }

  // 搜索
  function onSearch() {
    pagination.current = 1;
    queryList();
  }

  // ----------------------- 表单操作 ---------------------
  const formModal = ref();

  // 添加
  function addMedicalInstitution() {
    formModal.value.showModal({});
  }

  // 编辑
  function editMedicalInstitution(record) {
    formModal.value.showModal(record);
  }

  // 删除
  function deleteMedicalInstitution(yyid) {
    Modal.confirm({
      title: '提醒',
      icon: createVNode(ExclamationCircleOutlined),
      content: '确定要删除该医疗机构吗?',
      okText: '删除',
      okType: 'danger',
      async onOk() {
        SmartLoading.show();
        try {
          await medicalInstitutionApi.delete(yyid);
          await queryList();
        } catch (error) {
          smartSentry.captureError(error);
        } finally {
          SmartLoading.hide();
        }
      },
      cancelText: '取消',
      onCancel() {},
    });
  }
</script>

<style scoped lang="less"></style>
