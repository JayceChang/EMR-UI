import { getRequest } from '/@/lib/axios';

export const HOSPITAL_DRILL_DOWN_PATIENT_ENDPOINT = '/business/hospital-detail-analysis/detail/hospitalization';

const normalizeQueryParams = (params = {}) => {
  const normalized = { ...params };
  Object.keys(normalized).forEach((key) => {
    if (normalized[key] === undefined || normalized[key] === null || normalized[key] === '') {
      delete normalized[key];
    }
  });
  return normalized;
};

export const getHospitalPatientDrillPage = (params) => {
  return getRequest(HOSPITAL_DRILL_DOWN_PATIENT_ENDPOINT, normalizeQueryParams(params));
};

export const HospitalPatientDrillDownAPI = {
  getPatientDetail: (params) => {
    return getHospitalPatientDrillPage(params);
  },
};
