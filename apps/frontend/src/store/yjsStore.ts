import { create } from 'zustand';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { io, Socket } from 'socket.io-client';
import { UITree, CursorPosition, User } from '@ui-builder/shared';
import { useLayoutStore } from './layoutStore';
import { getUserColor } from './authStore';

interface YjsState {
  ydoc: Y.Doc | null;
  provider: WebsocketProvider | null;
  socket: Socket | null;
  cursors: CursorPosition[];
  connected: boolean;
  connect: (projectId: string, user: User) => void;
  disconnect: () => void;
  broadcastCursor: (x: number, y: number, user: User) => void;
}

export const useYjsStore = create<YjsState>((set, get) => ({
  ydoc: null,
  provider: null,
  socket: null,
  cursors: [],
  connected: false,

  connect: (projectId, user) => {
    const ydoc = new Y.Doc();
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';

    const provider = new WebsocketProvider(wsUrl, `project-${projectId}`, ydoc, {
      params: { projectId, userId: user.id },
    });

    const yNodes = ydoc.getMap<unknown>('nodes');
    const yRootId = ydoc.getText('rootId');

    // Sync Y.js → Zustand
    const syncToZustand = () => {
      const rootId = yRootId.toString() || 'root';
      const nodes: UITree['nodes'] = {};
      yNodes.forEach((val, key) => {
        nodes[key] = val as UITree['nodes'][string];
      });
      if (Object.keys(nodes).length > 0) {
        useLayoutStore.getState().setTree({ rootId, nodes });
      }
    };

    yNodes.observe(syncToZustand);

    // Sync Zustand → Y.js on local changes
    const unsubscribe = useLayoutStore.subscribe((state) => {
      ydoc.transact(() => {
        const { tree } = state;
        yRootId.delete(0, yRootId.length);
        yRootId.insert(0, tree.rootId);
        const currentKeys = new Set(yNodes.keys());
        const newKeys = new Set(Object.keys(tree.nodes));

        currentKeys.forEach((k) => { if (!newKeys.has(k)) yNodes.delete(k); });
        newKeys.forEach((k) => {
          const existing = yNodes.get(k);
          const incoming = tree.nodes[k];
          if (JSON.stringify(existing) !== JSON.stringify(incoming)) {
            yNodes.set(k, incoming);
          }
        });
      });
    });

    provider.on('status', ({ status }: { status: string }) => {
      set({ connected: status === 'connected' });
    });

    // Socket.io for cursors
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
      withCredentials: true,
    });

    socket.emit('room:join', { projectId, userId: user.id, userName: user.name });

    socket.on('presence:update', (cursors: CursorPosition[]) => {
      set({ cursors: cursors.filter((c) => c.userId !== user.id) });
    });

    set({ ydoc, provider, socket });

    return () => {
      unsubscribe();
      yNodes.unobserve(syncToZustand);
    };
  },

  disconnect: () => {
    const { provider, socket, ydoc } = get();
    provider?.destroy();
    socket?.disconnect();
    ydoc?.destroy();
    set({ ydoc: null, provider: null, socket: null, cursors: [], connected: false });
  },

  broadcastCursor: (x, y, user) => {
    const { socket } = get();
    socket?.emit('cursor:move', {
      userId: user.id,
      userName: user.name,
      x,
      y,
      color: getUserColor(user.id),
    });
  },
}));
