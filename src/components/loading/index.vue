<template>
  <div class="loadingMain" v-if="loading.spinning">
    <a-spin :spinning="loading.spinning" :tip="loading.tip">
       <div class="loadingTip"></div>
    </a-spin>
  </div>
</template>
<script lang="js" setup>
import { ref,defineProps } from 'vue';
const props = defineProps({
    loading: Object,
})
// 声明可触发的事件
</script>
<style scoped>
.loadingMain{
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 99999;    
    top:0px;
    left: 0px;
}
.loadingMain .loadingTip{
    background-color: rgba(0,0,0,0.2);
    width: 100%;
    height: 100%;
    border-radius:8px;
}
</style>