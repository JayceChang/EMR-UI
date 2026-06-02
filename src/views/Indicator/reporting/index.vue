<template>
    <div class="reporting">
            <div class="maininfo_top display_flex">   
                <div class="flex">
                    <a-tooltip placement="top" title="空为全部指标">
                        <QuestionCircleOutlined style="margin-right: 8px" />
                    </a-tooltip>
                    <a-tree-select
                        v-model:value="zb_value"
                        mode="multiple"
                        style="width: 380px"
                        placeholder="请选择需要导出指标，空为全部指标"
                        :max-tag-count="2"
                        :max-tag-text-length="10"                       
                        show-search
                        :filterOption="filterOption"
                        allowClear
                        tree-checkable
                        tree-default-expand-all
                        :show-checked-strategy="SHOW_CHILD"                      
                        :tree-data="options"
                        tree-node-filter-prop="label"
                        popupClassName="allselect"
                        >
                        <template #maxTagPlaceholder="omittedValues">
                            <span style="color: red">+ {{ omittedValues.length }} ...</span>
                        </template>
                    </a-tree-select>
                    <a-button type="primary" style="margin-left: 10px;" @click="clickzb_value">                        
                        确定
                    </a-button>
                </div>
                

                <a-tooltip placement="top" title="指标上报年份" v-if="1==2">
                    <QuestionCircleOutlined style="margin-left: 8px" />
                    <span class="title">上报年份</span>
                </a-tooltip>

                <a-radio-group style="margin-left: 10px;" v-model:value="nowType" button-style="solid" @change="nowTypeChange">                                
                    <a-radio-button value="1">近四年</a-radio-button>
                    <a-radio-button value="3">近三年</a-radio-button>
                    <a-radio-button value="2">自定义</a-radio-button>
                </a-radio-group>
                <a-select
                    v-model:value="valueYear"
                    mode="multiple"
                    :disabled="nowType!='2'"
                    style="width: 280px; margin-left: 5px;"
                    placeholder="请选择年份"
                    :options="optionsYear"
                ></a-select> 
                <a-button type="link" style="margin-left: 2px;" @click="clickOK" v-if="nowType==='2'">确定</a-button>
                <a-checkbox style="margin-left: 10px;" v-model:checked="checked">按章导出</a-checkbox>
                <a-button type="primary" style="margin-left: 10px;" @click="clickDaoChu('-1')">
                    <VerticalAlignBottomOutlined />
                    临时导出
                </a-button>
                <a-button type="primary" danger style="margin-left: 10px;" @click="clickDaoChu('1')">
                    <VerticalAlignBottomOutlined />
                    锁定导出
                </a-button>
            </div>
        <div class="maininfo">
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
          <a-form-item label="责任部门" name="department" class="search-form_item">
            <a-input v-model:value="searchForm.department" allowClear placeholder="请输入关键字" style="width: 120px"/>
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
            <div class="">
                <a-spin :spinning="loading">
                    <TableIndex size="middle" 
                        :columns="columnsMain" 
                        :dataSource="dataSource" 
                        :scroll="{y:550 }" 
                        :pagination="pagination" 
                        @columnClick="columnClick" 
                        @change="handleTableChange" />
                </a-spin>                 
            </div>            
        </div>
        <!--弹窗-->
        <a-modal v-model:open="modalOpen" :title="modalObj.title" :footer="null" :maskClosable="false" :width="modalObj.width">
            <div class="model_info" v-if="modalObj.type=='form'">
                <FormIndex class="model_info_item" v-model:formData="formData" :formItemList="formItemList" :formProps="formProps" @onSubmit="onSubmit" @closeModalFun="closeModalFun"/>
                <div class="form_foot">
                    <div class="form_foot_title">指标导向：<span class="c_169600">{{ columnsMain.find(x=>x.dataIndex=='zbdx').dicData.find(x=>x.value==formData.zbdx).label  }} </span></div>
                    <div id="main_echarts" style=" height: 138px;;"></div>
                </div>
            </div>
            <div class="model_info" v-if="modalObj.type=='log'">
                 <div style="margin-bottom:10px;">
                    年份：
                    <a-select v-model:value="years" 
                        mode="multiple" 
                        placeholder="请选择年份" 
                        style="width: 280px;
                        margin-right: 5px;">
                        <a-select-option v-for="year in valueYear" :key="year" :value="year">{{year}}年</a-select-option>
                    </a-select>
                    <a-button type="primary" @click="searchQueryLog">
                        <template #icon><SearchOutlined /></template>
                        查询
                    </a-button>
                 </div>
                 <a-spin :spinning="loadingLog">
                    <TableIndex size="middle" 
                        :columns="columnsLog" 
                        :dataSource="dataSourceLog" 
                        :scroll="{y:400 }" 
                        :pagination="paginationLog" 
                        @change="handleTableChangeLog" />
                 </a-spin>
                
            </div>
        </a-modal>
        <a-modal v-model:open="modalOpen1" :title="modalObj.title" :footer="null" :maskClosable="false" :width="900">
            <div class="model_info_title">{{yearTitle}}</div>
                <div class="model_info_content" v-if="detailData.length>0">
                     <a-row :gutter="16">
                        <template v-for="(item,index) in detailData" :key="index" >  
                            <a-col v-if="index==0 && item.indicator_data_type=='1' && indicator_data.indicator_id==item.indicator_id" :span="12">
                                <div class="display_flex" style="margin-bottom:5px;">
                                     <div style="width: 60px;text-align: right;"></div>
                                     <div style="margin-left: 5px;width: 100px;">
                                           分子
                                     </div>
                                     <div style="margin-left: 15px;width: 100px;">
                                           分母
                                     </div>
                                     <div style="margin-left: 20px;width: 100px;">
                                           结果
                                     </div>
                                </div>
                            </a-col>      
                            <a-col v-if="index==0 && item.indicator_data_type=='1' && indicator_data.indicator_id==item.indicator_id" :span="12">
                                <div class="display_flex" style="margin-bottom:5px;">
                                     <div style="width: 60px;text-align: right;"></div>
                                     <div style="margin-left: 5px;width: 100px;">
                                           分子
                                     </div>
                                     <div style="margin-left: 15px;width: 100px;">
                                           分母
                                     </div>
                                     <div style="margin-left: 20px;width: 100px;">
                                           结果
                                     </div>
                                </div>
                            </a-col>                         
                            <a-col :span="(item.indicator_data_type=='1'&& indicator_data.indicator_id==item.indicator_id)?12:6">
                                <div class="display_flex" style="margin-bottom:10px;">
                                    <div style="width: 60px;text-align: right;">{{item.serial_num_name}}：</div>
                                    <template v-if="item.indicator_data_type=='1'">                                    
                                        <div style="margin-left: 5px;" v-if="indicator_data.indicator_id==item.indicator_id || indicator_data.zbtype=='2'">
                                            <a-input-number :disabled="parseInt(item.serial_num)>12 || item.fzsuoding==1" placeholder="分子" style="width: 100px;" size="small" v-model:value="item.value_1" :min="0"  /> 
                                        </div>
                                        <div style="margin-left: 5px;" v-if="item.indicator_data_type=='1' && indicator_data.indicator_id==item.indicator_id">
                                            <span class="c_999" v-if="item.relation_type==1">+</span>
                                            <span class="c_999" v-if="item.relation_type==2">-</span>
                                            <span class="c_999" v-if="item.relation_type==3">*</span>
                                            <span class="c_999" v-if="item.relation_type==4">/</span>
                                        </div>
                                        <div style="margin-left: 5px;" v-if="indicator_data.indicator_id==item.indicator_id || indicator_data.zbtype=='3'">
                                            <a-input-number :disabled="parseInt(item.serial_num)>12 || item.fmsuoding==1" placeholder="分母" style="width: 100px;" size="small" v-model:value="item.value_2" :min="0"  />
                                        </div>
                                        <div style="margin-left: 5px;" v-if="item.indicator_data_type=='1' && indicator_data.indicator_id==item.indicator_id">
                                            <span class="c_999">=</span>                                        
                                        </div>
                                    </template>
                                    <div style="margin-left: 5px;" class="flex"> 
                                        <a-input-number disabled v-if="item.indicator_data_type=='1' && indicator_data.indicator_id==item.indicator_id" style="width: 100px;margin-right: 5px;" size="small" v-model:value="item.value_3" :min="0"  />
                                        <a-input-number :disabled="parseInt(item.serial_num)>12 || item.suoding==1" v-if="item.indicator_data_type!='1'" style="width: 70px;margin-right: 5px;" size="small" v-model:value="item.value_1" :min="0"  />
                                        <span class="c_999" v-if="indicator_data.join_condition==2">%</span>
                                        <span class="c_999" v-if="indicator_data.join_condition==3">‰</span>
                                        <span class="c_999" v-if="indicator_data.join_condition==4">‱</span>                                                                              
                                    </div>
                                </div>
                            </a-col>
                        </template>                      
                    </a-row>
                    <div class="text_right">
                        <span style="margin-right: 20px;color: #999;">
                            注：修改月数据会自动汇总到季度/年度
                        </span>
                        <a-space wrap>
                            <a-button @click="modalOpen1=false">取消</a-button>      
                            <a-button @click="savemodal" type="primary">保存</a-button>                                         
                        </a-space>
                    </div>                   
                </div>
                <div class="model_info_content" v-else>
                    <p class="no_info">
                        <SignalFilled />
                        暂无详细月数据
                    </p>
                </div>
        </a-modal>
        <div class="loading">  
            <Loading :loading="loading_obj"/>
        </div>
    </div>
</template>

<script lang="js" setup>
import { ref,reactive,createVNode,watch,onMounted,computed,defineComponent } from 'vue';
import { h } from 'vue';
import { useRouter } from 'vue-router'; // 引入 useRouter 函数
import { message,Modal } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { IndicatorApi } from '/@/api/Indicator/Indicator-api';
import { columns,columnsLog} from './tableColumns';
import TableIndex from '/@/components/table/index.vue';
import Loading from '/@/components/loading/index.vue';
import FormIndex from '/@/components/form/index.vue';
import * as echarts from 'echarts';
import { TreeSelect } from 'ant-design-vue';
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const SHOW_ALL= TreeSelect.SHOW_ALL;
const SHOW_CHILD=TreeSelect.SHOW_CHILD;
const dateFormat="YYYY";
const nowType=ref('1');//类型：今年/近四年/自定义
let year=new Date().getFullYear();//今年年份
const checked = ref(true);//是否按章导出
const loading=ref(false);
const loadingLog=ref(false);
const modalOpen = ref(false);
const modalOpen1 = ref(false);
const yearTitle=ref('');
const modalObj= ref({});
const formProps=ref({isModal:true,isView:false,labelWidth:'120'});
const indicator_id=ref('');//当前操作指标id
const detailData = ref([]);//每年详情数据
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
const paginationLog = reactive({
    current: 1,
    pageSize: 15,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: ['15', '20', '25', '100'],
});
//三级四级指标
const zb_value=ref([]);
const zb_value_OK=ref([]);
const options =ref([]);
//查询数据库
async function queryIndicatorBySanJI() {
    try {     
        let queryResult = await IndicatorApi.queryIndicatorBySanJI();
        if (queryResult.ok && queryResult.data) {
            let list=queryResult.data;
            if(list.length>0){
                options.value =[{
                    value:'0',
                    label:'全选',
                    key:0,
                    children:list.map(x=>{
                        return {
                            value:x.id,
                            label:x.indicator_name+'['+x.indicator_code+']',                            
                        }
                    })
                }]
            }            
        } else {
            options.value = [];
        }
    } catch (e) {
        options.value = [];
    } finally {
    }
}
queryIndicatorBySanJI();
//确定选择指标
const clickzb_value=()=>{
    zb_value_OK.value=zb_value.value;
    searchQuery();
}
const filterOption=(input, option)=> {
    // 将option的label与搜索关键字进行对比
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

//年份
const optionsYear =reactive([]);
for (let i = year; i >= year-10; i--) {
    optionsYear.push({ value: i.toString(), label: i.toString()+'年' });
}
const columnsMain=ref([]);
const valueYear = ref([year.toString(),(year-1).toString(),(year-2).toString(),(year-3).toString()]); // 选择的年份
const years=ref([]);//日志查询年份
const yearsList=ref([]);//当前查询年份
const nowTypeChange=()=>{
    if(nowType.value=="1"){
        valueYear.value=[year.toString(),(year-1).toString(),(year-2).toString(),(year-3).toString()];
        clickOK();
    }
    else if(nowType.value=="3"){
        valueYear.value=[year.toString(),(year-1).toString(),(year-2).toString()];
        clickOK();
    }
}

const searchForm=ref({});//查询条件
//查询数据库
async function queryData() {
    loading.value = true;
    try {
        searchForm.value.ids=zb_value.value.length>0?zb_value.value:'';
        searchForm.value.years=valueYear.value;
        searchForm.value.page_num= pagination.current;
        searchForm.value.page_size= pagination.pageSize;          
        let queryResult = await IndicatorApi.queryByReporting(searchForm.value);
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
async function queryDataLog() {
    loadingLog.value = true;
    try {        
        let obj={
            indicator_id:indicator_id.value,
            years:years.value,
            page_num: paginationLog.current,
            page_size: paginationLog.pageSize,
        };        
        let queryResult = await IndicatorApi.queryByReportingLog(obj);
        if (queryResult.ok && queryResult.data) {
            let list=queryResult.data.list;
            dataSourceLog.value = list || [];
            paginationLog.total = queryResult.data.total || 0;
        } else {
            dataSourceLog.value = [];
            paginationLog.total = 0;
        }
    } catch (e) {
        dataSourceLog.value = [];
        paginationLog.total = 0;
    } finally {
        loadingLog.value = false;
    }
}
const cols=ref([]);//动态数据表格列
const initCol=()=>{
    valueYear.value.sort((a,b)=>b-a);
    cols.value=valueYear.value.map(v=>({
            title:'指标值（'+v+'年）',
            dataIndex: 'value'+v,
            key:v,
            width:120,
            align:'left',
    }));
    columnsMain.value= columns(cols.value);
    searchReset();
}
const clickOK = () => {
  //console.log('Selected years:', valueYear.value);
  if(valueYear.value.length==0){
    message.error('请选择年份');
    return;
  }
  initCol();
};
const dataSource = ref([]);
const dataSourceLog = ref([]);
// 分页变化处理
const handleTableChange = (pag, filters, sorter, extra) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    queryData();
};
const handleTableChangeLog = (pag, filters, sorter, extra) => {
    paginationLog.current = pag.current;
    paginationLog.pageSize = pag.pageSize;
    queryDataLog();
};

const searchReset=()=>{
    searchForm.value={
        indicator_code:undefined,
        indicator_name:undefined,
        department:undefined,
    }   
    pagination.current = 1;
    pagination.pageSize = 15;
    queryData();    
}
//搜索查询
const searchQuery=()=>{
    pagination.current = 1; // 重置到第一页
    queryData();
}

const searchQueryLog=()=>{
    if(indicator_id.value==''){
        message.error('请选择指标');
        return;
    }
    paginationLog.current = 1; // 重置到第一页
    if(years.value.length==0){
       years.value=[...yearsList.value];
    }
    queryDataLog();
}

const formItemList=ref([]);//表单内容
const formData=ref({});//表单数据

//初始化图表
const initChart=()=> {
    let list=[...cols.value];
    list.sort((a,b)=>a.key-b.key);
    let xAxisData=list.map(v=>v.key);
    let seriesData=list.map(v=>formData.value[v.dataIndex]);    
    var chartDom = document.getElementById('main_echarts');
    var myChart = echarts.init(chartDom);
    var option;
    option = {
        color:'#169600',
        grid: {
            left: '5%',
            right: '0%',
            bottom: '5%',
            top:'5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xAxisData
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: seriesData,
                type: 'line',
                smooth: true
            }
        ]
    };
    option && myChart.setOption(option);
}
const detailData_Old = ref([]);//每年详情数据旧数据
const indicator_data=ref({});//指标数据
const queryDetail=async(formDataItem,item)=>{
    indicator_data.value=formDataItem;
    //console.log('indicator_data',indicator_data.value);
    let year=item.keyValue;
    let indicator_id=formDataItem.indicator_id;
    let obj_parent=undefined;
    if(formDataItem.zbtype!='1'){
        //分子或者分母或其他
        obj_parent=dataSource.value.find(x=>
            x.fm_indicator_id==indicator_id || x.fz_indicator_id==indicator_id
        );
        if(obj_parent){
            indicator_id = obj_parent.indicator_id;      
        }
    }

    let obj={indicator_id:indicator_id,year:year};
    let queryResult = await IndicatorApi.queryDetail(obj);
    if (queryResult.ok && queryResult.data) {
        let list=queryResult.data;
        detailData_Old.value = JSON.parse(JSON.stringify(list)) || [];
        detailData.value = list || []; 
        detailData.value.forEach((v)=>{            
            watch(
                () => v.value_1, (newVal, oldVal) => {     
                    if(oldVal){
                        detailData_JiSuan(obj_parent?obj_parent:formDataItem,item);
                    }
                }
            );
            watch(
                () => v.value_2, (newVal, oldVal) => {     
                    if(oldVal){                        
                        detailData_JiSuan(obj_parent?obj_parent:formDataItem,item);
                    }
                }
            );
        });
        modalOpen1.value=true;
    } else {
        detailData_Old.value = [];
        detailData.value = []; 
    }
}

const savemodal=()=>{
    // console.log('detailData_Old',detailData_Old.value);
    // console.log('detailData',detailData.value); 
    let list=[];
    detailData.value.forEach(v=>{
        let oldObj=detailData_Old.value.find(x=>x.serial_num==v.serial_num && x.year==v.year && x.indicator_id==v.indicator_id);
        if(oldObj){
            if(v.value_1!=oldObj.value_1 || v.value_2!=oldObj.value_2 || v.value_3!=oldObj.value_3){
                let k_desc='';
                let old_value="";//旧值
                let new_value="";//新值
                if(v.indicator_data_type=='1' && indicator_data.value.indicator_id==v.indicator_id){
                    k_desc='由【value_1='+oldObj.value_1+',value_2='+oldObj.value_2+',value_3='+oldObj.value_3+'】'+
                        '修改为【value_1='+v.value_1+',value_2='+v.value_2+',value_3='+v.value_3+'】';
                    old_value=oldObj.value_3;
                    new_value=v.value_3;
                }
                else{
                    if(v.value_1!=oldObj.value_1){
                        k_desc='由【value_1='+oldObj.value_1+'】修改为【value_1='+v.value_1+'】';
                        old_value=oldObj.value_1;
                        new_value=v.value_1;
                    }
                    else if(v.value_2!=oldObj.value_2){
                        k_desc='由【value_2='+oldObj.value_2+'】修改为【value_2='+v.value_2+'】';
                         old_value=oldObj.value_2;
                        new_value=v.value_2;
                    }
                    else if(v.value_3!=oldObj.value_3){
                        k_desc='由【value_3='+oldObj.value_3+'】修改为【value_3='+v.value_3+'】';
                         old_value=oldObj.value_3;
                        new_value=v.value_3;
                    }                   
                }
                
                let obj={
                    info:{
                        k_desc:v.serial_num_name+'：'+k_desc,
                        year:v.year,
                        old_value:old_value,
                        value:new_value,
                        indicator_id:v.indicator_id,
                        remark:'按月修改数据',
                    },                    
                    zbtype:v.indicator_data_type,
                    value_1:v.value_1,
                    value_2:v.value_2,
                    value_3:v.value_3,
                    serial_num:v.serial_num,
                }  
                list.push(obj);                
            }
        }
    });
    if(list.length==0){
        message.info('数据未修改，无需保存！');
        return;
    }
    IndicatorApi.addReportingLog(list).then((res)=>{
        if(res.code==0){
            message.success('操作成功！');
            modalOpen1.value=false;
            let serial_num=19;//全年数据
            let obj_yearData=detailData.value.find(x=>x.serial_num==serial_num);
            let index=dataSource.value.findIndex(x=>x.indicator_id==obj_yearData.indicator_id);  
            let v=cols.value.find(x=>x.key==obj_yearData.year);   
            if(index>-1){                
                let item=dataSource.value[index];
                let after='';
                if(item[v.dataIndex].indexOf("%")>-1){
                    after='%';
                }
                else if(item[v.dataIndex].indexOf("‰")>-1){
                    after='‰';
                }
                else if(item[v.dataIndex].indexOf("‱")>-1){
                    after='‱';
                }
                else{
                    after='';
                }
                if(indicator_data.value.indicator_id==obj_yearData.indicator_id){
                    if(indicator_data.value.zbtype=='1'){
                        formData.value[v.dataIndex]=obj_yearData.value_3;
                        dataSource.value[index][v.dataIndex]=obj_yearData.value_3+after;
                    }
                    else{
                        formData.value[v.dataIndex]=obj_yearData.value_1;
                        dataSource.value[index][v.dataIndex]=obj_yearData.value_1+after;
                    }
                }
                else{
                    if(indicator_data.value.zbtype=='2'){
                        formData.value[v.dataIndex]=obj_yearData.value_1;
                        dataSource.value[index][v.dataIndex]=obj_yearData.value_3+after;
                    }
                    else if(indicator_data.value.zbtype=='3'){
                        formData.value[v.dataIndex]=obj_yearData.value_2;
                        dataSource.value[index][v.dataIndex]=obj_yearData.value_3+after;
                    }
                }
            }
            //console.log('obj_yearData',obj_yearData);
            if(obj_yearData.indicator_data_type=='1'){
                //比值需要更新分子分母
                let value_1=obj_yearData.value_1;
                let value_2=obj_yearData.value_2;
                let fz_indicator_id=obj_yearData.fz_indicator_id;
                let fm_indicator_id=obj_yearData.fm_indicator_id;
                if(fz_indicator_id){
                    let obj_fz=dataSource.value.find(x=>x.indicator_id==fz_indicator_id);
                    if(obj_fz){                        
                        let after='';
                        if(obj_fz[v.dataIndex].indexOf("%")>-1){
                            after='%';
                        }
                        else if(obj_fz[v.dataIndex].indexOf("‰")>-1){
                            after='‰';
                        }
                        else if(obj_fz[v.dataIndex].indexOf("‱")>-1){
                            after='‱';
                        }
                        else{
                            after='';
                        }
                        obj_fz[v.dataIndex]=value_1 +after;
                    }
                }
                if(fm_indicator_id){
                    let obj_fm=dataSource.value.find(x=>x.indicator_id==fm_indicator_id);
                    if(obj_fm){                        
                        let after='';
                        if(obj_fm[v.dataIndex].indexOf("%")>-1){
                            after='%';
                        }
                        else if(obj_fm[v.dataIndex].indexOf("‰")>-1){
                            after='‰';
                        }
                        else if(obj_fm[v.dataIndex].indexOf("‱")>-1){
                            after='‱';
                        }
                        else{
                            after='';
                        }
                        obj_fm[v.dataIndex]=value_2 +after;
                    }
                }
            }           

        }
        else{
            message.error(res.message);
        }
    });

}

//计算分子分母
const detailData_JiSuan=(formDataItem,item)=>{
    let list= detailData.value.filter(x=>parseInt(x.serial_num)<=12);//月度数据
    let zbtype=formDataItem.zbtype;//指标类型
    let relation_type=formDataItem.relation_type;//计算关系
    let join_condition=formDataItem.join_condition;//换算条件
    calculateResults(list,zbtype,join_condition,relation_type);
}

// 计算结果函数
function calculateResults(list,zbtype,join_condition,relation_type) {
                let monthlyData_fz = [];  
                let monthlyData_fm=[];     
                let monthlyData=[];         
                // 获取月度数据
                for (let i = 0; i < list.length; i++) {
                    let item=list[i];
                    if(zbtype=='1')
                    {
                        //分子
                        const fz = parseFloat(item.value_1) || 0;
                        //分母
                        const fm = parseFloat(item.value_2) || 0;
                        let val=0;
                        if(fm!=0){
                            if(relation_type==1){
                                val=fz+fm;
                            }
                            else if(relation_type==2){
                                val=fz-fm;
                            }
                            else if(relation_type==3){
                                val=fz*fm;
                            }
                            else if(relation_type==4){
                                val=fz/fm;
                            }
                            else{
                                val=fz/fm;
                            }
                            if(join_condition==2){
                                val=val*100;
                            }
                            else if(join_condition==3){
                                val=val*1000;
                            }
                            else if(join_condition==4){
                                val=val*10000;
                            }
                            val= Math.round(val*10000)/10000;
                        }
                        item.value_3=val;
                        monthlyData_fz.push(parseFloat(item.value_1) || 0);
                        monthlyData_fm.push(parseFloat(item.value_2) || 0);
                    }
                    else{
                        monthlyData.push(parseFloat(item.value_1) || 0);
                    }
                    
                }
                if(zbtype=='1'){
                    // 计算季度数据
                    const q1_fz = monthlyData_fz.slice(0, 3).reduce((sum, value) => sum + value, 0);
                    const q2_fz = monthlyData_fz.slice(3, 6).reduce((sum, value) => sum + value, 0);
                    const q3_fz = monthlyData_fz.slice(6, 9).reduce((sum, value) => sum + value, 0);
                    const q4_fz = monthlyData_fz.slice(9, 12).reduce((sum, value) => sum + value, 0);
                    // 计算半年度数据
                    const half1_fz = q1_fz + q2_fz;
                    const half2_fz = q3_fz + q4_fz;
                    
                    // 计算年度数据
                    const yearly_fz = half1_fz + half2_fz;

                    // 计算季度数据
                    const q1_fm = monthlyData_fm.slice(0, 3).reduce((sum, value) => sum + value, 0);
                    const q2_fm = monthlyData_fm.slice(3, 6).reduce((sum, value) => sum + value, 0);
                    const q3_fm = monthlyData_fm.slice(6, 9).reduce((sum, value) => sum + value, 0);
                    const q4_fm = monthlyData_fm.slice(9, 12).reduce((sum, value) => sum + value, 0);
                    // 计算半年度数据
                    const half1_fm = q1_fm + q2_fm;
                    const half2_fm = q3_fm + q4_fm;
                    
                    // 计算年度数据
                    const yearly_fm = half1_fm + half2_fm;

                    // 计算季度数据
                    const q1 = jisuan(q1_fz,q1_fm,join_condition,relation_type);
                    const q2 = jisuan(q2_fz,q2_fm,join_condition,relation_type);
                    const q3 = jisuan(q3_fz,q3_fm,join_condition,relation_type);
                    const q4 = jisuan(q4_fz,q4_fm,join_condition,relation_type);
                    // 计算半年度数据
                    const half1 = jisuan(half1_fz,half1_fm,join_condition,relation_type);
                    const half2 = jisuan(half2_fz,half2_fm,join_condition,relation_type);
                    
                    // 计算年度数据
                    const yearly = jisuan(yearly_fz,yearly_fm,join_condition,relation_type);
                    //计算季度和年度

                    detailData.value.filter(x=>parseInt(x.serial_num)==13).forEach(v=>{
                        v.value_1=q1_fz;
                        v.value_2=q1_fm;
                        v.value_3=q1;
                    });
                    detailData.value.filter(x=>parseInt(x.serial_num)==14).forEach(v=>{
                        v.value_1=q2_fz;
                        v.value_2=q2_fm;
                        v.value_3=q2;
                    });
                    detailData.value.filter(x=>parseInt(x.serial_num)==15).forEach(v=>{
                        v.value_1=q3_fz;
                        v.value_2=q3_fm;
                        v.value_3=q3;
                    });
                    detailData.value.filter(x=>parseInt(x.serial_num)==16).forEach(v=>{
                        v.value_1=q4_fz;
                        v.value_2=q4_fm;
                        v.value_3=q4;
                    });
                    detailData.value.filter(x=>parseInt(x.serial_num)==17).forEach(v=>{
                        v.value_1=half1_fz;
                        v.value_2=half1_fm;
                        v.value_3=half1;
                    });
                    detailData.value.filter(x=>parseInt(x.serial_num)==18).forEach(v=>{
                        v.value_1=half2_fz;
                        v.value_2=half2_fm;
                        v.value_3=half2;
                    });
                    detailData.value.filter(x=>parseInt(x.serial_num)==19).forEach(v=>{
                        v.value_1=yearly_fz;
                        v.value_2=yearly_fm;
                        v.value_3=yearly;
                    });

                }
                else{
                    // 计算季度数据
                    const q1 = monthlyData.slice(0, 3).reduce((sum, value) => sum + value, 0);
                    const q2 = monthlyData.slice(3, 6).reduce((sum, value) => sum + value, 0);
                    const q3 = monthlyData.slice(6, 9).reduce((sum, value) => sum + value, 0);
                    const q4 = monthlyData.slice(9, 12).reduce((sum, value) => sum + value, 0);
                    // 计算半年度数据
                    const half1 = q1 + q2;
                    const half2 = q3 + q4;
                    
                    // 计算年度数据
                    const yearly = half1 + half2;
                    //计算季度和年度

                    detailData.value.filter(x=>parseInt(x.serial_num)==13).forEach(v=>{
                        v.value_1=q1;
                    });
                    detailData.value.filter(x=>parseInt(x.serial_num)==14).forEach(v=>{
                        v.value_1=q2;
                    });
                    detailData.value.filter(x=>parseInt(x.serial_num)==15).forEach(v=>{
                        v.value_1=q3;
                    });
                    detailData.value.filter(x=>parseInt(x.serial_num)==16).forEach(v=>{
                        v.value_1=q4;
                    });
                    detailData.value.filter(x=>parseInt(x.serial_num)==17).forEach(v=>{
                        v.value_1=half1;
                    });
                    detailData.value.filter(x=>parseInt(x.serial_num)==18).forEach(v=>{
                        v.value_1=half2;
                    });
                    detailData.value.filter(x=>parseInt(x.serial_num)==19).forEach(v=>{
                        v.value_1=yearly;
                    });
                }
                
}
//计算公式
const jisuan=(value_1,value_2,join_condition,relation_type )=>{
                        //分子
                        const fz = parseFloat(value_1) || 0;
                        //分母
                        const fm = parseFloat(value_2) || 0;
                        let val=0;
                        if(fm!=0){
                            if(relation_type==1){
                                val=fz+fm;
                            }
                            else if(relation_type==2){
                                val=fz-fm;
                            }
                            else if(relation_type==3){
                                val=fz*fm;
                            }
                            else if(relation_type==4){
                                val=fz/fm;
                            }
                            else{
                                val=fz/fm;
                            }
                            if(join_condition==2){
                                val=val*100;
                            }
                            else if(join_condition==3){
                                val=val*1000;
                            }
                            else if(join_condition==4){
                                val=val*10000;
                            }
                            val= Math.round(val*10000)/10000;
                        }
                    return val;
}

//处理点击事件
const columnClick=(item,lx,index)=>{
    indicator_id.value=item.indicator_id;
    switch(lx){
        case 'edit':  
            let list=[];
            let formObj={indicator_id:item.indicator_id,zbdx:item.zbdx,zbtype:item.zbtype,relation_type:item.relation_type,join_condition:item.join_condition};
            cols.value.forEach(v=>{
                let after='';
                if(item[v.dataIndex].indexOf("%")>-1){
                    formObj[v.dataIndex]=item[v.dataIndex].replace('%','');
                    after='%';
                }
                else if(item[v.dataIndex].indexOf("‰")>-1){
                    formObj[v.dataIndex]=item[v.dataIndex].replace('‰','');
                    after='‰';
                }
                else if(item[v.dataIndex].indexOf("‱")>-1){
                    formObj[v.dataIndex]=item[v.dataIndex].replace('‱','');
                    after='‱';
                }
                else{
                    after='';
                    formObj[v.dataIndex]=item[v.dataIndex];
                }
                let obj={
                    type:'number',
                    label:v.title,
                    key:v.dataIndex,
                    keyValue:v.key,
                    disabled:item['sd'+v.key] ==1,//锁定年度数据
                    required: true,
                    placeholder:'请输入'+v.title+'数据',
                    desc:{
                        className:'form_desc',value:after,
                        afterinfo:{
                            click:true,
                            className:(item['sd'+v.key] ==1?'c_f00':''),
                            type:'link',
                            label:(item['sd'+v.key] ==1?'已锁定':'按月修改'),
                            click:(item_value,formDataItem)=>{
                                if(item['sd'+v.key] ==1){
                                    Modal.confirm({
                                        title: '查看'+v.title+'月度数据详情',
                                        content: h('div', {style:'padding-top:10px;color: #333;'}, [
                                            h('p', '当前年度数据已锁定，无法修改！点击确定查看月度数据详情。'),               
                                        ]),
                                        onOk() {                                        
                                            queryDetail(formDataItem,item_value);
                                        },
                                    });
                                    return;
                                }
                                else{
                                    let title='按月修改'+v.title+'数据';
                                    yearTitle.value=title;
                                    Modal.confirm({
                                        title: title,
                                        content: h('div', {style:'padding-top:10px;color: #333;'}, [
                                            h('p', '为保证数据准确性，月数据修改后，季度/年度数据会被覆盖！'),
                                            h('p', '修改月数据会自动汇总到季度/年度数据中，请谨慎操作！'),                                        
                                        ]),
                                        onOk() {                                        
                                            queryDetail(formDataItem,item_value);
                                        },
                                    });
                                }
                                
                            }
                        }},
                    max:99999999999,
                };
                list.push(obj);
                
            });
            //监听数据变化
            cols.value.forEach(v=>{
                watch(
                    () => formData.value[v.dataIndex], (newVal, oldVal) => {     
                        if(oldVal){
                            initChart();
                        }
                    }
                );
            })
            list.push({type:'textarea',label:'备注操作说明',key:'remark',placeholder:'请输入备注操作说明'});
            formData.value=formObj;
            formItemList.value=list;
            let title='编辑指标数据：';
            if(item.indicator_code_jc){
                title+=item.indicator_name_jc+'（'+item.indicator_code_jc+'）';
            }
            else{
                title+=item.indicator_name+'（'+item.indicator_code+'）'; 
            }            
            openModalFun({type:'form',title:title,width:700});
            let timer= setInterval(() => {
                 var chartDom = document.getElementById('main_echarts');
                 if(chartDom){
                    clearInterval(timer);
                    initChart();
                 }
            }, 100);
            break;
        case 'log':
            yearsList.value=cols.value.map(v=>{
                return v.key;
            });
            years.value=[...yearsList.value];
            let title1='查看操作日志：';
            if(item.indicator_code_jc){
                title1+=item.indicator_name_jc+'（'+item.indicator_code_jc+'）';
            }
            else{
                title1+=item.indicator_name+'（'+item.indicator_code+'）'; 
            }            
            queryDataLog();
            openModalFun({type:'log',title:title1,width:'70%'});
            break;
        case 'suoding':
            yearsList.value=cols.value.map(v=>{
                return v.key;
            });
            suodingFun(item);
            break;
        case 'jiesuo':
            yearsList.value=cols.value.map(v=>{
                return v.key;
            });
            jiesuoFun(item);
            break;
    }
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
    //console.log('formData',JSON.stringify(formData.value));
    let list=[];
    let indicator_id=formData.value.indicator_id;
    let oldObj=dataSource.value.find(x=>x.indicator_id==indicator_id);
    if(oldObj){
        list=cols.value.map(v=>{
            let newVal=formData.value[v.dataIndex];
            let oldVal="";
            if(oldObj[v.dataIndex].indexOf("%")>-1){
                oldVal=oldObj[v.dataIndex].replace('%','');
            }
            else if(oldObj[v.dataIndex].indexOf("‰")>-1){
                oldVal=oldObj[v.dataIndex].replace('‰','');
            }
            else if(oldObj[v.dataIndex].indexOf("‱")>-1){
                oldVal=oldObj[v.dataIndex].replace('‱','');
            }
            else{
                oldVal=oldObj[v.dataIndex];
            }
            if(newVal!=oldVal){
               return {
                    info:{
                        k_desc:v.title+'：由【'+oldVal+'】修改为【'+newVal+'】',
                        year:v.key,
                        old_value:oldVal,
                        value:newVal,
                        indicator_id:indicator_id,
                        remark:formData.value.remark,
                    },                    
                    zbtype:formData.value.zbtype,
                    value_1:(formData.value.zbtype=='1'?'':newVal),
                    value_2:'',
                    value_3:(formData.value.zbtype=='1'?newVal:''),
                    serial_num:'19',//全年数据
                }                 
            }
            return null;
        }).filter(x=>x);
    }
    if(list.length==0){
        message.info('数据未修改，无需保存！');
        return;
    }
    IndicatorApi.addReportingLog(list).then((res)=>{
        if(res.code==0){
            message.success('操作成功！');
            modalOpen.value=false;
            let index=dataSource.value.findIndex(x=>x.indicator_id==indicator_id);     
            if(index>-1){
                cols.value.forEach(v=>{
                    let item=dataSource.value[index];
                    let after='';
                    if(item[v.dataIndex].indexOf("%")>-1){
                        after='%';
                    }
                    else if(item[v.dataIndex].indexOf("‰")>-1){
                        after='‰';
                    }
                    else if(item[v.dataIndex].indexOf("‱")>-1){
                        after='‱';
                    }
                    else{
                        after='';
                    }
                    dataSource.value[index][v.dataIndex]=formData.value[v.dataIndex]+after;
                });
            }      
        }        
    }).catch((ex)=>{
             
    });
    
}
//锁定数据
const suodingFun=(item)=>{
    let title='';
    if(item.indicator_code_jc){
        title+=item.indicator_name_jc+'（'+item.indicator_code_jc+'）';
    }
    else{
        title+=item.indicator_name+'（'+item.indicator_code+'）'; 
    }            
    Modal.confirm({
        title: '温馨提示：是否要锁定？',
        icon: createVNode(QuestionCircleOutlined),
        content: h('div', {style:'padding-top:10px;color: #333;'}, [
            h('p', '指标数据:【'+title+'】？锁定后将无法修改！'),
            h('p', '锁定年份为：'+yearsList.value.join('年、')+'年，请谨慎操作！'),                                        
        ]),
        okText: '确认',
        cancelText: '取消',
        onOk() {
            let obj={indicator_id:item.indicator_id,years:yearsList.value};
            IndicatorApi.suoDingDetail(obj).then((res)=>{
                if(res.code==0){
                    message.success('操作成功！');
                    let fz_indicator_id=item.fz_indicator_id;
                    let fm_indicator_id=item.fm_indicator_id;
                    if(fz_indicator_id){
                        let obj_fz=dataSource.value.find(x=>x.indicator_id==fz_indicator_id);
                        if(obj_fz){
                            cols.value.forEach(v=>{
                                obj_fz['sd'+v.key]=1;
                            });
                        }
                    }
                    if(fm_indicator_id){
                        let obj_fm=dataSource.value.find(x=>x.indicator_id==fm_indicator_id);
                        if(obj_fm){
                            cols.value.forEach(v=>{
                                obj_fm['sd'+v.key]=1;
                            });
                        }
                    }
                    cols.value.forEach(v=>{
                        item['sd'+v.key]=1;
                    });
                }        
            }).catch((ex)=>{
                     
            });
        },
        onCancel() {},
    });
}
//解锁数据
const jiesuoFun=(item)=>{
    let title='';
    if(item.indicator_code_jc){
        title+=item.indicator_name_jc+'（'+item.indicator_code_jc+'）';
    }
    else{
        title+=item.indicator_name+'（'+item.indicator_code+'）'; 
    }            
    Modal.confirm({
        title: '温馨提示：是否要解锁？',
        icon: createVNode(QuestionCircleOutlined),
        content: h('div', {style:'padding-top:10px;color: #333;'}, [
            h('p', '指标数据:【'+title+'】？解锁后将允许修改！'),
            h('p', '解锁年份为：'+yearsList.value.join('年、')+'年，请谨慎操作！'),                                        
        ]),
        okText: '确认',
        cancelText: '取消',
        onOk() {
            let obj={indicator_id:item.indicator_id,years:yearsList.value};
            IndicatorApi.jieSuoDetail(obj).then((res)=>{
                if(res.code==0){
                    message.success('操作成功！');
                    let fz_indicator_id=item.fz_indicator_id;
                    let fm_indicator_id=item.fm_indicator_id;
                    if(fz_indicator_id){
                        let obj_fz=dataSource.value.find(x=>x.indicator_id==fz_indicator_id);
                        if(obj_fz){
                            cols.value.forEach(v=>{
                                obj_fz['sd'+v.key]=-1;
                            });
                        }
                    }
                    if(fm_indicator_id){
                        let obj_fm=dataSource.value.find(x=>x.indicator_id==fm_indicator_id);
                        if(obj_fm){
                            cols.value.forEach(v=>{
                                obj_fm['sd'+v.key]=-1;
                            });
                        }
                    }
                    cols.value.forEach(v=>{
                        item['sd'+v.key]=-1;
                    });

                    let indicator_id=item.indicator_id;
                    let obj_parent=dataSource.value.find(x=>
                        x.fm_indicator_id==indicator_id || x.fz_indicator_id==indicator_id
                    );
                    if(obj_parent){
                        cols.value.forEach(v=>{
                            obj_parent['sd'+v.key]=-1;
                        });
                    }

                }        
            }).catch((ex)=>{
                     
            });
        },
        onCancel() {},
    });
}
initCol();
const loading_obj=ref({
    spinning:false,
    tip:'操作中...'
});
//下载数据
async function downLoad(obj){    
    try {   
        loading_obj.value.tip="下载中..." ;
        loading_obj.value.spinning = true;
        IndicatorApi.downLoadReporting(obj,()=>{
            message.success('下载成功！');
            loading_obj.value.spinning = false;
        });        
    } catch (e) {
        console.log(e);
        message.error('下载失败！');
    } finally {
        
    }    
}

const clickDaoChu=(type)=>{
    //锁定导出
    let obj={
        ids:zb_value_OK.value.length>0?zb_value_OK.value.toString():'',
        years:valueYear.value.toString(),
        iszhangjie:checked.value?"1":"-1",
        issuoding:type,
    };
    downLoad(obj);
}



</script>

<style scoped>
 @import url('index.less');

</style>