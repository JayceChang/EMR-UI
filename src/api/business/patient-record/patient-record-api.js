/**
 * 业务数据浏览（患者记录）api 封装
 */
import { getRequest, postRequest, request } from '/@/lib/axios';

export const patientRecordApi = {
  queryPatientPage: (param) => {
    return postRequest('/patientRecord/queryPatientPage', param);
  },

  getPatientDetail: (patientId) => {
    return getRequest(`/patientRecord/detail/${encodeURIComponent(patientId)}`);
  },

  getPatientAiArtifacts: (patientId) => {
    return getRequest(`/patientRecord/aiArtifacts/${encodeURIComponent(patientId)}`);
  },

  getRecordingAudio: (taskId) => {
    return request({
      url: `/patientRecord/recording/${encodeURIComponent(taskId)}/audio`,
      method: 'get',
      responseType: 'blob',
    });
  },

  updateGeneratedRecord: (param) => {
    return postRequest('/patientRecord/generatedRecord/update', param);
  },
};
