import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { CursorPosition } from '@ui-builder/shared';
import { verifyAccessToken } from './jwt';

const roomCursors = new Map<string, Map<string, CursorPosition>>();

export function setupSocketServer(server: HttpServer) {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers.cookie
      ?.split(';').find((c) => c.trim().startsWith('accessToken='))
      ?.split('=')[1];

    if (token) {
      try {
        verifyAccessToken(token);
      } catch {
        // Allow connection even without valid token for cursor-only use
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    let currentRoom: string | null = null;
    let currentUserId: string | null = null;

    socket.on('room:join', ({ projectId, userId, userName }: { projectId: string; userId: string; userName: string }) => {
      currentRoom = projectId;
      currentUserId = userId;
      socket.join(projectId);

      if (!roomCursors.has(projectId)) roomCursors.set(projectId, new Map());
      const cursors = roomCursors.get(projectId)!;

      socket.on('cursor:move', (cursor: CursorPosition) => {
        cursors.set(userId, cursor);
        io.to(projectId).emit('presence:update', Array.from(cursors.values()));
      });

      io.to(projectId).emit('presence:update', Array.from(cursors.values()));
    });

    socket.on('disconnect', () => {
      if (currentRoom && currentUserId) {
        roomCursors.get(currentRoom)?.delete(currentUserId);
        const cursors = roomCursors.get(currentRoom);
        if (cursors) {
          socket.to(currentRoom).emit('presence:update', Array.from(cursors.values()));
        }
      }
    });
  });

  return io;
}
