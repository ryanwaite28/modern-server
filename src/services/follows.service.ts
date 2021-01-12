import {
  Request,
  Response,
} from 'express';

import { 
  EVENT_TYPES,
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

import * as UserRepo from '../repos/users.repo';
import * as FollowsRepo from '../repos/follows.repo';
import * as CommonRepo from '../repos/_common.repo';
import { create_notification } from '../repos/notifications.repo';
import { IMyModel } from 'src/model-types';
import { Follows, Users } from '../models/user.model';


export class FollowsService {
  static async check_user_follows(request: Request, response: Response) {
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
  
    const check_follow = await Follows.findOne({
      where: { user_id: you_id, follows_id: user_id },
    });
  
    return response.status(HttpStatusCode.OK).json({
      data: check_follow
    });
  }

  static async follow_user(request: Request, response: Response) {
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

    const check_follow = await Follows.findOne({
      where: { user_id: you_id, follows_id: user_id },
    });
    if (check_follow) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are already following this user`
      });
    }

    const new_follow = await Follows.create({
      user_id: you_id, follows_id: user_id
    });

    Follows.findOne({
      where: { id: new_follow.get('id') },
      include: [{
        model: Users,
        as: 'following',
        attributes: user_attrs_slim
      }, {
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }],
    }).then((follow_model: any) => {
      create_notification({
        from_id: you_id,
        to_id: user_id,
        event: EVENT_TYPES.NEW_FOLLOWER,
        target_type: null,
        target_id: null
      }).then(async (notification_model) => {
        const notification = await populate_notification_obj(notification_model);
        (<IRequest> request).io.emit(`FOR-USER:${user_id}`, {
          event_type: EVENT_TYPES.NEW_FOLLOWER,
          data: {
            ...follow_model!.toJSON(),
            notification
          }
        });
        // emit this event simply for updating the count in real time
        (<IRequest> request).io.emit(`${EVENT_TYPES.NEW_FOLLOWER}:FOR-USER:${user_id}`, {
          event_type: EVENT_TYPES.NEW_FOLLOWER,
          data: { user: response.locals.you }
        });
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Followed!`,
      data: new_follow
    });
  }

  static async unfollow_user(request: Request, response: Response) {
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

    const check_follow = await Follows.findOne({
      where: { user_id: you_id, follows_id: user_id },
    });
    if (!check_follow) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are not following this user`
      });
    }

    const deletes = await check_follow.destroy();

    // emit this event simply for updating the count in real time
    (<IRequest> request).io.emit(`${EVENT_TYPES.NEW_UNFOLLOWER}:FOR-USER:${user_id}`, {
      event_type: EVENT_TYPES.NEW_UNFOLLOWER,
      data: { user: response.locals.you }
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Unfollowed!`,
      deletes
    });
  }

  static async get_user_followers_count(
    request: Request,
    response: Response,
  ) {
    const user_id = parseInt(request.params.user_id, 10);
    const followers_count = await FollowsRepo.get_user_followers_count(user_id);
    return response.status(HttpStatusCode.OK).json({
      data: followers_count
    });
  }

  static async get_user_followings_count(
    request: Request,
    response: Response,
  ) {
    const user_id = parseInt(request.params.user_id, 10);
    const followings_count = await FollowsRepo.get_user_followings_count(user_id);
    return response.status(HttpStatusCode.OK).json({
      data: followings_count
    });
  }

  static async get_user_followers_all(
    request: Request,
    response: Response,
  ) {
    const user_id = parseInt(request.params.user_id, 10);
    const results = await FollowsRepo.get_user_followers_all(user_id);
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_followings_all(
    request: Request,
    response: Response,
  ) {
    const user_id = parseInt(request.params.user_id, 10);
    const results = await FollowsRepo.get_user_followings_all(user_id);
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_followers(
    request: Request,
    response: Response,
  ) {
    const user_id = parseInt(request.params.user_id, 10);
    const follow_id = parseInt(request.params.follow_id, 10);
    const results = await CommonRepo.paginateTable(
      Follows,
      'follows_id',
      user_id,
      follow_id,
      [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_followings(
    request: Request,
    response: Response,
  ) {
    const user_id = parseInt(request.params.user_id, 10);
    const follow_id = parseInt(request.params.follow_id, 10);
    const results = await CommonRepo.paginateTable(
      Follows,
      'user_id',
      user_id,
      follow_id,
      [{
        model: Users,
        as: 'following',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }
}