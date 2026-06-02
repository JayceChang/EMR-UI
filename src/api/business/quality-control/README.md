# 质控系统动态API集成使用说明

## 概述

我已经成功将质控系统页面从静态数据转换为动态API调用，并提供了完整的后端接口设计方案。

## 实现的功能

### 1. 前端动态API集成
- ✅ 替换了所有静态数据为动态API调用
- ✅ 添加了数据加载状态显示
- ✅ 实现了错误处理和fallback机制
- ✅ 保留了原有的左右联动功能
- ✅ 添加了质控问题处理功能

### 2. API接口设计
- ✅ 质控问题列表查询接口
- ✅ 病历详情查询接口  
- ✅ 质控问题处理接口
- ✅ 批量处理接口
- ✅ 统计数据接口

### 3. 数据结构设计
- ✅ 完整的JSON数据结构定义
- ✅ 请求参数和响应格式规范
- ✅ 错误处理和状态码定义
- ✅ 分页和字典数据支持

## 文件结构

```
src/
├── api/business/quality-control/
│   ├── quality-control-api.js          # API接口类
│   └── API_DATA_STRUCTURE.md           # 详细的JSON数据结构文档
└── views/business/demo/quality-result/
    └── index.vue                       # 质控页面组件（已更新为动态API）
```

## 核心API接口

### 1. 获取质控问题列表
```javascript
QualityControlApi.getQualityProblemList(params)
```

### 2. 获取病历详情
```javascript
QualityControlApi.getMedicalRecordDetail(problemId)
```

### 3. 处理质控问题
```javascript
QualityControlApi.handleQualityProblem(data)
```

### 4. 获取统计数据
```javascript
QualityControlApi.getQualityStatistics(params)
```

## 前端实现特性

### 数据管理
- **响应式数据**: 使用Vue 3 Composition API管理状态
- **计算属性**: 动态计算当前病历数据
- **数据缓存**: 避免重复加载已获取的病历数据

### 用户体验
- **加载状态**: 左右面板分别显示加载动画
- **空数据状态**: 无数据时显示友好提示
- **错误处理**: API失败时自动使用静态数据作为fallback
- **交互反馈**: 操作成功/失败的消息提示

### 功能特性
- **左右联动**: 点击问题自动加载对应病历
- **问题处理**: 支持"已处理"和"无需处理"操作
- **智能高亮**: 根据问题类型高亮对应病历部分
- **状态管理**: 实时更新问题处理状态

## 后端开发要求

### 必须实现的接口

1. **POST /business/quality-control/problems/list**
   - 获取质控问题列表（支持分页和筛选）

2. **GET /business/quality-control/medical-records/{problemId}**
   - 获取指定问题对应的病历详情

3. **PUT /business/quality-control/problems/handle**
   - 处理质控问题（已处理/无需处理）

### 可选实现的接口

1. **PUT /business/quality-control/problems/batch-handle**
   - 批量处理质控问题

2. **POST /business/quality-control/statistics**
   - 获取质控统计数据

3. **GET /business/quality-control/problem-types**
   - 获取问题类型字典

## 数据库表结构建议

### quality_problems 表（质控问题表）
```sql
CREATE TABLE quality_problems (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL COMMENT '问题标题',
  type VARCHAR(50) NOT NULL COMMENT '问题类型',
  type_code VARCHAR(50) NOT NULL COMMENT '问题类型编码',
  admission_no VARCHAR(50) NOT NULL COMMENT '住院号',
  patient_id VARCHAR(50) NOT NULL COMMENT '患者ID',
  patient_name VARCHAR(100) NOT NULL COMMENT '患者姓名',
  record_name VARCHAR(100) NOT NULL COMMENT '病历名称',
  record_type VARCHAR(50) NOT NULL COMMENT '病历类型编码',
  description TEXT COMMENT '问题描述',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '处理状态',
  severity VARCHAR(20) DEFAULT 'medium' COMMENT '严重程度',
  department_id VARCHAR(50) COMMENT '科室ID',
  doctor_id VARCHAR(50) COMMENT '责任医生ID',
  discovery_time DATETIME NOT NULL COMMENT '发现时间',
  created_by VARCHAR(50) NOT NULL COMMENT '创建者',
  created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_by VARCHAR(50) COMMENT '处理人ID',
  processed_time DATETIME COMMENT '处理时间',
  process_remark TEXT COMMENT '处理备注'
);
```

### medical_records 表（病历记录表）
```sql
CREATE TABLE medical_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  record_no VARCHAR(50) NOT NULL COMMENT '病历号',
  patient_id VARCHAR(50) NOT NULL COMMENT '患者ID', 
  admission_date DATE COMMENT '入院日期',
  discharge_date DATE COMMENT '出院日期',
  department_id VARCHAR(50) COMMENT '科室ID',
  doctor_id VARCHAR(50) COMMENT '医生ID',
  bed_no VARCHAR(20) COMMENT '床号',
  chief_complaint TEXT COMMENT '主诉',
  present_illness TEXT COMMENT '现病史',
  past_history TEXT COMMENT '既往史',
  physical_exam TEXT COMMENT '体格检查',
  auxiliary_exam TEXT COMMENT '辅助检查',
  diagnosis TEXT COMMENT '诊断',
  treatment TEXT COMMENT '治疗方案',
  created_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 开发注意事项

### 前端
1. 确保 `@/lib/axios` 中的axios配置正确
2. 需要在 `ant-design-vue` 中导入 `message` 组件
3. 错误处理使用了静态数据作为fallback，确保体验流畅

### 后端
1. 严格按照 `API_DATA_STRUCTURE.md` 中的数据格式返回
2. 实现proper的错误处理和状态码
3. 支持分页参数 `current` 和 `pageSize`
4. 确保病历数据的安全性和权限控制

## 测试建议

### 前端测试
1. 测试API正常调用的情况
2. 测试API失败时的fallback机制
3. 测试加载状态和空数据状态
4. 测试左右联动功能
5. 测试问题处理功能

### 后端测试
1. 测试各个接口的正常响应
2. 测试参数校验和错误处理
3. 测试数据权限和安全性
4. 测试并发访问和性能

## 后续扩展

1. **搜索和筛选**: 可以添加更多的查询条件
2. **数据导出**: 支持问题列表和统计数据导出
3. **实时通知**: 当有新问题时实时通知
4. **工作流**: 添加问题审核和流转功能
5. **报表统计**: 更丰富的统计图表和报表

## 联系方式

如有问题或需要技术支持，请联系开发团队。