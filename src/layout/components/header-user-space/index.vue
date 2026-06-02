<!--
  * 头部一整行
  *





-->
<template>
  <a-space :size="10">
    <div class="setting">
      <!-- // 消息通知 -->
      <!-- <HeaderMessage ref="headerMessage" /> -->
      <!-- // 国际化 -->
      <!-- <a-button type="text" @click="showSetting" class="operate-icon">
        <template #icon><switcher-outlined /></template>
      </a-button> -->
      <!-- // 设置 -->
      <!-- <a-button type="text" @click="showSetting" class="operate-icon">
        <template #icon><setting-outlined /></template>
      </a-button> -->
    </div>
    <!---头像信息--->
    <div class="user-space-item" v-if="!channelLoginFlag">
      <HeaderAvatar />
    </div>
    <div class="user-space-item" v-else>
      <a-button type="primary" @click="goReturnScreen">返回大屏</a-button>
    </div>
    <!---帮助文档--->
    <!-- <div class="user-space-item" @click="showHelpDoc" v-if="showHelpDocFlag">
      <span>帮助文档</span>
      <DoubleLeftOutlined v-if="!helpDocExpandFlag" />
    </div>

    <HeaderSetting ref="headerSetting" /> -->
  </a-space>
</template>

<script setup>
  import { message } from 'ant-design-vue';
  import HeaderAvatar from './header-avatar.vue';
  import HeaderSetting from './header-setting.vue';
  import HeaderMessage from './header-message.vue';
  import { useAppConfigStore } from '/@/store/modules/system/app-config';
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import { theme } from 'ant-design-vue';
  import { getChannelReturnUrl, isChannelLogin } from '/@/utils/channel-login-util.js';

  // 设置
  const headerSetting = ref();
  function showSetting() {
    headerSetting.value.show();
  }

  //帮助文档
  function showHelpDoc() {
    useAppConfigStore().showHelpDoc();
  }

  const showHelpDocFlag = computed(() => {
    return useAppConfigStore().helpDocFlag;
  });

  const helpDocExpandFlag = computed(() => {
    return useAppConfigStore().helpDocExpandFlag;
  });

  const { useToken } = theme;
  const { token } = useToken();

  const channelLoginFlag = ref(isChannelLogin());
  const channelReturnUrl = ref(getChannelReturnUrl() || '');

  const refreshChannelState = () => {
    channelLoginFlag.value = isChannelLogin();
    channelReturnUrl.value = getChannelReturnUrl() || '';
  };

  function goReturnScreen() {
    if (!channelReturnUrl.value) {
      message.warning('未获取到回跳地址，请从渠道平台重新进入');
      return;
    }
    window.location.href = channelReturnUrl.value;
  }

  onMounted(() => {
    window.addEventListener('channel-login-updated', refreshChannelState);
  });

  onUnmounted(() => {
    window.removeEventListener('channel-login-updated', refreshChannelState);
  });
</script>

<style lang="less" scoped>
  .user-space-item {
    height: 100%;
    color: inherit;
    padding: 0 12px;
    cursor: pointer;
    align-self: center;

    a {
      color: inherit;

      i {
        font-size: 16px;
      }
    }
  }

  .user-space-item:hover {
    color: v-bind('token.colorPrimary');
    background-color: @hover-bg-color !important;
  }

  .setting {
    height: @header-user-height;
    line-height: @header-user-height;
    vertical-align: middle;
    display: flex;
    align-items: center;
  }
  .operate-icon {
    margin-left: 20px;
  }
</style>
