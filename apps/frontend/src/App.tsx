import React, { useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin } from '@dnd-kit/core';
import { ComponentSidebar } from './components/sidebar/ComponentSidebar';
import { Canvas } from './components/canvas/Canvas';
import { Inspector } from './components/inspector/Inspector';
import { Toolbar } from './components/Toolbar';
import { LiveCursors } from './components/canvas/LiveCursors';
import { useLayoutStore } from './store/layoutStore';
import { useYjsStore } from './store/yjsStore';
import { useAuthStore } from './store/authStore';
import { AuthModal } from './components/AuthModal';
import { ComponentType } from '@ui-builder/shared';

export default function App() {
  const { addNode, moveNode, selectedId } = useLayoutStore();
  const { connect, disconnect } = useYjsStore();
  const { user } = useAuthStore();

  const [draggingType, setDraggingType] = React.useState<ComponentType | null>(null);

  useEffect(() => {
    if (user) {
      const projectId = new URLSearchParams(window.location.search).get('project') || 'default';
      connect(projectId, user);
      return () => disconnect();
    }
  }, [user]);

  function handleDragStart(event: DragStartEvent) {
    const type = event.active.data.current?.type as ComponentType | undefined;
    if (type) setDraggingType(type);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingType(null);
    const { active, over } = event;
    if (!over) return;

    const sourceType = active.data.current?.type as ComponentType | undefined;
    const sourceId = active.data.current?.nodeId as string | undefined;
    const targetId = over.id as string;

    if (sourceType && !sourceId) {
      addNode(sourceType, targetId);
    } else if (sourceId && sourceId !== targetId) {
      moveNode(sourceId, targetId);
    }
  }

  if (!user) return <AuthModal />;

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Toolbar />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <ComponentSidebar />
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <Canvas />
            <LiveCursors />
          </div>
          <Inspector />
        </div>
      </div>
      <DragOverlay>
        {draggingType && (
          <div style={{
            padding: '8px 16px',
            background: '#6366f1',
            color: 'white',
            borderRadius: '6px',
            fontSize: '13px',
            opacity: 0.9,
            pointerEvents: 'none',
          }}>
            {draggingType}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
