<!--
  * 判定公式编辑器 - 所见即所得的公式配置组件
  * 
  * @Author:    Jayce
  * @Date:      2025-07-12
  * @Copyright  ZDS
-->
<template>
  <div class="formula-editor">
    <!-- 工具栏 -->
    <a-row gutter="24">
      <a-col :span="12">
        <div class="formula-toolbar">
          <div class="toolbar-section">
            <span class="section-title">比较操作符</span>
            <a-button-group size="small">
              <a-button v-for="op in comparisonOps" :key="op.value" @click="insertOperator(op.value)" :title="op.desc">
                {{ op.label }}
              </a-button>
            </a-button-group>
          </div>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="formula-toolbar">
          <div class="toolbar-section">
            <span class="section-title">逻辑操作符</span>
            <a-button-group size="small">
              <a-button v-for="op in logicalOps" :key="op.value" @click="insertOperator(op.value)" :title="op.desc">
                {{ op.label }}
              </a-button>
            </a-button-group>
          </div>
        </div>
      </a-col>
    </a-row>
    <a-row gutter="24">
      <a-col :span="12">
        <div class="formula-toolbar">
          <div class="toolbar-section">
            <span class="section-title">分组符号</span>
            <a-button-group size="small">
              <a-button @click="insertOperator('(')" title="左括号">(</a-button>
              <a-button @click="insertOperator(')')" title="右括号">)</a-button>
            </a-button-group>
          </div>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="formula-toolbar">
          <div class="toolbar-section">
            <span class="section-title">变量</span>
              <a-select
                v-model:value="selectedVariable"
                placeholder="选择变量"
                style="width: 90px"
                size="small"
                @change="insertVariable"
                :options="variableOptions"
              />
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 编辑器主体 -->
    <div class="formula-editor-main">
      <div class="editor-container">
        <!-- 简化的输入框 -->
        <a-textarea
          ref="textareaRef"
          v-model:value="formulaText"
          allowClear=true
          class="formula-input"
          :class="{ 'has-error': hasError }"
          :placeholder="placeholder"
          :readonly="readonly"
          @input="handleInput"
          @keydown="handleKeydown"
          @select="updateCursor"
          @click="updateCursor"
        />
      </div>

      <!-- 验证信息 -->
      <div v-if="validationMessage" class="validation-message" :class="validationClass">
        <ExclamationCircleOutlined v-if="hasError" />
        <CheckCircleOutlined v-else />
        {{ validationMessage }}
      </div>
    </div>

    <!-- 预览区域 -->
    <div v-if="showPreview && formulaText" class="formula-preview">
      <div class="preview-title">
        <span>公式预览</span>
        <a-tooltip title="将公式转换为自然语言描述">
          <QuestionCircleOutlined class="help-icon" />
        </a-tooltip>
      </div>
      <div class="preview-content">
        {{ naturalLanguageDescription }}
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, nextTick, onMounted } from 'vue';
  import { ExclamationCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue';

  // Props
  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
    variables: {
      type: Array,
      default: () => [
        { label: '指标值', value: 'INDICATOR_VALUE', desc: '当前指标的计算值' },
        { label: '满分值', value: 'FULL_SCORE', desc: '指标的满分值' },
        { label: '权重', value: 'WEIGHT', desc: '指标的权重值' },
      ],
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '请输入判定公式，如：INDICATOR_VALUE >= 80 AND WEIGHT > 0.5',
    },
    showPreview: {
      type: Boolean,
      default: true,
    },
  });

  // Emits
  const emits = defineEmits(['update:modelValue', 'validate', 'change']);

  // 响应式数据
  const textareaRef = ref(null);
  const formulaText = ref(props.modelValue || '');
  const selectedVariable = ref(null);
  const cursorPosition = ref(0);
  const hasError = ref(false);
  const validationMessage = ref('');

  // 操作符定义
  const comparisonOps = [
    { label: '>', value: ' > ', desc: '大于' },
    { label: '<', value: ' < ', desc: '小于' },
    { label: '>=', value: ' >= ', desc: '大于等于' },
    { label: '<=', value: ' <= ', desc: '小于等于' },
    { label: '=', value: ' = ', desc: '等于' },
    { label: '!=', value: ' != ', desc: '不等于' },
  ];

  const logicalOps = [
    { label: 'AND', value: ' AND ', desc: '逻辑与' },
    { label: 'OR', value: ' OR ', desc: '逻辑或' },
    { label: 'NOT', value: ' NOT ', desc: '逻辑非' },
  ];

  // 计算属性
  const variableOptions = computed(() => {
    return props.variables.map((v) => ({
      label: v.label,
      value: v.value,
      title: v.desc,
    }));
  });

  const naturalLanguageDescription = computed(() => {
    if (!formulaText.value) return '';

    let description = formulaText.value;

    // 替换变量为中文描述
    props.variables.forEach((variable) => {
      const regex = new RegExp(`\\b${variable.value}\\b`, 'g');
      description = description.replace(regex, variable.label);
    });

    // 替换操作符为中文描述
    description = description.replace(/\bAND\b/g, '并且');
    description = description.replace(/\bOR\b/g, '或者');
    description = description.replace(/\bNOT\b/g, '不是');
    description = description.replace(/>=/g, '大于等于');
    description = description.replace(/<=/g, '小于等于');
    description = description.replace(/!=/g, '不等于');
    description = description.replace(/>/g, '大于');
    description = description.replace(/</g, '小于');
    description = description.replace(/=/g, '等于');

    return `当 ${description} 时，条件成立`;
  });

  const validationClass = computed(() => ({
    error: hasError.value,
    success: !hasError.value && formulaText.value,
  }));

  // 方法
  const insertOperator = (operator) => {
    console.log('FormulaEditor: insertOperator 被调用，操作符:', operator);

    if (props.readonly) {
      console.log('FormulaEditor: 组件为只读模式，跳过插入');
      return;
    }

    // 简化的插入逻辑：直接在当前光标位置插入
    const currentValue = formulaText.value || '';
    console.log('FormulaEditor: 当前值:', currentValue);

    // 获取真正的 textarea DOM 元素
    let textarea = null;
    let cursorPos = currentValue.length; // 默认在末尾插入

    if (textareaRef.value) {
      console.log('FormulaEditor: textareaRef.value 存在');
      // 尝试多种方式获取 textarea DOM 元素
      textarea =
        textareaRef.value.resizableTextArea?.textArea ||
        textareaRef.value.$el?.querySelector('textarea') ||
        textareaRef.value.querySelector?.('textarea');

      if (textarea) {
        cursorPos = textarea.selectionStart || 0;
        console.log('FormulaEditor: 找到 textarea DOM，光标位置:', cursorPos);
      } else {
        console.log('FormulaEditor: 未找到 textarea DOM 元素');
      }
    } else {
      console.log('FormulaEditor: textareaRef.value 不存在');
    }

    // 插入操作符
    const newValue = currentValue.substring(0, cursorPos) + operator + currentValue.substring(cursorPos);
    console.log('FormulaEditor: 新值:', newValue);
    formulaText.value = newValue;

    // 触发 input 事件以更新 v-model
    handleInput();

    // 设置新的光标位置
    nextTick(() => {
      if (textarea) {
        const newPosition = cursorPos + operator.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
        console.log('FormulaEditor: 设置新光标位置:', newPosition);
      }
    });
  };

  const insertVariable = (value) => {
    if (!value || props.readonly) return;

    insertOperator(value);
    selectedVariable.value = null;
  };

  const handleInput = () => {
    console.log('FormulaEditor: handleInput 被调用，当前值:', formulaText.value);
    validateFormula();
    emits('update:modelValue', formulaText.value);
    emits('change', formulaText.value);
  };

  const handleKeydown = (event) => {
    // 支持Tab键插入空格
    if (event.key === 'Tab') {
      event.preventDefault();
      insertOperator('  ');
    }
  };

  const updateCursor = () => {
    let textarea = null;
    if (textareaRef.value) {
      textarea =
        textareaRef.value.resizableTextArea?.textArea ||
        textareaRef.value.$el?.querySelector('textarea') ||
        textareaRef.value.querySelector?.('textarea');
    }

    if (textarea) {
      cursorPosition.value = textarea.selectionStart || 0;
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
      // 基础语法检查
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
      validationMessage.value = '公式语法正确';
      emits('validate', { valid: true, message: '公式语法正确' });
    } catch (error) {
      hasError.value = true;
      validationMessage.value = error.message;
      emits('validate', { valid: false, message: error.message });
    }
  };

  // 监听器
  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue !== formulaText.value) {
        formulaText.value = newValue || '';
        validateFormula();
      }
    },
    { immediate: true }
  );

  // 生命周期
  onMounted(() => {
    validateFormula();
  });

  // 暴露方法
  defineExpose({
    insertText: insertOperator,
    validate: validateFormula,
    focus: () => textareaRef.value?.focus(),
    clear: () => {
      formulaText.value = '';
      handleInput();
    },
  });
</script>

<style lang="less" scoped>
  .formula-editor {
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    background: #fafafa;

    .formula-toolbar {
      flex-wrap: wrap;
      gap: 12px;
      padding: 8px 12px;
      justify-content: flex-start;

      .toolbar-section {
        display: flex;
        align-items: center;
        gap: 6px;
        justify-content: flex-start;

        .section-title {
          font-size: 11px;
          color: #666;
          white-space: nowrap;
          min-width: 60px;
        }

        .variable-value {
          display:inline;
        }

        .ant-btn-group {
          .ant-btn {
            font-size: 12px;
            height: 24px;
            padding: 0 8px;
          }
        }

        .ant-select {
          font-size: 12px;

          .ant-select-selector {
            height: 24px;

            .ant-select-selection-item {
              line-height: 22px;
            }
          }
        }
      }
    }

    .formula-editor-main {
      position: relative;

      .editor-container {
        position: relative;
        min-height: 80px;

        .formula-input {
          width: 100%;
          min-height: 80px;
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          outline: none;
          resize: vertical;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.5;
          background: #fff;
          color: rgba(0, 0, 0, 0.85);
          transition: border-color 0.3s;

          &:focus {
            border-color: #40a9ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
          }

          &.has-error {
            border-color: #ff4d4f;

            &:focus {
              border-color: #ff4d4f;
              box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
            }
          }

          &::placeholder {
            color: #bfbfbf;
          }
        }
      }

      .validation-message {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        font-size: 12px;
        border-top: 1px solid #f0f0f0;

        &.error {
          color: #ff4d4f;
          background-color: #fff2f0;
        }

        &.success {
          color: #52c41a;
          background-color: #f6ffed;
        }
      }
    }

    .formula-preview {
      padding: 12px;
      background: #f9f9f9;
      border-top: 1px solid #f0f0f0;

      .preview-title {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        font-size: 12px;
        font-weight: 500;
        color: #666;

        .help-icon {
          color: #bfbfbf;
        }
      }

      .preview-content {
        font-size: 13px;
        color: #595959;
        line-height: 1.4;
        padding: 8px;
        background: #fff;
        border-radius: 4px;
        border: 1px solid #e8e8e8;
      }
    }
  }
</style>
