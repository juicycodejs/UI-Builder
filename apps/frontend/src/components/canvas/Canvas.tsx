import React, { useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useLayoutStore } from '../../store/layoutStore';
import { useYjsStore } from '../../store/yjsStore';
import { useAuthStore } from '../../store/authStore';
import { CanvasNode } from './CanvasNode';

export function Canvas() {
  const { tree, selectNode } = useLayoutStore();
  const { broadcastCursor } = useYjsStore();
  const { user } = useAuthStore();
  const canvasRef = useRef<HTMLDivElement>(null);

  const { setNodeRef, isOver } = useDroppable({ id: 'root' });

  function handleMouseMove(e: React.MouseEvent) {
    if (!user || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    broadcastCursor(e.clientX - rect.left, e.clientY - rect.top, user);
  }

  const root = tree.nodes[tree.rootId];
  if (!root) return null;

  return (
    <div
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onClick={() => selectNode(null)}
      style={{
        flex: 1,
        height: '100%',
        overflow: 'auto',
        background: '#1e2130',
        padding: '40px',
        position: 'relative',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          minHeight: '600px',
          minWidth: '800px',
          borderRadius: '8px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          ref={setNodeRef}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '600px',
            outline: isOver ? '2px dashed #6366f1' : 'none',
          }}
        >
          {root.children.map((childId) => (
            <CanvasNode key={childId} nodeId={childId} />
          ))}
          {root.children.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', fontSize: '14px', pointerEvents: 'none',
            }}>
              Drag components here to start building
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
