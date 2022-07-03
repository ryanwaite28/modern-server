import socket_io from 'socket.io';
import { decodeJWT } from '../../common.chamber';
import { COMMON_EVENT_TYPES } from '../../enums/common.enum';
import { IUser } from '../../interfaces/common.interface';



export class CommonSocketEventsHandler {
  private static io: socket_io.Server;
  private static userIdsBySocket: Map<string, number>;
  private static userSocketsRoomKeyByUserId: Map<number, string>;

  private static userSocketsByUserId: Map<number, Set<string>> = new Map<number, Set<string>>();

  public static handleNewSocket(
    io: socket_io.Server,
    socket: socket_io.Socket,
    userIdsBySocket: Map<string, number>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ): void {
    CommonSocketEventsHandler.io = io;
    CommonSocketEventsHandler.userIdsBySocket = userIdsBySocket;
    CommonSocketEventsHandler.userSocketsRoomKeyByUserId = userSocketsRoomKeyByUserId;

    socket.on(`disconnect`, (data: any) => {
      console.log(`disconnecting socket ${socket.id}...`);
      CommonSocketEventsHandler.removeSocketBySocketId(io, socket, data);
    });

    socket.on(COMMON_EVENT_TYPES.SOCKET_JOIN_ROOM, (data: any) => {
      CommonSocketEventsHandler.SOCKET_JOIN_ROOM(io, socket, data);
    });

    socket.on(COMMON_EVENT_TYPES.SOCKET_LEAVE_ROOM, (data: any) => {
      CommonSocketEventsHandler.SOCKET_LEAVE_ROOM(io, socket, data);
    });

    socket.on(COMMON_EVENT_TYPES.JOIN_TO_MESSAGING_ROOM, (data: any) => {
      CommonSocketEventsHandler.JOIN_TO_MESSAGING_ROOM(io, socket, data);
    });

    socket.on(COMMON_EVENT_TYPES.LEAVE_TO_MESSAGING_ROOM, (data: any) => {
      CommonSocketEventsHandler.LEAVE_TO_MESSAGING_ROOM(io, socket, data);
    });

    socket.on(COMMON_EVENT_TYPES.TO_MESSAGING_ROOM, (data: any) => {
      CommonSocketEventsHandler.TO_MESSAGING_ROOM(io, socket, data);
    });

    // socket.on(COMMON_EVENT_TYPES.MESSAGE_TYPING, (data: any) => {
    //   CommonSocketEventsHandler.MESSAGE_TYPING(io, socket, data);
    // });

    // socket.on(COMMON_EVENT_TYPES.MESSAGE_TYPING_STOPPED, (data: any) => {
    //   CommonSocketEventsHandler.MESSAGE_TYPING_STOPPED(io, socket, data);
    // });

    socket.on(COMMON_EVENT_TYPES.CONVERSATION_EVENTS_SUBSCRIBED, (data: any) => {
      CommonSocketEventsHandler.CONVERSATION_EVENTS_SUBSCRIBED(io, socket, data);
    });

    socket.on(COMMON_EVENT_TYPES.CONVERSATION_EVENTS_UNSUBSCRIBED, (data: any) => {
      CommonSocketEventsHandler.CONVERSATION_EVENTS_UNSUBSCRIBED(io, socket, data);
    });

    socket.on(COMMON_EVENT_TYPES.CONVERSATION_MESSAGE_TYPING, (data: any) => {
      CommonSocketEventsHandler.CONVERSATION_MESSAGE_TYPING(io, socket, data);
    });

    socket.on(COMMON_EVENT_TYPES.CONVERSATION_MESSAGE_TYPING_STOPPED, (data: any) => {
      CommonSocketEventsHandler.CONVERSATION_MESSAGE_TYPING_STOPPED(io, socket, data);
    });

    socket.on(COMMON_EVENT_TYPES.SOCKET_TRACK, (data: any) => {
      CommonSocketEventsHandler.SOCKET_TRACK(io, socket, data);
    });

    socket.on(COMMON_EVENT_TYPES.SOCKET_UNTRACK, (data: any) => {
      CommonSocketEventsHandler.SOCKET_UNTRACK(io, socket, data);
    });

    socket.on(COMMON_EVENT_TYPES.MESSAGING_EVENTS_SUBSCRIBED, (data: any) => {
      CommonSocketEventsHandler.MESSAGING_EVENTS_SUBSCRIBED(io, socket, data);
    });

    socket.on(COMMON_EVENT_TYPES.MESSAGING_EVENTS_UNSUBSCRIBED, (data: any) => {
      CommonSocketEventsHandler.MESSAGING_EVENTS_UNSUBSCRIBED(io, socket, data);
    });

    // socket.on(COMMON_EVENT_TYPES.SOCKET_TO_USER_EVENT, (data: any) => {
    //   CommonSocketEventsHandler.SOCKET_TO_USER_EVENT(io, socket, data);
    // });

    socket.on(COMMON_EVENT_TYPES.MESSAGING_EVENTS_UNSUBSCRIBED, (data: any) => {
      CommonSocketEventsHandler.MESSAGING_EVENTS_UNSUBSCRIBED(io, socket, data);
    });

    socket.on(`EMIT_TO_ROOM`, (data: any) => {
      CommonSocketEventsHandler.EMIT_TO_ROOM(io, socket, data);
    });

    socket.on(`EMIT_TO_USER`, (data: any) => {
      CommonSocketEventsHandler.EMIT_TO_USER(io, socket, data);
    });
  }



  /** Helpers */

  private static SOCKET_JOIN_ROOM(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
  ) {
    const validEventData = (
      data.hasOwnProperty('room') &&
      typeof(data.room) === 'string'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`ERROR`, {
        error: `${COMMON_EVENT_TYPES.SOCKET_JOIN_ROOM}-error`,
        message: `room is required.`
      });
      return;
    }

    socket.join(data.room);
  }

  private static SOCKET_LEAVE_ROOM(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
  ) {
    const validEventData = (
      data.hasOwnProperty('room') &&
      typeof(data.room) === 'string'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`ERROR`, {
        error: `${COMMON_EVENT_TYPES.SOCKET_LEAVE_ROOM}-error`,
        message: `room is required.`
      });
      return;
    }

    socket.leave(data.room);
  }

  private static addUserSocket(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
  ) {
    const usersSocketsRoom = `FOR_USER:${data.user_id}`;

    socket.join(usersSocketsRoom);

    io.in(usersSocketsRoom).allSockets().then((sockets) => {
      console.log(`addUserSocket - User ${data.user_id} added socket id ${socket.id} to room ${usersSocketsRoom} | sockets in room:`, sockets);
    });
  }

  public static removeSocketBySocketId(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
  ) {
    // for (const keyVal of userSocketsRoomKeyByUserId.entries()) {
    //   const userId = keyVal[0], roomKey = keyVal[1];

    //   const sockets_id_map = io.in(roomKey).sockets;
    //   console.log({
    //     sockets_id_map,
    //     userId,
    //     roomKey
    //   });

    //   if (Object.keys(sockets_id_map).length === 0) {
    //     userSocketsRoomKeyByUserId.delete(userId);
    //   }
    // }

    // if (CommonSocketEventsHandler.userIdsBySocket.has(socket.id)) {
    //   const user_id: number = CommonSocketEventsHandler.userIdsBySocket.get(socket.id)!;
    //   const roomKey: string | undefined = CommonSocketEventsHandler.userSocketsRoomKeyByUserId.get(user_id);

    //   if (roomKey) {
    //     socket.leave(roomKey);

    //     const sockets_id_map = io.in(roomKey).sockets;
    //     const socket_ids = Object.keys(sockets_id_map);

    //     console.log({
    //       socket_ids,
    //       user_id,
    //       roomKey
    //     });
  
    //     if (socket_ids.length === 0) {
    //       console.log(`user has no more sockets in room "${roomKey}"; deleting room...`);
    //       CommonSocketEventsHandler.userSocketsRoomKeyByUserId.delete(user_id);
    //     }
    //   }

    //   CommonSocketEventsHandler.userIdsBySocket.delete(socket.id);
    // }

    // console.log(
    //   `removeSocketBySocketId() - CommonSocketEventsHandler.userIdsBySocket:`, 
    //   CommonSocketEventsHandler.userIdsBySocket.entries()
    // );
    // console.log(
    //   `removeSocketBySocketId() - CommonSocketEventsHandler.userSocketsRoomKeyByUserId:`, 
    //   CommonSocketEventsHandler.userSocketsRoomKeyByUserId.entries()
    // );
    // console.log(
    //   `removeSocketBySocketId() - CommonSocketEventsHandler.userSocketsByUserId:`, 
    //   CommonSocketEventsHandler.userSocketsByUserId.entries()
    // );
  }

  static getUserRoomKey(user_id: number) {
    return CommonSocketEventsHandler.userSocketsRoomKeyByUserId.get(user_id);
  }

  static emitEventToUserSockets(params: {
    event: string;
    data: any;
    user_id: number;
  }) {
    // // console.log(`emitEventToUserSockets called`, { params });
    // let roomKey = CommonSocketEventsHandler.userSocketsRoomKeyByUserId.get(params.user_id);
    // if (!roomKey) {
    //   console.log(`CommonSocketEventsHandler.emitEventToUserSockets - no roomKey by user Id`);
    //   return;
    // }
    // console.log({ user_id: params.user_id, roomKey });
    
    // let socketsSet = CommonSocketEventsHandler.userSocketsByUserId.get(params.user_id);
    // if (!socketsSet) {
    //   console.log(`CommonSocketEventsHandler.emitEventToUserSockets - no roomKey by user Id`);
    //   return;
    // }
    
    // if (!('event' in params.data)) {
    //   params.data.event = params.event;
    // }
    
    // console.log({ socketsSet });
    // // for (const socket_id of socketsSet) {
    // //   console.log(`Emitting data to socket id ${socket_id}...`);
    // //   CommonSocketEventsHandler.io.to(socket_id).emit(params.event, params.data);
    // // }

    // console.log(`Emitting data to room ${roomKey}...`);
    // CommonSocketEventsHandler.io.to(roomKey).emit(params.event, params.data);
    // // CommonSocketEventsHandler.io.to(roomKey).emit(`FOR-USER:${params.user_id}`, params.data);


    const usersSocketsRoom = `FOR_USER:${params.user_id}`;
    CommonSocketEventsHandler.io.in(usersSocketsRoom).fetchSockets().then((usersSockets) => {
      console.log(`emitEventToUserSockets - Emitting to room ${usersSocketsRoom}...`);
      
      CommonSocketEventsHandler.io.in(usersSocketsRoom).emit(params.event, params.data);
    })
  }

  static emitEventToRoom(params: {
    event: string;
    data: any;
    room: string;
  }) {
    if (!params.room) {
      console.log(`CommonSocketEventsHandler.emitEventToRoom - no roomKey given`);
      return;
    }
    if (!('event' in params.data)) {
      params.data.event = params.event;
    }
    CommonSocketEventsHandler.io.to(params.room).emit(params.event, params.data);
  }

  public static emitUserToUserEvent(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
  ) {
    const forUserSocketsRoomKey = CommonSocketEventsHandler.userSocketsRoomKeyByUserId.get(data.to_user_id);
    if (forUserSocketsRoomKey) {
      socket.to(forUserSocketsRoomKey).emit(data.eventName, data);
    }
  }

  // public static emitForUserEvent(
  //   io: socket_io.Server,
  //   socket: socket_io.Socket,
  //   data: any,
  //   userIdsBySocket: Map<string, number>,
  //   userSocketsRoomKeyByUserId: Map<number, string>
  // ) {
  //   const forUserSocketsMap = userIdsBySocket.get(data.for_user_id);
  //   if (forUserSocketsMap) {
  //     for (const for_socket of forUserSocketsMap.values()) {
  //       socket.to(for_socket.id).emit(`FOR-USER:${data.for_user_id}`, data);
  //     }
  //   }
  // }



  /** Handlers */

  private static JOIN_TO_MESSAGING_ROOM(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
  ) {
    const validEventData = (
      data.hasOwnProperty('messaging_id') &&
      typeof(data.messaging_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`ERROR`, {
        error: `${COMMON_EVENT_TYPES.JOIN_TO_MESSAGING_ROOM}-error`,
        message: `from_user_id and messaging_id is required.`
      });
      return;
    }

    data.event = COMMON_EVENT_TYPES.JOIN_TO_MESSAGING_ROOM;
    const TO_ROOM = `${COMMON_EVENT_TYPES.TO_MESSAGING_ROOM}:${data.messaging_id}`;
    socket.join(TO_ROOM);

    console.log(`--- socket ${socket.id} joined messaging room ${data.messaging_id}`);
    io.to(TO_ROOM).emit(COMMON_EVENT_TYPES.JOIN_TO_MESSAGING_ROOM, data);
  }

  private static LEAVE_TO_MESSAGING_ROOM(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
  ) {
    const validEventData = (
      data.hasOwnProperty('messaging_id') &&
      typeof(data.messaging_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`ERROR`, {
        error: `${COMMON_EVENT_TYPES.LEAVE_TO_MESSAGING_ROOM}-error`,
        message: `from_user_id and messaging_id is required.`
      });
      return;
    }

    data.event = COMMON_EVENT_TYPES.LEAVE_TO_MESSAGING_ROOM;
    const TO_ROOM = `${COMMON_EVENT_TYPES.TO_MESSAGING_ROOM}:${data.messaging_id}`;
    socket.leave(TO_ROOM);

    console.log(`--- socket ${socket.id} left messaging room ${data.messaging_id}`);
    io.to(TO_ROOM).emit(COMMON_EVENT_TYPES.LEAVE_TO_MESSAGING_ROOM, data);
  }

  private static TO_MESSAGING_ROOM(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
  ) {
    const validEventData = (
      data.hasOwnProperty('from_user_id') &&
      typeof(data.from_user_id) === 'number' &&
      data.hasOwnProperty('to_user_id') &&
      typeof(data.to_user_id) === 'number' &&
      data.hasOwnProperty('messaging_id') &&
      typeof(data.messaging_id) === 'number'
    );
    if (!validEventData) {
      console.log(`${COMMON_EVENT_TYPES.MESSAGE_TYPING}-error`, data);
      socket.to(socket.id).emit(`ERROR`, {
        error: `${COMMON_EVENT_TYPES.MESSAGE_TYPING}-error`,
        message: `from_user_id, to_user_id and messaging_id is required.`
      });
      return;
    }
    
    const TO_ROOM = `${COMMON_EVENT_TYPES.TO_MESSAGING_ROOM}:${data.messaging_id}`;
    io.to(TO_ROOM).emit(TO_ROOM, data);
  }

  private static MESSAGE_TYPING(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
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
    CommonSocketEventsHandler.emitUserToUserEvent(io, socket, data);
  }

  private static MESSAGE_TYPING_STOPPED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
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
    CommonSocketEventsHandler.emitUserToUserEvent(io, socket, data);
  }

  private static CONVERSATION_EVENTS_SUBSCRIBED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
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
    io.in(roomKey).allSockets().then((sockets) => {
      const notInRoom = !(socket.id in sockets);
      if (notInRoom) {
        socket.join(roomKey);
      }
    });
  }

  private static CONVERSATION_EVENTS_UNSUBSCRIBED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
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
    socket.leave(roomKey);
  }

  private static CONVERSATION_MESSAGE_TYPING(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
  ) {
    const validEventData = (
      data.hasOwnProperty('conversation_id') &&
      typeof(data.conversation_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${COMMON_EVENT_TYPES.CONVERSATION_MESSAGE_TYPING}-error`, { message: `conversation_id is required.` });
      return;
    }

    io.to(`conversation-${data.conversation_id}`).emit(COMMON_EVENT_TYPES.CONVERSATION_MESSAGE_TYPING, data);
  }

  private static CONVERSATION_MESSAGE_TYPING_STOPPED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
  ) {
    const validEventData = (
      data.hasOwnProperty('conversation_id') &&
      typeof(data.conversation_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${COMMON_EVENT_TYPES.CONVERSATION_MESSAGE_TYPING_STOPPED}-error`, { message: `conversation_id is required.` });
      return;
    }

    io.to(`conversation-${data.conversation_id}`).emit(COMMON_EVENT_TYPES.CONVERSATION_MESSAGE_TYPING_STOPPED, data);
  }

  private static async SOCKET_TRACK(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
  ) {
    const validJwtInData = (
      data.hasOwnProperty('jwt') &&
      typeof(data.jwt) === 'string'
    );
    if (!validJwtInData) {
      io.to(socket.id).emit(`${COMMON_EVENT_TYPES.SOCKET_TRACK}-error`, { message: `jwt is required.` });
      return;
    }

    console.log(`CommonSocketEventsHandler - SOCKET_TRACK event`);

    /* Check token validity */
    const token = data.jwt;
    let you: IUser;
    try {
      you = (decodeJWT(token) || null) as IUser;
    } 
    catch (e) {
      console.log(e);
      io.to(socket.id).emit(`${COMMON_EVENT_TYPES.SOCKET_TRACK}-error`, { message: `jwt is invalid.`, e });
      return;
    }

    if (!you) {
      io.to(socket.id).emit(`${COMMON_EVENT_TYPES.SOCKET_TRACK}-error`, { message: `jwt is invalid.` });
      return;
    }

    CommonSocketEventsHandler.addUserSocket(io, socket, { user_id: you.id });
  }

  private static EMIT_TO_ROOM(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
  ) {
    const validEventData = 
    (
      data.hasOwnProperty('to_room') &&
      typeof(data.to_room) === 'string'
    ) &&
    (
      data.hasOwnProperty('event_name') &&
      typeof(data.event_name) === 'string'
    );
    if (!validEventData) {
      io.to(socket.id).emit(`EMIT_TO_ROOM-error`, { message: `to_room (string) is required; event_name (string) is required` });
      return;
    }

    io.to(data.to_room).emit(data.event_name, data);
  }

  private static EMIT_TO_USER(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
  ) {
    const validEventData = 
    (
      data.hasOwnProperty('user_id') &&
      typeof(data.user_id) === 'number'
    ) &&
    (
      data.hasOwnProperty('event_name') &&
      typeof(data.event_name) === 'string'
    ) &&
    (
      data.hasOwnProperty('data') &&
      typeof(data.data) === 'object'
    );
    if (!validEventData) {
      io.to(socket.id).emit(`EMIT_TO_USER-error`, { message: `user_id (number) is required; event_name (string) is required; data (object) is required` });
      return;
    }

    console.log(`EMIT_TO_USER event:`, data);

    CommonSocketEventsHandler.emitEventToUserSockets({
      user_id: data.user_id,
      data: data.data,
      event: data.event_name,
    });
  }

  private static SOCKET_UNTRACK(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
  ) {
    // const validEventData = (
    //   data.hasOwnProperty('previous_socket_id') &&
    //   typeof(data.previous_socket_id) === 'string'
    // );
    // if (!validEventData) {
    //   io.to(socket.id).emit(`${COMMON_EVENT_TYPES.SOCKET_TRACK}-error`, { message: `previous_socket_id is required.` });
    //   return;
    // }

    // const previous_socket_id: string = data.previous_socket_id as string;

    // if (CommonSocketEventsHandler.userIdsBySocket.has(previous_socket_id)) {
    //   console.log(`Untracking ${previous_socket_id}...`);
    //   const user_id: number = CommonSocketEventsHandler.userIdsBySocket.get(previous_socket_id)!;
    //   const roomKey: string | undefined = CommonSocketEventsHandler.userSocketsRoomKeyByUserId.get(user_id);

    //   if (roomKey) {
    //     const sockets_id_map = io.in(roomKey).sockets;
    //     const socket_ids = Object.keys(sockets_id_map);
  
    //     if (socket_ids.length === 0) {
    //       console.log(`user has no more sockets in room "${roomKey}"; deleting room...`);
    //       CommonSocketEventsHandler.userSocketsRoomKeyByUserId.delete(user_id);
    //     }
    //   }

    //   CommonSocketEventsHandler.userIdsBySocket.delete(socket.id);
    // }
  }

  private static MESSAGING_EVENTS_SUBSCRIBED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
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
    io.in(roomKey).allSockets().then((sockets) => {
      const notInRoom = !(socket.id in sockets);
      if (notInRoom) {
        socket.join(roomKey);
      }
    });
  }

  private static MESSAGING_EVENTS_UNSUBSCRIBED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any
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

  // private static SOCKET_TO_USER_EVENT(
  //   io: socket_io.Server,
  //   socket: socket_io.Socket,
  //   data: any,
  //   userIdsBySocket: Map<string, number>,
  //   userSocketsRoomKeyByUserId: Map<number, string>,
  // ) {
  //   const validEventData = (
  //     data.hasOwnProperty('to_user_id') &&
  //     typeof(data.to_user_id) === 'number'
  //   );
  //   if (!validEventData) {
  //     io.to(socket.id).emit(`${COMMON_EVENT_TYPES.SOCKET_TO_USER_EVENT}-error`, { message: `to_user_id is required.` });
  //     return;
  //   }

  //   const toUserSocketsMap = userIdsBySocket.get(data.to_user_id);
  //   if (toUserSocketsMap) {
  //     for (const to_socket_id of toUserSocketsMap.values()) {
  //       io.to(to_socket_id).emit(data.eventName, data);
  //     }
  //   }
  // }
}