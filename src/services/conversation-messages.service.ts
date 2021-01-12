import { UploadedFile } from 'express-fileupload';
import * as bcrypt from 'bcrypt-nodejs';
import {
  Request,
  Response,
} from 'express';

import { 
  validateName,
  validateAccountType,
  validateEmail,
  validatePassword,
  uniqueValue,
  capitalize,
  allowedImages,
  languagesList,
  validateUsername,
  validateGender,
  generateJWT,
  AuthorizeJWT,
  EVENT_TYPES,
  user_attrs_slim
} from '../chamber';

import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import {
  PlainObject,
  IUser,
  IRequest
} from '../interfaces/all.interface';
import {
  send_verify_sms_request, check_verify_sms_request
} from '../sms-client';
import {
  VerifyEmail_EMAIL, SignedUp_EMAIL
} from '../template-engine';
import {
  send_email
} from '../email-client';
import {
  delete_image,
  store_image
} from '../cloudinary-manager';

import * as UserRepo from '../repos/users.repo';
import * as TokenRepo from '../repos/tokens.repo';
import * as EmailVerfRepo from '../repos/email-verification.repo';
import * as PhoneVerfRepo from '../repos/phone-verification.repo';
import * as CommonRepo from '../repos/_common.repo';

import {
  fn,
  Op,
  where,
  col,
  literal,
  cast,
} from 'sequelize';
import { MyModelStaticGeneric, IMyModel } from '../model-types';
import { ConversationMembers, ConversationMessages, ConversationLastOpeneds, ConversationMessageSeens } from '../models/conversations.model';
import { Users } from '../models/user.model';


export class ConversationMessagesService {
  static async get_conversation_messages(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const conversation_id = parseInt(request.params.conversation_id, 10);
    const message_id = parseInt(request.params.message_id, 10);

    const conversation_member_model = await ConversationMembers.findOne({
      where: { conversation_id, user_id: you_id }
    });

    if (!conversation_member_model) {
      return response.status(HttpStatusCode.FORBIDDEN).json({
        message: `You are not a member of this conversation`
      });
    }

    const whereClause: PlainObject = { conversation_id };
    if (message_id) {
      whereClause.id = { [Op.lt]: message_id };
    }

    // get all the conversations that the user is a part of via when they last opened it
    const conversations_last_opened_models = await ConversationMessages.findAll({
      where: whereClause,
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }],
      order: [['id', 'DESC']],
      limit: 5
    });

    return response.status(HttpStatusCode.OK).json({
      data: conversations_last_opened_models
    });
  }

  static async update_conversation_last_opened(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const conversation_id = parseInt(request.params.conversation_id, 10);

    console.log(`updating last opened for conversation`);
    const updates = await ConversationLastOpeneds.update({ last_opened: fn('NOW') }, {
      where: { conversation_id, user_id: you_id }
    });

    console.log({ updates, conversation_id, user_id: you_id });

    return response.status(HttpStatusCode.OK).json({
      message: `conversation last opened updated`,
      updates,
    });
  }

  static async create_conversation_message(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const conversation_id = parseInt(request.params.conversation_id, 10);

    const conversation_member_model = await ConversationMembers.findOne({
      where: { conversation_id, user_id: you_id }
    });

    if (!conversation_member_model) {
      return response.status(HttpStatusCode.FORBIDDEN).json({
        message: `You are not a member of this conversation`
      });
    }

    const body = request.body.body && request.body.body.trim();
    const parent_message_id = request.body.parent_message_id || null;
    if (!body) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `message body cannot be empty`
      });
    }

    // get all the conversations that the user is a part of via when they last opened it
    const new_conversation_message_model = await ConversationMessages.create({
      conversation_id,
      parent_message_id,
      body,
      user_id: you_id
    });

    const conversation_message_model = await ConversationMessages.findOne({
      where: { id: new_conversation_message_model.get('id') },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    (<IRequest> request).io.emit(`${EVENT_TYPES.NEW_CONVERSATION_MESSAGE}:conversation-${conversation_id}`, {
      event_type: EVENT_TYPES.NEW_CONVERSATION_MESSAGE,
      data: conversation_message_model!.toJSON(),
    });

    return response.status(HttpStatusCode.OK).json({
      message: `conversation message created!`,
      data: conversation_message_model
    });
  }

  static async mark_message_as_seen(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const message_id = parseInt(request.params.message_id, 10);
    const conversation_id = parseInt(request.params.conversation_id, 10);
    let seen_message_model = await ConversationMessageSeens.findOne({
      where: { conversation_id, id: message_id, user_id: you_id, seen: true }
    });
    if (seen_message_model) {
      return response.status(HttpStatusCode.OK).json({
        message: `message already seen`
      });
    }
    seen_message_model = await ConversationMessageSeens.create({
      conversation_id, message_id, user_id: you_id, seen: true
    });
    return response.status(HttpStatusCode.OK).json({
      message: `message marked as seen`,
      data: seen_message_model
    });
  }
}