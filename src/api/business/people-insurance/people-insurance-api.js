import { postRequest, getRequest } from '/@/lib/axios';

// 城乡居民医保查询相关API
export const PeopleInsuranceAPI = {
  // 获取统计数据
  getStatsData: (params) => {
    return getRequest('/business/people-insurance/stats', params);
  },

  // 获取表格数据（支持分页和筛选）
  getTableData: (params) => {
    return getRequest('/business/people-insurance/table', params);
  },

  // 获取详情数据
  getDetailData: (id) => {
    return getRequest(`/business/people-insurance/detail/${id}`);
  },

  // 导出数据
  exportData: (params) => {
    return getRequest('/business/people-insurance/export', params);
  },

  // 获取统计数据（汇总）
  getOverview: (params) => {
    return getRequest('/business/people-insurance/overview', params);
  }
};

// 地区数据相关API
export const RegionDataAPI = {
  // 获取所有地区数据（省/市/县）
  getAllRegions: () => {
    return getRequest('/business/people-insurance/regions');
  },

  // 获取县/区列表
  getCounties: () => {
    return getRequest('/business/people-insurance/regions/counties');
  },

  // 获取乡镇/街道列表
  getTowns: (countyId) => {
    return getRequest(`/business/people-insurance/regions/county/${countyId}/towns`);
  },

  // 获取村/社区列表
  getVillages: (countyId, townId) => {
    return getRequest(`/business/people-insurance/regions/county/${countyId}/town/${townId}/villages`);
  }
};

// 统计图表相关API
export const ChartDataAPI = {
  // 获取参保人数趋势数据
  getParticipantsTrend: (params) => {
    return getRequest('/business/people-insurance/chart/participants-trend', params);
  },

  // 获取资金使用趋势数据
  getFundUsageTrend: (params) => {
    return getRequest('/business/people-insurance/chart/fund-usage-trend', params);
  },

  // 获取住院率分析数据
  getHospitalizationAnalysis: (params) => {
    return getRequest('/business/people-insurance/chart/hospitalization-analysis', params);
  },

  // 获取外转率分析数据
  getOutwardTransferAnalysis: (params) => {
    return getRequest('/business/people-insurance/chart/outward-transfer-analysis', params);
  },

  // 获取地区分布数据
  getRegionDistribution: (params) => {
    return getRequest('/business/people-insurance/chart/region-distribution', params);
  }
};

// 同比环比分析API
export const ComparisonAPI = {
  // 获取同比数据
  getYearOverYear: (params) => {
    return getRequest('/business/people-insurance/comparison/yoy', params);
  },

  // 获取环比数据
  getMonthOverMonth: (params) => {
    return getRequest('/business/people-insurance/comparison/mom', params);
  }
};