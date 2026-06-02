import { postRequest, getRequest } from '/@/lib/axios';

// 职工住院数据分析相关API
export const WorkerHospitalAnalysisAPI = {
  // 获取概览数据
  getOverviewData: (params) => {
    return getRequest('/business/worker-hospital-analysis/overview', params);
  },

  // 获取医疗集团数据
  getMedicalGroupData: (params) => {
    return getRequest('/business/worker-hospital-analysis/medical-groups', params);
  },

  // 获取区县数据
  getDistrictData: (params) => {
    return getRequest('/business/worker-hospital-analysis/districts', params);
  },

  // 获取医疗机构数据(分页)
  getInstitutionData: (data) => {
    return postRequest('/business/worker-hospital-analysis/institutions', data);
  },

  // 获取所有数据
  getAllData: (params) => {
    return getRequest('/business/worker-hospital-analysis/all', params);
  }
};

// 医疗集团下钻分析API
export const MedicalGroupDrillDownAPI = {
  // 下钻医疗集团详情
  getGroupDetail: (groupName) => {
    return getRequest(`/business/worker-hospital-analysis/medical-group/${groupName}/detail`);
  },

  // 获取医疗集团趋势数据
  getGroupTrend: (groupName, params) => {
    return getRequest(`/business/worker-hospital-analysis/medical-group/${groupName}/trend`, params);
  },

  // 获取医疗集团下医疗机构列表
  getGroupInstitutions: (groupName, params) => {
    return getRequest(`/business/worker-hospital-analysis/medical-group/${groupName}/institutions`, params);
  }
};

// 区县下钻分析API
export const DistrictDrillDownAPI = {
  // 下钻区县详情
  getDistrictDetail: (districtName) => {
    return getRequest(`/business/worker-hospital-analysis/district/${districtName}/detail`);
  },

  // 获取区县下医疗机构列表
  getDistrictInstitutions: (districtName, params) => {
    return getRequest(`/business/worker-hospital-analysis/district/${districtName}/institutions`, params);
  },

  // 获取区县趋势数据
  getDistrictTrend: (districtName, params) => {
    return getRequest(`/business/worker-hospital-analysis/district/${districtName}/trend`, params);
  }
};

// 医疗机构下钻分析API
export const InstitutionDrillDownAPI = {
  // 下钻医疗机构详情
  getInstitutionDetail: (institutionName) => {
    return getRequest(`/business/worker-hospital-analysis/institution/${institutionName}/detail`);
  },

  // 获取医疗机构历史数据
  getInstitutionHistory: (institutionName, params) => {
    return getRequest(`/business/worker-hospital-analysis/institution/${institutionName}/history`, params);
  },

  // 获取医疗机构病例分析
  getInstitutionCases: (institutionName, params) => {
    return getRequest(`/business/worker-hospital-analysis/institution/${institutionName}/cases`, params);
  }
};

// 统计图表相关API
export const ChartDataAPI = {
  // 获取住院趋势图表数据
  getHospitalizationTrend: (params) => {
    return getRequest('/business/worker-hospital-analysis/chart/hospitalization-trend', params);
  },

  // 获取费用趋势图表数据
  getCostTrend: (params) => {
    return getRequest('/business/worker-hospital-analysis/chart/cost-trend', params);
  },

  // 获取报销趋势图表数据
  getReimbursementTrend: (params) => {
    return getRequest('/business/worker-hospital-analysis/chart/reimbursement-trend', params);
  },

  // 获取住院天数趋势图表数据
  getHospitalDaysTrend: (params) => {
    return getRequest('/business/worker-hospital-analysis/chart/hospital-days-trend', params);
  },

  // 获取医疗集团分布饼图数据
  getMedicalGroupDistribution: (params) => {
    return getRequest('/business/worker-hospital-analysis/chart/medical-group-distribution', params);
  },

  // 获取区县分布柱状图数据
  getDistrictDistribution: (params) => {
    return getRequest('/business/worker-hospital-analysis/chart/district-distribution', params);
  },

  // 获取医院等级分布数据
  getHospitalLevelDistribution: (params) => {
    return getRequest('/business/worker-hospital-analysis/chart/hospital-level-distribution', params);
  }
};

// 同比环比分析API
export const ComparisonAPI = {
  // 获取同比数据
  getYearOverYear: (params) => {
    return getRequest('/business/worker-hospital-analysis/comparison/yoy', params);
  },

  // 获取环比数据
  getMonthOverMonth: (params) => {
    return getRequest('/business/worker-hospital-analysis/comparison/mom', params);
  },

  // 获取同比环比综合分析
  getComprehensiveComparison: (params) => {
    return getRequest('/business/worker-hospital-analysis/comparison/comprehensive', params);
  }
};

// 疾病分析相关API
export const DiseaseAnalysisAPI = {
  // 获取疾病分布数据
  getDiseaseDistribution: (params) => {
    return getRequest('/business/worker-hospital-analysis/disease/distribution', params);
  },

  // 获取疾病费用分析
  getDiseaseCostAnalysis: (params) => {
    return getRequest('/business/worker-hospital-analysis/disease/cost-analysis', params);
  },

  // 获取疾病住院天数分析
  getDiseaseDaysAnalysis: (params) => {
    return getRequest('/business/worker-hospital-analysis/disease/days-analysis', params);
  }
};

// 筛选和查询API
export const FilterAPI = {
  // 获取医疗机构列表（用于筛选）
  getInstitutionList: (params) => {
    return getRequest('/business/worker-hospital-analysis/filter/institutions', params);
  },

  // 获取医疗集团列表（用于筛选）
  getMedicalGroupList: () => {
    return getRequest('/business/worker-hospital-analysis/filter/medical-groups');
  },

  // 获取区县列表（用于筛选）
  getDistrictList: () => {
    return getRequest('/business/worker-hospital-analysis/filter/districts');
  },

  // 获取医院等级列表（用于筛选）
  getHospitalLevelList: () => {
    return getRequest('/business/worker-hospital-analysis/filter/hospital-levels');
  }
};