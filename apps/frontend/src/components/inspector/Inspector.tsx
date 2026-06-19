import React from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { CSSProperties } from '@ui-builder/shared';

const CSS_FIELDS: { key: keyof CSSProperties; label: string; type: 'text' | 'color' }[] = [
  { key: 'width', label: 'Width', type: 'text' },
  { key: 'height', label: 'Height', type: 'text' },
  { key: 'padding', label: 'Padding', type: 'text' },
  { key: 'margin', label: 'Margin', type: 'text' },
  { key: 'backgroundColor', label: 'Background', type: 'color' },
  { key: 'color', label: 'Color', type: 'color' },
  { key: 'fontSize', label: 'Font Size', type: 'text' },
  { key: 'fontWeight', label: 'Font Weight', type: 'text' },
  { key: 'borderRadius', label: 'Border Radius', type: 'text' },
  { key: 'border', label: 'Border', type: 'text' },
  { key: 'gap', label: 'Gap', type: 'text' },
  { key: 'display', label: 'Display', type: 'text' },
  { key: 'flexDirection', label: 'Flex Direction', type: 'text' },
  { key: 'alignItems', label: 'Align Items', type: 'text' },
  { key: 'justifyContent', label: 'Justify Content', type: 'text' },
  { key: 'opacity', label: 'Opacity', type: 'text' },
];

export function Inspector() {
  const { tree, selectedId, updateNodeProps } = useLayoutStore();
  const node = selectedId ? tree.nodes[selectedId] : null;

  if (!node) {
    return (
      <div style={{
        width: '240px', flexShrink: 0, background: '#13151f',
        borderLeft: '1px solid #2d3148', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: '#64748b', fontSize: '13px',
      }}>
        Select an element to inspect
      </div>
    );
  }

  const style = (node.props.style || {}) as Partial<CSSProperties>;

  function updateStyle(key: keyof CSSProperties, value: string) {
    updateNodeProps(node!.id, { style: { ...style, [key]: value } });
  }

  function updateText(value: string) {
    updateNodeProps(node!.id, { text: value });
  }

  return (
    <div style={{
      width: '240px', flexShrink: 0, background: '#13151f',
      borderLeft: '1px solid #2d3148', display: 'flex',
      flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #2d3148', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Inspector — {node.type}
      </div>
      <div style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {(node.type === 'Button' || node.type === 'Text') && (
          <Field label="Text">
            <input
              value={(node.props.text || '') as string}
              onChange={(e) => updateText(e.target.value)}
              style={inputStyle}
            />
          </Field>
        )}
        {node.type === 'Input' && (
          <Field label="Placeholder">
            <input
              value={(node.props.placeholder || '') as string}
              onChange={(e) => updateNodeProps(node.id, { placeholder: e.target.value })}
              style={inputStyle}
            />
          </Field>
        )}
        {node.type === 'Image' && (
          <Field label="Src">
            <input
              value={(node.props.src || '') as string}
              onChange={(e) => updateNodeProps(node.id, { src: e.target.value })}
              style={inputStyle}
            />
          </Field>
        )}
        <div style={{ borderTop: '1px solid #2d3148', paddingTop: '8px', fontSize: '11px', color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Styles
        </div>
        {CSS_FIELDS.map(({ key, label, type }) => (
          <Field key={key} label={label}>
            {type === 'color' ? (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={style[key] || '#000000'}
                  onChange={(e) => updateStyle(key, e.target.value)}
                  style={{ width: '28px', height: '28px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                />
                <input
                  value={style[key] || ''}
                  onChange={(e) => updateStyle(key, e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="#000000"
                />
              </div>
            ) : (
              <input
                value={style[key] || ''}
                onChange={(e) => updateStyle(key, e.target.value)}
                style={inputStyle}
                placeholder="auto"
              />
            )}
          </Field>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <label style={{ fontSize: '11px', color: '#94a3b8' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '4px',
  padding: '5px 8px', color: '#e2e8f0', fontSize: '12px', width: '100%',
  outline: 'none',
};
