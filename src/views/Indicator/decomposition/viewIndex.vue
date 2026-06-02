<template>
    <div class="">
                        <a-descriptions bordered title="" size="small">
                            <template v-for="column in columns"  :key="column.dataIndex">
                                <a-descriptions-item  v-if="column.key!='operation'" :label="column.title">
                                    <template v-if="column.dicData">
                                        <span v-if="column.dicData.findIndex(x=>x.value==props.dataItem[column.dataIndex])>-1">            
                                            <a-tag v-if="column.dicData.find(x=>x.value==props.dataItem[column.dataIndex]).color" :color=" column.dicData.find(x=>x.value==props.dataItem[column.dataIndex]).color ">
                                            {{ column.dicData.find(x=>x.value==props.dataItem[column.dataIndex]).label }}
                                            </a-tag>
                                            <template v-else>
                                            {{ column.dicData.find(x=>x.value==props.dataItem[column.dataIndex]).label }}
                                            </template>
                                        </span>
                                        <span v-else>
                                            {{ props.dataItem[column.dataIndex] }}
                                        </span>
                                    </template>
                                    <template v-else-if="column.dicCompareData">
                                        <span v-if="column.dicCompareData(props.dataItem[column.dataIndex])">       
                                            <a v-if="column.click" @click="itemClick(column)" :style="{'color':column.dicCompareData(props.dataItem[column.dataIndex]).color}">{{ column.dicCompareData(props.dataItem[column.dataIndex]).label }}</a>
                                            <span v-else :style="{'color':column.dicCompareData(props.dataItem[column.dataIndex]).color}">{{ column.dicCompareData(props.dataItem[column.dataIndex]).label }}</span>
                                        </span>
                                        <span v-else>
                                            {{ props.dataItem[column.dataIndex] }}
                                        </span>
                                    </template>
                                    <template v-else-if="column.progress">
                                        <a-progress :stroke-color="{'0%': '#108ee9','100%': '#87d068',}" :percent="props.dataItem[column.dataIndex]" size="small" />          
                                    </template>
                                    <template v-else-if="column.progress_steps">
                                        <a-progress :stroke-color="['#52c41a', '#52c41a','#9a11ba', '#9a11ba','#ffa816', '#ffa816', '#1677ff', '#1677ff','#f5222d', '#f5222d']" :steps="10" :percent="props.dataItem[column.dataIndex]" size="small">
                                            <template #format="percent">
                                            <span v-if="percent<30" style="color:#52c41a;">{{ percent }}</span>
                                            <span v-if="percent>=30&&percent<50" style="color:#9a11ba;">{{ percent }}</span>
                                            <span v-if="percent>=50&&percent<70" style="color:#ffa816;">{{ percent }}</span>
                                            <span v-if="percent>70&&percent<=90" style="color:#1677ff;">{{ percent }}</span>
                                            <span v-if="percent>90" style="color:#f5222d;">{{ percent }}</span>
                                            </template>
                                        </a-progress>
                                    </template>
                                    <template v-else>
                                        {{ props.dataItem[column.dataIndex] }}
                                    </template>                        
                                </a-descriptions-item>
                            </template>
                        </a-descriptions>
                        <div class="text-align-right m_t_10" v-if="type=='my'">
                            {{ props.active_key }}
                            <a-space  wrap>
                                <a-button type="primary" v-if="props.dataItem.k_complete==0" @click="updateByk_complete">确认接受</a-button>
                                <template v-else-if="props.dataItem.k_complete==1">
                                    <a-button type="primary" @click="onClick_complete">提交进度</a-button>
                                    <a-button @click="$emit('setActiveKey','2')">查看提交进度</a-button>
                                </template>                               
                                <a-button type="primary" v-else-if="props.dataItem.k_complete==-1" @click="$emit('setActiveKey','4',{'complete':1,'repair':1,'log':1})">查看审核</a-button>
                                <a-button type="primary" v-else-if="props.dataItem.k_complete==2" @click="addRepairRemind">提醒进度审核</a-button>
                                <a-button type="primary" v-if="props.dataItem.k_end_date_delay_days>0" class="bg_c_b7058d" @click="onClick_delay">提交延期申请</a-button>
                            </a-space>
                        </div>
                        <div class="text-align-right m_t_10" v-if="type=='s_my' || type=='admin'">                           
                            <a-space  wrap>
                                <a-button type="primary" v-if="props.dataItem.k_complete==0" @click="addOkRemind">提醒确认</a-button>
                                <a-button type="text" class="bg_c_f1f1f1" v-if="props.dataItem.k_complete==1 || props.dataItem.k_complete==2" @click="$emit('setActiveKey','2')">查看提交进度</a-button> 
                                <a-button type="primary" v-if="props.dataItem.k_delay>0" @click="$emit('setActiveKey','3')">查看延期申请</a-button>     
                                <template v-if="props.dataItem.k_complete==2">
                                    <a-button type="primary" @click="onClick_complete_SH(1)">审核通过</a-button>
                                    <a-button type="primary" danger @click="onClick_complete_SH(-1)">审核不通过</a-button>
                                </template>     
                            </a-space>
                        </div>
         <!--弹窗-->
         <a-modal v-model:open="modalOpen" :title="modalObj.title" :footer="null" :maskClosable="false" :width="modalObj.width">
            <div class="model_info" v-if="modalObj.type=='add_complete'">
                <a-spin :spinning="spinning" tip="操作中...">
                    <FormIndex v-model:formData="formData" 
                    :formItemList="formItemList" 
                    :formProps="formProps"
                    @onSubmit="onSubmit"
                    @closeModalFun="closeModalFun"/>
                </a-spin>
            </div>        
            <div class="model_info" v-if="modalObj.type=='add_delay'">
                <a-spin :spinning="spinning" tip="操作中...">
                    <FormIndex v-model:formData="formData_delay" 
                    :formItemList="formItemList_delay" 
                    :formProps="formProps"
                    @onSubmit="onSubmit_delay"
                    @closeModalFun="closeModalFun"/>
                </a-spin>
            </div>           
        </a-modal>
    </div> 
</template>
<script lang="js" setup>
import { ref,reactive,createVNode,watch,onMounted, computed,inject } from 'vue';
import { message,Modal,Input } from 'ant-design-vue';
import { h } from 'vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { IndicatorApi } from '/@/api/Indicator/Indicator-api';
import FormIndex from '/@/components/form/index.vue';
import { columns } from './myTableColumns';
const props = defineProps({
    dataItem:Object,
    type:String,
});
const emit = defineEmits(['setActiveKey']);
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
//接受最顶层组件传递的值
const { updateDataItem } = inject('updateDataItem')
//同步页面数据
const update_dataItem=(res)=>{
    updateDataItem(res);   
}
//dataIndex: 'indicator_code',
const itemClick=(item)=>{
    if(item.dataIndex=='indicator_code'){
        //查看已关联的指标数据
        let query={'indicator':0};
        emit('setActiveKey','2_1',query);     
    }
}
//确认接受
async function updateByk_complete(){    
    let res = await IndicatorApi.updateByk_complete(props.dataItem.id);
    if(res.code==0){
        message.success('操作成功！');  
        update_dataItem(res);
        emit('setActiveKey','1',{'complete':1,'log':1});
    }        
}
// 显示多行文本框确认框
const showTextAreaConfirm = ({title,desc,success,required}) => {      
    Modal.confirm({
            title: title,
            width: 600,
            content: h('div', { class: 'modal-input' }, [
              h('p', desc),
              h(Input.TextArea, {
                id:'textArea',
                placeholder: '请输入内容...',
                rows: 4,
                style: { marginTop: '0px' }
              })
            ]),
            onOk() {
                return new Promise((resolve, reject) => {
                    const content = document.getElementById('textArea').value;
                    if(content=='' && required){
                        reject('请输入内容！');
                        message.warning('请输入内容！');
                    }
                    else{
                        resolve();
                        success(content);
                    }                
                });
                
            },
            onCancel() {
              
            },
            okText: '提交',
            cancelText: '取消'
    });
};    
//进度审核通过
async function updateByk_complet_success(content){
    let obj={
        k_idp_id:props.dataItem.id,
        k_status_desc:content,
    }
    let res = await IndicatorApi.updateByk_complet_success(obj);
    if(res.code==0){
        message.success('操作成功！');  
        update_dataItem(res);
        emit('setActiveKey','1',{'repair':1,'log':1});
    }        
}
//进度审核不通过
async function updateByk_complet_noSuccess(content){
    let obj={
        k_idp_id:props.dataItem.id,
        k_status_desc:content,
    }
    let res = await IndicatorApi.updateByk_complet_noSuccess(obj);
    if(res.code==0){
        message.success('操作成功！');  
        update_dataItem(res);
        emit('setActiveKey','1',{'repair':1,'log':1});
    }        
}   
//进度审核
async function onClick_complete_SH(type){    
    if(type==-1){
        let obj= {
            title:'完成进度审核不通过，是否确定此次操作?',
            desc:'请详细描述完成进度审核不通过原因：',
            required:true,
            success:(content)=>{
                updateByk_complet_noSuccess(content);
            }
        }
        showTextAreaConfirm(obj);
    }
    else if(type==1){
        let obj= {
            title:'完成进度审核通过，是否确定此次操作?',
            desc:'请详细描述通过原因或改进需求或意见：',
            required:false,
            success:(content)=>{
                if(content==''){
                    content='审核通过';
                }
                updateByk_complet_success(content);
            }
        }
        showTextAreaConfirm(obj);
        
    }    
}


//当前时间
const currentDate = (num) => {
      const date = new Date();
      date.setDate(date.getDate()+num);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，需要+1
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
};
const nowTime=currentDate(10);//默认申请延期是当前时间的10天
const spinning=ref(false);
const formData=ref({});
const formData_delay=ref({});
const init=()=>{
    formData.value={
        k_idp_id:props.dataItem.id,        
        k_value:props.dataItem.k_complete_value,
        k_desc:'',
        k_lx:1,
        k_fileid:'',
    };
    formData_delay.value={
        k_idp_id:props.dataItem.id,
        k_date:nowTime,
        k_desc:'',
    }
}
init();
watch(()=>props.dataItem,()=>{
    init();
})
const formProps=ref({isModal:true,isView:false,cell:24,labelWidth:110,labelButton:'提交'});
const formItemList=computed(()=> {
    return [
        {label:'上报进度(%)',key:'k_value',type:'number',min:props.dataItem.k_complete_value,max:100,
            desc:{
                value:'100%视为进度完成，将自动提交等待审核！',
                className:'form_desc',
            }
        },
        {label:'上报说明',key:'k_desc',type:'textarea',},
        {label:'附件类型',key:'k_lx',type:'select',dicData:[
            {
                value:1,
                label:'图片',
                accept:'.jpg,.jpeg,.png'
            },
            {
                value:2,
                label:'文本',
                accept:'.txt'
            },
            {
                value:3,
                label:'文档',
                accept:'.doc,.docx'
            },
            {
                value:4,
                label:'表格',
                accept:'.xls,.xlsx'
            },
            {
                value:5,
                label:'PDF文件',
                accept:'.pdf'
            },
            {
                value:6,
                label:'视频文件',
                accept:'.mp4'
            },
            {
                value:7,
                label:'PPT文件',
                accept:'.ppt,.pptx'
            },
        ]},
        {label:'附件上传',key:'k_file_ids',type:'upload_multiple',bind_key:'k_lx',show_key:'show_key',show_name_key:'show_name_key',
            dicData:{
                1:'.jpg,.jpeg,.png',
                2:'.txt',
                3:'.doc,.docx',
                4:'.xls,.xlsx',
                5:'.pdf',
                6:'.mp4',
                7:'.ppt,.pptx'
            }
        },
    ]
});


const formItemList_delay=[
    {label:'延期截至日期',key:'k_date',type:'date',},
    {label:'提交说明',key:'k_desc',type:'textarea',},
];


//提交进度
const onClick_complete=()=>{
    openModalFun({title:'新增提交进度',type:'add_complete'});
}
//表单提交
const onSubmit=()=>{  
    if(formData.value.k_value<=props.dataItem.k_complete_value){
        Modal.warning({
            title: '温馨提示',
            content: '提交当前完成进度需大于上次完成进度！',
        });
        return ;
    }
    spinning.value=true;   
    IndicatorApi.addComplete(formData.value).then((res)=>{
        if(res.code==0){
            message.success('操作成功！');
            update_dataItem(res);  
            spinning.value=false;   
            closeModalFun();   
            let query={'complete':1,'log':1};
            if(formData.value.k_value==100){
                query['repair']=1;
            }
            emit('setActiveKey','2',query);                   
        }        
    }).catch((ex)=>{
        spinning.value=false;   
    });
}
//提交延期申请
const onClick_delay=()=>{
    openModalFun({title:'提交延期申请',type:'add_delay'});
}
const onSubmit_delay=()=>{   
    spinning.value=true;   
    IndicatorApi.addDelay(formData_delay.value).then((res)=>{
        if(res.code==0){
            message.success('操作成功！');
            spinning.value=false;   
            closeModalFun();   
            emit('setActiveKey','3',{'delay':1,'log':1});                        
        }        
    }).catch((ex)=>{
        spinning.value=false;   
    });
}


async function addRepairRemind(){
    let res = await IndicatorApi.addRepairRemind(props.dataItem.id);
    if(res.code==0){
        message.success('操作成功！');  
        emit('setActiveKey','1',{'log':1});
    }        
}
async function addOkRemind(){
    let res = await IndicatorApi.addOkRemind(props.dataItem.id);
    if(res.code==0){
        message.success('操作成功！');  
        emit('setActiveKey','1',{'log':1});
    }        
}
</script>
<style scoped>
 @import url('../css/Indicator.less');
</style>
