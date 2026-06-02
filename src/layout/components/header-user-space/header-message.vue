<!--
  * 消息通知
  *





-->

<template>
  <div>
    <a-popover v-model:open="show" trigger="click" placement="bottomLeft" :getPopupContainer="getPopupContainer">
      <a-button type="text" @click="showMessage" style="padding: 4px 5px">
        <a-badge :count="messageStore.totalUnreadCount">
          <div style="width: 26px; height: 26px">
            <BellOutlined :style="{ fontSize: '16px' }" />
          </div>
        </a-badge>
      </a-button>

      <template #content>
        <a-spin :spinning="loading">
          <a-tabs class="dropdown-tabs" centered :tabBarStyle="{ textAlign: 'center' }" style="width: 300px; z-index: 1030">
            <a-tab-pane key="message">
              <template #tab>
                未读消息
                <a-badge :count="unreadMessageCount" :show-zero="false" :offset="[-5, -15]" />
              </template>
              <a-list class="tab-pane" size="small">
                <a-list-item v-for="item in messageList" :key="item.messageId">
                  <a-list-item-meta>
                    <template #title>
                      <div class="title">
                        <a-badge status="error" />
                        <a @click="showMessageDetail(item)">{{ item.title }}</a>
                      </div>
                    </template>
                    <template #description>
                      <span> {{ timeago(item.createTime) }}</span>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
                <a-list-item v-if="unreadMessageCount > 3">
                  <a-button type="link" @click="gotoMessage" style="margin: 0 auto"> 查看更多</a-button>
                </a-list-item>
              </a-list>
            </a-tab-pane>
            <a-tab-pane key="notice">
              <template #tab>
                未读公告
                <a-badge :count="unreadNoticeCount" :show-zero="false" :offset="[-5, -15]" />
              </template>
              <a-list class="tab-pane" size="small">
                <a-list-item v-for="item in noticeList" :key="item.messageId">
                  <a-list-item-meta>
                    <template #title>
                      <div class="title">
                        <a-badge status="warning" />
                        <a @click="showNoticeDetail(item)">{{ item.title }}</a>
                      </div>
                    </template>
                    <template #description>
                      <span> {{ timeago(item.createTime) }}</span>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
                <a-list-item v-if="unreadNoticeCount > 3">
                  <a-button type="link" @click="gotoNotice" style="margin: 0 auto"> 查看更多</a-button>
                </a-list-item>
              </a-list>
            </a-tab-pane>
            <!-- <a-tab-pane key="to_be_done">
              <template #tab>
                待办工作
                <a-badge :count="toBeDoneCount" :show-zero="false" :offset="[-5, -15]" />
              </template>
              <a-list class="tab-pane" size="small" :locale="{ emptyText: '暂无待办' }">
                <a-list-item v-for="(item, index) in toBeDoneList" :key="index">
                  <a-list-item-meta>
                    <template #title>
                      <a-badge status="error" />
                      <a-tag v-if="item.starFlag" color="red">重要</a-tag>
                      <span>{{ item.title }}</span>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </a-list>
            </a-tab-pane> -->
          </a-tabs>
        </a-spin>
      </template>
    </a-popover>
    <MessageDetailModal ref="messageDetailModalRef" @refresh="handleMessageRefresh" />
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { BellOutlined } from '@ant-design/icons-vue';
  import { useUserStore } from '/@/store/modules/system/user.js';
  import { useMessageStore } from '/@/store/modules/system/message.js';
  import { smartSentry } from '/@/lib/smart-sentry.js';
  import { messageApi } from '/@/api/support/message-api.js';
  import dayjs from 'dayjs';
  import { theme } from 'ant-design-vue';
  import { useRouter } from 'vue-router';
  import MessageDetailModal from './header-message-detail-modal.vue';
  import localKey from '/@/constants/local-storage-key-const';
  import { localRead } from '/@/utils/local-util';
  import { websocketService } from '/@/services/websocket-service.js';

  const { useToken } = theme;
  const { token } = useToken();

  function getPopupContainer() {
    return document.body;
  }

  const loading = ref(false);
  const show = ref(false);

  // 获取消息 store
  const messageStore = useMessageStore();

  // 点击按钮打开消息气泡卡片
  function showMessage() {
    show.value = true;
    loadToBeDoneList();
  }

  function closeMessage() {
    show.value = false;
  }

  // ------------------------- 查询消息  -------------------------

  // 未读消息数量 - 使用 WebSocket store 的数据
  const unreadMessageCount = computed(() => {
    return messageStore.unreadMessageCount;
  });

  // 消息列表 - 使用 WebSocket store 的数据，只显示前3条
  const messageList = computed(() => {
    return messageStore.unreadMessages.slice(0, 3).map((msg) => ({
      messageId: msg.messageId,
      title: msg.title,
      createTime: msg.createTime,
      content: msg.content,
      contentUrl:msg.contentUrl,
      author: msg.author,
      messageType: msg.messageType,
    }));
  });

  // ------------------------- 查询公告  -------------------------

  // 未读公告数量 - 使用 WebSocket store 的数据
  const unreadNoticeCount = computed(() => {
    return messageStore.unreadNoticeCount;
  });

  // 公告列表 - 使用 WebSocket store 的数据，只显示前3条
  const noticeList = computed(() => {
    return messageStore.unreadNotices.slice(0, 3).map((notice) => ({
      messageId: notice.messageId,
      title: notice.title,
      createTime: notice.createTime,
      content: notice.content,
      author: notice.author,
      messageType: notice.messageType,
    }));
  });

  const messageDetailModalRef = ref();

  function showMessageDetail(data) {
    console.log('消息：', data);

    // 标记消息为已读
    messageStore.markAsRead(data.messageId, 'message');

    messageDetailModalRef.value.show(data);
    closeMessage();
  }

  const router = useRouter();

  function gotoMessage() {
    show.value = false;
    router.push({ path: '/account', query: { menuId: 'message' } });
  }

  // 显示公告详情
  function showNoticeDetail(data) {
    console.log('公告：', data);

    // 标记公告为已读
    messageStore.markAsRead(data.messageId, 'notice');

    messageDetailModalRef.value.show(data);
    closeMessage();
  }

  // 跳转到公告页面
  function gotoNotice() {
    show.value = false;
    router.push({ path: '/oa/notice/notice-list' });
  }

  // 处理消息刷新（当消息详情模态框关闭后调用）
  function handleMessageRefresh() {
    // WebSocket 模式下不需要手动刷新，数据会自动更新
    console.log('消息已刷新');
  }

  // ------------------------- 待办工作  -------------------------

  // 待办工作数
  const toBeDoneCount = computed(() => {
    return useUserStore().toBeDoneCount;
  });

  // 待办工作列表
  const toBeDoneList = ref([]);

  const loadToBeDoneList = async () => {
    try {
      loading.value = true;
      let localToBeDoneList = localRead(localKey.TO_BE_DONE);
      if (localToBeDoneList) {
        toBeDoneList.value = JSON.parse(localToBeDoneList).filter((e) => !e.doneFlag);
      }
    } catch (err) {
      smartSentry.captureError(err);
    } finally {
      loading.value = false;
    }
  };

  // ------------------------- 时间计算  -------------------------
  function timeago(dateStr) {
    let dateTimeStamp = dayjs(dateStr).toDate().getTime();
    let result = '';
    let minute = 1000 * 60; //把分，时，天，周，半个月，一个月用毫秒表示
    let hour = minute * 60;
    let day = hour * 24;
    let week = day * 7;
    let month = day * 30;
    let now = new Date().getTime(); //获取当前时间毫秒
    let diffValue = now - dateTimeStamp; //时间差

    if (diffValue < 0) {
      return '刚刚';
    }
    let minC = diffValue / minute; //计算时间差的分，时，天，周，月
    let hourC = diffValue / hour;
    let dayC = diffValue / day;
    let weekC = diffValue / week;
    let monthC = diffValue / month;
    if (monthC >= 1 && monthC <= 3) {
      result = ' ' + parseInt(monthC) + '月前';
    } else if (weekC >= 1 && weekC <= 3) {
      result = ' ' + parseInt(weekC) + '周前';
    } else if (dayC >= 1 && dayC <= 6) {
      result = ' ' + parseInt(dayC) + '天前';
    } else if (hourC >= 1 && hourC <= 23) {
      result = ' ' + parseInt(hourC) + '小时前';
    } else if (minC >= 1 && minC <= 59) {
      result = ' ' + parseInt(minC) + '分钟前';
    } else if (diffValue >= 0 && diffValue <= minute) {
      result = '刚刚';
    } else {
      let datetime = new Date();
      datetime.setTime(dateTimeStamp);
      let year = datetime.getFullYear();
      let month = datetime.getMonth() + 1 < 10 ? '0' + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
      let date = datetime.getDate() < 10 ? '0' + datetime.getDate() : datetime.getDate();
      result = year + '-' + month + '-' + date;
    }
    return result;
  }
</script>

<style lang="less" scoped>
  @smart-page-tag-operate-width: 40px;
  @color-primary: v-bind('token.colorPrimary');

  .message-icon-div {
    cursor: pointer;
    height: 32px;
    width: 42px;
    padding-left: 10px;
  }

  .message-icon-div:hover {
    background: @hover-bg-color !important;
  }

  .header-notice {
    display: inline-block;
    transition: all 0.3s;

    span {
      vertical-align: initial;
    }

    .notice-badge {
      color: inherit;
    }
  }

  .title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
  }

  .dropdown-tabs {
    background-color: @base-bg-color;
    border-radius: 4px;
  }

  .tab-pane {
    height: auto;
  }
</style>
