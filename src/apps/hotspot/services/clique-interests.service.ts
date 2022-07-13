import {
  createGenericServiceMethodError,
  createGenericServiceMethodSuccess,
  populate_common_notification_obj,
  user_attrs_slim
} from '../../_common/common.chamber';
import {
  PlainObject,
  IUser,
} from '../../_common/interfaces/common.interface';
import * as CliqueInterestsRepo from '../repos/clique-interests.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import { Op } from 'sequelize';
import { create_notification } from '../../_common/repos/notifications.repo';
import { CliqueInterests, Cliques, CliqueMembers } from '../models/clique.model';
import { Users } from '../../_common/models/user.model';
import {
  HOTSPOT_EVENT_TYPES,
  HOTSPOT_NOTIFICATION_TARGET_TYPES
} from '../enums/hotspot.enum';
import { SocketsService } from '../../_common/services/sockets.service';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { ServiceMethodAsyncResults } from '../../_common/types/common.types';
import { IMyModel } from '../../_common/models/common.model-types';
import { CommonSocketEventsHandler } from '../../_common/services/socket-events-handlers-by-app/common.socket-event-handler';


export class CliqueInterestsService {
  static async get_user_clique_interests(user_id: number, interest_id: number): ServiceMethodAsyncResults {
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

    return createGenericServiceMethodSuccess(undefined, new_list);
  }

  static async get_user_clique_interests_all(user_id: number): ServiceMethodAsyncResults {
    const clique_interests = await CommonRepo.getAll(
      CliqueInterests,
      'user_id',
      user_id,
      [{
        model: Cliques,
        as: 'clique',
      }]
    );
    
    return createGenericServiceMethodSuccess(undefined, clique_interests);
  }

  static async get_clique_interests_all(clique_id: number): ServiceMethodAsyncResults {
    const clique_interests_models = await CliqueInterests.findAll({
      where: { clique_id },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });
    
    return createGenericServiceMethodSuccess(undefined, clique_interests_models);
  }

  static async get_clique_interests(clique_id: number, interest_id: number): ServiceMethodAsyncResults {
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
    
    return createGenericServiceMethodSuccess(undefined, clique_interests_models);
  }

  static async check_interest(you_id: number, clique_id: number): ServiceMethodAsyncResults {
    const interest_model = await CliqueInterests.findOne({
      where: {
        clique_id,
        user_id: you_id
      }
    });
    
    return createGenericServiceMethodSuccess(undefined, interest_model);
  }

  static async check_membership(you_id: number, clique_id: number): ServiceMethodAsyncResults {
    const interest_model = await CliqueMembers.findOne({
      where: {
        clique_id,
        user_id: you_id
      }
    });
    
    return createGenericServiceMethodSuccess(undefined, interest_model);
  }

  static async show_interest(you: IUser, clique_model: IMyModel): ServiceMethodAsyncResults {
    const clique_id: number = clique_model.get('id');
    const interest_model = await CliqueInterests.findOne({
      where: {
        clique_id,
        user_id: you.id
      }
    });
    if (interest_model) {
      return createGenericServiceMethodError(`You are already showing interest to this clique`);
    }

    const new_interest_model = await CliqueInterests.create({
      clique_id,
      user_id: you.id
    });

    SocketsService.get_io().to(`clique-${clique_id}`).emit(HOTSPOT_EVENT_TYPES.NEW_CLIQUE_INTEREST, {
      event_type: HOTSPOT_EVENT_TYPES.NEW_CLIQUE_INTEREST,
      data: { user: you }
    });
    create_notification({
      from_id: you.id,
      micro_app: MODERN_APP_NAMES.HOTSPOT,
      to_id: clique_model.get('creator_id'),
      event: HOTSPOT_EVENT_TYPES.NEW_CLIQUE_INTEREST,
      target_type: HOTSPOT_NOTIFICATION_TARGET_TYPES.CLIQUE,
      target_id: clique_id
    }).then(async (notification_model) => {
      const notification = await populate_common_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: clique_model.get('creator_id'),
        event: HOTSPOT_EVENT_TYPES.NEW_CLIQUE_INTEREST,
        event_data: { user: you, notification }
      });
    });

    return createGenericServiceMethodSuccess(`You are now showing interest!`, new_interest_model);
  }

  static async remove_interest(you: IUser, clique_id: number): ServiceMethodAsyncResults {
    const interest_model = await CliqueInterests.findOne({
      where: {
        clique_id,
        user_id: you.id
      }
    });
    if (!interest_model) {
      return createGenericServiceMethodError(`You are not showing interest to this clique`);
    }

    const deletes = await interest_model.destroy();
    SocketsService.get_io().to(`clique-${clique_id}`).emit(HOTSPOT_EVENT_TYPES.CLIQUE_UNINTEREST, {
      event_type: HOTSPOT_EVENT_TYPES.CLIQUE_UNINTEREST,
      data: { user: you }
    });

    return createGenericServiceMethodSuccess(`You are no longer showing interest`, deletes);
  }
}