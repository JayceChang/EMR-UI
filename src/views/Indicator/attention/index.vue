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
          <a-form-item label="开展情况" name="iskz" class="search-form_item">
            <a-select v-model:value="searchForm.iskz" allowClear placeholder="请选择" style="width: 100px">
                <a-select-option value="0">未开展</a-select-option>
                <a-select-option value="1">已开展</a-select-option>
            </a-select>
          </a-form-item>    
          <a-form-item label="关注状态" name="isgz" class="search-form_item">
            <a-select v-model:value="searchForm.isgz" allowClear placeholder="请选择" style="width: 100px">
                <a-select-option value="-1">未关注</a-select-option>
                <a-select-option value="1">已关注</a-select-option>
            </a-select>
          </a-form-item>    
          <a-form-item label="按章查询" name="parent_id_one" class="search-form_item">
            <a-select v-model:value="searchForm.parent_id_one" :options="options_one" 
            show-search optionFilterProp="label" @change="handleChange" allowClear placeholder="请选择" style="width: 200px"/>
          </a-form-item>    
          <a-form-item label="按节查询" name="parent_id_two" class="search-form_item">
            <a-select v-model:value="searchForm.parent_id_two" :options="options_two" 
            show-search optionFilterProp="label" allowClear placeholder="请选择" style="width: 200px"/>
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
        <div class="file_main_table">            
                <a-row :gutter="10">
                    <a-col :span="24">
                        <div class="search-form">                    
                            <div style='margin-bottom:10px;' class="display_flex">
                                <div class="flex" style="line-height:28px;">
                                    <span style='margin-left:5px;'>
                                        全部：{{QCount}}
                                    </span>
                                    <span style='margin-left:20px; color:green;'>
                                        <HeartFilled /> 已关注：{{GZCount}}
                                    </span>
                                    <span style='margin-left:20px; color:red;'>
                                        <HeartOutlined /> 未关注：{{QCount-GZCount}}
                                    </span>
                                </div>                                
                                <div class="">
                                    <a-radio-group v-model:value="searchForm.isgz" button-style="solid" @change="searchQuery">
                                        <a-radio-button value="">全部</a-radio-button>
                                        <a-radio-button value="1">已关注</a-radio-button>
                                        <a-radio-button value="-1">未关注</a-radio-button>
                                    </a-radio-group>
                                </div>
                            </div>
                            <a-spin :spinning="loading">
                                <TableIndex :columns="columns" 
                                    :dataSource="dataSource" 
                                    :scroll="{y:500 }" 
                                    :pagination="pagination" 
                                    @columnClick="columnClick" 
                                    @change="handleTableChange"/>
                            </a-spin>
                        </div>
                    </a-col>
                    <a-col :span="12" v-if="1==2">
                        <div class="search-form">    
                            <div style=''>
                                <a-button type="link" danger>
                                    <template #icon><HeartFilled /></template>已关注
                                    <span style='margin-left:10px;'>总数：{{pagination_GZ.total}}</span>
                                </a-button>
                            </div>    
                            <a-spin :spinning="loading_GZ">            
                                <TableIndex :columns="columns_GZ" 
                                    :dataSource="dataSource_GZ" 
                                    :scroll="{y:500 }" 
                                    :pagination="pagination_GZ" 
                                    @columnClick="columnClick" 
                                    @change="handleTableChange_GZ"/>
                            </a-spin>
                        </div>
                    </a-col>                   
                </a-row>                
            
        </div>  
    </div>
</template>
<script lang="js" setup>
import { ref,reactive,createVNode,watch,onMounted,provide,readonly } from 'vue';
import { message,Modal } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { functionList } from '/@/api/function/index';
import { IndicatorApi } from '/@/api/Indicator/Indicator-api'
import TableIndex from '/@/components/table/index.vue';
import { columns,columns_GZ} from './tableColumns';
const searchForm=ref({});
const loading=ref(false);
const loading_GZ=ref(false);
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
// 分页配置
const pagination_GZ = reactive({
    current: 1,
    pageSize: 15,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: ['15', '20', '25', '100'],
});
const nowTime='';
const QCount=ref(0);
const searchReset=()=>{
    searchForm.value={
        isgz:'',
        indicator_code:undefined,
        indicator_name:undefined,
        department:undefined,
        person:undefined,
        s_department:undefined,
        s_person:undefined,
    }   
    pagination.current = 1;
    pagination.pageSize = 15;
    queryData(1);   
    
    // pagination_GZ.current = 1;
    // pagination_GZ.pageSize = 15;
    // queryData_GZ();   
}
const dataSource=ref([]);
const dataSource_GZ=ref([]);
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
    }
}
queryData_options_two(); 

const GZCount=ref(0);
//查询数据库
async function queryByGZCount() {
    try {    
        let queryResult = await IndicatorApi.queryByGZCount();
        if (queryResult.ok && queryResult.data) {
            GZCount.value=queryResult.data;
        }
    } catch (e) {
        console.log(e);
        options_two.value = [];
    }
}
queryByGZCount(); 



const handleChange = value => {
    queryData_options_two();
};
// 分页变化处理
const handleTableChange = (pag, filters, sorter, extra) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    queryData();
};
// 分页变化处理
const handleTableChange_GZ = (pag, filters, sorter, extra) => {
    pagination_GZ.current = pag.current;
    pagination_GZ.pageSize = pag.pageSize;
    queryData_GZ();
};

//查询数据库
async function queryData(lx) {
    loading.value = true;
    try {
        searchForm.value.parent_id=searchForm.value.parent_id_two?searchForm.value.parent_id_two:searchForm.value.parent_id_one;
        searchForm.value.page_num= pagination.current;
        searchForm.value.page_size= pagination.pageSize;          
        let queryResult = await IndicatorApi.queryAttention(searchForm.value);
        if (queryResult.ok && queryResult.data) {
            let list=queryResult.data.list;
            dataSource.value = list || [];
            pagination.total = queryResult.data.total || 0;
            if(lx==1){
                QCount.value=pagination.total;
            }
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

//查询数据库
async function queryData_GZ() {
    loading_GZ.value = true;
    try {
        searchForm.value.parent_id=searchForm.value.parent_id_two?searchForm.value.parent_id_two:searchForm.value.parent_id_one;
        searchForm.value.page_num= pagination_GZ.current;
        searchForm.value.page_size= pagination_GZ.pageSize;  
        let queryResult = await IndicatorApi.queryAttention(searchForm.value);
        if (queryResult.ok && queryResult.data) {
            let list=queryResult.data.list;
            dataSource_GZ.value = list || [];
            pagination_GZ.total = queryResult.data.total || 0;
        } else {
            pagination_GZ.value = [];
            pagination_GZ.total = 0;
        }
    } catch (e) {
        dataSource_GZ.value = [];
        pagination_GZ.total = 0;
    } finally {
        loading_GZ.value = false;
    }
}

searchReset();
//搜索查询
const searchQuery=()=>{
    pagination.current = 1; // 重置到第一页
    queryData();

    // pagination_GZ.current = 1; // 重置到第一页
    // queryData_GZ();
}
const dataItemIndex=ref(0);
const columnClick=(item,lx,index)=>{
    //console.log('item',item);
    switch(lx){
        case '1':  
            addAttention(item);          
            break;//关注
        case '2':      
            delAttention(item);
            break;//取消关注
        case 'indicator_name':        
            let code=item.indicator_code;
            let template=config.indicatorUrlTemplate;
            let values=[code];
            let openUrl=setOpenUrl(template,values);
            window.open(openUrl);  
            break;//取消关注
    }
}
///动态设置openUrl
const setOpenUrl=(template,values)=>{
    // 使用正则替换 ${index} 为对应数组值
    return template.replace(/\$\{(\d+)\}/g, (match, index) => {
        return values[index] || ""; // 安全处理无效索引
    });
}
//保存数据库
async function addAttention(item) {
    try {   
        let queryResult = await IndicatorApi.addAttention({indicator_code:item.indicator_code,indicator_name:item.indicator_name});
        if (queryResult.ok) {
            message.success('关注成功！');
            item.isgz='1';
            item.attentionid=queryResult.data;
            GZCount.value=GZCount.value-(-1);
        }
    } catch (e) {
        console.log(e);
    }
}

//保存数据库
async function delAttention(item) {
    try {   
        let queryResult = await IndicatorApi.delAttention(item.attentionid);
        if (queryResult.ok) {
            message.success('取消成功！');
            item.isgz='-1';
            GZCount.value=GZCount.value-1;
        }
    } catch (e) {
        console.log(e);
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
.display_flex{
    display: flex;
}
.flex{
    flex: 1;
}
</style>
