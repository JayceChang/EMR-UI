<template>
  <div class="channel-auth-error-page">
    <a-result :status="pageStatus" :title="pageTitle" :sub-title="pageSubTitle">
      <template #extra>
        <a-button v-if="showReturnButton" type="primary" @click="goReturnUrl">返回大屏</a-button>
        <a-button @click="goBack">返回上一页</a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { getChannelReturnUrl } from '/@/utils/channel-login-util.js';

  const getReasonByRoute = () => {
    const hashUrl = window.location.hash || '';
    const queryIndex = hashUrl.indexOf('?');
    if (queryIndex === -1) {
      return 'expired';
    }
    const query = hashUrl.substring(queryIndex + 1);
    const params = new URLSearchParams(query);
    return params.get('reason') || 'expired';
  };

  const reason = getReasonByRoute();

  const pageTitle = computed(() => {
    return reason === 'invalid' ? '访问链接无效' : '渠道登录已失效';
  });

  const pageSubTitle = computed(() => {
    return reason === 'invalid' ? '该链接已失效或参数错误，请联系渠道管理员获取最新入口。' : '请返回业务平台重新进入系统。';
  });

  const pageStatus = computed(() => {
    return reason === 'invalid' ? 'error' : 'warning';
  });

  const getReturnUrlByRoute = () => {
    const hashUrl = window.location.hash || '';
    const queryIndex = hashUrl.indexOf('?');
    if (queryIndex === -1) {
      return '';
    }
    const query = hashUrl.substring(queryIndex + 1);
    const params = new URLSearchParams(query);
    return params.get('returnUrl') || '';
  };

  const goReturnUrl = () => {
    const returnUrl = getReturnUrlByRoute() || getChannelReturnUrl();
    if (returnUrl) {
      window.location.href = returnUrl;
      return;
    }
    message.warning('未获取到回跳地址，请从渠道平台重新进入');
  };

  const showReturnButton = computed(() => {
    if (reason === 'invalid') {
      return false;
    }
    return !!(getReturnUrlByRoute() || getChannelReturnUrl());
  });

  const goBack = () => {
    window.history.length > 1 ? window.history.back() : window.location.replace('/');
  };
</script>

<style scoped>
  .channel-auth-error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  }
</style>
