<template>
    <div class="file">
        <div class="file_top">
            <div class="title">
                <div class="m_b_10">
                    文件管理                    
                    <span style="margin-left:0px;color:rgb(98 0 204);">共有{{delete_bl?fileDataList_del.length+dataSource_del.length:fileDataList.length+dataSource.length}}文件</span>
                    <a-button class="m_l_10" v-if="!delete_bl && k_parent_id==0"
                    @click="openShare" type="primary">共享文件</a-button>
                </div>
            </div>  
            <div class="txt_right">
                    <a-button class="m_b_10 m_r_10" v-if="!delete_bl && k_parent_id>0"
                    @click="addFileMainInfoPL()" type="primary" danger><CloudUploadOutlined/>批量上传文件</a-button>
                    <a-button class="m_b_10 m_r_10" v-if="!delete_bl"
                    @click="addFileInfo()" type="primary"><FolderOpenOutlined/>创建文件夹</a-button>
                    <a-button class="m_b_10 m_r_10" v-if="!delete_bl && k_parent_id>0"
                    @click="addFileMainInfo()" type="primary"><CloudUploadOutlined/>上传单文件</a-button>
                    <a-button class="m_b_10" style="background-color:rgb(98 0 204);" v-if="!delete_bl"
                    @click="deleteQueryfile_All()" type="primary">回收站</a-button>
                    <a-button class="m_b_10" style="background-color:#c00;margin-right:10px;"
                    v-if="(fileDataList_del.length>0 || dataSource_del.length>0) && delete_bl"
                    @click="clearDeleteList()" type="primary">清空回收站</a-button>
                    <a-button class="m_b_10" style="background-color:rgb(98 0 204);" v-if="delete_bl"
                    @click="queryfile_All()" type="primary">返回</a-button>
            </div>
        </div>
        <div class="file_top">                      
            <div class="title">                
                <div class="filedaohang display_flex" v-if="!delete_bl&&file_obj_list.length>0">
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
                <div class="filedaohang display_flex">
                    <a-tag v-if="delete_bl" class="back_delete" color="red">回收站</a-tag>
                </div>
            </div>
            <div class="sousuo txt_right">               
                <a-input-search
                    v-if="!delete_bl"
                    v-model:value="k_name"
                    placeholder="请输入文件夹或文件名称搜索"
                    :loading="searchLoading"
                    allow-clear
                    enter-button
                    @search="onSearch"
                />
                <a-input-search
                    v-if="delete_bl"
                    v-model:value="k_name_del"
                    placeholder="请输入文件夹或文件名称搜索"
                    :loading="searchLoading"
                    allow-clear
                    enter-button
                    @search="onSearch"
                />
                
            </div>
        </div>
        <div class="file_main_info m_t_10" style="height: calc(100vh - 185px) !important;" v-if="!delete_bl">  
            <template v-if="_listFile.length>0">
                <div class="file_main" style="padding:0px;padding:0px 0px 10px;">
                    <a-card class="file_main_item" style="width: calc(20% - 20px) !important;" v-for="item in _listFile" :key="item.id" hoverable :bordered="false">
                        <div class="file_main_item_info">
                          <div class="display_flex">
                                <div class="title">
                                    {{item.k_name}}                                       
                                </div>
                                <div class="txt_right">
                                    <a-button type="link" class="p_0" @click="editorFun(item)">编辑</a-button>
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
                                <a-dropdown v-if="k_parent_id>0">
                                    <template #overlay>
                                        <a-menu>
                                        <a-menu-item key="1" @click="handleMenuClick(item,'1')">
                                            <ShareAltOutlined />
                                            共享文件夹
                                        </a-menu-item>
                                        <a-menu-item key="2" @click="handleMenuClick(item,'2')">
                                            <SubnodeOutlined />
                                            移动文件夹
                                        </a-menu-item>
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
                                <a-button @click="deleteFun(item,-1)">删除</a-button>                  
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
                    <TableIndex :columns="columns" :dataSource="dataSource" @columnClick="columnClick"/>
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
        <div class="file_main_info m_t_10" style="height: calc(100vh - 185px) !important;" v-if="delete_bl">            
            <div class="file_main" style="padding:0px 0px 10px;" v-if="_listFile_del.length>0">
                    <a-card class="file_main_item" style="width: calc(20% - 20px) !important;" v-for="item in _listFile_del" :key="item.id" hoverable :bordered="false">
                        <div class="file_main_item_info">
                          <div class="display_flex">
                                <div class="title">
                                    {{item.k_name}}
                                </div>
                                <div class="txt_right">
                                    <a-button type="link" class="p_0" @click="back_deleteFun(item)">恢复</a-button>
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
                                <span class="stop">已删除</span>
                            </div>
                            <a-space wrap>                                
                                <a-button @click="deleteFun(item,0)">彻底删除</a-button>                         
                            </a-space>
                          </div>                          
                        </div>                        
                    </a-card>             
                    <div class="w_100vw txt_right p_r_30">                    
                        <a-pagination
                                v-model:current="current1_del"
                                v-model:pageSize="pageSize_del"
                                show-size-changer
                                :total="fileDataList_del.length"
                        />  
                    </div> 
            </div>
            <template v-if="dataSource_del.length>0">
                <a-divider orientation="left" orientation-margin="0px">
                    <a-button type="link">文件列表</a-button>
                </a-divider>
                <div class="file_main_table" style="padding-top:0px;">
                    <TableIndex :columns="columns_del" :dataSource="dataSource_del" @columnClick="columnClick"/>
                </div>            
            </template>
            <template v-if="_listFile_del.length==0&&dataSource_del.length==0">
                <div class="no_file_main">
                        <div class="no_file_main_item">
                            <UngroupOutlined :style="{fontSize: '26px', color: '#999'}" />
                            <div>暂无数据</div>
                        </div>                        
                </div>                               
            </template>           
        </div>            
        <!--弹窗-->
        <a-modal v-model:open="modalOpen" :title="modalObj.title" :footer="null" :maskClosable="false" :width="modalObj.width">
            <div class="model_info" v-if="modalObj.type=='form'">
                <FormIndex v-model:formData="_file_class.file_info" :formItemList="_file_class.filemain" :formProps="formProps" @onSubmit="onSubmit" @closeModalFun="closeModalFun"/>
            </div>
            <div class="model_info" v-if="modalObj.type=='form_file_info'">
                <FormIndex v-model:formData="_file_class.file_info" :formItemList="_file_class.filemaininfo" :formProps="formProps" @onSubmit="onSubmit" @closeModalFun="closeModalFun"/>
            </div>
            <div class="model_info" v-if="modalObj.type=='form_file_info_pl'">
                <Fileuploadlist :formProps="formProps" :k_parent_id="k_parent_id" @pi_liang="pi_liang" @closeModalFun="closeModalFun"/>
            </div>
        </a-modal>
        <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel" :wrap-class-name="full_modal">
            <OfficePreview :fileInfo="fileInfo"/>
        </a-modal>
        <div class="fu_dong" v-if="!delete_bl">
                <a-float-button-group shape="circle" :style="{ right: '24px' }">                   
                    <a-float-button @click="addFileInfo()" v-if="k_parent_id>0" type="primary">
                        <template #tooltip>
                            <div>创建文件夹</div>
                        </template>
                        <template #icon>
                                <FolderOpenOutlined />
                        </template>
                    </a-float-button>    
                    <a-float-button @click="addFileMainInfo()" v-if="k_parent_id>0" type="primary">
                        <template #tooltip>
                            <div>上传单文件</div>
                        </template>
                        <template #icon>
                                <CloudUploadOutlined />
                        </template>
                    </a-float-button>                
                </a-float-button-group>
        </div>
        <a-modal :open="modal.visible" :title="modal.title" :footer="null" :maskClosable="false" @cancel="modalCancel">
            <a-spin :spinning="spinning">
                <div class="m_t_10">
                    <div class="c_999">文件夹所在路径：</div>
                    <div class="p_l_20"> {{ modalItem.k_mulu }}</div>  
                </div>
                <div class="m_t_10" v-if="modal.key!='1'">
                    <div class="c_999">请选择路径：</div>
                    <a-input v-model:value="file_value" placeholder="请输入文件夹名称关键字" :allowClear="true" />
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
                <div class="m_t_10 " v-else>
                    <a-divider />
                    <div>
                        <a-checkbox
                            v-model:checked="state.checkAll"
                            :indeterminate="state.indeterminate"
                            @change="onCheckAllChange"
                        >
                        全选
                    </a-checkbox>
                    </div>
                    <a-divider />
                    <a-checkbox-group v-model:value="state.checkedList" :options="state.fileList" />
                </div>
                <div class="m_t_10 txt_right">
                    <a-button type="primary" v-if="modal.key!='1'" :disabled="selectedKeys.length==0" @click="modalClick">确定</a-button>
                    <a-button type="primary" v-else @click="modalClick">确定</a-button>
                </div>
            </a-spin>            
        </a-modal>
        <a-modal :open="shareVisible" title="共享文件列表" :footer="null" @cancel="shareVisible=false" :wrap-class-name="full_modal_share">
            <ShareIndex ref="_shareIndex" :treeData="treeData" :allFileList="fileList" @queryfile_All="queryfile_All"/>
        </a-modal>
    </div>
</template>
<script lang="js" setup>
import { ref,reactive,createVNode,watch } from 'vue';
import { message,Modal } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { FileApi } from '/@/api/file/file-api';
import { fileApi } from '/@/api/support/file-api';
import { file_class_init } from "/@/api/file/file-api-class";
import FormIndex from '/@/components/form/index.vue';
import Fileuploadlist from '/@/components/fileuploadlist/index.vue';
import TableIndex from '/@/components/table/index.vue';
import {columns,columns_del}from './tableColumns'
import OfficePreview from "/@/components/officePreview/index.vue";
import ShareIndex from "./share_index.vue";
//定义变量
const color_value=ref(['pink','red','orange','green','cyan','blue','purple']);
const search_value=ref(false);
const k_name=ref('');
const k_name_del=ref('');
const searchLoading=ref(false);
const _listFile=ref([]);
const _listFile_del=ref([]);
const shareVisible=ref(false);
let dataSource=ref([]);
let dataSource_del=ref([])
const fileDataList=ref([]);
const fileDataList_del=ref([]);
//当前文件
const file_obj=ref({});
//所以文件的集合
const file_obj_list=ref([]);
//当前选中的数据
const modalItem=ref({});
const modal=ref({
    visible:false,
    title:'',
    key:'',
});
const expandedKeys = ref([]);
const selectedKeys = ref([]);
const selectListKeys=ref([]);
const treeData =ref([]);
const file_value = ref('');
const _shareIndex = ref();
watch(file_value, () => {
    if(file_value.value!=''){
        let listKeys=[];
        let keys=[];
        let list=fileList.value.filter(x=>x.k_name.indexOf(file_value.value)>-1 && x.k_type==0);
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
//设置展开的节点
const fileParent=(k_parent_id,listKeys)=>{
    if(listKeys.findIndex(x=>x==k_parent_id)<0){
        listKeys.push(k_parent_id);
        if(k_parent_id>0){
            var item=fileList.value.find(x=>x.id==k_parent_id);
            fileParent(item.k_parent_id,listKeys);
        }
    }    
}

const handleMenuClick = (item,key) => {
  file_value.value='';
  modalItem.value=item; 
  let lx_name=item.k_type==0?'夹':'';
  let title='';
  switch(key){
    case '1':
        queryShareFile();
        title=('共享文件'+lx_name+'：'+item.k_name);
        break;
    case '2':
        title=('移动文件'+lx_name+'：'+item.k_name);
        break;
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
  let keys=[];
  fileParent(item.k_parent_id,listKeys);
  keys.push(item.id);
  expandedKeys.value=listKeys;
  selectListKeys.value=keys;
  selectedKeys.value=[];
  arrayToTree(fileList.value.filter(x=>x.k_type==0));//设置自己文件和父节点文件不可选取
};

  const state = reactive({
    indeterminate: true,
    checkAll: false,
    checkedList: [],
    fileList:[],
    fileList_value:[],
  });
  const queryfile_Share=()=>{
    var list=[];  
        var _fileList_value= fileList.value.filter(x=>x.k_parent_id==0);       
        for(var i=0;i<_fileList_value.length;i++){
                var item=_fileList_value[i];
                list.push({
                  label:item.k_name,
                  value:item.id.toString(),
                })
                state.fileList_value.push(item.id.toString());
        }
        state.fileList=list;
  }
  const fileShareForm=ref({
    id:'',
    k_file_info_ids:'',
    k_file_id:'',
  });
  const queryShareFile=()=>{
    let id=modalItem.value.id;
    fileShareForm.value={
        id:'',
        k_file_info_ids:'',
        k_file_id:id,
    };
    Object.assign(state, {
        checkedList: [],
    });
    fileShareForm.value.k_file_id=id;
    FileApi.queryShareFile(id).then((res)=>{
        if(res.code==0){
          if(res.data.length>0){
            let obj=res.data[0];
            fileShareForm.value=obj;
            Object.assign(state, {
              checkedList: obj.k_file_info_ids.split(','),
            });
          }
        }
    }).catch((ex)=>{
    });
  }  
  const onCheckAllChange = e => {
    Object.assign(state, {
      checkedList: e.target.checked ? state.fileList_value : [],
      indeterminate: false,
    });
  };
  watch(
    () => state.checkedList,
    val => {
      state.indeterminate = !!val.length && val.length < state.fileList_value.length;
      state.checkAll = val.length === state.fileList_value.length;
    },
  );
  //保存数据
  const saveShareFile=()=>{
    var k_file_info_ids=state.checkedList.toString();
    var k_file_id=modalItem.value.id;
    fileShareForm.value.k_file_info_ids=k_file_info_ids;
    fileShareForm.value.k_file_id=k_file_id;
    FileApi.addFileShareFile(fileShareForm.value).then((res)=>{
        if(res.code==0){
          message.success('操作成功！');
          modalCancel();
        }
    }).catch((ex)=>{
            
    });
  }
  //取消分享
  const saveShareFile_QX=()=>{
    FileApi.delFileShareFile(fileShareForm.value.id).then((res)=>{
        if(res.code==0){
          message.success('操作成功！');
          modalCancel();
        }
    }).catch((ex)=>{
            
    });
  };


const modalClick=()=>{
    if(modal.value.key=='1'){
        //分享文件夹/文件：
        if(state.checkedList.length>0){
            saveShareFile();
        }
        else{
            //取消分享文件
            saveShareFile_QX();
        }
        
    }
    else{
        if(selectedKeys.value.length>0){        
            switch(modal.value.key){
                case '2':
                    //移动文件夹/文件：
                    yi_dong();
                break;
                case '3':
                    //复制文件夹/文件：
                    yi_fuzhi();
                break;
            }
        }
    }
    
}

const yi_dong=()=>{
    let item=modalItem.value;
    let lx_name=item.k_type==0?'夹':'';
    let k_parent_id=selectedKeys.value[0];
    let obj=fileList.value.find(x=>x.id==k_parent_id);
    if(obj){
        Modal.confirm({
            title: '移动文件'+lx_name+'提示',
            icon: createVNode(QuestionCircleOutlined),
            content: '是否要将文件'+lx_name+':【'+item.k_name+'】移动到文件夹：【'+obj.k_name+'】下么？',
            okText: '确认',
            cancelText: '取消',
            onOk() {   
                spinning.value=true;     
                item.k_parent_id=k_parent_id;
                _file_class.init_class_data(_file_class.file_info,item);    
                onSubmit();
            },
            onCancel() {},
        });
    }
    else{
        message.error('未能找到要移动到的文件夹！');
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
    let obj=fileList.value.find(x=>x.id==k_parent_id);
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
                        closeModalFun();
                        queryfile_All();                           
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

//打开分享文件
const openShare=()=>{
    shareVisible.value=true;
    if(_shareIndex.value){
        _shareIndex.value.queryfile_All();
    }
    
}
const modalCancel=()=>{
    modal.value={
        visible:false,
        title:'',
    } 
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
    searchLoadingInit();
    if(!delete_bl.value){        
        queryfile();        
    }
    else{
        deleteQueryfile();
    }
    searchLoadingInit();
};
//恢复文件夹
const back_deleteFun=(item,fileLx)=>{
    if(!fileLx){
        fileLx='夹';
    }  
    else{
        fileLx='';
    }
    Modal.confirm({
        title: '恢复提示',
        icon: createVNode(QuestionCircleOutlined),
        content: '是否要恢复已删除文件'+fileLx+':【'+item.k_name+'】？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
            FileApi.backdelete(item.id).then((res)=>{
                if(res.code==0){
                    message.success('操作成功！');
                    deleteQueryfile_All();                      
                }        
            }).catch((ex)=>{
                 
            });
        },
        onCancel() {},
    });
}
//删除文件夹
const deleteFun=(item,status,fileLx)=>{ 
    let nr=''; 
    if(item.k_file_num>0){
        nr='该文件夹内 存在其他文件内容，';
    }
    if(!fileLx){
        fileLx='夹';
    }  
    else{
        fileLx='';
    }
    let msg='是否要删除文件'+fileLx+':【'+item.k_name+'】？'+nr+'删除后将移至回收站！';
    if(status==0){
        msg='是否要彻底删除文件'+fileLx+':【'+item.k_name+'】？'+nr+'删除后将无法恢复！';
    }
    Modal.confirm({
        title: '删除提示',
        icon: createVNode(QuestionCircleOutlined),
        content: msg,
        okText: '确认',
        cancelText: '取消',
        onOk() {
            if(status==0){
                FileApi.deepdelete(item.id).then((res)=>{
                    if(res.code==0){
                        message.success('操作成功！');
                        deleteQueryfile_All();                      
                    }        
                }).catch((ex)=>{
                         
                });
            }
            else{
                FileApi.delfile(item.id).then((res)=>{
                    if(res.code==0){
                        message.success('操作成功！');
                        queryfile_All();                      
                    }        
                }).catch((ex)=>{  
                });
            }
            
        },
        onCancel() {},
    });
}
//清空回收站
const clearDeleteList=()=>{
    Modal.confirm({
        title: '清空回收站提示',
        icon: createVNode(QuestionCircleOutlined),
        content: '是否清空回收站，清空后无法恢复！',
        okText: '确认',
        cancelText: '取消',
        onOk() {
            FileApi.clearDeleteList().then((res)=>{
                if(res.code==0){
                    message.success('操作成功！');
                    deleteQueryfile_All();                      
                }        
            }).catch((ex)=>{
                         
            });
            
        },
        onCancel() {},
    });
}
const k_parent_id=ref(0);
//新增文件夹
const addFileInfo=()=>{    
    let item={
        id:'',
        k_name:'',
        k_desc:'',
        k_sort:0,
        k_status:1, 
        k_parent_id:k_parent_id.value,
        k_fileid:0,
        k_type:0,  
        k_lx:0,  
        k_bianhao:'',
        k_weizhi:'',
        k_biaoqian:'',   
    };
    _file_class.init_class_data(_file_class.file_info,item);
    openModalFun({title:'新建文件夹',type:'form'});
}
//编辑文件夹
const editorFun=(item)=>{
    _file_class.init_class_data(_file_class.file_info,item);
    openModalFun({title:'编辑文件夹',type:'form'});
}

const columnClick=(item,lx)=>{
    switch(lx){
        case '1':
            _file_class.init_class_data(_file_class.file_info,item);
            openModalFun({title:'编辑文件',type:'form_file_info'});
            break;//编辑
        case '-1': 
            deleteFun(item,-1,'1');
            break;//删除
        case '2':
            back_deleteFun(item,'1')
            break;//恢复
        case '-2': 
            deleteFun(item,0,'1');
            break;//彻底删除
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
        case '5':
            handleMenuClick(item,'1')
            break;//分享
        case '6':
            handleMenuClick(item,'2')
            break;//移动
        case '7':
            handleMenuClick(item,'3')
            break;//复制
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
const full_modal_share=ref('file_view-modal_share');
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
//上传单文件
const addFileMainInfo=()=>{    
    let item={
        id:'',
        k_name:'',
        k_desc:'',
        k_sort:0,
        k_status:1,  
        k_parent_id:k_parent_id.value,
        k_lx:1,
        show_fileids:'',
        k_type:1,      
    };
    _file_class.init_class_data(_file_class.file_info,item);
    openModalFun({title:'上传单文件',type:'form_file_info'});
}
//批量上传单文件
const addFileMainInfoPL=()=>{    
    let item={
        id:'',
        k_name:'',
        k_desc:'',
        k_sort:0,
        k_status:1,  
        k_parent_id:k_parent_id.value,
        k_lx:1,
        show_fileids:'',
        k_type:1,      
    };
    _file_class.init_class_data(_file_class.file_info,item);
    openModalFun({title:'批量上传文件',type:'form_file_info_pl',width:'60%'});
}

//查看文件夹
const viewFun=(item)=>{
    k_current1.value[k_parent_id.value]=current1.value;//保存当前点击的分页码
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
        current1.value=k_current1.value[id];            
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
        if(id==0){
            current1.value=k_current1.value[id];
        }
        file_obj.value={};
        file_obj_list.value=[];
        k_parent_id.value=0;
    }    
    queryfile();
}

//打开弹窗
const openModalFun=(obj)=>{
    modalObj.value=obj;
    modalOpen.value=true;
}
//关闭弹窗
const closeModalFun=()=>{
    modalOpen.value=false;
    modalCancel();
}
//表单提交
const onSubmit=()=>{    
    FileApi.addFileInfo(_file_class).then((res)=>{
        if(res.code==0){
            message.success('操作成功！');
            spinning.value=false;   
            closeModalFun();            
            queryfile_All();                      
        }        
    }).catch((ex)=>{
         
    });
}
//批量上传回调
const pi_liang=()=>{
    closeModalFun();
    queryfile_All();    
}

const k_current1=ref({})
//查询文件夹
const queryfile=()=>{    
    delete_bl.value=false;
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
//查询全部文件
const fileList=ref([]);
const queryfile_All=()=>{
    FileApi.queryfile(-1).then((res)=>{
        if(res.code==0){
            var list=res.data;                  
            for(var i=0;i<list.length;i++){
                 var item=list[i];
                 var k_mulu= set_file_obj_list_by_k_name(item,list,[]);
                 list[i].k_mulu=k_mulu.join('/');
            }
            fileList.value=list;
            arrayToTree(list.filter(x=>x.k_type==0));
            queryfile();
            queryfile_Share();
        }
    }).catch((ex)=>{
            
    });
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

// 获取从节点到根节点的路径   
const set_file_obj_list_by_k_name=(item,list,_value)=>{    
    let parent_value=list.find(x=>x.id==item.k_parent_id);
    if(parent_value){        
        set_file_obj_list_by_k_name(parent_value,list,_value);
        _value.push(parent_value.k_name);   
    }              
    return _value;
}
const delete_bl=ref(false);

const delete_List=ref([]);
//查询回收站的文件夹
const deleteQueryfile=()=>{
    let data=[];
    if(k_name_del.value!=''){
        data=delete_List.value.filter(x=>is_children_del(x)&&(x.k_name.indexOf(k_name_del.value)>-1 || x.k_desc.indexOf(k_name_del.value)>-1))
    }
    else{
        data=delete_List.value;           
    }        
    fileDataList_del.value=data.filter(x=>x.k_type==0);
    dataSource_del.value=data.filter(x=>x.k_type==1);
    getListFileFunByPage_del();
}
const is_children_del=(item)=>{
    if(item.k_parent_id==k_parent_id.value){
        return true;
    }
    else{
        item=delete_List.value.find(x=>x.id==item.k_parent_id);
        if(is_children(item)){
            return true;
        }
    }
    return false;
}
const deleteQueryfile_All=()=>{
    delete_bl.value=true;
    FileApi.deleteQueryfile().then((res)=>{
        if(res.code==0){
            delete_List.value=res.data;
            deleteQueryfile();
        }        
    }).catch((ex)=>{
             
    });   
}

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
//回收站
const getListFileFunByPage_del=()=>{    
    let list =[];
    let start=(current1_del.value-1)*(pageSize_del.value);
    let end=(current1_del.value)*(pageSize_del.value);
    end=end>fileDataList_del.value.length?fileDataList_del.value.length:end;    
    for(let i=start;i<end;i++){
        list.push(fileDataList_del.value[i]);
    }
    if(list.length==0 && current1_del.value>1){
        current1_del.value--;
    }
    _listFile_del.value= list;
}

const pageSize = ref(10);
const current1 = ref(1);
const pageSize_del = ref(10);
const current1_del = ref(1);
watch(pageSize, () => {
    getListFileFunByPage();
});
watch(current1, () => {
    getListFileFunByPage();
});
watch(pageSize_del, () => {
    getListFileFunByPage_del();
});
watch(current1_del, () => {
    getListFileFunByPage_del();
});
queryfile_All();

</script>
<style scoped>
 @import url('../css/file.less');
</style>