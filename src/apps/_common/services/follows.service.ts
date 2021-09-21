import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import { 
  populate_common_notification_obj,
  user_attrs_slim
} from '../common.chamber';
import {
  PlainObject,
  IUser,
  IRequest
} from '../interfaces/common.interface';

import * as UserRepo from '../repos/users.repo';
import * as FollowsRepo from '../repos/follows.repo';
import * as CommonRepo from '../repos/_common.repo';
import { create_notification } from '../repos/notifications.repo';
import { Follows, Users } from '../models/user.model';
import { COMMON_EVENT_TYPES, MODERN_APP_NAMES } from '../enums/common.enum';
import { SocketsService } from './sockets.service';
import { CommonSocketEventsHandler } from './socket-events-handlers-by-app/common.socket-event-handler';


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
        event: COMMON_EVENT_TYPES.NEW_FOLLOWER,
        micro_app: MODERN_APP_NAMES.COMMON,
        target_type: '',
        target_id: 0
      }).then(async (notification_model) => {
        const notification = await populate_common_notification_obj(notification_model);

        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: user_id,
          event: COMMON_EVENT_TYPES.NEW_FOLLOWER,
          data: {
            data: {
              ...follow_model!.toJSON(),
              notification
            }
          }
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

    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: COMMON_EVENT_TYPES.NEW_UNFOLLOWER,
      micro_app: MODERN_APP_NAMES.COMMON,
      target_type: '',
      target_id: 0
    }).then(async (notification_model) => {
      const notification = await populate_common_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: user_id,
        event: COMMON_EVENT_TYPES.NEW_UNFOLLOWER,
        data: {
          data: {
            notification
          }
        }
      });
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