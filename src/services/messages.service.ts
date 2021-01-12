import {
  Request,
  Response,
} from 'express';

import {
  EVENT_TYPES,
  NOTIFICATION_TARGET_TYPES,
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

import * as UserRepo from '../repos/users.repo';
import * as CommonRepo from '../repos/_common.repo';

import {
  fn,
  Op,
  WhereOptions,
  col,
  cast,
} from 'sequelize';

import { create_notification } from '../repos/notifications.repo';
import { Messages, Messagings } from '../models/messages.model';
import { Users } from '../models/user.model';

export class MessagesService {
  static async get_user_messages(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);
    const min_id = parseInt(request.params.min_id, 10);

    if (!user_id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `user_id is required`
      });
    }
    if (user_id === you_id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `user_id is invalid: cannot be same as you_id`
      });
    }

    const whereClause: PlainObject = {
      [Op.or]: [
        { from_id: you_id, to_id: user_id },
        { from_id: user_id, to_id: you_id },
      ]
    };
    if (min_id) {
      whereClause.id = { [Op.lt]: min_id };
    }

    // console.log(whereClause);

    const messages_models = await Messages.findAll({
      where: whereClause,
      include: [{
        model: Users,
        as: 'from',
        attributes: user_attrs_slim
      }, {
        model: Users,
        as: 'to',
        attributes: user_attrs_slim
      }],
      limit: 5,
      order: [['id', 'DESC']]
    });

    // to avoid race condition, wait a little to mark messages as opened
    // UI relies on that flag being false when loading
    setTimeout(() => {
      console.log(`marking messages as opened 3 seconds later...`);
      for (const message_model of messages_models) {
        // only mark messages as opened if you were the user and not the sender
        const from_id = message_model.get('from_id');
        if (you_id === from_id || message_model.opened) {
          continue;
        }
        message_model.opened = true;
        message_model.save({ fields: ['opened'] })
          .then(() => {
            console.log(`marked message as opened = true`);
          })
          .catch((error: any) => {
            console.log(`could not mark messages as opened = true`, '\n\n', error, message_model);
          });
      }
    }, 3000);

    return response.status(HttpStatusCode.OK).json({
      data: messages_models
    });
  }

  static async send_user_message(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);

    if (!user_id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `user_id is required`
      });
    }
    if (user_id === you_id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `user_id is invalid: cannot be same as you_id`
      });
    }
    const body = request.body.body;
    if (!body || !body.trim()) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Body cannot be empty`
      });
    }

    // check if there was messaging between the two users
    let messaging_model = await Messagings.findOne({
      where: {
        [Op.or]: [
          { user_id: you_id, sender_id: user_id },
          { user_id: user_id, sender_id: you_id },
        ]
      }
    });

    if (!messaging_model) {
      // keep track that there was messaging between the two users
      messaging_model = await Messagings.create({
        user_id: user_id,
        sender_id: you_id
      });
    }

    // create the new message
    const new_message_model = await Messages.create({
      body,
      from_id: you_id,
      to_id: user_id,
    });

    const new_message = await Messages.findOne({
      where: { id: new_message_model.get('id') },
      include: [{
        model: Users,
        as: 'from',
        attributes: user_attrs_slim
      }, {
        model: Users,
        as: 'to',
        attributes: user_attrs_slim
      }]
    });

    // there is an existing messaging, update the last updated
    messaging_model.updated_at = fn('NOW');
    const updates = await messaging_model.save({ fields: ['updated_at'] });

    const get_messaging_model = await Messagings.findOne({
      where: { id: messaging_model.get('id') },
      include: [{
        model: Users,
        as: 'sender',
        attributes: user_attrs_slim
      }, {
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    (<IRequest> request).io.emit(`FOR-USER:${user_id}`, {
      event_type: EVENT_TYPES.NEW_MESSAGE,
      data: new_message!.toJSON(),
      messaging: get_messaging_model!.toJSON()
    });

    // create_notification({
    //   from_id: you_id,
    //   to_id: user_id,
    //   event: EVENT_TYPES.NEW_MESSAGE,
    //   target_type: NOTIFICATION_TARGET_TYPES.MESSAGING,
    //   target_id: messaging_model.get('id')
    // }).then(async (notification_model) => {
    //   const notification = await populate_notification_obj(notification_model);
      
    // });

    return response.status(HttpStatusCode.OK).json({
      message: `Message sent successfully!`,
      data: new_message,
      updates
    });
  }

  static async mark_message_as_read(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const message_id = parseInt(request.params.message_id, 10);

    const updates = await Messages.update({ opened: true }, {
      where: { id: message_id, to_id: you_id }
    });

    return response.status(HttpStatusCode.OK).json({
      updates,
      message: `marked as read`,
      data: null
    });
  }
}