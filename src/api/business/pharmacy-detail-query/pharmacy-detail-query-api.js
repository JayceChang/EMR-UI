import { postRequest, getRequest } from '/@/lib/axios';

// 药房结算明细查询相关API
export const PharmacyDetailQueryAPI = {
  // 获取药房结算明细列表
  getPharmacyDetailList: (params) => {
    return getRequest({
      url: '/business/pharmacy/detail-settlement/list',
      method: 'get',
      params
    });
  },

  // 获取药房结算明细数据（分页）
  getPharmacyDetailWithPage: (page, pageSize, params) => {
    return getRequest({
      url: '/business/pharmacy/detail-settlement/page',
      method: 'get',
      params: {
        ...params,
        page,
        pageSize
      }
    });
  },

  // 获取药房结算统计数据
  getPharmacyStatistics: (params) => {
    return getRequest({
      url: '/business/pharmacy/detail-settlement/statistics',
      method: 'get',
      params
    });
  },

  // 获取患者药房消费历史
  getPatientPharmacyHistory: (idCard) => {
    return getRequest({
      url: `/business/pharmacy/detail-settlement/patient/${idCard}/history`,
      method: 'get'
    });
  },

  // 导出路房结算明细数据
  exportPharmacyDetail: (params) => {
    return postRequest({
      url: '/business/pharmacy/detail-settlement/export',
      method: 'post',
      data: params,
      responseType: 'blob'
    });
  }
};

// 筛选条件相关API
export const PharmacyFilterAPI = {
  // 获取药房列表
  getPharmacyList: (params) => {
    return getRequest({
      url: '/business/pharmacy/filter/pharmacies',
      method: 'get',
      params
    });
  },

  // 获取区县列表
  getDistrictList: () => {
    return getRequest({
      url: '/business/pharmacy/filter/districts',
      method: 'get'
    });
  },

  // 根据区县获取乡镇列表
  getTownList: (districtCode) => {
    return getRequest({
      url: `/business/pharmacy/filter/towns/${districtCode}`,
      method: 'get'
    });
  },

  // 获取药房级别列表
  getPharmacyLevels: () => {
    return getRequest({
      url: '/business/pharmacy/filter/pharmacy-levels',
      method: 'get'
    });
  }
};

// 下钻分析相关API
export const PharmacyDrillDownAPI = {
  // 下钻分析患者明细
  getPatientDetail: (params) => {
    return getRequest({
      url: '/business/pharmacy/drill-down/patient',
      method: 'get',
      params
    });
  },

  // 下钻分析药房明细
  getPharmacyDetail: (pharmacyName, params) => {
    return getRequest({
      url: `/business/pharmacy/drill-down/pharmacy/${pharmacyName}`,
      method: 'get',
      params
    });
  },

  // 下钻分析区域明细
  getRegionDetail: (regionName, params) => {
    return getRequest({
      url: `/business/pharmacy/drill-down/region/${regionName}`,
      method: 'get',
      params
    });
  }
};

// 统计报表相关API
export const PharmacyReportAPI = {
  // 获取药房结算趋势数据
  getSettlementTrendData: (params) => {
    return getRequest({
      url: '/business/pharmacy/report/settlement-trend',
      method: 'get',
      params
    });
  },

  // 获取药房结算费用趋势
  getCostTrendData: (params) => {
    return getRequest({
      url: '/business/pharmacy/report/cost-trend',
      method: 'get',
      params
    });
  },

  // 获取药房排名数据
  getPharmacyRankingData: (params) => {
    return getRequest({
      url: '/business/pharmacy/report/pharmacy-ranking',
      method: 'get',
      params
    });
  },

  // 获取药品类别统计
  getDrugCategoryStatistics: (params) => {
    return getRequest({
      url: '/business/pharmacy/report/drug-category',
      method: 'get',
      params
    });
  }
};
