<template>
    <div class="">
         <!-- Search Form (from original component) -->
         <a-form size="small" layout="inline" :model="searchForm" class="search-form">
          <a-form-item label="操作内容" name="k_desc" class="search-form_item">
            <a-input v-model:value="searchForm.k_desc" allowClear placeholder="请输入关键字" style="width: 250px"/>
          </a-form-item>
          <a-form-item label="操作时间" name="k_create_times" class="search-form_item">
            <a-range-picker v-model:value="searchForm.k_create_times" :valueFormat="dateFormat" :format="dateFormat" allowClear/>
          </a-form-item>
          
          <a-form-item class="search-form_item">
            <a-space>
                <a-button type="primary" @click="searchQuery">
                    <template #icon><SearchOutlined /></template>
                    查询
                </a-button>
                <a-button @click="searchReset">
                    <template #icon><ReloadOutlined /></template>
                    重置
                </a-button>
            </a-space>
          </a-form-item>
        </a-form>
        <div class="file_main_table">
            <a-spin :spinning="loading">
                <TableIndex :columns="columnsLog" 
                    :dataSource="dataSource" 
                    :scroll="{y:500 }" 
                    :pagination="pagination" 
                    @columnClick="columnClick" 
                    @change="handleTableChange"/>
            </a-spin>
        </div> 
    </div> 
</template>
<script lang="js" setup>
import { ref,reactive,createVNode,watch,onMounted,computed } from 'vue';
import { message,Modal } from 'ant-design-vue';
import { IndicatorApi } from '/@/api/Indicator/Indicator-api';
import TableIndex from '/@/components/table/index.vue';
import { columnsLog } from './myTableColumns';
const props = defineProps({
    k_idp_id:String,
});
const searchForm=ref({});
const dateFormat = 'YYYY-MM-DD';
//当前时间
const currentDate = (num) => {
      const date = new Date();
      date.setDate(date.getDate()+num);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，需要+1
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
};
const loading=ref(false);
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100'],
});
const nowTime=currentDate(0);
const oldTime=currentDate(-30);
const searchReset=()=>{
    searchForm.value.k_idp_id=props.k_idp_id;
    searchForm.value.k_desc=undefined;
    searchForm.value.k_create_times=[oldTime,nowTime];
    pagination.current = 1;
    pagination.pageSize = 10;
    queryData();  
}
const dataSource=ref([]);

// 分页变化处理
const handleTableChange = (pag, filters, sorter, extra) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    queryData();
};

//查询数据库
async function queryData() {
    loading.value = true;
    try {
        searchForm.value.page_num= pagination.current;
        searchForm.value.page_size= pagination.pageSize;       
        let queryResult = await IndicatorApi.queryLog(searchForm.value);
        if (queryResult.ok && queryResult.data) {
            dataSource.value = queryResult.data.list || [];
            pagination.total = queryResult.data.total || 0;
        } else {
            dataSource.value = [];
            pagination.total = 0;
        }
    } catch (e) {
        dataSource.value = [];
        pagination.total = 0;
    } finally {
        loading.value = false;
    }
}
//搜索查询
const searchQuery=()=>{
    pagination.current = 1; // 重置到第一页
    queryData();
}
//监听是否变化执行操作
watch(()=>props.k_idp_id,searchReset);
searchReset();
//暴漏到父组件
defineExpose({
    searchReset
});
</script>
<style scoped>
 @import url('../css/Indicator.less');
</style>
