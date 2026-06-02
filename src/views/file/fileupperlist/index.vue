<template>
    <div class="file">
        <div class="file_top">
            <div class="title">
                <div class="m_b_10">文件上架列表</div>
            </div>
            <div class="display_flex txt_right">
                <a-button @click="addFileInfo()" type="primary"><CloudUploadOutlined/>上架文件</a-button>
            </div>
        </div>
        <div class="file_main_info">      
            <div class="file_main">
                <div class="m_b_10" style="width: 100%;">
                    <div class="display_flex">
                        <div class="flex">
                            <a-button v-if="hasSelected" @click="delFileInfo()" type="primary" danger><DeleteOutlined />批量删除</a-button>
                        </div>                
                        <a-input-search class="sousuo"
                            v-model:value="k_info_name"
                            placeholder="请输入上架描述或文件名称搜索"
                            :loading="searchLoading"
                            allow-clear
                            enter-button
                            @search="onSearch"
                        />
                    </div>      
                </div>
                <a-table bordered
                    size="small"
                    row-key="id"
                    :columns="columns"
                    :data-source="dataSourceByPage"
                    :pagination="false"
                    :expand-column-width="30"
                    :scroll="{ x: 1500, y: 460 }"
                    :row-selection="rowSelection">
                    <template #bodyCell="{  text, record, column }">
                        <template v-if="column.color && k_info_name!='' && text.indexOf(k_info_name)>-1">
                            <a-button type="link" style="padding:0px;">{{ text }}</a-button>
                        </template>
                        <template v-if="column.operationData">
                            <template v-for="(item,i) in column.operationData" :key="i">
                                <a-button size="small" v-if="item.click" :type="item.type" :danger="item.danger" :ghost="item.ghost"  @click="columnClick(record,item.lx)">{{item.label}}</a-button>
                                <a-button size="small" v-else :type="item.type">{{item.label}}</a-button>
                            </template>
                        </template>
                        <template v-else-if="column.dicData">
                            <span v-if="column.dicData.findIndex(x=>x.value==text)>-1">            
                                <a-tag v-if="column.dicData.find(x=>x.value==text).color" :color=" column.dicData.find(x=>x.value==text).color ">
                                {{ column.dicData.find(x=>x.value==text).label }}
                                </a-tag>
                                <template v-else>
                                {{ column.dicData.find(x=>x.value==text).label }}
                                </template>
                            </span>
                            <span v-else>
                                {{ text }}
                            </span>
                        </template>
                    </template>     
                    <template #expandedRowRender="{ record }">
                        <a-table :dataSource="record.dataSource" :columns="fileColumns" 
                          :pagination="false" size="small">
                          <template #bodyCell="{  text, record, column }">
                            <template v-if="column.color && k_info_name!='' && text.indexOf(k_info_name)>-1">
                                <a-button size="small" type="link" style="padding:0px;">{{ text }}</a-button>
                            </template>
                            <template v-if="column.operationData && record.k_lx!=0">
                                <template v-for="(item,i) in column.operationData" :key="i">
                                    <a-button size="small" v-if="item.click" :type="item.type" :danger="item.danger" :ghost="item.ghost"  @click="columnClick(record,item.lx)">{{item.label}}</a-button>
                                    <a-button size="small" v-else :type="item.type">{{item.label}}</a-button>
                                </template>
                            </template>
                            <template v-else-if="column.dicData">
                                <span v-if="column.dicData.findIndex(x=>x.value==text)>-1">            
                                    <a-tag v-if="column.dicData.find(x=>x.value==text).color" :color=" column.dicData.find(x=>x.value==text).color ">
                                    {{ column.dicData.find(x=>x.value==text).label }}
                                    </a-tag>
                                    <template v-else>
                                    {{ column.dicData.find(x=>x.value==text).label }}
                                    </template>
                                </span>
                                <span v-else>
                                    {{ text }}
                                </span>
                            </template>
                        </template>       
                        </a-table>
                    </template>
                    <template #expandColumnTitle>
                        <span style="color: red">展开</span>
                    </template>              
                </a-table>
                <div class="w_100vw txt_right p_r_30">                    
                    <a-pagination
                        v-model:current="current1"
                        v-model:pageSize="pageSize"
                        show-size-changer
                        :total="dataListBySeach.length"
                    />  
                </div> 
            </div>         
        </div>        
        <!--弹窗-->
        <a-modal v-model:open="modalOpen" :title="modalObj.title" :footer="null" :maskClosable="false" :width="modalObj.width">
            <div class="model_info" v-if="modalObj.type=='form'">
                <a-form :model="formData"   
                    :label-col="{ span: 5 }" 
                    :wrapper-col="{ span: 17 }"
                    autocomplete="off"
                    @finish="onFinish"
                    @finishFailed="onFinishFailed">
                        <a-form-item label="选择库房" name="k_kufangid"
                        :rules="[{ required: true, message: '库房必填项不需为空！' }]">
                            <a-select
                                v-model:value="formData.k_kufangid"
                                style="width: 100%"
                                placeholder="请选择库房"
                                :options="optionsKuFangList"
                            />
                        </a-form-item>
                        <a-form-item label="选择库位" name="k_kuweiid"
                        :rules="[{ required: true, message: '库位必填项不需为空！' }]">
                            <a-select
                                v-model:value="formData.k_kuweiid"
                                style="width: 100%"
                                placeholder="请选择库位"
                                :options="optionsKuWeiList"
                            />
                        </a-form-item>
                        <a-form-item label="选择文件" name="k_infoids"
                        :rules="[{ required: true, message: '文件必填项不需为空！' }]">
                            <a-tree-select
                                v-model:value="checkedKeys"
                                style="width: 100%"
                                tree-checkable
                                tree-default-expand-all
                                :show-checked-strategy="SHOW_PARENT"
                                :height="233"
                                :tree-data="treeData"
                                :max-tag-count="10"
                                tree-node-filter-prop="title"
                            >
                                <template #title="{ title, value }">
                                <span v-if="value === '0-0-1-0'" style="color: #1890ff">{{ title }}</span>
                                <template v-else>{{ title }}</template>
                                </template>
                            </a-tree-select>
                        </a-form-item>
                        <a-form-item label="上架描述" name="k_desc">
                            <a-textarea v-model:value="formData.k_desc" :disabled="formProps.isView"/>
                        </a-form-item>
                        <a-form-item v-if="!formProps.isView" :wrapper-col="{ span: 18, offset: 4 }" class="txt_right">
                            <a-button type="primary" html-type="submit">保存</a-button>
                            <a-button v-if="formProps.isModal" style="margin-left: 10px" @click="closeModalFun()">取消</a-button>
                        </a-form-item>
                </a-form>
            </div>
            <div class="model_info" v-if="modalObj.type=='view'">
                <a-form :model="formData"   
                    :label-col="{ span: 5 }" 
                    :wrapper-col="{ span: 17 }"
                    autocomplete="off">
                        <a-form-item label="所在库房">
                            <a-button type="link">{{ viewData.k_kufang_name }}</a-button>
                        </a-form-item>
                        <a-form-item label="所在库位">
                            <a-button type="link">{{ viewData.k_kuwei_name }}</a-button>
                        </a-form-item>
                        <a-form-item label="所在库位编号">
                            <a-button type="link">{{ viewData.k_kuwei_bianhao }}</a-button>
                        </a-form-item>
                        <a-form-item label="所在库位位置">
                            <a-button type="link">{{ viewData.k_kuwei_weizhi }}</a-button>
                        </a-form-item>
                        <a-form-item label="文件数量">
                            <a-button type="link">{{ viewData.fileNum }}</a-button>
                        </a-form-item>
                        <a-form-item v-if="!formProps.isView" :wrapper-col="{ span: 18, offset: 4 }" class="txt_right">
                            <a-button  type="primary" v-if="formProps.isModal" style="margin-left: 10px" @click="closeModalFun()">确定</a-button>
                        </a-form-item>
                </a-form>
            </div>
        </a-modal>  
        <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel" :wrap-class-name="full_modal">
            <OfficePreview :fileInfo="fileInfo"/>
        </a-modal>     
    </div>
</template>
<script lang="js" setup>
import { ref,reactive,createVNode,watch,computed } from 'vue';
import { TreeSelect } from 'ant-design-vue';
import { message,Modal } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { FileApi } from '/@/api/file/file-api';
import { fileApi } from '/@/api/support/file-api';
import { file_class_init } from "/@/api/file/file-api-class";
import {columns,fileColumns}from './tableColumns'
import OfficePreview from "/@/components/officePreview/index.vue";
//定义变量
const k_info_name=ref('');
const searchLoading=ref(false);
const formData=ref({
    id:'',
    k_kufangid:'',
    k_kuweiid:'',
    k_infoids:'',
    k_desc:'',
});
const optionsKuFangList=ref([]);

//查询库房
const queryKufang=()=>{
    optionsKuFangList.value=[];
    FileApi.queryKufang().then((res)=>{
        if(res.code==0){
            let list=res.data;
            for(let i=0;i<list.length;i++){
                optionsKuFangList.value.push({
                    value:list[i].id,
                    label:list[i].k_name,
                    kuWeiList:[],
                });
                queryKuWei(list[i].id);
            }
        }
    }).catch((ex)=>{
             
    });
}
//查询库房
const queryKuWei=(kufangid)=>{
    FileApi.queryKuWei(kufangid).then((res)=>{
        if(res.code==0){
            let list=res.data;
            let idx=optionsKuFangList.value.findIndex(x=>x.value==kufangid);
            if(idx>-1){
                optionsKuFangList.value[idx].kuWeiList=[];
                for(let i=0;i<list.length;i++){
                    optionsKuFangList.value[idx].kuWeiList.push({
                        value:list[i].id,
                        label:list[i].k_name,
                    });
                }
            }            
        }
    }).catch((ex)=>{
          
    });
}
queryKufang();
const fileList=ref([]);
const treeData = ref([]);
//查询文件夹
const queryfile=()=>{    
    FileApi.queryfile(-1).then((res)=>{
        if(res.code==0){
            let  result_list=res.data;
            let  list=[];
            for (let i = 0; i < result_list.length; i ++) {
                const item = {
                    name: result_list[i].k_name,
                    id: result_list[i].id, 
                    parent_id:result_list[i].k_parent_id,   
                    k_name:result_list[i].k_name,
                    k_desc:result_list[i].k_desc,
                    k_lx:result_list[i].k_lx,
                    k_update_user:result_list[i].k_update_user,
                    k_update_time:result_list[i].k_update_time, 
                    k_status:result_list[i].k_status, 
                    k_fileid: result_list[i].k_fileid,    
                    show_fileids: result_list[i].show_fileids,        
                };
                list.push(item);
            }
            fileList.value=list;
            treeData.value=dig(0);
            queryFileUpper();
        }
    }).catch((ex)=>{
            
    });
    
}
queryfile();

const optionsKuWeiList = computed(() => {  
  const obj=optionsKuFangList.value.find(x=>x.value==formData.value.k_kufangid);
  clear_k_kuWeiId();
  return obj?obj.kuWeiList:[];
});



let editor=false;
const clear_k_kuWeiId=()=>{    
    if(!editor){
        formData.value.k_kuweiid='';
    }
    else{
        editor=false;
    }
}

const SHOW_PARENT = TreeSelect.SHOW_PARENT;
function dig(parent_id) {
  let result_list=[];
  let _list = fileList.value.filter(x=>x.parent_id==parent_id);
  for (let i = 0; i < _list.length; i ++) {
    const treeNode = {
      title: _list[i].name+ (_list[i].k_lx==0?"【文件夹】":""),
      value:_list[i].id,
      children: dig(_list[i].id)
    };
    result_list.push(treeNode);
  }
  return result_list;
}
const checkedKeys = ref([]);
watch(checkedKeys, () => {
  formData.value.k_infoids=checkedKeys.value.toString();
});

//表单提交
const onFinish = async values => {
    _file_class.init_class_data(_file_class.file_info_upper,formData.value);
    FileApi.addFileUpperInfo(_file_class).then(res=>{
        if(res.code==0){
            message.success('操作成功！');
            closeModalFun();
            queryFileUpper();                
        }
    }).catch((ex)=>{
    });
};
//表单验证失败
const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};
let dataSource=ref([]);
const queryFileUpper=()=>{
    FileApi.queryFileUpper().then((res)=>{
        if(res.code==0){
            let  result_list=res.data;
            dataSource.value=result_list;
            for(var i=0;i<result_list.length;i++){
                queryFile(result_list[i].id,result_list[i].k_infoids);
            }
            getListfileFunByPage();//分页处理
        }
    }).catch((ex)=>{
            
    });
}

const queryFile=(id,k_infoids)=>{
    let list=[];
    let idsList=k_infoids.split(',');
    idsList.forEach(element => {
        let obj_list=dig_children(parseInt(element),0);
        if(obj_list.length>0){
            list.push(obj_list[0]);
        }        
    });
    let idx=dataSource.value.findIndex(x=>x.id==id);
    dataSource.value[idx].dataSource=list;
}

function dig_children(id,lx) {
  let parent_id=id;
  let result_list=[];
  let _list = [];
  if(lx==0){
    _list = fileList.value.filter(x=>x.id==id);
  }
  else{
    _list = fileList.value.filter(x=>x.parent_id==parent_id);
  }
  for (let i = 0; i < _list.length; i ++) {
    let item =_list[i];
    let _item = {
        id:item.id,
        k_name:item.k_name,
        k_desc:item.k_desc,
        k_lx:item.k_lx,
        k_update_user:item.k_update_user,
        k_update_time:item.k_update_time,
        k_status:item.k_status, 
        k_fileid: item.k_fileid,    
        show_fileids: item.show_fileids,        
    };
    let children=dig_children(_item.id);
    if(children.length>0){
        _item.children=children;
    }
    result_list.push(_item);
  }
  return result_list;
}



const state = reactive({
  selectedRowKeys: [],
  // Check here to configure the default column
  loading: false,
});
const hasSelected = computed(() => state.selectedRowKeys.length > 0);
const rowSelection = ref({
  checkStrictly: false,
  onChange: (selectedRowKeys, selectedRows) => {
    state.selectedRowKeys = selectedRowKeys;
  },
  onSelect: (record, selected, selectedRows) => {    
    //console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    //console.log(selected, selectedRows, changeRows);
  },
});
const delFileInfo=()=>{
    //console.log('state.selectedRowKeys',state.selectedRowKeys);
    let msg='是否要批量删除已上架的文件？删除后无法恢复！';
    Modal.confirm({
        title: '删除提示',
        icon: createVNode(QuestionCircleOutlined),
        content: msg,
        okText: '确认',
        cancelText: '取消',
        onOk() {
            FileApi.delFileUpper_PL(state.selectedRowKeys).then((res)=>{
                if(res.code==0){
                    message.success('操作成功！');
                    state.selectedRowKeys=[];
                    queryFileUpper();                
                }
            }).catch((ex)=>{
            });
        },
        onCancel() {},
    });
}


const modalOpen = ref(false);
const modalObj= ref({});
const formProps=ref({isModal:true,isView:false});
// 创建响应式类实例
const _file_class = reactive(file_class_init('file'));
//定义方法
const searchLoadingInit=()=>{
    searchLoading.value=!searchLoading.value;
}
const onSearch = (searchValue) => {
    current1.value=1;
    getListfileFunByPage();
};
//删除上架文件
const deleteFun=(item)=>{  
    let msg='是否要删除已上架的文件:【上架id：'+item.id+'，'+item.k_desc+'】？删除后无法恢复！';
    Modal.confirm({
        title: '删除提示',
        icon: createVNode(QuestionCircleOutlined),
        content: msg,
        okText: '确认',
        cancelText: '取消',
        onOk() {
            FileApi.delFileUpper(item.id).then((res)=>{
                if(res.code==0){
                    message.success('操作成功！');
                    queryFileUpper();                
                }
            }).catch((ex)=>{
            });
        },
        onCancel() {},
    });
}
//上架文件夹
const addFileInfo=()=>{    
    formData.value={
        id:'',
        k_kufangid:'',
        k_kuweiid:'',
        k_infoids:'',
        k_desc:'',
    };
    checkedKeys.value=[];
    openModalFun({title:'上架文件',type:'form'});
}
const viewData=ref({});
const getFileNum=(item)=>{
    let num=item.filter(x=>x.k_lx!=0).length;
    let children_item=item.filter(x=>x.k_lx==0);
    if(children_item && children_item.length>0){
        for(var i=0;i<children_item.length;i++){
            num+= getFileNum(children_item[i].children);
        }        
    }
    return num;
}
//编辑或删除
const columnClick=(item,lx)=>{
    switch(lx){
        case '1':
            var checkedKeys_list=[];
            var list=item.k_infoids.split(',');
            list.forEach(element => {
                checkedKeys_list.push(parseInt(element));
            });
            editor=true;
            formData.value={
                id:item.id,
                k_kufangid:item.k_kufangid,
                k_kuweiid:item.k_kuweiid,
                k_infoids:item.k_infoids,
                k_desc:item.k_desc,
            };    
            console.log('formData.value',formData.value);       
            checkedKeys.value=checkedKeys_list;
            openModalFun({title:'编辑上架文件',type:'form'});
            break;//编辑
        case '-1': 
            deleteFun(item);
            break;//删除
        case '2': 
            viewData.value=item;
            viewData.value.fileNum=getFileNum(item.dataSource);
            openModalFun({title:'上架文件所在位置',type:'view'});
            break;//查看位置
            case '3':
            FileApi.getFileListByIds([item.k_fileid]).then((res)=>{
                if(res.code==0){  
                    res.data.forEach(element => {
                        var file={
                            uid: element.file_id,
                            name: item.k_name,
                            status: 'done',
                            url: '/api/upload/'+element.file_key,
                            thumbUrl: '/api/upload/'+element.file_key,
                        }
                        handlePreview(file);
                    });
                }        
                }).catch((ex)=>{
            });
            break;//查看
        case '4':
            FileApi.getFileListByIds([item.k_fileid]).then((res)=>{
                if(res.code==0){  
                    res.data.forEach(element => {
                        var file={
                            uid: element.file_id,
                            name: item.k_name,
                            status: 'done',
                            fileKey:element.file_key,
                            url: '/api/upload/'+element.file_key,
                            thumbUrl: '/api/upload/'+element.file_key,
                        }
                        handleDown(file);
                    });
                }        
                }).catch((ex)=>{
            });
            break;//下载
    }
}

const handleDown=async file =>{
    fileApi.downLoadByFileName(file.fileKey,file.name);// downLoadByFileName
}
const handlePreview = async file => {
  const { type, extension } = detectFileType(file.url);
  fileInfo.value = {
    'filePath':file.url || file.preview,
    'fileType':type
  }
  if(type=='image'){
    full_modal.value='';
  }
  else{
    full_modal.value='file_view-modal';
  }
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
const previewVisible = ref(false);
const previewTitle = ref('');
const fileInfo = ref({});
const full_modal=ref('file_view-modal');
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
/**文件类型转换 */
function detectFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const types = {
      // 图片
      jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', bmp: 'image', webp: 'image',
      // 文档
      pdf: 'pdf', 
      // 文本
      txt: 'text', csv: 'text', json: 'text', xml: 'text',
      // 压缩文件
      zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
      // 音视频
      mp3: 'audio', wav: 'audio', ogg: 'audio',
      mp4: 'video', webm: 'video', mov: 'video', avi: 'video',
      docx: 'docx',doc: 'doc',
      xlsx: 'xlsx',xls: 'xlsx',
      pptx: 'ppt',ppt: 'ppt',
    };
    
    return {
      extension,
      type: types[extension] || 'unknown'
    };
}


//打开弹窗
const openModalFun=(obj)=>{
    modalObj.value=obj;
    modalOpen.value=!modalOpen.value;
}
//关闭弹窗
const closeModalFun=()=>{
    modalOpen.value=!modalOpen.value;
}
//分页页面显示的数据
const dataSourceByPage=ref([]);
//页面筛选的数据
const dataListBySeach=ref([]);
//刷选数据
const getSearchByFile=(dataSource)=>{
    let obj=dataSource.find(x=>x.k_name.indexOf(k_info_name.value)>-1);
    if(obj){
        return true;
    }
    else{
        let children=dataSource.children;
        if(children && children.length>0){
            return getSearchByFile(children);
        }
        return false;
    }
}
//分页查询
const getListfileFunByPage=()=>{
    searchLoadingInit();
    const dataList=dataSource.value.filter(x=>x.k_desc.indexOf(k_info_name.value)>-1 ||  getSearchByFile(x.dataSource));
    let list =[];
    let start=(current1.value-1)*(pageSize.value);
    let end=(current1.value)*(pageSize.value);    
    end=end>dataList.length?dataList.length:end;    
    for(var i=start;i<end;i++){
        list.push(dataList[i]);
    }
    dataListBySeach.value=dataList;
    dataSourceByPage.value=list;
    searchLoadingInit();
}

const pageSize = ref(10);
const current1 = ref(1);
watch(pageSize, () => {
    getListfileFunByPage();
});
watch(current1, () => {
    getListfileFunByPage();
});



</script>
<style scoped>
 @import url('../css/file.less');
</style>