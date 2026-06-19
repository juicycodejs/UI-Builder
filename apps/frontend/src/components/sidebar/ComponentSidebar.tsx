import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ComponentType } from '@ui-builder/shared';

const COMPONENTS: { type: ComponentType; label: string; icon: string; description: string }[] = [
  { type: 'Container', label: 'Container', icon: '⬜', description: 'Flex layout wrapper' },
  { type: 'Card', label: 'Card', icon: '🃏', description: 'Styled card panel' },
  { type: 'Button', label: 'Button', icon: '🔘', description: 'Clickable button' },
  { type: 'Text', label: 'Text', icon: '📝', description: 'Text block' },
  { type: 'Input', label: 'Input', icon: '✏️', description: 'Text input field' },
  { type: 'Image', label: 'Image', icon: '🖼️', description: 'Image element' },
];

function DraggableItem({ type, label, icon, description }: typeof COMPONENTS[0]) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: { type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 12px', borderRadius: '6px',
        background: isDragging ? '#2d3148' : '#1a1d27',
        border: '1px solid #2d3148',
        cursor: 'grab', opacity: isDragging ? 0.5 : 1,
        userSelect: 'none',
        transition: 'background 0.15s',
      }}
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0' }}>{label}</div>
        <div style={{ fontSize: '11px', color: '#64748b' }}>{description}</div>
      </div>
    </div>
  );
}

export function ComponentSidebar() {
  return (
    <div style={{
      width: '200px', flexShrink: 0,
      background: '#13151f', borderRight: '1px solid #2d3148',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #2d3148', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Components
      </div>
      <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
        {COMPONENTS.map((c) => <DraggableItem key={c.type} {...c} />)}
      </div>
    </div>
  );
}
