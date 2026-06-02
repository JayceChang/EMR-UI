/*
 * 企业信息
 *
 */
import {postRequest, getRequest, postDownload} from '/@/lib/axios';

export const enterpriseApi = {

    create: (param) => {
        return postRequest('/oa/enterprise/create', param);
    },


    delete: (enterpriseId) => {
        return getRequest(`/oa/enterprise/delete/${enterpriseId}`);
    },


    detail: (enterpriseId) => {
        return getRequest(`/oa/enterprise/get/${enterpriseId}`);
    },


    pageQuery: (param) => {
        return postRequest('/oa/enterprise/page/query', param);
    },


    exportExcel: (param) => {
        return postDownload('/oa/enterprise/exportExcel', param);
    },


    queryList: (type) => {
        let query = '';
        if (type) {
            query = `?type=${type}`;
        }
        return getRequest(`/oa/enterprise/query/list${query}`);
    },


    update: (param) => {
        return postRequest('/oa/enterprise/update', param);
    },

    employeeList: (param) => {
        return postRequest('/oa/enterprise/employee/list', param);
    },

    queryPageEmployeeList: (param) => {
        return postRequest('/oa/enterprise/employee/queryPage', param);
    },

    addEmployee: (param) => {
        return postRequest('/oa/enterprise/employee/add', param);
    },


    deleteEmployee: (param) => {
        return postRequest('/oa/enterprise/employee/delete', param);
    },

};
