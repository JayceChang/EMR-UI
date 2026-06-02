import { postRequest, getRequest } from '/@/lib/axios';

// 住院病种分析相关API
export const DiseasesAnalysisAPI = {
  // 获取病种统计数据
  getDiseaseStatistics: (params) => {
    return getRequest('/business/diseases/analysis/statistics', params);
  },

  // 获取病种概览数据
  getDiseaseOverview: (params) => {
    return getRequest('/business/diseases/analysis/overview', params);
  },

  // 获取病种趋势数据
  getDiseaseTrend: (params) => {
    return getRequest('/business/diseases/analysis/trend', params);
  },

  // 获取病种对比数据
  getDiseaseComparison: (params) => {
    return getRequest('/business/diseases/analysis/comparison', params);
  }
};

// 汇总分析相关API
export const SummaryAnalysisAPI = {
  // 获取病种汇总数据
  getDiseaseSummaryList: (params) => {
    return getRequest('/business/diseases/summary/list', params);
  },

  // 获取病种汇总统计
  getDiseaseSummaryStats: (params) => {
    return getRequest('/business/diseases/summary/statistics', params);
  },

  // 获取ICD10类目数据
  getICD10CategoryList: (params) => {
    return getRequest('/business/diseases/summary/icd10-category', params);
  },

  // 获取ICD10亚目数据
  getICD10SubCategoryList: (params) => {
    return getRequest('/business/diseases/summary/icd10-subcategory', params);
  },

  // 获取ICD诊断数据
  getICDDiagnosisList: (params) => {
    return getRequest('/business/diseases/summary/icd-diagnosis', params);
  }
};

// 趋势分析相关API
export const TrendAnalysisAPI = {
  // 获取住院人次趋势数据
  getPatientTrendData: (params) => {
    return getRequest('/business/diseases/trend/patients', params);
  },

  // 获取次均费用趋势数据
  getAvgCostTrendData: (params) => {
    return getRequest('/business/diseases/trend/avg-cost', params);
  },

  // 获取次均住院日趋势数据
  getAvgDaysTrendData: (params) => {
    return getRequest('/business/diseases/trend/avg-days', params);
  },

  // 获取病种费用趋势数据（动态URL）
  getDiseaseCostTrend: (diseaseCode, params) => {
    return getRequest(`/business/diseases/trend/${diseaseCode}/cost`, params);
  },

  // 获取病种人次趋势数据（动态URL）
  getDiseasePatientTrend: (diseaseCode, params) => {
    return getRequest(`/business/diseases/trend/${diseaseCode}/patients`, params);
  }
};

// 外转患者分析相关API
export const OutpatientAnalysisAPI = {
  // 获取外转患者数据
  getOutpatientList: (params) => {
    return getRequest('/business/diseases/outpatient/list', params);
  },

  // 获取外转患者统计
  getOutpatientStats: (params) => {
    return getRequest('/business/diseases/outpatient/statistics', params);
  },

  // 获取外转患者趋势数据
  getOutpatientTrend: (params) => {
    return getRequest('/business/diseases/outpatient/trend', params);
  },

  // 获取外转患者对比数据
  getOutpatientComparison: (params) => {
    return getRequest('/business/diseases/outpatient/comparison', params);
  }
};

// 病种排名相关API
export const DiseaseRankingAPI = {
  // 获取病种排名数据
  getDiseaseRanking: (params) => {
    return getRequest('/business/diseases/ranking/disease', params);
  },

  // 获取病种费用排名
  getDiseaseCostRanking: (params) => {
    return getRequest('/business/diseases/ranking/cost', params);
  },

  // 获取病种人次排名
  getDiseasePatientRanking: (params) => {
    return getRequest('/business/diseases/ranking/patients', params);
  },

  // 获取病种统筹费用排名
  getDiseaseCoordinationRanking: (params) => {
    return getRequest('/business/diseases/ranking/coordination', params);
  }
};

// 下钻分析相关API
export const DiseaseDrillDownAPI = {
  // 下钻分析病种明细（动态URL）
  getDiseaseDetail: (diseaseCode, params) => {
    return getRequest(`/business/diseases/drill-down/disease/${diseaseCode}`, params);
  },

  // 下钻分析病种类目明细（动态URL）
  getDiseaseCategoryDetail: (categoryCode, params) => {
    return getRequest(`/business/diseases/drill-down/category/${categoryCode}`, params);
  },

  // 下钻分析患者明细
  getPatientDetail: (params) => {
    return getRequest('/business/diseases/drill-down/patient', params);
  },

  // 下钻分析医院明细（动态URL）
  getHospitalDetail: (hospitalName, params) => {
    return getRequest(`/business/diseases/drill-down/hospital/${hospitalName}`, params);
  }
};

// 图表数据相关API
export const DiseaseChartAPI = {
  // 获取病种分布图表数据
  getDiseaseDistributionChart: (params) => {
    return getRequest('/business/diseases/chart/distribution', params);
  },

  // 获取病种趋势图表数据
  getDiseaseTrendChart: (params) => {
    return getRequest('/business/diseases/chart/trend', params);
  },

  // 获取病种对比图表数据
  getDiseaseComparisonChart: (params) => {
    return getRequest('/business/diseases/chart/comparison', params);
  },

  // 获取外转率图表数据
  getOutpatientRateChart: (params) => {
    return getRequest('/business/diseases/chart/outpatient-rate', params);
  }
};