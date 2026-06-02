<!--
  * 指标管理步骤页面
  *
  * @Author:    Jayce
  * @Date:      2025-06-25
  * @Copyright  ZDS
-->
<template>
  <!-- 步骤导航 -->
  <a-card size="small" :bordered="false" :hoverable="true">
    <template #title>
      <span class="card-title"> 指标管理向导 </span>
    </template>
    <!-- 步骤操作按钮 -->
    <a-steps :current="current" :items="stepItems" class="custom-steps" :status="stepStatus" />
    <!-- 步骤内容 -->
    <div class="steps-content-wrapper">
      <a-spin :spinning="loading">
        <!-- 第一步：指标定义 -->
        <div v-show="current === 0" class="step-content">
          <IndicatorFormInline
            :modelValue="indicatorData"
            @change="handleIndicatorChange"
            @validate="handleIndicatorValidate"
            ref="indicatorFormRef"
          />
        </div>

        <!-- 第二步：指标取数配置 -->
        <div v-show="current === 1" class="step-content">
          <IndicatorConfigInline :indicator="configData" ref="configFormRef" />
        </div>

        <!-- 第三步：指标预览 -->
        <div v-show="current === 2" class="step-content">
          <IndicatorPreview :indicatorData="indicatorData" :configData="configData" @test="handleTest" @extraData="handleManualExtraData" @edit="handleEdit" @save="handleSave" />
        </div>
      </a-spin>
    </div>

    <div class="steps-action">
      <a-space>
        <a-button v-if="current > 0" @click="prev" :type="current === 2 ? 'primary' : 'default'">
          <template #icon><LeftOutlined /></template>
          上一步
        </a-button>

        <a-button v-if="current < steps.length - 1" type="primary" @click="next" :loading="validating">
          下一步
          <template #icon><RightOutlined /></template>
        </a-button>
      </a-space>
    </div>
  </a-card>
</template>

<script setup>
  import { ref, reactive, computed, nextTick } from 'vue';
  import { message } from 'ant-design-vue';
  import { SettingOutlined, LeftOutlined, RightOutlined, CheckOutlined } from '@ant-design/icons-vue';
  import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
  import { indicatorExtraConfigApi } from '/@/api/business/rating/indicator/manage/indicator-extra-config-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import IndicatorFormInline from './indicator-manage-form-inline.vue';
  import IndicatorConfigInline from './indicator-manage-config-inline.vue';
  import IndicatorPreview from './indicator-manage-preview.vue';

  // 定义emits
  const emits = defineEmits(['complete']);

  // 步骤相关状态
  const current = ref(0);
  const loading = ref(false);
  const validating = ref(false);
  const completing = ref(false);
  const isEditMode = ref(false); // 是否为编辑模式

  // 表单数据
  const indicatorDataDefault = {
    id: undefined,
    indicatorName: undefined,
    indicatorCode: undefined,
    indicatorType: undefined,
    disabledFlag: 1,
    sort: undefined,
    remark: undefined,
    parentId: undefined,
    isFillFlag: 0,
  };

  const indicatorData = reactive({ ...indicatorDataDefault });
  const configData = reactive({});

  // 表单引用
  const indicatorFormRef = ref();
  const configFormRef = ref();

  // 步骤定义
  const steps = [
    {
      title: '指标定义',
      description: '配置指标基础信息',
      icon: 'FormOutlined',
    },
    {
      title: '取数配置',
      description: '配置数据源和SQL',
      icon: 'DatabaseOutlined',
    },
    {
      title: '指标预览',
      description: '预览和确认配置',
      icon: 'EyeOutlined',
    },
  ];

  // 步骤项目
  const stepItems = computed(() => {
    return steps.map((step, index) => ({
      title: step.title,
      status: getStepStatus(index),
    }));
  });

  // 步骤状态
  const stepStatus = computed(() => {
    if (current.value === 0) return 'process';
    if (current.value === 1) return 'process';
    if (current.value === 2) return 'process';
    return 'finish';
  });

  // 获取步骤状态
  function getStepStatus(index) {
    if (index < current.value) return 'finish';
    if (index === current.value) return 'process';
    return 'wait';
  }

  // 下一步
  async function next() {
    if (current.value === 0) {
      // 验证指标定义表单
      validating.value = true;
      try {
        const isValid = await indicatorFormRef.value?.validate();
        if (isValid) {
          current.value++;
        } else {
          message.error('请完善指标定义信息');
        }
      } catch (error) {
        message.error('表单验证失败，请检查输入');
      } finally {
        validating.value = false;
      }
    } else if (current.value === 1) {
      // 验证配置表单并获取配置数据
      validating.value = true;
      try {
        // 获取配置表单数据
        if (configFormRef.value) {
          const formData = configFormRef.value.getFormData();
          Object.assign(configData, formData);
          console.log('获取到的配置数据:', configData);
        }

        // 这里可以添加配置表单的验证逻辑
        await new Promise((resolve) => setTimeout(resolve, 500)); // 模拟验证
        current.value++;
      } catch (error) {
        message.error('配置验证失败，请检查配置');
      } finally {
        validating.value = false;
      }
    }
  }

  // 上一步
  function prev() {
    current.value--;
  }

  // 处理指标数据变化
  function handleIndicatorChange(data) {
    Object.assign(indicatorData, data);
  }

  // 处理指标验证
  function handleIndicatorValidate(isValid, data) {
    if (isValid) {
      console.log('指标验证通过:', data);
    } else {
      console.log('指标验证失败:', data);
    }
  }

  // 处理测试
  function handleTest() {
    configFormRef.value?.testConnection();
    console.log('测试取数配置完成');
  }

  // 处理手动取数
  function handleManualExtraData() {
    configFormRef.value?.fetchDataPreview();
    console.log('测试手动取数完成');
  }

  // 处理编辑
  function handleEdit() {
    current.value = 0; // 跳转到配置步骤
  }

  // 处理保存
  function handleSave() {
    handleComplete();
  }

  // 完成配置
  async function handleComplete() {
    completing.value = true;
    try {
      //1. 保存指标基本信息
      saveIndicatorBaseInfo();
      //2. 保存指标取数配置信息
      saveIndicatorConfig();
      message.success('指标配置完成！');

      // 触发父组件的刷新
      emits('complete', { indicatorData, configData });
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      completing.value = false;
    }
  }

  //保存指标基本信息
  async function saveIndicatorBaseInfo() {
    try {

      if(indicatorData.id){
        //编辑
        await indicatorManageApi.update(indicatorData);
      }else{
        //新增
        const res = await indicatorManageApi.add(indicatorData);
        indicatorData.id = res.data.id;
        configData.indicatorId = indicatorData.id;
      }

      return true;
      
    } catch (error) {
      console.error('保存指标基础信息失败:', error);
      message.error('保存指标基础信息失败');
      return false;
    }
  }

  //保存指标取数配置信息
  async function saveIndicatorConfig() {
    try {
      if (!configData.indicatorId) {
        message.error('请先保存指标基础信息');
        return false;
      }

      if (configData.id) {
        //编辑
        await indicatorExtraConfigApi.update(configData);
      } else {
        //新增
        configData.indicatorId = indicatorData.id;
        await indicatorExtraConfigApi.add(configData);
      }

      return true;
      
    } catch (error) {
      console.error('保存指标取数配置失败:', error);
      message.error('保存指标取数配置失败');
      return false;
    }
  }


  // 重置表单数据
  function resetFormData() {
    Object.assign(indicatorData, indicatorDataDefault);
    Object.keys(configData).forEach((key) => delete configData[key]);
    current.value = 0;
    isEditMode.value = false;
  }

  // 启动新增指标模式
  function startNewIndicator(parentData = null) {
    console.log('=== 启动新增模式 ===');
    console.log('传入的parentData:', parentData);

    // 先重置表单数据
    resetFormData();
    console.log('重置后的indicatorData:', { ...indicatorData });

    // 如果有父级数据，设置父级ID（在重置之后设置）
    // 注意：从列表传来的是 { parentId: xxx }，所以直接使用 parentData.parentId
    if (parentData && parentData.parentId !== undefined) {
      indicatorData.parentId = parentData.parentId;
      console.log('设置parentId后的indicatorData:', { ...indicatorData });
    }

    isEditMode.value = false;
    current.value = 0;

    // 等待数据更新后清除验证状态
    nextTick(() => {
      console.log('nextTick后的indicatorData:', { ...indicatorData });
      // 数据绑定会自动同步indicatorData到表单组件
      // 不需要手动调用子组件的resetForm方法
    });
  }

  // 启动编辑指标模式
  async function startEditIndicator(indicator) {
    if (!indicator) {
      message.error('无效的指标数据');
      return;
    }

    loading.value = true;
    try {
      // 重置表单
      resetFormData();

      let indicatorBaseInfo = indicator;
      if (!indicator.id) {
        try {
          //加载基础信息
          const response = await indicatorManageApi.queryIndicatorById(indicator.id);
          if (response && response.data) {
            indicatorBaseInfo = response.data;
          }

          //加载指标配置信息
          await fetchIndicatorExtraConfig(indicator.id);
        } catch (error) {
          console.error('获取完整指标数据失败:', error);
          // 如果获取失败，继续使用传入的基础数据
        }
      }

      isEditMode.value = true;
      current.value = 0;

      // 等待组件更新后再设置数据
      await nextTick();

      // 填充指标基础数据
      Object.assign(indicatorData, indicatorBaseInfo);

      // //加载配置数据
      if (configFormRef.value && configFormRef.value.loadConfig) {
        configFormRef.value.loadConfig(indicator.id);
      }
    } catch (error) {
      console.error('启动编辑模式失败:', error);
      message.error('加载指标数据失败');
      smartSentry.captureError(error);
    } finally {
      loading.value = false;
    }
  }

  //Fetch indicator extra config by id
  async function fetchIndicatorExtraConfig(indicatoryId) {
    try {
      const res = await indicatorExtraConfigApi.queryIndicatorById(indicatoryId);
      if (res.ok && res.data) {
        // 将API返回的数据直接赋值给表单
        Object.assign(configData, res.data);
      } else {
        console.warn('Failed to fetch indicator extra config:', res.msg);
      }
    } catch (error) {
      smartSentry.captureError(error);
      message.error('加载取数配置发生错误');
    }
  }

  // 暴露方法给父组件
  defineExpose({
    startNewIndicator,
    startEditIndicator,
    resetFormData,
  });
</script>

<style lang="less" scoped>
  .custom-steps {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 10px 0px;
  }

  .steps-content-wrapper {
    flex: 1;
    overflow-y: auto;

    .step-content {
      min-height: 500px;
      animation: fadeIn 0.3s ease-in-out;
    }
  }

  .steps-action {
    position: absolute;
    bottom: 20px; /* 距离底部的距离，与卡片内边距一致 */
    right: 20px; /* 距离右侧的距离，与卡片内边距一致 */
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  // 深色主题适配
  [data-theme='dark'] {
    .indicator-steps-container {
      .steps-header {
        .steps-title {
          color: #1890ff;
        }

        .custom-steps {
          :deep(.ant-steps-item-description) {
            color: #999;
          }
        }
      }
    }
  }
</style>
