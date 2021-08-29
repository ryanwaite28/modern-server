import {
  Request,
  Response,
} from 'express';
import { Op } from 'sequelize';
import { Messagings, Messages } from '../models/messages.model';
import { user_attrs_slim } from '../common.chamber';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { PlainObject } from '../interfaces/common.interface';
import { Users } from '../models/user.model';
import { paginateTable } from '../repos/_common.repo';

export class MessagingsService {
  static async get_user_messagings_all(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);

    const messagings_models = await Messagings.findAll({
      where: {
        [Op.or]: [
          { user_id: you_id },
          { sender_id: you_id },
        ]
      },
      include: [{
        model: Users,
        as: 'sender',
        attributes: user_attrs_slim
      }, {
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }],
      order: [['updated_at', 'DESC']]
    });

    const newList = [];
    for (const messaging of messagings_models) {
      const messagingObj: PlainObject = messaging.toJSON();
      const other_user_id = messagingObj.sender_id === you_id
        ? messagingObj.user_id
        : messagingObj.sender_id;
      const unread_messages_count = await Messages.count({
        where: {
          from_id: other_user_id,
          to_id: you_id,
          opened: false
        }
      });
      messagingObj.unread_messages_count = unread_messages_count;
      newList.push(messagingObj);
    }

    return response.status(HttpStatusCode.OK).json({
      data: newList
    });
  }

  static async get_user_messagings(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const messagings_timestamp = request.params.messagings_timestamp;

    const whereClause: PlainObject = {
      [Op.or]: [
        { user_id: you_id },
        { sender_id: you_id },
      ]
    };
    if (messagings_timestamp) {
      whereClause.updated_at = { [Op.lt]: messagings_timestamp };
    }

    const messagings_models = await paginateTable(
      Messagings,
      undefined,
      undefined,
      undefined,
      [{
        model: Users,
        as: 'sender',
        attributes: user_attrs_slim
      }, {
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }],
      undefined,
      undefined,
      whereClause,
      [['updated_at', 'DESC']]
    );

    const newList = [];
    for (const messaging of messagings_models) {
      const messagingObj: PlainObject = messaging.toJSON();
      const other_user_id = messagingObj.sender_id === you_id
        ? messagingObj.user_id
        : messagingObj.sender_id;
      const unread_messages_count = await Messages.count({
        where: {
          from_id: other_user_id,
          to_id: you_id,
          opened: false
        }
      });
      messagingObj.unread_messages_count = unread_messages_count;
      console.log(messagingObj);
      newList.push(messagingObj);
    }

    return response.status(HttpStatusCode.OK).json({
      data: newList
    });
  }
}