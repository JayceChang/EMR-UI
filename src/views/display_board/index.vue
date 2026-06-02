<template>
     <!-- 数据展板 -->
    <div class="board">    
        <a-row :gutter="[10,10]">
            <a-col class="gutter-row" :span="19">
                <div class="row_info">
                    <div class="row_info_top">
                        <div class="row_info_top_title" v-if="1==2">{{ title }}</div>                          
                        <div>
                            <a-radio-group v-model:value="nowType" button-style="solid" @change="nowTypeChange">                                
                                <a-radio-button value="1">今年</a-radio-button>
                                <a-radio-button value="2">近四年</a-radio-button>
                                <a-radio-button value="3">自定义</a-radio-button>
                            </a-radio-group>
                        </div>
                        <div style='margin-left:10px;' v-if="nowType=='3'">
                            <a-date-picker v-model:value="nowDate" picker="year" placeholder="年份" style='width:70px;'
                            :valueFormat="dateFormat" :format="dateFormat" />
                        </div> 
                        <div class="row_info_top_desc">
                            <span style='color:#666;margin-left:10px;'>统计日期：</span>
                            <template v-if="nowType==2">
                                {{ nowDate-3 }}年 -
                            </template>
                            {{ nowDate }}年
                        </div>                   
                    </div>
                    <a-row :gutter="[10,10]">
                        <a-col :span="8" v-for="(item,key) in dataList" :key="key">
                            <a-card :title="item.indicator_name" :bordered="false">
                                <div class="display_flex m_0_-5">
                                    <div class="flex txt_center bg_color_1 m_0_5 p_5 bd-rd_5">
                                        <div>指标</div>
                                        <div>
                                            <span class="f_s_20 c_169600">{{item.zbnum}}</span>
                                            <span class="c_999">个</span>
                                        </div>
                                    </div>
                                    <div class="flex txt_center bg_color_2 m_0_5 p_5 bd-rd_5">
                                        <div>自动取数</div>
                                        <div>
                                            <span class="f_s_20 c_009688">{{item.qsnum}}</span>
                                            <span class="c_999">个</span>
                                        </div>
                                    </div>
                                    <div class="flex txt_center bg_color_3 m_0_5 p_5 bd-rd_5">
                                        <div>手工填报</div>
                                        <div>
                                            <span class="f_s_20 c_ff9c00">{{item.sgnum}}</span>
                                            <span class="c_999">个</span>
                                        </div>
                                    </div>
                                    <div class="flex txt_center bg_color_4 m_0_5 p_5 bd-rd_5">
                                        <div>异常指标</div>
                                        <div>
                                            <span class="f_s_20 c_f00">{{item.ycnum}}</span>
                                            <span class="c_999">个</span>
                                        </div>
                                    </div>
                                </div>                              
                                <div class="gutter-info-bottom">
                                    <div class="gutter-info-bottom-left">
                                        <div class="gutter-info-bottom-left-top">
                                            <div class="gutter-info-bottom-left-top-left c_999">
                                                取数完成进度
                                            </div>
                                            <div class="gutter-info-bottom-left-top-right">
                                               {{item.qscount}}个 | {{item.qsvalue}}% 
                                            </div>
                                        </div>
                                        <div class="gutter-info-bottom-left-bottom">
                                            <a-progress style='margin-bottom:0px;height: 15px;' :stroke-color="{'0%': '#009688','100%': '#009688',}" :percent="item.qsvalue" :showInfo="false" :size="progressValue" />                                            
                                        </div>
                                    </div>
                                    <div class="gutter-info-bottom-right">
                                        <div class="gutter-info-bottom-left-top">
                                            <div class="gutter-info-bottom-left-top-left c_999">
                                                手工完成进度
                                            </div>
                                            <div class="gutter-info-bottom-left-top-right">
                                               {{item.sgcount}}个 | {{item.sgvalue}}%
                                            </div>
                                        </div>
                                        <div class="gutter-info-bottom-left-bottom">
                                            <a-progress style='margin-bottom:0px;height: 15px;' :stroke-color="{'0%': '#ff9c00','100%': '#ff9c00',}" :percent="item.sgvalue" :showInfo="false" :size="progressValue" />                                            
                                        </div>
                                    </div> 
                                </div>
                            </a-card>
                        </a-col>                        
                    </a-row>              
                </div>                
            </a-col>
            <a-col class="gutter-row" :span="5">
                <div class="row_info info_bg_color_red" style="height:100%;">
                    <div class="row_info_top">
                        <div class="row_info_top_title" style="display:flex;">    
                           <span style="padding-right:5px;line-height:19px;"> 预警信息</span>                       
                           <a-badge :count="YC_total" :overflow-count="999"/>
                        </div>
                        <div class="row_info_top_desc">
                            <router-link to="/indicator/warning-query" class="c_f00" style="font-size:12px;">
                                更多<DoubleRightOutlined />
                            </router-link>
                        </div>
                    </div>
                    <div class="yc_info item_info">
                        <div style="margin-top:2px;" v-for="(item,key) in dataSource_YC" :key="key">
                                <a-divider v-if="key!=0" />
                                <div class="yc_info_item">
                                    <p class="lh_18"> {{ item.indicator }}</p>
                                    <div class="display_flex">
                                        <div class="">
                                            <a-tag v-if="item.status=='数据缺失'" color="orange">{{item.status}}</a-tag>
                                            <a-tag v-else color="red">{{item.status}}</a-tag>
                                        </div>
                                        <div class="flex txt_right c_666 lh_20">{{item.date}}</div>
                                    </div>
                                </div>                            
                        </div>                      
                    </div>
                </div>
            </a-col>            
            <a-col class="gutter-row info_bg_color-1" :span="12">
                <div class="row_info info_bg_color-1">
                    <div class="row_info_top">
                        <div class="row_info_top_title" style="display:flex;">    
                           <span style="padding-right:5px;line-height:19px;">科室手工填报进度</span>
                        </div>
                    </div>
                    <div style="margin-top:2px;">
                        <TableIndex size="middle" :columns="columnsTB" :dataSource="dataList_demp" :scroll="{x:500,y:210 }" @columnClick="columnClick" />
                    </div>
                </div>
            </a-col>
            <a-col class="gutter-row info_bg_color_yellow" :span="12">
                <div class="row_info info_bg_color_yellow">
                    <div class="row_info_top">
                        <div class="row_info_top_title" style="display:flex;">    
                           <span style="padding-right:5px;line-height:19px;"> 关注指标</span>  
                           <a-badge color="gold" text="gold" :count="total_GZ" :overflow-count="999"/>                     
                        </div>
                        <div class="row_info_top_desc">
                            <router-link to="/Indicator/attention/index" class="c_ff9c00" style="font-size:12px;">
                                更多<DoubleRightOutlined />
                            </router-link>
                        </div>
                    </div>
                    <div style="margin-top:2px;"> 
                        <TableIndex class="table-row_yellow" size="middle" :columns="columnsGZ" :dataSource="dataSource_GZ" :scroll="{y:210 }" @columnClick="columnClick" />
                    </div> 
                </div>
            </a-col>
        </a-row>
    </div> 
</template>
<script lang="js" setup>
import { ref,reactive,createVNode,watch,onMounted,computed } from 'vue';
import { useRouter } from 'vue-router'; // 引入 useRouter 函数
import { message,Modal } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { IndicatorApi } from '/@/api/Indicator/Indicator-api';
import { columnsTB,columnsGZ} from './tableColumns';
import TableIndex from '/@/components/table/index.vue';
const dateFormat="YYYY";
const router = useRouter(); // 使用 useRouter 函数获取 router 实例
//当前时间
const currentDate = (num) => {
      const date = new Date();
      date.setDate(date.getDate()+num);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，需要+1
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
};

const progressValue=ref(4);
let year=new Date().getFullYear();
const nowDate=ref(year.toString());//当前年份
const nowType=ref('1');//类型：今年/近四年
const dataList=ref([]);//指标数据
function getUrlParams(url) {
  const params = new URLSearchParams(url.split('?')[1]);
  const result = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}
//科室手工填报进度
const dataList_demp=ref([]);
async function viewByType(){
    try {
        if(!nowDate.value){
            return ;
        }
        let dates=nowDate.value;
        if(nowType.value=="2"){
            dates=((nowDate.value-3)+","+ dates)
        }    
        async  function init1(){
            let queryResult = await IndicatorApi.queryBoard({dates,type:0});
            if (queryResult.ok && queryResult.data) {
                let data=queryResult.data;
                let list=[{
                    indicator_name: (nowType.value=="2"? nowDate.value-3+'年 -':'')+nowDate.value+'年 汇总数据',
                    qscount:0,
                    qsnum:0,
                    sgcount:0,
                    sgnum:0,
                    zbnum:0,
                    zjnum:0,
                    ycnum:0,
                }];
                data.forEach(element => {
                    element.qsvalue=element.qsnum==0?0: parseInt(element.qscount*100/element.qsnum);
                    element.sgvalue=element.sgnum==0?0: parseInt(element.sgcount*100/element.sgnum);
                    list[0].qscount+=element.qscount;
                    list[0].qsnum+=element.qsnum;
                    list[0].sgcount+=element.sgcount;
                    list[0].sgnum+=element.sgnum;
                    list[0].zbnum+=element.zbnum;
                    list[0].zjnum+=element.zjnum;
                    list[0].ycnum+=element.ycnum;
                    list.push(element);
                });
                list[0].qsvalue=list[0].qsnum==0?0: parseInt(list[0].qscount*100/list[0].qsnum);
                list[0].sgvalue=list[0].sgnum==0?0: parseInt(list[0].sgcount*100/list[0].sgnum);
                dataList.value = list || [];            
            } else {
                dataList.value = [];
            }

        }    
        init1();
        async  function init2(){
            //科室手工填报进度
            let queryResult_demp = await IndicatorApi.queryBoard({dates,type:'department'});
            if (queryResult_demp.ok && queryResult_demp.data) {
                let data=queryResult_demp.data;
                let list=[];
                data.forEach(element => {
                    let idx=list.findIndex(item=>item.department==element.department);
                    if(idx>=0){
                       list[idx].zbcount+=element.num; 
                       if(element.istb==1){
                            list[idx].ycount=element.num;
                        }
                        else{
                            list[idx].nocount=element.num;
                        }
                        list[idx].jindu=parseInt(list[idx].ycount*100/list[idx].zbcount);
                    }
                    else{
                        let obj={
                            department:element.department,
                            zbcount:element.num,                            
                        };
                        if(element.istb==1){
                            obj.ycount=element.num;
                            obj.nocount=0;
                            obj.jindu=100;
                        }
                        else{
                            obj.nocount=element.num; 
                            obj.ycount=0;
                            obj.jindu=0;
                        }
                        list.push(obj);
                    }                    
                });
                dataList_demp.value = list || [];            
            } else {
                dataList_demp.value = [];
            }
        }
        init2();

    } catch (e) {
        console.log(e);
        dataList.value = [];
        dataList_demp.value = [];
    } finally {
        
    }
} 
viewByType();

const nowTypeChange=()=>{
    if(nowType.value=="1"){
        nowDate.value=year.toString();
        viewByType();
    }
    else if(nowType.value=="2"){
        nowDate.value=year.toString();
        viewByType();
    }
}

watch(nowDate,()=>{
    if(nowType.value=="3"){
        viewByType();
    }    
})

const loading_GZ=ref(false);
const dataSource_GZ=ref([]);
const total_GZ=ref(0);
//查询数据库
async function queryData_GZ() {
    loading_GZ.value = true;
    try {
        let queryResult = await IndicatorApi.queryAttention({isgz:1,page_num:1,page_size:10});
        if (queryResult.ok && queryResult.data) {
            let list=queryResult.data.list;
            dataSource_GZ.value = list || [];
            total_GZ.value = queryResult.data.total || 0;
        } else {
            dataSource_GZ.value = [];
            total_GZ.value = 0;
        }
    } catch (e) {
        dataSource_GZ.value = [];
        total_GZ.value = 0;
    } finally {
        loading_GZ.value = false;
    }
}
queryData_GZ();

const columnClick=(item,lx,index)=>{
    switch(lx){
        case 'indicator_name':  
                let code=item.indicator_code;
                let template=config.indicatorUrlTemplate;
                let values=[code];
                let openUrl=setOpenUrl(template,values);
                window.open(openUrl);    
            break;
        case 'ks_name':
                let department=item.department;
                let url_template="/indicator/report-query?department="+department;
                router.push(url_template);
            break;
    }
}
///动态设置openUrl
const setOpenUrl=(template,values)=>{
    // 使用正则替换 ${index} 为对应数组值
    return template.replace(/\$\{(\d+)\}/g, (match, index) => {
        return values[index] || ""; // 安全处理无效索引
    });
}
//异常数据
const dataSource_YC=ref([]);
const YC_total=ref(0);
async function queryData_YC() {
    try {
        let queryResult = await IndicatorApi.queryData_YC({pageNum:1,pageSize:10});
        if (queryResult.ok && queryResult.data) {
            let list=queryResult.data.list;
            dataSource_YC.value = list || [];
            YC_total.value=queryResult.data.total;

           //indicator_name:'20.'+i+'.国家基本药物配备使用金,国家基本药物配备使用金	',
            //lx:i%2+1,
            //date:'2025年第一季度',


        } else {
            dataSource_YC.value = [];
        }
    } catch (e) {
        dataSource_YC.value = [];
    } 
}
queryData_YC();
</script>
<style scoped>
 @import url('index.less');
.board{
    margin: 0px;
    padding:0px;
    border: 0px;
    padding-bottom:12px;
}
:deep(.ant-card){
    height:auto !important;
    background: linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, rgba(216, 244, 232, 0.3) 100%);
}
:deep(.ant-card-body){
    height:auto !important;
    overflow:visible !important;
    padding-bottom: 0px;
}
.row_info{
    background-color: #fff;
    border-radius: 5px;
    padding:10px;
}
.row_info_top{
    display: flex;
    margin-bottom:10px;
}
.row_info_top_title{
    font-weight:600;
    font-size:14px;
    padding-top: 5px;
    flex:1;
}
.row_info_top_desc{
    padding-top: 7px;
}
.gutter-info{
    padding:5px 5px;
}
.gutter-info-top{
    font-weight: 600;
    font-size: 13px;
    color:#323232;
}
.gutter-info-center{
    display: flex;
    margin-top:10px;
}
.gutter-info-center-left{
    flex:1;
    text-align: center;
    line-height: 53px;
}
.gutter-info-center-right{
    flex:1;
    text-align: center;
    position: relative;
}
.gutter-info-center-right-info{
    margin: auto;
    position:absolute;
    left:50%;
    top:50%;
    transform: translate(-50%,-50%);
}
.gutter-info-center-right-item{
    display: flex;
    height: 20px;
    line-height: 20px;
}
.gutter-info-center-right-item-center{
    text-align: center;
    width:30px;
}
.gutter-info-bottom{
    margin-top:10px;
    display:flex;
}
.gutter-info-bottom-left{
    flex:1;
    margin-right:5px;
    position: relative;
    padding-top: 15px;
    padding-bottom: -15px;
}
.gutter-info-bottom-right{
    flex:1;
    margin-left:5px;
    position: relative;
    padding-top: 15px;
    padding-bottom: -15px;
}
.gutter-info-bottom-left-top{
    display:flex;
    position: absolute;
    top: 0px;
    font-size:11px;
    width:100%;
}
.gutter-info-bottom-left-top-left{
    flex:1;
}

</style>
