export const file_class_init=(name)=>{
    return new file_class(name);
}
//文件管理
class file_class{
    name:string;
    constructor(name) {
        this.name = name;
    }
    file_kufang:file_kufang= new file_kufang();
    file_kuwei:file_kuwei= new file_kuwei();
    file_info_upper:file_info_upper= new file_info_upper();
    file_info:file_info= new file_info();

    kufang:Object = [
        {label:'库房id',key:'id',type:'input',disabled:true,exist:true},
        {label:'库房名称',key:'k_name',type:'input',required:true},
        {label:'库房描述',key:'k_desc',type:'textarea'},
        {label:'库房状态',key:'k_status',type:'switch',
            checkedValue:1,
            unCheckedValue:-1,
            checkedChildren:'启用',
            unCheckedChildren:'停用'
        },
        {label:'库房排序',key:'k_sort',type:'number'}
    ];
    kuwei:Object = [
        {label:'库房id',key:'k_kufangid',type:'input',disabled:true,exist:true},
        {label:'库房名称',key:'k_kufang_name',type:'input',disabled:true,exist:true},
        {label:'库位id',key:'id',type:'input',disabled:true,exist:true},
        {label:'库位名称',key:'k_name',type:'input',required:true},
        {label:'库位编号',key:'k_bianhao',type:'input',required:true},
        {label:'库位位置',key:'k_weizhi',type:'input',required:true},        
        {label:'库位描述',key:'k_desc',type:'textarea'},
        {label:'库位状态',key:'k_status',type:'switch',
            checkedValue:1,
            unCheckedValue:-1,
            checkedChildren:'启用',
            unCheckedChildren:'停用'
        },
        {label:'库位排序',key:'k_sort',type:'number'}
    ];
    filemain:Object = [
        {label:'文件夹id',key:'id',type:'input',disabled:true,exist:true},
        {label:'文件夹名称',key:'k_name',type:'input',required:true},
        {label:'文件夹编号',key:'k_bianhao',type:'input',required:true},
        {label:'实体位置',key:'k_weizhi',type:'input',required:true},
        {label:'关联标签',key:'k_biaoqian',type:'select_multiple', dicDataurl:{
            url:'/support/dict/dictData/queryDictData/4',
            label:'dataLabel',
            value:'dataValue',
        }},
        {label:'文件夹描述',key:'k_desc',type:'textarea'},
        {label:'文件夹状态',key:'k_status',type:'switch',
            checkedValue:1,
            unCheckedValue:-1,
            checkedChildren:'启用',
            unCheckedChildren:'停用'
        },
        {label:'文件夹排序',key:'k_sort',type:'number'}
    ];
    filemaininfo:Object = [
        {label:'文件id',key:'id',type:'input',disabled:true,exist:true},
        {label:'文件名称',key:'k_name',type:'input',required:true},
        {label:'文件描述',key:'k_desc',type:'textarea'},
        {label:'文件类型',key:'k_lx',type:'select',
            required:true,dicData:[
            {
                value:1,
                label:'图片',
                accept:'.jpg,.jpeg,.png'
            },
            {
                value:2,
                label:'文本',
                accept:'.txt'
            },
            {
                value:3,
                label:'文档',
                accept:'.doc,.docx'
            },
            {
                value:4,
                label:'表格',
                accept:'.xls,.xlsx'
            },
            {
                value:5,
                label:'PDF文件',
                accept:'.pdf'
            },
            {
                value:6,
                label:'视频文件',
                accept:'.mp4'
            },
            {
                value:7,
                label:'PPT文件',
                accept:'.ppt,.pptx'
            },
        ]},
        {label:'文件上传',key:'k_fileid',type:'upload',required:true,bind_key:'k_lx', show_key:'show_fileids',show_name_key:'k_name',
            dicData:{
                1:'.jpg,.jpeg,.png',
                2:'.txt',
                3:'.doc,.docx',
                4:'.xls,.xlsx',
                5:'.pdf',
                6:'.mp4',
                7:'.ppt,.pptx'
            }
        },
        {label:'文件状态',key:'k_status',type:'switch',
            checkedValue:1,
            unCheckedValue:-1,
            checkedChildren:'启用',
            unCheckedChildren:'停用'
        },
        {label:'文件夹排序',key:'k_sort',type:'number'}
    ];

    init_class_data(obj,item){
        Object.keys(obj).forEach(element => {
            // 检查 属性 是否存在
            if (item[element] !== undefined && item[element] !== null) {
                obj[element]=item[element];
            }
            else{
                obj[element]='';
            }            
        }); 
        return obj;   
    }
    
}
//库房
class file_kufang{    
    id:string='';//库房id自增
    k_name:string='';//库房名称
    k_desc:string='';//库房描述
    k_status:string='1';//状态：0删除，1启用，-1停用
    k_sort:string='0';//排序从下到大 0-99999
}
//库位
class file_kuwei{
    id:string='';//库位id自增
    k_name:string='';//库位名称
    k_desc:string='';//库位描述
    k_status:string='1';//状态：0删除，1启用，-1停用
    k_sort:string='0';//排序从下到大 0-99999
    k_kufangid:string='';//库房id
    k_kufang_name:string='';//库房名称
    k_bianhao:string='';//库位编号
    k_weizhi:string='';//库位位置
}
//文件上架
class file_info_upper{
    id:string='';//文件上架id自增
    k_desc:string='';//文件上架描述
    k_status:string='1';//状态：0删除，1启用上架，-1停用下架
    k_sort:string='0';//排序从下到大 0-99999
    k_kufangid:string='';//库房id
    k_kuweiid:string='';//库位id
    k_infoids:string='';//文件ids集合 
}
//文件
class file_info{
    id:string='';//文件id自增
    k_name:string='';//文件名称
    k_desc:string='';//文件描述
    k_status:String='1';//状态：0删除放至回收站，1启用，-1停用，-2彻底删除
    k_sort:string='0';//排序从下到大 0-99999
    k_type:string='0';//文件分类：0文件夹，1文件
    k_parent_id:string='0';//文件父节点id
    k_fileid:string='0';//文件地址id
    show_fileids:string='';//显示文件地址id
    k_lx:string='0';//文件类型：1图片， 2文本， 3文档， 4表格， 5PDF文件，6视频文件 7PPT文件
    k_bianhao:string='';//文件编号
    k_weizhi:string='';//文件位置
    k_biaoqian:string='';//文件标签
    k_fuzhi:string='0';//是否复制的文件 1:复制 0原有
    k_fuzhi_id:string='0';//复制文件id
}
