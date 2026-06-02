import { getRequest, postRequest } from '/@/lib/axios';

/**
 * 质控管理 API
 */
export class QualityControlApi {
  /**
   * 获取质控问题列表
   * @param {Object} params - 查询参数
   * @param {string} params.status - 处理状态：pending(未处理), processed(已处理), all(全部)
   * @param {string} params.type - 问题类型：内容问题、逻辑问题、完整性问题等
   * @param {string} params.departmentId - 科室ID
   * @param {string} params.doctorId - 医生ID
   * @param {string} params.patientName - 患者姓名（模糊查询）
   * @param {string} params.admissionNo - 住院号
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @param {number} params.current - 当前页码
   * @param {number} params.pageSize - 每页条数
   * @returns {Promise}
   */
  static getQualityProblemList(params = {}) {
    return postRequest('/business/quality-control/problems/list', params);
  }

  /**
   * 获取质控问题详情
   * @param {number} problemId - 问题ID
   * @returns {Promise}
   */
  static getQualityProblemDetail(problemId) {
    return getRequest(`/business/quality-control/problems/${problemId}`);
  }

  /**
   * 获取病历详情
   * @param {number} problemId - 问题ID
   * @returns {Promise}
   */
  static getMedicalRecordDetail(problemId) {
    return getRequest(`/business/quality-control/medical-records/${problemId}`);
  }

  /**
   * 处理质控问题
   * @param {Object} data - 处理数据
   * @param {number} data.problemId - 问题ID
   * @param {string} data.action - 处理动作：resolve(已处理), ignore(无需处理)
   * @param {string} data.remark - 处理备注
   * @param {string} data.operatorId - 操作人ID
   * @returns {Promise}
   */
  static handleQualityProblem(data) {
    return postRequest('/business/quality-control/problems/handle', data);
  }

  /**
   * 批量处理质控问题
   * @param {Object} data - 批量处理数据
   * @param {Array} data.problemIds - 问题ID数组
   * @param {string} data.action - 处理动作：resolve(已处理), ignore(无需处理)
   * @param {string} data.remark - 处理备注
   * @param {string} data.operatorId - 操作人ID
   * @returns {Promise}
   */
  static batchHandleQualityProblems(data) {
    return postRequest('/business/quality-control/problems/batch-handle', data);
  }

  /**
   * 获取质控统计数据
   * @param {Object} params - 查询参数
   * @param {string} params.departmentId - 科室ID
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise}
   */
  static getQualityStatistics(params = {}) {
    return postRequest('/business/quality-control/statistics', params);
  }

  /**
   * 获取质控问题类型字典
   * @returns {Promise}
   */
  static getQualityProblemTypes() {
    return getRequest('/business/quality-control/problem-types');
  }

  /**
   * 获取处理状态字典
   * @returns {Promise}
   */
  static getProcessStatusDict() {
    return getRequest('/business/quality-control/process-status');
  }
}

export function getQualityControlDetails(params) {
  return postRequest('/api/quality-control/details', params);
}


export function confirmQualityControl(params) {
  return postRequest('/api/quality-control/confirm', params);
}

export function recheckQualityControl(params) {
  return postRequest('/api/quality-control/recheck', params);
}


