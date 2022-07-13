import {
  fn,
  Op,
} from 'sequelize';
import { Model } from 'sequelize/types';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Users } from '../../_common/models/user.model';
import { SocketsService } from '../../_common/services/sockets.service';
import { ServiceMethodResults } from '../../_common/types/common.types';
import { SAFESTAR_EVENT_TYPES } from '../enums/safestar.enum';
import { SafestarConversationMembers, SafestarConversationMessages, SafestarConversationLastOpeneds, SafestarConversationMessageSeens } from '../models/conversation.model';
import { user_attrs_slim } from '../safestar.chamber';

export class ConversationMessagesService {
  static async get_conversation_messages(opts: {
    you_id: number,
    conversation_id: number,
    message_id: number,
  }) {
    const { you_id, conversation_id, message_id } = opts;
    const conversation_member_model = await SafestarConversationMembers.findOne({
      where: { conversation_id, user_id: you_id }
    });

    if (!conversation_member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not a member of this conversation`
        }
      };
      return serviceMethodResults;
    }

    const whereClause: PlainObject = { conversation_id };
    if (message_id) {
      whereClause.id = { [Op.lt]: message_id };
    }

    // get all the conversations that the user is a part of via when they last opened it
    const conversations_last_opened_models = await SafestarConversationMessages.findAll({
      where: whereClause,
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }],
      order: [['id', 'DESC']],
      limit: 5
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: conversations_last_opened_models
      }
    };
    return serviceMethodResults;
  }

  static async update_conversation_last_opened(opts: {
    you_id: number,
    conversation_id: number,
  }) {
    const { you_id, conversation_id } = opts;

    console.log(`updating last opened for conversation`);
    const updates = await SafestarConversationLastOpeneds.update({ last_opened: fn('NOW') }, {
      where: { conversation_id, user_id: you_id }
    });

    console.log({ updates, conversation_id, user_id: you_id });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `conversation last opened updated`,
        data: updates,
      }
    };
    return serviceMethodResults;
  }

  static async create_conversation_message(opts: {
    you_id: number,
    conversation_id: number,
    parent_message_id: number,
    body: string,
  }) {
    let { you_id, conversation_id, parent_message_id, body } = opts;
    body = body && body.trim();

    const conversation_member_model = await SafestarConversationMembers.findOne({
      where: { conversation_id, user_id: you_id }
    });

    if (!conversation_member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not a member of this conversation`
        }
      };
      return serviceMethodResults;
    }
    
    if (!body) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `message body cannot be empty`
        }
      };
      return serviceMethodResults;
    }

    // get all the conversations that the user is a part of via when they last opened it
    const new_conversation_message_model = await SafestarConversationMessages.create({
      conversation_id,
      parent_message_id,
      body,
      owner_id: you_id
    });

    const conversation_message_model = await SafestarConversationMessages.findOne({
      where: { id: new_conversation_message_model.get('id') as number },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    });

    SocketsService.get_io().to(`conversation-${conversation_id}`).emit(SAFESTAR_EVENT_TYPES.NEW_CONVERSATION_MESSAGE, {
      event: SAFESTAR_EVENT_TYPES.NEW_CONVERSATION_MESSAGE,
      data: conversation_message_model!.toJSON(),
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `conversation message created!`,
        data: conversation_message_model
      }
    };
    return serviceMethodResults;
  }

  static async mark_message_as_seen(opts: {
    you_id: number,
    conversation_id: number,
    message_id: number,
  }) {
    const { you_id, conversation_id, message_id } = opts;

    let seen_message_model: Model | null = await SafestarConversationMessageSeens.findOne({
      where: { conversation_id, message_id, user_id: you_id, seen: true }
    });
    if (seen_message_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `message already seen`
        }
      };
      return serviceMethodResults;
    }
    seen_message_model = await SafestarConversationMessageSeens.create({
      conversation_id, message_id, user_id: you_id, seen: true
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `message marked as seen`,
        data: seen_message_model
      }
    };
    return serviceMethodResults;
  }
}