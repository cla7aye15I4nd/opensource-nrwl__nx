import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIRECTIVE = /^@nx-ultracache:(.*)$/;
const IMPORTS = 'imports';

/**
 * Whether the comment block that opens `content` has an
 * `@nx-ultracache: imports` directive. False when any `@nx-ultracache` value
 * there is unsupported.
 */
export function hasUltracacheImportsDirective(content: string): boolean {
  const values = parseUltracacheDirectives(content);
  return values.length > 0 && values.every((value) => value === IMPORTS);
}

/**
 * Whether a workspace-relative test file has an `@nx-ultracache: imports`
 * directive. Throws when any `@nx-ultracache` value is unsupported.
 */
export function readUltracacheImportsDirective(
  workspaceRoot: string,
  file: string
): boolean {
  const values = parseUltracacheDirectives(
    readFileSync(join(workspaceRoot, file), 'utf-8')
  );
  const unsupported = values.find((value) => value !== IMPORTS);
  if (unsupported !== undefined) {
    throw new Error(
      `${file}: "@nx-ultracache: ${unsupported}" is not supported. Use "@nx-ultracache: ${IMPORTS}".`
    );
  }
  return values.length > 0;
}

function parseUltracacheDirectives(content: string): string[] {
  const values: string[] = [];
  let inBlock = false;
  let start = 0;
  while (start < content.length) {
    const newline = content.indexOf('\n', start);
    const end = newline === -1 ? content.length : newline;
    let line = content.slice(start, end).trim();
    start = end + 1;
    if (!inBlock) {
      if (line === '' || line.startsWith('#!')) {
        continue;
      }
      if (line.startsWith('//')) {
        line = line.slice(2);
      } else if (line.startsWith('/*')) {
        inBlock = true;
        line = line.slice(2);
      } else {
        break;
      }
    }
    if (inBlock) {
      const blockEnd = line.indexOf('*/');
      if (blockEnd !== -1) {
        inBlock = false;
        // Code after `*/` means the block is not a file header.
        if (line.slice(blockEnd + 2).trim() !== '') {
          break;
        }
        line = line.slice(0, blockEnd);
      }
      line = line.replace(/^\s*\*+/, '');
    }
    const match = line.trim().match(DIRECTIVE);
    if (match) {
      values.push(match[1].trim());
    }
  }
  return values;
}
