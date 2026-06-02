import { postRequest, getRequest } from '/@/lib/axios';

// 门诊结算明细查询相关API
export const ClinicDetailQueryAPI = {
  // 获取门诊结算明细列表
  getClinicDetailList: (params) => {
    return getRequest({
      url: '/business/clinic/detail/list',
      method: 'get',
      params
    });
  },

  // 获取门诊结算明细数据（分页）
  getClinicDetailWithPage: (page, pageSize, params) => {
    return getRequest({
      url: '/business/clinic/detail/page',
      method: 'get',
      params: {
        ...params,
        page,
        pageSize
      }
    });
  },

  // 获取门诊结算统计数据
  getClinicStatistics: (params) => {
    return getRequest({
      url: '/business/clinic/detail/statistics',
      method: 'get',
      params
    });
  },

  // 获取患者门诊历史记录
  getPatientClinicHistory: (idCard) => {
    return getRequest({
      url: `/business/clinic/detail/patient/${idCard}/history`,
      method: 'get'
    });
  },

  // 获取门诊结算明细导出数据
  exportClinicDetail: (params) => {
    return postRequest({
      url: '/business/clinic/detail/export',
      method: 'post',
      data: params,
      responseType: 'blob'
    });
  }
};

// 筛选条件相关API
export const ClinicFilterAPI = {
  // 获取医疗机构列表
  getHospitalList: (params) => {
    return getRequest({
      url: '/business/clinic/filter/hospitals',
      method: 'get',
      params
    });
  },

  // 获取ICD类目列表
  getICDCategories: () => {
    return getRequest({
      url: '/business/clinic/filter/icd-categories',
      method: 'get'
    });
  },

  // 获取ICD亚目列表
  getICDSubcategories: (categoryCode) => {
    return getRequest({
      url: `/business/clinic/filter/icd-subcategories/${categoryCode}`,
      method: 'get'
    });
  },

  // 获取区县列表
  getDistrictList: () => {
    return getRequest({
      url: '/business/clinic/filter/districts',
      method: 'get'
    });
  },

  // 根据区县获取乡镇列表
  getTownList: (districtCode) => {
    return getRequest({
      url: `/business/clinic/filter/towns/${districtCode}`,
      method: 'get'
    });
  },

  // 获取医疗机构级别列表
  getHospitalLevels: () => {
    return getRequest({
      url: '/business/clinic/filter/hospital-levels',
      method: 'get'
    });
  }
};

// 下钻分析相关API
export const ClinicDrillDownAPI = {
  // 下钻分析患者明细
  getPatientDetail: (params) => {
    return getRequest({
      url: '/business/clinic/drill-down/patient',
      method: 'get',
      params
    });
  },

  // 下钻分析医院明细
  getHospitalDetail: (hospitalName, params) => {
    return getRequest({
      url: `/business/clinic/drill-down/hospital/${hospitalName}`,
      method: 'get',
      params
    });
  },

  // 下钻分析病种明细
  getDiseaseDetail: (icdCode, params) => {
    return getRequest({
      url: `/business/clinic/drill-down/disease/${icdCode}`,
      method: 'get',
      params
    });
  },

  // 下钻分析区域明细
  getRegionDetail: (regionName, params) => {
    return getRequest({
      url: `/business/clinic/drill-down/region/${regionName}`,
      method: 'get',
      params
    });
  }
};

// 统计报表相关API
export const ClinicReportAPI = {
  // 获取门诊人次趋势数据
  getPatientTrendData: (params) => {
    return getRequest({
      url: '/business/clinic/report/patient-trend',
      method: 'get',
      params
    });
  },

  // 获取门诊费用趋势数据
  getCostTrendData: (params) => {
    return getRequest({
      url: '/business/clinic/report/cost-trend',
      method: 'get',
      params
    });
  },

  // 获取医院排名数据
  getHospitalRankingData: (params) => {
    return getRequest({
      url: '/business/clinic/report/hospital-ranking',
      method: 'get',
      params
    });
  },

  // 获取病种排名数据
  getDiseaseRankingData: (params) => {
    return getRequest({
      url: '/business/clinic/report/disease-ranking',
      method: 'get',
      params
    });
  },

  // 获取门诊类型统计
  getClinicTypeStatistics: (params) => {
    return getRequest({
      url: '/business/clinic/report/clinic-type',
      method: 'get',
      params
    });
  }
};
