import socket_io from 'socket.io';
import { PlainObject } from '../../interfaces/common.interface';

export class CarMasterSocketEventsHandler {
  public static handleNewSocket(
    io: socket_io.Server,
    socket: socket_io.Socket,
    userIdsBySocket: Map<string, number>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ): void {
    // socket.on(CARMASTER_EVENT_TYPES.CARMASTER_MESSAGE_TYPING, (data: any) => {
    //   // CarMasterSocketEventsHandler.
    // });
  }
}