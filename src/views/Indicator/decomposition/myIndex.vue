<template>
    <div class="Indicator">
         <!-- Search Form (from original component) -->
         <a-form size="small1" layout="inline" :model="searchForm" class="search-form">
          <a-form-item label="任务名称" name="k_name" class="search-form_item">
            <a-input  v-model:value="searchForm.k_name" allowClear placeholder="请输入关键字" style="width: 120px"/>
          </a-form-item>
          <a-form-item label="任务描述" name="k_desc" class="search-form_item">
            <a-input v-model:value="searchForm.k_desc" allowClear placeholder="请输入关键字" style="width: 120px"/>
          </a-form-item>
          <a-form-item label="关联指标编码" name="indicator_code" class="search-form_item">
            <a-input  v-model:value="searchForm.indicator_code" allowClear placeholder="请输入关键字" style="width: 120px"/>
          </a-form-item>
          <a-form-item label="关联指标名称" name="indicator_name" class="search-form_item">
            <a-input  v-model:value="searchForm.indicator_name" allowClear placeholder="请输入关键字" style="width: 120px"/>
          </a-form-item>
          <a-form-item label="完成状态" name="k_complete" class="search-form_item">
            <a-select v-model:value="searchForm.k_complete" allowClear placeholder="请选择" style="width: 100px">
                <a-select-option value="0">待确认</a-select-option>
                <a-select-option value="1">进行中</a-select-option>
                <a-select-option value="2">待审核</a-select-option>
                <a-select-option value="3">已完成</a-select-option>
                <a-select-option value="-1">审核不通过</a-select-option>
            </a-select>
          </a-form-item>  
          <a-form-item label="逾期状态" name="k_end_date_delay_days" class="search-form_item">
            <a-select v-model:value="searchForm.k_end_date_delay_days" allowClear placeholder="请选择" style="width: 100px">
                <a-select-option value="1">已逾期</a-select-option>
                <a-select-option value="-1">未逾期</a-select-option>
            </a-select>
          </a-form-item>  
          <a-form-item label="截至日期" name="k_end_date" class="search-form_item">
            <a-date-picker v-model:value="searchForm.k_end_date" :valueFormat="dateFormat" :format="dateFormat" allowClear style="width: 95px"/>
          </a-form-item>
          <a-form-item label="延续截至日期" name="k_end_date_delay" class="search-form_item">
            <a-date-picker v-model:value="searchForm.k_end_date_delay" :valueFormat="dateFormat" :format="dateFormat" allowClear style="width: 95px"/>
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
            </a-space>
          </a-form-item>
        </a-form>
        <div class="file_main_table">
            <a-spin :spinning="loading">
                <TableIndex :columns="columns" 
                    :dataSource="dataSource" 
                    :scroll="{ x: 1300,y:500 }" 
                    :pagination="pagination" 
                    @columnClick="columnClick" 
                    @change="handleTableChange"/>
            </a-spin>
        </div> 
         <!--弹窗-->
         <a-modal v-model:open="modalOpen" :title="modalObj.title" :footer="null" :maskClosable="false" :width="modalObj.width">
            <div class="model_view" v-if="modalObj.type=='view'">
                <View :type="type" v-model:active_key="active_key" :data-item="dataSource[dataItemIndex]"/>
            </div>           
        </a-modal>           
    </div>
</template>
<script lang="js" setup>
import { ref,reactive,createVNode,watch,onMounted, computed,provide,readonly } from 'vue';
import { message,Modal } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { functionList } from '/@/api/function/index';
import { IndicatorApi } from '/@/api/Indicator/Indicator-api'
import TableIndex from '/@/components/table/index.vue';
import { columns,formTitle } from './myTableColumns';
import View from './view.vue';

//默认选中的标签
const active_key=ref('1');
//类型
const type = ref('my');
//动态更新数据
const updateDataItem = (res) => {
    dataSource.value[dataItemIndex.value]=res.data;
}
//provide('theme',readonly(theme)) //注入依赖，用readonly修饰，不允许子组件修改值
// 提供响应式数据和更新方法 用于多层嵌套访问
provide('updateDataItem', {
  type:readonly(type),
  updateDataItem
})

const searchForm=ref({});
const dateFormat = 'YYYY-MM-DD';
//当前时间
const currentDate = (() => {
      const date = new Date();
      date.setDate(date.getDate()+7);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，需要+1
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
});
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
const loading=ref(false);
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 15,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: ['15', '20', '25', '100'],
});
const nowTime=currentDate();
const searchReset=()=>{
    searchForm.value={
        type:'my',
        indicator_code:undefined,
        indicator_name:undefined,
        department:undefined,
        person:undefined,
        k_complete:undefined,
        k_end_date:undefined,
        k_end_date_delay:undefined,
    } 
    pagination.current = 1;
    pagination.pageSize = 15;
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
        let queryResult = await IndicatorApi.query(searchForm.value);
        if (queryResult.ok && queryResult.data) {
            dataSource.value = queryResult.data.list || [];
            pagination.total = queryResult.data.total || 0;
        } else {
            dataSource.value = [];
            pagination.total = 0;
        }
        viewById();
    } catch (e) {
        dataSource.value = [];
        pagination.total = 0;
    } finally {
        loading.value = false;
    }
}

searchReset();
//搜索查询
const searchQuery=()=>{
    pagination.current = 1; // 重置到第一页
    queryData();
}
const dataItemIndex=ref(0);
const columnClick=(item,lx,index)=>{
    switch(lx){
        case '1':    
            dataItemIndex.value=index;
            active_key.value='1';
            openModalFun({title:'查看'+formTitle+'：'+item.k_name,type:'view',width:'70%'})
            break;//查看
        case 'indicator_code':
            active_key.value='2_1';
            dataItemIndex.value=index;
            openModalFun({title:'查看'+formTitle+'：'+item.k_name,type:'view',width:'70%'})
            break;//查看
    }
}
function getUrlParams(url) {
  const params = new URLSearchParams(url.split('?')[1]);
  const result = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}
function viewById(){
    const {id}=getUrlParams(window.location.href);
    let index=dataSource.value.findIndex(x=>x.id==id);
    if(index>-1){
        columnClick(dataSource.value[index],'1',index);
    }
    
}
</script>
<style scoped>
 @import url('../css/Indicator.less');
</style>