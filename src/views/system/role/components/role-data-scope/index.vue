<template>
  <div class="role-datascope-config">
    <!-- 头部操作区 -->
    <div class="header-section">
      <div class="header-title">
        <span class="title-text">角色数据权限配置</span>
        <a-tag color="blue" v-if="roleName">{{ roleName }}</a-tag>
      </div>
      <div class="header-actions">
        <a-space>
          <a-button type="primary" @click="addConfig" :icon="h(PlusOutlined)">
            添加配置
          </a-button>
          <a-button type="primary" @click="saveConfig" :icon="h(SaveOutlined)">
            保存配置
          </a-button>
          <a-button @click="resetConfig" :icon="h(ReloadOutlined)">
            重置
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 配置列表区 -->
    <div class="config-list" v-if="configForm.dataScopeConfigs.length > 0">
      <div v-for="(config, index) in configForm.dataScopeConfigs" :key="index" class="config-item">
        <div class="config-card">
          <div class="config-card-header">
            <div class="config-title">
              <a-tag color="green">{{ getDataScopeTypeName(config.dataScopeType) || '未设置' }}</a-tag>
            </div>
            <a-button type="text" danger size="small" @click="removeConfig(index)" :icon="h(DeleteOutlined)">
              删除
            </a-button>
          </div>
          
          <div class="config-card-body">
            <a-row :gutter="16">
              <a-col :span="12">
                <div class="form-item">
                  <label class="form-label">数据权限类型</label>
                  <a-select 
                    v-model:value="config.dataScopeType" 
                    placeholder="请选择数据权限类型"
                    size="small"
                  >
                    <a-select-option 
                      v-for="type in dataScopeTypes" 
                      :key="type.value" 
                      :value="type.value"
                    >
                      {{ type.name }}
                    </a-select-option>
                  </a-select>
                </div>
              </a-col>
              
              <a-col :span="12">
                <div class="form-item">
                  <label class="form-label">数据可见范围</label>
                  <a-select 
                    v-model:value="config.viewType" 
                    placeholder="请选择数据可见范围"
                    size="small"
                    @change="onViewTypeChange(config)"
                  >
                    <a-select-option 
                      v-for="viewType in viewTypes" 
                      :key="viewType.value" 
                      :value="viewType.value"
                    >
                      {{ viewType.desc }}
                    </a-select-option>
                  </a-select>
                </div>
              </a-col>
            </a-row>
            
            <!-- 指定部门选择 -->
            <div v-if="config.viewType === 3" class="form-item">
              <label class="form-label">指定部门</label>
              <a-tree-select
                v-model:value="config.departmentIds"
                :tree-data="departmentTree"
                multiple
                :show-checked-strategy="TreeSelect.SHOW_CHILD"
                placeholder="请选择部门"
                size="small"
                :field-names="{ label: 'name', value: 'departmentId', children: 'children' }"
                tree-checkable
                :max-tag-count="3"
              />
            </div>
            
            <!-- 指定用户选择 -->
            <div v-if="config.viewType === 4" class="form-item">
              <label class="form-label">指定用户</label>
              <a-select
                v-model:value="config.userIds"
                mode="multiple"
                placeholder="请选择用户"
                size="small"
                :filter-option="false"
                :show-search="true"
                @search="searchUsers"
                :max-tag-count="3"
              >
                <a-select-option 
                  v-for="user in userOptions" 
                  :key="user.employeeId" 
                  :value="user.employeeId"
                >
                  {{ user.actualName }}
                </a-select-option>
              </a-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <a-empty description="暂无数据权限配置">
        <a-button type="primary" @click="addConfig">添加第一个配置</a-button>
      </a-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h, inject, watch } from 'vue'
import { message, TreeSelect } from 'ant-design-vue'
import { PlusOutlined, SaveOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons-vue'

// 从父组件注入选中的角色ID
const selectRoleId = inject('selectRoleId')

// 响应式数据
const roleName = ref('')
const configForm = reactive({
  roleId: null,
  dataScopeConfigs: []
})

const dataScopeTypes = ref([
  { value: 1, name: '系统通知' },
  { value: 2, name: '员工管理' },
  { value: 3, name: '部门管理' },
  { value: 4, name: '业务数据' },
  { value: 5, name: '指标报告' },
  { value: 6, name: '消息管理' },
  { value: 7, name: '商品管理' },
  { value: 8, name: '分类管理' }
])

const viewTypes = ref([
  { value: 0, desc: '本人' },
  { value: 1, desc: '本部门' },
  { value: 2, desc: '本部门及下属子部门' },
  { value: 3, desc: '指定部门' },
  { value: 4, desc: '指定用户' },
  { value: 10, desc: '全部' }
])

const departmentTree = ref([])
const userOptions = ref([])

const loadRoleDataScopeConfig = async () => {
  if (!selectRoleId.value) {
    return
  }
  
  try {
    // 加载角色数据权限配置
    // const response = await getRoleDataScopeConfig(selectRoleId.value)
    // configForm.roleId = response.data.roleId
    // roleName.value = response.data.roleName
    // configForm.dataScopeConfigs = response.data.dataScopeConfigs || []
    
    // 模拟数据 - 根据不同角色ID显示不同的配置
    configForm.roleId = selectRoleId.value
    
    // 模拟不同角色的数据
    const mockRoleData = {
      1: {
        name: '超级管理员',
        configs: [
          {
            dataScopeType: 1,
            viewType: 10,
            departmentIds: [],
            userIds: []
          },
          {
            dataScopeType: 2,
            viewType: 10,
            departmentIds: [],
            userIds: []
          }
        ]
      },
      2: {
        name: '部门管理员',
        configs: [
          {
            dataScopeType: 2,
            viewType: 2,
            departmentIds: [],
            userIds: []
          },
          {
            dataScopeType: 5,
            viewType: 1,
            departmentIds: [],
            userIds: []
          }
        ]
      },
      3: {
        name: '普通用户',
        configs: [
          {
            dataScopeType: 5,
            viewType: 0,
            departmentIds: [],
            userIds: []
          }
        ]
      }
    }
    
    const roleData = mockRoleData[selectRoleId.value] || { name: `角色${selectRoleId.value}`, configs: [] }
    roleName.value = roleData.name
    configForm.dataScopeConfigs = [...roleData.configs]
    
    console.log(`加载角色 ${selectRoleId.value} 的数据权限配置:`, roleData)
  } catch (error) {
    console.error('加载配置失败:', error)
    message.error('加载配置失败')
  }
}

const loadDepartmentTree = async () => {
  try {
    // 加载部门树
    // const response = await getDepartmentTree()
    // departmentTree.value = response.data
    
    // 模拟部门树数据
    departmentTree.value = [
      {
        departmentId: 1,
        name: '总公司',
        children: [
          {
            departmentId: 2,
            name: '技术部',
            children: [
              { departmentId: 3, name: '前端组' },
              { departmentId: 4, name: '后端组' }
            ]
          },
          {
            departmentId: 5,
            name: '市场部',
            children: [
              { departmentId: 6, name: '销售组' },
              { departmentId: 7, name: '推广组' }
            ]
          }
        ]
      }
    ]
  } catch (error) {
    console.error('加载部门树失败', error)
  }
}

// 监听角色ID变化，加载对应的数据权限配置
watch(
  selectRoleId,
  () => {
    if (selectRoleId.value) {
      loadRoleDataScopeConfig()
    } else {
      // 清空数据
      roleName.value = ''
      configForm.roleId = null
      configForm.dataScopeConfigs = []
    }
  },
  { immediate: true }
)

// 方法
const getDataScopeTypeName = (value) => {
  const type = dataScopeTypes.value.find(t => t.value === value)
  return type ? type.name : '未知'
}

const addConfig = () => {
  if (!selectRoleId.value) {
    message.warning('请先选择角色')
    return
  }
  configForm.dataScopeConfigs.push({
    dataScopeType: null,
    viewType: null,
    departmentIds: [],
    userIds: []
  })
}

const removeConfig = (index) => {
  configForm.dataScopeConfigs.splice(index, 1)
}

const onViewTypeChange = (config) => {
  // 清空之前的选择
  config.departmentIds = []
  config.userIds = []
}

const searchUsers = async (query) => {
  if (query) {
    // 调用用户搜索API
    // const response = await searchEmployees({ keyword: query })
    // userOptions.value = response.data
    console.log('搜索用户:', query)
  }
}

const saveConfig = async () => {
  if (!selectRoleId.value) {
    message.warning('请先选择角色')
    return
  }
  
  // 验证配置数据
  if (configForm.dataScopeConfigs.length === 0) {
    message.warning('请至少添加一个数据权限配置')
    return
  }
  
  // 验证每个配置项是否完整
  for (let i = 0; i < configForm.dataScopeConfigs.length; i++) {
    const config = configForm.dataScopeConfigs[i]
    if (!config.dataScopeType) {
      message.warning(`第${i + 1}个配置的数据权限类型不能为空`)
      return
    }
    if (config.viewType === null || config.viewType === undefined) {
      message.warning(`第${i + 1}个配置的数据可见范围不能为空`)
      return
    }
    if (config.viewType === 3 && (!config.departmentIds || config.departmentIds.length === 0)) {
      message.warning(`第${i + 1}个配置选择了指定部门，但未选择具体部门`)
      return
    }
    if (config.viewType === 4 && (!config.userIds || config.userIds.length === 0)) {
      message.warning(`第${i + 1}个配置选择了指定用户，但未选择具体用户`)
      return
    }
  }
  
  try {
    // 构建保存数据
    const saveData = {
      roleId: selectRoleId.value,
      dataScopeConfigs: configForm.dataScopeConfigs
    }
    
    // 调用保存API
    // await configRoleDataScope(saveData)
    console.log('保存数据权限配置:', saveData)
    message.success('配置保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    message.error('配置保存失败')
  }
}

const resetConfig = () => {
  configForm.dataScopeConfigs = []
  loadRoleDataScopeConfig()
}

onMounted(() => {
  loadRoleDataScopeConfig()
  loadDepartmentTree()
})
</script>

<style scoped lang="less">
.role-datascope-config {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .header-section {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 16px;
    
    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .title-text {
        font-size: 16px;
        font-weight: 500;
        color: #262626;
      }
    }
    
    .header-actions {
      flex-shrink: 0;
    }
  }
  
  .config-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
      
      &:hover {
        background: #a8a8a8;
      }
    }
  }
  
  .config-item {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .config-card {
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: #fafafa;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
    }
    
    .config-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #e8e8e8;
      background: #fff;
      border-radius: 8px 8px 0 0;
      
      .config-title {
        display: flex;
        align-items: center;
      }
    }
    
    .config-card-body {
      padding: 16px;
      background: #fff;
      border-radius: 0 0 8px 8px;
      
      .form-item {
        margin-bottom: 16px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .form-label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #262626;
        }
        
        :deep(.ant-select),
        :deep(.ant-tree-select) {
          width: 100%;
        }
      }
    }
  }
  
  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
  }
}
</style>