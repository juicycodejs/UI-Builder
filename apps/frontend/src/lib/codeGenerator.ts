import { UITree, UINode } from '@ui-builder/shared';

export function generateReactCode(tree: UITree): string {
  const root = tree.nodes[tree.rootId];
  if (!root) return '';

  const componentCode = generateNode(tree, root, 0);

  return `import React from 'react';

export default function GeneratedUI() {
  return (
${componentCode}
  );
}
`;
}

function generateNode(tree: UITree, node: UINode, depth: number): string {
  const indent = '    ' + '  '.repeat(depth);
  const styleStr = styleToJsx(node.props.style as Record<string, string> | undefined);

  switch (node.type) {
    case 'Button':
      return `${indent}<button style={${styleStr}}>${node.props.text || 'Button'}</button>`;

    case 'Text':
      return `${indent}<p style={${styleStr}}>${node.props.text || 'Text'}</p>`;

    case 'Input':
      return `${indent}<input placeholder="${node.props.placeholder || ''}" style={${styleStr}} />`;

    case 'Image':
      return `${indent}<img src="${node.props.src || ''}" alt="${node.props.alt || ''}" style={${styleStr}} />`;

    case 'Container':
    case 'Card': {
      const tag = 'div';
      if (node.children.length === 0) {
        return `${indent}<${tag} style={${styleStr}} />`;
      }
      const children = node.children
        .map((id) => tree.nodes[id])
        .filter(Boolean)
        .map((child) => generateNode(tree, child, depth + 1))
        .join('\n');
      return `${indent}<${tag} style={${styleStr}}>\n${children}\n${indent}</${tag}>`;
    }

    default:
      return `${indent}<div style={${styleStr}} />`;
  }
}

function styleToJsx(style: Record<string, string> | undefined): string {
  if (!style || Object.keys(style).length === 0) return '{}';
  const entries = Object.entries(style)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}: '${v}'`)
    .join(', ');
  return `{ ${entries} }`;
}
