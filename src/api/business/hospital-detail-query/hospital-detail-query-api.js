import { postRequest, getRequest } from '/@/lib/axios';

// 住院明细查询相关API
export const HospitalDetailQueryAPI = {
  // 获取住院明细数据列表
  getHospitalDetailList: (params) => {
    return getRequest({
      url: '/business/hospital/detail/list',
      method: 'get',
      params
    });
  },

  // 获取住院统计数据
  getHospitalStatistics: (params) => {
    return getRequest({
      url: '/business/hospital/detail/statistics',
      method: 'get',
      params
    });
  },

  // 获取住院明细数据（分页）
  getHospitalDetailWithPage: (page, pageSize, params) => {
    return getRequest({
      url: '/business/hospital/detail/page',
      method: 'get',
      params: {
        ...params,
        page,
        pageSize
      }
    });
  },

  // 获取患者住院历史记录
  getPatientHospitalHistory: (idCard) => {
    return getRequest({
      url: `/business/hospital/detail/patient/${idCard}/history`,
      method: 'get'
    });
  },

  // 获取住院明细导出数据
  exportHospitalDetail: (params) => {
    return postRequest({
      url: '/business/hospital/detail/export',
      method: 'post',
      data: params,
      responseType: 'blob'
    });
  }
};

// 筛选条件相关API
export const HospitalFilterAPI = {
  // 获取ICD类目列表
  getICDCategories: () => {
    return getRequest({
      url: '/business/hospital/filter/icd-categories',
      method: 'get'
    });
  },

  // 获取ICD亚目列表
  getICDSubcategories: (categoryCode) => {
    return getRequest({
      url: `/business/hospital/filter/icd-subcategories/${categoryCode}`,
      method: 'get'
    });
  },

  // 获取医疗机构列表
  getHospitalList: (params) => {
    return getRequest({
      url: '/business/hospital/filter/hospitals',
      method: 'get',
      params
    });
  },

  // 获取区县列表
  getDistrictList: () => {
    return getRequest({
      url: '/business/hospital/filter/districts',
      method: 'get'
    });
  },

  // 根据区县获取乡镇列表
  getTownList: (districtCode) => {
    return getRequest({
      url: `/business/hospital/filter/towns/${districtCode}`,
      method: 'get'
    });
  }
};

// 下钻分析相关API
export const HospitalDrillDownAPI = {
  // 下钻分析患者明细
  getPatientDetail: (params) => {
    return getRequest({
      url: '/business/hospital/drill-down/patient',
      method: 'get',
      params
    });
  },

  // 下钻分析医院明细
  getHospitalDetail: (hospitalName, params) => {
    return getRequest({
      url: `/business/hospital/drill-down/hospital/${hospitalName}`,
      method: 'get',
      params
    });
  },

  // 下钻分析病种明细
  getDiseaseDetail: (icdCode, params) => {
    return getRequest({
      url: `/business/hospital/drill-down/disease/${icdCode}`,
      method: 'get',
      params
    });
  },

  // 下钻分析区域明细
  getRegionDetail: (regionName, params) => {
    return getRequest({
      url: `/business/hospital/drill-down/region/${regionName}`,
      method: 'get',
      params
    });
  }
};

// 统计报表相关API
export const HospitalReportAPI = {
  // 获取住院人次趋势数据
  getPatientTrendData: (params) => {
    return getRequest({
      url: '/business/hospital/report/patient-trend',
      method: 'get',
      params
    });
  },

  // 获取住院费用趋势数据
  getCostTrendData: (params) => {
    return getRequest({
      url: '/business/hospital/report/cost-trend',
      method: 'get',
      params
    });
  },

  // 获取医院排名数据
  getHospitalRankingData: (params) => {
    return getRequest({
      url: '/business/hospital/report/hospital-ranking',
      method: 'get',
      params
    });
  },

  // 获取病种排名数据
  getDiseaseRankingData: (params) => {
    return getRequest({
      url: '/business/hospital/report/disease-ranking',
      method: 'get',
      params
    });
  }
};
