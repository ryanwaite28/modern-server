import * as HotspotResourceInterestsRepo from '../repos/resource-interests.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import { Op } from 'sequelize';
import { HotspotResourceInterests, HotspotResources } from '../models/resource.model';
import {
  check_model_args,
  createGenericServiceMethodError,
  createGenericServiceMethodSuccess,
  user_attrs_slim
} from '../../_common/common.chamber';
import { PlainObject, IUser } from '../../_common/interfaces/common.interface';
import { Users } from '../../_common/models/user.model';
import { create_notification } from '../../_common/repos/notifications.repo';
import {
  HOTSPOT_EVENT_TYPES,
  HOTSPOT_NOTIFICATION_TARGET_TYPES
} from '../enums/hotspot.enum';
import { populate_hotspot_notification_obj } from '../hotspot.chamber';
import { SocketsService } from '../../_common/services/sockets.service';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { ServiceMethodAsyncResults, ServiceMethodResults } from '../../_common/types/common.types';
import { IMyModel } from '../../_common/models/common.model-types';
import { get_resource_by_id } from '../repos/resources.repo';
import { CommonSocketEventsHandler } from 'src/apps/_common/services/socket-events-handlers-by-app/common.socket-event-handler';



export class ResourceInterestsService {
  static async get_user_resource_interests(user_id: number, interest_id?: number): ServiceMethodAsyncResults {
    const resource_interests_models = await CommonRepo.paginateTable(
      HotspotResourceInterests,
      'user_id',
      user_id,
      interest_id,
      [{
        model: HotspotResources,
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
      const interests_count = await HotspotResourceInterestsRepo.get_resource_interests_count(
        interest.resource_id
      );
      interest.resource.interests_count = interests_count;
      new_list.push(interest);
    }

    return createGenericServiceMethodSuccess(undefined, new_list);
  }

  static async get_user_resource_interests_all(user_id: number): ServiceMethodAsyncResults {
    const resource_interests = await CommonRepo.getAll(
      HotspotResourceInterests,
      'user_id',
      user_id,
      [{
        model: HotspotResources,
        as: 'resource',
      }]
    );

    return createGenericServiceMethodSuccess(undefined, resource_interests);
  }

  static async get_resource_interests_all(resource_id: number): ServiceMethodAsyncResults {
    const resource_interests_models = await HotspotResourceInterests.findAll({
      where: { resource_id },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    return createGenericServiceMethodSuccess(undefined, resource_interests_models);
  }

  static async get_resource_interests(resource_id: number, interest_id?: number): ServiceMethodAsyncResults {
    const whereClause: PlainObject = interest_id
      ? { resource_id, id: { [Op.lt]: interest_id } }
      : { resource_id };
    const resource_interests_models = await HotspotResourceInterests.findAll({
      where: whereClause,
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }],
      limit: 10,
      order: [['id', 'DESC']]
    });
    
    return createGenericServiceMethodSuccess(undefined, resource_interests_models);
  }

  static async check_interest(you_id: number, resource_id: number): ServiceMethodAsyncResults {
    const interest_model = await HotspotResourceInterests.findOne({
      where: {
        resource_id,
        user_id: you_id
      }
    });

    return createGenericServiceMethodSuccess(undefined, interest_model);
  }

  static async show_interest(options: {
    you: IUser,
    resource_id: number,
    resource_model?: IMyModel
  }): ServiceMethodAsyncResults {
    const { you, resource_id, resource_model } = options;
    const checkModelResults: ServiceMethodResults<IMyModel> = await check_model_args({
      model_id: resource_id,
      model: resource_model,
      model_name: `resource`,
      get_model_fn: get_resource_by_id,
    });
    if (checkModelResults.error) {
      return checkModelResults;
    }
    
    const interest_model = await HotspotResourceInterests.findOne({
      where: {
        resource_id,
        user_id: you.id
      }
    });
    if (interest_model) {
      return createGenericServiceMethodError(`You are already showing interest to this business plan`);
    }

    const new_interest_model = await HotspotResourceInterests.create({
      resource_id,
      user_id: you.id
    });

    // SocketsService.get_io().to(`resource-${resource_id}`).emit(HOTSPOT_EVENT_TYPES.NEW_RESOURCE_INTEREST, {
    //   event_type: HOTSPOT_EVENT_TYPES.NEW_RESOURCE_INTEREST,
    //   data: { user: you }
    // });
    create_notification({
      from_id: you.id,
      micro_app: MODERN_APP_NAMES.HOTSPOT,
      to_id: checkModelResults.info.data!.get('owner_id'),
      event: HOTSPOT_EVENT_TYPES.NEW_RESOURCE_INTEREST,
      target_type: HOTSPOT_NOTIFICATION_TARGET_TYPES.RESOURCE,
      target_id: resource_id
    }).then(async (notification_model) => {
      const notification = await populate_hotspot_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: checkModelResults.info.data!.get('owner_id'),
        event: HOTSPOT_EVENT_TYPES.NEW_RESOURCE_INTEREST,
        data: { user: you, notification }
      });
    });

    return createGenericServiceMethodSuccess(`You are now showing interest!`, new_interest_model);
  }

  static async remove_interest(options: {
    you: IUser,
    resource_id: number,
    resource_model?: IMyModel
  }): ServiceMethodAsyncResults {
    const { you, resource_id, resource_model } = options;
    const checkModelResults: ServiceMethodResults<IMyModel> = await check_model_args({
      model_id: resource_id,
      model: resource_model,
      model_name: `resource`,
      get_model_fn: get_resource_by_id,
    });
    if (checkModelResults.error) {
      return checkModelResults;
    }
    
    const interest_model = await HotspotResourceInterests.findOne({
      where: {
        resource_id: resource_id || -1,
        user_id: you.id
      }
    });
    if (!interest_model) {
      return createGenericServiceMethodError(`You are not showing interest to this resource`);
    }

    const deletes = await interest_model.destroy();
    SocketsService.get_io().to(`resource-${resource_id}`).emit(HOTSPOT_EVENT_TYPES.RESOURCE_UNINTEREST, {
      event_type: HOTSPOT_EVENT_TYPES.RESOURCE_UNINTEREST,
      data: { user: you }
    });

    return createGenericServiceMethodSuccess(`You are no longer showing interest`, deletes);
  }
}