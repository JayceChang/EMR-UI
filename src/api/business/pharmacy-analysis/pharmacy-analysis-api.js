import { postRequest, getRequest } from '/@/lib/axios';

export const PHARMACY_ANALYSIS_DRILL_DOWN_ENDPOINT = '/business/pharmacy/detail/drill/page';
const LEGACY_PHARMACY_DRILL_DOWN_ENDPOINT = '/business/pharmacy/drill-down/patient';

const normalizeDrillDownParams = (params = {}) => {
  const normalized = { ...params };
  Object.keys(normalized).forEach((key) => {
    if (normalized[key] === undefined) {
      delete normalized[key];
    }
  });
  return normalized;
};

const assertDrillDownEndpoint = (endpoint) => {
  if (endpoint !== PHARMACY_ANALYSIS_DRILL_DOWN_ENDPOINT) {
    throw new Error(`药房分析下钻接口配置错误: ${endpoint}`);
  }
  if (import.meta.env.DEV && endpoint === LEGACY_PHARMACY_DRILL_DOWN_ENDPOINT) {
    throw new Error(`药房分析禁止使用旧下钻接口: ${LEGACY_PHARMACY_DRILL_DOWN_ENDPOINT}`);
  }
};

export const getPharmacyPatientDrillPage = (params) => {
  const endpoint = PHARMACY_ANALYSIS_DRILL_DOWN_ENDPOINT;
  assertDrillDownEndpoint(endpoint);
  return getRequest(endpoint, normalizeDrillDownParams(params));
};

// 药店监管分析相关API
export const PharmacyAnalysisAPI = {
  // 获取药店统计数据
  getPharmacyStatistics: (params) => {
    return getRequest('/business/pharmacy/analysis/statistics', params);
  },

  // 获取药店概览数据
  getPharmacyOverview: (params) => {
    return getRequest('/business/pharmacy/analysis/overview', params);
  },

  // 获取药店趋势数据
  getPharmacyTrend: (params) => {
    return getRequest('/business/pharmacy/analysis/trend', params);
  },

  // 获取药店对比数据
  getPharmacyComparison: (params) => {
    return getRequest('/business/pharmacy/analysis/comparison', params);
  }
};

// 统计数据相关API
export const PharmacyStatsAPI = {
  // 获取总费用统计数据
  getTotalCostStats: (params) => {
    return getRequest('/business/pharmacy/stats/total-cost', params);
  },

  // 获取统筹费用统计数据
  getCoordinationCostStats: (params) => {
    return getRequest('/business/pharmacy/stats/coordination-cost', params);
  },

  // 获取人次统计数据
  getPatientStats: (params) => {
    return getRequest('/business/pharmacy/stats/patients', params);
  },

  // 获取药店数量统计数据
  getPharmacyCountStats: (params) => {
    return getRequest('/business/pharmacy/stats/pharmacy-count', params);
  }
};

// 趋势图表相关API
export const PharmacyTrendAPI = {
  // 获取月度趋势数据
  getMonthlyTrend: (params) => {
    return getRequest('/business/pharmacy/trend/monthly', params);
  },

  // 获取年度趋势数据
  getYearlyTrend: (params) => {
    return getRequest('/business/pharmacy/trend/yearly', params);
  },

  // 获取季度趋势数据
  getQuarterlyTrend: (params) => {
    return getRequest('/business/pharmacy/trend/quarterly', params);
  }
};

// 对比分析相关API
export const PharmacyComparisonAPI = {
  // 获取同比数据
  getYearOverYearComparison: (params) => {
    return getRequest('/business/pharmacy/comparison/yoy', params);
  },

  // 获取环比数据
  getMonthOverMonthComparison: (params) => {
    return getRequest('/business/pharmacy/comparison/mom', params);
  },

  // 获取地区对比数据
  getRegionComparison: (params) => {
    return getRequest('/business/pharmacy/comparison/region', params);
  }
};

// 异常警示相关API
export const PharmacyWarningAPI = {
  // 获取异常警示列表
  getWarningList: (params) => {
    return getRequest('/business/pharmacy/warning/list', params);
  },

  // 获取异常警示统计
  getWarningStatistics: (params) => {
    return getRequest('/business/pharmacy/warning/statistics', params);
  },

  // 获取异常警示详情
  getWarningDetail: (warningId) => {
    return getRequest(`/business/pharmacy/warning/detail/${warningId}`);
  },

  // 获取异常警示趋势
  getWarningTrend: (params) => {
    return getRequest('/business/pharmacy/warning/trend', params);
  },

  // 处理异常警示
  handleWarning: (warningId, data) => {
    return postRequest({
      url: `/business/pharmacy/warning/handle/${warningId}`,
      method: 'post',
      data
    });
  }
};

// TOP排行相关API
export const PharmacyRankingAPI = {
  // 获取TOP10药店排行
  getTop10Pharmacies: (params) => {
    return getRequest('/business/pharmacy/ranking/top10', params);
  },

  // 获取药店费用排行
  getPharmacyCostRanking: (params) => {
    return getRequest('/business/pharmacy/ranking/cost', params);
  },

  // 获取药店人次排行
  getPharmacyPatientRanking: (params) => {
    return getRequest('/business/pharmacy/ranking/patients', params);
  },

  // 获取药店统筹费用排行
  getPharmacyCoordinationRanking: (params) => {
    return getRequest('/business/pharmacy/ranking/coordination', params);
  }
};

// 业务明细相关API
export const PharmacyDetailAPI = {
  // 获取业务明细列表
  getBusinessDetailList: (params) => {
    return getRequest('/business/pharmacy/detail/list', params);
  },

  // 获取业务明细数据（分页）
  getBusinessDetailWithPage: (pageNum, pageSize, params) => {
    return getRequest('/business/pharmacy/detail/page', {
      ...params,
      pageNum,
      pageSize
    });
  },

  // 获取患者药店消费历史
  getPatientPharmacyHistory: (idCard) => {
    return getRequest(`/business/pharmacy/detail/patient/${idCard}/history`);
  },

  // 获取药店业务详情
  getPharmacyBusinessDetail: (pharmacyId, params) => {
    return getRequest(`/business/pharmacy/detail/pharmacy/${pharmacyId}`, params);
  },

  // 导出业务明细数据
  exportBusinessDetail: (params) => {
    return postRequest({
      url: '/business/pharmacy/detail/export',
      method: 'post',
      data: params,
      responseType: 'blob'
    });
  }
};

// 下钻分析相关API
export const PharmacyDrillDownAPI = {
  // 药店分析页患者级下钻
  getPatientDetail: (params) => {
    return getPharmacyPatientDrillPage(params);
  }
};

// 图表数据相关API
export const PharmacyChartAPI = {
  // 获取药店数量分布图表数据
  getPharmacyDistributionChart: (params) => {
    return getRequest('/business/pharmacy/chart/distribution', params);
  },

  // 获取费用趋势图表数据
  getCostTrendChart: (params) => {
    return getRequest('/business/pharmacy/chart/cost-trend', params);
  },

  // 获取人次趋势图表数据
  getPatientTrendChart: (params) => {
    return getRequest('/business/pharmacy/chart/patient-trend', params);
  },

  // 获取异常警示图表数据
  getWarningChart: (params) => {
    return getRequest('/business/pharmacy/chart/warning', params);
  }
};
