/**
 * 指标配置 枚举
 *
 */

//指标类型
export const INDICATOR_TYPE_ENUM = {
  COMMON_INDICATOR: {
    value: 1,
    desc: '目录',
  },
  EYE_INDICATOR: {
    value: 2,
    desc: '指标',
  },
};

//指标导向
export const INDICATOR_ORIENTATION_ENUM = {
  MONITOR: {
    value: 1,
    desc: '监测比较',
  },
  ZHUBUTIGAO: {
    value: 2,
    desc: '逐步提高',
  },
  ZHUBUJIANGDI: {
    value: 3,
    desc: '逐步降低',
  },
  ZHUBUGAISHAN: {
    value: 4,
    desc: '逐步改善',
  },
};

// 指标值趋势
export const INDICATOR_TARGET_VALUE_ENUM = {
  UP: {
    value: 1,
    desc: '逐步提高',
  },
  DOWN: {
    value: 2,
    desc: '逐步降低',
  },
};

//定量、定性指标
export const INDICATOR_PROPERTY_ENUM = {
  QUANTITY: {
    value: 1,
    desc: '定量',
  },
  QUALITATIVE: {
    value: 2,
    desc: '定性',
  },
};

//指标采信属性
export const INDICATOR_CAIXIN_ENUM = {
  SCALE: {
    value: 1,
    desc: '规模类和配比类',
  },
  MONITOR: {
    value: 2,
    desc: '连续检测类',
  },
};

//指标采集类型
export const INDICATOR_FETCH_TYPE_ENUM = {
  AUTO: {
    value: 1,
    desc: '自动取数',
  },
  MANUAL: {
    value: 2,
    desc: '人工填报',
  },
};

//指标分类类型
export const INDICATOR_CATEGORY_ENUM = {
  ONE: {
    value: 1,
    desc: '一级指标',
  },
  TWO: {
    value: 2,
    desc: '二级指标',
  },
  THREE: {
    value: 3,
    desc: '三级指标',
  },
  FOUR: {
    value: 4,
    desc: '四级指标',
  },
};

//指标数据类型
export const INDICATOR_DATA_TYPE_ENUM = {
  BIZHI: {
    value: 1,
    desc: '比值',
  },
  FENZI: {
    value: 2,
    desc: '分子',
  },
  FENMU: {
    value: 3,
    desc: '分母',
  },
  SHUZHI: {
    value: 4,
    desc: '数值',
  },
  LVZHI: {
    value: 5,
    desc: '率值',
  },
};

//指标分子/分母取数类型
export const INDICATOR_FETCH_DATA_TYPE_ENUM = {
  MANUAL: {
    value: 1,
    desc: '手动取数',
  },
  AUTO_SQL: {
    value: 2,
    desc: 'SQL取数',
  },
  FORMULA: {
    value: 3,
    desc: '公式配置',
  },
};

//下面枚举值有一部分采用中文拼音的方式
export const INDICATOR_UNIT_ENUM = {
  BIZHI: {
    value: 1,
    desc: '比值(X:1)',
  },
  BAIFENBI: {
    value: 2,
    desc: '百分比',
  },
  QIANFENBI: {
    value: 3,
    desc: '千分比',
  },
  WANFENBI: {
    value: 4,
    desc: '万分比',
  },
  RENCI: {
    value: 5,
    desc: '人次',
  },
  LI: {
    value: 6,
    desc: '例',
  },
  GE: {
    value: 7,
    desc: '个',
  },
  MINUTE: {
    value: 8,
    desc: '分钟',
  },
  PERSON: {
    value: 9,
    desc: '人',
  },
  DAY: {
    value: 10,
    desc: '天',
  },
  YUAN: {
    value: 11,
    desc: '元',
  },
  TAICI: {
    value: 12,
    desc: '台次',
  },
  CHUANGRI: {
    value: 13,
    desc: '床日',
  },
  ZHANG: {
    value: 14,
    desc: '张',
  },
  // 下面为从医院实际使用到的单位进行补充的
  NONE: {
    value: 15,
    desc: '—',
  },
   ITEM: {
    value: 16,
    desc: '项',
  },
  DDDs: {
    value: 17,
    desc: 'DDDs',
  },
  DDD: {
    value: 18,
    desc: 'DDD',
  },
  ZHONG: {
    value: 19,
    desc: '种',
  },
  JI: {
    value: 20,
    desc: '级',
  },
  DBM_WY: {
    value: 21,
    desc: '吨标煤/万元',
  },
  DBM: {
    value: 22,
    desc: '吨标煤',
  },
  REVERSE_BZ: {
    value: 23,
    desc: '比值(1:X)',
  },
  PIAN: {
    value: 24,
    desc: '篇',
  },
  FZ: {
    value: 25,
    desc: '分值',
  },
  TAI: {
    value: 26,
    desc: '台',
  },
   TAO: {
    value: 27,
    desc: '套',
  },
};

//主要用作页面上对于单位的显示
export const INDICATOR_UNIT_VIEW_ENUM = {
  BIZHI: {
    value: 1,
    desc: '比值(X:1)',
  },
  BAIFENBI: {
    value: 2,
    desc: '%',
  },
  QIANFENBI: {
    value: 3,
    desc: '‰',
  },
  WANFENBI: {
    value: 4,
    desc: '‱',
  },
  RENCI: {
    value: 5,
    desc: '人次',
  },
  LI: {
    value: 6,
    desc: '例',
  },
  GE: {
    value: 7,
    desc: '个',
  },
  MINUTE: {
    value: 8,
    desc: '分钟',
  },
  PERSON: {
    value: 9,
    desc: '人',
  },
  DAY: {
    value: 10,
    desc: '天',
  },
  YUAN: {
    value: 11,
    desc: '元',
  },
  TAICI: {
    value: 12,
    desc: '台次',
  },
  CHUANGRI: {
    value: 13,
    desc: '床日',
  },
  ZHANG: {
    value: 14,
    desc: '张',
  },
  // 下面为从医院实际使用到的单位进行补充的
  NONE: {
    value: 15,
    desc: '',
  },
   ITEM: {
    value: 16,
    desc: '项',
  },
  DDDs: {
    value: 17,
    desc: 'DDDs',
  },
  DDD: {
    value: 18,
    desc: 'DDD',
  },
  ZHONG: {
    value: 19,
    desc: '种',
  },
  JI: {
    value: 20,
    desc: '级',
  },
  DBM_WY: {
    value: 21,
    desc: '吨标煤/万元',
  },
  DBM: {
    value: 22,
    desc: '吨标煤',
  },
  REVERSE_BZ: {
    value: 23,
    desc: '比值(1:X)',
  },
  PIAN: {
    value: 24,
    desc: '篇',
  },
  FZ: {
    value: 25,
    desc: '分值',
  },
  TAI: {
    value: 26,
    desc: '台',
  },
   TAO: {
    value: 27,
    desc: '套',
  },
};

//填报维度
export const REPORT_DIMENSION_ENUM = {
  MONTH: {
    value: 1,
    desc: '月',
  },
  QUARTER: {
    value: 2,
    desc: '季度',
  },
  HALF_YEAR: {
    value: 3,
    desc: '半年',
  },
  YEAR: {
    value: 4,
    desc: '年',
  },
};

//自评类型
export const ASSESSMENT_TYPE_ENUM = {
  COMPREHENSIVE_QUALITATIVE: {
    value: 1,
    desc: '评分制',
  },
  QUANTITATIVE_SCORING: {
    value: 2,
    desc: '符合程度判定制',
  },
};

//判定规则
export const JUDGMENT_RULE_ENUM = {
  INTERVAL_SCORING_LIMITED: {
    value: 1,
    desc: '全或无规则',
  },
  THRESHOLD_BASED: {
    value: 2,
    desc: '区间赋分兼顾持续改进规则',
  },
};

//公式结果下拉框
export const FORMULA_RESULT_SELECT_ENUM = {
  MEET: {
    value: 1,
    desc: '符合',
  },
  NOT_MEET: {
    value: 2,
    desc: '不符合',
  },
};

//汇总方式
export const AGGREGATION_METHOD_ENUM = {
  SUM: {
    value: 1,
    desc: '求和',
  },
  AVERAGE: {
    value: 2,
    desc: '平均值',
  },
  MAX: {
    value: 3,
    desc: '最大值',
  },
  MIN: {
    value: 4,
    desc: '最小值',
  },
  MIDDLE: {
    value: 5,
    desc: '中位数',
  },
  LAST_YEAR: {
    value: 6,
    desc: '最后一年',
  },
};

// 查询期间类型枚举
export const SEARCH_PERIOD_TYPE_ENUM = {
  YEAR: {
    value: 1,
    desc: '年度',
  },
  QUARTER: {
    value: 2,
    desc: '季度',
  },
  MONTH: {
    value: 3,
    desc: '月度',
  },
};

// 公式计算类型枚举
export const RELATION_TYPE_ENUM = {
  ADD: {
    value: 1,
    desc: '+',
  },
  MINUS: {
    value: 2,
    desc: '-',
  },
  MULTIPLY: {
    value: 3,
    desc: '*',
  },
  DIVIDE: {
    value: 4,
    desc: '/',
  },
};

// 公式计算条件枚举
export const JOIN_CONDITION_ENUM = {
  DEFAULT: {
    value: 1,
    desc: '* 1',
  },
  MULTIPLY_100: {
    value: 2,
    desc: '* 100%',
  },
  MULTIPLY_1000: {
    value: 3,
    desc: '* 1000%',
  },
  MULTIPLY_10000: {
    value: 4,
    desc: '* 10000%',
  },
};

//启用状态
export const ENABLE_TYPE_ENUM = {
  ENABLE: {
    value: 1,
    desc: '启用',
  },
  DISABLE: {
    value: 2,
    desc: '禁用',
  },
};

//开展状态
export const DEPLOYMENT_STATUS_TYPE_ENUM = {
  ENABLE: {
    value: 1,
    desc: '已开展',
  },
  DISABLE: {
    value: 2,
    desc: '未开展',
  },
};

//填报状态
export const FILL_STATUS_TYPE_ENUM = {
  ENABLE: {
    value: '1',
    desc: '已完成',
  },
  DISABLE: {
    value: '0',
    desc: '待填报',
  },
};

export default {
  INDICATOR_TYPE_ENUM,
  INDICATOR_ORIENTATION_ENUM,
  INDICATOR_TARGET_VALUE_ENUM,
  INDICATOR_UNIT_ENUM,
  INDICATOR_UNIT_VIEW_ENUM,
  INDICATOR_PROPERTY_ENUM,
  INDICATOR_CAIXIN_ENUM,
  INDICATOR_FETCH_TYPE_ENUM,
  INDICATOR_CATEGORY_ENUM,
  INDICATOR_DATA_TYPE_ENUM,
  INDICATOR_FETCH_DATA_TYPE_ENUM,
  REPORT_DIMENSION_ENUM,
  AGGREGATION_METHOD_ENUM,
  ASSESSMENT_TYPE_ENUM,
  JUDGMENT_RULE_ENUM,
  FORMULA_RESULT_SELECT_ENUM,
  SEARCH_PERIOD_TYPE_ENUM,
  RELATION_TYPE_ENUM,
  JOIN_CONDITION_ENUM,
  ENABLE_TYPE_ENUM,
  DEPLOYMENT_STATUS_TYPE_ENUM,
  FILL_STATUS_TYPE_ENUM,
};
