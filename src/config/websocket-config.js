/*
 * WebSocket 配置
 */

// WebSocket 配置
export const WEBSOCKET_CONFIG = {
  // 心跳间隔（毫秒）
  HEARTBEAT_INTERVAL: 30000,
  
  // 最大重连次数
  MAX_RECONNECT_COUNT: 5,
  
  // 重连基础延迟（毫秒）
  RECONNECT_BASE_DELAY: 1000,

  
  
  // WebSocket URL 配置
  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;//主机
    const port = '1024';//后端固定端口
    
    // 根据环境返回不同的 WebSocket 地址
    if (import.meta.env.DEV) {
      // 开发环境
      return 'ws://localhost:1024/ws/message';
    } else if (import.meta.env.VITE_APP_ENV === 'test') {
      // 测试环境
      return `${protocol}//${host}:${port}/test-api/ws/message`;
    } else {
      // 生产环境
      return `${protocol}//${host}:${port}/ws/message`;
    }
  },
  
  // 消息类型枚举
  MESSAGE_TYPES: {
    HEARTBEAT: 'heartbeat',
    MESSAGE: 'message',
    NOTICE: 'notice',
    MESSAGE_LIST: 'message_list',
    NOTICE_LIST: 'notice_list',
    MESSAGE_READ: 'message_read',
    MARK_READ: 'mark_read',
    GET_INITIAL_DATA: 'get_initial_data',
  },
  
  // WebSocket 状态码
  CLOSE_CODES: {
    NORMAL_CLOSURE: 1000,
    GOING_AWAY: 1001,
    PROTOCOL_ERROR: 1002,
    UNSUPPORTED_DATA: 1003,
    NO_STATUS_RECEIVED: 1005,
    ABNORMAL_CLOSURE: 1006,
    INVALID_FRAME_PAYLOAD_DATA: 1007,
    POLICY_VIOLATION: 1008,
    MESSAGE_TOO_BIG: 1009,
    MANDATORY_EXTENSION: 1010,
    INTERNAL_SERVER_ERROR: 1011,
    SERVICE_RESTART: 1012,
    TRY_AGAIN_LATER: 1013,
    BAD_GATEWAY: 1014,
    TLS_HANDSHAKE: 1015,
  },
};