import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useLayoutStore } from '../../store/layoutStore';
import { UINode } from '@ui-builder/shared';

interface Props {
  nodeId: string;
}

export function CanvasNode({ nodeId }: Props) {
  const { tree, selectedId, selectNode, removeNode } = useLayoutStore();
  const node = tree.nodes[nodeId];
  if (!node) return null;

  const isSelected = selectedId === nodeId;

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: nodeId,
    data: { nodeId, type: node.type },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: nodeId,
    disabled: node.type !== 'Container' && node.type !== 'Card',
  });

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    selectNode(nodeId);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      removeNode(nodeId);
    }
  }

  const isContainer = node.type === 'Container' || node.type === 'Card';
  const combinedRef = (el: HTMLElement | null) => {
    setDragRef(el);
    if (isContainer) setDropRef(el);
  };

  const baseStyle: React.CSSProperties = {
    ...(node.props.style as React.CSSProperties || {}),
    opacity: isDragging ? 0.4 : 1,
    outline: isSelected
      ? '2px solid #6366f1'
      : isOver
      ? '2px dashed #6366f1'
      : undefined,
    outlineOffset: '2px',
    cursor: 'pointer',
    position: 'relative',
    userSelect: 'none',
  };

  return (
    <div
      ref={combinedRef}
      style={baseStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {...attributes}
      {...listeners}
    >
      {isSelected && (
        <div style={{
          position: 'absolute', top: -24, left: 0,
          background: '#6366f1', color: 'white',
          fontSize: '10px', padding: '2px 6px',
          borderRadius: '3px 3px 0 0', zIndex: 10,
          display: 'flex', gap: '8px', alignItems: 'center',
          pointerEvents: 'all',
        }}>
          <span>{node.type}</span>
          <button
            onClick={(e) => { e.stopPropagation(); removeNode(nodeId); }}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: '12px' }}
          >
            ×
          </button>
        </div>
      )}
      <NodeContent node={node} />
      {isContainer && node.children.map((childId) => (
        <CanvasNode key={childId} nodeId={childId} />
      ))}
      {isContainer && node.children.length === 0 && (
        <div style={{ color: '#94a3b8', fontSize: '12px', padding: '8px', pointerEvents: 'none' }}>
          Drop here
        </div>
      )}
    </div>
  );
}

function NodeContent({ node }: { node: UINode }) {
  switch (node.type) {
    case 'Button':
      return <button style={{ ...(node.props.style as React.CSSProperties), cursor: 'pointer' }}>{node.props.text || 'Button'}</button>;
    case 'Text':
      return <p style={node.props.style as React.CSSProperties}>{node.props.text || 'Text'}</p>;
    case 'Input':
      return <input placeholder={node.props.placeholder} style={node.props.style as React.CSSProperties} readOnly />;
    case 'Image':
      return <img src={node.props.src} alt={node.props.alt} style={node.props.style as React.CSSProperties} />;
    default:
      return null;
  }
}
