import { getRequest } from '/@/lib/axios';

// 住院分析汇总相关API
export const HospitalAnalysisAPI = {
  // 获取住院概览数据
  getOverview: (params) => {
    return getRequest('/business/hospital/analysis/overview', params);
  },

  // 获取住院趋势数据
  getTrendData: (params) => {
    return getRequest('/business/hospital/analysis/trend', params);
  },

  // 获取区域汇总数据
  getAreaSummary: (params) => {
    return getRequest('/business/hospital/analysis/area/summary', params);
  },

  // 获取医疗机构汇总数据
  getHospitalSummary: (params) => {
    return getRequest('/business/hospital/analysis/institution/summary', params);
  },

  // 获取病种汇总数据
  getDiseaseSummary: (params) => {
    return getRequest('/business/hospital/analysis/disease/summary', params);
  },

  // 获取住院明细列表
  getDetailList: (params) => {
    return getRequest('/business/hospital/analysis/detail/list', params);
  },

  // 根据区域下钻获取明细
  getDetailByArea: (districtCode, params) => {
    return getRequest(`/business/hospital/analysis/detail/area/${districtCode}`, params);
  },

  // 根据医疗机构下钻获取明细
  getDetailByHospital: (hospitalCode, params) => {
    return getRequest(`/business/hospital/analysis/detail/hospital/${hospitalCode}`, params);
  },

  // 根据病种下钻获取明细
  getDetailByDisease: (diseaseCode, params) => {
    return getRequest(`/business/hospital/analysis/detail/disease/${diseaseCode}`, params);
  }
};

// 区域汇总相关API (兼容旧调用)
export const AreaSummaryAPI = {
  // 获取区域汇总数据
  getAreaSummary: (params) => {
    return getRequest('/business/hospital/analysis/area/summary', params);
  },

  // 获取区域详情
  getAreaDetail: (districtCode, params) => {
    return getRequest(`/business/hospital/analysis/detail/area/${districtCode}`, params);
  }
};

// 医疗机构汇总相关API (兼容旧调用)
export const HospitalSummaryAPI = {
  // 获取医疗机构汇总数据
  getHospitalSummary: (params) => {
    return getRequest('/business/hospital/analysis/institution/summary', params);
  },

  // 获取医疗机构详情
  getHospitalDetail: (hospitalCode, params) => {
    return getRequest(`/business/hospital/analysis/detail/hospital/${hospitalCode}`, params);
  }
};

// 病种汇总相关API (兼容旧调用)
export const DiseaseSummaryAPI = {
  // 获取病种汇总数据
  getDiseaseSummary: (params) => {
    return getRequest('/business/hospital/analysis/disease/summary', params);
  },

  // 获取病种详情
  getDiseaseDetail: (diseaseCode, params) => {
    return getRequest(`/business/hospital/analysis/detail/disease/${diseaseCode}`, params);
  }
};

// 住院明细相关API (兼容旧调用)
export const HospitalDetailAPI = {
  // 获取住院明细列表
  getDetailList: (params) => {
    return getRequest('/business/hospital/analysis/detail/list', params);
  },

  // 根据区域获取明细
  getDetailByArea: (districtCode, params) => {
    return getRequest(`/business/hospital/analysis/detail/area/${districtCode}`, params);
  },

  // 根据医疗机构获取明细
  getDetailByHospital: (hospitalCode, params) => {
    return getRequest(`/business/hospital/analysis/detail/hospital/${hospitalCode}`, params);
  },

  // 根据病种获取明细
  getDetailByDisease: (diseaseCode, params) => {
    return getRequest(`/business/hospital/analysis/detail/disease/${diseaseCode}`, params);
  }
};

// 筛选条件相关API
export const FilterOptionsAPI = {
  // 获取区县列表
  getDistrictList: () => {
    return getRequest('/business/hospital/filter/districts');
  },

  // 获取乡镇列表
  getTownList: (districtCode) => {
    return getRequest(`/business/hospital/filter/towns/${districtCode}`);
  },

  // 获取医疗机构级别
  getHospitalLevels: () => {
    return getRequest('/business/hospital/filter/hospital-levels');
  },

  // 获取险种类型
  getInsuranceTypes: () => {
    return getRequest('/business/hospital/filter/insurance-types');
  },

  // 获取ICD病种类目
  getIcdCategories: () => {
    return getRequest('/business/hospital/filter/icd-categories');
  }
};

// 图表数据相关API
export const HospitalChartAPI = {
  // 获取住院人次图表数据
  getAdmissionChartData: (params) => {
    return getRequest('/business/hospital/chart/admissions', params);
  },

  // 获取住院费用图表数据
  getCostChartData: (params) => {
    return getRequest('/business/hospital/chart/costs', params);
  },

  // 获取报销比例图表数据
  getReimbursementChartData: (params) => {
    return getRequest('/business/hospital/chart/reimbursement', params);
  },

  // 获取住院率图表数据
  getAdmissionRateChartData: (params) => {
    return getRequest('/business/hospital/chart/admission-rate', params);
  },

  // 获取外转率图表数据
  getTransferRateChartData: (params) => {
    return getRequest('/business/hospital/chart/transfer-rate', params);
  }
};
