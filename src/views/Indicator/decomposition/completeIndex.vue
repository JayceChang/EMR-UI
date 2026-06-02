<template>
    <div class="">
         <a-form size="small" layout="inline" :model="searchForm" class="search-form">
          <a-form-item label="提交说明" name="k_desc" class="search-form_item">
            <a-input v-model:value="searchForm.k_desc" allowClear placeholder="请输入关键字" style="width: 150px"/>
          </a-form-item>
          <a-form-item label="提交时间" name="k_create_times" class="search-form_item">
            <a-range-picker v-model:value="searchForm.k_create_times" style="width: 200px"
            :valueFormat="dateFormat" :format="dateFormat" allowClear/>
          </a-form-item>
          
          <a-form-item class="search-form_item">
            <a-space>
                <a-button type="primary" @click="searchQuery">
                    <template #icon><SearchOutlined /></template>
                    查询
                </a-button>
                <a-button @click="searchReset">
                    <template #icon><ReloadOutlined /></template>
                    重置
                </a-button>
                <a-button v-if="dataSource.length>0 && props.type=='my'" @click="searchDelete" danger>
                    <template #icon><DeleteOutlined /></template>
                    撤销
                </a-button>
            </a-space>
          </a-form-item>
        </a-form>
        <div class="file_main_table">
            <a-spin :spinning="loading">
                <TableIndex :columns="columnsComplete" 
                    :dataSource="dataSource" 
                    :scroll="{y:500 }" 
                    :pagination="pagination" 
                    @columnClick="columnClick" 
                    @change="handleTableChange"/>
            </a-spin>
        </div> 
         <!--弹窗-->
         <a-modal v-model:open="modalOpen" :title="modalObj.title" :footer="null" :maskClosable="false" :width="modalObj.width">
            <div class="model_view" v-if="modalObj.type=='view_file'">
                <FileView :fileIds="fileIds"/>
            </div>           
        </a-modal>    
    </div> 
</template>
<script lang="js" setup>
import { ref,reactive,createVNode,watch,onMounted,computed,watchEffect,inject } from 'vue';
import { message,Modal } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { IndicatorApi } from '/@/api/Indicator/Indicator-api';
import TableIndex from '/@/components/table/index.vue';
import { columnsComplete} from './myTableColumns';
import FileView from '/@/components/form/fileview.vue';
const props = defineProps({
    k_idp_id:String,
    k_complete:Number,
    type:String,
});
//接受最顶层组件传递的值
const { updateDataItem } = inject('updateDataItem');
const { setActiveKey } = inject('setActiveKey');

//同步页面数据
const update_dataItem=(res)=>{
    updateDataItem(res);   
}
const searchForm=ref({});
const dateFormat = 'YYYY-MM-DD';
//当前时间
const currentDate = (num) => {
      const date = new Date();
      date.setDate(date.getDate()+num);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，需要+1
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
};
const loading=ref(false);
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100'],
});
const nowTime=currentDate(0);
const oldTime=currentDate(-30);
//默认数据
const searchReset=()=>{
    searchForm.value.k_idp_id=props.k_idp_id;
    searchForm.value.k_desc=undefined;
    searchForm.value.k_create_times=undefined;//[oldTime,nowTime];
    pagination.current = 1;
    pagination.pageSize = 10;
    queryData();  
}
const dataSource=ref([]);
// 分页变化处理
const handleTableChange = (pag, filters, sorter, extra) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    queryData();
};

//查询数据库
async function queryData() {
    loading.value = true;
    try {
        searchForm.value.page_num= pagination.current;
        searchForm.value.page_size= pagination.pageSize;       
        let queryResult = await IndicatorApi.queryComplete(searchForm.value);
        if (queryResult.ok && queryResult.data) {
            dataSource.value = queryResult.data.list || [];
            pagination.total = queryResult.data.total || 0;
        } else {
            dataSource.value = [];
            pagination.total = 0;
        }
    } catch (e) {
        dataSource.value = [];
        pagination.total = 0;
    } finally {
        loading.value = false;
    }
}
//搜索查询
const searchQuery=()=>{
    pagination.current = 1; // 重置到第一页
    queryData();
}
//撤销最后提交的完成度，若完成度(100%)，将自动取消审核！
const searchDelete=()=>{
    let item=dataSource.value[0];
    if(props.k_complete==3){
        Modal.warning({
            title: '撤销提示',
            content: '分配指标进度已完成审核通过，无法进行撤销！',
        });
        return;
    }
    let content="撤销最后提交的完成度：("+item.k_value+"%)，";
    if(item.k_value==100){
        content +="将自动取消审核！";
    }
    content +="是否确认撤销？撤销后将无法恢复！";
    Modal.confirm({
        title: '撤销提示',
        icon: createVNode(QuestionCircleOutlined),
        content: content,
        okText: '确认',
        cancelText: '取消',
        onOk() {
            IndicatorApi.deleteComplete(item).then((res)=>{
              if(res.code==0){    
                    message.success('操作成功！');                 
                    update_dataItem(res);
                    let query={'complete':1,'log':1};
                    if(item.k_value==100){
                        query['repair']=1;                        
                    }  
                    setActiveKey('2',query);    
                    
                }        
            }).catch((ex)=>{
                console.log(ex.data.msg);        
            });
        },
        onCancel() {},
    });
}
const modalOpen = ref(false);
const modalObj= ref({});
//打开弹窗
const openModalFun=(obj)=>{
    modalObj.value=obj;
    modalOpen.value=true;
}
//关闭弹窗
const closeModalFun=()=>{
    modalOpen.value=false;
}
const fileIds=ref([]);
const columnClick=(item,lx,index)=>{
    switch(lx){
        case 'k_file_ids':
            if(item.k_file_ids){
                fileIds.value=item.k_file_ids;                
                openModalFun({title:'查看完成进度【'+item.k_value+'%】已关联附件',type:'view_file'})
            }
            
            break;//查看
    }
}

//监听是否变化执行操作
watch(()=>props.k_idp_id,searchReset);
searchReset();
//暴漏到父组件
defineExpose({
    searchReset
});

</script>
<style scoped>
 @import url('../css/Indicator.less');
</style>
