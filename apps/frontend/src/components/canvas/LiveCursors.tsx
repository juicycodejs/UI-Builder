import React from 'react';
import { useYjsStore } from '../../store/yjsStore';

export function LiveCursors() {
  const { cursors } = useYjsStore();

  return (
    <>
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          style={{
            position: 'absolute',
            left: cursor.x,
            top: cursor.y,
            pointerEvents: 'none',
            zIndex: 999,
            transform: 'translate(-2px, -2px)',
          }}
        >
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path d="M0 0L0 14L4 10L7 17L9 16L6 9L11 9L0 0Z" fill={cursor.color} />
          </svg>
          <div style={{
            background: cursor.color,
            color: 'white',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            marginTop: '2px',
            whiteSpace: 'nowrap',
          }}>
            {cursor.userName}
          </div>
        </div>
      ))}
    </>
  );
}
