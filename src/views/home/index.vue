<template>
  <div class="indexMain">
    <div class="header">
      <div class="title">
        <img class="logo-img" src="/src/assets/images/logo/smart-admin-logo.png" />
        <span>{{ mainTitle }}</span>
      </div>
      <div class="mainInfo">
        <a-menu class="mainInfo_menu" v-model:selectedKeys="current" mode="horizontal" :items="items" @select="selectMenu" />
      </div>
      <div class="user-space" v-if="!channelLoginFlag">
        <a-dropdown>
          <div class="wrapper">
            <img class="avatar-image" :src="avatar" v-if="avatar" />
            <a-avatar v-else style="margin: 0 5px" :size="28" id="frontendAvatar">
              {{ avatarName }}
            </a-avatar>
            <span class="name">{{ userName }}</span>
          </div>
          <template #overlay>
            <a-menu :class="['avatar-menu']">
              <!--<a-menu-item @click="toAccount()">
                <UserOutlined />
                <span>个人中心</span>
              </a-menu-item>
              <a-menu-item @click="toAccount(ACCOUNT_MENU.PASSWORD.menuId)">
                <LockOutlined />
                <span>修改密码</span>
              </a-menu-item> -->
              <a-menu-item @click="toBackend">
                <SettingOutlined />
                <span>后台管理</span>
              </a-menu-item>
              <a-menu-item @click="handleLogout">
                <LogoutOutlined />
                <span>退出登录</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div class="user-space" v-else>
        <a-button type="primary" @click="goReturnScreen">返回大屏</a-button>
      </div>
    </div>
    <div class="topMain">
      <span v-for="item in navTop" :key="item.key" :class="navCurrent == item.key ? 'topNavSelect topNav' : 'topNav'" @click="navCurrent = item.key">
        {{ item.label }}
        <CloseOutlined
          v-if="navTop.length > 1 || item.key !== navTop[0].key"
          @click.stop="closeNavTop(item.key)"
          style="font-size: 10px; margin-left: 3px"
        />
      </span>
    </div>
    <div class="scan-height">
      <iframe v-for="item in navTop" :key="item.key" v-show="item.key == navCurrent" :src="item.src"> </iframe>
    </div>
  </div>
</template>
<script lang="js" setup>
  import { h, ref, nextTick, onMounted, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { useRouter } from 'vue-router';
  import { HOME_PAGE_PATH } from '/@/constants/system/home-const';
  import {
    RadarChartOutlined,
    SlidersOutlined,
    AreaChartOutlined,
    SettingOutlined,
    CloseOutlined,
    UserOutlined,
    LockOutlined,
    LogoutOutlined,
  } from '@ant-design/icons-vue';
  import { indicatorFrontEndApi } from '/@/api/business/rating/indicator/frontend/index';
  import { useUserStore } from '/@/store/modules/system/user';
  import { ACCOUNT_MENU } from '/@/views/system/account/account-menu.js';
  import { useWindowConfigTitle } from '/@/utils/window-config-util.js';
  import { getChannelReturnUrl, isChannelLogin } from '/@/utils/channel-login-util.js';

  const router = useRouter();
  const userStore = useUserStore();

  const { mainTitle } = useWindowConfigTitle();
  const channelLoginFlag = ref(isChannelLogin());
  const channelReturnUrl = ref(getChannelReturnUrl() || '');
  const showReturnScreenBtn = computed(() => channelLoginFlag.value && !!channelReturnUrl.value);

  // 用户信息
  const userName = computed(() => userStore.actualName || '用户');
  const avatar = computed(() => userStore.avatar);
  const avatarName = computed(() => {
    const name = userStore.actualName || '';
    return name.length > 0 ? name.substring(0, 1) : 'U';
  });

  // 头像背景颜色
  const AVATAR_BACKGROUND_COLOR_ARRAY = ['#87d068', '#00B853', '#f56a00', '#1890ff'];

  // 更新头像信息
  function updateAvatar() {
    if (userStore.actualName) {
      const avatarElement = document.getElementById('frontendAvatar');
      if (avatarElement) {
        avatarElement.style.backgroundColor = AVATAR_BACKGROUND_COLOR_ARRAY[hashcode(avatarName.value) % 4];
      }
    }
  }

  /**
   * 通过计算固定字符串的hash，来选择颜色，这样每次登录的颜色是相同的
   */
  function hashcode(str) {
    let hash = 1,
      i,
      chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  // 跳转到个人中心
  function toAccount(menuId) {
    router.push({
      path: '/account',
      query: { menuId },
    });
  }

  // 跳转到后台管理
  function toBackend() {
    router.push(HOME_PAGE_PATH);
  }

  function goReturnScreen() {
    if (!showReturnScreenBtn.value) {
      message.warning('未获取到回跳地址，请从渠道平台重新进入');
      return;
    }
    window.location.href = channelReturnUrl.value;
  }

  // 退出登录
  function handleLogout() {
    userStore.logout();
    router.push('/login');
  }

  onMounted(updateAvatar);

  const current = ref([]);
  const navCurrent = ref('');
  const navTop = ref([]);
  const items = ref([]);
  const selectMenu = ({ item, key, selectedKeys }) => {
    console.log(current.value);
    if (key == 'home') {
      return;
    }
    let nValue = key.replace('d', 't');
    navCurrent.value = nValue;
    if (navTop.value.findIndex((x) => x.key == nValue) < 0) {
      navTop.value.push({
        key: nValue,
        label: item.originItemValue.label,
        src: item.originItemValue.src,
      });
    }
  };

  // 检查菜单项是否需要多列显示
  const getMenuClass = (children) => {
    if (children && children.length > 10) {
      return 'multi-column-submenu';
    }
    return '';
  };
  const closeNavTop = (key) => {
    console.log(key);
    // 找到要关闭的标签索引
    let idx = navTop.value.findIndex((x) => x.key == key);

    // 如果找不到标签或者导航为空，直接返回
    if (idx === -1 || navTop.value.length === 0) {
      return;
    }

    // 如果关闭的不是当前激活的标签
    if (navCurrent.value != key) {
      // 直接移除该标签
      navTop.value = navTop.value.filter((x) => x.key != key);
    } else {
      // 如果关闭的是当前激活的标签

      // 如果这是最后一个标签，直接清空
      if (navTop.value.length === 1) {
        navTop.value = [];
        navCurrent.value = '';
        current.value = [];
        return;
      }

      // 如果是第一个标签，激活下一个标签
      if (idx === 0) {
        let nValue = navTop.value[1].key;
        navTop.value = navTop.value.filter((x) => x.key != key);
        navCurrent.value = nValue;
        current.value = [nValue.replace('t', 'd')];
      } else {
        // 否则激活前一个标签
        let nValue = navTop.value[idx - 1].key;
        navTop.value = navTop.value.filter((x) => x.key != key);
        navCurrent.value = nValue;
        current.value = [nValue.replace('t', 'd')];
      }
    }
  };

  /**
   * 构建子指标
   * @param children
   */
  const buildChildren = (children) => {
    if (!children || children.length === 0) {
      return [];
    }

    return children.map((child) => {
      const item = {
        key: child.indicatorCode,
        label: child.indicatorName,
        src: child.pageUrl,
        popupClassName: children.length > 10 ? 'index_menu_item' : '',
      };

      // 递归处理子节点
      if (child.children && child.children.length > 0) {
        item.children = buildChildren(child.children);
      }
      return item;
    });
  };

  const initUserMenu = async () => {
    try {
      const res = await indicatorFrontEndApi.queryIndicatorFrontEndTreeByLoginUser();
      console.log(res);
      if (res.ok && res.data) {
        let menuList = res.data || [];
        console.log(menuList);
        if (menuList && menuList.length > 0) {
          menuList.forEach((item) => {
            items.value.push({
              key: item.indicatorCode,
              label: item.indicatorName,
              title: item.indicatorName,
              children: buildChildren(item.children),
            });
          });

          // 设置默认选中的菜单和导航
          if (items.value.length > 0 && items.value[0].children && items.value[0].children.length > 0) {
            // 设置默认选中第一个指标的第一个子项
            const firstIndicator = items.value[0];
            const firstChild = firstIndicator.children[0];

            // 设置当前选中的菜单项
            current.value = [firstChild.key];

            // 设置当前选中的导航标签
            const navKey = firstChild.key.replace('d', 't');
            navCurrent.value = navKey;

            // 添加到导航标签列表
            navTop.value = [
              {
                key: navKey,
                label: firstChild.label,
                src: firstChild.src,
              },
            ];
          }
        }
      } else {
        message.error(res.msg || '获取数据失败');
      }
    } catch (error) {
      console.error('获取数据出错:', error);
      message.error('获取数据出错');
    } finally {
      console.log('处理完成');
    }
  };

  onMounted(initUserMenu);
</script>
<style lang="less" scoped>
  @import './index.less';

  // 添加头像样式
  .user-space {
    .wrapper {
      cursor: pointer;
      display: flex;
      align-items: center;

      .avatar-image {
        width: 28px;
        height: 28px;
        object-fit: cover;
        border-radius: 50%;
      }

      .name {
        margin: 8px;
        font-weight: 500;
      }
    }
  }
</style>
<style>
  div.ant-menu-submenu {
    max-width: 870px !important;
  }
  li.ant-menu-item[popupClassName='index_menu_item'] {
    display: inline-grid !important;
    width: 280px !important;
    border: solid 1px #f1f1f1;
    text-align: center;
  }
</style>
