import socket_io from 'socket.io';
import { COMMON_EVENT_TYPES } from '../../enums/common.enum';
import { PlainObject } from '../../interfaces/common.interface';

export class CommonSocketEventsHandler {
  public static handleNewSocket(
    io: socket_io.Server,
    socket: socket_io.Socket,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ): void {
    socket.on(`disconnect`, (data: any) => {
      console.log(`disconnecting socket ${socket.id}...`);
      CommonSocketEventsHandler.removeSocketBySocketId(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });


    socket.on(COMMON_EVENT_TYPES.MESSAGE_TYPING, (data: any) => {
      CommonSocketEventsHandler.MESSAGE_TYPING(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(COMMON_EVENT_TYPES.MESSAGE_TYPING_STOPPED, (data: any) => {
      CommonSocketEventsHandler.MESSAGE_TYPING_STOPPED(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(COMMON_EVENT_TYPES.CONVERSATION_EVENTS_SUBSCRIBED, (data: any) => {
      CommonSocketEventsHandler.CONVERSATION_EVENTS_SUBSCRIBED(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(COMMON_EVENT_TYPES.CONVERSATION_EVENTS_UNSUBSCRIBED, (data: any) => {
      CommonSocketEventsHandler.CONVERSATION_EVENTS_UNSUBSCRIBED(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(COMMON_EVENT_TYPES.CONVERSATION_MESSAGE_TYPING, (data: any) => {
      CommonSocketEventsHandler.CONVERSATION_MESSAGE_TYPING(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(COMMON_EVENT_TYPES.CONVERSATION_MESSAGE_TYPING_STOPPED, (data: any) => {
      CommonSocketEventsHandler.CONVERSATION_MESSAGE_TYPING_STOPPED(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(COMMON_EVENT_TYPES.SOCKET_TRACK, (data: any) => {
      CommonSocketEventsHandler.SOCKET_TRACK(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(COMMON_EVENT_TYPES.MESSAGING_EVENTS_SUBSCRIBED, (data: any) => {
      CommonSocketEventsHandler.MESSAGING_EVENTS_SUBSCRIBED(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(COMMON_EVENT_TYPES.MESSAGING_EVENTS_UNSUBSCRIBED, (data: any) => {
      CommonSocketEventsHandler.MESSAGING_EVENTS_UNSUBSCRIBED(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(COMMON_EVENT_TYPES.SOCKET_TO_USER_EVENT, (data: any) => {
      CommonSocketEventsHandler.SOCKET_TO_USER_EVENT(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });
  }



  /** Helpers */

  public static addUserSocket(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>
  ) {
    let roomKey = userSocketsRoomKeyByUserId.get(data.user_id);
    if (roomKey) {
      socket.join(roomKey, (err: any) => {
        console.log(err);
      });
    } else {
      roomKey = Date.now().toString();
      userSocketsRoomKeyByUserId.set(data.user_id, roomKey);
      socket.join(roomKey, (err: any) => {
        console.log(err);
      });
    }
  }

  public static removeSocketBySocketId(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>
  ) {
    // SocketsService.socketsBySocketIdMap.delete(socket_id);
    for (const roomKey of userSocketsRoomKeyByUserId.values()) {
      const sockets_id_map = io.in(roomKey).sockets;
      const isInRoom = (socket.id in sockets_id_map);
      console.log({ socket_id: socket.id, roomKey, isInRoom });
    }
  }

  public static emitUserToUserEvent(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>
  ) {
    const forUserSocketsRoomKey = userSocketsRoomKeyByUserId.get(data.to_user_id);
    if (forUserSocketsRoomKey) {
      socket.to(forUserSocketsRoomKey).emit(data.eventName, data);
    }
  }

  // public static emitForUserEvent(
  //   io: socket_io.Server,
  //   socket: socket_io.Socket,
  //   data: any,
  //   socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
  //   userSocketsRoomKeyByUserId: Map<number, string>
  // ) {
  //   const forUserSocketsMap = socketsByUserIdMap.get(data.for_user_id);
  //   if (forUserSocketsMap) {
  //     for (const for_socket of forUserSocketsMap.values()) {
  //       socket.to(for_socket.id).emit(`FOR-USER:${data.for_user_id}`, data);
  //     }
  //   }
  // }



  /** Handlers */

  private static MESSAGE_TYPING(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('to_user_id') &&
      typeof(data.to_user_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${COMMON_EVENT_TYPES.MESSAGE_TYPING}-error`, { message: `to_user_id is required.` });
      return;
    }

    data.eventName = COMMON_EVENT_TYPES.MESSAGE_TYPING;
    CommonSocketEventsHandler.emitUserToUserEvent(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
  }

  private static MESSAGE_TYPING_STOPPED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('to_user_id') &&
      typeof(data.to_user_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${COMMON_EVENT_TYPES.MESSAGE_TYPING_STOPPED}-error`, { message: `to_user_id is required.` });
      return;
    }

    data.eventName = COMMON_EVENT_TYPES.MESSAGE_TYPING_STOPPED;
    CommonSocketEventsHandler.emitUserToUserEvent(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
  }

  private static CONVERSATION_EVENTS_SUBSCRIBED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('conversation_id') &&
      typeof(data.conversation_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${COMMON_EVENT_TYPES.CONVERSATION_EVENTS_SUBSCRIBED}-error`, { message: `conversation_id is required.` });
      return;
    }

    const roomKey = `conversation-${data.conversation_id}`;
    const sockets_id_map = io.in(roomKey).sockets;
    const notInRoom = !(socket.id in sockets_id_map);
    if (notInRoom) {
      socket.join(roomKey, (err: any) => {
        console.log(err);
      });
    }
  }

  private static CONVERSATION_EVENTS_UNSUBSCRIBED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('conversation_id') &&
      typeof(data.conversation_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${COMMON_EVENT_TYPES.CONVERSATION_EVENTS_UNSUBSCRIBED}-error`, { message: `conversation_id is required.` });
      return;
    }

    const roomKey = `conversation-${data.conversation_id}`;
    socket.leave(roomKey, (err: any) => {
      console.log(err);
    });
  }

  private static CONVERSATION_MESSAGE_TYPING(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('conversation_id') &&
      typeof(data.conversation_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${COMMON_EVENT_TYPES.CONVERSATION_MESSAGE_TYPING}-error`, { message: `conversation_id is required.` });
      return;
    }

    io.to(`conversation-${data.conversation_id}`).emit(`${COMMON_EVENT_TYPES.CONVERSATION_MESSAGE_TYPING}:conversation-${data.conversation_id}`, data);
  }

  private static CONVERSATION_MESSAGE_TYPING_STOPPED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('conversation_id') &&
      typeof(data.conversation_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${COMMON_EVENT_TYPES.CONVERSATION_MESSAGE_TYPING_STOPPED}-error`, { message: `conversation_id is required.` });
      return;
    }

    io.to(`conversation-${data.conversation_id}`).emit(`${COMMON_EVENT_TYPES.CONVERSATION_MESSAGE_TYPING_STOPPED}:conversation-${data.conversation_id}`, data);
  }

  private static SOCKET_TRACK(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('user_id') &&
      typeof(data.user_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${COMMON_EVENT_TYPES.SOCKET_TRACK}-error`, { message: `user_id is required.` });
      return;
    }

    CommonSocketEventsHandler.addUserSocket(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
  }

  private static MESSAGING_EVENTS_SUBSCRIBED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('messaging_id') &&
      typeof(data.messaging_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${COMMON_EVENT_TYPES.MESSAGING_EVENTS_SUBSCRIBED}-error`, { message: `messaging_id is required.` });
      return;
    }

    const roomKey = `messaging-${data.messaging_id}`;
    const sockets_id_map = io.in(roomKey).sockets;
    const notInRoom = !(socket.id in sockets_id_map);
    if (notInRoom) {
      socket.join(roomKey, (err: any) => {
        console.log(err);
      });
    }
  }

  private static MESSAGING_EVENTS_UNSUBSCRIBED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('messaging_id') &&
      typeof(data.messaging_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${COMMON_EVENT_TYPES.MESSAGING_EVENTS_UNSUBSCRIBED}-error`, { message: `messaging_id is required.` });
      return;
    }

    const roomKey = `messaging-${data.messaging_id}`;
    socket.leave(roomKey);
  }

  private static SOCKET_TO_USER_EVENT(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('to_user_id') &&
      typeof(data.to_user_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${COMMON_EVENT_TYPES.SOCKET_TO_USER_EVENT}-error`, { message: `to_user_id is required.` });
      return;
    }

    const toUserSocketsMap = socketsByUserIdMap.get(data.to_user_id);
    if (toUserSocketsMap) {
      for (const to_socket of toUserSocketsMap.values()) {
        socket.to(to_socket.id).emit(data.eventName, data);
      }
    }
  }
}