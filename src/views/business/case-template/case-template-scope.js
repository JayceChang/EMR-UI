export const CASE_TEMPLATE_SCOPE_SYSTEM = 'SYSTEM';
export const CASE_TEMPLATE_SCOPE_USER = 'USER';

export function normalizeCaseTemplateScope(scope) {
  if (scope === CASE_TEMPLATE_SCOPE_SYSTEM || scope === CASE_TEMPLATE_SCOPE_USER) {
    return scope;
  }
  return undefined;
}

export function resolveCaseTemplateScope({ fixedTemplateScope, routePath } = {}) {
  const normalizedFixedScope = normalizeCaseTemplateScope(fixedTemplateScope);
  if (normalizedFixedScope) {
    return normalizedFixedScope;
  }

  const normalizedPath = String(routePath || '').toLowerCase();
  if (normalizedPath.includes('/case-template/system')) {
    return CASE_TEMPLATE_SCOPE_SYSTEM;
  }
  if (normalizedPath.includes('/case-template/personal') || normalizedPath.includes('/case-template/user')) {
    return CASE_TEMPLATE_SCOPE_USER;
  }
  return undefined;
}
