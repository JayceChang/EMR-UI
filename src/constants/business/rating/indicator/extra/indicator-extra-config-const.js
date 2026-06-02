/**
 * 指标执行状态 枚举
 *
 */


//指标执行状态
export const INDICATOR_HANDLE_STATUS_ENUM = {
  NOT_HANDLE: {
    value: 0,
    desc: '未处理',
  },
  HANDEL_PROCESSING: {
    value: 1,
    desc: '处理中',
  },
  HANDLE_ERROR: {
    value: 2,
    desc: '出现异常',
  },
  HANDLE_SUCCESS: {
    value: 3,
    desc: '成功',
  }
};


export default {
    INDICATOR_HANDLE_STATUS_ENUM
}