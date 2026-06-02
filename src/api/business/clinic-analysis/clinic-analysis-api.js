import { postRequest, getRequest } from '/@/lib/axios';

export const CLINIC_ANALYSIS_DRILL_DOWN_ENDPOINT = '/business/clinic/detail/drill/page';

const normalizeDrillDownParams = (params = {}) => {
  const normalized = { ...params };
  Object.keys(normalized).forEach((key) => {
    if (normalized[key] === undefined || normalized[key] === null || normalized[key] === '') {
      delete normalized[key];
    }
  });
  return normalized;
};

export const getClinicPatientDrillPage = (params) => {
  return getRequest(CLINIC_ANALYSIS_DRILL_DOWN_ENDPOINT, normalizeDrillDownParams(params));
};

// 门诊分析汇总相关API
export const ClinicAnalysisAPI = {
  // 获取门诊概览数据
  getOverview: (startMonth, endMonth) => {
    return getRequest('/business/clinic/analysis/overview', { startMonth, endMonth });
  },

  // 获取门诊统计数据
  getTotalStats: (startMonth, endMonth) => {
    return getRequest('/business/clinic/analysis/total-stats', { startMonth, endMonth });
  },

  // 获取门诊趋势数据
  getMonthlyTrend: (startMonth, endMonth) => {
    return getRequest('/business/clinic/analysis/monthly-trend', { startMonth, endMonth });
  },

  // 获取门诊对比数据
  getClinicComparison: (params) => {
    return getRequest('/business/clinic/analysis/comparison', params);
  }
};

// 医疗集团相关API
export const MedicalGroupAPI = {
  // 获取医疗集团列表
  getMedicalGroupList: (params) => {
    return getRequest('/business/clinic/medical-group/list', params);
  },

  // 获取医疗集团详情
  getMedicalGroupDetail: (groupId, params) => {
    return getRequest(`/business/clinic/medical-group/${groupId}/detail`, params);
  },

  // 获取医疗集团趋势数据
  getMedicalGroupTrend: (groupId, params) => {
    return getRequest(`/business/clinic/medical-group/${groupId}/trend`, params);
  },

  // 获取医疗集团对比数据
  getMedicalGroupComparison: (params) => {
    return getRequest('/business/clinic/medical-group/comparison', params);
  }
};

// 区县数据相关API
export const CountyAPI = {
  // 获取区县统计数据
  getCountyStats: (startMonth, endMonth) => {
    return getRequest('/business/clinic/county/stats', { startMonth, endMonth });
  },

  // 获取区县列表
  getCountyList: (params) => {
    return getRequest('/business/clinic/county/list', params);
  },

  // 获取区县详情
  getCountyDetail: (countyName, params) => {
    return getRequest(`/business/clinic/county/${countyName}/detail`, params);
  },

  // 获取区县排名数据
  getCountyRanking: (params) => {
    return getRequest('/business/clinic/county/ranking', params);
  },

  // 获取区县对比数据
  getCountyComparison: (params) => {
    return getRequest('/business/clinic/county/comparison', params);
  }
};

// 医疗机构相关API
export const InstitutionAPI = {
  // 获取医疗机构统计数据
  getInstitutionStats: (startMonth, endMonth) => {
    return getRequest('/business/clinic/institution/stats', { startMonth, endMonth });
  },

  // 获取医疗机构列表
  getInstitutionList: (params) => {
    return getRequest('/business/clinic/institution/list', params);
  },

  // 获取医疗机构详情
  getInstitutionDetail: (institutionId, params) => {
    return getRequest(`/business/clinic/institution/${institutionId}/detail`, params);
  },

  // 获取医疗机构排名
  getInstitutionRanking: (params) => {
    return getRequest('/business/clinic/institution/ranking', params);
  },

  // 获取医疗机构分类数据
  getInstitutionCategory: (params) => {
    return getRequest('/business/clinic/institution/category', params);
  }
};

// 病种分析相关API
export const DiseaseAnalysisAPI = {
  // 获取排名前十的病种
  getTopDiseases: (startMonth, endMonth) => {
    return getRequest('/business/clinic/disease/top', { startMonth, endMonth });
  },

  // 获取病种列表
  getDiseaseList: (params) => {
    return getRequest('/business/clinic/disease/list', params);
  },

  // 获取病种详情
  getDiseaseDetail: (diseaseCode, params) => {
    return getRequest(`/business/clinic/disease/${diseaseCode}/detail`, params);
  },

  // 获取病种排名
  getDiseaseRanking: (params) => {
    return getRequest('/business/clinic/disease/ranking', params);
  },

  // 获取病种趋势数据
  getDiseaseTrend: (diseaseCode, params) => {
    return getRequest(`/business/clinic/disease/${diseaseCode}/trend`, params);
  },

  // 获取病种对比数据
  getDiseaseComparison: (params) => {
    return getRequest('/business/clinic/disease/comparison', params);
  }
};

// 月度趋势相关API
export const MonthlyTrendAPI = {
  // 获取月度趋势数据
  getMonthlyTrend: (params) => {
    return getRequest('/business/clinic/trend/monthly', params);
  },

  // 获取年度趋势数据
  getYearlyTrend: (params) => {
    return getRequest('/business/clinic/trend/yearly', params);
  },

  // 获取季度趋势数据
  getQuarterlyTrend: (params) => {
    return getRequest('/business/clinic/trend/quarterly', params);
  }
};

// 图表数据相关API
export const ClinicChartAPI = {
  // 获取门诊人次图表数据
  getPatientChartData: (params) => {
    return getRequest('/business/clinic/chart/patients', params);
  },

  // 获取门诊费用图表数据
  getCostChartData: (params) => {
    return getRequest('/business/clinic/chart/costs', params);
  },

  // 获取门诊统筹图表数据
  getCoordinationChartData: (params) => {
    return getRequest('/business/clinic/chart/coordination', params);
  },

  // 获取病种分布图表数据
  getDiseaseDistributionChart: (params) => {
    return getRequest('/business/clinic/chart/disease-distribution', params);
  }
};

export const ClinicDrillDownAPI = {
  getPatientDetail: (params) => {
    return getClinicPatientDrillPage(params);
  },
};
