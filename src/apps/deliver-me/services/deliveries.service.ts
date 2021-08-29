import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import { 
  populate_common_notification_obj,
  user_attrs_slim
} from '../../_common/common.chamber';
import {
  PlainObject,
  IUser,
  IRequest
} from '../../_common/interfaces/common.interface';

import * as UserRepo from '../../_common/repos/users.repo';
import * as FollowsRepo from '../../_common/repos/follows.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import * as DeliveryRepo from '../repos/deliveries.repo';
import { create_notification } from '../../_common/repos/notifications.repo';
import { Follows, Users } from '../../_common/models/user.model';
import { COMMON_EVENT_TYPES } from '../../_common/enums/common.enum';
import { SocketsService } from '../../_common/services/sockets.service';
import { Delivery } from '../models/delivery.model';
import { IMyModel } from 'src/apps/_common/models/common.model-types';
import { create_delivery_required_props } from '../deliverme.chamber';
import { ICreateDeliveryProps } from '../interfaces/deliverme.interface';

export class DeliveriesService {

  static async get_delivery_by_id(request: Request, response: Response) {
    const delivery = response.locals.delivery_model.toJSON();
    return response.status(HttpStatusCode.OK).json({
      data: delivery
    });
  }
  
  static async get_user_deliveries_all(request: Request, response: Response) {
    const user_id = response.locals.user.id;
    const results = await CommonRepo.getAll(
      Delivery,
      'owner_id',
      user_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }],
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_deliveries(request: Request, response: Response) {
    const user_id = response.locals.user.id;
    const delivery_id = (<IMyModel> response.locals.delivery_model).get('id');
    const results = await CommonRepo.paginateTable(
      Delivery,
      'owner_id',
      user_id,
      delivery_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_deliverings_all(request: Request, response: Response) {
    const user_id = response.locals.user.id;
    const results = await CommonRepo.getAll(
      Delivery,
      'carrier_id',
      user_id,
      [{
        model: Users,
        as: 'carrier',
        attributes: user_attrs_slim
      }],
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_deliverings(request: Request, response: Response) {
    const user_id = response.locals.user.id;
    const delivery_id = (<IMyModel> response.locals.delivery_model).get('id');
    const results = await CommonRepo.paginateTable(
      Delivery,
      'carrier_id',
      user_id,
      delivery_id,
      [{
        model: Users,
        as: 'carrier',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async create_delivery(request: Request, response: Response) {
    const you = response.locals.you;
    const createObj: PlainObject = {
      owner_id: you.id
    };

    for (const prop of create_delivery_required_props) {
      if (!request.body.hasOwnProperty(prop.field)) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${prop.name} is required.`
        });
      }
      const isValid: boolean = prop.validator(request.body[prop.field]);
      if (!isValid) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${prop.name} is required.`
        });
      }

      createObj[prop.field] = request.body[prop.field];
    }

    const new_delivery_model = await DeliveryRepo.create_delivery(createObj as ICreateDeliveryProps);
    return response.status(HttpStatusCode.OK).json({
      message: `New Delivery Created!`,
      data: new_delivery_model
    });
  }

  static async update_delivery(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model = response.locals.delivery_model;
    const updateObj: PlainObject = {
      owner_id: you.id
    };

    for (const prop of create_delivery_required_props) {
      if (!request.body.hasOwnProperty(prop.field)) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${prop.name} is required.`
        });
      }
      const isValid: boolean = prop.validator(request.body[prop.field]);
      if (!isValid) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${prop.name} is required.`
        });
      }

      updateObj[prop.field] = request.body[prop.field];
    }

    const updates = await DeliveryRepo.update_delivery(delivery_model.get('id'), updateObj as ICreateDeliveryProps);
    return response.status(HttpStatusCode.OK).json({
      message: `Delivery Updated!`,
      data: updates
    });
  }

  static async delete_delivery(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model = response.locals.delivery_model;

    const deletes = await DeliveryRepo.delete_delivery(delivery_model.get('id'));
    return response.status(HttpStatusCode.OK).json({
      message: `Delivery Deleted!`,
      data: deletes
    });
  }

}