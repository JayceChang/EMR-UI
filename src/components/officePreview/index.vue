<template>
	<div class="wrap" v-loading="loading">	
	    <vue-office-docx v-if="fileInfo.fileType === 'docx'" :src="fileInfo.filePath" style="height: 100%" @rendered="rendered" @error="HandlError"/>

      <vue-office-pdf v-if="fileInfo.fileType === 'pdf'" :src="fileInfo.filePath" style="height: 100%"  @rendered="rendered"  @error="HandlError"/>
      

      <vue-office-docx v-if="fileInfo.fileType === 'doc'" :src="'/test-api/api/Preview/PreviewWord?path='+fileInfo.filePath.replace('/api/','')" style="height: 100%" @rendered="rendered" @error="HandlError"/>

      <iframe v-if="fileInfo.fileType === 'doc1'" class="m-iframe" :src="'/word/index.html?file='+fileInfo.filePath" width="100%" height="98%"></iframe>
        
      <iframe v-if="fileInfo.fileType === 'xlsx'" class="m-iframe" :src="'/excel/index.html?file='+fileInfo.filePath" width="100%" height="98%"></iframe>


       <iframe v-if="fileInfo.fileType === 'ppt'" class="m-iframe" :src="'/ppt/index.html?file='+fileInfo.filePath" width="100%" height="98%"></iframe>
       
       <img alt="Preview" v-if="fileInfo.fileType === 'image'" style="max-width: 100%"  :src="fileInfo.filePath" @load="rendered" @error="HandlError" />

        <iframe v-if="fileInfo.fileType === 'text'" class="m-iframe"  :src="fileInfo.filePath" frameborder="0" width="100%" height="98%"></iframe>

	        
	   <video v-if="fileInfo.fileType === 'video' && fileInfo.filePath" style="margin: auto;display: block;" width="max-width: 100%;max-height: 100%" controls controlslist="nodownload">
	        <source :src="fileInfo.filePath"/>
	        下载点击<a :href="fileInfo.filePath">MP4</a>
      </video>
      
	  <audio v-if="fileInfo.fileType === 'audio' && fileInfo.filePath" controls controlsList="nodownload" style="max-width: 100%;max-height: 100%">
          <source :src="fileInfo.filePath" type="audio/mp3"/>
          您的浏览器不支持audio标签。
      </audio>
       
	</div>
</template>
<script setup>
import { ref,reactive,createVNode,defineProps,watch } from 'vue';
import VueOfficeDocx from "@vue-office/docx";
import VueOfficePdf from "@vue-office/pdf";
//引入相关样式
import "@vue-office/docx/lib/index.css";

const props = defineProps({
 fileInfo: {
    type: Object,
    required: true
  }
});

const loading = ref(true);
/** rendered：渲染完成后调用 */
const rendered = () => {
  loading.value = false;
};
/** HandlError ：渲染失败后调用 */
const HandlError = (errorInfo) => {
  // 假设你已经配置了全局的 toast
  alert("该文件暂不支持在线预览");
  loading.value = false;
};

</script>
<style scoped>
.wrap{
    height: 100%;
    width: 100%;
}
.m-iframe{
  border: 0px;
}
</style>
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
</style>
