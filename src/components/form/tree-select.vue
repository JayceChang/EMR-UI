<template>
  <a-tree-select    
    :value="props.value"
    :treeData="treeData"
    :fieldNames="props.fieldNames"
    :show-search="props.showSearch"
    :style="{ width: '100%', ...(props.style || {}) }"
    :dropdown-style="{ maxHeight: '400px', overflow: 'auto', ...(props.dropdownStyle || {}) }"
    :placeholder="props.placeholder"
    :allow-clear="props.allowClear"
    :name="props.name"
    :tree-default-expand-all="props.treeDefaultExpandAll"
    :tree-line="true"
    :multiple="props.multiple"
    showCheckedStrategy="TreeSelect.SHOW_ALL"
    :treeNodeFilterProp="props.treeNodeFilterProp || props.fieldNames.label"
    :loading="loading"
    :disabled="props.disabled"
    @change="treeSelectChange"
  />
</template>

<script setup>
  import { onMounted, ref, watch } from 'vue';
  import { smartSentry } from '/@/lib/smart-sentry'; // 引入错误捕获
  import { useDataStore } from '/@/store/modules/system/api-data.ts';
  const props = defineProps({
    // --- v-model ---
    value: [String, Number, Array], // 支持单选或多选的值
    defaultValue: [String, Number, Array], // 支持单选或多选的值
    bindName: [String, Number, Array], // 支持单选或多选的值
    bindKey: [String, Number, Array], // 支持单选或多选的值
    sumName: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    // --- Core Props for Generality ---
    /**
     * 获取树数据的异步函数 (例如: menuApi.queryMenuTree)
     * 要求：必须返回一个 Promise，resolve 的数据结构应为 { code: 0, data: [...] } 或直接是 [...]
     */
    apiFunc: {
      type: Function,
      required: true,
    },
    /**
     * 传递给 apiFunc 的参数 (可以是单个值、数组或对象)
     */
    apiParams: {
      type: [Object, Array, String, Number, Boolean],
      default: undefined,
    },
    /**
     * 字段名映射
     * @default { label: 'label', value: 'value', children: 'children', key: 'key' }
     */
    fieldNames: {
      type: Object,
      default: () => ({ label: 'label', value: 'value', children: 'children', key: 'key' }),
    },

    // --- Common a-tree-select Props ---
    placeholder: {
      type: String,
      default: '请选择',
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    showSearch: {
      type: Boolean,
      default: true, // 默认开启搜索
    },
    treeDefaultExpandAll: {
      type: Boolean,
      default: false, // 默认不展开所有
    },
    /**
     * 搜索时根据哪个属性过滤，默认为 fieldNames.label
     */
    treeNodeFilterProp: {
      type: String,
      default: '', // 默认为空，下面会处理成 fieldNames.label
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    style: {
      type: Object,
      default: () => ({}),
    },
    dropdownStyle: {
      type: Object,
      default: () => ({}),
    },
    /**
     * 是否在组件挂载后立即加载数据
     */
    loadDataOnMount: {
      type: Boolean,
      default: true,
    },
    /**
     * 组件name
     */
    name: {
      type: String,
      required: false,
      default: '',
    },
    apiUrl: {
      type: String,
      default: '',
    },
  });
  const dataStore = useDataStore();
  const emit = defineEmits(['change']);//'update:value', 'update:bindName',

  const dataList=ref([]);
  const treeData = ref([]);
  const loading = ref(false);
  async function fetchTreeData() {
    if (!props.apiFunc) {
      console.warn('GenericTreeSelect: apiFunc prop is required.');
      return;
    }
    loading.value = true;
    treeData.value = []; // 清空旧数据
    try {
      let apiData= await dataStore.fetchData(props.apiUrl,props.apiParams,props.apiFunc);
      // let obj1={
      //   apiUrl:props.apiUrl,
      //   apiParams:props.apiParams,
      //   apiData:apiData
      // }
      //console.log('obj1',obj1);
      treeData.value = apiData;
      setValue(apiData);
      if(!props.multiple){
        //没有找到
        if(dataList.value.findIndex(x=>x.value==props.value)<0){
            if(props.value){
              emit('update:defaultValue', props.value);
            }          
            if(dataList.value.findIndex(x=>x.value==props.defaultValue)>-1){       
                emit('update:value', props.defaultValue);
            }   
            else{
              emit('update:value', undefined);
            }   
        }
      }
    } catch (error) {
      smartSentry.captureError(error);
      console.log('GenericTreeSelect: Error fetching tree data:', error);
      treeData.value = []; // 出错时清空
    } finally {
      loading.value = false;
    }
  }
  const setValue=(data,dataList_value=[])=>{    
    for(var i=0;i<data.length;i++){
      dataList_value.push({
        label:data[i][props.fieldNames.label],
        value:data[i][props.fieldNames.value]
      });
      if(props.sumName){
        data[i][props.fieldNames.label]=data[i][props.fieldNames.label]+"["+data[i][props.fieldNames.value]+"]";
      }      
      if(data[i][props.fieldNames.children]){
        setValue(data[i][props.fieldNames.children],dataList_value);
      }
    }
    dataList.value=dataList_value;
  }

  // 监听 apiParams 变化，如果变化则重新加载数据 (可选，根据需要启用)
  watch(() => props.apiParams, () => {
    fetchTreeData();
  }, { deep: true });

  // 监听外部触发加载
  watch(
    () => props.loadDataOnMount,
    (newVal) => {
      if (newVal && treeData.value.length === 0) {
        fetchTreeData();
      }
    }
  );

  
  onMounted(() => {
    if (props.loadDataOnMount) {
      fetchTreeData();
    }
  });

  function treeSelectChange(selectedValue, label, extra) {
    emit('update:value', selectedValue);
    if(props.multiple){
      //多选
      let _labelList=[];
      for(var i=0;i<selectedValue.length;i++){
        let obj=dataList.value.find(x=>x.value==selectedValue[i]);
        let _label=undefined;
        if(obj){
          _label=obj.label;
        }
        //console.log('_label',_label);
        _labelList.push(_label);
      }
      emit('update:bindName',_labelList.toString());
    }
    else{
      let obj=dataList.value.find(x=>x.value==selectedValue);
      let _label=undefined;
      if(obj){
        _label=obj.label;
      }
      //console.log('_label',_label);
      emit('update:bindName',_label);
    }
    
      
    // 也 emit 一个原始的 change 事件，包含更多信息
    emit('change', selectedValue, label, extra, props.name);

    emit('update:bindKey',props.multiple?selectedValue.toString():selectedValue);
  }

  // 暴露给父组件调用的方法
  defineExpose({
    fetchTreeData, // 允许父组件手动刷新数据
  });
</script>

<style scoped>
  /* 可以添加一些通用的样式 */
</style>
