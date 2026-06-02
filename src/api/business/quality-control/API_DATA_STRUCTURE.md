# 质控系统 API 数据结构设计

## 1. 获取质控问题列表 API

### 请求接口
```
POST /business/quality-control/problems/list
```

### 请求参数
```json
{
  "status": "pending",           // 处理状态：pending(未处理), processed(已处理), all(全部)
  "type": "内容问题",            // 问题类型（可选）
  "departmentId": "001",         // 科室ID（可选）
  "doctorId": "DOC001",          // 医生ID（可选）
  "patientName": "李建国",       // 患者姓名（可选，模糊查询）
  "admissionNo": "ZY2023081501", // 住院号（可选）
  "startDate": "2023-08-01",     // 开始日期（可选）
  "endDate": "2023-08-31",       // 结束日期（可选）
  "current": 1,                  // 当前页码
  "pageSize": 10                 // 每页条数
}
```

### 响应数据结构
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 25,                 // 总记录数
    "current": 1,                // 当前页码
    "pageSize": 10,              // 每页条数
    "list": [
      {
        "id": 1,                           // 问题唯一ID
        "title": "主诉描述不完整",         // 问题标题
        "type": "内容问题",                // 问题类型
        "typeCode": "CONTENT_ISSUE",       // 问题类型编码
        "admissionNo": "ZY2023081501",     // 住院号
        "patientName": "李建国",           // 患者姓名
        "patientId": "P001",               // 患者ID
        "recordName": "入院记录",          // 病历名称
        "recordType": "ADMISSION",         // 病历类型编码
        "discoveryTime": "2023-08-15 09:23:00", // 发现时间
        "description": "患者主诉描述过于简略，未包含主要症状的持续时间和发展恶化情况，不符合病历书写规范要求。", // 问题描述
        "status": "pending",               // 处理状态：pending(未处理), processed(已处理), ignored(无需处理)
        "statusText": "未处理",           // 状态显示文本
        "severity": "medium",              // 严重程度：low(低), medium(中), high(高)
        "severityText": "中等",           // 严重程度显示文本
        "departmentId": "DEPT001",         // 科室ID
        "departmentName": "内科",          // 科室名称
        "doctorId": "DOC001",             // 责任医生ID
        "doctorName": "张医生",           // 责任医生姓名
        "createdBy": "SYSTEM",            // 创建者
        "createdTime": "2023-08-15 09:23:00", // 创建时间
        "updatedBy": "USER001",           // 最后更新者
        "updatedTime": "2023-08-15 10:30:00", // 最后更新时间
        "processedBy": null,              // 处理人ID（未处理时为null）
        "processedByName": null,          // 处理人姓名（未处理时为null）
        "processedTime": null,            // 处理时间（未处理时为null）
        "processRemark": null             // 处理备注（未处理时为null）
      }
    ]
  }
}
```

## 2. 获取病历详情 API

### 请求接口
```
GET /business/quality-control/medical-records/{problemId}
```

### 响应数据结构
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "problemId": 1,                    // 关联的问题ID
    "recordNo": "ZY2023081501",        // 病历号
    "patientInfo": {                   // 患者基本信息
      "patientId": "P001",
      "patientName": "李建国",
      "gender": "男",
      "genderCode": "M",
      "age": "65岁",
      "ageValue": 65,
      "ageUnit": "年",
      "admissionDate": "2023-08-12",
      "dischargeDate": null,           // 出院日期（住院中为null）
      "hospitalDays": 3,               // 住院天数
      "hospitalDaysText": "3天"
    },
    "medicalInfo": {                   // 医疗信息
      "departmentId": "DEPT001",
      "departmentName": "内科",
      "bedNo": "2 12床",
      "doctorId": "DOC001",
      "doctorName": "张医生",
      "attendingDoctorId": "DOC002",   // 主治医生ID
      "attendingDoctorName": "李主任", // 主治医生姓名
      "chiefDoctorId": "DOC003",       // 科主任ID
      "chiefDoctorName": "王主任"      // 科主任姓名
    },
    "recordContent": {                 // 病历内容
      "chiefComplaint": "发热、咳嗽、咳痰3天。", // 主诉
      "presentIllness": "患者3天前无明显诱因出现发热，体温最高达38.9℃，伴咳嗽、咳黄白色粘痰，量中等，不易咳出，无胸痛、胸闷、无呼吸困难，无恶心呕吐，无腹痛腹胀。自行口服"感冒药"（具体不详）后症状无明显缓解。为求进一步诊治，今日来我院就诊，门诊以"肺部感染"收入院。患者自发病以来，精神、食欲、睡眠尚可，大小便正常，体重无明显变化。", // 现病史
      "pastHistory": "既往体健，否认高血压、糖尿病、冠心病等慢性病史。否认肝炎、结核等传染病史及其密切接触史。", // 既往史
      "personalHistory": "生于原籍，无外地久居史，否认疫水接触史。", // 个人史
      "familyHistory": "否认家族遗传病史。",   // 家族史
      "physicalExam": "T: 38.5℃，P: 92次/分，R: 20次/分，BP: 130/85mmHg。一般情况：神志清楚，精神可，发育正常，营养中等，自主体位，查体合作。", // 体格检查
      "auxiliaryExam": "血常规：WBC 12.5×10^9/L，N 0.78，L 0.18。胸部X线：双肺纹理增粗。", // 辅助检查
      "diagnosis": [                   // 诊断信息
        {
          "type": "admission",         // 诊断类型：admission(入院), discharge(出院), differential(鉴别)
          "typeText": "入院诊断",
          "diagnoses": [
            {
              "order": 1,
              "name": "肺部感染",
              "icd10Code": "J44.1",
              "icd10Name": "急性加重的慢性阻塞性肺疾病"
            }
          ]
        }
      ],
      "treatment": "抗感染、化痰、对症支持治疗", // 治疗方案
      "medication": [                  // 用药记录
        {
          "drugName": "头孢曲松钠",
          "dosage": "2.0g",
          "frequency": "每日1次",
          "route": "静脉滴注",
          "duration": "7天",
          "startDate": "2023-08-12",
          "endDate": "2023-08-19"
        }
      ]
    },
    "problemHighlight": {              // 质控问题高亮信息
      "section": "chiefComplaint",     // 问题所在章节：chiefComplaint, presentIllness, physicalExam, diagnosis, medication
      "sectionText": "主诉",          // 章节显示名称
      "issue": "主诉描述不完整",       // 具体问题描述
      "highlightContent": "主诉描述过于简单，缺少症状持续时间的详细描述", // 高亮内容
      "suggestion": "建议补充症状的起始时间、持续时间、变化趋势等详细信息" // 改进建议
    },
    "qualityScore": {                  // 质控评分（可选）
      "totalScore": 85,                // 总分
      "maxScore": 100,                // 满分
      "scoreDetails": [               // 详细评分
        {
          "item": "主诉",
          "score": 15,
          "maxScore": 20,
          "deductionReason": "描述不够详细"
        },
        {
          "item": "现病史", 
          "score": 18,
          "maxScore": 20,
          "deductionReason": "时间逻辑存在矛盾"
        }
      ]
    }
  }
}
```

## 3. 处理质控问题 API

### 请求接口
```
PUT /business/quality-control/problems/handle
```

### 请求参数
```json
{
  "problemId": 1,                    // 问题ID
  "action": "resolve",               // 处理动作：resolve(已处理), ignore(无需处理)
  "remark": "已通知医生修改完成",    // 处理备注
  "operatorId": "USER001"            // 操作人ID
}
```

### 响应数据结构
```json
{
  "code": 200,
  "message": "处理成功",
  "data": {
    "problemId": 1,
    "status": "processed",
    "processedBy": "USER001",
    "processedByName": "张质控员",
    "processedTime": "2023-08-15 14:30:00",
    "processRemark": "已通知医生修改完成"
  }
}
```

## 4. 获取质控统计数据 API

### 请求接口
```
POST /business/quality-control/statistics
```

### 请求参数
```json
{
  "departmentId": "DEPT001",         // 科室ID（可选）
  "startDate": "2023-08-01",        // 开始日期
  "endDate": "2023-08-31"           // 结束日期
}
```

### 响应数据结构
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "summary": {                     // 汇总统计
      "totalProblems": 125,          // 总问题数
      "pendingProblems": 45,         // 待处理问题数
      "processedProblems": 65,       // 已处理问题数
      "ignoredProblems": 15,         // 无需处理问题数
      "processRate": 64.0            // 处理率（%）
    },
    "byType": [                      // 按问题类型统计
      {
        "type": "内容问题",
        "typeCode": "CONTENT_ISSUE",
        "count": 35,
        "percentage": 28.0
      },
      {
        "type": "逻辑问题",
        "typeCode": "LOGIC_ISSUE", 
        "count": 25,
        "percentage": 20.0
      }
    ],
    "byDepartment": [                // 按科室统计
      {
        "departmentId": "DEPT001",
        "departmentName": "内科",
        "totalCount": 45,
        "pendingCount": 15,
        "processedCount": 25,
        "ignoredCount": 5,
        "processRate": 66.7
      }
    ],
    "byDoctor": [                    // 按医生统计
      {
        "doctorId": "DOC001",
        "doctorName": "张医生",
        "departmentName": "内科",
        "totalCount": 12,
        "pendingCount": 3,
        "processedCount": 8,
        "ignoredCount": 1,
        "processRate": 75.0
      }
    ],
    "trendData": [                   // 趋势数据（按日期）
      {
        "date": "2023-08-01",
        "totalCount": 5,
        "pendingCount": 2,
        "processedCount": 3,
        "ignoredCount": 0
      }
    ]
  }
}
```

## 5. 字典数据 API

### 质控问题类型字典
```
GET /business/quality-control/problem-types
```

### 响应数据
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "code": "CONTENT_ISSUE",
      "name": "内容问题",
      "description": "病历内容描述不完整或不准确",
      "sort": 1,
      "enabled": true
    },
    {
      "code": "LOGIC_ISSUE", 
      "name": "逻辑问题",
      "description": "病历内容存在逻辑矛盾",
      "sort": 2,
      "enabled": true
    },
    {
      "code": "COMPLETENESS_ISSUE",
      "name": "完整性问题", 
      "description": "病历项目不完整或缺失",
      "sort": 3,
      "enabled": true
    },
    {
      "code": "DIAGNOSIS_ISSUE",
      "name": "诊断问题",
      "description": "诊断依据不充分或诊断不准确",
      "sort": 4,
      "enabled": true
    },
    {
      "code": "MEDICATION_ISSUE",
      "name": "用药问题",
      "description": "用药记录不规范或用药不合理",
      "sort": 5,
      "enabled": true
    }
  ]
}
```

## 6. 错误响应格式

```json
{
  "code": 400,                       // 错误码
  "message": "参数错误",             // 错误消息
  "data": null,                      // 错误时数据为null
  "errors": [                        // 详细错误信息（可选）
    {
      "field": "problemId",
      "message": "问题ID不能为空"
    }
  ]
}
```

## 7. 常用状态码说明

- `200`: 操作成功
- `400`: 请求参数错误
- `401`: 未认证或认证失败
- `403`: 无权限访问
- `404`: 资源不存在
- `500`: 服务器内部错误

## 8. 分页说明

所有列表查询接口都支持分页，使用统一的分页参数：
- `current`: 当前页码（从1开始）
- `pageSize`: 每页条数（建议默认10，最大100）

响应数据中包含分页信息：
- `total`: 总记录数
- `current`: 当前页码
- `pageSize`: 每页条数