import { UploadedFile } from 'express-fileupload';
import * as bcrypt from 'bcrypt-nodejs';
import { Request, Response } from 'express';
import {
  PlainObject,
  IUser,
  IRequest
} from '../../_common/interfaces/common.interface';
import {
  fn,
  Op,
  where,
  col,
  literal,
} from 'sequelize';
import {
  createGenericServiceMethodError,
  createGenericServiceMethodSuccess,
  user_attrs_slim,
} from '../../_common/common.chamber';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { Users } from '../../_common/models/user.model';
import { create_notification } from '../../_common/repos/notifications.repo';
import { CliqueMemberRequests, Cliques, CliqueMembers } from '../models/clique.model';
import { get_clique_interests_count } from '../repos/clique-interests.repo';
import { get_clique_members_count } from '../repos/clique-members.repo';
import {
  HOTSPOT_EVENT_TYPES,
  HOTSPOT_NOTIFICATION_TARGET_TYPES,
} from '../enums/hotspot.enum';
import { populate_hotspot_notification_obj } from '../hotspot.chamber';
import { SocketsService } from '../../_common/services/sockets.service';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { ServiceMethodAsyncResults } from '../../_common/types/common.types';
import { IMyModel } from '../../_common/models/common.model-types';
import { CommonSocketEventsHandler } from 'src/apps/_common/services/socket-events-handlers-by-app/common.socket-event-handler';



export class CliqueMembersService {
  static async get_clique_member_requests_all(you_id: number): ServiceMethodAsyncResults {
    const member_requests_models = await CliqueMemberRequests.findAll({
      where: { user_id: you_id },
      include: [{
        model: Cliques,
        as: 'clique',
        include: [{
          model: Users,
          as: 'creator',
          attributes: user_attrs_slim
        }]
      }]
    });

    return createGenericServiceMethodSuccess(undefined, member_requests_models);
  }

  static async get_clique_member_requests(you_id: number, member_request_id?: number): ServiceMethodAsyncResults {
    const whereClause: any = member_request_id
      ? { user_id: you_id, id: { [Op.lt]: member_request_id } }
      : { user_id: you_id };

    const member_requests_models = await CliqueMemberRequests.findAll({
      where: whereClause,
      include: [{
        model: Cliques,
        as: 'clique',
        include: [{
          model: Users,
          as: 'creator',
          attributes: user_attrs_slim
        }]
      }],
      limit: 10,
      order: [['id', 'DESC']]
    });

    return createGenericServiceMethodSuccess(undefined, member_requests_models);
  }

  static async get_user_clique_members_all(user_id: number): ServiceMethodAsyncResults {
    const members_models = await CliqueMembers.findAll({
      where: { user_id },
      include: [{
        model: Cliques,
        as: 'clique',
        include: [{
          model: Users,
          as: 'creator',
          attributes: user_attrs_slim
        }]
      }]
    });

    const newList = [];
    for (const member_model of members_models) {
      const memberObj: any = member_model.toJSON();
      const interests_count = await get_clique_interests_count(memberObj.clique_id);
      const members_count = await get_clique_members_count(memberObj.clique_id);
      memberObj.clique.members_count = members_count;
      memberObj.clique.interests_count = interests_count;
      newList.push(memberObj);
    }

    return createGenericServiceMethodSuccess(undefined, newList);
  }

  static async get_user_clique_members(user_id: number, member_id?: number): ServiceMethodAsyncResults {
    const whereClause: PlainObject = member_id
      ? { user_id, id: { [Op.lt]: member_id } }
      : { user_id };

    const members_models = await CliqueMembers.findAll({
      where: whereClause,
      include: [{
        model: Cliques,
        as: 'clique',
        include: [{
          model: Users,
          as: 'creator',
          attributes: user_attrs_slim
        }]
      }],
      limit: 10,
      order: [['id', 'DESC']]
    });

    const newList = [];
    for (const member_model of members_models) {
      const memberObj: any = member_model.toJSON();
      const interests_count = await get_clique_interests_count(memberObj.clique_id);
      const members_count = await get_clique_members_count(memberObj.clique_id);
      memberObj.clique.members_count = members_count;
      memberObj.clique.interests_count = interests_count;
      newList.push(memberObj);
    }

    return createGenericServiceMethodSuccess(undefined, newList);
  }

  static async get_clique_members_all(clique_id: number): ServiceMethodAsyncResults {
    const members_models = await CliqueMembers.findAll({
      where: { clique_id },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    return createGenericServiceMethodSuccess(undefined, members_models);
  }

  static async get_clique_members(clique_id: number, member_id?: number): ServiceMethodAsyncResults {
    const whereClause: PlainObject = member_id
      ? { clique_id, id: { [Op.lt]: member_id } }
      : { clique_id };

    const members_models = await CliqueMembers.findAll({
      where: whereClause,
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }],
      limit: 10,
      order: [['id', 'DESC']]
    });

    return createGenericServiceMethodSuccess(undefined, members_models);
  }

  static async add_clique_member(user_id: number, clique_model: IMyModel): ServiceMethodAsyncResults {
    const clique_id: number = clique_model.get('id');
    const member_model = await CliqueMembers.findOne({
      where: { clique_id, user_id }
    });

    if (member_model) {
      return createGenericServiceMethodError(`user is already a member`);
    }

    // get all the cliques that the user is a part of via when they last opened it
    const new_clique_member_model = await CliqueMembers.create({ clique_id, user_id }, {
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    // const clique_member_model = await CliqueMembers.findOne({
    //   where: { id: new_clique_member_model.get('id') },
      
    // });

    SocketsService.get_io().in(`clique-${clique_id}`).emit(HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_ADDED, {
      event_type: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_ADDED,
      data: {
        clique: clique_model.toJSON(),
        member: new_clique_member_model.toJSON()
      },
    });
    CommonSocketEventsHandler.emitEventToUserSockets({
      user_id,
      event: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_ADDED,
      event_data: {
        clique: {
          ...clique_model!.toJSON(),
        },
        member: new_clique_member_model.toJSON()
      },
    });

    return createGenericServiceMethodSuccess(`Clique member added!`, new_clique_member_model);
  }

  static async remove_clique_member(user_id: number, clique_model: IMyModel): ServiceMethodAsyncResults {
    const clique_id: number = clique_model.get('id');

    const member_model = await CliqueMembers.findOne({
      where: { clique_id, user_id },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    if (!member_model) {
      return createGenericServiceMethodError(`user is not a member`);
    }
    
    const memberObj: PlainObject = member_model.toJSON();
    const deletes = await member_model.destroy();

    SocketsService.get_io().to(`clique-${clique_id}`).emit(HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_REMOVED, {
      event_type: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_REMOVED,
      data: { clique_id, user_id, member: memberObj },
    });
    CommonSocketEventsHandler.emitEventToUserSockets({
      user_id,
      event: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_REMOVED,
      event_data: { clique_id, user_id, member: memberObj },
    });

    return createGenericServiceMethodSuccess(`Clique member removed!`, deletes);
  }

  static async leave_clique(you: IUser, clique_model: IMyModel): ServiceMethodAsyncResults {
    const clique_id = clique_model.get('id');

    const check_member_model = await CliqueMembers.findOne({
      where: { clique_id, user_id: you.id }
    });
    if (!check_member_model) {
      return createGenericServiceMethodError(`You are not a member of this clique!`);
    }

    const deletes = await check_member_model!.destroy();

    SocketsService.get_io().to(`clique-${clique_id}`).emit(HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_LEFT, {
      event_type: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_LEFT,
      event_data: { clique_id, user_id: you.id, clique: clique_model.toJSON() },
    });
    create_notification({
      from_id: you.id,
      micro_app: MODERN_APP_NAMES.HOTSPOT,
      to_id: clique_model.get('creator_id'),
      event: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_LEFT,
      target_type: HOTSPOT_NOTIFICATION_TARGET_TYPES.CLIQUE,
      target_id: clique_id
    }).then(async (notification_model) => {
      const notification = await populate_hotspot_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: clique_model.get('creator_id'),
        event: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_LEFT,
        event_data: { clique_id, user_id: you.id, clique: clique_model.toJSON(), notification },
      });
    });

    return createGenericServiceMethodSuccess(`Left clique`, deletes);
  }

  static async search_members(clique_id: number, query_term: string): ServiceMethodAsyncResults {
    query_term = (<string> query_term || '').trim().toLowerCase();
    if (!query_term) {
      return createGenericServiceMethodError(`query_term query param is required`);
    }

    const member_ids_models = await CliqueMembers.findAll({
      where: { clique_id },
      attributes: ['user_id']
    });
    const user_ids = member_ids_models.length ? member_ids_models.map(m => m.get('user_id')) : [];
    const results = await Users.findAll({
      where: {
        id: { [Op.notIn]: user_ids },
        can_converse: true,
        [Op.or]: [{
          firstname: where(fn('LOWER', col('firstname')), 'LIKE', '%' + query_term + '%'),
        }, {
          lastname: where(fn('LOWER', col('lastname')), 'LIKE', '%' + query_term + '%'),
        }]
      },
      attributes: [
        ...user_attrs_slim,
        [literal("firstname || ' ' || lastname"), 'full_name']
      ],
      limit: 10
    });

    const newList = [];
    for (const user_model of results) {
      // see if there is a pending request
      const user = <IUser> user_model.toJSON();
      const request_model = await CliqueMemberRequests.findOne({
        where: {
          clique_id,
          user_id: user.id 
        }
      });
      (<any> user).member_request = request_model && request_model!.toJSON() || null;
      newList.push(user);
    }

    return createGenericServiceMethodSuccess(undefined, newList);
  }

  static async send_clique_member_request(options: {
    you_id: number,
    user_id: number,
    clique_model: IMyModel
  }): ServiceMethodAsyncResults {
    const { you_id, user_id, clique_model } = options;
    const clique_id: number = clique_model.get('id');

    // check if they are a clique member already
    const check_member_model = await CliqueMembers.findOne({
      where: { user_id },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });
    if (check_member_model) {
      return createGenericServiceMethodError(`User is already a member of this clique`);
    }

    // check if request exists
    const check_request_model = await CliqueMemberRequests.findOne({
      where: { clique_id, user_id, sender_id: you_id }
    });
    if (check_request_model) {
      return createGenericServiceMethodError(`You already sent a request to this user; it is still pending`);
    }

    // create request
    const new_member_request_model = await CliqueMemberRequests.create({
      clique_id,
      user_id,
      sender_id: you_id
    });
    const member_request_model = await CliqueMemberRequests.findOne({
      where: { id: new_member_request_model.get('id') },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    create_notification({
      from_id: you_id,
      to_id: user_id,
      micro_app: MODERN_APP_NAMES.HOTSPOT,
      event: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_REQUEST,
      target_type: HOTSPOT_NOTIFICATION_TARGET_TYPES.CLIQUE,
      target_id: clique_id
    }).then(async (notification_model) => {
      const notification = await populate_hotspot_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id,
        event: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_REQUEST,
        event_data: {
          clique_id,
          user_id,
          notification,
          member_request: member_request_model!.toJSON(),
          clique: clique_model!.toJSON()
        },
      });
    });

    return createGenericServiceMethodSuccess(`Member invitation sent!`, member_request_model);
  }

  static async cancel_clique_member_request(options: {
    you: IUser,
    member_request_id: number,
    clique_model: IMyModel
  }): ServiceMethodAsyncResults {
    const { you, clique_model, member_request_id } = options;
    const clique_id: number = clique_model.get('id');

    const check_request_model = await CliqueMemberRequests.findOne({
      where: { id: member_request_id }
    });
    if (!check_request_model) {
      return createGenericServiceMethodError(`There is no invite for this user by this clique`);
    }

    const member_request: any = check_request_model.toJSON();
    const deletes = await check_request_model.destroy();

    create_notification({
      from_id: you.id,
      to_id: member_request.user_id,
      micro_app: MODERN_APP_NAMES.HOTSPOT,
      event: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_CANCEL,
      target_type: HOTSPOT_NOTIFICATION_TARGET_TYPES.CLIQUE,
      target_id: clique_id
    }).then(async (notification_model) => {
      const notification = await populate_hotspot_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: member_request.user_id,
        event: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_CANCEL,
        event_data: { notification, member_request, clique: clique_model!.toJSON() },
      });
    });

    return createGenericServiceMethodSuccess( `Member invitation canceled`, deletes);
  }

  static async accept_clique_member_request(options: {
    you: IUser,
    member_request_id: number,
    clique_model: IMyModel
  }): ServiceMethodAsyncResults {
    const { you, clique_model, member_request_id } = options;
    const clique_id: number = clique_model.get('id');

    // check if there is a request
    const check_request_model = await CliqueMemberRequests.findOne({
      where: { id: member_request_id }
    });
    if (!check_request_model) {
      return createGenericServiceMethodError(`There is no invite for this user by this clique`);
    }

    const member_request: any = check_request_model.toJSON();

    // check if they are a clique member already
    const check_member_model = await CliqueMembers.findOne({
      where: {
        clique_id: member_request.clique_id,
        user_id: member_request.user_id
      },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });
    if (check_member_model) {
      return createGenericServiceMethodError( `User is already a member of this clique`);
    }

    const new_member_model = await CliqueMembers.create({
      clique_id: member_request.clique_id,
      user_id: member_request.user_id
    });
    const new_member = await CliqueMembers.findOne({
      where: { id: new_member_model.get('id') },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    SocketsService.get_io().to(`clique-${clique_id}`).emit(HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_ACCEPT, {
      event_type: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_ACCEPT,
      data: { member: new_member!.toJSON(), clique: clique_model!.toJSON() },
    });    
    create_notification({
      from_id: you.id,
      to_id: member_request.sender_id,
      micro_app: MODERN_APP_NAMES.HOTSPOT,
      event: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_ACCEPT,
      target_type: HOTSPOT_NOTIFICATION_TARGET_TYPES.CLIQUE,
      target_id: clique_id
    }).then(async (notification_model) => {
      const notification = await populate_hotspot_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: member_request.sender_id,
        event: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_ACCEPT,
        event_data: { notification, member: new_member!.toJSON(), clique: clique_model!.toJSON() },
      });
    });

    check_request_model.destroy();

    return createGenericServiceMethodSuccess(`Member invitation accepted`, new_member);
  }

  static async decline_clique_member_request(options: {
    you: IUser,
    member_request_id: number,
    clique_model: IMyModel
  }): ServiceMethodAsyncResults {
    const { you, clique_model, member_request_id } = options;
    const clique_id: number = clique_model.get('id');

    // check if there is a request
    const check_request_model = await CliqueMemberRequests.findOne({
      where: { id: member_request_id },

    });
    if (!check_request_model) {
      return createGenericServiceMethodError(`There is no invite for this user by this clique`);
    }

    const member_request: any = check_request_model.toJSON();
    const deletes = await check_request_model.destroy();

    create_notification({
      from_id: you.id,
      to_id: member_request.sender_id,
      micro_app: MODERN_APP_NAMES.HOTSPOT,
      event: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_DECLINE,
      target_type: HOTSPOT_NOTIFICATION_TARGET_TYPES.CLIQUE,
      target_id: clique_id
    }).then(async (notification_model) => {
      const notification = await populate_hotspot_notification_obj(notification_model);
      
      
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: member_request.sender_id,
        event: HOTSPOT_EVENT_TYPES.CLIQUE_MEMBER_DECLINE,
        event_data: { notification, clique: clique_model!.toJSON() },
      });
    });

    return createGenericServiceMethodSuccess(`Member invitation declined`, deletes);
  }
}