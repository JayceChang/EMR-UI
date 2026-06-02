import { getRequest } from '/@/lib/axios';

// 医院明细分析主API
export const HospitalDetailAnalysisAPI = {
  // 获取所有数据
  getAllData: (params) => {
    return getRequest('/business/hospital-detail-analysis/all', params);
  },

  // 获取筛选条件
  getFilterOptions: () => {
    return getRequest('/business/hospital-detail-analysis/filters');
  },

  // 导出数据
  exportData: (params) => {
    return getRequest('/business/hospital-detail-analysis/export', params);
  }
};

// 概览数据API
export const OverviewAPI = {
  // 获取概览数据
  getOverview: (params) => {
    return getRequest('/business/hospital-detail-analysis/overview', params);
  }
};

// 趋势图表API
export const TrendChartAPI = {
  // 获取趋势数据
  getTrendData: (params, period) => {
    return getRequest('/business/hospital-detail-analysis/trend', { ...params, period });
  }
};

// 区域数据API
export const DistrictAPI = {
  // 获取区域统计
  getDistrictStats: (params) => {
    return getRequest('/business/hospital-detail-analysis/districts', params);
  },

  // 获取区域详情
  getDistrictDetail: (districtId) => {
    return getRequest(`/business/hospital-detail-analysis/district/${districtId}/detail`);
  },

  // 获取区域趋势
  getDistrictTrend: (districtId, params) => {
    return getRequest(`/business/hospital-detail-analysis/district/${districtId}/trend`, params);
  }
};

// 医院数据API
export const HospitalAPI = {
  // 获取医院统计
  getHospitalStats: (params) => {
    return getRequest('/business/hospital-detail-analysis/hospitals', params);
  },

  // 获取医院详情
  getHospitalDetail: (hospitalId) => {
    return getRequest(`/business/hospital-detail-analysis/hospital/${hospitalId}/detail`);
  },

  // 获取医院趋势
  getHospitalTrend: (hospitalId, params) => {
    return getRequest(`/business/hospital-detail-analysis/hospital/${hospitalId}/trend`, params);
  }
};

// 病种数据API
export const DiseaseAPI = {
  // 获取病种统计
  getDiseaseStats: (params) => {
    return getRequest('/business/hospital-detail-analysis/diseases', params);
  },

  // 获取病种详情
  getDiseaseDetail: (diseaseCode) => {
    return getRequest(`/business/hospital-detail-analysis/disease/${diseaseCode}/detail`);
  },

  // 获取病种趋势
  getDiseaseTrend: (diseaseCode, params) => {
    return getRequest(`/business/hospital-detail-analysis/disease/${diseaseCode}/trend`, params);
  }
};

// 明细数据API
export const DetailAPI = {
  // 获取住院明细
  getHospitalizationDetail: (params) => {
    return getRequest('/business/hospital-detail-analysis/detail/hospitalization', params);
  },

  // 获取住院明细列表
  getHospitalizationList: (params) => {
    return getRequest('/business/hospital-detail-analysis/detail/hospitalization/list', params);
  }
};