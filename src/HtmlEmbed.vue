<!-- src/views/common/HtmlEmbed.vue -->
<template>
  <div class="html-embed-container">
    <!-- 嵌入 HTML 文件，src 为 HTML 的实际路径 -->
    <iframe 
      :src="htmlPath" 
      frameborder="0" 
      class="html-iframe"
    ></iframe>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

// 接收父组件传入的 HTML 路径
const props = defineProps({
  htmlPath: {
    type: String,
    required: true,
    description: '需要嵌入的 HTML 文件路径'
  }
})
</script>

<style scoped>
.html-embed-container {
  width: 100%;
  height: 100vh; /* 占满整个视口高度，可根据需求调整 */
  overflow: hidden;
}

.html-iframe {
  width: 100%;
  height: 100%;
}
</style>