/**
 * 指标表单管理 Composable
 * 统一管理表单状态、验证和数据处理
 * @author Jayce
 */
import { ref, reactive, computed, nextTick } from 'vue';
import { message } from 'ant-design-vue';

/**
 * 表单管理 Hook
 * @param {Object} formDefault - 表单默认值
 * @param {Object} rules - 验证规则
 * @param {Function} onDataChange - 数据变化回调
 * @returns {Object} 表单管理对象
 */
export function useIndicatorForm(formDefault = {}, rules = {}, onDataChange = null) {
  const formRef = ref();
  const form = reactive({ ...formDefault });
  const isValid = ref(false);
  const validationErrors = ref({});

  // 计算属性：表单是否有数据
  const hasData = computed(() => {
    return Object.keys(form).some(key => 
      form[key] !== undefined && 
      form[key] !== null && 
      form[key] !== ''
    );
  });

  /**
   * 验证表单
   * @returns {Promise<boolean>} 验证结果
   */
  const validate = async () => {
    if (!formRef.value) {
      console.warn('[useIndicatorForm] formRef 未初始化');
      return false;
    }

    try {
      await formRef.value.validateFields();
      isValid.value = true;
      validationErrors.value = {};
      console.log('[useIndicatorForm] 表单验证通过');
      return true;
    } catch (error) {
      isValid.value = false;
      validationErrors.value = error;
      console.log('[useIndicatorForm] 表单验证失败:', error);
      return false;
    }
  };

  /**
   * 重置表单
   */
  const resetForm = () => {
    // 清空表单数据
    Object.keys(form).forEach(key => {
      if (formDefault[key] !== undefined) {
        form[key] = formDefault[key];
      } else {
        form[key] = undefined;
      }
    });

    // 重置验证状态
    isValid.value = false;
    validationErrors.value = {};

    // 清除表单验证状态
    nextTick(() => {
      if (formRef.value) {
        formRef.value.clearValidate();
      }
    });

    console.log('[useIndicatorForm] 表单已重置');
  };

  /**
   * 设置表单数据
   * @param {Object} data - 要设置的数据
   */
  const setFormData = (data) => {
    if (!data || typeof data !== 'object') {
      console.warn('[useIndicatorForm] 无效的表单数据:', data);
      return;
    }

    // 清空现有数据
    Object.keys(form).forEach(key => {
      form[key] = undefined;
    });

    // 设置新数据
    Object.assign(form, data);

    // 对于undefined或null的字段，使用默认值
    Object.keys(form).forEach(key => {
      if ((form[key] === undefined || form[key] === null) && formDefault[key] !== undefined) {
        form[key] = formDefault[key];
      }
    });

    // 触发数据变化回调
    if (onDataChange && typeof onDataChange === 'function') {
      onDataChange({ ...form });
    }

    console.log('[useIndicatorForm] 表单数据已设置:', { ...form });
  };

  /**
   * 获取表单数据
   * @returns {Object} 表单数据副本
   */
  const getFormData = () => {
    return { ...form };
  };

  /**
   * 更新表单字段
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   */
  const updateField = (field, value) => {
    if (field in form) {
      form[field] = value;
      
      // 触发数据变化回调
      if (onDataChange && typeof onDataChange === 'function') {
        onDataChange({ ...form });
      }
    }
  };

  /**
   * 批量更新表单字段
   * @param {Object} updates - 要更新的字段对象
   */
  const updateFields = (updates) => {
    if (!updates || typeof updates !== 'object') {
      return;
    }

    Object.keys(updates).forEach(key => {
      if (key in form) {
        form[key] = updates[key];
      }
    });

    // 触发数据变化回调
    if (onDataChange && typeof onDataChange === 'function') {
      onDataChange({ ...form });
    }
  };

  /**
   * 清除验证状态
   */
  const clearValidate = () => {
    if (formRef.value) {
      formRef.value.clearValidate();
    }
    isValid.value = false;
    validationErrors.value = {};
  };

  return {
    formRef,
    form,
    isValid,
    validationErrors,
    hasData,
    validate,
    resetForm,
    setFormData,
    getFormData,
    updateField,
    updateFields,
    clearValidate
  };
}

/**
 * 表单验证规则工具
 */
export const formRules = {
  /**
   * 必填验证
   * @param {string} message - 错误消息
   * @returns {Object} 验证规则
   */
  required: (message) => ({
    required: true,
    message: message || '此字段为必填项'
  }),

  /**
   * 长度验证
   * @param {number} max - 最大长度
   * @param {string} message - 错误消息
   * @returns {Object} 验证规则
   */
  maxLength: (max, message) => ({
    max,
    message: message || `不能超过${max}个字符`
  }),

  /**
   * 数字验证
   * @param {string} message - 错误消息
   * @returns {Object} 验证规则
   */
  number: (message) => ({
    type: 'number',
    message: message || '必须是数字'
  })
};
