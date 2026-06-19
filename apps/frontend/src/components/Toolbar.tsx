import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useYjsStore } from '../store/yjsStore';
import { useLayoutStore } from '../store/layoutStore';
import { generateReactCode } from '../lib/codeGenerator';

export function Toolbar() {
  const { user, logout } = useAuthStore();
  const { connected, cursors } = useYjsStore();
  const { tree } = useLayoutStore();
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('');

  function handleExport() {
    const generated = generateReactCode(tree);
    setCode(generated);
    setShowCode(true);
  }

  function handleCopy() {
    navigator.clipboard.writeText(code);
  }

  const projectId = new URLSearchParams(window.location.search).get('project') || 'default';
  const shareUrl = `${window.location.origin}?project=${projectId}`;

  return (
    <>
      <div style={{
        height: '48px', background: '#13151f', borderBottom: '1px solid #2d3148',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#6366f1', marginRight: '8px' }}>
          ⚡ UI Builder
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: connected ? '#34d399' : '#f87171',
          }} />
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            {connected ? 'Live' : 'Offline'}
          </span>
          {cursors.length > 0 && (
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              · {cursors.length} collaborator{cursors.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button onClick={() => { navigator.clipboard.writeText(shareUrl); }} style={btnStyle('#2d3148')}>
          Share Link
        </button>
        <button onClick={handleExport} style={btnStyle('#6366f1')}>
          Export Code
        </button>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{user?.name}</span>
        <button onClick={logout} style={btnStyle('#2d3148')}>Logout</button>
      </div>

      {showCode && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowCode(false)}>
          <div style={{
            background: '#13151f', borderRadius: '12px', width: '700px', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column', border: '1px solid #2d3148',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #2d3148', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Generated React Code</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleCopy} style={btnStyle('#6366f1')}>Copy</button>
                <button onClick={() => setShowCode(false)} style={btnStyle('#2d3148')}>Close</button>
              </div>
            </div>
            <pre style={{
              flex: 1, overflow: 'auto', padding: '20px',
              fontSize: '12px', color: '#e2e8f0', lineHeight: 1.6,
              margin: 0,
            }}>{code}</pre>
          </div>
        </div>
      )}
    </>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg, border: 'none', color: 'white', padding: '6px 12px',
    borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500,
  };
}
