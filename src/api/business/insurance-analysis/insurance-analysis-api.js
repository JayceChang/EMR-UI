import { postRequest, getRequest } from '/@/lib/axios';

// 参保数据分析相关API
export const InsuranceAnalysisAPI = {
  // 获取参保数据总览
  getOverviewData: (params) => {
    return getRequest('/business/insurance-analysis/overview', params);
  },

  // 获取城市趋势数据
  getCityTrendData: (params) => {
    return getRequest('/business/insurance-analysis/city-trend', params);
  },

  // 获取预警列表
  getWarningList: (params) => {
    return getRequest('/business/insurance-analysis/warning-list', params);
  },

  // 获取区县表格数据
  getDistrictTableData: (params) => {
    return getRequest('/business/insurance-analysis/district-table', params);
  },

  // 获取区县详情数据
  getDistrictDetail: (districtName) => {
    return getRequest(`/business/insurance-analysis/district/${districtName}/detail`);
  },

  // 获取参保统计数据
  getStatisticsData: (params) => {
    return getRequest('/business/insurance-analysis/statistics', params);
  }
};

// 图表数据相关API
export const ChartDataAPI = {
  // 获取全市历年参保人数趋势数据
  getParticipantsTrend: (params) => {
    return getRequest('/business/insurance-analysis/chart/participants-trend', params);
  },

  // 获取征缴金额趋势数据
  getCollectionTrend: (params) => {
    return getRequest('/business/insurance-analysis/chart/collection-trend', params);
  },

  // 获取区县参保人数分布
  getDistrictDistribution: (params) => {
    return getRequest('/business/insurance-analysis/chart/district-distribution', params);
  },

  // 获取同比增长数据
  getGrowthComparison: (params) => {
    return getRequest('/business/insurance-analysis/chart/growth-comparison', params);
  }
};

// 详细信息下钻相关API
export const DrillDownAPI = {
  // 下钻到区县下的乡镇详情
  getTownshipDetail: (districtName) => {
    return getRequest(`/business/insurance-analysis/detail/district/${districtName}/township`);
  },

  // 下钻到乡镇下的村/社区详情
  getVillageDetail: (districtName, townshipName) => {
    return getRequest(`/business/insurance-analysis/detail/district/${districtName}/township/${townshipName}/village`);
  },

  // 获取特定区县的时间趋势数据
  getDistrictTrend: (districtName, params) => {
    return getRequest(`/business/insurance-analysis/detail/district/${districtName}/trend`, params);
  }
};