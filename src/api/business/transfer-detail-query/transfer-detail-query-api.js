import { postRequest, getRequest } from '/@/lib/axios';

// 外转明细查询相关API
export const TransferDetailQueryAPI = {
  // 获取外转患者明细列表
  getTransferDetailList: (params) => {
    return getRequest('/business/transfer-detail-query/list', params);
  },

  // 获取外转患者明细数据（分页）- 合并page、pageSize到params
  getTransferDetailWithPage: (page, pageSize, params) => {
    return getRequest('/business/transfer-detail-query/page', {
      ...params,
      page,
      pageSize
    });
  },

  // 获取外转明细统计数据
  getTransferDetailStatistics: (params) => {
    return getRequest('/business/transfer-detail-query/statistics', params);
  },

  // 获取患者外转历史记录（动态URL，无额外params）
  getPatientTransferHistory: (idCard) => {
    return getRequest(`/business/transfer-detail-query/patient/${idCard}/history`);
  },

  // 导出国转明细数据（postRequest保持不变）
  exportTransferDetail: (params) => {
    return postRequest({
      url: '/business/transfer-detail-query/export',
      method: 'post',
      data: params,
      responseType: 'blob'
    });
  }
};

// 筛选条件相关API
export const TransferFilterAPI = {
  // 获取ICD类目列表（无参数）
  getICDCategories: () => {
    return getRequest('/business/transfer-detail-query/filter/icd-categories');
  },

  // 获取ICD亚目列表（动态URL，无额外params）
  getICDSubcategories: (categoryCode) => {
    return getRequest(`/business/transfer-detail-query/filter/icd-subcategories/${categoryCode}`);
  },

  // 获取医疗机构列表
  getHospitalList: (params) => {
    return getRequest('/business/transfer-detail-query/filter/hospitals', params);
  },

  // 获取区县列表（无参数）
  getDistrictList: () => {
    return getRequest('/business/transfer-detail-query/filter/districts');
  },

  // 根据区县获取乡镇列表（动态URL，无额外params）
  getTownList: (districtCode) => {
    return getRequest(`/business/transfer-detail-query/filter/towns/${districtCode}`);
  },

  // 获取医疗机构级别列表（无参数）
  getHospitalLevels: () => {
    return getRequest('/business/transfer-detail-query/filter/hospital-levels');
  }
};

// 下钻分析相关API
export const TransferDrillDownAPI = {
  // 下钻分析患者明细
  getPatientDetail: (params) => {
    return getRequest('/business/transfer-detail-query/drill-down/patient', params);
  },

  // 下钻分析医院明细（动态URL）
  getHospitalDetail: (hospitalName, params) => {
    return getRequest(`/business/transfer-detail-query/drill-down/hospital/${hospitalName}`, params);
  },

  // 下钻分析病种明细（动态URL）
  getDiseaseDetail: (icdCode, params) => {
    return getRequest(`/business/transfer-detail-query/drill-down/disease/${icdCode}`, params);
  },

  // 下钻分析区域明细（动态URL）
  getRegionDetail: (regionName, params) => {
    return getRequest(`/business/transfer-detail-query/drill-down/region/${regionName}`, params);
  }
};

// 统计报表相关API
export const TransferReportAPI = {
  // 获取外转人次趋势数据
  getTransferPatientTrendData: (params) => {
    return getRequest('/business/transfer-detail-query/report/patient-trend', params);
  },

  // 获取外转费用趋势数据
  getTransferCostTrendData: (params) => {
    return getRequest('/business/transfer-detail-query/report/cost-trend', params);
  },

  // 获取医院排名数据
  getHospitalRankingData: (params) => {
    return getRequest('/business/transfer-detail-query/report/hospital-ranking', params);
  },

  // 获取病种排名数据
  getDiseaseRankingData: (params) => {
    return getRequest('/business/transfer-detail-query/report/disease-ranking', params);
  },

  // 获取外转类型统计
  getTransferTypeStatistics: (params) => {
    return getRequest('/business/transfer-detail-query/report/transfer-type', params);
  }
};

// 外转类型相关API
export const TransferTypeAPI = {
  // 获取县域外转数据
  getCountyTransferData: (params) => {
    return getRequest('/business/transfer-detail-query/type/county', params);
  },

  // 获取市域外转数据
  getCityTransferData: (params) => {
    return getRequest('/business/transfer-detail-query/type/city', params);
  },

  // 获取外转类型对比
  getTransferTypeComparison: (params) => {
    return getRequest('/business/transfer-detail-query/type/comparison', params);
  }
};

// 患者信息相关API
export const PatientAPI = {
  // 获取患者基本信息（动态URL，无额外params）
  getPatientInfo: (idCard) => {
    return getRequest(`/business/transfer-detail-query/patient/${idCard}/info`);
  },

  // 获取患者外转记录（动态URL）
  getPatientTransferRecords: (idCard, params) => {
    return getRequest(`/business/transfer-detail-query/patient/${idCard}/transfer-records`, params);
  },

  // 获取患者医疗历史（动态URL，无额外params）
  getPatientMedicalHistory: (idCard) => {
    return getRequest(`/business/transfer-detail-query/patient/${idCard}/medical-history`);
  }
};