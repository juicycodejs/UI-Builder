export type ComponentType =
  | 'Container'
  | 'Button'
  | 'Text'
  | 'Input'
  | 'Image'
  | 'Card';

export interface ComponentProps {
  className?: string;
  style?: Partial<CSSProperties>;
  text?: string;
  placeholder?: string;
  src?: string;
  alt?: string;
  [key: string]: unknown;
}

export interface CSSProperties {
  width: string;
  height: string;
  padding: string;
  margin: string;
  backgroundColor: string;
  color: string;
  fontSize: string;
  fontWeight: string;
  borderRadius: string;
  border: string;
  display: string;
  flexDirection: string;
  alignItems: string;
  justifyContent: string;
  gap: string;
  opacity: string;
  [key: string]: string;
}

export interface UINode {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  parentId: string | null;
  children: string[];
}

export interface UITree {
  rootId: string;
  nodes: Record<string, UINode>;
}

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  collaboratorIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
}

export interface SocketEvents {
  'cursor:move': CursorPosition;
  'cursor:leave': { userId: string };
  'room:join': { projectId: string; userId: string; userName: string };
  'room:leave': { projectId: string; userId: string };
  'presence:update': CursorPosition[];
}
