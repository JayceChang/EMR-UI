import { postRequest, getRequest } from '/@/lib/axios';

// 外转明细数据分析相关API
export const TransferDetailAnalysisAPI = {
  // 获取外转明细统计数据
  getTransferDetailStatistics: (params) => {
    return getRequest('/business/transfer-detail/analysis/statistics', params);
  },

  // 获取外转明细概览数据
  getTransferDetailOverview: (params) => {
    return getRequest('/business/transfer-detail/analysis/overview', params);
  },

  // 获取外转明细趋势数据
  getTransferDetailTrend: (params) => {
    return getRequest('/business/transfer-detail/analysis/trend', params);
  }
};

// 数据概览相关API
export const OverviewAPI = {
  // 获取外转明细概览数据
  getTransferDetailOverview: (params) => {
    return getRequest('/business/transfer-detail/overview', params);
  },

  // 获取总住院人次
  getTotalPatients: (params) => {
    return getRequest('/business/transfer-detail/overview/total-patients', params);
  },

  // 获取外转次均费用
  getAvgTransferCost: (params) => {
    return getRequest('/business/transfer-detail/overview/avg-cost', params);
  },

  // 获取报销病历数
  getTotalReimbursement: (params) => {
    return getRequest('/business/transfer-detail/overview/reimbursement', params);
  }
};

// 趋势图表相关API
export const TrendChartAPI = {
  // 获取外转明细趋势数据
  getTransferDetailTrend: (params) => {
    return getRequest('/business/transfer-detail/trend', params);
  },

  // 获取外转患者费用趋势数据
  getCostTrendData: (params) => {
    return getRequest('/business/transfer-detail/trend/cost', params);
  },

  // 获取报销比例趋势数据
  getReimbursementRateTrend: (params) => {
    return getRequest('/business/transfer-detail/trend/reimbursement-rate', params);
  },

  // 获取住院人次趋势数据
  getPatientTrend: (params) => {
    return getRequest('/business/transfer-detail/trend/patients', params);
  },

  // 获取趋势图表数据
  getTrendChartData: (params) => {
    return getRequest('/business/transfer-detail/trend/chart', params);
  }
};

// 区域汇总相关API
export const DistrictAPI = {
  // 获取外转患者按区域汇总
  getTransferDetailDistrict: (params) => {
    return getRequest('/business/transfer-detail/district', params);
  },

  // 获取外转患者按区域汇总列表
  getDistrictSummaryList: (params) => {
    return getRequest('/business/transfer-detail/district/summary-list', params);
  },

  // 获取区域详情（动态URL）
  getDistrictDetail: (districtName, params) => {
    return getRequest(`/business/transfer-detail/district/${districtName}/detail`, params);
  },

  // 获取区域排名
  getDistrictRanking: (params) => {
    return getRequest('/business/transfer-detail/district/ranking', params);
  },

  // 获取区域对比数据
  getDistrictComparison: (params) => {
    return getRequest('/business/transfer-detail/district/comparison', params);
  }
};

// 医疗机构相关API
export const HospitalAPI = {
  // 获取外转患者按医疗机构汇总
  getTransferDetailHospital: (params) => {
    return getRequest('/business/transfer-detail/hospital', params);
  },

  // 获取外转患者按医疗机构汇总列表
  getHospitalSummaryList: (params) => {
    return getRequest('/business/transfer-detail/hospital/summary-list', params);
  },

  // 获取医院详情（动态URL）
  getHospitalDetail: (hospitalId, params) => {
    return getRequest(`/business/transfer-detail/hospital/${hospitalId}/detail`, params);
  },

  // 获取医院排名
  getHospitalRanking: (params) => {
    return getRequest('/business/transfer-detail/hospital/ranking', params);
  }
};

// 病种相关API
export const DiseaseAPI = {
  // 获取外转患者按病种汇总
  getTransferDetailDisease: (params) => {
    return getRequest('/business/transfer-detail/disease', params);
  },

  // 获取外转患者按病种汇总列表
  getDiseaseSummaryList: (params) => {
    return getRequest('/business/transfer-detail/disease/summary-list', params);
  },

  // 获取病种详情（动态URL）
  getDiseaseDetail: (diseaseCode, params) => {
    return getRequest(`/business/transfer-detail/disease/${diseaseCode}/detail`, params);
  },

  // 获取病种排名
  getDiseaseRanking: (params) => {
    return getRequest('/business/transfer-detail/disease/ranking', params);
  },

  // 获取病种趋势数据（动态URL）
  getDiseaseTrend: (diseaseCode, params) => {
    return getRequest(`/business/transfer-detail/disease/${diseaseCode}/trend`, params);
  }
};

// 住院明细相关API
export const HospitalizationDetailAPI = {
  // 获取住院明细数据列表
  getHospitalizationDetailList: (params) => {
    return getRequest('/business/transfer-detail/hospitalization/list', params);
  },

  // 获取住院明细数据（分页）- 合并page、pageSize到params
  getHospitalizationDetailWithPage: (page, pageSize, params) => {
    return getRequest('/business/transfer-detail/hospitalization/page', {
      ...params,
      page,
      pageSize
    });
  },

  // 获取患者住院历史（动态URL，无额外params）
  getPatientHospitalizationHistory: (idCard) => {
    return getRequest(`/business/transfer-detail/hospitalization/patient/${idCard}/history`);
  },

  // 获取住院明细统计
  getHospitalizationStatistics: (params) => {
    return getRequest('/business/transfer-detail/hospitalization/statistics', params);
  },

  // 导出入院明细数据（postRequest保持不变）
  exportHospitalizationDetail: (params) => {
    return postRequest({
      url: '/business/transfer-detail/hospitalization/export',
      method: 'post',
      data: params,
      responseType: 'blob'
    });
  }
};

// 下钻分析相关API
export const DrillDownAPI = {
  // 下钻分析患者明细
  getPatientDetail: (params) => {
    return getRequest('/business/transfer-detail/drill-down/patient', params);
  },

  // 下钻分析医院明细（动态URL）
  getHospitalDetail: (hospitalName, params) => {
    return getRequest(`/business/transfer-detail/drill-down/hospital/${hospitalName}`, params);
  },

  // 下钻分析病种明细（动态URL）
  getDiseaseDetail: (diseaseCode, params) => {
    return getRequest(`/business/transfer-detail/drill-down/disease/${diseaseCode}`, params);
  },

  // 下钻分析区域明细（动态URL）
  getRegionDetail: (regionName, params) => {
    return getRequest(`/business/transfer-detail/drill-down/region/${regionName}`, params);
  }
};

// 图表数据相关API
export const ChartAPI = {
  // 获取区域分布图表数据
  getRegionDistributionChart: (params) => {
    return getRequest('/business/transfer-detail/chart/region-distribution', params);
  },

  // 获取病种分布图表数据
  getDiseaseDistributionChart: (params) => {
    return getRequest('/business/transfer-detail/chart/disease-distribution', params);
  },

  // 获取外转率趋势图表数据
  getTransferRateTrendChart: (params) => {
    return getRequest('/business/transfer-detail/chart/transfer-rate-trend', params);
  }
};