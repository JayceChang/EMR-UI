/**
 * 接口：加密、解密
 *
 */
import { postRequest, postEncryptRequest } from '/@/lib/axios';

export const encryptApi = {

  /**

   */
  testRequestEncrypt: (param) => {
    return postEncryptRequest('/support/apiEncrypt/testRequestEncrypt', param);
  },

  /**

   */
  testResponseEncrypt: (param) => {
    return postRequest('/support/apiEncrypt/testResponseEncrypt', param);
  },

  /**

   */
  testDecryptAndEncrypt: (param) => {
    return postEncryptRequest('/support/apiEncrypt/testDecryptAndEncrypt', param);
  },

  /**

   */
  testArray : (param) => {
    return postEncryptRequest('/support/apiEncrypt/testArray', param);
  },
  
};
