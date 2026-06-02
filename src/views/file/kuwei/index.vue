<template>
  <div class="ku_wei">
    <div class="display_flex m_bt_10">
      <div class="flex">
        <a-button  type="primary" @click="addKuWei">添加库位</a-button>
        <a-button style="margin-left:10px;"  v-if="hasSelected" @click="delKuWei()" type="primary" danger><DeleteOutlined />删除</a-button>
      </div>
      <div class="sousuo">
        <a-input-search v-model:value="k_name" placeholder="请输入库位名称搜索" :loading="searchLoading" allow-clear enter-button @search="onSearch"/>
      </div>                                                   
    </div>
    <TableIndex :columns="columns" :dataSource="dataSource" :scroll="{ x: 1500, y: 320 }" @columnClick="columnClick"
     :pagination="pagination" :rowSelection="rowSelection"/>
    <!--弹窗-->
    <a-modal v-model:open="modalOpen" :title="modalObj.title" :footer="null" :maskClosable="false" :width="modalObj.width">
      <div class="model_info" v-if="modalObj.type=='form'">
          <FormIndex v-model:formData="_file_class.file_kuwei" :formItemList="_file_class.kuwei" :formProps="formProps" @onSubmit="onSubmit" @closeModalFun="closeModalFun"/>
      </div>    
    </a-modal>
  </div> 
</template>
<script setup>
import { ref,reactive,watch,createVNode,computed } from 'vue';
import { message,Modal } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { FileApi } from '/@/api/file/file-api';
import { file_class_init } from "/@/api/file/file-api-class";
import FormIndex from '/@/components/form/index.vue';
import {columns}from './tableColumns'
import TableIndex from '/@/components/table/index.vue';
const emit = defineEmits(['query']);
const props = defineProps({ 
  dataProps:Object,
})
const dataProps=props.dataProps;
const k_name=ref('');
const dataList = ref([]);
const dataSource = ref([]);
const modalOpen = ref(false);
const modalObj= ref({});
const formProps=reactive({isModal:true,isView:false});
const pagination=ref({
  size:10,
  defaultPageSize:20,
  showSizeChanger:true,
  total:dataList.value.length,
});
const state = reactive({
  selectedRows: [],
  loading: false,
});
const hasSelected = computed(() => state.selectedRows.length > 0);
const rowSelection = ref({
  checkStrictly: false,
  onChange: (selectedRowKeys, selectedRows) => {
    state.selectedRows = selectedRows;
  },
  onSelect: (record, selected, selectedRows) => {    
    //console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    //console.log(selected, selectedRows, changeRows);
  },
});

// 创建响应式类实例
const _file_class = reactive(file_class_init('kuWei'));

const searchLoading=ref(false);
const searchLoadingInit=()=>{
    searchLoading.value=!searchLoading.value;
}
const onSearch = (searchValue) => {
  searchLoadingInit();
  getListFun();
  searchLoadingInit();
};
const getListFun=()=>{
    let data=[];
    if(k_name.value.length>0){
      data= dataList.value.filter(x=>x.k_name.indexOf(k_name.value)>-1);
    }
    else{
      data=dataList.value;
    }    
    dataSource.value=data;
}
//添加库位
const addKuWei=()=>{ 
    let item={
        k_kufangid:dataProps.id,
        k_kufang_name:dataProps.k_name,
        id:'',
        k_name:'',
        k_desc:'',
        k_bianhao:'',
        k_weizhi:'',
        k_sort:0,
        k_status:1,        
    };
    _file_class.init_class_data(_file_class.file_kuwei,item);
    openModalFun({title:'新增库位',type:'form'});
}

//删除库位
const deleteFun=(item)=>{
    if(item.k_file_num>0){
        Modal.warning({
            title: '删除提示',
            content: '库位中已上架文件，请先下架文件后进行删除！',
        });
        return;
    }
    Modal.confirm({
        title: '删除提示',
        icon: createVNode(QuestionCircleOutlined),
        content: '是否要删除库位:【'+item.k_name+'】？删除后将无法恢复！',
        okText: '确认',
        cancelText: '取消',
        onOk() {
            FileApi.delKuwei(item.id).then((res)=>{
              if(res.code==0){
                    message.success('操作成功！');
                    queryKuWei();                      
                }        
            }).catch((ex)=>{
                console.log(ex.data.msg);        
            });
        },
        onCancel() {},
    });
}
//批量删除
const delKuWei=()=>{
  let delList=[];
  let delListNo=[];
  state.selectedRows.forEach(element => {
    if(element.k_file_num==0){
      delList.push(element.id);
    }
    else{
      delListNo.push(element.k_name);
    }
  });

  if(delListNo.length>0){
    Modal.warning({
      title: '删除提示',
      content: '批量删除库位中已存在库位已上架文件，请先下架文件后进行删除！',
    });
    return;
  }else{
    Modal.confirm({
        title: '删除提示',
        icon: createVNode(QuestionCircleOutlined),
        content: '是否要批量删除库位？删除后将无法恢复！',
        okText: '确认',
        cancelText: '取消',
        onOk() {
            FileApi.delListKuwei(delList).then((res)=>{
              if(res.code==0){
                    state.selectedRows=[];
                    message.success('操作成功！');
                    queryKuWei();                      
                }        
            }).catch((ex)=>{
                console.log(ex.data.msg);        
            });
        },
        onCancel() {},
    });
  }
}

//编辑库位
const editorFun=(item)=>{
    _file_class.init_class_data(_file_class.file_kuwei,item);
    openModalFun({title:'编辑库位',type:'form'});
}


const columnClick=(item,lx)=>{
    switch(lx){
        case '1':
            editorFun(item);
            break;//编辑
        case '-1': 
            deleteFun(item);
            break;//删除
    }
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
//表单提交
const onSubmit=()=>{    
  FileApi.addKuWei(_file_class).then((res)=>{
        if(res.code==0){
            message.success('操作成功！');
            closeModalFun();
            queryKuWei();                      
        }        
    }).catch((ex)=>{
         
    });
}
//查询库房
const queryKuWei=(type)=>{
    FileApi.queryKuWei(dataProps.id).then((res)=>{
        if(res.code==0){
          dataList.value=(res.data);          
          if(type!=1){
            emit('query');
          }
          getListFun();
        }
    }).catch((ex)=>{
             
    });
}
queryKuWei(1);

watch(dataProps, () => {
  queryKuWei(1);
});


</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
.display_flex{
  display: flex;
}
.m_bt_10{
  margin-bottom: 10px;
}
.flex{
  flex: 1;
}
</style>