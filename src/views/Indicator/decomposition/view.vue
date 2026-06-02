<template>
                <a-tabs v-model:activeKey="active_key">
                    <a-tab-pane key="1" tab="任务详情">                   
                        <ViewIndex 
                        @setActiveKey="setActiveKey"
                        :type="props.type" 
                        :data-item="props.dataItem"/>
                    </a-tab-pane>
                    <a-tab-pane key="2_1" tab="已关联指标">
                        <IndicatorIndex ref="indicator"  :type="props.type"  :indicator_code="props.dataItem.indicator_code"/>
                    </a-tab-pane>
                    <a-tab-pane key="2" tab="提交进度">
                        <CompleteIndex ref="complete"  :type="props.type"  :k_idp_id="props.dataItem.id" :k_complete="props.dataItem.k_complete"/>
                    </a-tab-pane>
                    <a-tab-pane key="3" tab="延期申请">
                        <DelayIndex ref="delay"  :type="props.type"  :k_idp_id="props.dataItem.id"/>
                    </a-tab-pane>
                    <a-tab-pane key="4" tab="审核记录">
                        <RepairIndex ref="repair"  :type="props.type"  :k_idp_id="props.dataItem.id" :k_complete="props.dataItem.k_complete"/>
                    </a-tab-pane>
                    <a-tab-pane key="5" tab="操作记录">
                        <LogIndex ref="log"  :type="props.type"  :k_idp_id="props.dataItem.id"/>
                    </a-tab-pane>
                </a-tabs>         
</template>

<script setup>
import { ref,reactive,createVNode,watch,onMounted,computed,inject,provide } from 'vue';
import { message,Modal } from 'ant-design-vue';
import LogIndex from './logIndex.vue';
import RepairIndex from './repairIndex.vue';
import ViewIndex from './viewIndex.vue';
import DelayIndex from './delayIndex.vue';
import CompleteIndex from './completeIndex.vue';
import IndicatorIndex from './indicatorIndex.vue';
const emit = defineEmits(['setActiveKey']);
const props = defineProps({
    dataItem:Object,
    type:String,
    active_key: {
        type: String,
        default: '1',
    },
});
const active_key=ref(props.active_key);
const activeReset=()=>{
    active_key.value=props.active_key;
}
//监听是否变化执行操作
watch(()=>props.active_key,activeReset);
watch(active_key,()=>{
     emit('update:active_key',active_key.value);
});
const complete=ref(null);
const log=ref(null);
const repair=ref(null);
const delay=ref(null);
const indicator=ref(null);

const setActiveKey=(key,query)=>{
    active_key.value=key;
    if(query){
        if (complete.value && query.complete) {
            complete.value.searchReset();
        }
        if (log.value && query.log) {
            log.value.searchReset();
        }
        if (repair.value && query.repair) {
            repair.value.searchReset();
        }
        if (delay.value && query.delay) {
            delay.value.searchReset();
        }
        if (indicator.value && query.indicator) {
            indicator.value.searchReset();
        }
    }    
}
//provide('theme',readonly(theme)) //注入依赖，用readonly修饰，不允许子组件修改值
// 提供响应式数据和更新方法 用于多层嵌套访问
provide('setActiveKey', {
    setActiveKey
})
</script>

<style lang="less" scoped>
 @import url('../css/Indicator.less');
</style>>