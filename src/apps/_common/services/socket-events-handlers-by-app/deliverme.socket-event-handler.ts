import socket_io from 'socket.io';
import { DELIVERME_EVENT_TYPES } from '../../../deliver-me/enums/deliverme.enum';
import { PlainObject } from '../../interfaces/common.interface';

export class DeliverMeSocketEventsHandler {
  public static handleNewSocket(
    io: socket_io.Server,
    socket: socket_io.Socket,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ): void {
    // socket.on(DELIVERME_EVENT_TYPES.CARRIER_ASSIGNED, (data: any) => {
      
    // });
  }
}