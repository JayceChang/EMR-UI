<template>
    <div class="upload">
      <a-upload-dragger
        v-model:fileList="fileList"
        :name="props.name"
        :disabled="disabled"
        list-type="picture"
        :accept="props.accept"
        :multiple="props.multiple"
        :before-upload="beforeUpload" 
        @remove="handleRemove"
        @preview="handlePreview"
      >
            <p class="ant-upload-drag-icon">
                <inbox-outlined/>
            </p>
            <p class="ant-upload-text">点击或拖动文件到此区域进行上传</p>
            <p class="ant-upload-hint" v-if="props.multiple">
                支持单个或批量上传。严格禁止上传非相关其他文件。
            </p>
            <p class="ant-upload-hint" v-else>
                仅支持单个上传。严格禁止上传非相关其他文件。
            </p>
      </a-upload-dragger>   
      <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel"
        :wrap-class-name="full_modal">
        <OfficePreview :fileInfo="fileInfo"/>
      </a-modal>
    </div>
    
</template>
<script lang="js" setup>
import { ref,reactive,createVNode,defineProps,watch,watchEffect } from 'vue';
import OfficePreview from "/@/components/officePreview/index.vue";
import { message } from 'ant-design-vue';
import { FileApi } from '/@/api/file/file-api';
// 声明可触发的事件
const emit = defineEmits(['beforeUpload']);
const props = defineProps({ 
    name:String,
    accept:String,
    disabled:Object,
    fileIds:Object,
    fileIdName:Object,
    clear:Boolean,
    multiple:Boolean,
    show_name_key:String,
})
let formDataList=[];//新上传的
let list=[];//原来就有的
const fileList=ref([]);//显示用的
const setList=(fileIds)=>{
  fileList.value=[];
  list=[];
  formDataList=[];
  if(fileIds!=''){
    if(fileIds=='0'){
      return;
    }
    const listIds=fileIds?[fileIds]:[];
    FileApi.getFileListByIds(listIds).then((res)=>{
      if(res.code==0){  
        let files=[];
        res.data.forEach(element => {
          files.push({
            uid: element.file_id,
            name: props.fileIdName,
            status: 'done',
            url: '/api/upload/'+element.file_key,
            thumbUrl: '/api/upload/'+element.file_key,
          })
        });
        fileList.value=files;
        list=files;
      }        
    }).catch((ex)=>{
    });
  } 
};
const setClear=(clear)=>{
  list=[];
  formDataList=[];
  fileList.value=[];
}
watchEffect(() => { 
    setList(props.fileIds);
    setClear(props.clear);
});

watch(()=>props.clear,()=>{
  setClear(props.clear);
})

//文件上传
const handleRemove = file => {
    let uid=file.uid;
    formDataList=formDataList.filter(x=>x.uid!=uid);
    list=list.filter(x=>x.uid!=uid);
    emit_beforeUpload();
};
const beforeUpload = file => {
  if(!props.multiple){
    //单选
    list=[];
    fileList.value=[];
    formDataList=[];
  }  
  const formData = new FormData();
  formData.append('file', file);
  formDataList.push({
    fileName:file.name.split('.')[0],
    uid:file.uid,
    formData:formData
  });
  emit_beforeUpload();  
  return false;
};
const emit_beforeUpload=()=>{  
  emit('beforeUpload',formDataList,props.name,list,props.show_name_key);
}
const getBase64=(file)=> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
const previewVisible = ref(false);
const previewTitle = ref('');
const fileInfo = ref({});
const full_modal=ref('file_view-modal');
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
const handlePreview = async file => {
  if (!file.url && !file.preview) {
    file.preview = await getBase64(file.originFileObj);    
  }

  if(!file.url){
    return;
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
.file_view-modal_share {
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
    height: calc(100vh - 0px);
    overflow: auto;
  }
}
</style>