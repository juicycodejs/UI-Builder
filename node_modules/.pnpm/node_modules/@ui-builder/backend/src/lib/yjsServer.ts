import { Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import * as Y from 'yjs';
import { DocumentModel } from '../models/Document';

// Room -> Y.Doc map for persistence
const docs = new Map<string, Y.Doc>();

export function setupYjsServer(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: '/yjs' });

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url || '', 'http://localhost');
    const projectId = url.searchParams.get('projectId') || url.pathname.split('/').pop() || 'default';

    // Load persisted snapshot if exists
    if (!docs.has(projectId)) {
      const ydoc = new Y.Doc();
      const saved = await DocumentModel.findOne({ projectId });
      if (saved?.snapshot) {
        Y.applyUpdate(ydoc, Buffer.from(saved.snapshot, 'base64'));
      }
      docs.set(projectId, ydoc);

      // Debounced persistence
      let saveTimer: ReturnType<typeof setTimeout> | null = null;
      ydoc.on('update', () => {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(async () => {
          const snapshot = Buffer.from(Y.encodeStateAsUpdate(ydoc)).toString('base64');
          await DocumentModel.findOneAndUpdate(
            { projectId },
            { projectId, snapshot, updatedAt: new Date() },
            { upsert: true, new: true }
          );
        }, 2500);
      });
    }

    setupWSConnection(ws, req, { docName: projectId, gc: true });
  });

  return wss;
}
