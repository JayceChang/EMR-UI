<template>
  <a-modal v-model:open="visible" title="手动取数" :width="700" :maskClosable="false" :closable="true" :footer="null" class="manual-fetch-modal">
    <div class="modal-content">
      <a-row :gutter="16">
        <!-- 左列 -->
        <a-col :span="12">
          <a-row class="form-row">
            <a-col :span="8" class="label">起始时间:</a-col>
            <a-col :span="16">
              <a-date-picker v-model:value="formData.startTime" format="YYYY-MM-DD" style="width: 100%" />
            </a-col>
          </a-row>

          <a-row class="form-row">
            <a-col :span="8" class="label">指标编码:</a-col>
            <a-col :span="16">
              <a-input v-model:value="formData.indicatorCode" :disabled="true" />
            </a-col>
          </a-row>
        </a-col>

        <!-- 右列 -->
        <a-col :span="12">
          <a-row class="form-row">
            <a-col :span="8" class="label">截止时间:</a-col>
            <a-col :span="16">
              <a-date-picker v-model:value="formData.endTime" format="YYYY-MM-DD" style="width: 100%" />
            </a-col>
          </a-row>
        </a-col>
      </a-row>

      <!-- 处理结果占据整行 -->
      <a-row class="form-row result-row">
        <a-col :span="4" class="label">处理结果:</a-col>
        <a-col :span="20">
          <a-textarea v-model:value="formData.result" :rows="4" :disabled="true" placeholder="处理完成后显示结果" />
        </a-col>
      </a-row>

      <div class="action-buttons">
        <a-space>
          <a-button type="primary" @click="handleProcess" :loading="processing">
            <tool-outlined />
            处理
          </a-button>
          <a-button type="primary" @click="close">
            <close-circle-outlined />
            关闭 
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { message } from 'ant-design-vue';
  import { ToolOutlined,CloseCircleOutlined } from '@ant-design/icons-vue';
  import { ratingJobApi } from '/@/api/business/rating/job/rating-job-api';

  // 模态框可见性
  const visible = ref(false);
  // 处理中状态
  const processing = ref(false);

  // 表单数据
  const formData = reactive({
    indicatorCode: '',
    indicatorId: null,
    startTime: null,
    endTime: null,
    result: '',
  });

  // 当前记录
  const currentRecord = ref(null);

  // 显示模态框
  function show(record) {
    visible.value = true;
    currentRecord.value = record;

    // 重置表单数据
    formData.indicatorCode = record.indicatorCode || '';
    formData.indicatorId = record.id;
    formData.startTime = null;
    formData.endTime = null;
    formData.result = '';
  }

  // 处理数据
  async function handleProcess() {
    // 验证表单
    if (!formData.startTime || !formData.endTime) {
      message.error('请选择起始时间和截止时间');
      return;
    }

    // 验证时间范围
    if (formData.endTime < formData.startTime) {
      message.error('截止时间不能早于起始时间');
      return;
    }

    try {
      processing.value = true;

      // 构建请求参数
      const params = {
        code: formData.indicatorCode,
        bdate: formData.startTime.format('YYYY-MM-DD'),
        edate: formData.endTime.format('YYYY-MM-DD'),
      };

      // 调用API
      const response = await ratingJobApi.manualFetch(params);

      // 处理响应
      if (response) {
        if(response.code==0){
          formData.result = response.data || '处理成功';
          message.success('数据抓取成功');
        }
        else{
          formData.result = response.msg || '处理异常';
          message.error(formData.result);
        }
       
      } else {
        formData.result = '处理失败，未返回有效数据';
      }
    } catch (error) {
      console.error('数据抓取失败:', error);
      formData.result = `处理失败: ${error.message || '未知错误'}`;
      message.error('数据抓取失败');
    } finally {
      processing.value = false;
    }
  }

  // 关闭模态框
  function close() {
    visible.value = false;
  }

  // 暴露方法
  defineExpose({
    show,
  });
</script>

<style lang="less" scoped>
  .manual-fetch-modal {
    :deep(.ant-modal-header) {
      background-color: #4a90e2;

      .ant-modal-title {
        color: white;
        font-weight: bold;
      }
    }

    :deep(.ant-modal-close) {
      color: white;
    }

    .modal-content {
      padding: 10px 0;

      .form-row {
        margin-bottom: 16px;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 8px;

        .label {
          text-align: right;
          padding-right: 12px;
          line-height: 32px;
          font-weight: bold;
        }
      }

      .result-row {
        margin-top: 8px;
      }

      .action-buttons {
        text-align: center;
        margin-top: 20px;

        .anticon {
          margin-right: 5px;
        }
      }
    }
  }
</style>
