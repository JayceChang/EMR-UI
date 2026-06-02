import { IndicatorDecompositionApiInterface } from './Interface-api-interface';
import { getRequest, postRequest,getDownload } from '/@/lib/axios';
// 实现接口
export const IndicatorApi:IndicatorDecompositionApiInterface= {
    query: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/query', obj);
    },
    add: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/add', obj);
    },
    del: function (id: string): Promise<object> {
        return postRequest('/indicator/decomposition/del/' + id);
    },
    updateByk_complete: function (id: string): Promise<object> {
        return postRequest('/indicator/decomposition/updateByk_complete/' + id);
    },
    //进度完成审核通过接口
    updateByk_complet_success: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/updateByk_complet_success', obj);
    },
    //进度完成审核不通过接口
    updateByk_complet_noSuccess: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/updateByk_complet_noSuccess', obj);
    },
    //进度完成审核不通过确认接口
    repairOK: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/repairOK', obj);
    },

    queryLog: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/queryLog', obj);
    },
    queryComplete: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/queryComplete', obj);
    },
    addComplete: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/addComplete', obj);
    },
    queryRepair: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/queryRepair', obj);
    },
    addRepairRemind: function (k_idp_id: string): Promise<object> {
        return postRequest('/indicator/decomposition/addRepairRemind/' + k_idp_id);
    },
    addOkRemind: function (k_idp_id: string): Promise<object> {
        return postRequest('/indicator/decomposition/addOkRemind/' + k_idp_id);
    },
    queryDelay: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/queryDelay', obj);
    },
    addDelay: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/addDelay', obj);
    },
    deleteDelay: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/deleteDelay', obj);
    },
    updateDelayByStatus: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/updateDelayByStatus', obj);
    },
    deleteComplete: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/deleteComplete', obj);
    },
    queryIndicator: function (obj: object): Promise<object> {
        return postRequest('/indicator/decomposition/queryIndicator', obj);
    },

    //查询指标责任划分接口
    queryAllocation: function (obj: object): Promise<object> {
        return postRequest('/indicator/allocation/query', obj);
    },
    //查询指标第一指标接口
    queryIndicatorOne: function (): Promise<object> {
        return postRequest('/indicator/allocation/query_indicator_one');
    },
    //查询指标第二指标接口
    queryIndicatorTwo: function (parent_id: string): Promise<object> {
        return postRequest('/indicator/allocation/query_indicator_two/' + parent_id);
    },
    //添加或更新指标责任划分接口
    addAllocation: function (obj: object): Promise<object> {
        return postRequest('/indicator/allocation/add', obj);
    },
    //下载固定模板
    downLoadTemplate: function (config_key: string, fun: Function) {
        getDownload('/indicator/allocation/downLoadTemplate', { config_key }, fun);
    },
    //下载指标责任配置模板和数据
    downLoadAllocation: function (type: string, fun: Function) {
        getDownload('/indicator/allocation/downLoadAllocation', { type }, fun);
    },
    //导入文件
    upLoadAllocation: function (formData: FormData): Promise<object> {
        return postRequest('/indicator/allocation/upLoadAllocation', formData);
    },
    //查询异常数据
    queryAllocationListByError: function (): Promise<object> {
        return postRequest('/indicator/allocation/queryAllocationListByError');
    },

    queryAttention: function (obj: object): Promise<object> {
        return postRequest('/indicator/attention/query', obj);
    },
    addAttention: function (obj: object): Promise<object> {
        return postRequest('/indicator/attention/add', obj);
    },
    delAttention: function (id: string): Promise<object> {
        return postRequest('/indicator/attention/del/' + id);
    },
    queryByGZCount: function (): Promise<object> {
        return postRequest('/indicator/attention/queryByGZCount');
    },
    //数据展板汇总
    queryBoard: function (obj: object): Promise<object> {
        return postRequest('/indicator/attention/queryBoard', obj);
    },
    //查询数据导出信息
    queryByReporting: function (obj: object): Promise<object> {
        return postRequest('/indicator/attention/queryByReporting', obj);
    },
    queryByReportingLog: function (obj: object): Promise<object> {
        return postRequest('/indicator/attention/queryByReportingLog', obj);
    },
    addReportingLog: function (obj: object): Promise<object> {
        return postRequest('/indicator/attention/addReportingLog', obj);
    },
    queryDetail: function (obj: object): Promise<object> {
        return postRequest('/indicator/attention/queryDetail', obj);
    },
    suoDingDetail: function (obj: object): Promise<object> {
        return postRequest('/indicator/attention/suoDingDetail', obj);
    },
    jieSuoDetail: function (obj: object): Promise<object> {
        return postRequest('/indicator/attention/jieSuoDetail', obj);
    },
    downLoadReporting: function (type: object, fun: Function) {
        getDownload('/indicator/attention/downLoadReporting', type, fun);
    },
    queryIndicatorBySanJI: function (): Promise<object> {
        return postRequest('/indicator/attention/queryIndicatorBySanJI');
    },
    queryData_YC: function (obj: object): Promise<object> {
       return postRequest('/warning/message',obj);
    }
}