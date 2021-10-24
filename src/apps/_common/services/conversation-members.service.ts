import { 
  user_attrs_slim,
  getUserFullName,
  populate_common_notification_obj
} from '../common.chamber';
import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import {
  PlainObject,
  IUser,
} from '../interfaces/common.interface';
import * as UserRepo from '../repos/users.repo';
import {
  fn,
  Op,
  where,
  col,
  literal,
} from 'sequelize';
import { create_notification } from '../repos/notifications.repo';
import {
  ConversationMembers,
  ConversationLastOpeneds,
  ConversationMessages,
  ConversationMemberRequests
} from '../models/conversations.model';
import { Users } from '../models/user.model';
import { IMyModel } from '../models/common.model-types';
import { COMMON_EVENT_TYPES, COMMON_NOTIFICATION_TARGET_TYPES, MODERN_APP_NAMES } from '../enums/common.enum';
import { SocketsService } from './sockets.service';
import { CommonSocketEventsHandler } from './socket-events-handlers-by-app/common.socket-event-handler';
import { ServiceMethodResults } from '../types/common.types';
import {
  find_or_create_conversation_member,
  get_conversation_members,
  get_conversation_members_all,
  get_conversation_member_by_user_id_and_conversation_id,
  remove_conversation_member
} from '../repos/conversation-members.repo';
import { find_or_create_user_conversation_last_opened } from '../repos/conversations.repo';
import { create_conversation_message } from '../repos/conversation-messages.repo';

export class ConversationMembersService {
  static async get_conversation_members_all(conversation_id: number) {
    const members_models = await get_conversation_members_all(conversation_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: members_models
      }
    };
    return serviceMethodResults;
  }

  static async get_conversation_members(conversation_id: number, member_id?: number) {
    const members_models = await get_conversation_members(conversation_id, member_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: members_models
      }
    };
    return serviceMethodResults;
  }

  static async add_conversation_member(opts: {
    you_id: number,
    user_id: number,
    conversation_id: number,
  }) {
    const { you_id, user_id, conversation_id } = opts;

    const member_model = await get_conversation_member_by_user_id_and_conversation_id(user_id, conversation_id);
    if (member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user is already a member`
        }
      };
      return serviceMethodResults;
    }

    // get all the conversations that the user is a part of via when they last opened it
    const new_conversation_member_model = await find_or_create_conversation_member(user_id, conversation_id);
    const new_conversation_last_opened_model = await find_or_create_user_conversation_last_opened(user_id, conversation_id);

    SocketsService.get_io().to(`conversation-${conversation_id}`).emit(
      COMMON_EVENT_TYPES.CONVERSATION_MEMBER_ADDED, 
      {
        event_type: COMMON_EVENT_TYPES.CONVERSATION_MEMBER_ADDED,
        data: {
          // conversation: response.locals.conversation_model!.toJSON(),
          member: new_conversation_member_model[0].toJSON()
        },
      }
    );

    create_notification({
      from_id: you_id,
      to_id: user_id,
      micro_app: MODERN_APP_NAMES.COMMON,
      event: COMMON_EVENT_TYPES.CONVERSATION_MEMBER_ADDED,
      target_type: COMMON_NOTIFICATION_TARGET_TYPES.CONVERSATION,
      target_id: conversation_id
    }).then(async (notification_model) => {
      const notification = await populate_common_notification_obj(notification_model);
      /*
      SocketsService.emitEventForUser(user_id, {
        event_type: COMMON_EVENT_TYPES.CONVERSATION_MEMBER_ADDED,
        data: {
          notification,
          conversation: {
            ...response.locals.conversation_model!.toJSON(),
            last_opened: new_conversation_last_opened_model.get('last_opened')
          },
          member: conversation_member_model!.toJSON()
        },
      });
      */

      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id,
        event: COMMON_EVENT_TYPES.CONVERSATION_MEMBER_ADDED,
        data: {
          notification,
          conversation: {
            // ...response.locals.conversation_model!.toJSON(),
            last_opened: new_conversation_last_opened_model[0].get('last_opened')
          },
          member: new_conversation_member_model[0].toJSON()
        },
      });
    });
    
    const full_name = getUserFullName((<PlainObject> new_conversation_member_model[0].toJSON()).user);
    const body: string = `${full_name} was added to the conversation.`;
    create_conversation_message(conversation_id, body)
      .then((message_model: IMyModel) => {
        SocketsService.get_io().to(`conversation-${conversation_id}`).emit(COMMON_EVENT_TYPES.NEW_CONVERSATION_MESSAGE, {
          event_type: COMMON_EVENT_TYPES.NEW_CONVERSATION_MESSAGE,
          data: message_model!.toJSON(),
        });
      });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: new_conversation_member_model[0],
        message: `Conversation member added!`
      }
    };
    return serviceMethodResults;
  }

  static async remove_conversation_member(opts: {
    you_id: number,
    user_id: number,
    conversation_id: number,
  }) {
    const { you_id, user_id, conversation_id } = opts;

    const member_model = await get_conversation_member_by_user_id_and_conversation_id(user_id, conversation_id);

    if (!member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user is not a member`
        }
      };
      return serviceMethodResults;
    }
    
    const memberObj: PlainObject = member_model.toJSON();
    const deletes = await member_model.destroy();

    SocketsService.get_io().to(`conversation-${conversation_id}`).emit(COMMON_EVENT_TYPES.CONVERSATION_MEMBER_REMOVED, {
      event_type: COMMON_EVENT_TYPES.CONVERSATION_MEMBER_REMOVED,
      data: { conversation_id, user_id, member: memberObj },
    });

    create_notification({
      from_id: you_id,
      to_id: user_id,
      micro_app: MODERN_APP_NAMES.COMMON,
      event: COMMON_EVENT_TYPES.CONVERSATION_MEMBER_REMOVED,
      target_type: COMMON_NOTIFICATION_TARGET_TYPES.CONVERSATION,
      target_id: conversation_id
    }).then(async (notification_model: IMyModel) => {
      const notification = await populate_common_notification_obj(notification_model);
      /*
      SocketsService.emitEventForUser(user_id, {
        event_type: COMMON_EVENT_TYPES.CONVERSATION_MEMBER_REMOVED,
        data: { conversation_id, user_id, member: memberObj, notification },
      });
      */

      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id,
        event: COMMON_EVENT_TYPES.CONVERSATION_MEMBER_REMOVED,
        data: {
          conversation_id,
          user_id,
          member: memberObj,
          notification
        },
      });
    });

    const full_name = getUserFullName(memberObj.user);
    const body: string = `${full_name} was removed from the conversation.`;

    create_conversation_message(conversation_id, body).then((message_model: IMyModel) => {
      SocketsService.get_io().to(`conversation-${conversation_id}`).emit(COMMON_EVENT_TYPES.NEW_CONVERSATION_MESSAGE, {
        event_type: COMMON_EVENT_TYPES.NEW_CONVERSATION_MESSAGE,
        data: message_model!.toJSON(),
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: deletes,
        message: `Conversation member removed!`
      }
    };
    return serviceMethodResults;
  }

  static async leave_conversation(you_id: number, conversation_id: number) {
    const member_model = await get_conversation_member_by_user_id_and_conversation_id(you_id, conversation_id);
    if (!member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `you are not a member`
        }
      };
      return serviceMethodResults;
    }

    const deletes = await member_model.destroy();
    const roomKey = `conversation-${conversation_id}`;

    const user_model = await UserRepo.get_user_by_id(you_id);
    const user = <IUser> user_model!.toJSON();
    const full_name = getUserFullName(user);
    const body: string = `${full_name} left the conversation.`;

    create_conversation_message(conversation_id, body).then((message_model: IMyModel) => {
      SocketsService.get_io().to(roomKey).emit(COMMON_EVENT_TYPES.CONVERSATION_MEMBER_LEFT, {
        event_type: COMMON_EVENT_TYPES.CONVERSATION_MEMBER_LEFT,
        data: {
          conversation_id,
          user_id: you_id,
          user: user,
        },
      });

      SocketsService.get_io().to(roomKey).emit(COMMON_EVENT_TYPES.NEW_CONVERSATION_MESSAGE, {
        event_type: COMMON_EVENT_TYPES.NEW_CONVERSATION_MESSAGE,
        data: {
          message: message_model!.toJSON(),
        }
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: deletes,
        message: `Left conversation!`
      }
    };
    return serviceMethodResults;
  }

  static async search_members(conversation_id: number, query: string) {
    let query_term = (<string> query || '').trim().toLowerCase();
    if (!query_term) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `query_term query param is required`
        }
      };
      return serviceMethodResults;
    }

    const member_ids_models = await ConversationMembers.findAll({
      where: { conversation_id },
      attributes: ['user_id']
    });
    const user_ids = member_ids_models.length ? member_ids_models.map((m: IMyModel) => m.get('user_id')) : [];
    const results = await Users.findAll({
      where: {
        id: { [Op.notIn]: user_ids },
        can_converse: true,
        [Op.or]: [{
          firstname: where(fn('LOWER', col('firstname')), 'LIKE', '%' + query_term + '%'),
        }, {
          lastname: where(fn('LOWER', col('lastname')), 'LIKE', '%' + query_term + '%'),
        }]
      },
      attributes: [
        ...user_attrs_slim,
        [literal("firstname || ' ' || lastname"), 'full_name']
      ],
      limit: 10
    });

    const newList = [];
    for (const user_model of results) {
      // see if there is a pending request
      const user = <IUser> user_model.toJSON();
      if (user.public) {
        (<any> user).member_request = null;
        newList.push(user);
        continue;
      }
      const request_model = await ConversationMemberRequests.findOne({
        where: {
          conversation_id,
          [Op.or]: [{ user_id: user.id }, { sender_id: user.id }] 
        }
      });
      (<any> user).member_request = request_model && request_model!.toJSON() || null;
      newList.push(user);
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: newList
      }
    };
    return serviceMethodResults;
  }
}