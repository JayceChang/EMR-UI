import { getRequest } from '/@/lib/axios';

// 日报汇总相关API
export const DailyDashboardAPI = {
  // 获取汇总数据
  getSummary: (params) => {
    return getRequest('/business/daily-dashboard/summary', params);
  },

  // 获取结构分析数据
  getStructureAnalysis: (params) => {
    return getRequest('/business/daily-dashboard/structure', params);
  },

  // 获取五县雷达数据
  getCountyRadar: (params) => {
    return getRequest('/business/daily-dashboard/county-radar', params);
  },

  // 获取四区雷达数据
  getDistrictRadar: (params) => {
    return getRequest('/business/daily-dashboard/district-radar', params);
  },

  // 获取诊断排行榜（旧接口，保持兼容）
  getDiagnosisRank: (params) => {
    return getRequest('/business/daily-dashboard/diagnosis-rank', params);
  },

  // 获取域内诊断排行榜
  getInRegionDiagnosisRank: (params) => {
    return getRequest('/business/daily-dashboard/diagnosis-rank/in-region', params);
  },

  // 获取域外诊断排行榜
  getOutRegionDiagnosisRank: (params) => {
    return getRequest('/business/daily-dashboard/diagnosis-rank/out-region', params);
  },

  // 获取市内医院TOP10
  getInCityHospitalTop10: (params) => {
    return getRequest('/business/daily-dashboard/hospital/in-city/top10', params);
  },

  // 获取市外医院TOP10
  getOutCityHospitalTop10: (params) => {
    return getRequest('/business/daily-dashboard/hospital/out-city/top10', params);
  },

  // 获取所有仪表盘数据（一次性获取）
  getDashboardData: (params) => {
    return getRequest('/business/daily-dashboard/all', params);
  }
};
