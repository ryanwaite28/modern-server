import { UploadedFile } from 'express-fileupload';
import * as bcrypt from 'bcrypt-nodejs';
import {
  Request,
  Response,
} from 'express';

import {
  allowedImages,
  EVENT_TYPES,
  NOTIFICATION_TARGET_TYPES,
  populate_notification_obj,
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
  delete_cloudinary_image,
  store_image
} from '../cloudinary-manager';

import * as ResourcesRepo from '../repos/resources.repo';
import * as ResourceInterestsRepo from '../repos/resource-interests.repo';
import * as CommonRepo from '../repos/_common.repo';
import { fn, col, cast, Op } from 'sequelize';
import { create_notification } from '../repos/notifications.repo';
import { ResourceInterests, Resources } from '../models/resource.model';
import { Users } from '../models/user.model';

export class ResourceInterestsService {
  static async get_user_resource_interests(request: Request, response: Response) {
    const user_id = parseInt(request.params.user_id, 10);
    const interest_id = parseInt(request.params.interest_id, 10);
    const resource_interests_models = await CommonRepo.paginateTable(
      ResourceInterests,
      'user_id',
      user_id,
      interest_id,
      [{
        model: Resources,
        as: 'resource',
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }],
      }]
    );
    const new_list: any[] = [];
    for (const resource_interest_model of resource_interests_models) {
      const interest: PlainObject = resource_interest_model.toJSON();
      const interests_count = await ResourceInterestsRepo.get_resource_interests_count(
        interest.resource_id
      );
      interest.resource.interests_count = interests_count;
      new_list.push(interest);
    }
    return response.status(HttpStatusCode.OK).json({
      data: new_list
    });
  }

  static async get_user_resource_interests_all(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const resource_interests = await CommonRepo.getAll(
      ResourceInterests,
      'user_id',
      user_id,
      [{
        model: Resources,
        as: 'resource',
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: resource_interests
    });
  }

  static async get_resource_interests_all(request: Request, response: Response) {
    const resource_id: number = parseInt(request.params.resource_id, 10);
    const resource_interests_models = await ResourceInterests.findAll({
      where: { resource_id },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });
    return response.status(HttpStatusCode.OK).json({
      data: resource_interests_models
    });
  }

  static async get_resource_interests(request: Request, response: Response) {
    const resource_id: number = parseInt(request.params.resource_id, 10);
    const interest_id: number = parseInt(request.params.interest_id, 10);
    const whereClause: PlainObject = interest_id
      ? { resource_id, id: { [Op.lt]: interest_id } }
      : { resource_id };
    const resource_interests_models = await ResourceInterests.findAll({
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
      data: resource_interests_models
    });
  }

  static async check_interest(request: Request, response: Response) {
    const you_id: number = parseInt(request.params.you_id, 10);
    const resource_id: number = parseInt(request.params.resource_id, 10);
    
    const interest_model = await ResourceInterests.findOne({
      where: {
        resource_id,
        user_id: you_id
      }
    });
    return response.status(HttpStatusCode.OK).json({
      data: interest_model
    });
  }

  static async show_interest(request: Request, response: Response) {
    const you_id: number = parseInt(request.params.you_id, 10);
    const resource_id: number = parseInt(request.params.resource_id, 10);
    
    const interest_model = await ResourceInterests.findOne({
      where: {
        resource_id,
        user_id: you_id
      }
    });
    if (interest_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are already showing interest to this business plan`,
        data: interest_model
      });
    }

    const new_interest_model = await ResourceInterests.create({
      resource_id,
      user_id: you_id
    });

    (<IRequest> request).io.emit(`${EVENT_TYPES.NEW_RESOURCE_INTEREST}:resource-${resource_id}`, {
      event_type: EVENT_TYPES.NEW_RESOURCE_INTEREST,
      data: { user: response.locals.you }
    });
    create_notification({
      from_id: you_id,
      to_id: response.locals.resource_model.get('owner_id'),
      event: EVENT_TYPES.NEW_RESOURCE_INTEREST,
      target_type: NOTIFICATION_TARGET_TYPES.RESOURCE,
      target_id: resource_id
    }).then(async (notification_model) => {
      const notification = await populate_notification_obj(notification_model);
      (<IRequest> request).io.emit(`FOR-USER:${response.locals.resource_model.get('owner_id')}`, {
        event_type: EVENT_TYPES.NEW_RESOURCE_INTEREST,
        data: { user: response.locals.you, notification }
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `You are now showing interest!`,
      data: new_interest_model
    });
  }

  static async remove_interest(request: Request, response: Response) {
    const you_id: number = parseInt(request.params.you_id, 10);
    const resource_id: number = parseInt(request.params.resource_id, 10);
    
    const interest_model = await ResourceInterests.findOne({
      where: {
        resource_id,
        user_id: you_id
      }
    });
    if (!interest_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are not showing interest to this resource`,
        data: interest_model
      });
    }

    const deletes = await interest_model.destroy();
    (<IRequest> request).io.emit(`${EVENT_TYPES.RESOURCE_UNINTEREST}:resource-${resource_id}`, {
      event_type: EVENT_TYPES.RESOURCE_UNINTEREST,
      data: { user: response.locals.you }
    });
    return response.status(HttpStatusCode.OK).json({
      message: `You are no longer showing interest`,
      deletes
    });
  }
}