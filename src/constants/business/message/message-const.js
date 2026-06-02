/*
 * @Description: file content


 * @LastEditors:
 * @LastEditTime: 2022-07-24 21:43:43
 */
export const MESSAGE_TYPE_ENUM = {
    MESSAGE: {
        value: 1,
        desc: '消息'
    },
    NOTICE: {
        value: 2,
        desc: '公告'
    },
  };

  export const ONLY_MESSAGE_ENUM = {
    MESSAGE: {
        value: 1,
        desc: '消息'
    }
  };


export const MESSAGE_RECEIVE_TYPE_ENUM = {
    EMPLOYEE: {
        value: 1,
        desc: '员工'
    },
  };

export default {
    MESSAGE_TYPE_ENUM,
    ONLY_MESSAGE_ENUM,
    MESSAGE_RECEIVE_TYPE_ENUM
};
