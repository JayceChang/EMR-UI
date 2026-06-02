/**
 * job api 封装
 *
 */
import { postRequest } from '/@/lib/axios';
import axios from 'axios';  // 导入原生axios

export const ratingJobApi = {
    /**
     * 取数测试方法
     * @param {*} param 
     * @returns 
     */
    testExtraConfig: (param) => {
      // 直接使用相对路径，会相对于当前网站URL（不添加baseURL）
      return axios.post('/test-api/api/TestMethod', param)
        .then(response => response.data);
    },
    /**
     * 手动取数方法
     * @param {*} param 
     * @returns 
     */
    manualFetch: (param) => {
      return axios.post('/test-api/api/ManualGrabbing', param)
        .then(response => response.data);
    },
    /**
     * 手动取数方法
     * @param {*} param 
     * @returns 
     */
    fetchMethod: (param) => {
      return axios.post('/test-api/api/FetchMethod', param)
        .then(response => response.data);
    },
    /**
     * 测试数据库连接
     * @param {数据库id} id 
     * @returns 
     */
    testDbLink: (id) => {
      return axios.get('/test-api/api/TestMethod?id=' + id)
        .then(response => response.data);
    }
};
