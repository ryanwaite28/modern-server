import {
  Request,
  Response,
} from 'express';
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
  IRequest
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

export class ConversationMembersService {
  static async get_conversation_members_all(request: Request, response: Response) {
    const conversation_id = parseInt(request.params.conversation_id, 10);

    const members_models = await ConversationMembers.findAll({
      where: { conversation_id },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    return response.status(HttpStatusCode.OK).json({
      data: members_models
    });
  }

  static async get_conversation_members(request: Request, response: Response) {
    const conversation_id = parseInt(request.params.conversation_id, 10);
    const member_id = parseInt(request.params.member_id, 10);

    const whereClause: PlainObject = member_id
      ? { conversation_id, id: { [Op.lt]: member_id } }
      : { conversation_id };

    const members_models = await ConversationMembers.findAll({
      where: whereClause,
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }],
      limit: 10,
      order: [['id', 'DESC']]
    });

    return response.status(HttpStatusCode.OK).json({
      data: members_models
    });
  }

  static async add_conversation_member(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);
    const conversation_id = parseInt(request.params.conversation_id, 10);

    const member_model = await ConversationMembers.findOne({
      where: { conversation_id, user_id }
    });

    if (member_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `user is already a member`
      });
    }

    // get all the conversations that the user is a part of via when they last opened it
    const new_conversation_member_model = await ConversationMembers.create({
      conversation_id,
      user_id
    });
    const new_conversation_last_opened_model = await ConversationLastOpeneds.create({
      conversation_id,
      user_id
    });

    const conversation_member_model = await ConversationMembers.findOne({
      where: { id: new_conversation_member_model.get('id') },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    (<IRequest> request).io.to(`conversation-${conversation_id}`).emit(
      COMMON_EVENT_TYPES.CONVERSATION_MEMBER_ADDED, 
      {
        event_type: COMMON_EVENT_TYPES.CONVERSATION_MEMBER_ADDED,
        data: {
          conversation: response.locals.conversation_model!.toJSON(),
          member: conversation_member_model!.toJSON()
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
            ...response.locals.conversation_model!.toJSON(),
            last_opened: new_conversation_last_opened_model.get('last_opened')
          },
          member: conversation_member_model!.toJSON()
        },
      });
    });
    
    const full_name = getUserFullName((<PlainObject> conversation_member_model!.toJSON()).user);
    ConversationMessages.create({
      conversation_id,
      body: `${full_name} was added to the conversation.`
    }).then((message_model: IMyModel) => {
      (<IRequest> request).io.to(`conversation-${conversation_id}`).emit(COMMON_EVENT_TYPES.NEW_CONVERSATION_MESSAGE, {
        event_type: COMMON_EVENT_TYPES.NEW_CONVERSATION_MESSAGE,
        data: message_model!.toJSON(),
      });
    });

    return response.status(HttpStatusCode.OK).json({
      data: conversation_member_model,
      message: `Conversation member added!`
    });
  }

  static async remove_conversation_member(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);
    const conversation_id = parseInt(request.params.conversation_id, 10);

    const member_model = await ConversationMembers.findOne({
      where: { conversation_id, user_id },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    if (!member_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `user is not a member`
      });
    }
    
    const memberObj: PlainObject = member_model.toJSON();
    const deletes = await member_model.destroy();

    (<IRequest> request).io.to(`conversation-${conversation_id}`).emit(COMMON_EVENT_TYPES.CONVERSATION_MEMBER_REMOVED, {
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
    ConversationMessages.create({
      conversation_id,
      body: `${full_name} was removed from the conversation.`
    }).then((message_model: IMyModel) => {
      (<IRequest> request).io.to(`conversation-${conversation_id}`).emit(COMMON_EVENT_TYPES.NEW_CONVERSATION_MESSAGE, {
        event_type: COMMON_EVENT_TYPES.NEW_CONVERSATION_MESSAGE,
        data: message_model!.toJSON(),
      });
    });

    return response.status(HttpStatusCode.OK).json({
      deletes,
      message: `Conversation member removed!`
    });
  }

  static async leave_conversation(request: Request, response: Response) {
    const conversation_model = response.locals.conversation_model;
    const conversation_id = response.locals.conversation_model.get('id');
    const you_id = parseInt(request.params.you_id, 10);

    const deletes = await ConversationMembers.destroy({
      where: { conversation_id, user_id: you_id }
    });

    const roomKey = `conversation-${conversation_id}`;

    const user_model = await UserRepo.get_user_by_id(you_id);
    const user = <IUser> user_model!.toJSON();
    const full_name = getUserFullName(user);

    ConversationMessages.create({
      conversation_id,
      body: `${full_name} left the conversation.`
    }).then((message_model: IMyModel) => {
      (<IRequest> request).io.to(roomKey).emit(COMMON_EVENT_TYPES.CONVERSATION_MEMBER_LEFT, {
        event_type: COMMON_EVENT_TYPES.CONVERSATION_MEMBER_LEFT,
        data: {
          conversation_id,
          user_id: you_id,
          user: user
        },
      });

      (<IRequest> request).io.to(roomKey).emit(COMMON_EVENT_TYPES.NEW_CONVERSATION_MESSAGE, {
        event_type: COMMON_EVENT_TYPES.NEW_CONVERSATION_MESSAGE,
        data: {
          message: message_model!.toJSON(),
        }
      });
    });

    return response.status(HttpStatusCode.OK).json({
      deletes,
      message: `Left conversation!`
    });
  }

  static async search_members(request: Request, response: Response) {
    const conversation_id = parseInt(request.params.conversation_id, 10);
    const query_term = (<string> request.query.query_term || '').trim().toLowerCase();
    if (!query_term) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `query_term query param is required`
      });
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

    return response.status(HttpStatusCode.OK).json({
      data: newList
    });
  }
}