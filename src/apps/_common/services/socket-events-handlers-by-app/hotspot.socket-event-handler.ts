import socket_io from 'socket.io';
import { HOTSPOT_EVENT_TYPES } from '../../../hotspot/enums/hotspot.enum';
import { PlainObject } from '../../interfaces/common.interface';

export class HotspotSocketEventsHandler {
  public static handleNewSocket(
    io: socket_io.Server,
    socket: socket_io.Socket,
    userIdsBySocket: Map<string, number>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ): void {
    // socket.on(HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_ADDED, (data: any) => {
      
    // });
  }
}