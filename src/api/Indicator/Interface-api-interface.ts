// 定义接口
export interface IndicatorDecompositionApiInterface {
     //查询接口
     query:(obj:object)=>  Promise<object>;
     //添加/修改接口
     add:(obj:object)=>  Promise<object>;
     //删除接口
     del:(id:string)=>  Promise<object>;
     //确认接受接口
     updateByk_complete:(id:string)=>  Promise<object>;
     //进度完成审核通过接口
     updateByk_complet_success:(obj:object)=>  Promise<object>;
     //进度完成审核不通过接口
     updateByk_complet_noSuccess:(obj:object)=>  Promise<object>;
     //进度完成审核不通过确认接口
     repairOK:(obj:object)=>  Promise<object>;

     //查询操作记录接口
     queryLog:(obj:object)=>  Promise<object>;

     //查询提交进度记录接口
     queryComplete:(obj:object)=>  Promise<object>;
     //提交进度接口
     addComplete:(obj:object)=>  Promise<object>;

     //查询审核记录接口
     queryRepair:(obj:object)=>  Promise<object>;
     //提交审核接口
     addRepairRemind:(k_idp_id:string)=>  Promise<object>;
     //提交审核接口
     addOkRemind:(k_idp_id:string)=>  Promise<object>;

    //延期申请查询接口
    queryDelay:(obj:object)=>  Promise<object>;
    //延期申请添加/修改接口
    addDelay:(obj:object)=>  Promise<object>;
    //延期申请撤销接口
    deleteDelay:(obj:object)=>  Promise<object>;
    //审核延期申请接口
    updateDelayByStatus:(obj:object)=>  Promise<object>;

    //撤销进度提交
    deleteComplete:(obj:object)=>  Promise<object>;

    //查询操作记录接口
    queryIndicator:(obj:object)=>  Promise<object>;


    //查询指标责任划分接口
    queryAllocation:(obj:object)=>  Promise<object>;
    //查询指标第一指标接口
    queryIndicatorOne:()=>  Promise<object>;
    //查询指标第二指标接口
    queryIndicatorTwo:(parent_id:string)=>  Promise<object>;
    //添加或更新指标责任划分接口
    addAllocation:(obj:object)=>  Promise<object>;
    //下载固定模板
    downLoadTemplate:(config_key:string,fun:Function)=>void;
    //下载指标责任配置模板和数据
    downLoadAllocation:(type:string,fun:Function)=>void;

    //导入文件
    upLoadAllocation:(formData:FormData)=>  Promise<object>;

    //查询异常数据
    queryAllocationListByError:()=>  Promise<object>;

    //查询接口
    queryAttention:(obj:object)=>  Promise<object>;
    //添加接口
    addAttention:(obj:object)=>  Promise<object>;
    //取消接口
    delAttention:(id:string)=>  Promise<object>;
    //关注数据接口
    queryByGZCount:()=>  Promise<object>;

    //数据展板汇总
    queryBoard:(obj:object)=>  Promise<object>;

    //查询数据导出信息
    queryByReporting:(obj:object)=>  Promise<object>;
    //查询数据导出操作日志信息
    queryByReportingLog:(obj:object)=>  Promise<object>;
    //插入数据导出操作日志信息
    addReportingLog:(obj:object)=>  Promise<object>;

    //查询指标采集数据信息
    queryDetail:(obj:object)=>  Promise<object>;
    //锁定指标数据
    suoDingDetail:(obj:object)=>  Promise<object>;
    //解锁指标数据
    jieSuoDetail:(obj:object)=>  Promise<object>;
    //导出数据
    downLoadReporting:(type:object,fun:Function)=>void;
    //获取三级四级指标数据
    queryIndicatorBySanJI:()=>  Promise<object>;

    //异常查询
    queryData_YC:(obj:object)=>  Promise<object>;
}