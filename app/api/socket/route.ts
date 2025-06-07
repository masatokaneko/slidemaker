import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';
import { CustomError, ErrorCode, handleError } from '@/lib/error-handler';
import { Monitoring } from '@/lib/monitoring';

const monitoring = Monitoring.getInstance();

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
        console.log(`Client joined room: ${roomId}`);
      });

      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId);
        console.log(`Client left room: ${roomId}`);
      });

      socket.on('edit-slide', async (data: { roomId: string; slideId: string; yaml: string }) => {
        try {
          const { roomId, slideId, yaml } = data;
          socket.to(roomId).emit('slide-updated', { slideId, yaml });

          // メトリクスを記録
          await monitoring.trackMetric('slide_edit', {
            roomId,
            slideId,
            success: true,
          });
        } catch (error) {
          const handledError = handleError(error);
          
          // エラーログを記録
          await monitoring.logError('slide_edit_error', {
            error: handledError,
            data,
          });

          socket.emit('error', {
            code: handledError.code,
            message: handledError.message,
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler; 