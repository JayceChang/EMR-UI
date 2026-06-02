<!--
  * 简化版判定公式编辑器 - 专为表格使用设计
  * 
  * @Author:    Claude 4.0 sonnet
  * @Date:      2025-07-12
  * @Copyright  ZDS
-->
<template>
  <div class="formula-editor-simple">
    <!-- 紧凑工具栏 -->
    <div class="compact-toolbar">
      <a-button-group size="small">
        <a-button v-for="op in quickOps" :key="op.value" @click="insertText(op.value)" :title="op.desc">
          {{ op.label }}
        </a-button>
      </a-button-group>
      
      <a-select
        v-model:value="selectedVariable"
        placeholder="变量"
        style="width: 80px"
        size="small"
        @change="insertVariable"
        :options="variableOptions"
      />
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <a-textarea
        ref="textareaRef"
        v-model:value="formulaText"
        :placeholder="placeholder"
        :readonly="readonly"
        :rows="2"
        @input="handleInput"
        @keydown="handleKeydown"
        :class="{ 'error': hasError }"
      />
      
      <!-- 验证提示 -->
      <div v-if="validationMessage" class="validation-tip" :class="{ 'error': hasError }">
        {{ validationMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  variables: {
    type: Array,
    default: () => [
      { label: '指标值', value: 'INDICATOR_VALUE', desc: '当前指标的计算值' },
      { label: '满分值', value: 'FULL_SCORE', desc: '指标的满分值' },
      { label: '权重', value: 'WEIGHT', desc: '指标的权重值' }
    ]
  },
  readonly: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '请输入判定公式'
  }
});

// Emits
const emits = defineEmits(['update:modelValue', 'validate', 'change']);

// 响应式数据
const textareaRef = ref(null);
const formulaText = ref(props.modelValue);
const selectedVariable = ref(null);
const hasError = ref(false);
const validationMessage = ref('');

// 快捷操作符
const quickOps = [
  { label: '>=', value: ' >= ', desc: '大于等于' },
  { label: '<=', value: ' <= ', desc: '小于等于' },
  { label: '>', value: ' > ', desc: '大于' },
  { label: '<', value: ' < ', desc: '小于' },
  { label: '=', value: ' = ', desc: '等于' },
  { label: 'AND', value: ' AND ', desc: '逻辑与' },
  { label: 'OR', value: ' OR ', desc: '逻辑或' },
  { label: '(', value: '(', desc: '左括号' },
  { label: ')', value: ')', desc: '右括号' }
];

// 计算属性
const variableOptions = computed(() => {
  return props.variables.map(v => ({
    label: v.label,
    value: v.value,
    title: v.desc
  }));
});

// 方法
const insertText = (text) => {
  if (props.readonly) return;

  // 获取真正的 textarea DOM 元素
  const textarea = textareaRef.value?.resizableTextArea?.textArea || textareaRef.value?.$el?.querySelector('textarea');
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const newValue = formulaText.value.substring(0, start) + text + formulaText.value.substring(end);
  formulaText.value = newValue;

  // 触发 input 事件以更新 v-model
  handleInput();

  nextTick(() => {
    const newPosition = start + text.length;
    textarea.setSelectionRange(newPosition, newPosition);
    textarea.focus();
  });
};

const insertVariable = (value) => {
  if (!value || props.readonly) return;
  
  insertText(value);
  selectedVariable.value = null;
};

const handleInput = () => {
  validateFormula();
  emits('update:modelValue', formulaText.value);
  emits('change', formulaText.value);
};

const handleKeydown = (event) => {
  // 支持Tab键插入空格
  if (event.key === 'Tab') {
    event.preventDefault();
    insertText('  ');
  }
};

const validateFormula = () => {
  if (!formulaText.value) {
    hasError.value = false;
    validationMessage.value = '';
    emits('validate', { valid: true, message: '' });
    return;
  }
  
  try {
    const formula = formulaText.value.trim();
    
    // 检查括号匹配
    const openBrackets = (formula.match(/\(/g) || []).length;
    const closeBrackets = (formula.match(/\)/g) || []).length;
    
    if (openBrackets !== closeBrackets) {
      throw new Error('括号不匹配');
    }
    
    // 检查是否包含无效字符
    const validPattern = /^[A-Z_0-9\s()><=!.AND|OR|NOT]+$/i;
    if (!validPattern.test(formula)) {
      throw new Error('包含无效字符');
    }
    
    hasError.value = false;
    validationMessage.value = '语法正确';
    emits('validate', { valid: true, message: '语法正确' });
    
  } catch (error) {
    hasError.value = true;
    validationMessage.value = error.message;
    emits('validate', { valid: false, message: error.message });
  }
};

// 监听器
watch(() => props.modelValue, (newValue) => {
  if (newValue !== formulaText.value) {
    formulaText.value = newValue;
    validateFormula();
  }
});

// 暴露方法
defineExpose({
  insertText,
  validate: validateFormula,
  focus: () => textareaRef.value?.focus(),
  clear: () => {
    formulaText.value = '';
    handleInput();
  }
});
</script>

<style lang="less" scoped>
.formula-editor-simple {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  
  .compact-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    
    .ant-btn-group {
      .ant-btn {
        font-size: 11px;
        height: 22px;
        padding: 0 6px;
        border-radius: 2px;
      }
    }
    
    .ant-select {
      .ant-select-selector {
        height: 22px;
        font-size: 11px;
        
        .ant-select-selection-item {
          line-height: 20px;
        }
      }
    }
  }
  
  .input-area {
    position: relative;
    
    :deep(.ant-input) {
      border: none;
      border-radius: 0;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      resize: none;
      
      &:focus {
        box-shadow: none;
      }
      
      &.error {
        border-color: #ff4d4f;
        background-color: #fff2f0;
      }
    }
    
    .validation-tip {
      position: absolute;
      bottom: 2px;
      right: 4px;
      font-size: 10px;
      color: #52c41a;
      background: rgba(255, 255, 255, 0.9);
      padding: 1px 4px;
      border-radius: 2px;
      
      &.error {
        color: #ff4d4f;
      }
    }
  }
}
</style>
