<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row">
      <a-form-item label="集团编号" class="smart-query-form-item">
        <a-input style="width: 200px" v-model:value="queryForm.jtbh" placeholder="请输入集团编号" allowClear />
      </a-form-item>

      <a-form-item label="集团名称" class="smart-query-form-item">
        <a-input style="width: 200px" v-model:value="queryForm.jtmc" placeholder="请输入集团名称" allowClear />
      </a-form-item>

      <a-form-item label="区划编号" class="smart-query-form-item">
        <a-input style="width: 200px" v-model:value="queryForm.qhbh" placeholder="请输入区划编号" allowClear />
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
        <a-button v-privilege="'system:medicalGroupDivision:add'" type="primary" @click="addMedicalGroupDivision" class="smart-margin-left20">
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
      :rowKey="(record) => `${record.jtbh}_${record.qhbh}`"
      :columns="columns"
      :data-source="tableData"
      :pagination="pagination"
      @change="handleTableChange"
      :scroll="{ x: 1000, y: 'calc(100vh - 300px)' }"
    >
      <template #bodyCell="{ record, column }">
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="editMedicalGroupDivision(record)" v-privilege="'system:medicalGroupDivision:update'" type="link">编辑</a-button>
            <a-button
              danger
              v-privilege="'system:medicalGroupDivision:delete'"
              @click="deleteMedicalGroupDivision(record)"
              type="link"
            >删除</a-button>
          </div>
        </template>
      </template>
    </a-table>
    <!-- 添加编辑医疗集团区划弹窗 -->
    <MedicalGroupDivisionFormModal ref="formModal" @refresh="queryList" />
  </a-card>
</template>

<script setup>
  import { onMounted, reactive, ref, createVNode } from 'vue';
  import { medicalGroupDivisionApi } from '/@/api/system/medical-group-division-api';
  import { Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import MedicalGroupDivisionFormModal from './components/medical-group-division-form-modal.vue';
  import { smartSentry } from '/@/lib/smart-sentry';

  // -----------------------  查询条件 ---------------------
  const defaultQueryForm = {
    jtbh: '',
    jtmc: '',
    qhbh: '',
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
      title: '集团编号',
      dataIndex: 'jtbh',
      key: 'jtbh',
      width: 150,
      ellipsis: true,
    },
    {
      title: '集团名称',
      dataIndex: 'jtmc',
      key: 'jtmc',
      width: 200,
      ellipsis: true,
    },
    {
      title: '区划编号',
      dataIndex: 'qhbh',
      key: 'qhbh',
      width: 150,
      ellipsis: true,
    },
    {
      title: '区划名称',
      dataIndex: 'qhmc',
      key: 'qhmc',
      width: 200,
      ellipsis: true,
    },
    {
      title: '显示排序',
      dataIndex: 'xh',
      key: 'xh',
      width: 100,
    },
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
      let res = await medicalGroupDivisionApi.queryPage(params);
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
  function addMedicalGroupDivision() {
    formModal.value.showModal({});
  }

  // 编辑
  function editMedicalGroupDivision(record) {
    formModal.value.showModal(record);
  }

  // 删除
  function deleteMedicalGroupDivision(record) {
    Modal.confirm({
      title: '提醒',
      icon: createVNode(ExclamationCircleOutlined),
      content: '确定要删除该医疗集团区划吗?',
      okText: '删除',
      okType: 'danger',
      async onOk() {
        SmartLoading.show();
        try {
          await medicalGroupDivisionApi.delete(record.jtbh, record.qhbh);
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
