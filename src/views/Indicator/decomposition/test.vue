<template>
    <div>
        <p>props.activeKey：{{ props.activeKey }}</p>
        <p>props.value：{{ props.modelValue }}</p>
        <a-button type="primary" @click="onClick">测试</a-button>
    </div>
</template>
<script setup>
import { ref,reactive,createVNode,watch,onMounted,computed,inject  } from 'vue';
const props=defineProps({
    activeKey:String,
    modelValue:String
});
const emit = defineEmits([]);//'update:value', 'update:bindName',
const onClick=()=>{
    let key='55';
    emit('update:activeKey','2');
    toggleTheme();
}
//接受最顶层组件传递的值
const { updateDataItem } = inject('updateDataItem')
// 使用注入的数据和方法 更新最顶层组件传递的值
const toggleTheme = () => {
    //theme.value='11111111';
    //或者
    //updateDataItem()
}
</script>