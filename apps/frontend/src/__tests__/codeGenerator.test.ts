import { generateReactCode } from '../lib/codeGenerator';
import { UITree } from '@ui-builder/shared';

const singleButtonTree: UITree = {
  rootId: 'root',
  nodes: {
    root: { id: 'root', type: 'Container', props: {}, parentId: null, children: ['btn1'] },
    btn1: { id: 'btn1', type: 'Button', props: { text: 'Click me', style: { backgroundColor: '#6366f1' } }, parentId: 'root', children: [] },
  },
};

const nestedTree: UITree = {
  rootId: 'root',
  nodes: {
    root: { id: 'root', type: 'Container', props: {}, parentId: null, children: ['card1'] },
    card1: { id: 'card1', type: 'Card', props: { style: { padding: '16px' } }, parentId: 'root', children: ['txt1'] },
    txt1: { id: 'txt1', type: 'Text', props: { text: 'Hello world' }, parentId: 'card1', children: [] },
  },
};

describe('generateReactCode', () => {
  it('generates a valid React component export', () => {
    const code = generateReactCode(singleButtonTree);
    expect(code).toContain('export default function GeneratedUI');
    expect(code).toContain('import React');
  });

  it('renders a button with correct text', () => {
    const code = generateReactCode(singleButtonTree);
    expect(code).toContain('Click me');
    expect(code).toContain('<button');
  });

  it('includes inline style from props', () => {
    const code = generateReactCode(singleButtonTree);
    expect(code).toContain('backgroundColor');
    expect(code).toContain('#6366f1');
  });

  it('handles nested components', () => {
    const code = generateReactCode(nestedTree);
    expect(code).toContain('Hello world');
    expect(code).toContain('<p');
  });

  it('wraps children in container div', () => {
    const code = generateReactCode(nestedTree);
    expect(code).toContain('<div');
    expect(code).toContain('</div>');
  });

  it('returns empty string for missing root', () => {
    const empty: UITree = { rootId: 'missing', nodes: {} };
    expect(generateReactCode(empty)).toBe('');
  });

  it('handles empty container with self-closing div', () => {
    const emptyContainer: UITree = {
      rootId: 'root',
      nodes: {
        root: { id: 'root', type: 'Container', props: {}, parentId: null, children: ['c1'] },
        c1: { id: 'c1', type: 'Container', props: {}, parentId: 'root', children: [] },
      },
    };
    const code = generateReactCode(emptyContainer);
    expect(code).toContain('<div');
  });
});
