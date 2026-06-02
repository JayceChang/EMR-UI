/*
 * WebSocket 服务
 */
import { useMessageStore } from '/@/store/modules/system/message.js';
import { useUserStore } from '/@/store/modules/system/user.js';
import { localRead } from '/@/utils/local-util.js';
import LocalStorageKeyConst from '/@/constants/local-storage-key-const.js';
import { WEBSOCKET_CONFIG } from '/@/config/websocket-config.js';

class WebSocketService {
  constructor() {
    this.messageStore = null;
    this.userStore = null;
    this.wsUrl = '';
  }

  // 初始化服务
  init() {
    this.messageStore = useMessageStore();
    this.userStore = useUserStore();
    
    // 使用配置文件中的 WebSocket URL
    this.wsUrl = WEBSOCKET_CONFIG.getWebSocketUrl();
  }

  // 连接 WebSocket
  connect() {
    const token = localRead(LocalStorageKeyConst.USER_TOKEN);
    const employeeId = useUserStore().employeeId;
    
    if (!employeeId) {
      console.warn('用户未登录或未获取员工ID，无法建立 WebSocket 连接');
      return;
    }

    if (!this.messageStore) {
      this.init();
    }

    console.log('正在建立 WebSocket 连接...');
    this.messageStore.initWebSocket(this.wsUrl,employeeId);
  }

  // 断开连接
  disconnect() {
    if (this.messageStore) {
      this.messageStore.closeWebSocket();
    }
  }

  // 重连
  reconnect() {
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  // 发送消息
  sendMessage(message) {
    if (this.messageStore) {
      this.messageStore.sendMessage(message);
    }
  }

  // 标记消息为已读
  markAsRead(messageId, type = 'message') {
    if (this.messageStore) {
      this.messageStore.markAsRead(messageId, type);
    }
  }

  // 获取连接状态
  isConnected() {
    return this.messageStore ? this.messageStore.isConnected : false;
  }

  // 重置服务
  reset() {
    if (this.messageStore) {
      this.messageStore.reset();
    }
  }
}

// 创建单例实例
export const websocketService = new WebSocketService();