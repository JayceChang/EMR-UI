/**
 * 业务数据浏览（患者记录）api 封装
 */
import { getRequest, postRequest } from '/@/lib/axios';

export const patientRecordApi = {
  queryPatientPage: (param) => {
    return postRequest('/patientRecord/queryPatientPage', param);
  },

  getPatientDetail: (patientId) => {
    return getRequest(`/patientRecord/detail/${encodeURIComponent(patientId)}`);
  },
};
