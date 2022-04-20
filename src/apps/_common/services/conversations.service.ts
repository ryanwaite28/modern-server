import { UploadedFile } from 'express-fileupload';
import { Request, Response } from 'express';
import {
  allowedImages, validateAndUploadImageFile,
} from '../common.chamber';
import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import {
  PlainObject,
} from '../interfaces/common.interface';
import {
  store_image
} from '../../../cloudinary-manager';
import {
  fn,
  Op,
  col,
  cast,
} from 'sequelize';
import {
  ConversationMembers,
  Conversations,
  ConversationLastOpeneds,
  ConversationMessages
} from '../models/conversations.model';
import { ServiceMethodResults } from '../types/common.types';

export class ConversationsService {
  static async get_user_conversations_all(you_id: number) {
    try {
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
              [cast(fn('COUNT', col('common_conversation_members.conversation_id')), 'integer') ,'members_count']
            ]
          }
        }],
        order: [['id', 'DESC']],
        group: ['common_conversation_members.id', 'conversation.id']
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

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: newList
        }
      };
      return serviceMethodResults;
    }
    catch (e) {
      console.log(`get_user_conversations_all error:`, e);
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `could not get user conversations...`,
          error: e,
        }
      };
      return serviceMethodResults;
    }
  }

  static async get_user_conversations(options: {
    you_id: number,
    conversation_timestamp: string,
  }) {
    const { you_id, conversation_timestamp } = options;

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
            [cast(fn('COUNT', col('common_conversation_members.conversation_id')), 'integer') ,'members_count']
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

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.BAD_REQUEST,
      error: true,
      info: {
        data: newList
      }
    };
    return serviceMethodResults;
  }

  static async create_conservation(options: {
    you_id: number,
    title: string,
    icon_file: UploadedFile | undefined,
  }) {
    let { title, you_id, icon_file } = options;
    title = (title || '').trim();

    if (!title) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `title cannot be empty`
        }
      };
      return serviceMethodResults;
    }

    const createObj: PlainObject = {
      title,
      creator_id: you_id
    };

    const imageValidation = await validateAndUploadImageFile(icon_file, {
      treatNotFoundAsError: false,
      mutateObj: createObj,
      id_prop: 'icon_id',
      link_prop: 'icon_link',
    });
    if (imageValidation.error) {
      return imageValidation;
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

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Conversation created!`,
        data: {
          conversation,
          last_opened: new_conversation_last_opened_model,
          new_member: new_conversation_member_model,
        },
      }
    };
    return serviceMethodResults;
  }

  static async update_conservation(options: {
    conversation_id: number,
    title: string,
    icon_file?: UploadedFile
  }) {
    let { title, conversation_id, icon_file } = options;
    title = (title || '').trim();
    if (!title) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `title cannot be empty`
        }
      };
      return serviceMethodResults;
    }

    const updatesObj: PlainObject = {
      title,
    };

    const imageValidation = await validateAndUploadImageFile(icon_file, {
      treatNotFoundAsError: false,
      mutateObj: updatesObj,
      id_prop: 'icon_id',
      link_prop: 'icon_link',
    });
    if (imageValidation.error) {
      return imageValidation;
    }

    const updates = await Conversations.update(updatesObj, { where: { id: conversation_id } });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Conversation updated!`,
        data: {
          updates,
        },
      }
    };
    return serviceMethodResults;
  }

  static async delete_conservation(conversation_id: number) {
    const c_deletes = await Conversations.destroy({ where: { id: conversation_id } });
    const m_deletes = await ConversationMembers.destroy({ where: { conversation_id } })
      .then((deletes: any) => {
        // console.log(`removed members for conversation: ${conversation_id}`, deletes);
      })
      .catch((error: any) => {
        // console.log(`could not remove members for conversation: ${conversation_id}`, error);
      });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Conversation deleted!`,
        data: {
          c_deletes,
          m_deletes,
        }
      }
    };
    return serviceMethodResults;
  }
}