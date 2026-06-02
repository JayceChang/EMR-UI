<template>
    <div class="allocation">
         <a-form size="small1" layout="inline" :model="searchForm" class="search-form">
          <a-form-item label="指标编码" name="indicator_code" class="search-form_item">
            <a-input  v-model:value="searchForm.indicator_code" allowClear placeholder="请输入关键字" style="width: 150px"/>
          </a-form-item>    
          <a-form-item label="指标名称" name="indicator_name" class="search-form_item">
            <a-input  v-model:value="searchForm.indicator_name" allowClear placeholder="请输入关键字" style="width: 170px"/>
          </a-form-item>   
          <a-form-item label="采集方式" name="cjfs" class="search-form_item">
            <a-select v-model:value="searchForm.cjfs" allowClear placeholder="请选择" style="width: 100px">
                <a-select-option value="1">自动取数</a-select-option>
                <a-select-option value="2">手动填报</a-select-option>
            </a-select>
          </a-form-item>    
          <a-form-item label="分配情况" name="isfp" class="search-form_item">
            <a-select v-model:value="searchForm.isfp" allowClear placeholder="请选择" style="width: 100px">
                <a-select-option value="0">未分配</a-select-option>
                <a-select-option value="1">已分配</a-select-option>
            </a-select>
          </a-form-item>    
          <a-form-item label="开展情况" name="iskz" class="search-form_item">
            <a-select v-model:value="searchForm.iskz" allowClear placeholder="请选择" style="width: 100px">
                <a-select-option value="0">未开展</a-select-option>
                <a-select-option value="1">已开展</a-select-option>
            </a-select>
          </a-form-item>    
          <a-form-item label="按章查询" name="parent_id_one" class="search-form_item">
            <a-select v-model:value="searchForm.parent_id_one" :options="options_one" 
            show-search optionFilterProp="label" @change="handleChange" allowClear placeholder="请选择" style="width: 250px"/>
          </a-form-item>    
          <a-form-item label="按节查询" name="parent_id_two" class="search-form_item">
            <a-select v-model:value="searchForm.parent_id_two" :options="options_two" 
            show-search optionFilterProp="label" allowClear placeholder="请选择" style="width: 250px"/>
          </a-form-item>    
          <a-form-item label="监督科室" name="s_department" class="search-form_item">
            <a-input v-model:value="searchForm.s_department" allowClear placeholder="请输入关键字" style="width: 120px"/>
          </a-form-item>
          <a-form-item label="监督人" name="s_person" class="search-form_item">
            <a-input v-model:value="searchForm.s_person" allowClear placeholder="关键字" style="width: 80px"/>
          </a-form-item>
          <a-form-item label="责任科室" name="department" class="search-form_item">
            <a-input v-model:value="searchForm.department" allowClear placeholder="请输入关键字" style="width: 120px"/>
          </a-form-item>
          <a-form-item label="责任人" name="person" class="search-form_item">
            <a-input v-model:value="searchForm.person" allowClear placeholder="关键字" style="width: 80px"/>
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
        <div class="file_main_table_top">
            <div class="file_main_table_top_left"> 
                共 <a>{{pagination.total}}</a> 条记录
                <template v-if="errorData.length>0">
                    异常数据 <a class="c_red" @click="modalObj_open=true"> {{errorData.length}} </a> 条记录
                </template>
            </div>
            <div class="file_main_table_top_right"> 
                <a-space wrap>
                    <a-button size="small2" type="text" @click="downLoadTemplate" class="bg_c_e1e1e1">
                        <template #icon><VerticalAlignBottomOutlined /></template>
                        下载模板
                    </a-button> 
                    <div class="allocationFile">                   
                        <a-upload
                            name="excelFile"
                            accept=".xls,.xlsx"
                            :before-upload="beforeUpload" 
                        >
                            <a-button size="small2" type="primary">
                                <template #icon><VerticalAlignTopOutlined /> </template>
                                导入数据
                            </a-button>
                        </a-upload>
                    </div>
                    <a-button size="small2" @click="downLoadData">
                        <template #icon><DownSquareOutlined /> </template>
                        导出数据
                    </a-button>
                </a-space>
            </div>
        </div>
        <div class="file_main_table">
            <a-spin :spinning="loading">
                <TableIndex :columns="columns" 
                    :dataSource="dataSource" 
                    :scroll="{y:500 }" 
                    :pagination="pagination" 
                    @columnClick="columnClick" 
                    @change="handleTableChange"/>
            </a-spin>
        </div>  
        <div class="loading">  
            <Loading :loading="loading_obj"/>
        </div>
        <a-modal v-model:open="modalObj_open" title="指标责任分配异常数据" :footer="null" :maskClosable="false" width="65%">
            <TableIndex :columns="columns_error" 
                    :dataSource="errorData" 
                    :scroll="{y:500 }"/>
        </a-modal>
    </div>
</template>
<script lang="js" setup>
import { ref,reactive,createVNode,watch,onMounted,provide,readonly } from 'vue';
import { message,Modal } from 'ant-design-vue';
import { h } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { functionList } from '/@/api/function/index';
import { IndicatorApi } from '/@/api/Indicator/Indicator-api'
import TableIndex from '/@/components/table/index.vue';
import Loading from '/@/components/loading/index.vue';
import { columns,columns_error} from './tableColumns';
import { useDataStore } from '/@/store/modules/system/api-data.ts';
useDataStore().reset();
const searchForm=ref({});
const dateFormat = 'YYYY-MM-DD';
//当前时间
const currentDate = (() => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，需要+1
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
});
const modalObj_open=ref(false);
//功能点
// const pointsList=functionList();
// const is_add=pointsList.findIndex(x=>x.menuName=='添加')>-1;
// if(!is_add){
//     let idx=columns.findIndex(x=>x.key=='operation');//operationData
//     if(idx>-1){
//        let num1= columns[idx].operationData.findIndex(x=>x.label=='编辑');
//        columns[idx].operationData[num1]['is_hide']='1';
//        let num2= columns[idx].operationData.findIndex(x=>x.label=='删除');
//        columns[idx].operationData[num2]['is_hide']='1';
//     }
// }
const loading_obj=ref({
    spinning:false,
    tip:'操作中...'
});
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
const nowTime='';
const searchReset=()=>{
    searchForm.value={
        indicator_code:undefined,
        indicator_name:undefined,
        department:undefined,
        person:undefined,
        k_complete:undefined,
        k_end_date:nowTime,
        k_end_date_delay:nowTime,
    }   
    pagination.current = 1;
    pagination.pageSize = 15;
    queryData();   
}
const dataSource=ref([]);
const options_one=ref([]);
//查询数据库
async function queryData_options_one() {
    try {   
        searchForm.value.parent_id_two=undefined; 
        options_one.value = [];
        let queryResult = await IndicatorApi.queryIndicatorOne();
        if (queryResult.ok && queryResult.data) {
            let list=queryResult.data;
            list.forEach(element => {
                options_one.value.push({
                    value: element.id,
                    label: element.indicator_name,
                })
            });
        }
    } catch (e) {
        console.log(e);
        options_one.value = [];
    } finally {
    }
}
queryData_options_one();
const options_two=ref([]);
//查询数据库
async function queryData_options_two() {
    try {    
        let person_id=searchForm.value.parent_id_one || -1;
        options_two.value = [];
        let queryResult = await IndicatorApi.queryIndicatorTwo(person_id);
        if (queryResult.ok && queryResult.data) {
            let list=queryResult.data;
            list.forEach(element => {
                options_two.value.push({
                    value: element.id,
                    label: element.indicator_name,
                })
            });
        }
    } catch (e) {
        console.log(e);
        options_two.value = [];
    } finally {
    }
}
queryData_options_two(); 

const handleChange = value => {
    queryData_options_two();
};
// 分页变化处理
const handleTableChange = (pag, filters, sorter, extra) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    queryData();
};
//查询异常数据
const queryListByError=()=> {
    IndicatorApi.queryAllocationListByError().then((res)=>{
        if (res.ok && res.data) {
            let list=res.data;
            errorData.value = list;
        } else {
            errorData.value = [];
        }
    })
}
//查询数据库
async function queryData() {
    queryListByError();
    loading.value = true;
    try {
        searchForm.value.parent_id=searchForm.value.parent_id_two?searchForm.value.parent_id_two:searchForm.value.parent_id_one;
        searchForm.value.page_num= pagination.current;
        searchForm.value.page_size= pagination.pageSize;       
        let queryResult = await IndicatorApi.queryAllocation(searchForm.value);
        if (queryResult.ok && queryResult.data) {
            let list=queryResult.data.list;
            dataSource.value = list || [];
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

searchReset();
//搜索查询
const searchQuery=()=>{
    pagination.current = 1; // 重置到第一页
    queryData();
}
const dataItemIndex=ref(0);
const columnClick=(item,lx,index)=>{
    console.log('item',item);
    switch(lx){
        case '1':
            let list=[];
            if(item.indicator_code){
                //主指标
                var obj={
                    id:item.did,
                    indicator_code:item.indicator_code,
                    indicator_name:item.indicator_name,
                    error_status:1,
                }
                if(item.s_department_id){
                    obj.s_department=item.s_department;
                    obj.s_department_id=item.s_department_id;
                    if(item.s_person){
                        obj.s_person=item.s_person;
                        obj.s_person_id=item.s_person_id;
                    }
                    else{
                        obj.s_person='';
                        obj.s_person_id='';
                    }
                }
                else{
                    obj.s_department='';
                    obj.s_department_id='';
                    obj.s_person='';
                    obj.s_person_id='';
                }
                

                if(item.department_id){
                    obj.department=item.department;
                    obj.department_id=item.department_id;
                    if(item.person){
                        obj.person=item.person;
                        obj.person_id=item.person_id;
                    }
                    else{
                        obj.person='';
                        obj.person_id='';
                    }
                }
                else{
                    obj.department='';
                    obj.department_id='';
                    obj.person='';
                    obj.person_id='';
                }
                

                
                list.push(obj);
            }
            if(item.indicator_code_fz){
                //分子指标
                var obj={
                    id:item.did_fz,
                    indicator_code:item.indicator_code_fz,
                    indicator_name:item.indicator_name_fz,
                    error_status:1,
                }
                if(item.department_fz_id){
                    obj.department=item.department_fz;
                    obj.department_id=item.department_fz_id;
                    if(item.person_fz){
                        obj.person=item.person_fz;
                        obj.person_id=item.person_fz_id;
                    }
                    else{
                        obj.person='';
                        obj.person_id='';
                    }
                }
                else{
                    obj.department='';
                    obj.department_id='';
                    obj.person='';
                    obj.person_id='';
                }                

                list.push(obj);
            }
            if(item.indicator_code_fm){
                //分母指标
                var obj={
                    id:item.did_fm,
                    indicator_code:item.indicator_code_fm,
                    indicator_name:item.indicator_name_fm,
                    error_status:1,
                }
                if(item.department_fm_id){
                    obj.department=item.department_fm;
                    obj.department_id=item.department_fm_id;
                    if(item.person_fm){
                        obj.person=item.person_fm;
                        obj.person_id=item.person_fm_id;
                    }
                    else{
                        obj.person='';
                        obj.person_id='';
                    }
                }
                else{
                    obj.department='';
                    obj.department_id='';
                    obj.person='';
                    obj.person_id='';
                }
                
                list.push(obj);
            }

            // console.log('list',list);
            // return;
            addAllocation({list});
            break;//确定
    }
}
//保存数据库
async function addAllocation(list) {
    try {   
        let queryResult = await IndicatorApi.addAllocation(list);
        if (queryResult.ok) {
            message.success('操作成功！');
            queryData();
        }
    } catch (e) {
        console.log(e);
    } finally {
    }
}
//下载模板
async function downLoad(type){    
    try {   
        loading_obj.value.tip="下载中..." ;
        loading_obj.value.spinning = true;
        IndicatorApi.downLoadAllocation(type,()=>{
            message.success('下载成功！');
            loading_obj.value.spinning = false;
        });        
    } catch (e) {
        console.log(e);
        message.error('下载失败！');
    } finally {
        
    }    
}
const downLoadTemplate=()=>{   
    downLoad('template');    
}
const downLoadData=()=>{
    downLoad('data');
}
const beforeUpload = file => { 
  const formData = new FormData();
  formData.append('excelFile', file);
  upLoadAllocation(formData);  
  return false;
};
const errorData=ref([]);
async function upLoadAllocation(formData){
    try {   
        loading_obj.value.tip="导入中..." ;
        loading_obj.value.spinning = true;
        let queryResult = await IndicatorApi.upLoadAllocation(formData);
        if (queryResult.ok) {
            loading_obj.value.spinning = false;
            let data=queryResult.data;
            errorData.value=data;
            if(data.length>0){
                Modal.info({
                    title: '部分导入成功，存在异常数据！',
                    content: h('div', {}, [
                        h('p', '点击确定进行查看！'),
                    ]),
                    okText: '确认',
                    onOk() {
                        modalObj_open.value=true;
                    },
                });
            }
            else{
                message.success("导入成功！", 2).then(()=>{
                    queryData();
                });        
            }                
        }
    } catch (e) {
        console.log(e);
    } finally {
        loading_obj.value.spinning = false;
    }
}

</script>
<style scoped>
 @import url('../css/Indicator.less');
 .allocation{
    margin: 0px;    
}
.search-form{
    padding: 10px 10px 0px 10px;
    background-color: #fff;
    border-radius:7px;
 }
.file_main_table{
    margin-top: 10px;
}
.file_main_table_top{
    margin: 10px 0px;
    display:flex;
    height: 28px;
}
.file_main_table_top_left{
    flex:1;
    line-height: 28px;
    font-size:14px;
    padding-left:10px;
}
:deep(.allocationFile .ant-upload-list){
    display:none;
}
.c_red{
    color: red;
}
</style>
