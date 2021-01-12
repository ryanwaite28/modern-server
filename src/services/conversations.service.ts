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
  delete_cloudinary_image,
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
import { ConversationMembers, Conversations, ConversationLastOpeneds, ConversationMessages } from '../models/conversations.model';


export class ConversationsService {
  static async get_user_conversations_all(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);

    // get all the conversations that the user is a part of
    const conversations_member_models = await ConversationMembers.findAll({
      where: { user_id: you_id },
      include: [{
        model: Conversations,
        as: 'conversation',
        include: [{
          model: ConversationMembers,
          as: 'members',
          attributes: []
        }],
        attributes: {
          include: [
            [cast(fn('COUNT', col('conversation_members.conversation_id')), 'integer') ,'members_count']
          ]
        }
      }],
      order: [['id', 'DESC']],
      group: ['conversation_members.id', 'conversation.id']
    });

    const newList: any = [];
    // for each conversation, find when user last opened it
    for (const conversation_member of conversations_member_models) {
      const conversationMemberObj: PlainObject = conversation_member.toJSON();
      const conversation_id = conversationMemberObj.conversation_id;
      // when a user is added to a conversation, a record for last opened is also created; assume there is a record
      const last_opened_model = await ConversationLastOpeneds.findOne({
        where: { conversation_id, user_id: you_id }
      });
      const last_opened = last_opened_model!.get('last_opened');
      // conversationMemberObj.last_opened = last_opened;
      conversationMemberObj.conversation.last_opened = last_opened;
      // find how many messages are in the conversation since the user last opened it
      const unseen_messages_count = await ConversationMessages.count({
        where: { conversation_id, created_at: { [Op.gt]: last_opened }, user_id: { [Op.not]: you_id } }
      });
      // conversationMemberObj.unseen_messages_count = unseen_messages_count;
      conversationMemberObj.conversation.unseen_messages_count = unseen_messages_count;
      newList.push(conversationMemberObj.conversation);
    }

    // sort by last opened

    return response.status(HttpStatusCode.OK).json({
      data: newList
    });
  }

  static async get_user_conversations(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const conversation_timestamp = request.params.conversation_timestamp;

    const whereClause: PlainObject = { user_id: you_id };
    if (conversation_timestamp) {
      whereClause.updated_at = { [Op.lt]: conversation_timestamp };
    }

    // get all the conversations that the user is a part of via when they last opened it
    const conversations_last_opened_models = await ConversationLastOpeneds.findAll({
      where: whereClause,
      include: [{
        model: Conversations,
        as: 'conversation',
        include: [{
          model: ConversationMembers,
          as: 'members',
          attributes: []
        }],
        attributes: {
          include: [
            [cast(fn('COUNT', col('conversation_members.conversation_id')), 'integer') ,'members_count']
          ]
        }
      }],
      order: [['last_opened', 'DESC']],
      limit: 5
    });

    const newList: any = [];
    for (const last_opened_model of conversations_last_opened_models) {
      const lastOpenedObj: PlainObject = last_opened_model.toJSON();
      const conversation_id = lastOpenedObj.conversation_id;
      const last_opened = last_opened_model!.get('last_opened');
      lastOpenedObj.conversation.last_opened = last_opened;
      // find how many messages are in the conversation since the user last opened it
      const unseen_messages_count = await ConversationMessages.count({
        where: { conversation_id, created_at: { [Op.gt]: last_opened } }
      });
      // lastOpenedObj.unseen_messages_count = unseen_messages_count;
      lastOpenedObj.conversation.unseen_messages_count = unseen_messages_count;
      newList.push(lastOpenedObj.conversation);
    }

    // sort by last opened

    return response.status(HttpStatusCode.OK).json({
      data: newList
    });
  }

  static async create_conservation(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const title = (request.body.title || '').trim();
    if (!title) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `title cannot be empty`
      });
    }

    const createObj: PlainObject = {
      title,
      creator_id: you_id
    };

    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    if (icon_file) {
      const type = icon_file.mimetype.split('/')[1];
      const isInvalidType = !allowedImages.includes(type);
      if (isInvalidType) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Invalid file type: jpg, jpeg or png required...'
        });
      }

      const results = await store_image(icon_file);
      if (!results.result) {
        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: 'Could not upload file...'
        });
      }

      createObj.icon_id = results.result.public_id,
      createObj.icon_link = results.result.secure_url
    }

    const new_conversation_model = await Conversations.create(createObj);
    // add creator as a member of conversation
    const conversation_id = new_conversation_model.get('id');
    const new_conversation_last_opened_model = await ConversationLastOpeneds.create({
      conversation_id,
      user_id: you_id
    });
    const new_conversation_member_model = await ConversationMembers.create({
      conversation_id,
      user_id: you_id
    });

    const conversation: PlainObject = new_conversation_model.toJSON();
    conversation.last_opened = new_conversation_last_opened_model.get('last_opened');
    conversation.members_count = 1;

    return response.status(HttpStatusCode.OK).json({
      message: `Conversation created!`,
      data: conversation,
      new_conversation_last_opened_model,
      new_conversation_member_model,
    });
  }

  static async update_conservation(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const conversation_id = parseInt(request.params.conversation_id, 10);

    const conversation_model = response.locals.conversation_model;

    if (!conversation_model) {
      return response.status(HttpStatusCode.FORBIDDEN).json({
        message: `Conversation not found`
      });
    }
    const isNotOwner = parseInt(conversation_model.get('creator_id'), 10) !== you_id;
    if (isNotOwner) {
      return response.status(HttpStatusCode.FORBIDDEN).json({
        message: `You are not the conversation owner`
      });
    }

    const title = (request.body.title || '').trim();
    if (!title) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `title cannot be empty`
      });
    }

    const updatesObj: PlainObject = {
      title,
    };

    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    if (icon_file) {
      const type = icon_file.mimetype.split('/')[1];
      const isInvalidType = !allowedImages.includes(type);
      if (isInvalidType) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Invalid file type: jpg, jpeg or png required...'
        });
      }

      const results = await store_image(icon_file, conversation_model.get('icon_id'));
      if (!results.result) {
        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: 'Could not upload file...'
        });
      }

      updatesObj.icon_id = results.result.public_id,
      updatesObj.icon_link = results.result.secure_url
    }

    const updates = await Conversations.update(updatesObj, { where: { id: conversation_id } });

    return response.status(HttpStatusCode.OK).json({
      message: `Conversation updated!`,
      data: updatesObj,
      updates
    });
  }

  static async delete_conservation(request: Request, response: Response) {
    const conversation_model = response.locals.conversation_model;
    const conversation_id = response.locals.conversation_model.get('id');
    const deletes = await conversation_model.destroy();

    ConversationMembers.destroy({ where: { conversation_id } })
      .then((deletes: any) => {
        // console.log(`removed members for conversation: ${conversation_id}`, deletes);
      })
      .catch((error: any) => {
        // console.log(`could not remove members for conversation: ${conversation_id}`, error);
      });

    return response.status(HttpStatusCode.OK).json({
      message: `Conversation deleted!`,
      deletes
    });
  }
}