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
  user_attrs_slim,
  getUserFullName, NOTIFICATION_TARGET_TYPES, populate_notification_obj
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
  delete_image,
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
import { create_notification } from '../repos/notifications.repo';
import { get_clique_members_count } from '../repos/clique-members.repo';
import { get_clique_interests_count } from '../repos/clique-interests.repo';
import { CliqueMemberRequests, Cliques, CliqueMembers } from '../models/clique.model';
import { Users } from '../models/user.model';


export class CliqueMembersService {
  static async get_clique_member_requests_all(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
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

    return response.status(HttpStatusCode.OK).json({
      data: member_requests_models
    });
  }

  static async get_clique_member_requests(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const member_request_id = parseInt(request.params.member_request_id, 10);

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

    return response.status(HttpStatusCode.OK).json({
      data: member_requests_models
    });
  }

  static async get_user_clique_members_all(request: Request, response: Response) {
    const user_id = parseInt(request.params.user_id, 10);

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

    return response.status(HttpStatusCode.OK).json({
      data: newList
    });
  }

  static async get_user_clique_members(request: Request, response: Response) {
    const user_id = parseInt(request.params.user_id, 10);
    const member_id = parseInt(request.params.member_id, 10);

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

    return response.status(HttpStatusCode.OK).json({
      data: newList
    });
  }

  static async get_clique_members_all(request: Request, response: Response) {
    const clique_id = parseInt(request.params.clique_id, 10);

    const members_models = await CliqueMembers.findAll({
      where: { clique_id },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    return response.status(HttpStatusCode.OK).json({
      data: members_models
    });
  }

  static async get_clique_members(request: Request, response: Response) {
    const clique_id = parseInt(request.params.clique_id, 10);
    const member_id = parseInt(request.params.member_id, 10);

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

    return response.status(HttpStatusCode.OK).json({
      data: members_models
    });
  }

  static async add_clique_member(request: Request, response: Response) {
    const user_id = parseInt(request.params.user_id, 10);
    const clique_id = parseInt(request.params.clique_id, 10);

    const member_model = await CliqueMembers.findOne({
      where: { clique_id, user_id }
    });

    if (member_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `user is already a member`
      });
    }

    // get all the cliques that the user is a part of via when they last opened it
    const new_clique_member_model = await CliqueMembers.create({
      clique_id,
      user_id
    });

    const clique_member_model = await CliqueMembers.findOne({
      where: { id: new_clique_member_model.get('id') },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    (<IRequest> request).io.emit(`${EVENT_TYPES.CLIQUE_MEMBER_ADDED}:clique-${clique_id}`, {
      event_type: EVENT_TYPES.CLIQUE_MEMBER_ADDED,
      data: {
        clique: response.locals.clique_model!.toJSON(),
        member: clique_member_model!.toJSON()
      },
    });
    (<IRequest> request).io.emit(`FOR-USER:${user_id}`, {
      event_type: EVENT_TYPES.CLIQUE_MEMBER_ADDED,
      data: {
        clique: {
          ...response.locals.clique_model!.toJSON(),
        },
        member: clique_member_model!.toJSON()
      },
    });

    return response.status(HttpStatusCode.OK).json({
      data: clique_member_model,
      message: `Clique member added!`
    });
  }

  static async remove_clique_member(request: Request, response: Response) {
    const user_id = parseInt(request.params.user_id, 10);
    const clique_id = parseInt(request.params.clique_id, 10);

    const member_model = await CliqueMembers.findOne({
      where: { clique_id, user_id },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    if (!member_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `user is not a member`
      });
    }
    
    const memberObj: PlainObject = member_model.toJSON();
    const deletes = await member_model.destroy();

    (<IRequest> request).io.emit(`${EVENT_TYPES.CLIQUE_MEMBER_REMOVED}:clique-${clique_id}`, {
      event_type: EVENT_TYPES.CLIQUE_MEMBER_REMOVED,
      data: { clique_id, user_id, member: memberObj },
    });
    (<IRequest> request).io.emit(`FOR-USER:${user_id}`, {
      event_type: EVENT_TYPES.CLIQUE_MEMBER_REMOVED,
      data: { clique_id, user_id, member: memberObj },
    });

    return response.status(HttpStatusCode.OK).json({
      deletes,
      message: `Clique member removed!`
    });
  }

  static async leave_clique(request: Request, response: Response) {
    const clique_model = response.locals.clique_model;
    const clique_id = response.locals.clique_model.get('id');
    const you_id = parseInt(request.params.you_id, 10);

    const check_member_model = await CliqueMembers.findOne({
      where: { clique_id, user_id: you_id }
    });
    if (!check_member_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are not a member of this clique!`
      });
    }

    const deletes = await check_member_model!.destroy();

    (<IRequest> request).io.emit(`${EVENT_TYPES.CLIQUE_MEMBER_LEFT}:clique-${clique_id}`, {
      event_type: EVENT_TYPES.CLIQUE_MEMBER_LEFT,
      data: { clique_id, user_id: you_id, clique: clique_model.toJSON() },
    });
    create_notification({
      from_id: you_id,
      to_id: response.locals.clique_model.get('creator_id'),
      event: EVENT_TYPES.CLIQUE_MEMBER_LEFT,
      target_type: NOTIFICATION_TARGET_TYPES.CLIQUE,
      target_id: clique_id
    }).then(async (notification_model) => {
      const notification = await populate_notification_obj(notification_model);
      (<IRequest> request).io.emit(`FOR-USER:${response.locals.clique_model.get('creator_id')}`, {
        event_type: EVENT_TYPES.CLIQUE_MEMBER_LEFT,
        data: { clique_id, user_id: you_id, clique: clique_model.toJSON(), notification },
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Left clique`,
      deletes,
    });
  }

  static async search_members(request: Request, response: Response) {
    const clique_id = parseInt(request.params.clique_id, 10);
    const query_term = (<string> request.query.query_term || '').trim().toLowerCase();
    if (!query_term) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `query_term query param is required`
      });
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

    return response.status(HttpStatusCode.OK).json({
      data: newList
    });
  }

  static async send_clique_member_request(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);
    const clique_id = parseInt(request.params.clique_id, 10);

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
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `User is already a member of this clique`,
      });
    }

    // check if request exists
    const check_request_model = await CliqueMemberRequests.findOne({
      where: { clique_id, user_id, sender_id: you_id }
    });
    if (check_request_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You already sent a request to this user; it is still pending`,
        data: check_request_model.toJSON()
      });
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
      event: EVENT_TYPES.CLIQUE_MEMBER_REQUEST,
      target_type: NOTIFICATION_TARGET_TYPES.CLIQUE,
      target_id: clique_id
    }).then(async (notification_model) => {
      const notification = await populate_notification_obj(notification_model);
      (<IRequest> request).io.emit(`FOR-USER:${user_id}`, {
        event_type: EVENT_TYPES.CLIQUE_MEMBER_REQUEST,
        data: { clique_id, user_id, notification, member_request: member_request_model!.toJSON(), clique: response.locals.clique_model!.toJSON() },
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Member invitation sent!`,
      data: member_request_model!.toJSON()
    });
  }

  static async cancel_clique_member_request(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const clique_id = parseInt(request.params.clique_id, 10);
    const member_request_id = parseInt(request.params.member_request_id, 10);

    const check_request_model = await CliqueMemberRequests.findOne({
      where: { id: member_request_id }
    });
    if (!check_request_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `There is no invite for this user by this clique`,
      });
    }

    const member_request: any = check_request_model.toJSON();
    const deletes = await check_request_model.destroy();

    create_notification({
      from_id: you_id,
      to_id: member_request.user_id,
      event: EVENT_TYPES.CLIQUE_MEMBER_CANCEL,
      target_type: NOTIFICATION_TARGET_TYPES.CLIQUE,
      target_id: clique_id
    }).then(async (notification_model) => {
      const notification = await populate_notification_obj(notification_model);
      (<IRequest> request).io.emit(`FOR-USER:${member_request.user_id}`, {
        event_type: EVENT_TYPES.CLIQUE_MEMBER_CANCEL,
        data: { notification, member_request, clique: response.locals.clique_model!.toJSON() },
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Member invitation canceled`,
      deletes
    });
  }

  static async accept_clique_member_request(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const clique_id = parseInt(request.params.clique_id, 10);
    const member_request_id = parseInt(request.params.member_request_id, 10);

    // check if there is a request
    const check_request_model = await CliqueMemberRequests.findOne({
      where: { id: member_request_id }
    });
    if (!check_request_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `There is no invite for this user by this clique`,
      });
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
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `User is already a member of this clique`,
      });
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

    (<IRequest> request).io.emit(`${EVENT_TYPES.CLIQUE_MEMBER_ACCEPT}:clique-${clique_id}`, {
      event_type: EVENT_TYPES.CLIQUE_MEMBER_ACCEPT,
      data: { member: new_member!.toJSON(), clique: response.locals.clique_model!.toJSON() },
    });    
    create_notification({
      from_id: you_id,
      to_id: member_request.sender_id,
      event: EVENT_TYPES.CLIQUE_MEMBER_ACCEPT,
      target_type: NOTIFICATION_TARGET_TYPES.CLIQUE,
      target_id: clique_id
    }).then(async (notification_model) => {
      const notification = await populate_notification_obj(notification_model);
      (<IRequest> request).io.emit(`FOR-USER:${member_request.sender_id}`, {
        event_type: EVENT_TYPES.CLIQUE_MEMBER_ACCEPT,
        data: { notification, member: new_member!.toJSON(), clique: response.locals.clique_model!.toJSON() },
      });
    });

    check_request_model.destroy();

    return response.status(HttpStatusCode.OK).json({
      message: `Member invitation accepted`,
      data: new_member?.toJSON()
    });
  }

  static async decline_clique_member_request(request: Request, response: Response) {
    const you_id = parseInt(request.params.you_id, 10);
    const clique_id = parseInt(request.params.clique_id, 10);
    const member_request_id = parseInt(request.params.member_request_id, 10);

    // check if there is a request
    const check_request_model = await CliqueMemberRequests.findOne({
      where: { id: member_request_id },

    });
    if (!check_request_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `There is no invite for this user by this clique`,
      });
    }

    const member_request: any = check_request_model.toJSON();
    const deletes = await check_request_model.destroy();

    create_notification({
      from_id: you_id,
      to_id: member_request.sender_id,
      event: EVENT_TYPES.CLIQUE_MEMBER_DECLINE,
      target_type: NOTIFICATION_TARGET_TYPES.CLIQUE,
      target_id: clique_id
    }).then(async (notification_model) => {
      const notification = await populate_notification_obj(notification_model);
      (<IRequest> request).io.emit(`FOR-USER:${member_request.sender_id}`, {
        event_type: EVENT_TYPES.CLIQUE_MEMBER_DECLINE,
        data: { notification, clique: response.locals.clique_model!.toJSON() },
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Member invitation declined`,
      deletes
    });
  }
}