import { postRequest, getRequest } from '/@/lib/axios';

// 获取医保总览数据
export const getOverviewData = (params) => {
  return getRequest('/business/dashboard/overview', params);
};

// 获取区县数据列表
export const getDistrictData = (params) => {
  return getRequest('/business/dashboard/district', params);
};

// 获取医疗集团数据
export const getMedicalGroupData = (params) => {
  return getRequest('/business/dashboard/medical-group', params);
};

// 获取下钻明细数据 - 乡镇
export const getTownshipData = (districtName) => {
  return getRequest(`/business/dashboard/district/${districtName}/township`);
};

// 获取下钻明细数据 - 村级
export const getVillageData = (districtName, townshipName) => {
  return getRequest(`/business/dashboard/district/${districtName}/township/${townshipName}/village`);
};

// 获取图表数据
export const getChartData = (type, params) => {
  return getRequest(`/business/dashboard/chart/${type}`, params);
};

// 获取统计数据
export const getStatisticsData = (params) => {
  return getRequest('/business/dashboard/statistics', params);
};

// ==================== 新增API方法 ====================

// 医保数据总览API
export const DashboardAPI = {
  // 获取整体医保数据（医保基金总数、参保人数等）
  getOverallData: (params) => {
    return getRequest('/business/dashboard/overall', params);
  },

  // 获取资金使用进度数据
  getFundUsageData: (params) => {
    return getRequest('/business/dashboard/fund-usage', params);
  },

  // 获取医疗服务指标数据（住院率、外转率等）
  getMedicalServiceData: (params) => {
    return getRequest('/business/dashboard/medical-service', params);
  },

  // 获取城镇职工医保数据
  getUrbanEmployeeData: (params) => {
    return getRequest('/business/dashboard/urban-employee', params);
  },

  // 获取城乡居民医保数据
  getResidentData: (params) => {
    return getRequest('/business/dashboard/resident', params);
  },

  // 获取各区县详细数据列表（支持排序）
  getDistrictList: (params) => {
    return getRequest('/business/dashboard/districts', params);
  },

  // 获取医疗集团数据列表
  getMedicalGroupList: (params) => {
    return getRequest('/business/dashboard/medical-groups', params);
  }
};

// 数据下钻相关API
export const DrillDownAPI = {
  // 下钻到区县详情
  getDistrictDetail: (districtName) => {
    return getRequest(`/business/dashboard/detail/district/${districtName}`);
  },

  // 下钻到乡镇详情
  getTownshipDetail: (districtName, townshipName) => {
    return getRequest(`/business/dashboard/detail/township/${districtName}/${townshipName}`);
  },

  // 下钻到村级详情
  getVillageDetail: (townshipName, villageName) => {
    return getRequest(`/business/dashboard/detail/village/${townshipName}/${villageName}`);
  },

  // 获取城镇职工医保详细数据
  getUrbanEmployeeDetail: (params) => {
    return getRequest('/business/dashboard/detail/urban-employee', params);
  },

  // 获取城乡居民医保详细数据
  getResidentDetail: (params) => {
    return getRequest('/business/dashboard/detail/resident', params);
  },

  // 获取安阳市人民医院医疗集团详细数据
  getRmyyDetail: (params) => {
    return getRequest('/business/dashboard/detail/rmyy', params);
  },

  // 获取安阳市中医院医疗集团详细数据
  getZyyyDetail: (params) => {
    return getRequest('/business/dashboard/detail/zyyy', params);
  },

  // 获取安阳市肿瘤联盟详细数据
  getTumorAllianceDetail: (params) => {
    return getRequest('/business/dashboard/detail/tumor-alliance', params);
  }
};

// 图表数据相关API
export const ChartDataAPI = {
  // 获取参保人数分布数据（饼图）
  getParticipantsDistribution: (type, params) => {
    return getRequest(`/business/dashboard/chart/participants-distribution/${type}`, params);
  },

  // 获取资金趋势数据（折线图）
  getFundTrend: (params) => {
    return getRequest('/business/dashboard/chart/fund-trend', params);
  },

  // 获取住院率对比数据（柱状图）
  getHospitalizationComparison: (params) => {
    return getRequest('/business/dashboard/chart/hospitalization-comparison', params);
  },

  // 获取外转率分析数据
  getOutwardTransferAnalysis: (params) => {
    return getRequest('/business/dashboard/chart/outward-transfer', params);
  },

  // 获取历年对比数据
  getHistoricalComparison: (params) => {
    return getRequest('/business/dashboard/chart/historical', params);
  },

  // 获取全年预计资金使用情况
  getExpectedFundUsage: (params) => {
    return getRequest('/business/dashboard/chart/expected-fund', params);
  }
};