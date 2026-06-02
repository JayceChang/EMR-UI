<!--
  * 404 不存在 页面
  *





-->
<template>
  <div class="error-page-container">
    <!-- 用户菜单 -->
    <div class="user-space">
      <a-dropdown>
        <div class="wrapper">
          <img class="avatar-image" :src="avatar" v-if="avatar" />
          <a-avatar v-else style="margin: 0 5px" :size="28">
            {{ avatarName }}
          </a-avatar>
          <span class="name">{{ userName }}</span>
        </div>
        <template #overlay>
          <a-menu :class="['avatar-menu']">
            <a-menu-item @click="handleLogout">
              <LogoutOutlined />
              <span>退出登录</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <!-- 404错误内容 -->
    <div class="error-content">
      <a-result status="404" title="对不起，您访问的内容不存在！">
        <template #extra>
          <a-button type="primary" @click="goHome">返回首页</a-button>
        </template>
      </a-result>
    </div>
  </div>
</template>
<script setup>
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { SettingOutlined, LogoutOutlined } from '@ant-design/icons-vue';
  import { useUserStore } from '/@/store/modules/system/user';
  import { FRONT_PAGE_NAME } from '/@/constants/system/home-const';

  const router = useRouter();
  const userStore = useUserStore();

  // 用户信息
  const avatar = computed(() => userStore.avatar);
  const userName = computed(() => userStore.actualName);
  const avatarName = computed(() => {
    if (userStore.actualName) {
      return userStore.actualName.charAt(0).toUpperCase();
    }
    return '';
  });

  function goHome() {
    router.push({ name: FRONT_PAGE_NAME });
  }

  // 跳转到后台管理
  function toBackend() {
    router.push('/home');
  }

  // 退出登录
  function handleLogout() {
    userStore.logout();
    router.push('/login');
  }
</script>

<style lang="less" scoped>
.error-page-container {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;

  .user-space {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;

    .wrapper {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      transition: background-color 0.3s;

      &:hover {
        background-color: #f5f5f5;
      }

      .avatar-image {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        margin-right: 8px;
      }

      .name {
        font-size: 14px;
        color: #333;
        margin-left: 5px;
      }
    }
  }

  .error-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.avatar-menu {
  min-width: 120px;
}
</style>
