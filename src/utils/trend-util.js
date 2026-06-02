const DEFAULT_DIGITS = 2;

const getZeroThreshold = (digits, zeroThreshold) => {
  if (typeof zeroThreshold === 'number') {
    return Math.abs(zeroThreshold);
  }
  return 0.5 / 10 ** digits;
};

export const parseTrendValue = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;

  const text = String(value)
    .replace(/[%\s,↑↓]/g, '')
    .trim();
  if (!text) return 0;

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const normalizeTrendValue = (value, digits = DEFAULT_DIGITS) => {
  const num = parseTrendValue(value);
  const factor = 10 ** digits;
  return Math.round(num * factor) / factor;
};

export const isZeroTrend = (value, options = {}) => {
  const digits = options.digits ?? DEFAULT_DIGITS;
  const threshold = getZeroThreshold(digits, options.zeroThreshold);
  const normalized = normalizeTrendValue(value, digits);
  return Math.abs(normalized) < threshold;
};

export const hasTrendArrow = (value, options = {}) => {
  return !isZeroTrend(value, options);
};

export const trendArrowIcon = (value, options = {}) => {
  const digits = options.digits ?? DEFAULT_DIGITS;
  const upIcon = options.upIcon ?? 'fas fa-arrow-up';
  const downIcon = options.downIcon ?? 'fas fa-arrow-down';
  const normalized = normalizeTrendValue(value, digits);
  return normalized > 0 ? upIcon : downIcon;
};

export const trendClass = (value, options = {}) => {
  if (!hasTrendArrow(value, options)) {
    return options.zeroClass ?? '';
  }
  const digits = options.digits ?? DEFAULT_DIGITS;
  const positiveClass = options.positiveClass ?? 'text-red-600';
  const negativeClass = options.negativeClass ?? 'text-green-600';
  const normalized = normalizeTrendValue(value, digits);
  return normalized > 0 ? positiveClass : negativeClass;
};

export const formatTrendPercent = (value, options = {}) => {
  const digits = options.digits ?? DEFAULT_DIGITS;
  const minFractionDigits = options.minFractionDigits ?? 0;
  const maxFractionDigits = options.maxFractionDigits ?? digits;
  const abs = options.abs !== false;
  const locale = options.locale ?? 'zh-CN';

  const normalized = normalizeTrendValue(value, digits);
  const displayValue = abs ? Math.abs(normalized) : normalized;

  return displayValue.toLocaleString(locale, {
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
  });
};
