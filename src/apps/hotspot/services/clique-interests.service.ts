import {
  Request,
  Response,
} from 'express';

import {
  populate_common_notification_obj,
  user_attrs_slim
} from '../../_common/common.chamber';

import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  PlainObject,
  IUser,
  IRequest
} from '../../_common/interfaces/common.interface';

import * as CliqueInterestsRepo from '../repos/clique-interests.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import { fn, col, cast, Op } from 'sequelize';
import { create_notification } from '../../_common/repos/notifications.repo';
import { CliqueInterests, Cliques, CliqueMembers } from '../models/clique.model';
import { Users } from '../../_common/models/user.model';
import {
  HOTSPOT_EVENT_TYPES,
  HOTSPOT_NOTIFICATION_TARGET_TYPES
} from '../enums/hotspot.enum';
import { SocketsService } from '../../_common/services/sockets.service';

export class CliqueInterestsService {
  static async get_user_clique_interests(request: Request, response: Response) {
    const user_id = parseInt(request.params.user_id, 10);
    const interest_id = parseInt(request.params.interest_id, 10);
    const clique_interests_models = await CommonRepo.paginateTable(
      CliqueInterests,
      'user_id',
      user_id,
      interest_id,
      [{
        model: Cliques,
        as: 'clique',
        include: [{
          model: Users,
          as: 'creator',
          attributes: user_attrs_slim
        }],
      }]
    );
    const new_list: any[] = [];
    for (const clique_interest_model of clique_interests_models) {
      const interest: PlainObject = clique_interest_model.toJSON();
      const interests_count = await CliqueInterestsRepo.get_clique_interests_count(
        interest.clique_id
      );
      interest.clique.interests_count = interests_count;
      new_list.push(interest);
    }
    return response.status(HttpStatusCode.OK).json({
      data: new_list
    });
  }

  static async get_user_clique_interests_all(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const clique_interests = await CommonRepo.getAll(
      CliqueInterests,
      'user_id',
      user_id,
      [{
        model: Cliques,
        as: 'clique',
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: clique_interests
    });
  }

  static async get_clique_interests_all(request: Request, response: Response) {
    const clique_id: number = parseInt(request.params.clique_id, 10);
    const clique_interests_models = await CliqueInterests.findAll({
      where: { clique_id },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });
    return response.status(HttpStatusCode.OK).json({
      data: clique_interests_models
    });
  }

  static async get_clique_interests(request: Request, response: Response) {
    const clique_id: number = parseInt(request.params.clique_id, 10);
    const interest_id: number = parseInt(request.params.interest_id, 10);
    const whereClause: PlainObject = interest_id
      ? { clique_id, id: { [Op.lt]: interest_id } }
      : { clique_id };
    const clique_interests_models = await CliqueInterests.findAll({
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
      data: clique_interests_models
    });
  }

  static async check_interest(request: Request, response: Response) {
    const you_id: number = parseInt(request.params.you_id, 10);
    const clique_id: number = parseInt(request.params.clique_id, 10);
    
    const interest_model = await CliqueInterests.findOne({
      where: {
        clique_id,
        user_id: you_id
      }
    });
    return response.status(HttpStatusCode.OK).json({
      data: interest_model
    });
  }

  static async check_membership(request: Request, response: Response) {
    const you_id: number = parseInt(request.params.you_id, 10);
    const clique_id: number = parseInt(request.params.clique_id, 10);
    
    const interest_model = await CliqueMembers.findOne({
      where: {
        clique_id,
        user_id: you_id
      }
    });
    return response.status(HttpStatusCode.OK).json({
      data: interest_model
    });
  }

  static async show_interest(request: Request, response: Response) {
    const you_id: number = parseInt(request.params.you_id, 10);
    const clique_id: number = parseInt(request.params.clique_id, 10);
    
    const interest_model = await CliqueInterests.findOne({
      where: {
        clique_id,
        user_id: you_id
      }
    });
    if (interest_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are already showing interest to thisclique`,
        data: interest_model
      });
    }

    const new_interest_model = await CliqueInterests.create({
      clique_id,
      user_id: you_id
    });

    (<IRequest> request).io.to(`clique-${clique_id}`).emit(HOTSPOT_EVENT_TYPES.NEW_CLIQUE_INTEREST, {
      event_type: HOTSPOT_EVENT_TYPES.NEW_CLIQUE_INTEREST,
      data: { user: response.locals.you }
    });
    create_notification({
      from_id: you_id,
      to_id: response.locals.clique_model.get('creator_id'),
      event: HOTSPOT_EVENT_TYPES.NEW_CLIQUE_INTEREST,
      target_type: HOTSPOT_NOTIFICATION_TARGET_TYPES.CLIQUE,
      target_id: clique_id
    }).then(async (notification_model) => {
      const notification = await populate_common_notification_obj(notification_model);
      SocketsService.emitEventForUser(response.locals.clique_model.get('creator_id'), {
        event_type: HOTSPOT_EVENT_TYPES.NEW_CLIQUE_INTEREST,
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
    const clique_id: number = parseInt(request.params.clique_id, 10);
    
    const interest_model = await CliqueInterests.findOne({
      where: {
        clique_id,
        user_id: you_id
      }
    });
    if (!interest_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are not showing interest to this clique`,
        data: interest_model
      });
    }

    const deletes = await interest_model.destroy();
    (<IRequest> request).io.to(`clique-${clique_id}`).emit(HOTSPOT_EVENT_TYPES.CLIQUE_UNINTEREST, {
      event_type: HOTSPOT_EVENT_TYPES.CLIQUE_UNINTEREST,
      data: { user: response.locals.you }
    });
    return response.status(HttpStatusCode.OK).json({
      message: `You are no longer showing interest`,
      deletes
    });
  }
}