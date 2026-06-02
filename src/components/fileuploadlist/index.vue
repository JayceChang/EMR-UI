<template>
    <div class="fileuploadlist">
        <a-form
            :model="formState"
            name="basic"
            :label-col="{ span: 3 }" 
            :wrapper-col="{ span: 20 }"
            autocomplete="off"
            @finish="onFinish"
            @finishFailed="onFinishFailed"
        >
            <a-form-item label="文件类型" name="file_lx">
                <a-select v-model:value="formState.file_lx" :options="options"/>
            </a-form-item>

            <a-form-item label="文件上传" name="file_list">
                <a-upload-dragger
                    v-model:fileList="fileList"
                    name="file"
                    :multiple="true"
                    :accept="formState.file_lx"
                    :before-upload="beforeUpload" 
                >
                    <p class="ant-upload-drag-icon">
                        <inbox-outlined/>
                    </p>
                    <p class="ant-upload-text">点击或拖动文件到此区域进行上传</p>
                    <p class="ant-upload-hint">
                        支持单个或批量上传。严格禁止上传非相关其他文件。
                    </p>
                </a-upload-dragger>
            </a-form-item>
            <a-form-item label="文件内容">
                <a-table :columns="columns" :data-source="dataSource" :pagination="false" size="small" bordered :scroll="{ y: 240 }">
                    <template #bodyCell="{ column, text, record }">
                        <template v-if="['k_name','k_desc', 'k_sort'].includes(column.dataIndex)">
                            <div>
                            <a-input
                                v-if="editableData[record.key]"
                                v-model:value="editableData[record.key][column.dataIndex]"
                                style="margin: -5px 0"
                            />
                            <template v-else>
                                {{ text }}
                            </template>
                            </div>
                        </template>
                        <template v-else-if="column.dataIndex === 'operation'">
                            <div class="editable-row-operations">
                            <span v-if="editableData[record.key]">
                                <a-button type="link" @click="save(record.key)">确定</a-button>
                                <a-popconfirm title="是否要取消操作?" @confirm="cancel(record.key)">
                                    <a-button type="text">取消</a-button>
                                </a-popconfirm>
                            </span>
                            <span v-else>
                                <a-button type="link" @click="edit(record.key)">编辑</a-button>
                                <a-button type="link" danger @click="edit(record.key)">删除</a-button>
                            </span>
                            </div>
                        </template>
                    </template>
                </a-table>
            </a-form-item>               
            <a-form-item  :wrapper-col="{ span: 18, offset: 4 }" class="txt_right">
                <a-button type="primary" html-type="submit">确定</a-button>
                <a-button v-if="formProps.isModal" style="margin-left: 10px" @click="closeModalFun()">取消</a-button>
            </a-form-item>                
        </a-form>

        <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel"
            :wrap-class-name="full_modal">
            <OfficePreview :fileInfo="fileInfo"/>
        </a-modal>
        <Loading :loading="loading"/>
    </div>
</template>
<script lang="js" setup>
import { cloneDeep } from 'lodash-es';
import { ref,reactive,createVNode,defineProps,watch,watchEffect } from 'vue';
import { file_class_init } from "/@/api/file/file-api-class";
import OfficePreview from "/@/components/officePreview/index.vue";
import { message } from 'ant-design-vue';
import { fileApi } from '/@/api/support/file-api';
import { FileApi } from '/@/api/file/file-api';
import Loading from '../loading/index.vue';
// 声明可触发的事件
const emit = defineEmits(['closeModalFun','pi_liang'])
const props = defineProps({ 
    formProps:Object,
    k_parent_id:Object,
})
const fileList=ref([]);
const formDataList=ref([]);//新上传的
const beforeUpload = file => {
  const formData = new FormData();
  formData.append('file', file);
  formDataList.value.push({
    fileName:file.name.split('.')[0],
    uid:file.uid,
    formData:formData
  });
  return false;
};
const data=[
            {
                lx:-1,
                label:'全部',
                value:'.jpg,.jpeg,.png,.txt,.doc,.docx,.xls,.xlsx,.pdf,.mp4,.ppt,.pptx'
            },
            {
                lx:1,
                label:'图片',
                value:'.jpg,.jpeg,.png'
            },
            {
                lx:2,
                label:'文本',
                value:'.txt'
            },
            {
                lx:3,
                label:'文档',
                value:'.doc,.docx'
            },
            {
                lx:4,
                label:'表格',
                value:'.xls,.xlsx'
            },
            {
                lx:5,
                label:'PDF文件',
                value:'.pdf'
            },
            {
                lx:6,
                label:'视频文件',
                value:'.mp4'
            },
            {
                lx:7,
                label:'PPT文件',
                value:'.ppt,.pptx'
            },
];
const options=ref(data);

const formState = reactive({
    file_lx: options.value[0].value,
});

const columns = [
  {
    key:'k_name',
    title: '文件名称',
    dataIndex: 'k_name',
    width: '150px',
  },
  {
    key:'k_desc',
    title: '文件描述',
    dataIndex: 'k_desc',
    width: '250px',
  },
  {
    key:'k_lx_name',
    title: '文件类型',
    dataIndex: 'k_lx_name',
    width: '80px',
  },
  {
    key:'k_sort',
    title: '文件排序',
    dataIndex: 'k_sort',
    width: '80px',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '100px',
  },
];
const dataSource = ref([]);
const _data=data.filter(x=>x.label!='全部');
const setFileList=()=>{
    var list=[];
    fileList.value.forEach(item => {
        var name_lx=item.name.split('.');
        var obj_lx=_data.find(x=>x.value.indexOf(name_lx[1])>-1);
        list.push({
            key:item.uid,
            k_name:name_lx[0],
            k_sort:'0',
            k_desc:'',
            k_lx_name: obj_lx?obj_lx.label:'未知',
            k_lx: obj_lx?obj_lx.lx:'-1',
        })
    });
    dataSource.value=list;
}
watch(fileList,()=>{
    setFileList();
})
//清空数据
const setClear=()=>{
    fileList.value=[];
    formDataList.value=[];
    dataSource.value=[];
}

const editableData = reactive({});
const edit = key => {
  editableData[key] = cloneDeep(dataSource.value.filter(item => key === item.key)[0]);
};
const save = key => {
  Object.assign(dataSource.value.filter(item => key === item.key)[0], editableData[key]);
  delete editableData[key];
};
const cancel = key => {
  delete editableData[key];
};

var uploadNum=0;
const onFinish = values => {
  if(formDataList.value.length==0){
    return;
  }
  loading.value={spinning:true,tip:'上传文件中'};  
  formDataList.value.forEach(item => {
     var formData=item.formData;
     var key=item.uid;
     uploadFile(formData,key,(key,file)=>{
        let fileId = file.fileId;
        onSubmit(key,fileId);
     });
  });
  var num=0;
  var timer= setInterval(() => {
    num++;
    if(uploadNum==formDataList.value.length){
      //已经上传完毕
      clearInterval(timer);
      loading.value={spinning:false};
      message.success('操作成功！');
      emit('pi_liang');
      setClear();
    }
    else if(num==60*5){
      //5分钟还未执行完成
      clearInterval(timer);
      loading.value={spinning:false};
    }
  }, 1000);
};
// 创建响应式类实例
const _file_class = reactive(file_class_init('file'));
const onSubmit=(key,fileId)=>{
  var obj=dataSource.value.find(x=>x.key==key);
  console.log('obj',obj);
  let item={
        id:'',
        k_name:obj.k_name,
        k_desc:obj.k_desc,
        k_sort:obj.k_sort,
        k_status:1,  
        k_parent_id:props.k_parent_id,
        k_lx:obj.k_lx,
        k_fileid:fileId,
        k_type:1,      
  };
  console.log('item',item);
  _file_class.init_class_data(_file_class.file_info,item);
  FileApi.addFileInfo(_file_class).then((res)=>{
        if(res.code==0){
          delete formDataList[key];//移除文件
          uploadNum++;        
        }        
  }).catch((ex)=>{
         
  });
}

//表单验证失败
const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};
//表单取消
const closeModalFun=()=>{
    emit('closeModalFun')
}
const loading=ref({spinning:false,tip:'上传文件中'});
const uploadFile = (formData,key,func) => {  
    try {      
      fileApi.uploadFile(formData, 1).then(res=>{
        let file = res.data;
        if(func){
          func(key,file);
        }
      });      
    } catch (error) {
      loading.value.spinning = false;
    }
};

const previewVisible = ref(false);
const previewTitle = ref('');
const fileInfo = ref({});
const full_modal=ref('file_view-modal');
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
const getBase64=(file)=> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
const handlePreview = async file => {
  if (!file.url && !file.preview) {
    file.preview = await getBase64(file.originFileObj);
  }
  //console.log(file);
  const { type, extension } = detectFileType(file.url);
  fileInfo.value = {
    'filePath':file.url || file.preview,
    'fileType':type
  }
  if(type=='image'){
    full_modal.value='';
  }
  else{
    full_modal.value='file_view-modal';
  }
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
/**文件类型转换 */
function detectFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const types = {
      // 图片
      jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', bmp: 'image', webp: 'image',
      // 文档
      pdf: 'pdf', 
      // 文本
      txt: 'text', csv: 'text', json: 'text', xml: 'text',
      // 压缩文件
      zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
      // 音视频
      mp3: 'audio', wav: 'audio', ogg: 'audio',
      mp4: 'video', webm: 'video', mov: 'video', avi: 'video',
      docx: 'docx',doc: 'doc',
      xlsx: 'xlsx',xls: 'xlsx',
      pptx: 'ppt',ppt: 'ppt',
    };
    
    return {
      extension,
      type: types[extension] || 'unknown'
    };
}
</script>
<style lang="less">
.fileuploadlist{
    .ant-upload-list{
        display: none;
    }
}
.file_view-modal {
  .ant-modal {
    min-width: 80%;
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    // left: 10%;    
    // margin: 0;
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
    overflow: auto;
  }
  .ant-modal-body {
    flex: 1;
    height: calc(100vh - 100px);
    overflow: auto;
  }
}
</style>