<template>
    <div class="file">
        <div class="file_top">
            <div class="title">库房/库位管理</div>
            <div class="sousuo">
                <a-input-search
                    v-model:value="k_name"
                    placeholder="请输入库房名称搜索"
                    :loading="searchLoading"
                    allow-clear
                    enter-button
                    @search="onSearch"
                />
            </div>
        </div>
        <div class="file_main_info m_t_10">
            <div class="file_main">
                    <a-card class="file_main_item" hoverable :bordered="false" @click="addKuFang()">
                        <div class="file_main_item_one -hover">
                            <PlusOutlined/>
                            <div>新建库房</div>
                        </div>                        
                    </a-card>
                    <a-card class="file_main_item" v-for="item in _listKufang" :key="item.id" hoverable :bordered="false">
                        <div class="file_main_item_info">
                          <div class="display_flex">
                                <div class="title">
                                    {{item.k_name}}
                                </div>
                                <div class="txt_right">
                                    <a-button type="link" class="p_0" @click="editorFun(item)">编辑</a-button>
                                </div>
                          </div>
                          <div class="display_flex c_999 m_t_5">
                                <div class="userName">
                                    {{item.k_update_user}}
                                </div>
                                <div>
                                    {{item.k_update_time}}
                                </div>
                          </div>
                          <div class="c_323232 l_h_20 m_t_10">
                                已创建库位数：{{item.k_kuwei_num}}
                          </div>
                          <div class="desc c_323232 l_h_20 m_t_10">
                            {{item.k_desc}}
                          </div>
                          <div class="foot">
                            <div class="state">
                                <span v-if="item.k_status=='1'">已启用</span>
                                <span v-if="item.k_status=='-1'" class="stop">已停用</span>
                            </div>
                            <a-space wrap>
                                <a-button type="primary" @click="viewFun(item)">查看</a-button>
                                <a-button @click="deleteFun(item)">删除</a-button>
                            </a-space>
                          </div>                          
                        </div>                        
                    </a-card>    
                    <a-card class="file_main_item" hoverable :bordered="false" v-if="_listKufang.length==0">
                        <div class="file_main_item_one">
                            <UngroupOutlined />
                            <div>暂无相关库房</div>
                        </div>                        
                    </a-card>            
                    <div style="width:100vw;text-align: right;">                    
                        <a-pagination
                                v-model:current="current1"
                                v-model:pageSize="pageSize"
                                show-size-changer
                                :total="_listKufang.length"
                        />  
                    </div>   
            </div>        
        </div>
        
        <!--弹窗-->
        <a-modal v-model:open="modalOpen" :title="modalObj.title" :footer="null" :maskClosable="false" :width="modalObj.width">
            <div class="model_info" v-if="modalObj.type=='form'">
                <FormIndex v-model:formData="_file_class.file_kufang" :formItemList="_file_class.kufang" :formProps="formProps" @onSubmit="onSubmit" @closeModalFun="closeModalFun"/>
            </div>
            <div class="model_info" v-if="modalObj.type=='table'">                
                <TableIndex :dataProps="_file_class.file_kufang" @query="queryKufang"/>
            </div>
        </a-modal>

    </div>
</template>
<script lang="js" setup>
import { ref,reactive,createVNode,watch } from 'vue';
import { message,Modal } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { FileApi } from '/@/api/file/file-api';
import { file_class_init } from "/@/api/file/file-api-class";
import FormIndex from '/@/components/form/index.vue';
import TableIndex from '../kuwei/index.vue';
//定义变量
const k_name=ref('');
const searchLoading=ref(false);
const _listKufang=ref([]);
let kuFangData=ref([]);

const modalOpen = ref(false);
const modalObj= ref({});
const formProps=ref({isModal:true,isView:false});
// 创建响应式类实例
const _file_class = reactive(file_class_init('kuFang'));
//定义方法
const searchLoadingInit=()=>{
    searchLoading.value=!searchLoading.value;
}
const onSearch = (searchValue) => {
    searchLoadingInit();
    current1.value=1;
    getListKufangFunByPage();
    searchLoadingInit();
};
//删除库房
const deleteFun=(item)=>{
    if(item.k_kuwei_num>0){
        Modal.warning({
            title: '删除提示',
            content: '库存中已创建库位，请先清空库位后进行删除！',
        });
        return;
    }
    Modal.confirm({
        title: '删除提示',
        icon: createVNode(QuestionCircleOutlined),
        content: '是否要删除库房:【'+item.k_name+'】？删除后将无法恢复！',
        okText: '确认',
        cancelText: '取消',
        onOk() {
            FileApi.delKufang(item.id).then((res)=>{
                if(res.code==0){
                    message.success('操作成功！');
                    queryKufang();                      
                }        
            }).catch((ex)=>{
                     
            });
        },
        onCancel() {},
    });
}
//新增库房
const addKuFang=()=>{    
    let item={
        id:'',
        k_name:'',
        k_desc:'',
        k_sort:0,
        k_status:1,        
    };
    _file_class.init_class_data(_file_class.file_kufang,item);
    openModalFun({title:'新增库房',type:'form',lx:0});
}
//编辑库房
const editorFun=(item)=>{
    _file_class.init_class_data(_file_class.file_kufang,item);
    openModalFun({title:'编辑库房',type:'form'});
}
//查看库位
const viewFun=(item)=>{
    let title=item.k_name+'——库位列表'
    _file_class.init_class_data(_file_class.file_kufang,item);
    openModalFun({title:title,type:'table',width:'70%'});
}


//打开弹窗
const openModalFun=(obj)=>{
    modalObj.value=obj;
    modalOpen.value=true;
}
//关闭弹窗
const closeModalFun=()=>{
    modalOpen.value=false;
}
//表单提交
const onSubmit=()=>{    
    FileApi.addKufang(_file_class).then((res)=>{
        if(res.code==0){
            message.success('操作成功！');
            closeModalFun();
            queryKufang();                      
        }        
    }).catch((ex)=>{
         
    });
}

//查询库房
const queryKufang=()=>{
    FileApi.queryKufang().then((res)=>{
        if(res.code==0){
            kuFangData.value=(res.data);
            getListKufangFunByPage();
        }
    }).catch((ex)=>{
             
    });
}
queryKufang();
//分页查询
const getListKufangFunByPage=()=>{
    let _kufangdata=[];
    if(k_name.value.length>0){
        _kufangdata= kuFangData.value.filter(x=>x.k_name.indexOf(k_name.value)>-1);
    }
    else{
        _kufangdata= kuFangData.value;
    }    
    let list =[];
    let start=(current1.value-1)*pageSize.value;
    let end=(current1.value)*pageSize.value;
    end=end>_kufangdata.length?_kufangdata.length:end;    
    for(let i=start;i<end;i++){
        list.push(_kufangdata[i]);
    }
    _listKufang.value= list;
}

const pageSize = ref(10);
const current1 = ref(1);
watch(pageSize, () => {
    getListKufangFunByPage();
});
watch(current1, () => {
    getListKufangFunByPage();
});



</script>
<style scoped>
 @import url('../css/file.less');
</style>