import { postRequest, getRequest } from '/@/lib/axios';

export const reportConfigApi = {
  // 查询报表列表
  queryReportList: (param) => {
    return postRequest('/indicatorReportConfig/queryPage', param);
  },
  
  // 添加报表
  addReport: (param) => {
    return postRequest('/indicatorReportConfig/add', param);
  },
  
  // 更新报表
  updateReport: (param) => {
    return postRequest('/indicatorReportConfig/update', param);
  },
  
  // 删除报表
  deleteReport: (reportId) => {
    return getRequest(`/indicatorReportConfig/delete/${reportId}`);
  },
  
  // 获取报表详情
  getReportDetail: (reportId) => {
    return getRequest(`/indicatorReportConfig/${reportId}`);
  }
};