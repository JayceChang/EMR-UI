<template>
  <div class="tableMain">
    <a-table :class="className" :columns="columns" :loading="loading" :data-source="dataSource" bordered :scroll="scroll" :size="props.size" 
    :pagination="pagination?pagination:false"
    :row-selection="rowSelection"
    :custom-row="customRow"
    @change="handleTableChange"
    :rowClassName="rowClassName"
    >
      <template #bodyCell="{ text, record, index, column}">
        <template v-if="column.operationData">
          <template v-for="(item,i) in column.operationData" :key="i">
            <a-dropdown size="small"  v-if="item.children">
                <template #overlay>
                    <a-menu>
                        <a-menu-item v-for="(obj,j) in item.children.filter(x=>x.is_hide!='1')" :key="j" @click="columnClick(record,obj.lx,index)">                             
                            <template #icon>
                              <component :is="$antIcons[obj.icon]" />
                            </template>
                            {{obj.label}}
                        </a-menu-item>                                         
                    </a-menu>
                </template>
                <a-button size="small" type="text">更多<DownOutlined /></a-button>
            </a-dropdown>
            <template v-else>
              <template v-if="item.display && item.displayValue == record[item.display]">
                <a-button size="small" :class="item.className"  v-if="item.click && item.is_hide!='1'" :type="item.type" :danger="item.danger" :ghost="item.ghost"  @click="columnClick(record,item.lx,index)">
                  <template #icon>
                      <component :is="$antIcons[item.icon]" />
                  </template>
                  {{item.label}}
                </a-button>
                <a-button size="small" :class="item.className"  v-else-if="item.is_hide!='1'" :type="item.type">{{item.label}}</a-button>
              </template>
              <template v-else-if="!item.display">
                <a-button size="small" :class="item.className"  v-if="item.click && item.is_hide!='1'" :type="item.type" :danger="item.danger" :ghost="item.ghost"  @click="columnClick(record,item.lx,index)">
                  <template #icon>
                      <component :is="$antIcons[item.icon]" />
                  </template>
                  {{item.label}}
                </a-button>
                <a-button size="small" :class="item.className"  v-else-if="item.is_hide!='1'" :type="item.type">{{item.label}}</a-button>
              </template>              
            </template>            
          </template>
        </template>
        <template v-else-if="column.dicData">
          <template v-if="column.dicData.findIndex(x=>x.value==text)>-1">            
            <a-tag v-if="column.dicData.find(x=>x.value==text).tag" :color=" column.dicData.find(x=>x.value==text).color ">
              {{ column.dicData.find(x=>x.value==text).label }}
            </a-tag>
            <span v-else-if="column.dicData.find(x=>x.value==text).color" :style="{color:column.dicData.find(x=>x.value==text).color}">
              {{ column.dicData.find(x=>x.value==text).label }}
            </span>
            <template v-else>
              {{ column.dicData.find(x=>x.value==text).label }}
            </template>
          </template>
          <span v-else>
            {{ text }}
          </span>
        </template>
        <template v-else-if="column.dicCompareData">
          <span v-if="column.dicCompareData(text)">       
            <a v-if="column.click" :class="column.className" @click="columnClick(record,column.dataIndex,index)" :style="{'color':column.dicCompareData(text).color}">{{ column.dicCompareData(text).label }}</a>
            <span v-else :class="column.className" :style="{'color':column.dicCompareData(text).color}">{{ column.dicCompareData(text).label }}</span>
          </span>
          <span v-else :class="column.className">
            {{ text }}
          </span>
        </template>
        <template v-else-if="column.progress">
          <a-progress :stroke-color="{'0%': '#108ee9','100%': '#87d068',}" :percent="text" size="small" />          
        </template>
        <template v-else-if="column.progress_steps">
          <a-progress :stroke-color="['#52c41a', '#52c41a','#9a11ba', '#9a11ba','#ffa816', '#ffa816', '#1677ff', '#1677ff','#f5222d', '#f5222d']" :steps="10" :percent="text" size="small">
            <template #format="percent">
              <span v-if="percent<30" style="color:#52c41a;">{{ percent }}</span>
              <span v-if="percent>=30&&percent<50" style="color:#9a11ba;">{{ percent }}</span>
              <span v-if="percent>=50&&percent<70" style="color:#ffa816;">{{ percent }}</span>
              <span v-if="percent>70&&percent<=90" style="color:#1677ff;">{{ percent }}</span>
              <span v-if="percent>90" style="color:#f5222d;">{{ percent }}</span>
            </template>
          </a-progress>
        </template>
        <template v-else-if="column.type=='select_data'">
            <a-select v-model:value="record[column.dataIndex]" allowClear placeholder="请选择" style="width:100%;">
                <a-select-option v-for="(select_data_obj,k) in column.selectData" :key="k" :value="select_data_obj.value">
                  {{select_data_obj.label}}
                </a-select-option>
            </a-select>
        </template>
        <template v-else-if="column.type=='select_tree'">          
          <TreeSelect v-if="column.showkey && record[column.showkey]"
              v-model:value="record[column.key]"
                      :apiUrl="column.apiUrl"
                      :apiFunc="column.apiFunc"
                      :apiParams="column.valueName?(record[column.valueName]?record[column.valueName]:-1):column.apiParams"
                      :fieldNames="column.fieldNames"
                      :sumName="column.sumName"
                      :multiple="column.multiple"
                      placeholder="请选择"
                      v-model:bindName="record[column.bindName]"
                      v-model:defaultValue="record[column.defaultKey]"
                      v-model:bindKey="record[column.bindKey]"
                      treeDefaultExpandAll
          />
        </template>
        <template v-else-if="column.color">
          <span :class="column.className" :style="{color:column.color}">  {{ text }}    </span>     
        </template>
        <template v-else-if="column.click">
          <a :class="column.className" @click="columnClick(record,column.dataIndex,index)">  {{ text }}    </a>     
        </template>
        <template v-else-if="column.tooltip">
          <a-tooltip :title="text" placement="topLeft">
            <span :class="column.className">  {{ text }}    </span>     
          </a-tooltip>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="js" setup>
import { ref,defineProps,computed } from 'vue';
import TreeSelect from '/@/components/form/tree-select.vue';
const emit = defineEmits(['columnClick','change',]);
const props = defineProps({
  columns: Object,
  dataSource:Object,
  scroll:Object,
  pagination:Object,
  loading:Object,
  rowSelection:Object,
  size:{
    type: String,
    default: 'small',
  }
})

const columnClick=(record,lx,index)=>{
  emit('columnClick',record,lx,index);  
}
// 分页变化处理
const handleTableChange = (pagination, filters, sorter, extra) => {
  emit('change',pagination, filters, sorter, extra);  
};
const rowIndex=ref(-1);

//单击选择
/* 自定义行属性 */
const customRow = (record,index) => {
  return {
    // 行点击事件
    onClick: (e) => {
      rowIndex.value=index;              
    }
  };
};
const rowClassName=(record,index)=>{
    if(index==rowIndex.value){
      return 'tableRefHover';
    }
    else{
      return 'table-row';
    }
};
</script>
<style scoped>

</style>
<style lang="less">
.table-row:hover{
    td{
      background-color:rgb(238, 251, 246) !important;
    }    
}
.tableRefHover{
  td.ant-table-cell{
      background-color:rgb(201, 247, 229) !important;      
  }    
  td:nth-child(1){
    border-left:solid 2px rgb(5, 218, 136);
  }
}

.table-row_yellow{
  .table-row:hover{
    td{
      background-color:rgb(251, 246, 238) !important;
    }    
  }
  .tableRefHover{
    td.ant-table-cell{
        background-color:rgb(247, 228, 201) !important;      
    }    
    td:nth-child(1){
      border-left:solid 2px rgb(218, 143, 5);
    }
  }
}

.table-row_red{
  .table-row:hover{
    td{
      background-color:rgb(251, 238, 238) !important;
    }    
  }
  .tableRefHover{
    td.ant-table-cell{
        background-color:rgb(247, 201, 201) !important;      
    }    
    td:nth-child(1){
      border-left:solid 2px rgb(218, 5, 5);
    }
  }
}



</style>