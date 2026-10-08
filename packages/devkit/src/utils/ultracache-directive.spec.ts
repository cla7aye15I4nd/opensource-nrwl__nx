import { hasUltracacheImportsDirective } from './ultracache-directive';

describe('hasUltracacheImportsDirective', () => {
  it.each([
    ['a line comment', '// @nx-ultracache: imports\nimport "app";\n'],
    [
      'a leading block comment',
      '/**\n * Checkout flow.\n * @nx-ultracache: imports\n */\ntest();\n',
    ],
    ['a one-line block comment', '/* @nx-ultracache: imports */\ntest();\n'],
    [
      'a shebang, a triple-slash directive, a license block and blank lines before it',
      '#!/usr/bin/env node\n\n/// <reference types="cypress" />\n/**\n * Copyright\n */\n\n// @nx-ultracache:imports\n',
    ],
    [
      'repeated directives and CRLF line endings',
      '// @nx-ultracache: imports\r\n// @nx-ultracache: imports\r\n',
    ],
  ])('accepts %s', (_, content) => {
    expect(hasUltracacheImportsDirective(content)).toBe(true);
  });

  it.each([
    ['an empty file', ''],
    [
      'a directive after the first code line',
      'import x from "y";\n// @nx-ultracache: imports\n',
    ],
    [
      'a block comment followed by code on the same line',
      '/* header */ const x = 1;\n// @nx-ultracache: imports\n',
    ],
    ['near misses', '// nx-ultracache: imports\n// @nx-ultracachex: imports\n'],
    ['an empty value', '// @nx-ultracache:\n'],
    ['an unsupported value', '// @nx-ultracache: import\n'],
    [
      'an unsupported value next to a supported one',
      '// @nx-ultracache: imports\n// @nx-ultracache: all\n',
    ],
  ])('rejects %s', (_, content) => {
    expect(hasUltracacheImportsDirective(content)).toBe(false);
  });
});
