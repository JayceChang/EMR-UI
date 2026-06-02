<template>
    <div class="role_file_list">
        <div class="tree-header">
        <p>设置角色对应的文件权限</p>
        <a-button v-if="selectRoleId" type="primary" @click="saveRoleFile">
            <template #icon><PlusOutlined /></template>保存
        </a-button>
        </div>
        <div>
          <a-checkbox
            v-model:checked="state.checkAll"
            :indeterminate="state.indeterminate"
            @change="onCheckAllChange"
          >
            全选
          </a-checkbox>
        </div>
        <a-divider />
        <a-checkbox-group v-model:value="state.checkedList" :options="fileList" />
    </div>
</template>
<script setup>
  import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { FileApi } from '/@/api/file/file-api';
  let selectRoleId = inject('selectRoleId');
  watch(
    () => selectRoleId.value,
    () => queryRoleFile()
  );
  const fileList = ref([]);
  const fileList_value = ref([]);
  const queryfile_All=()=>{
    var k_park_parent_id=0;
    FileApi.queryfile(k_park_parent_id).then((res)=>{
        if(res.code==0){
            var list=[];         
            for(var i=0;i<res.data.length;i++){
                var item=res.data[i];
                list.push({
                  label:item.k_name,
                  value:item.id.toString(),
                })
                fileList_value.value.push(item.id.toString());
            }
            fileList.value=list;
        }
    }).catch((ex)=>{
            
    });
  }
  queryfile_All();
  const state = reactive({
    indeterminate: true,
    checkAll: false,
    checkedList: [],
  });
  const fileRoleForm=ref({
    id:'',
    k_file_info_ids:'',
    k_role_id:selectRoleId.value,
  });
  const queryRoleFile=()=>{
    FileApi.queryRoleFile(selectRoleId.value).then((res)=>{
        if(res.code==0){
          if(res.data.length>0){
            fileRoleForm.value=res.data[0];
            Object.assign(state, {
              checkedList: fileRoleForm.value.k_file_info_ids.split(','),
            });
          }
          else{
            fileRoleForm.value={
              id:'',
              k_file_info_ids:'',
              k_role_id:selectRoleId.value,
            };
            Object.assign(state, {
              checkedList: [],
            });
          }
        }
        else{
          Object.assign(state, {
            checkedList: [],
          });
        }
    }).catch((ex)=>{
      Object.assign(state, {
        checkedList: [],
      });
    });
  }
  queryRoleFile();
  const onCheckAllChange = e => {
    Object.assign(state, {
      checkedList: e.target.checked ? fileList_value.value : [],
      indeterminate: false,
    });
  };
  watch(
    () => state.checkedList,
    val => {
      state.indeterminate = !!val.length && val.length < fileList_value.value.length;
      state.checkAll = val.length === fileList_value.value.length;
    },
  );
  //保存数据
  const saveRoleFile=()=>{
    var k_file_info_ids=state.checkedList.toString();
    var k_role_id=selectRoleId.value;
    fileRoleForm.value.k_file_info_ids=k_file_info_ids;
    fileRoleForm.value.k_role_id=k_role_id;
    FileApi.addFileRoleFile(fileRoleForm.value).then((res)=>{
        if(res.code==0){
          message.success('操作成功！');
        }
    }).catch((ex)=>{
            
    });
  }
</script>
<style scoped >
.tree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    p {
      margin-bottom: 0;
    }
}
</style>
