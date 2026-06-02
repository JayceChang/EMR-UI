import { postRequest, getRequest } from '/@/lib/axios';

// 外转数据分析相关API
export const TransferAnalysisAPI = {
  // 获取外转统计数据
  getTransferStatistics: (params) => {
    return getRequest('/business/transfer/analysis/statistics', params);
  },

  // 获取外转概览数据
  getTransferOverview: (params) => {
    return getRequest('/business/transfer/analysis/overview', params);
  },

  // 获取外转趋势数据
  getTransferTrend: (params) => {
    return getRequest('/business/transfer/analysis/trend', params);
  },

  // 获取外转对比数据
  getTransferComparison: (params) => {
    return getRequest('/business/transfer/analysis/comparison', params);
  }
};

// 概览数据相关API
export const OverviewAPI = {
  // 获取总外转数据
  getTotalTransferData: (params) => {
    return getRequest('/business/transfer/overview/total', params);
  },

  // 获取市域外转数据
  getCityTransferData: (params) => {
    return getRequest('/business/transfer/overview/city', params);
  },

  // 获取省域外转数据
  getProvinceTransferData: (params) => {
    return getRequest('/business/transfer/overview/province', params);
  }
};

// 月度趋势相关API
export const MonthlyTrendAPI = {
  // 获取外转患者人次数月度趋势
  getMonthlyPatientTrend: (params) => {
    return getRequest('/business/transfer/trend/monthly-patients', params);
  },

  // 获取外转费用月度趋势
  getMonthlyCostTrend: (params) => {
    return getRequest('/business/transfer/trend/monthly-cost', params);
  },

  // 获取外转率月度趋势
  getMonthlyRateTrend: (params) => {
    return getRequest('/business/transfer/trend/monthly-rate', params);
  }
};

// 医疗机构相关API
export const MedicalInstitutionAPI = {
  // 获取外转医疗机构列表
  getTransferInstitutionList: (params) => {
    return getRequest('/business/transfer/institution/list', params);
  },

  // 获取外转医疗机构详情（动态URL）
  getTransferInstitutionDetail: (institutionId, params) => {
    return getRequest(`/business/transfer/institution/${institutionId}/detail`, params);
  },

  // 获取外转医疗机构排名
  getTransferInstitutionRanking: (params) => {
    return getRequest('/business/transfer/institution/ranking', params);
  }
};

// 医疗集团相关API
export const MedicalGroupAPI = {
  // 获取医疗集团外转数据
  getMedicalGroupTransferData: (params) => {
    return getRequest('/business/transfer/medical-group/transfer', params);
  },

  // 获取医疗集团详情（动态URL）
  getMedicalGroupDetail: (groupId, params) => {
    return getRequest(`/business/transfer/medical-group/${groupId}/detail`, params);
  },

  // 获取医疗集团趋势数据（动态URL）
  getMedicalGroupTrend: (groupId, params) => {
    return getRequest(`/business/transfer/medical-group/${groupId}/trend`, params);
  }
};

// 外转率相关API
export const TransferRateAPI = {
  // 获取五县外转率数据
  getFiveCountiesRate: (params) => {
    return getRequest('/business/transfer/rate/five-counties', params);
  },

  // 获取四区外转率数据
  getFourDistrictsRate: (params) => {
    return getRequest('/business/transfer/rate/four-districts', params);
  },

  // 获取外转率雷达图数据
  getTransferRateRadarData: (params) => {
    return getRequest('/business/transfer/rate/radar', params);
  }
};

// 外转分析相关API
export const OutTransferAPI = {
  // 获取外转患者分析数据
  getOutTransferAnalysis: (params) => {
    return getRequest('/business/transfer/out-transfer/analysis', params);
  },

  // 获取外转患者统计
  getOutTransferStats: (params) => {
    return getRequest('/business/transfer/out-transfer/statistics', params);
  },

  // 获取外转患者列表
  getOutTransferList: (params) => {
    return getRequest('/business/transfer/out-transfer/list', params);
  }
};

// 县区汇总相关API
export const CountySummaryAPI = {
  // 获取各县区外转数据汇总
  getCountyTransferSummary: (params) => {
    return getRequest('/business/transfer/county/summary', params);
  },

  // 获取县区外转详情（动态URL）
  getCountyTransferDetail: (countyName, params) => {
    return getRequest(`/business/transfer/county/${countyName}/detail`, params);
  },

  // 获取县区外转排名
  getCountyTransferRanking: (params) => {
    return getRequest('/business/transfer/county/ranking', params);
  }
};

// ICD10排行相关API
export const Icd10RankingAPI = {
  // 获取ICD10病种外转排行
  getIcd10TransferRanking: (params) => {
    return getRequest('/business/transfer/icd10/ranking', params);
  },

  // 获取ICD10病种外转详情（动态URL）
  getIcd10TransferDetail: (icdCode, params) => {
    return getRequest(`/business/transfer/icd10/${icdCode}/detail`, params);
  },

  // 获取ICD10病种外转趋势（动态URL）
  getIcd10TransferTrend: (icdCode, params) => {
    return getRequest(`/business/transfer/icd10/${icdCode}/trend`, params);
  }
};

// 下钻分析相关API
export const TransferDrillDownAPI = {
  // 下钻分析医疗机构明细（动态URL）
  getInstitutionDetail: (institutionName, params) => {
    return getRequest(`/business/transfer/drill-down/institution/${institutionName}`, params);
  },

  // 下钻分析病种明细（动态URL）
  getDiseaseDetail: (diseaseCode, params) => {
    return getRequest(`/business/transfer/drill-down/disease/${diseaseCode}`, params);
  },

  // 下钻分析患者明细
  getPatientDetail: (params) => {
    return getRequest('/business/transfer/drill-down/patient', params);
  },

  // 下钻分析区域明细（动态URL）
  getRegionDetail: (regionName, params) => {
    return getRequest(`/business/transfer/drill-down/region/${regionName}`, params);
  }
};

// 图表数据相关API
export const TransferChartAPI = {
  // 获取外转趋势图表数据
  getTransferTrendChart: (params) => {
    return getRequest('/business/transfer/chart/trend', params);
  },

  // 获取外转率图表数据
  getTransferRateChart: (params) => {
    return getRequest('/business/transfer/chart/rate', params);
  },

  // 获取外转区域分布图表
  getTransferRegionChart: (params) => {
    return getRequest('/business/transfer/chart/region', params);
  },

  // 获取外转病种分布图表
  getTransferDiseaseChart: (params) => {
    return getRequest('/business/transfer/chart/disease', params);
  }
};