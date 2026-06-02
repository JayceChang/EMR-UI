import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDataStore = defineStore('dataStore', () => {
  const apiData=ref([]);
  const apiDataList = ref([]);  
  // 缓存请求的 Promise
  let fetchPromise = [];
  
  const fetchData = async (apiUrl,apiParams,apiFunc) => {
    let obj={
      apiUrl,
      apiParams,
      apiData,
    }
    // 如果数据已存在，直接返回
    if (apiDataList.value !== null) {
      let idx=apiDataList.value.findIndex(x=>x.apiUrl==obj.apiUrl && x.apiParams==obj.apiParams);
      if(idx>-1){
        apiData.value=apiDataList.value[idx].apiData;
        return apiData.value;
      }      
    }
    let promise_obj={
      apiUrl:obj.apiUrl,
      apiParams:obj.apiParams,
      apiPromise:null
    }
    // 如果请求正在进行，返回同一个 Promise
    let _idx=fetchPromise.findIndex(x=>x.apiUrl==obj.apiUrl && x.apiParams==obj.apiParams);
    if (_idx>-1){
      promise_obj=fetchPromise[_idx];
    } 
    else{      
      // 创建并存储请求 Promise
      // 根据 apiParams 类型调用 apiFunc
      if (apiParams === undefined) {
        promise_obj.apiPromise= apiFunc();
      } else if (Array.isArray(apiParams)) {
        promise_obj.apiPromise= apiFunc(...apiParams);
      } else {
        promise_obj.apiPromise= apiFunc(apiParams);
      }  
      fetchPromise.push(promise_obj);
    }
    
    try {      
      let res = await promise_obj.apiPromise;  
      // 等待请求完成
      if (res && res.data && Array.isArray(res.data)) {
        apiData.value =  res.data;
      } else if (Array.isArray(res)) {
        apiData.value =  res;
      } else {
        apiData.value = [];
      }  
      obj.apiData=apiData.value;
      apiDataList.value.push(obj);
      return apiData.value
    } catch (err) {
      throw err
    } finally {
    }
  }  

  // 手动实现重置函数
  const reset=()=> {
    apiData.value=[];
    apiDataList.value=[];
    fetchPromise=[];
  }
  return { apiData,apiDataList, fetchData,reset }
})