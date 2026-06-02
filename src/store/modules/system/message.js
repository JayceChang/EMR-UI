/*
 * WebSocket 消息管理 Store
 */
import { defineStore } from 'pinia';
import { smartSentry } from '/@/lib/smart-sentry.js';
import { WEBSOCKET_CONFIG } from '/@/config/websocket-config.js';

export const useMessageStore = defineStore({
  id: 'messageStore',
  state: () => ({
    // WebSocket 连接状态
    connected: false,
    // WebSocket 实例
    websocket: null,
    // 重连次数
    reconnectCount: 0,
    // 最大重连次数
    maxReconnectCount: WEBSOCKET_CONFIG.MAX_RECONNECT_COUNT,
    // 重连定时器
    reconnectTimer: null,
    // 心跳定时器
    heartbeatTimer: null,
    // 心跳间隔（毫秒）
    heartbeatInterval: WEBSOCKET_CONFIG.HEARTBEAT_INTERVAL,

    // 消息数据
    // 未读消息列表
    unreadMessages: [],
    // 未读公告列表
    unreadNotices: [],
    // 未读消息数量
    unreadMessageCount: 0,
    // 未读公告数量
    unreadNoticeCount: 0,
  }),

  getters: {
    // 获取连接状态
    isConnected: (state) => state.connected,

    // 获取未读消息总数
    totalUnreadCount: (state) => state.unreadMessageCount + state.unreadNoticeCount,

    // 获取工作台显示的消息数据
    workbenchMessages: (state) => ({
      1: state.unreadMessages, // 未读消息
      2: state.unreadNotices, // 未读公告
    }),
  },

  actions: {
    // 初始化 WebSocket 连接
    initWebSocket(url, employeeId) {
      try {
        // 如果已经连接，先关闭
        if (this.websocket) {
          this.closeWebSocket();
        }

        // 创建 WebSocket 连接
        const wsUrl = `${url}?userId=${employeeId}`;
        this.websocket = new WebSocket(wsUrl);

        // 连接打开
        this.websocket.onopen = () => {
          console.log('WebSocket 连接已建立');
          this.connected = true;
          this.reconnectCount = 0;
          this.startHeartbeat();

          // 连接建立后，请求初始数据
          this.requestInitialData();
        };

        // 接收消息
        this.websocket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        // 连接关闭
        this.websocket.onclose = (event) => {
          console.log('WebSocket 连接已关闭', event);
          this.connected = false;
          this.stopHeartbeat();

          // 如果不是主动关闭，尝试重连
          if (event.code !== 1000 && this.reconnectCount < this.maxReconnectCount) {
            this.attemptReconnect(url, employeeId);
          }
        };

        // 连接错误
        this.websocket.onerror = (error) => {
          console.error('WebSocket 连接错误:', error);
          smartSentry.captureError(error);
          this.connected = false;
        };
      } catch (error) {
        console.error('初始化 WebSocket 失败:', error);
        smartSentry.captureError(error);
      }
    },

    // 处理接收到的消息
    handleMessage(data) {
      try {
        const message = JSON.parse(data);

        console.log('接收到的新消息-->', message);

        // 根据消息的 title 或 type 字段判断消息类型
        const type = message.type;

        switch (type) {
          case WEBSOCKET_CONFIG.MESSAGE_TYPES.HEARTBEAT:
            // 心跳响应，不需要处理
            break;

          case WEBSOCKET_CONFIG.MESSAGE_TYPES.MESSAGE:
            // 新消息
            this.handleNewMessage(message.data || message);
            break;

          case WEBSOCKET_CONFIG.MESSAGE_TYPES.NOTICE:
            // 新公告
            this.handleNewNotice(message.data || message);
            break;

          case WEBSOCKET_CONFIG.MESSAGE_TYPES.MESSAGE_LIST:
            // 消息列表更新
            this.updateMessageList(message.data || message);
            break;

          case WEBSOCKET_CONFIG.MESSAGE_TYPES.NOTICE_LIST:
            // 公告列表更新
            this.updateNoticeList(message.data || message);
            break;

          case 'MESSAGE_READ':
          case WEBSOCKET_CONFIG.MESSAGE_TYPES.MESSAGE_READ:
            // 消息已读 - 处理后端发送的已读消息
            this.handleMessageRead(message);
            break;

          default:
            console.log('未知消息类型:', type, message);
        }
      } catch (error) {
        console.error('处理 WebSocket 消息失败:', error);
        smartSentry.captureError(error);
      }
    },

    // 处理新消息
    handleNewMessage(messageData) {
      // 添加到未读消息列表
      this.unreadMessages.unshift({
        messageId: messageData.id || messageData.messageId,
        title: messageData.title,
        author: messageData.author,
        createTime: messageData.time || messageData.createTime,
        content: messageData.content,
        contentUrl:messageData.contentUrl,
        messageType: messageData.messageType,
      });

      // 更新未读消息数量
      this.unreadMessageCount = this.unreadMessages.length;

      console.log('收到新消息:', messageData.title);
    },

    // 处理新公告
    handleNewNotice(noticeData) {
      // 添加到未读公告列表
      this.unreadNotices.unshift({
        messageId: noticeData.id || noticeData.messageId,
        title: noticeData.title,
        author: noticeData.author,
        createTime: noticeData.time || noticeData.createTime,
        content: noticeData.content,
        messageType: noticeData.messageType,
      });

      // 更新未读公告数量
      this.unreadNoticeCount = this.unreadNotices.length;

      console.log('收到新公告:', noticeData.title);
    },

    // 更新消息列表
    updateMessageList(messageList) {
      console.log('更新消息列表:', messageList);
      this.unreadMessages = (messageList || []).map((msg) => ({
        messageId: msg.id || msg.messageId,
        title: msg.title,
        author: msg.author,
        createTime: msg.time || msg.createTime,
        content: msg.content,
        contentUrl:msg.contentUrl,
        messageType: msg.messageType,
      }));
      this.unreadMessageCount = this.unreadMessages.length;
      console.log('消息列表更新完成，数量:', this.unreadMessageCount);
    },

    // 更新公告列表
    updateNoticeList(noticeList) {
      console.log('更新公告列表:', noticeList);
      this.unreadNotices = (noticeList || []).map((notice) => ({
        messageId: notice.id || notice.messageId,
        title: notice.title,
        author: notice.author,
        createTime: notice.time || notice.createTime,
        content: notice.content,
        messageType: notice.messageType,
      }));
      this.unreadNoticeCount = this.unreadNotices.length;
      console.log('公告列表更新完成，数量:', this.unreadNoticeCount);
    },

    // 处理消息已读
    handleMessageRead(readData) {
      console.log('处理消息已读:', readData);

      const messageId = readData.messageId || readData.id;
      const messageType = readData.messageType;

      if (!messageId) {
        console.warn('消息已读处理失败：缺少消息ID', readData);
        return;
      }

      // 根据 messageType 判断是消息还是公告
      // messageType: 1 = 消息, 2 = 公告
      if (messageType === 1) {
        // 从未读消息列表中移除
        const originalLength = this.unreadMessages.length;
        this.unreadMessages = this.unreadMessages.filter((msg) => msg.messageId !== messageId);
        this.unreadMessageCount = this.unreadMessages.length;

        console.log(`消息已读处理完成，消息ID: ${messageId}，移除前: ${originalLength}，移除后: ${this.unreadMessageCount}`);
      } else if (messageType === 2) {
        // 从未读公告列表中移除
        const originalLength = this.unreadNotices.length;
        this.unreadNotices = this.unreadNotices.filter((notice) => notice.messageId !== messageId);
        this.unreadNoticeCount = this.unreadNotices.length;

        console.log(`公告已读处理完成，公告ID: ${messageId}，移除前: ${originalLength}，移除后: ${this.unreadNoticeCount}`);
      } else {
        console.warn('未知的消息类型:', messageType, readData);
      }
    },

    // 发送消息
    sendMessage(message) {
      if (this.connected && this.websocket) {
        this.websocket.send(JSON.stringify(message));
      } else {
        console.warn('WebSocket 未连接，无法发送消息');
      }
    },

    // 标记消息为已读
    async markAsRead(messageId, type = 'message') {
      try {
        // 使用HTTP API标记消息为已读，而不是WebSocket
        const { messageApi } = await import('/@/api/support/message-api.js');
        if (type === 'message') {
          await messageApi.updateReadFlag(messageId);
        } else if (type === 'notice') {
          await messageApi.noticeView(messageId);
        } else {
          console.log('未知类型，跳过处理');
        }

        console.log(`消息已标记为已读: ${messageId}, 类型: ${type}`);

        // 注意：不需要手动更新本地状态，因为后端会通过WebSocket发送已读消息通知
        // 这样可以确保所有客户端都能同步收到消息已读的状态更新
      } catch (error) {
        console.error('标记消息已读失败:', error);
        smartSentry.captureError(error);
      }
    },

    // 开始心跳
    startHeartbeat() {
      this.stopHeartbeat();
      this.heartbeatTimer = setInterval(() => {
        if (this.connected && this.websocket) {
          this.sendMessage({ type: WEBSOCKET_CONFIG.MESSAGE_TYPES.HEARTBEAT });
        }
      }, this.heartbeatInterval);
    },

    // 停止心跳
    stopHeartbeat() {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
    },

    // 尝试重连
    attemptReconnect(url, employeeId) {
      if (this.reconnectCount >= this.maxReconnectCount) {
        console.log('达到最大重连次数，停止重连');
        return;
      }

      this.reconnectCount++;
      console.log(`尝试第 ${this.reconnectCount} 次重连...`);

      this.reconnectTimer = setTimeout(
        () => {
          this.initWebSocket(url, employeeId);
        },
        Math.pow(2, this.reconnectCount) * WEBSOCKET_CONFIG.RECONNECT_BASE_DELAY
      ); // 指数退避
    },

    // 关闭 WebSocket 连接
    closeWebSocket() {
      this.stopHeartbeat();

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      if (this.websocket) {
        this.websocket.close(1000, '主动关闭');
        this.websocket = null;
      }

      this.connected = false;
      this.reconnectCount = 0;
    },

    // 请求初始数据
    async requestInitialData() {
      // 发送请求获取初始消息列表
      const { useUserStore } = await import('/@/store/modules/system/user.js');

      const userStore = useUserStore();
      const employeeId = userStore.employeeId;
      this.sendMessage({
        type: WEBSOCKET_CONFIG.MESSAGE_TYPES.GET_INITIAL_DATA,
        data: { userId: employeeId },
      });

      //备用方案：如果 WebSocket 没有响应，使用 API 调用
      setTimeout(() => {
        if (this.unreadMessages.length === 0 && this.unreadNotices.length === 0) {
          this.loadInitialDataFromAPI();
        }
      }, 1000); // 3秒后如果还没有数据，则使用 API 调用
    },

    // 从 API 加载初始数据（备用方案）
    async loadInitialDataFromAPI() {
      try {
        const { useUserStore } = await import('/@/store/modules/system/user.js');
        const { workbenchApi } = await import('/@/api/business/rating/workbench/workbench-api.js');

        const userStore = useUserStore();
        const employeeId = userStore.employeeId;

        if (!employeeId) {
          console.warn('无法获取用户ID，跳过初始数据加载');
          return;
        }

        console.log('使用 API 加载初始消息数据...');
        const response = await workbenchApi.unReadMsgAndNotice(employeeId);

        if (response.data && response.data.msgAndNotice) {
          const msgData = response.data.msgAndNotice;

          // 更新消息列表
          if (msgData['1']) {
            this.updateMessageList(msgData['1']);
          }

          // 更新公告列表
          if (msgData['2']) {
            this.updateNoticeList(msgData['2']);
          }

          console.log('初始消息数据加载完成');
        }
      } catch (error) {
        console.error('从 API 加载初始数据失败:', error);
      }
    },

    // 重置状态
    reset() {
      this.closeWebSocket();
      this.unreadMessages = [];
      this.unreadNotices = [];
      this.unreadMessageCount = 0;
      this.unreadNoticeCount = 0;
    },
  },
});
