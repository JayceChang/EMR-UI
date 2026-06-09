import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveCaseTemplateScope } from '../src/views/business/case-template/case-template-scope.js';

test('resolves fixed case template scopes for split pages', () => {
  assert.equal(resolveCaseTemplateScope({ fixedTemplateScope: 'SYSTEM' }), 'SYSTEM');
  assert.equal(resolveCaseTemplateScope({ fixedTemplateScope: 'USER' }), 'USER');
});

test('resolves case template scopes from route paths', () => {
  assert.equal(resolveCaseTemplateScope({ routePath: '/business/case-template/system' }), 'SYSTEM');
  assert.equal(resolveCaseTemplateScope({ routePath: '/business/case-template/personal' }), 'USER');
});

test('keeps legacy case template page unscoped', () => {
  assert.equal(resolveCaseTemplateScope({ routePath: '/business/case-template' }), undefined);
});
