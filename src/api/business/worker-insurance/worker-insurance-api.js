import { postRequest, getRequest } from '/@/lib/axios';

// 城镇职工医保查询相关API
export const WorkerInsuranceAPI = {
  // 获取统计数据
  getStatsData: (params) => {
    return getRequest({
      url: '/business/worker-insurance/stats',
      method: 'get',
      params
    });
  },

  // 获取表格数据（支持分页和筛选）
  getTableData: (params) => {
    return getRequest({
      url: '/business/worker-insurance/table',
      method: 'get',
      params
    });
  },

  // 获取详情数据
  getDetailData: (id) => {
    return getRequest({
      url: `/business/worker-insurance/detail/${id}`,
      method: 'get'
    });
  },

  // 导出数据
  exportData: (params) => {
    return getRequest({
      url: '/business/worker-insurance/export',
      method: 'get',
      params
    });
  },

  // 获取统计数据（汇总）
  getOverview: (params) => {
    return getRequest({
      url: '/business/worker-insurance/overview',
      method: 'get',
      params
    });
  }
};

// 企业和地区数据相关API
export const CompanyDataAPI = {
  // 获取所有企业列表
  getAllCompanies: () => {
    return getRequest({
      url: '/business/worker-insurance/companies',
      method: 'get'
    });
  },

  // 根据地区获取企业列表
  getCompaniesByCounty: (county) => {
    return getRequest({
      url: `/business/worker-insurance/companies/county/${county}`,
      method: 'get'
    });
  },

  // 搜索企业
  searchCompanies: (keyword) => {
    return getRequest({
      url: '/business/worker-insurance/companies/search',
      method: 'get',
      params: { keyword }
    });
  },

  // 获取所有地区数据（省/市/县）
  getAllRegions: () => {
    return getRequest({
      url: '/business/worker-insurance/regions',
      method: 'get'
    });
  },

  // 获取县/区列表
  getCounties: () => {
    return getRequest({
      url: '/business/worker-insurance/regions/counties',
      method: 'get'
    });
  }
};

// 统计图表相关API
export const ChartDataAPI = {
  // 获取参保人数趋势数据
  getParticipantsTrend: (params) => {
    return getRequest({
      url: '/business/worker-insurance/chart/participants-trend',
      method: 'get',
      params
    });
  },

  // 获取资金使用趋势数据
  getFundUsageTrend: (params) => {
    return getRequest({
      url: '/business/worker-insurance/chart/fund-usage-trend',
      method: 'get',
      params
    });
  },

  // 获取住院率分析数据
  getHospitalizationAnalysis: (params) => {
    return getRequest({
      url: '/business/worker-insurance/chart/hospitalization-analysis',
      method: 'get',
      params
    });
  },

  // 获取外转率分析数据
  getOutwardTransferAnalysis: (params) => {
    return getRequest({
      url: '/business/worker-insurance/chart/outward-transfer-analysis',
      method: 'get',
      params
    });
  },

  // 获取地区分布数据
  getRegionDistribution: (params) => {
    return getRequest({
      url: '/business/worker-insurance/chart/region-distribution',
      method: 'get',
      params
    });
  },

  // 获取企业规模分析数据
  getCompanyScaleAnalysis: (params) => {
    return getRequest({
      url: '/business/worker-insurance/chart/company-scale-analysis',
      method: 'get',
      params
    });
  },

  // 获取行业分析数据
  getIndustryAnalysis: (params) => {
    return getRequest({
      url: '/business/worker-insurance/chart/industry-analysis',
      method: 'get',
      params
    });
  }
};

// 同比环比分析API
export const ComparisonAPI = {
  // 获取同比数据
  getYearOverYear: (params) => {
    return getRequest({
      url: '/business/worker-insurance/comparison/yoy',
      method: 'get',
      params
    });
  },

  // 获取环比数据
  getMonthOverMonth: (params) => {
    return getRequest({
      url: '/business/worker-insurance/comparison/mom',
      method: 'get',
      params
    });
  }
};

// 医保基金使用分析API
export const FundAnalysisAPI = {
  // 获取基金使用明细
  getFundUsageDetail: (params) => {
    return getRequest({
      url: '/business/worker-insurance/fund/usage-detail',
      method: 'get',
      params
    });
  },

  // 获取基金收支分析
  getFundRevenueExpense: (params) => {
    return getRequest({
      url: '/business/worker-insurance/fund/revenue-expense',
      method: 'get',
      params
    });
  },

  // 获取基金使用效率分析
  getFundEfficiency: (params) => {
    return getRequest({
      url: '/business/worker-insurance/fund/efficiency',
      method: 'get',
      params
    });
  }
};
