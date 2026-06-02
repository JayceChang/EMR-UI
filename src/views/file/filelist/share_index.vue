<template>
    <div class="file">
        <div class="file_top">
            <div class="title">
                <div class="m_b_10">              
                    <span style="margin-left:0px;color:rgb(98 0 204);">共有{{fileDataList.length+dataSource.length}}文件</span>
                </div>
            </div>  
            <div class="sousuo txt_right">               
                <a-input-search
                    v-model:value="k_name"
                    placeholder="请输入文件夹或文件名称搜索"
                    :loading="searchLoading"
                    allow-clear
                    enter-button
                    @search="onSearch"
                />
            </div>
        </div>
        <div class="file_top">                      
            <div class="title">                
                <div class="filedaohang display_flex" v-if="file_obj_list.length>0">
                    <template v-for="(item,i) in file_obj_list" :key="item.id">
                        <div class="filedaohang_item c_999">
                            <RightOutlined v-if="i>0" />
                        </div>
                        <div class="filedaohang_item c_999" style="line-height: 27px;font-size: 14px;">
                            <span @click="file_obj_list_pre(item.id)" v-if="i<file_obj_list.length-1" class="filedaohang_item_span">{{item.k_name}}  </span>     
                            <span class="c_323232" v-else>{{item.k_name}}  </span>           
                        </div> 
                    </template>
                    <div class="filedaohang_item c_999">
                        <a-divider type="vertical" /> 
                    </div>
                    <div class="filedaohang_item c_999">
                        <a javascript="void(0)" @click="file_obj_list_pre(file_obj.k_parent_id)"><StepBackwardOutlined />上级目录 </a>      
                    </div>
                    <div class="filedaohang_item c_999">
                        <a-divider type="vertical" />
                    </div>
                    <div class="filedaohang_item c_999">
                        <a javascript="void(0)" @click="file_obj_list_pre(-1)"><FastBackwardOutlined />根目录 </a>      
                    </div>     
                </div>
            </div>            
        </div>
        <div class="file_main_info m_t_10" style="height: calc(100vh - 105px) !important;">  
            <template v-if="_listFile.length>0">
                <div class="file_main" style="padding:0px;padding:0px 0px 10px;">
                    <a-card class="file_main_item" style="width: calc(20% - 20px) !important;" v-for="item in _listFile" :key="item.id" hoverable :bordered="false">
                        <div class="file_main_item_info">
                          <div class="display_flex">
                                <div class="title">
                                    {{item.k_name}}                                       
                                </div>
                                <div class="txt_right">
                                    <div class="c_999 m_t_5 ">
                                            <div class="userName">
                                                {{item.k_update_user}}
                                            </div>                                           
                                    </div>
                                </div>
                          </div>                          
                          <div class="display_flex c_323232 l_h_20 m_t_10">
                                <div class="flex">文件数：{{item.k_file_num}}</div>                                
                                <div class="c_999 txt_right">
                                    {{item.k_update_time}}
                                </div>
                          </div>
                          <div class="c_323232 l_h_20 m_t_10">
                               编号：<span class="c_323232">{{item.k_bianhao}}</span>
                          </div>
                          <div class="c_323232 l_h_20 m_t_10">
                               位置：<span class="c_323232">{{item.k_weizhi}}</span>
                          </div>
                          <div class="c_323232 l_h_20 m_t_10" v-if="item.k_biaoqian">
                            标签：<template v-for="(_value,idx) in item.k_biaoqian.split(',')" :key="idx">
                                    <a-tag :color="color_value[idx%7]">{{_value}}</a-tag>
                                </template>
                          </div>
                          <template v-if="item.k_mulu">
                            <div class="c_323232 l_h_20 m_t_10">
                               目录：<span class="c_999">{{item.k_mulu}}</span>
                            </div>
                          </template>
                          <div class="desc c_323232 l_h_20 m_t_10 m_b_20">
                            描述：<template v-if="item.k_desc">{{item.k_desc}}</template><span v-else class="c_999">无</span>
                          </div>
                          <div class="foot">
                            <div class="state">
                                <span v-if="item.k_status=='1'">已启用</span>
                                <span v-if="item.k_status=='-1'" class="stop">已停用</span>
                            </div>
                            <a-space wrap>
                                <a-dropdown>
                                    <template #overlay>
                                        <a-menu>
                                            <a-menu-item key="3" @click="handleMenuClick(item,'3')">
                                                <SisternodeOutlined />
                                                复制文件夹
                                            </a-menu-item>
                                        </a-menu>
                                    </template>
                                    <a class="c_323232" @click.prevent>
                                        更多
                                        <DownOutlined />
                                    </a>
                                </a-dropdown>
                                <a-button type="primary" @click="viewFun(item)">查看</a-button>          
                            </a-space>
                          </div>                          
                        </div>                        
                    </a-card>             
                    <div class="w_100vw txt_right p_r_30">                    
                        <a-pagination
                                v-model:current="current1"
                                v-model:pageSize="pageSize"
                                show-size-changer
                                :total="fileDataList.length"
                        />  
                    </div> 
                </div>
            </template>         
            <template v-if="dataSource.length>0">
                <a-divider orientation="left" orientation-margin="0px">
                    <a-button type="link">目录列表</a-button>
                </a-divider>
                <div class="file_main_table" style="padding-top:0px;">
                    <TableIndex :columns="columns_share" :dataSource="dataSource" @columnClick="columnClick"/>
                </div>      
            </template> 
            <template v-if="_listFile.length==0&&dataSource.length==0">
                <div class="no_file_main">
                    <div class="no_file_main_item">
                        <UngroupOutlined :style="{fontSize: '26px', color: '#999'}" />
                        <div>暂无数据</div>
                    </div>                        
                </div>                               
            </template>                            
        </div>  
        <a-modal :open="modal.visible" :title="modal.title" :footer="null" :maskClosable="false" @cancel="modalCancel">
            <div class="m_t_10">
                <div class="c_999">文件夹所在路径：</div>
                <div class="p_l_20"> {{ modalItem.k_mulu }}</div>  
            </div>
            <div class="m_t_10" v-if="modal.key!='1'">
                <div class="c_999">请选择路径：</div>
                <a-input v-model:value="file_value" placeholder="请输入文件夹名称关键字" :allowClear="true"  />
                <a-directory-tree
                    v-model:expandedKeys="expandedKeys"
                    v-model:selectedKeys="selectedKeys"
                    :tree-data="treeData"
                >
                    <template #title="{ title, key }">
                        <span v-if="selectListKeys.filter(x=>x==key).length>0 && selectedKeys.filter(x=>x==key).length==0" style="color: #1890ff">{{ title }}</span>
                        <template v-else>{{ title }}</template>
                    </template>
                </a-directory-tree>
            </div>
            <div class="m_t_10 txt_right">
                <a-button type="primary" :disabled="selectedKeys.length==0" @click="modalClick">确定</a-button>
            </div>
        </a-modal> 
        <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel" :wrap-class-name="full_modal">
            <OfficePreview :fileInfo="fileInfo"/>
        </a-modal>
    </div>
</template>
<script setup>
import { ref,reactive,createVNode,watch,watchEffect } from 'vue';
import { message,Modal } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { FileApi } from '/@/api/file/file-api';
import { fileApi } from '/@/api/support/file-api';
import { file_class_init } from "/@/api/file/file-api-class";
import {columns_share}from './tableColumns'
import OfficePreview from "/@/components/officePreview/index.vue";
import TableIndex from '/@/components/table/index.vue';
// 声明可触发的事件
const emit = defineEmits(['queryfile_All']);
const props = defineProps({ 
    allFileList:Object,
})
//定义变量
const color_value=ref(['pink','red','orange','green','cyan','blue','purple']);
const fileDataList=ref([]);
const dataSource=ref([]);
const search_value=ref(false);
const searchLoading=ref(false);
const k_name=ref('');
//查询全部文件
const fileList=ref([]);
//当前文件
const file_obj=ref({});
//所以文件的集合
const file_obj_list=ref([]);
const _listFile=ref([]);
const pageSize = ref(10);
const current1 = ref(1);
const k_parent_id=ref(0);
const treeData =ref([]);
const file_value = ref('');
const expandedKeys = ref([]);
const selectedKeys = ref([]);
const selectListKeys=ref([]);
const modalItem=ref({});
const modal=ref({
    visible:false,
    title:'',
    key:'',
});
// 创建响应式类实例
const _file_class = reactive(file_class_init('file'));
const modalClick=()=>{
    if(selectedKeys.value.length>0){        
        switch(modal.value.key){
            case '3':
                //复制文件夹/文件：
                yi_fuzhi();
            break;               
        }
    }
    
}
const file_fuzhi_num=ref(0);
const file_fuzhi_num_end=ref(0);
const file_fuzhi_erro=ref([]);
const spinning=ref(false);
const yi_fuzhi=()=>{
    let item=modalItem.value;
    let lx_name=item.k_type==0?'夹':'';
    let k_parent_id=selectedKeys.value[0];
    let obj=props.allFileList.find(x=>x.id==k_parent_id);
    if(obj){
        Modal.confirm({
            title: '复制文件'+lx_name+'提示',
            icon: createVNode(QuestionCircleOutlined),
            content: '是否要将文件'+lx_name+':【'+item.k_name+'】复制备份到文件夹：【'+obj.k_name+'】下么？',
            okText: '确认',
            cancelText: '取消',
            onOk() {  
                file_fuzhi_num.value=0;
                file_fuzhi_num_end.value=0;
                file_fuzhi_erro.value=[];
                spinning.value=true;
                //执行复制
                fu_zhiFun(item,k_parent_id);   

                var timer_file_fuzhi=setInterval(() => {                    
                    if(file_fuzhi_num.value==file_fuzhi_num_end.value){
                        clearInterval(timer_file_fuzhi);
                        if(file_fuzhi_erro.value.length>0){
                            let _msg='';
                            file_fuzhi_erro.value.forEach((element,idx) => {
                                _msg+=""+(idx+1)+"、[名称："+element.k_name+"，目录："+element.k_mulu+"]，";
                            });
                            Modal.error({
                                title: '部分复制操作成功！',
                                content: _msg,
                            });
                        }
                        else{
                            message.success('复制操作成功！');
                        }                        
                        spinning.value=false; 
                        emit('queryfile_All');
                        modalCancel();                                     
                    }
                }, 1000);
            },
            onCancel() {},
        });
    }
    else{
        message.error('未能找到要复制备份到的文件夹！');
    }    
}
//执行复制
const fu_zhiFun=(item,k_parent_id)=>{
    let node={...item};
    node.id='';  
    node.k_fuzhi=1; 
    node.k_fuzhi_id=item.id; 
    node.k_parent_id=k_parent_id;
    //console.log('node',node);
    const _file_class_obj = file_class_init(item.id);
    _file_class.init_class_data(_file_class_obj.file_info,node); 
    file_fuzhi_num.value++; //需要执行的数量    
    FileApi.addFileInfo(_file_class_obj).then((res)=>{
        if(res.code==0){
            file_fuzhi_num_end.value++;//已执行的数量    
            var pid=res.data;
            fu_zhiFun_child(item,pid);    
        }        
    }).catch((ex)=>{
        file_fuzhi_erro.value.push(item);
        file_fuzhi_num_end.value++;//已执行的数量       
    });               
}

//查询下面的子节点数据
const fu_zhiFun_child=(item,pid)=>{
    //console.log('item',item);
    var items=fileList.value.filter(x=>x.k_parent_id==item.id);
    //console.log('items',items);
    if(items.length>0){
        for(var i=0;i<items.length;i++){
            fu_zhiFun(items[i],pid);
        }
    }             
}

//找到文件对应的数据
/**
 * 查找指定ID节点及其所有子节点
 * @param {Array} tree 树形数据
 * @param {string|number} targetId 要查找的节点ID
 * @returns {Array} 包含目标节点及其所有子节点的数组
 */
 function findNodeAndChildren(tree, targetId) {
    const result = [];
    
    function traverse(nodes) {
        for (const node of nodes) {
            if (node.key === targetId) {
                result.push(node);
                break;
            }
            if (node.children && node.children.length) {
                traverse(node.children);
            }
        }
    }
    traverse(tree);
    return result;
}
const modalCancel=()=>{
    modal.value={
        visible:false,
        title:'',
    }
}

watch(pageSize, () => {
    getListFileFunByPage();
});
watch(current1, () => {
    getListFileFunByPage();
});
const onSearch = (searchValue) => {
    searchLoading.value=!searchLoading.value;
    queryfile();
    searchLoading.value=!searchLoading.value;
};
//分页查询
const getListFileFunByPage=()=>{
    let list =[];
    let start=(current1.value-1)*(pageSize.value);
    let end=(current1.value)*(pageSize.value);
    end=end>fileDataList.value.length?fileDataList.value.length:end;    
    for(let i=start;i<end;i++){
        list.push(fileDataList.value[i]);
    }
    _listFile.value= list;
}
//查看文件夹
const viewFun=(item)=>{
    file_obj.value=item;//当前所选的文件夹
    file_obj_list.value=set_file_obj_list(item,[]);//[];    
    k_parent_id.value=item.id;
    current1.value=1;
    k_name.value='';
    queryfile();
}
const set_file_obj_list=(item,list)=>{    
    if(item.k_parent_id>0){
        let parent_value=fileList.value.find(x=>x.id==item.k_parent_id);
        set_file_obj_list(parent_value,list);
    }
    list.push(item); 
    return list;
}
const file_obj_list_pre=(id)=>{    
    if(id>0){      
        k_parent_id.value=id;
        let list=[];
        for(var i=0;i<file_obj_list.value.length;i++){
            var element=file_obj_list.value[i];
            list.push(element);
            if(element.id==id){
                file_obj.value=element;//当前所选的文件夹
                break;                
            }
        }      
        file_obj_list.value=list;        
    }
    else{
        file_obj.value={};
        file_obj_list.value=[];
        k_parent_id.value=0;
    }    
    queryfile();
}
//查询文件夹
const queryfile=()=>{    
    let data=[];
    if(k_name.value!=''){
        search_value.value=true;
        data=fileList.value.filter(x=>is_children(x)&&(x.k_name.indexOf(k_name.value)>-1 || x.k_desc.indexOf(k_name.value)>-1));
    }
    else{
        search_value.value=false;
        data= fileList.value.filter(x=>x.k_parent_id==k_parent_id.value);
    }    
    fileDataList.value=data.filter(x=>x.k_type==0);
    dataSource.value=data.filter(x=>x.k_type==1);  
    //console.log('dataSource.value',dataSource.value);          
    getListFileFunByPage();
}
const is_children=(item)=>{    
    if(item.k_parent_id==k_parent_id.value){
        return true;
    }
    else if(item.k_parent_id>0){
        item=fileList.value.find(x=>x.id==item.k_parent_id);
        if(item){
            if(is_children(item)){
                return true;
            }
        }        
    }
    return false;
}

const queryfile_All=()=>{
    arrayToTree(props.allFileList.filter(x=>x.k_type==0));
    FileApi.queryShareFile(-1).then((res)=>{
        if(res.code==0){
            var list=res.data;                  
            for(var i=0;i<list.length;i++){
                 var item=list[i];
                 var k_mulu= set_file_obj_list_by_k_name(item,list,[]);
                 var k_mulu_value=k_mulu.join('/');
                 if(k_mulu_value==''){
                    list[i].k_parent_id=0;
                 }
                 list[i].k_mulu=k_mulu_value;
            }
            fileList.value=list;
            queryfile();
        }
    }).catch((ex)=>{
            
    });
}
// 获取从节点到根节点的路径   
const set_file_obj_list_by_k_name=(item,list,_value)=>{    
    let parent_value=list.find(x=>x.id==item.k_parent_id);
    if(parent_value){        
        set_file_obj_list_by_k_name(parent_value,list,_value);
        _value.push(parent_value.k_name);   
    }              
    return _value;
}

const handleMenuClick = (item,key) => {
  file_value.value='';
  modalItem.value=item; 
  let lx_name=item.k_type==0?'夹':'';
  let title='';
  switch(key){
    case '3':
        title=('复制文件'+lx_name+'：'+item.k_name);
        break;
  }  
  modal.value={
    visible:true,
    title:title,
    key:key
  };
  let listKeys=[];
  let keys=[]
  let now_item=props.allFileList.find(x=>x.id==item.id);
  fileParent(now_item.k_parent_id,listKeys);
  keys.push(item.id);
  expandedKeys.value=listKeys;
  selectListKeys.value=keys;
  selectedKeys.value=[];
  arrayToTree(props.allFileList.filter(x=>x.k_type==0));//设置自己文件和父节点文件不可选取
};

//设置展开的节点
const fileParent=(k_parent_id,listKeys)=>{
    if(listKeys.findIndex(x=>x==k_parent_id)<0){
        listKeys.push(k_parent_id);
        if(k_parent_id>0){
            var item=props.allFileList.find(x=>x.id==k_parent_id);
            fileParent(item.k_parent_id,listKeys);
        }
    }    
}

const treeParent=(items,item,id,parentId)=>{
    if(item[parentId]==modalItem.value.id){
        return true;
    }
    else{
        var obj=items.find(x=>x[id]==item[parentId]);
        if(obj){
            return treeParent(items,obj,id,parentId);
        }
        else{
            return false;
        }
    }
}
//树型结构数据
const fieldNames = {title:'k_name', key:'id' };
function arrayToTree1(items, id = 'id', parentId = 'k_parent_id', children = 'children') {
    const result = []; // 存放结果集
    const itemMap = {}; // 哈希表
    
    // 先转成哈希存储
    for (const item of items) {
        var obj={
            title:item[fieldNames.title],
            key:item[fieldNames.key],
            disabled: (item.id==modalItem.value.id || item.id==modalItem.value.k_parent_id || treeParent(items,item,id,parentId)),
        }
        itemMap[item[id]] = {...obj, [children]: []};
    }
    
    // 构建树
    for (const item of items) {
        const idVal = item[id];
        const parentIdVal = item[parentId];
        const treeItem = itemMap[idVal];
        
        if (parentIdVal === 0 || !parentIdVal) {
            result.push(treeItem);
        } else {
            if (!itemMap[parentIdVal]) {
                continue;
            }
            itemMap[parentIdVal][children].push(treeItem);
        }
    }
    return result;
}

function arrayToTree(arr, rootId = 0) {
  let tree=arrayToTree1(arr);
  treeData.value= tree;
}

watch(file_value, () => {
    if(file_value.value!=''){
        let listKeys=[];
        let keys=[];
        let list=props.allFileList.filter(x=>x.k_name.indexOf(file_value.value)>-1 && x.k_type==0);
        list.forEach(element => {
            fileParent(element.k_parent_id,listKeys);
            keys.push(element.id);
        });
        expandedKeys.value=listKeys;
        selectListKeys.value=keys;
    }
    else{
        expandedKeys.value=[];
        selectListKeys.value=[];
    }
});

const columnClick=(item,lx)=>{
    switch(lx){
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
        case '7':
            handleMenuClick(item,'3')
            break;//复制
    }
}
const handleDown=async file =>{
    fileApi.downLoadByFileName(file.fileKey,file.name);
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
queryfile_All();
defineExpose({
    queryfile_All,
});
</script>

<style scoped>
 @import url('../css/file.less');
</style>