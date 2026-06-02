# ICD病种树形选择器组件

## 概述

`DiseaseTreeSelect` 是一个公共的ICD病种树形选择器组件，用于选择ICD病种类别、类目和亚目。该组件基于Ant Design Vue的TreeSelect组件封装，支持树形结构展示和搜索功能。

## 数据结构

组件展示的数据来自三张数据库表：

1. **xt_zd_jb_lb** - 病种类别（第一层，本身是树形章节结构）
2. **xt_zd_jb_lm** - 病种类目（第二层）
3. **xt_zd_jb_ym** - 病种亚目（第三层）

树形结构：
```
病种类别（category）
  └── 病种类目（item）
        └── 病种亚目（subitem）
```

## 后端API

### 接口地址
```
GET /system/disease/tree
```

### 响应数据格式
```json
{
  "code": 1,
  "data": [
    {
      "code": "A00-B99",
      "name": "某些传染病和寄生虫病",
      "type": "category",
      "parentCode": null,
      "sortOrder": 1,
      "children": [
        {
          "code": "A00-A09",
          "name": "肠道传染病",
          "type": "item",
          "parentCode": "A00-B99",
          "sortOrder": 1,
          "children": [
            {
              "code": "A00",
              "name": "霍乱",
              "type": "subitem",
              "parentCode": "A00-A09",
              "sortOrder": 1
            }
          ]
        }
      ]
    }
  ]
}
```

## 前端使用

### 基本用法

```vue
<template>
  <DiseaseTreeSelect
    v-model="diseaseCode"
    placeholder="请选择病种"
  />
</template>

<script setup>
import { ref } from 'vue';
import DiseaseTreeSelect from '/@/components/common/DiseaseTreeSelect.vue';

const diseaseCode = ref('');
</script>
```

### 完整示例

```vue
<template>
  <a-form-item label="ICD病种类目">
    <DiseaseTreeSelect
      v-model="filterParams.diseaseCode"
      placeholder="选择病种"
      :allow-clear="true"
      :show-search="true"
      :tree-default-expand-all="false"
      @change="handleDiseaseChange"
    />
  </a-form-item>
</template>

<script setup>
import { ref } from 'vue';
import DiseaseTreeSelect from '/@/components/common/DiseaseTreeSelect.vue';

const filterParams = ref({
  diseaseCode: ''
});

const handleDiseaseChange = (value, label, extra) => {
  console.log('选中的病种编码:', value);
  console.log('选中的病种名称:', label);
  console.log('额外信息:', extra);
};
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值（v-model） | String | '' |
| placeholder | 占位符 | String | '请选择病种' |
| disabled | 是否禁用 | Boolean | false |
| allowClear | 是否允许清除 | Boolean | true |
| showSearch | 是否支持搜索 | Boolean | true |
| treeDefaultExpandAll | 是否默认展开所有节点 | Boolean | false |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | (value: string) |
| change | 选择变化时触发 | (value: string, label: any, extra: any) |

## 图标说明

组件使用不同的图标来区分不同层级：

- 📁 **病种类别（category）** - 蓝色文件夹图标
- 📋 **病种类目（item）** - 绿色医疗文件图标
- 📄 **病种亚目（subitem）** - 灰色文件图标

## 后端实现

### 文件结构

```
MIS/sa-admin/src/main/java/net/lab1024/sa/admin/module/system/support/disease/
├── controller/
│   └── DiseaseController.java
├── service/
│   └── DiseaseService.java
├── dao/
│   └── DiseaseDao.java
└── domain/
    └── vo/
        └── DiseaseTreeVO.java

MIS/sa-admin/src/main/resources/mapper/system/support/disease/
└── DiseaseMapper.xml
```

### 核心逻辑

Service层负责构建三层树形结构：
1. 从数据库获取三张表的数据
2. 将亚目添加到对应的类目下
3. 将类目添加到对应的类别下
4. 构建类别的树形结构（类别本身有父子关系）

## 注意事项

1. 组件会在挂载时自动加载数据
2. 支持搜索功能，可以按病种名称搜索
3. 选中的值是病种编码（code字段）
4. 如果需要获取选中的病种名称，可以监听change事件
5. 组件使用了Ant Design Vue的TreeSelect，确保项目已安装相关依赖

## 维护说明

如果需要修改数据源或添加新的层级：

1. 修改 `DiseaseMapper.xml` 中的SQL查询
2. 更新 `DiseaseService.java` 中的树形构建逻辑
3. 如有需要，更新 `DiseaseTreeVO.java` 的字段定义
