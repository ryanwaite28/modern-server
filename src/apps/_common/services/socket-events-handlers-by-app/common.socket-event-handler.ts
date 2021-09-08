import socket_io from 'socket.io';
import { COMMON_EVENT_TYPES } from '../../enums/common.enum';
import { PlainObject } from '../../interfaces/common.interface';

export class CommonSocketEventsHandler {
  private static io: socket_io.Server;
  private static socketsByUserIdMap: Map<number, Set<string>>;
  private static userSocketsRoomKeyByUserId: Map<number, string>;

  public static handleNewSocket(
    io: socket_io.Server,
    socket: socket_io.Socket,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ): void {
    CommonSocketEventsHandler.io = io;
    CommonSocketEventsHandler.socketsByUserIdMap = socketsByUserIdMap;
    CommonSocketEventsHandler.userSocketsRoomKeyByUserId = userSocketsRoomKeyByUserId;

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

  private static addUserSocket(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>
  ) {
    let roomKey = userSocketsRoomKeyByUserId.get(data.user_id);
    if (roomKey) {
      socket.join(roomKey, (err: any) => {
        console.log(`err`, err);
        console.log(`roomKey`, roomKey);
      });
    } else {
      roomKey = Date.now().toString();
      userSocketsRoomKeyByUserId.set(data.user_id, roomKey);
      socket.join(roomKey, (err: any) => {
        console.log(`err`, err);
        console.log(`roomKey`, roomKey);
      });
    }

    let socketIdsSet = socketsByUserIdMap.get(data.user_id);
    if (socketIdsSet) {
      socketIdsSet.add(socket.id);
    } else {
      socketIdsSet = new Set<string>();
      socketIdsSet.add(socket.id);
      socketsByUserIdMap.set(data.user_id, socketIdsSet);
    }

    console.log(
      `addUserSocket() - CommonSocketEventsHandler.socketsByUserIdMap:`, 
      CommonSocketEventsHandler.socketsByUserIdMap.entries()
    );
    console.log(
      `addUserSocket() - CommonSocketEventsHandler.userSocketsRoomKeyByUserId:`, 
      CommonSocketEventsHandler.userSocketsRoomKeyByUserId.entries()
    );
  }

  static emitEventToUserSockets(params: {
    event: string;
    data: any;
    user_id: number;
  }) {
    let roomKey = CommonSocketEventsHandler.userSocketsRoomKeyByUserId.get(params.user_id);
    if (!roomKey) {
      console.log(`CommonSocketEventsHandler.emitEventToUser - no roomKey bu user Id`);
      return;
    }
    this.io.to(roomKey).emit(params.event, params.data);
  }

  public static removeSocketBySocketId(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>
  ) {
    socket.leaveAll();
    for (const keyVal of userSocketsRoomKeyByUserId.entries()) {
      const userId = keyVal[0], roomKey = keyVal[1];

      const sockets_id_map = io.in(roomKey).sockets;

      if (Object.keys(sockets_id_map).length === 0) {
        userSocketsRoomKeyByUserId.delete(userId);
      }

      const socketsByUserId = socketsByUserIdMap.get(userId);
      socketsByUserId?.delete(socket.id);

      // const isInRoom = (socket.id in sockets_id_map);
      // console.log({ socket_id: socket.id, roomKey, isInRoom });
      // if (isInRoom) {
      //   socket.leave(roomKey);
      // }

      console.log(
        `removeSocketBySocketId() - CommonSocketEventsHandler.socketsByUserIdMap:`, 
        CommonSocketEventsHandler.socketsByUserIdMap.entries()
      );
      console.log(
        `removeSocketBySocketId() - CommonSocketEventsHandler.userSocketsRoomKeyByUserId:`, 
        CommonSocketEventsHandler.userSocketsRoomKeyByUserId.entries()
      );
    }
  }

  public static emitUserToUserEvent(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
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
  //   socketsByUserIdMap: Map<number, Set<string>>,
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
    socketsByUserIdMap: Map<number, Set<string>>,
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
    socketsByUserIdMap: Map<number, Set<string>>,
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
    socketsByUserIdMap: Map<number, Set<string>>,
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
    socketsByUserIdMap: Map<number, Set<string>>,
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
    socketsByUserIdMap: Map<number, Set<string>>,
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
    socketsByUserIdMap: Map<number, Set<string>>,
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
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('user_id') &&
      typeof(data.user_id) === 'number'
    );
    if (!validEventData) {
      io.to(socket.id).emit(`${COMMON_EVENT_TYPES.SOCKET_TRACK}-error`, { message: `user_id is required.` });
      return;
    }

    CommonSocketEventsHandler.addUserSocket(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
  }

  private static MESSAGING_EVENTS_SUBSCRIBED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
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
    socketsByUserIdMap: Map<number, Set<string>>,
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
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('to_user_id') &&
      typeof(data.to_user_id) === 'number'
    );
    if (!validEventData) {
      io.to(socket.id).emit(`${COMMON_EVENT_TYPES.SOCKET_TO_USER_EVENT}-error`, { message: `to_user_id is required.` });
      return;
    }

    const toUserSocketsMap = socketsByUserIdMap.get(data.to_user_id);
    if (toUserSocketsMap) {
      for (const to_socket_id of toUserSocketsMap.values()) {
        io.to(to_socket_id).emit(data.eventName, data);
      }
    }
  }
}