// 定义接口
export interface FileApiInterface {
    //上传接口
    uploadFile: (obj:object) => Promise<object>;
    //下载接口
    downloadFile: (obj:object) => Promise<object>;
    //查询库房接口
    queryKufang:()=>  Promise<object>;
    //添加库房接口
    addKufang:(obj:object)=>  Promise<object>;
    //删除库房接口
    delKufang:(id:string)=>  Promise<object>;
    //查询库位接口
    queryKuWei:(kufangid: string)=>  Promise<object>;
    //添加库位接口
    addKuWei:(obj:object)=>  Promise<object>;
    //删除库位接口
    delKuwei:(id:string)=>  Promise<object>;
    //批量删除库位接口
    delListKuwei:(ids:object)=>  Promise<object>;
    //查看文件接口
    queryfile:(k_parent_id: string)=>  Promise<object>;
    //查看文件接口
    queryfileByIds:(ids:object)=>  Promise<object>;
    //查看已删除文件接口
    deleteQueryfile:()=>  Promise<object>;
    //添加文件夹接口
    addFileInfo:(obj:object)=>  Promise<object>;
    //删除
    delfile:(id:string)=>  Promise<object>;
    //彻底删除
    deepdelete:(id:string)=>  Promise<object>;
    //恢复文件接口
    backdelete:(id:string)=>  Promise<object>;
    //清空回收站
    clearDeleteList:()=>  Promise<object>;
    //获取文件数据
    getFileListByIds:(ids:object)=>  Promise<object>;
    //文件上架接口
    addFileUpperInfo:(obj:object)=>  Promise<object>;
     //删除文件上架接口
     delFileUpper:(id:string)=>  Promise<object>;
     //批量文件上架接口
     delFileUpper_PL:(ids:object)=>  Promise<object>;
     //查询文件上架接口
     queryFileUpper:()=>  Promise<object>;

    //查询文件权限接口
    queryRoleFile:(id:string)=>  Promise<object>;
    //文件权限接口
    addFileRoleFile:(obj:object)=>  Promise<object>;

    //查询文件分享接口
    queryShareFile:(id:string)=>  Promise<object>;
    //文件分享接口
    addFileShareFile:(obj:object)=>  Promise<object>;
    //取消分享接口
    delFileShareFile:(id:string)=>  Promise<object>;
}