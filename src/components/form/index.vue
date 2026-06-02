<template>
  <div>
    <a-form :model="formData"   
    class="ant-advanced-form"
    :label-col="labelCol" 
    :wrapper-col="{ span: 24 }"
    autocomplete="off"
    @finish="onFinish"
    @finishFailed="onFinishFailed">
      <a-row :gutter="24" class="form_row">
        <template v-for="item in formItemList" :key="item.key" >
          <a-col v-if="!item.hide" :span="item.cell?item.cell:(formProps.cell?formProps.cell:24)">
            <a-form-item :label="item.label" :name="item.key" v-if="isExist(item)"
            :rules="[{ required: item.required, message: item.label+'必填项不需为空！' }]">
                <template v-if="item.type=='input'">
                    <a-input v-model:value="formData[item.key]" :disabled="item.disabled || formProps.isView" :addon-before="item.before" :addon-after="item.after" />  
                </template>
                <template v-if="item.type=='textarea'">
                    <a-textarea v-model:value="formData[item.key]" :disabled="item.disabled || formProps.isView"/>
                </template>
                <template v-if="item.type=='select'">                 
                  <a-select v-model:value="formData[item.key]" 
                    :disabled="item.disabled || formProps.isView"
                    show-search
                    :allowClear="true"
                    placeholder="请选择"
                    :filter-option="filterOption"
                    :options="item.dicData?item.dicData:select_dicData[item.key]"/>
                </template>
                <template v-if="item.type=='select_multiple'">                 
                  <a-select v-model:value="select_Data[item.key]" 
                    :disabled="formProps.isView"
                    show-search
                    :allowClear="true"
                    placeholder="请选择"
                    :filter-option="filterOption"
                    mode="multiple"
                    @change="change(item.key)"
                    :options="item.dicData?item.dicData:select_dicData[item.key]"/>
                </template>
                <template v-if="item.type=='select_tree'">
                  <TreeSelect
                      v-model:value="formData[item.key]"
                      :apiUrl="item.apiUrl"
                      :apiFunc="item.apiFunc"
                      :apiParams="item.valueName?(formData[item.valueName]?formData[item.valueName]:-1):item.apiParams"
                      :fieldNames="item.fieldNames"
                      :sumName="item.sumName"
                      :multiple="item.multiple"
                      placeholder="请选择"
                      v-model:bindName="formData[item.bindName]"
                      v-model:defaultValue="formData[item.defaultKey]"
                      v-model:bindKey="formData[item.bindKey]"
                      treeDefaultExpandAll
                  />
                </template>
                <template v-if="item.type=='select_tree_multiple'">
                  <TreeSelect
                      v-model:value="multipleObj[item.key]"
                      :apiUrl="item.apiUrl"
                      :apiFunc="item.apiFunc"
                      :apiParams="item.valueName?(formData[item.valueName]?formData[item.valueName]:-1):item.apiParams"
                      :fieldNames="item.fieldNames"
                      :sumName="item.sumName"
                      :multiple="item.multiple"
                      placeholder="请选择"
                      v-model:bindName="formData[item.bindName]"
                      v-model:defaultValue="formData[item.defaultKey]"
                      v-model:bindKey="formData[item.key]"
                      treeDefaultExpandAll
                  />
                </template>
                <template v-if="item.type=='upload'">               
                  <UploadFile :name="item.key" 
                    :disabled="item.disabled || formProps.isView" 
                    :fileIdName="formData[item.show_name_key]" 
                    :fileIds="formData[item.show_key]" 
                    :multiple="false"
                    :clear="clearList[item.key]"
                    :accept="item.dicData[formData[item.bind_key]]"  
                    :show_name_key="item.show_name_key"
                    @beforeUpload="beforeUpload"/>                
                </template>
                <template v-if="item.type=='upload_multiple'">              
                  <UploadFile :name="item.key" 
                    :disabled="item.disabled || formProps.isView" 
                    :fileIdName="formData[item.show_name_key]" 
                    :fileIds="formData[item.show_key]" 
                    :multiple="true"
                    :clear="clearList[item.key]"
                    :accept="item.dicData[formData[item.bind_key]]"  
                    :show_name_key="item.show_name_key"
                    @beforeUpload="beforeUpload"/>                
                </template>
                <template v-if="item.type=='switch'">
                    <a-switch v-model:checked="formData[item.key]"  :disabled="item.disabled || formProps.isView"
                        :checkedValue="item.checkedValue"  
                        :unCheckedValue="item.unCheckedValue">
                        <template #checkedChildren>{{ item.checkedChildren }}</template>
                        <template #unCheckedChildren>{{ item.unCheckedChildren }}</template>
                    </a-switch>
                </template>
                <template v-if="item.type=='number'">
                    <a-input-number v-model:value="formData[item.key]" :disabled="item.disabled || formProps.isView"
                    :min="item.min?item.min:0" :max="item.max?item.max:999999"  />
                    <template v-if="item.desc">
                      <span :class="item.desc.className">{{item.desc.value}}</span>
                      <template v-if="item.desc.afterinfo">
                        <a-button size="small" 
                          :class="item.desc.afterinfo.className"
                          v-if="item.desc.afterinfo.click" 
                          :type="item.desc.afterinfo.type" 
                          :danger="item.desc.afterinfo.danger" 
                          :ghost="item.desc.afterinfo.ghost"  
                          @click="item.desc.afterinfo.click(item,formData)">
                          <template #icon>
                              <component :is="$antIcons[item.desc.afterinfo.icon]" />
                          </template>
                            {{item.desc.afterinfo.label}}
                        </a-button>                       
                        <span v-else  :class="item.desc.afterinfo.className">
                          {{item.desc.afterinfo.label}}
                        </span>
                      </template>      
                    </template>                    
                </template>             
                <template v-if="item.type=='date'">
                  <a-date-picker v-model:value="formData[item.key]" :disabled="item.disabled || formProps.isView" 
                    :valueFormat="dateFormat" :format="dateFormat" allowClear/>
                </template>         
                <template v-if="item.type=='datetime'">
                  <a-date-picker v-model:value="formData[item.key]" :disabled="item.disabled || formProps.isView" 
                    :valueFormat="dateTimeFormat" :format="dateTimeFormat" 
                    :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }" allowClear/>
                </template>                             
            </a-form-item>
          </a-col>            
        </template>
      </a-row>        
        <a-form-item v-if="!formProps.isView" :wrapper-col="{ span: 18, offset: 4 }" class="txt_right">
            <a-button type="primary" html-type="submit">{{formProps.labelButton?formProps.labelButton:'保存'}}</a-button>
            <a-button v-if="formProps.isModal" style="margin-left: 10px" @click="closeModalFun()">取消</a-button>
        </a-form-item>
    </a-form>
    <Loading :loading="loading"/>
  </div>
</template>
<script lang="js" setup>
import { ref,reactive,createVNode,defineProps,watch,watchEffect,computed } from 'vue';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import UploadFile from './upload.vue';
import Loading from '../loading/index.vue';
import { fileApi } from '/@/api/support/file-api';
import TreeSelect from '/@/components/form/tree-select.vue';
import { before } from 'lodash-es';
// 声明可触发的事件
const dateFormat = 'YYYY-MM-DD';
const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
const emit = defineEmits(['onSubmit','closeModalFun'])
const props = defineProps({ 
    formItemList: Object,
    formProps:Object,  
    formData:Object,
    labelWidth:Object,
})
const labelCol = {
  style: {
    width: (props.formProps.labelWidth?props.formProps.labelWidth+'px':'100px'),
  },
};
const formData=computed(() => {
  let data=props.formData; //动态属性
  return data;
});

const multipleObj=computed(() => {
  let data=props.formData; //动态属性
  let list=props.formItemList.filter(x=>x.type=='select_tree_multiple');
  let value={};
  for(var i=0;i<list.length;i++){
    var item=list[i];
    value[item.key]=data[item.key]?data[item.key].split(','):[];
  }
  return value;
});

//表单提交
const onFinish = async values => {
  onUploadFile();
};
const clearList=ref({});//清空数据
let fileList={};
let file_formData={};//key:[];
const beforeUpload=(formDataList,name,list,show_name_key)=>{ 
    fileList[name]=[];//文件
    file_formData[name]=[];//文件id
    if(list.length>0){
      list.forEach(element => {
        file_formData[name].push(element.uid);//已存在的文件值
      });      
    }
    if(formDataList.length>0){
        formData.value[show_name_key]=formDataList[0].fileName;//存在文件名称
        if(formData.value[name]==''){
          formData.value[name]='0';//存在文件
        }        
        fileList[name]=formDataList;
    }
    if(formDataList.length==0&&list.length==0){
      formData.value[name]='';//没有新添加的也没有已存在的
    }  
}
let fileList_sum={};
const onUploadFile=()=>{
  fileList_sum={};
  var keys=Object.keys(fileList);
  keys.forEach(key=>{
      const _fileList=fileList[key];
      if(_fileList.length>0){
        formData.value[key]='';
        fileList_sum[key]={
          num:_fileList.length,
          fileId:[],
        };
      }      
      _fileList.forEach(item=>{
        uploadFile(item.formData,key);
      });     
   });
   if(keys.length>0){
      //监听是否全部上传完成
      let bl=false;
      let timer=setInterval(() => {
          if(bl)
          {
            clearInterval(timer);
            //全部上传完成执行
            emit_onSubmit();
          }
          else{
            bl=submitFile();
          }
      }, 1000);
   }
   else{
      emit_onSubmit();
   }
}
//最终提交
const emit_onSubmit=()=>{
  var keys=Object.keys(file_formData);
  console.log('keys',keys);
  console.log('file_formData',file_formData);
  keys.forEach(key=>{
      formData.value[key]=file_formData[key].toString();//最终赋值文件ids
      delete fileList[key];//移除文件
      delete file_formData[key];//移除文件
      clearList.value[key]=!clearList.value[key];//清空数据
  });
  loading.value.spinning = false;    
  emit('onSubmit');
}

//执行上传过后的文件id 
const submitFile=()=>{
  const keys=Object.keys(fileList_sum);  
  for(var i=0;i<keys.length;i++){
    var key=keys[i];
    let obj=fileList_sum[key];
    if(obj.num!=obj.fileId.length){
      return false;  
    }
    else{
      obj.fileId.forEach(uid => {
        file_formData[key].push(uid);
      });      
    }
  }
  return true;  
}


const loading=ref({spinning:false,tip:'上传文件中'});
const uploadFile = (formDataFile,key) => {  
    try {
      loading.value={spinning:true,tip:'上传文件中'}
      fileApi.uploadFile(formDataFile, 1).then(res=>{
        let file = res.data;
        let fileId = file.fileId;
        fileList_sum[key].fileId.push(fileId);    
      });      
    } catch (error) {
      console.error('上传文件时发生错误:', error);
      message.error('上传文件时发生错误:'+error.msg);
      fileList_sum[key].fileId.push('');  
      loading.value.spinning = false;
    }
};

//表单验证失败
const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};
//表单取消
const closeModalFun=()=>{
    emit('closeModalFun')
}
//是否存在该属性
const isExist=(item)=>{
    if(item.exist){
       return formData.value[item.key]!='';
    }
    return true;
}
//筛选
const filterOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
//定义多选的值
const select_Data=ref({});
const select_dicData=ref({});
//表单渲染select的dicData值
const initSelectOptions=()=>{
  for(var i=0;i<props.formItemList.length;i++){
    var item=props.formItemList[i];
    if(item.dicDataurl){
      getUrlRequest(item);
    } 
    //多选的值
    if(item.type=='select_multiple'){
      setSelectValue(item.key);
    }   
  }
}
const setSelectValue=(key)=>{
  select_Data.value[key]=[];
}
const getUrlRequest=(item)=>{
  select_dicData.value[item.key]=[];
  //存在远程调用
  var url=item.dicDataurl.url;
  var params=item.dicDataurl.params;
  var label=item.dicDataurl.label;
  var value=item.dicDataurl.value;
  fileApi.getUrlRequest(url,params).then(res=>{
    if(res.code==0){
      var data=res.data;
      var list=[];
      data.forEach(element => {
            list.push({
              label:element[label],
              value:element[value],
            })
      });          
      select_dicData.value[item.key]=list;      
    }
  })
}
initSelectOptions();
const change=(key)=>{
  formData.value[key]=select_Data.value[key].toString();
}
const setFormData=()=>{
  var keys=Object.keys(select_Data.value);
  keys.forEach(key => {
    if(formData.value[key]){
      select_Data.value[key]=formData.value[key].split(',');
    }
    else{
      select_Data.value[key]=[];
    }
    
  });
}
setFormData();
//监听表单数据是否有变化
watch(formData,() => {
  setFormData();
});

</script>
<style>
.ant-advanced-form{
    position: relative;
}
.txt_right{
    text-align: right;
}
.c_red{
    color: red;
}
.form_desc{
  color: #666;
  margin-left: 5px;
  line-height: 26px;
}
</style>
